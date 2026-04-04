import { useState, useEffect, useRef, useCallback } from "react";
import { getUsuarios, createUsuario, updateUsuario } from "../api/api";
import SkeletonTable from "./SkeletonTable";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const GestionUsuarios = ({ onNotification }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [view, setView] = useState("list");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [filtroRol, setFiltroRol] = useState("todos");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "", first_name: "", last_name: "", email: "",
    password: "", confirmPassword: "", is_staff: false, is_active: true,
  });

  const cargadoRef = useRef(false);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cargadoRef.current) { cargarUsuarios(); cargadoRef.current = true; }
  }, [cargarUsuarios]);

  const usuariosFiltrados = usuarios.filter((u) => {
    const termino = busqueda.toLowerCase();
    const coincideBusqueda =
      u.username?.toLowerCase().includes(termino) ||
      u.first_name?.toLowerCase().includes(termino) ||
      u.last_name?.toLowerCase().includes(termino) ||
      u.email?.toLowerCase().includes(termino);
    const coincideEstado = mostrarInactivos ? true : u.is_active;
    const coincideRol = filtroRol === "todos" ? true : filtroRol === "admin" ? u.is_staff : !u.is_staff;
    return coincideBusqueda && coincideEstado && coincideRol;
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleVerDetalle = (user) => {
    setSelectedId(user.id);
    setFormData({
      username: user.username, first_name: user.first_name || "",
      last_name: user.last_name || "", email: user.email || "",
      password: "", confirmPassword: "", is_staff: user.is_staff, is_active: user.is_active,
    });
    setIsEditing(true);
    setIsReadOnly(true);
    setView("form");
  };

  const volverALista = (saltarConfirmacion) => {
    if (saltarConfirmacion || window.confirm("¿Desea volver al listado?")) {
      setSelectedId(null);
      setIsEditing(false);
      setView("list");
      setFormData({ username: "", first_name: "", last_name: "", email: "", password: "", confirmPassword: "", is_staff: false, is_active: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username: formData.username, first_name: formData.first_name,
      last_name: formData.last_name, email: formData.email,
      is_staff: formData.is_staff, is_active: formData.is_active,
    };
    const tienePassword = formData.password && formData.password.trim() !== "";
    if (!isEditing || tienePassword) {
      if (formData.password !== formData.confirmPassword) { onNotification("Las contraseñas no coinciden", "error"); return; }
      payload.password = formData.password;
    }
    try {
      if (isEditing) {
        await updateUsuario(selectedId, payload);
        onNotification("Usuario actualizado con éxito", "success");
      } else {
        if (!payload.password) { onNotification("La contraseña es obligatoria para nuevos usuarios", "error"); return; }
        await createUsuario(payload);
        onNotification("Usuario creado con éxito", "success");
      }
      volverALista(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      cargarUsuarios();
    } catch (err) {
      const serverMsg = err.response?.data?.username?.[0] || "Error al guardar el usuario.";
      onNotification(serverMsg, "error");
    }
  };

const handleResetPassword = async () => {
  try {
    const email = formData.email;
    if (!email) { onNotification("El usuario no tiene email registrado.", "error"); return; }
    await axios.post(`${API_BASE_URL}/api/password-reset/`, { email });
    onNotification(`Email de restablecimiento enviado a ${email}`, "success");
    setShowResetConfirm(false);
  } catch {
    onNotification("Error al enviar el email de restablecimiento.", "error");
    setShowResetConfirm(false);
  }
};

  // ── Clases reutilizables ──
  const inputClass = (disabled) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm transition-colors box-border no-spinner ${
      disabled
        ? "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500"
    }`;

  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

  const sectionTitle = (
    <div className="col-span-full pb-2 mb-1 border-b-2 border-blue-500 text-gray-700 dark:text-gray-200 text-sm font-bold uppercase tracking-widest" />
  );

  // ── Switch ──
  const Switch = ({ active, onChange, colorActive = "#38a169", disabled = false }) => (
    <div
      onClick={() => !disabled && onChange()}
      style={{ borderColor: active ? colorActive : "#cbd5e0", cursor: disabled ? "not-allowed" : "pointer" }}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 border-2 flex-shrink-0 ${disabled ? "opacity-60" : ""}`}
      >
      <div
        style={{ backgroundColor: active ? colorActive : "#cbd5e0" }}
        className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow ${active ? "left-[22px]" : "left-0.5"}`}
      />
    </div>
  );

  // ── Badge ──
  const Badge = ({ bg, color, children }) => (
    <span style={{ backgroundColor: bg, color }} className="px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
      {children}
    </span>
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-full font-sans">

      {view === "list" ? (
        <div>
          {/* Header búsqueda + botón */}
          <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <div className="relative w-full sm:w-[60%]">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                placeholder="Buscar por username, nombre, apellido o email..."
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                setFormData({ username: "", first_name: "", last_name: "", email: "", password: "", confirmPassword: "", is_active: true, is_staff: false });
                setIsEditing(false);
                setIsReadOnly(false);
                setView("form");
              }}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors cursor-pointer border-none text-sm"
            >
              Registrar
            </button>
          </div>

          {/* Filtros */}
<div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
  
  {/* Barra superior: toggle + contador */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
    <div onClick={() => setMostrarInactivos(!mostrarInactivos)}
      className="flex items-center gap-2.5 cursor-pointer select-none">
      <div className={`w-10 h-5 rounded-full relative transition-all duration-300 border-2 flex-shrink-0
        ${mostrarInactivos ? "bg-blue-500 border-blue-600" : "bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500"}`}>
        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-300 shadow
          ${mostrarInactivos ? "left-[18px]" : "left-[1px]"}`} />
      </div>
      <span className={`text-xs font-semibold transition-colors ${mostrarInactivos ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
        Mostrar inactivos
      </span>
    </div>

    {/* Contador */}
    <span className="text-xs text-gray-400 dark:text-gray-500">
      <span className="font-bold text-gray-600 dark:text-gray-300">{usuariosFiltrados.length}</span>
      <span> / {usuarios.length}</span>
    </span>
  </div>

  {/* Pills de rol */}
  <div className="flex p-2 gap-1.5">
    {[
      { value: "todos",   label: "Todos",            icon: "fa-users" },
      { value: "admin",   label: "Administradores",  icon: "fa-shield-halved" },
      { value: "usuario", label: "Usuarios",         icon: "fa-user-tie" },
    ].map((op) => (
      <button key={op.value} onClick={() => setFiltroRol(op.value)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer
          ${filtroRol === op.value
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            : "border-transparent text-gray-500 dark:text-gray-400 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}>
        <i className={`fa-solid ${op.icon} text-[10px]`}></i>
        <span className="hidden sm:inline">{op.label}</span>
        <span className="sm:hidden">{op.value === "todos" ? "Todos" : op.value === "admin" ? "Admin" : "Users"}</span>
      </button>
    ))}
  </div>

  {/* Limpiar filtros — solo visible si hay alguno activo */}
  {(mostrarInactivos || filtroRol !== "todos") && (
    <div className="px-3 pb-2.5">
      <button
        onClick={() => { setMostrarInactivos(false); setFiltroRol("todos"); }}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg transition-colors cursor-pointer bg-transparent"
      >
        <i className="fa-solid fa-xmark"></i> Limpiar filtros
      </button>
    </div>
  )}
</div>

          {/* Lista */}
      {loading ? (
  <SkeletonTable rows={4} />
) : usuariosFiltrados.length === 0 ? (
  <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
    <i className="fa-solid fa-box-open text-5xl mb-4 text-gray-300 dark:text-gray-600 block"></i>
    <h3 className="m-0 text-lg text-gray-600 dark:text-gray-300">No hay coincidencias</h3>
    <p className="mt-2 text-sm">Prueba con otro usuario, nombre, apellido o email.</p>
  </div>
) : (
  usuariosFiltrados.map((u) => (
    <div key={u.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-3 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start gap-3">

        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <strong className="text-sm text-gray-800 dark:text-gray-100">{u.username}</strong>
              {u.is_staff
                ? <Badge bg="#fef3c7" color="#92400e"><i className="fa-solid fa-shield-halved"></i> Administrador</Badge>
                : <Badge bg="#f0fff4" color="#22543d"><i className="fa-solid fa-user-tie"></i> Usuario</Badge>
              }
              {!u.is_active && <Badge bg="#fff5f5" color="#c53030"><i className="fa-solid fa-ban"></i> Inactivo</Badge>}
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 dark:text-gray-500">
              <span className="truncate"><i className="fa-solid fa-envelope mr-1"></i>{u.email || "Sin Correo"}</span>
              <span><i className="fa-solid fa-id-card mr-1"></i>{u.first_name || "Sin Nombre"} {u.last_name || "Sin Apellido"}</span>
            </div>
          </div>
        </div>

        <button
          title="Ver Detalle"
          onClick={() => handleVerDetalle(u)}
          className="px-3 py-2 border border-blue-400 text-blue-500 rounded-lg bg-transparent cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm flex-shrink-0"
        >
          <i className="fa-solid fa-eye"></i>
        </button>

      </div>
    </div>
  ))
)}
        </div>

      ) : (
        /* ── Formulario ── */
        <div className="w-full max-w-3xl mx-auto">
          {/* Nav formulario */}
          <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
            <button
              onClick={() => volverALista(false)}
              className="flex items-center gap-2 border-none bg-none text-blue-600 dark:text-blue-400 cursor-pointer font-bold text-sm hover:text-blue-800 transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i> Volver al listado
            </button>
            {isEditing && (
              <button
                onClick={() => setIsReadOnly(!isReadOnly)}
                className={`flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg border-none cursor-pointer text-sm transition-colors ${isReadOnly ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500 hover:bg-gray-600"}`}
              >
                <i className={isReadOnly ? "fa-solid fa-pen-to-square" : "fa-solid fa-xmark"}></i>
                {isReadOnly ? "Editar" : "Cancelar"}
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Nombre */}
              <div>
                <label className={labelClass}>Nombre *</label>
                <input name="first_name" value={formData.first_name} onChange={handleInputChange}
                  placeholder="Nombre" disabled={isReadOnly} required className={inputClass(isReadOnly)} />
              </div>

              {/* Apellido */}
              <div>
                <label className={labelClass}>Apellido *</label>
                <input name="last_name" value={formData.last_name} onChange={handleInputChange}
                  placeholder="Apellido" disabled={isReadOnly} required className={inputClass(isReadOnly)} />
              </div>

              {/* Username */}
              <div>
                <label className={labelClass}>Nombre de Usuario *</label>
                <input name="username" value={formData.username} onChange={handleInputChange}
                  placeholder="user_123" disabled={isEditing} required className={inputClass(isEditing)} />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Correo Electrónico *</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange}
                  placeholder="correo@ejemplo.com" disabled={isReadOnly} required className={inputClass(isReadOnly)} />
                <span className="text-xs text-gray-400 mt-1 block">Se utilizará para notificaciones del sistema.</span>
              </div>

              {/* Contraseña */}
              <div>
                <label className={labelClass}>Contraseña *</label>
                {!isEditing ? (
  <div className="flex flex-col gap-4">
    <div>
      <div className="relative">
        <input name="password" type={showPassword ? "text" : "password"}
          value={formData.password} onChange={handleInputChange}
          required placeholder="Definir contraseña..."
            className={`${inputClass(false)} pr-10`} /> 
        <button type="button" onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border-none bg-transparent cursor-pointer text-sm">
          <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
        </button>
      </div>
      <small className="text-gray-400 text-xs mt-1 block">Mínimo 8 caracteres.</small>
    </div>

    <div>
      <div className="relative">
        <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword} onChange={handleInputChange}
          required placeholder="Repetir contraseña..."
          className={`${inputClass(false)} pr-10 ${
            formData.password !== formData.confirmPassword && formData.confirmPassword
              ? "!border-red-400 dark:!border-red-500" : ""
          }`}
        />
        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border-none bg-transparent cursor-pointer text-sm">
          <i className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
        </button>
      </div>
      {formData.password !== formData.confirmPassword && formData.confirmPassword && (
        <small className="text-red-500 text-xs mt-1 block">Las contraseñas no coinciden.</small>
      )}
    </div>
  </div>
) : (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-dashed border-blue-300 dark:border-blue-700">
  <div className="flex-1">
    <p className="m-0 text-sm text-blue-800 dark:text-blue-300 font-semibold">La contraseña está encriptada.</p>
    <p className="m-0 text-xs text-blue-600 dark:text-blue-400 opacity-80 mt-1">Si el usuario la olvidó, podés enviar un restablecimiento a <strong>{formData.email || "su email"}</strong>.</p>
  </div>
  <button type="button" onClick={() => setShowResetConfirm(true)}
    className="flex items-center gap-2 px-4 py-2 border border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg bg-white dark:bg-gray-800 cursor-pointer text-sm font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap">
    <i className="fa-solid fa-key"></i> Restablecer
  </button>
</div>
                )}
              </div>

              {/* Switches */}
              <div className="flex flex-wrap gap-5 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                {/* Rol */}
                <div
                  className={`flex items-center gap-3 ${isReadOnly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  onClick={() => !isReadOnly && setFormData({ ...formData, is_staff: !formData.is_staff })}
                >
                  <Switch active={formData.is_staff} onChange={() => {}} colorActive="#805ad5" disabled={isReadOnly} />
                  <div className="flex flex-col">
                    <span style={{ color: formData.is_staff ? "#805ad5" : "#718096" }} className="text-xs font-bold uppercase tracking-wide">
                      {formData.is_staff ? "Administrador" : "Usuario"}
                    </span>
                    <span className="text-xs text-gray-400">Nivel de acceso</span>
                  </div>
                </div>

                {isEditing && (
                  <>
                    <div className="w-px bg-gray-200 dark:bg-gray-600 mx-2" />
                    <div
                      className={`flex items-center gap-3 ${isReadOnly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      onClick={() => !isReadOnly && setFormData({ ...formData, is_active: !formData.is_active })}
                    >
                      <Switch active={formData.is_active} onChange={() => {}} colorActive="#38a169" disabled={isReadOnly} />
                      <div className="flex flex-col">
                        <span style={{ color: formData.is_active ? "#2f855a" : "#718096" }} className="text-xs font-bold uppercase tracking-wide">
                          {formData.is_active ? "Activo" : "Inactivo"}
                        </span>
                        <span className="text-xs text-gray-400">Estado de cuenta</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Guardar */}
              {!isReadOnly && (
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg border-none cursor-pointer text-base transition-colors"
                >
                 Guardar
                </button>
              )}
            </form>
          </div>
        </div>
      )}
      {showResetConfirm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] px-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 w-full max-w-sm">
      
    

      <h3 className="text-center text-base font-extrabold text-gray-900 dark:text-white mb-1">
        Restablecer contraseña
      </h3>
      <p className="text-center text-sm text-gray-400 dark:text-gray-500 mb-2">
        Se enviará un email a:
      </p>
      <p className="text-center text-sm font-semibold text-blue-600 dark:text-blue-400 mb-5">
        {formData.email || "Sin email registrado"}
      </p>

      {!formData.email && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 text-xs mb-4">
          <i className="fa-solid fa-triangle-exclamation"></i>
          Este usuario no tiene email. Agregá uno antes de continuar.
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setShowResetConfirm(false)}
          className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold rounded-xl bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={handleResetPassword}
          disabled={!formData.email}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl border-none cursor-pointer text-sm flex items-center justify-center gap-2 transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default GestionUsuarios;
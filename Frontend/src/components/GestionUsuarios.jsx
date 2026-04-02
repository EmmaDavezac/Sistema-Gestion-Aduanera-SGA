import { useState, useEffect, useRef, useCallback } from "react";
import { getUsuarios, createUsuario, updateUsuario } from "../api/api";
import SkeletonTable from "./SkeletonTable";

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

  const handleResetPassword = () => {
    onNotification("Solicitud de restablecimiento enviada (ESTA ALERTA SOLO ES DE DEMOSTRACION)", "success");
  };

  // ── Clases reutilizables ──
  const inputClass = (disabled) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm transition-colors box-border ${
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
              <i className="fa-solid fa-plus"></i> Registrar
            </button>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-4 mb-4 flex-wrap p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
            <div
              onClick={() => setMostrarInactivos(!mostrarInactivos)}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className={`w-11 h-6 rounded-full relative transition-all duration-300 border-2 flex-shrink-0
                ${mostrarInactivos ? "bg-blue-500 border-blue-600" : "bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow
                  ${mostrarInactivos ? "left-5" : "left-0.5"}`}
                />
              </div>
              <span className={`text-sm font-semibold transition-colors ${mostrarInactivos ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
                Mostrar inactivos
              </span>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 hidden sm:block" />

          <div className="flex gap-1.5 w-full sm:w-auto flex-1">
  {[
    { value: "todos",   label: "Todos",   short: "Todos" },
    { value: "admin",   label: "Administradores", short: "Admin" },
    { value: "usuario", label: "Usuarios", short: "Users" },
  ].map((op) => (
    <button
      key={op.value}
      onClick={() => setFiltroRol(op.value)}
      className={`
        flex-1 sm:flex-none px-1 sm:px-4 py-2 rounded-lg text-[10px] sm:text-sm font-bold border transition-all cursor-pointer
        flex items-center justify-center text-center leading-tight min-h-[40px]
        ${filtroRol === op.value
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
          : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-transparent hover:border-gray-300"
        }
      `}
    >
      {/* Etiqueta corta para móviles */}
      <span className="block sm:hidden uppercase tracking-tighter">{op.short}</span>
      
      {/* Etiqueta completa para escritorio */}
      <span className="hidden sm:block">{op.label}</span>
    </button>
  ))}
</div>
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
              <div key={u.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm mb-4 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-base text-gray-800 dark:text-gray-100">{u.username}</strong>
                        {u.is_staff
                          ? <Badge bg="#fef3c7" color="#92400e"><i className="fa-solid fa-shield-halved"></i> Administrador</Badge>
                          : <Badge bg="#f0fff4" color="#22543d"><i className="fa-solid fa-user-tie"></i> Usuario</Badge>
                        }
                        {!u.is_active && <Badge bg="#fff5f5" color="#c53030"><i className="fa-solid fa-ban"></i> Inactivo</Badge>}
                      </div>
                      <p className="m-0 mt-1 text-gray-400 dark:text-gray-500 text-xs">
                        <i className="fa-solid fa-envelope mr-1"></i>
                        {u.email || "Sin Correo"} &nbsp;|&nbsp;
                        <i className="fa-solid fa-id-card mr-1"></i>
                        {u.first_name || "Sin Nombre"} {u.last_name || "Sin Apellido"}
                      </p>
                    </div>
                  </div>
                  <button
                    title="Ver Detalle"
                    onClick={() => handleVerDetalle(u)}
                    className="px-3 py-2 border border-blue-400 text-blue-500 rounded-lg bg-transparent cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm"
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
                      <input name="password" type="password" value={formData.password} onChange={handleInputChange}
                        required placeholder="Definir contraseña..." className={inputClass(false)} />
                      <small className="text-gray-400 text-xs mt-1 block">Mínimo 8 caracteres.</small>
                    </div>
                    <div>
                      <input
                        name="confirmPassword" type="password" value={formData.confirmPassword}
                        onChange={handleInputChange} required placeholder="Repetir contraseña..."
                        className={`${inputClass(false)} ${
                          formData.password !== formData.confirmPassword && formData.confirmPassword
                            ? "!border-red-400 dark:!border-red-500" : ""
                        }`}
                      />
                      {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                        <small className="text-red-500 text-xs mt-1 block">Las contraseñas no coinciden.</small>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-dashed border-blue-300 dark:border-blue-700">
                    <div className="flex-1">
                      <p className="m-0 text-sm text-blue-800 dark:text-blue-300 font-semibold">La contraseña está encriptada.</p>
                      <p className="m-0 text-xs text-blue-600 dark:text-blue-400 opacity-80 mt-1">Si el usuario la olvidó, podés enviar un restablecimiento.</p>
                    </div>
                    <button type="button" onClick={handleResetPassword}
                      className="flex items-center gap-2 px-4 py-2 border border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg bg-white dark:bg-gray-800 cursor-pointer text-sm font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
                    >
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
                  <i className="fa-solid fa-floppy-disk"></i> Guardar
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;
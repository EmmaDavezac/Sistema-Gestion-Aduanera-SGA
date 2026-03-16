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
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    is_staff: false,
    is_active: true,
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
    if (!cargadoRef.current) {
      cargarUsuarios();
      cargadoRef.current = true;
    }
  }, [cargarUsuarios]);

 const usuariosFiltrados = usuarios.filter((u) => {
  const termino = busqueda.toLowerCase();
  const coincideBusqueda =
    u.username?.toLowerCase().includes(termino) ||
    u.first_name?.toLowerCase().includes(termino) ||
    u.last_name?.toLowerCase().includes(termino) ||
    u.email?.toLowerCase().includes(termino);

  const coincideEstado = mostrarInactivos ? true : u.is_active;

  const coincideRol =
    filtroRol === "todos" ? true :
    filtroRol === "admin" ? u.is_staff :
    !u.is_staff;

  return coincideBusqueda && coincideEstado && coincideRol;
});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleVerDetalle = (user) => {
    setSelectedId(user.id);
    setFormData({
      username: user.username,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      is_staff: user.is_staff,
      is_active: user.is_active,
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
      setFormData({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        is_staff: false,
        is_active: true,
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      username: formData.username,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      is_staff: formData.is_staff,
      is_active: formData.is_active,
    };
    const tienePassword = formData.password && formData.password.trim() !== "";

    if (!isEditing || tienePassword) {
      if (formData.password !== formData.confirmPassword) {
        onNotification("Las contraseñas no coinciden", "error");
        return;
      }
      payload.password = formData.password;
    }

    try {
      if (isEditing) {
        await updateUsuario(selectedId, payload);
        onNotification("Usuario actualizado con éxito", "success");
      } else {
        if (!payload.password) {
          onNotification(
            "La contraseña es obligatoria para nuevos usuarios",
            "error",
          );
          return;
        }
        await createUsuario(payload);
        onNotification("Usuario creado con éxito", "success");
      }

      volverALista(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      cargarUsuarios();
    } catch (err) {
      console.error("Error del servidor:", err.response?.data);
      const serverMsg =
        err.response?.data?.username?.[0] || "Error al guardar el usuario.";
      onNotification(serverMsg, "error");
    }
  };

  const handleResetPassword = () => {
    try {
      onNotification(
        "Solicitud de restablecimiento enviada (ESTA ALERTA SOLO ES DE DEMOSTRACION)",
        "success",
      );
    } catch (err) {
      onNotification(
        "No se pudo enviar la solicitud de restablecimiento.",
        "error",
      );
    }
  };

  const styles = {
    container: {
      padding: "30px",
      backgroundColor: "#f4f7f6",
      minHeight: "100vh",
      fontFamily: "Segoe UI, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
      gap: "15px",
      flexWrap: "wrap",
    },
    searchWrapper: { position: "relative", width: "60%" },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#888",
    },
    card: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      marginBottom: "15px",
      border: "1px solid #eee",
    },
    input: {
      padding: "12px 12px 12px 40px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      width: "100%",
      fontSize: "14px",
    },
    formInput: {
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      width: "100%",
      marginTop: "5px",
      boxSizing: "border-box",
      backgroundColor: isReadOnly ? "#f8fafc" : "#fff",
      fontSize: "14px",
    },
    btnGreen: {
      padding: "12px 24px",
      backgroundColor: "#2ecc71",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    btnAction: (color) => ({
      padding: "8px 12px",
      backgroundColor: "transparent",
      color: color,
      border: `1px solid ${color}`,
      borderRadius: "6px",
      cursor: "pointer",
      transition: "0.3s",
      marginLeft: "8px",
    }),
    btnOutline: {
      padding: "10px 15px",
      backgroundColor: "transparent",
      color: "#3182ce",
      border: "1px solid #3182ce",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "0.2s",
    },
    badge: (bg, color) => ({
      padding: "5px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      backgroundColor: bg,
      color: color,
      fontWeight: "bold",
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
    }),
    switchTrack: (
      active,
      colorActive = "#38a169",
      colorInactive = "#cbd5e0",
    ) => ({
      width: "50px",
      height: "26px",
      backgroundColor: active ? colorActive + "33" : "#edf2f7",
      borderRadius: "15px",
      position: "relative",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: `2px solid ${active ? colorActive : colorInactive}`,
    }),
    switchThumb: (
      active,
      colorActive = "#38a169",
      colorInactive = "#718096",
    ) => ({
      width: "18px",
      height: "18px",
      backgroundColor: active ? colorActive : colorInactive,
      borderRadius: "50%",
      position: "absolute",
      top: "2px",
      left: active ? "26px" : "2px",
      transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    }),
    statusLabel: (active, colorActive = "#2f855a") => ({
      fontSize: "13px",
      fontWeight: "bold",
      color: active ? colorActive : "#718096",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }),
    btnBlue: {
      padding: "10px 20px",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "15px",
    },
    passwordGroup: {
      passwordGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        width: "100%",
      },
    },
  };

  return (
    <div style={styles.container}>
      {view === "list" ? (
        <div>
          <div style={styles.header}>
            <div style={styles.searchWrapper}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={styles.searchIcon}
              ></i>
              <input
                style={styles.input}
                placeholder="Buscar por username, nombre, apellido o email..."
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button
              style={styles.btnGreen}
              onClick={() => {
                setFormData({
                  username: "",
                  first_name: "",
                  last_name: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  is_active: true,
                  is_staff: false,
                });
                setIsEditing(false);
                setIsReadOnly(false);
                setView("form");
              }}
            >
              <i className="fa-solid fa-plus"></i> Registrar
            </button>
          </div>
<div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "15px", flexWrap: "wrap" }}>
  
  <div
    onClick={() => setMostrarInactivos(!mostrarInactivos)}
    style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}
  >
    <div style={{
      width: "44px", height: "24px",
      backgroundColor: mostrarInactivos ? "#3182ce" : "#cbd5e0",
      borderRadius: "12px", position: "relative",
      transition: "background-color 0.3s ease",
      border: `2px solid ${mostrarInactivos ? "#2b6cb0" : "#a0aec0"}`,
      flexShrink: 0,
    }}>
      <div style={{
        width: "16px", height: "16px",
        backgroundColor: "white", borderRadius: "50%",
        position: "absolute", top: "2px",
        left: mostrarInactivos ? "22px" : "2px",
        transition: "left 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }}/>
    </div>
    <span style={{
      fontSize: "13px",
      color: mostrarInactivos ? "#2b6cb0" : "#718096",
      fontWeight: mostrarInactivos ? "600" : "400",
      transition: "color 0.3s",
    }}>
      Mostrar inactivos
    </span>
  </div>

  <div style={{ display: "flex", gap: "8px" }}>
    {[
      { value: "todos", label: "Todos" },
      { value: "admin", label: "Administradores" },
      { value: "usuario", label: "Usuarios" },
    ].map((op) => (
      <button
        key={op.value}
        onClick={() => setFiltroRol(op.value)}
        style={{
          padding: "6px 14px",
          borderRadius: "20px",
          border: `1px solid ${filtroRol === op.value ? "#3182ce" : "#cbd5e0"}`,
          backgroundColor: filtroRol === op.value ? "#ebf4ff" : "transparent",
          color: filtroRol === op.value ? "#2b6cb0" : "#718096",
          fontWeight: filtroRol === op.value ? "600" : "400",
          fontSize: "13px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        {op.label}
      </button>
    ))}
  </div>

</div>
          {loading ? (
            <SkeletonTable rows={4} />
          ) : usuariosFiltrados.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#a0aec0",
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "2px dashed #e2e8f0",
              }}
            >
              <i
                className="fa-solid fa-box-open"
                style={{
                  fontSize: "50px",
                  marginBottom: "15px",
                  color: "#cbd5e0",
                }}
              ></i>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#4a5568" }}>
                No hay coincidencias
              </h3>
              <p style={{ marginTop: "8px" }}>
                Prueba con otro usuario, nombre, apellido o email.
              </p>
            </div>
          ) : (
            usuariosFiltrados.map((u) => (
              <div key={u.id} style={styles.card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        backgroundColor: "#ebf4ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3182ce",
                      }}
                    >
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <strong style={{ fontSize: "16px", color: "#2d3748" }}>
                          {u.username}
                        </strong>
                        {u.is_staff ? (
                          <span style={styles.badge("#fef3c7", "#92400e")}>
                            <i className="fa-solid fa-shield-halved"></i>{" "}
                            Administrador
                          </span>
                        ) : (
                          <span style={styles.badge("#f0fff4", "#22543d")}>
                            <i className="fa-solid fa-user-tie"></i> Usuario
                          </span>
                        )}
                        {!u.is_active && (
                          <span style={styles.badge("#fff5f5", "#c53030")}>
                            <i className="fa-solid fa-ban"></i> Inactivo
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          color: "#718096",
                          fontSize: "13px",
                        }}
                      >
                        <i
                          className="fa-solid fa-envelope"
                          style={{ marginRight: "5px" }}
                        ></i>
                        {u.email !== "" ? u.email : "Sin Correo"} |{" "}
                        <i
                          className="fa-solid fa-id-card"
                          style={{ marginRight: "5px" }}
                        ></i>
                        {u.first_name || "Sin Nombre"}{" "}
                        {u.last_name || "Sin Apellido"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <button
                      title="Ver Detalle"
                      style={styles.btnAction("#3182ce")}
                      onClick={() => handleVerDetalle(u)}
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            margin: "0 auto",
            boxSizing: "border-box",
            padding: "0 10px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <button
              onClick={() => volverALista(false)}
              style={{
                border: "none",
                background: "none",
                color: "#3182ce",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="fa-solid fa-arrow-left"></i> Volver al listado
            </button>
            {isEditing && (
              <button
                type="button"
                style={{
                  ...styles.btnBlue,
                  marginBottom: 0,
                  backgroundColor: isReadOnly ? "#3182ce" : "#718096",
                }}
                onClick={() => setIsReadOnly(!isReadOnly)}
              >
                <i
                  className={
                    isReadOnly
                      ? "fa-solid fa-pen-to-square"
                      : "fa-solid fa-xmark"
                  }
                ></i>
                {isReadOnly ? " Editar" : " Cancelar"}
              </button>
            )}
          </div>
          <div style={styles.card}>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  width: "100%",
                }}
              >
                <label
                  style={{
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#4a5568",
                  }}
                >
                  Nombre *
                </label>
                <input
                  name="first_name"
                  style={styles.formInput}
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                  disabled={isReadOnly}
                  required
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label
                  style={{
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#4a5568",
                  }}
                >
                  Apellido *
                </label>
                <input
                  name="last_name"
                  style={styles.formInput}
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Apellido"
                  disabled={isReadOnly}
                  required
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  width: "100%",
                }}
              >
                <label
                  style={{
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#4a5568",
                  }}
                >
                  Nombre de Usuario *
                </label>
                <input
                  name="username"
                  style={styles.formInput}
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isEditing}
                  placeholder="user_123"
                  required
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  width: "100%",
                }}
              >
                <label
                  style={{
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#4a5568",
                  }}
                >
                  Correo Electrónico *
                </label>

                <input
                  name="email"
                  type="email"
                  style={styles.formInput}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  disabled={isReadOnly}
                  required
                />
                <span style={{ fontSize: "11px", color: "#a0aec0" }}>
                  Se utilizará para notificaciones del sistema.
                </span>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#4a5568",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Contraseña *
                </label>

                {!isEditing ? (
                  <div style={styles.passwordGroup}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                        width: "100%",
                      }}
                    >
                      <input
                        name="password"
                        type="password"
                        style={styles.formInput}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Definir contraseña de acceso..."
                      />
                      <small
                        style={{
                          color: "#718096",
                          fontSize: "11px",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        Mínimo 8 caracteres. Se recomienda combinar letras y
                        números.
                      </small>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                        width: "100%",
                      }}
                    >
                      <input
                        name="confirmPassword"
                        type="password"
                        style={{
                          ...styles.formInput,
                          borderColor:
                            formData.password !== formData.confirmPassword &&
                            formData.confirmPassword
                              ? "#e53e3e"
                              : "#ddd",
                        }}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        placeholder="Repetir contraseña..."
                      />
                      {formData.password !== formData.confirmPassword &&
                        formData.confirmPassword && (
                          <small
                            style={{
                              color: "#e53e3e",
                              fontSize: "11px",
                              display: "block",
                              marginTop: "4px",
                            }}
                          >
                            Las contraseñas no coinciden.
                          </small>
                        )}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      padding: "10px",
                      backgroundColor: "#ebf8ff",
                      borderRadius: "8px",
                      border: "1px dashed #3182ce",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#2c5282",
                        }}
                      >
                        <strong>La contraseña está encriptada.</strong>
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#2c5282",
                          opacity: 0.8,
                        }}
                      >
                        Si el usuario la olvidó, puedes enviar una solicitud de
                        restablecimiento.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      style={{
                        ...styles.btnOutline,
                        backgroundColor: "white",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <i className="fa-solid fa-key"></i> Restablecer
                    </button>
                  </div>
                )}
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "20px",
                  backgroundColor: "#f8fafc",
                  padding: "15px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: isReadOnly ? "not-allowed" : "pointer",
                    opacity: isReadOnly ? 0.7 : 1,
                  }}
                  onClick={() =>
                    !isReadOnly &&
                    setFormData({ ...formData, is_staff: !formData.is_staff })
                  }
                >
                  <div style={styles.switchTrack(formData.is_staff, "#805ad5")}>
                    <div
                      style={styles.switchThumb(formData.is_staff, "#805ad5")}
                    ></div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span
                      style={styles.statusLabel(formData.is_staff, "#805ad5")}
                    >
                      {formData.is_staff ? "Administrador" : "Usuario"}
                    </span>
                    <span style={{ fontSize: "11px", color: "#718096" }}>
                      Nivel de acceso
                    </span>
                  </div>
                </div>

                {isEditing && (
                  <>
                    <div
                      style={{
                        width: "1px",
                        backgroundColor: "#e2e8f0",
                        margin: "0 10px",
                      }}
                    ></div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: isReadOnly ? "not-allowed" : "pointer",
                        opacity: isReadOnly ? 0.7 : 1,
                      }}
                      onClick={() =>
                        !isReadOnly &&
                        setFormData({
                          ...formData,
                          is_active: !formData.is_active,
                        })
                      }
                    >
                      <div
                        style={styles.switchTrack(
                          formData.is_active,
                          "#38a169",
                        )}
                      >
                        <div
                          style={styles.switchThumb(
                            formData.is_active,
                            "#38a169",
                          )}
                        ></div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                          style={styles.statusLabel(
                            formData.is_active,
                            "#2f855a",
                          )}
                        >
                          {formData.is_active ? "Activo" : "Inactivo"}
                        </span>
                        <span style={{ fontSize: "11px", color: "#718096" }}>
                          Estado de cuenta
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!isReadOnly && (
                <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                  <button
                    type="submit"
                    style={{
                      ...styles.btnGreen,
                      width: "100%",
                      justifyContent: "center",
                      padding: "15px",
                      fontSize: "16px",
                    }}
                  >
                    <i className="fa-solid fa-floppy-disk"></i> Guardar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;

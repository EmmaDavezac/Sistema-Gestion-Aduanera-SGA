import { useState, useEffect, useRef, useCallback } from "react";
import {
  getClientes,
  createCliente,
  updateCliente,
  getArchivos,
  uploadFile,
  downloadFile,
  deleteArchivo,
} from "../api/api";
import validarCUIT from "../utils/validaciones";
import SkeletonTable from "./SkeletonTable";
const GestionClientes = ({ onNotification }) => {
  const [clientes, setClientes] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [view, setView] = useState("list");
  const [isEditing, setIsEditing] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const today = new Date().toISOString().split('T')[0];

  const cargadoRef = useRef(false);

  const [formData, setFormData] = useState({
    cuit: "",
    nombre: "",
    domicilio: "",
    telefono_1: "",
    telefono_2: "",
    fecha_inicio_actividad: "",
    observaciones: "",
    baja: false,
  });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([getClientes(), getArchivos()]);
      setClientes(c);
      setArchivos(a);

      if (clienteSeleccionado) {
        const actualizado = c.find(
          (item) => item.cuit === clienteSeleccionado.cuit
        );
        if (actualizado) {
          setClienteSeleccionado(actualizado);

          setFormData(actualizado);
        }
      }
    } catch (err) {
      onNotification("Error cargando datos", "error");
      console.error("Error detallado:", err.response?.data);
    } finally {
      setLoading(false);
    }
  }, [clienteSeleccionado?.cuit]);

  useEffect(() => {
    if (!cargadoRef.current) {
      cargarDatos();
      cargadoRef.current = true;
    }
  }, [cargarDatos]);

  const handleFileUpload = async () => {
    if (!fileToUpload) return;
    const fData = new FormData();
    fData.append("archivo", fileToUpload);
    fData.append("tipo", 1);
    fData.append("cuit_cliente", clienteSeleccionado.cuit);
    fData.append("nombre", fileToUpload.name);

    try {
      await uploadFile(fData);
      onNotification("Archivo añadido", "success");
      setFileToUpload(null);
      await cargarDatos();
    } catch (err) {
      onNotification("Error al subir", "error");
    }
  };

  const handleEliminarArchivo = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este archivo?")) return;
    try {
      await deleteArchivo(id);
      await cargarDatos();
      onNotification("Archivo eliminado", "success");
    } catch (err) {
      onNotification("Error al eliminar", "error");
    }
  };

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.cuit.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCUIT(formData.cuit)) {
      onNotification("El CUIT no es válido. Verifique los dígitos.", "error");
      return;
    }
    if (!esFechaValida(formData.fecha_inicio_actividad)) {
      onNotification(
        "La fecha de inicio de actividad no puede ser mayor a la fecha actual.", 
        "error"
      );
      return;
    }

    try {
      if (isEditing && clienteSeleccionado) {
        const datosParaEnviar = { ...formData };
        delete datosParaEnviar.cuit;
        await updateCliente(clienteSeleccionado.cuit, datosParaEnviar);
        onNotification("¡Actualizado con éxito!", "success");
        await cargarDatos();
        setIsEditing(false);
      } else {
        await createCliente(formData);
        onNotification("¡Cliente registrado con éxito!", "success");
        await cargarDatos();
        volverALista(true);
      }
    } catch (err) {
      console.log("Estructura completa del error:", err.response?.data);

      const mensajeBackend =
        err.response?.data?.message || err.response?.data?.error;

      if (mensajeBackend) {
        onNotification(mensajeBackend, "error");
      } else if (err.response?.status === 400) {
        onNotification("Error en los datos: El CUIT ya registrado", "error");
      } else {
        onNotification("Error de comunicación con el servidor", "error");
      }
    }
  };

  const verMasInfo = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(cliente);
    setView("detail");
    setIsEditing(false);
  };

  const esFechaValida = (fechaInput) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    
    const fechaSeleccionada = new Date(fechaInput);
    fechaSeleccionada.setMinutes(fechaSeleccionada.getMinutes() + fechaSeleccionada.getTimezoneOffset());
    fechaSeleccionada.setHours(0, 0, 0, 0);
  
    return fechaSeleccionada <= hoy;
  };

  const volverALista = (saltarConfirmacion = false) => {
    if (saltarConfirmacion || window.confirm("¿Desea volver al listado?")) {
        setClienteSeleccionado(null);
        setIsEditing(false);
        setView("list");
        setFileToUpload(null);
        setFormData({
            cuit: "",
            nombre: "",
            domicilio: "",
            telefono_1: "",
            telefono_2: "",
            fecha_inicio_actividad: "",
            observaciones: "",
            baja: false,
        });
        window.scrollTo(0, 0);
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
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      marginBottom: "15px",
      border: "1px solid #eee",
    },
    input: {
      padding: "12px 12px 12px 40px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      width: "100%",
      fontSize: "14px",
      boxSizing: "border-box",
    },
    formInput: {
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      width: "100%",
      marginTop: "5px",
      transition: "all 0.3s",
      boxSizing: "border-box",
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
    btnBlue: {
      padding: "10px 20px",
      backgroundColor: "#3182ce",
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
    label: {
      fontWeight: "600",
      fontSize: "13px",
      color: "#4a5568",
      marginBottom: "5px",
      display: "inline-block",
    },
    sectionTitle: {
      gridColumn: "1 / -1",
      fontWeight: "700",
      marginTop: "15px",
      marginBottom: "5px",
      paddingBottom: "8px",
      borderBottom: "2px solid #3182ce",
      color: "#2d3748",
      fontSize: "15px",
      textTransform: "uppercase",
    },
    checkboxContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px",
      backgroundColor: "#f8fafc",
      borderRadius: "8px",
      border: "1px solid #edf2f7",
      cursor: "pointer",
    },
    switchTrack: (baja) => ({
      width: "50px",
      height: "26px",

      backgroundColor: baja ? "#fed7d7" : "#c6f6d5",
      borderRadius: "15px",
      position: "relative",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: `2px solid ${baja ? "#e53e3e" : "#38a169"}`,
    }),

    switchThumb: (baja) => ({
      width: "18px",
      height: "18px",
      backgroundColor: baja ? "#e53e3e" : "#38a169",
      borderRadius: "50%",
      position: "absolute",
      top: "2px",
      left: baja ? "2px" : "26px",
      transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    }),

    statusLabel: (isBaja) => ({
      fontSize: "13px",
      fontWeight: "bold",
      color: isBaja ? "#c53030" : "#2f855a",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }),
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
                placeholder="Buscar por nombre o CUIT..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button style={styles.btnGreen} onClick={() => setView("form")}>
              <i className="fa-solid fa-plus"></i>Registrar
            </button>
          </div>

          {clientesFiltrados.map((c) => (
            <div key={c.cuit} style={styles.card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
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
                        {c.nombre}
                      </strong>
                      {c.baja ? (
                        <span style={styles.badge("#fff5f5", "#c53030")}>
                          Inactivo
                        </span>
                      ) : (
                        <span style={styles.badge("#f0fff4", "#22543d")}>
                          Activo
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
                        className="fa-solid fa-id-card"
                        style={{ marginRight: "5px" }}
                      ></i>
                      CUIT: {c.cuit} |
                      <i
                        className="fa-solid fa-location-dot"
                        style={{ marginLeft: "10px", marginRight: "5px" }}
                      ></i>
                      {c.domicilio || "Sin domicilio"}
                    </p>
                  </div>
                </div>
                <button
                  title="Ver Detalles"
                  style={styles.btnAction("#3182ce")}
                  onClick={() => verMasInfo(c)}
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
          ))}
          {loading ? (
            <SkeletonTable rows={4} />
          ) : (
            clientesFiltrados.length === 0 && (
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
                  Prueba con otro nombre o CUIT.
                </p>
              </div>
            )
          )}
        </div>
      ) : view === "form" ? (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <button
            onClick={() => volverALista(false)}
            style={{
              border: "none",
              background: "none",
              color: "#3182ce",
              cursor: "pointer",
              marginBottom: "20px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Volver al listado
          </button>

          <div style={styles.card}>
           

            <form
              onSubmit={handleSubmit}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "20px",
              }}
            >
              <div style={styles.sectionTitle}>Datos Identificatorios</div>

              <div style={{ gridColumn: "span 1" }}>
                <label style={styles.label}>CUIT *</label>
                <input
                  type="text"
                  pattern="[0-9]{11}"
                  style={styles.formInput}
                  placeholder="Ej: 20123456789"
                  value={formData.cuit}
                  onChange={(e) =>
                    setFormData({ ...formData, cuit: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ gridColumn: "span 1" }}>
                <label style={styles.label}>Razón Social / Nombre *</label>
                <input
                  style={styles.formInput}
                  placeholder="Ej: Logística S.A."
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>

              <div style={styles.sectionTitle}>Información de Contacto</div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={styles.label}>Domicilio *</label>
                <input
                  style={styles.formInput}
                  placeholder="Calle, Número, Localidad"
                  value={formData.domicilio}
                  onChange={(e) =>
                    setFormData({ ...formData, domicilio: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ gridColumn: "span 1" }}>
                <label style={styles.label}>Teléfono Principal *</label>
                <input
                  type="number"
                  style={styles.formInput}
                  placeholder="Ej: 0113438401246"
                  value={formData.telefono_1}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono_1: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ gridColumn: "span 1" }}>
                <label style={styles.label}>Teléfono Secundario</label>
                <input
                  type="number"
                  style={styles.formInput}
                  placeholder="Opcional"
                  value={formData.telefono_2}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono_2: e.target.value })
                  }
                />
              </div>

              <div style={styles.sectionTitle}>Otros Datos</div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={styles.label}>Fecha Inicio Actividad *</label>
                <input
                  type="date"
                  style={styles.formInput}
                  value={formData.fecha_inicio_actividad}
                  max={today}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fecha_inicio_actividad: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={styles.label}>Observaciones</label>
                <textarea
                  style={{
                    ...styles.formInput,
                    height: "80px",
                    resize: "none",
                  }}
                  placeholder="Notas adicionales sobre el cliente..."
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                />
              </div>

              <div style={{ gridColumn: "span 2", marginTop: "10px" }}>
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
            </form>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={styles.header}>
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
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={{
                  ...styles.btnBlue,
                  backgroundColor: isEditing ? "#718096" : "#3182ce",
                }}
                onClick={() => setIsEditing(!isEditing)}
              >
                <i
                  className={
                    isEditing
                      ? "fa-solid fa-xmark"
                      : "fa-solid fa-pen-to-square"
                  }
                ></i>
                {isEditing ? "Cancelar" : "Editar"}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "30px",
              alignItems: "start",
            }}
          >
            <div style={styles.card}>
              <h3 style={{ marginTop: 0, color: "#2d3748" }}>
                <i
                  className="fa-solid fa-file-invoice"
                  style={{ marginRight: "10px", color: "#3182ce" }}
                ></i>{" "}
                Ficha del Cliente
              </h3>
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                }}
              >
                <div style={styles.sectionTitle}>Datos Identificatorios</div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Nombre / Razón Social *</label>
                  <input
                    style={styles.formInput}
                    value={formData.nombre}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>CUIT *</label>
                  <input
                    style={{ ...styles.formInput, backgroundColor: "#f8fafc" }}
                    value={formData.cuit}
                    disabled={true}
                    required
                  />
                </div>
                <div style={styles.sectionTitle}>Información de Contacto</div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Domicilio *</label>
                  <input
                    style={styles.formInput}
                    value={formData.domicilio || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, domicilio: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Teléfono Principal *</label>
                  <input
                    style={styles.formInput}
                    value={formData.telefono_1 || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono_1: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Teléfono Secundario</label>
                  <input
                    style={styles.formInput}
                    value={formData.telefono_2 || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono_2: e.target.value })
                    }
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Fecha Inicio Actividad *</label>
                  <input
                    type="date"
                    style={{
                      ...styles.formInput,
                      backgroundColor: !isEditing ? "#f8fafc" : "white",
                    }}
                    value={
                      formData.fecha_inicio_actividad
                        ? formData.fecha_inicio_actividad.split("T")[0]
                        : ""
                    }
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fecha_inicio_actividad: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div style={styles.sectionTitle}>
                  Información Complementaria
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Observaciones</label>
                  <textarea
                    style={{
                      ...styles.formInput,
                      height: "80px",
                      resize: "none",
                    }}
                    value={formData.observaciones || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observaciones: e.target.value,
                      })
                    }
                  />
                </div>

                {isAdmin && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={styles.label}>Estado Lógico del Cliente</label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        padding: "12px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "10px",
                        border: "1px solid #edf2f7",
                        opacity: isEditing ? 1 : 0.7,
                        cursor: isEditing ? "pointer" : "default",
                      }}
                      onClick={() =>
                        isEditing &&
                        setFormData({ ...formData, baja: !formData.baja })
                      }
                    >
                      <div style={styles.switchTrack(formData.baja)}>
                        <div style={styles.switchThumb(formData.baja)}></div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={styles.statusLabel(formData.baja)}>
                          {formData.baja ? "Inactivo" : "Activo"}
                        </span>
                        <span style={{ fontSize: "11px", color: "#718096" }}>
                          {isEditing
                            ? "Haz clic para cambiar el estado"
                            : "Modo lectura"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {isEditing && (
                  <button
                    type="submit"
                    style={{
                      ...styles.btnGreen,
                      gridColumn: "1 / -1",
                      justifyContent: "center",
                      marginTop: "10px",
                    }}
                  >
                    <i className="fa-solid fa-floppy-disk"></i> Guardar
                  </button>
                )}
              </form>
            </div>

            <div style={styles.card}>
              <h3 style={{ marginTop: 0, color: "#2d3748" }}>
                <i
                  className="fa-solid fa-folder-open"
                  style={{ marginRight: "10px", color: "#3182ce" }}
                ></i>{" "}
                Documentos
              </h3>
              {isEditing && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "15px",
                    border: "2px dashed #cbd5e0",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="file"
                    style={{
                      fontSize: "12px",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                    onChange={(e) => setFileToUpload(e.target.files[0])}
                  />
                  <button
                    onClick={handleFileUpload}
                    style={{
                      ...styles.btnBlue,
                      width: "100%",
                      fontSize: "13px",
                      padding: "8px",
                    }}
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i> Subir Archivo
                  </button>
                </div>
              )}
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {archivos
                  .filter((a) => a.cuit_cliente === clienteSeleccionado.cuit)
                  .map((a) => (
                    <div
                      key={a.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        borderBottom: "1px solid #edf2f7",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#4a5568",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "150px",
                        }}
                      >
                        <i
                          className="fa-solid fa-file-pdf"
                          style={{ marginRight: "8px", color: "#e53e3e" }}
                        ></i>{" "}
                        {a.nombre}
                      </span>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          onClick={() => downloadFile(a.id, a.nombre)}
                          style={styles.btnAction("#3182ce")}
                          title="Descargar"
                        >
                          <i className="fa-solid fa-download"></i>
                        </button>
                        {isEditing && (
                          <button
                            onClick={() => handleEliminarArchivo(a.id)}
                            style={styles.btnAction("#e53e3e")}
                            title="Eliminar"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionClientes;

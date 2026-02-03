import { useState, useEffect } from "react";
import {
  getClientes,
  createCliente,
  updateCliente,
  getArchivos,
  uploadFile,
  downloadFile,
  deleteArchivo,
  darBajaCliente,
  darAltaCliente,
} from "../api/files";

const GestionClientes = ({ onUpdate }) => {
  const [clientes, setClientes] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [view, setView] = useState("list");
  const [isEditing, setIsEditing] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);

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

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [c, a] = await Promise.all([getClientes(), getArchivos()]);
      setClientes(c);
      setArchivos(a);

      // Si hay un cliente seleccionado, actualizar sus datos desde la lista fresca
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
      console.error("Error cargando datos", err);
    }
  };
  const handleAltaCliente = async (cuit) => {
    if (!window.confirm("¿Deseas reactivar este cliente?")) return;
    try {
      const response = await darAltaCliente(cuit);
      console.log("Servidor respondió ok:", response);
      await cargarDatos();
      alert("Cliente reactivado con éxito");
    } catch (err) {
      console.error("ERROR AL DAR DE ALTA:");
      console.dir(err); // Esto te mostrará el objeto de error completo en la consola

      const msg =
        err.response?.data?.detail || "Error de conexión con el servidor";
      alert("No se pudo dar de alta: " + msg);
    }
  };

  const handleBajaCliente = async (cuit) => {
    if (!window.confirm("¿Confirmas la baja de este cliente?")) return;
    try {
      await darBajaCliente(cuit);
      // Sincronizamos con el servidor
      await cargarDatos();
      alert("Cliente dado de baja correctamente");
    } catch (err) {
      alert("Error al procesar la baja");
    }
  };
  const handleFileUpload = async () => {
    if (!fileToUpload) return;
    const fData = new FormData();
    fData.append("archivo", fileToUpload);
    fData.append("tipo", 1);
    fData.append("cuit_cliente", clienteSeleccionado.cuit);
    fData.append("nombre", fileToUpload.name);

    try {
      await uploadFile(fData);
      alert("Archivo añadido");
      setFileToUpload(null);
      await cargarDatos();
    } catch (err) {
      alert("Error al subir");
    }
  };

  const handleEliminarArchivo = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este archivo?")) return;
    try {
      await deleteArchivo(id);
      await cargarDatos();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  // Filtro limpio: No filtramos por 'baja', solo por búsqueda de texto
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.cuit.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && clienteSeleccionado) {
        // Si el estado de baja cambió, ejecutamos la acción correspondiente
        if (formData.baja !== clienteSeleccionado.baja) {
          if (formData.baja) {
            await darBajaCliente(formData.cuit);
          } else {
            await darAltaCliente(formData.cuit);
          }
        }
        await updateCliente(formData.cuit, formData);
        alert("Datos actualizados");
      } else {
        await createCliente(formData);
        alert("Cliente registrado");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      await cargarDatos();
      if (onUpdate) onUpdate();
      volverALista();
    } catch (err) {
      alert("Error en la operación");
    }
  };

  const verMasInfo = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(cliente);
    setView("detail");
    setIsEditing(false);
  };

  const volverALista = () => {
    setClienteSeleccionado(null);
    setIsEditing(false);
    setView("list");
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
    },
    formInput: {
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      width: "100%",
      marginTop: "5px",
      transition: "all 0.3s",
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
      marginBottom: "5px", // Espacio hacia abajo
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
    switchTrack: (active) => ({
      width: "50px",
      height: "26px",
      backgroundColor: active ? "#fed7d7" : "#c6f6d5", // Fondo suave
      borderRadius: "15px",
      position: "relative",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: `2px solid ${active ? "#e53e3e" : "#38a169"}`,
    }),
    switchThumb: (active) => ({
      width: "18px",
      height: "18px",
      backgroundColor: active ? "#e53e3e" : "#38a169", // Círculo fuerte
      borderRadius: "50%",
      position: "absolute",
      top: "2px",
      left: active ? "26px" : "2px", // Desplazamiento
      transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    }),
    statusLabel: (active) => ({
      fontSize: "13px",
      fontWeight: "bold",
      color: active ? "#c53030" : "#2f855a",
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
          {clientesFiltrados.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#a0aec0",
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "2px dashed #e2e8f0", // Un borde punteado queda muy bien para estados vacíos
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
              <p style={{ marginTop: "8px" }}>Prueba con otro nombre o CUIT.</p>
            </div>
          )}
        </div>
      ) : view === "form" ? (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <button
            onClick={volverALista}
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
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#2d3748",
                borderBottom: "2px solid #f4f7f6",
                paddingBottom: "10px",
              }}
            >
              <i
                className="fa-solid fa-user-plus"
                style={{ marginRight: "10px", color: "#2ecc71" }}
              ></i>
              Registrar Nuevo Cliente
            </h2>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "25px",
              }}
            >
              <div>
                <label style={styles.label}>CUIT / Identificación</label>
                <input
                  style={styles.formInput}
                  placeholder="Ej: 20-12345678-9"
                  onChange={(e) =>
                    setFormData({ ...formData, cuit: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Razón Social / Nombre</label>
                <input
                  style={styles.formInput}
                  placeholder="Ej: Logística S.A."
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <button
                  type="submit"
                  style={{
                    ...styles.btnGreen,
                    width: "100%",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  <i className="fa-solid fa-floppy-disk"></i> Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={styles.header}>
            <button
              onClick={volverALista}
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
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '30px',
              alignItems: 'start' 
            }}  
          >
            {/* Formulario de Ficha */}
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
                  <label style={styles.label}>Nombre / Razón Social</label>
                  <input
                    style={styles.formInput}
                    value={formData.nombre}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>CUIT</label>
                  <input
                    style={{ ...styles.formInput, backgroundColor: "#f8fafc" }}
                    value={formData.cuit}
                    disabled={true}
                  />
                </div>
                <div style={styles.sectionTitle}>Información de Contacto</div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Domicilio</label>
                  <input
                    style={styles.formInput}
                    value={formData.domicilio || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, domicilio: e.target.value })
                    }
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Teléfono 1</label>
                  <input
                    style={styles.formInput}
                    value={formData.telefono_1 || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono_1: e.target.value })
                    }
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Teléfono 2</label>
                  <input
                    style={styles.formInput}
                    value={formData.telefono_2 || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono_2: e.target.value })
                    }
                  />
                </div>
                <div style={styles.sectionTitle}>Información Complementaria</div>
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
                {/* SECCIÓN DE ESTADO TIPO SLIDE */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Estado de la cuenta</label>
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
                    {/* El Switch (Slide) */}
                    <div style={styles.switchTrack(formData.baja)}>
                      <div style={styles.switchThumb(formData.baja)}></div>
                    </div>

                    {/* Texto descriptivo */}
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
                {isEditing && (
                  <button
                    type="submit"
                    style={{
                      ...styles.btnGreen,
                      gridColumn: "1 / -1", // IMPORTANTE
                      justifyContent: "center",
                      marginTop: "10px",
                    }}
                  >
                    <i className="fa-solid fa-floppy-disk"></i> Guardar Todos
                    los Cambios
                  </button>
                )}
              </form>
            </div>

            {/* Documentos */}
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

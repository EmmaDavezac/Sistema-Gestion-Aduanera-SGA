import { useState, useEffect, useRef, useCallback } from "react";
import {
  getClientes,
  createCliente,
  updateCliente,
  getArchivos,
  uploadFile,
  downloadFile,
  deleteArchivo,
  getImportaciones,
  getExportaciones,
} from "../api/api";
import { validarCUIT } from "../utils/validaciones";
import SkeletonTable from "./SkeletonTable";

const GestionClientes = ({ onNotification, autoOpenForm, onFormOpened }) => {
  const [clientes, setClientes] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [importaciones, setImportaciones] = useState([]);
  const [exportaciones, setExportaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [view, setView] = useState("list");
  const [isEditing, setIsEditing] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const today = new Date().toISOString().split("T")[0];
  const [mostrarBaja, setMostrarBaja] = useState(false);
  const [filtroOperaciones, setFiltroOperaciones] = useState("Todos");
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
      const [c, a, imp, exp] = await Promise.all([
        getClientes(),
        getArchivos(),
        getImportaciones(),
        getExportaciones(),
      ]);
      setClientes(c);
      setArchivos(a);
      setImportaciones(imp);
      setExportaciones(exp);
      if (clienteSeleccionado) {
        const actualizado = c.find((item) => item.cuit === clienteSeleccionado.cuit);
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
    if (autoOpenForm) {
      setView("form");
      setIsEditing(false);
      setIsReadOnly(false);
      onFormOpened?.();
    }
  }, [autoOpenForm]);

  useEffect(() => {
    if (!cargadoRef.current) {
      cargarDatos();
      cargadoRef.current = true;
    }
  }, [cargarDatos]);

  const tieneOperacionesActivas = (cuit) =>
    importaciones.some((i) => i.cliente === cuit && !i.baja) ||
    exportaciones.some((e) => e.cliente === cuit && !e.baja);

  const handleFileUpload = async () => {
    if (filesToUpload.length === 0 || !clienteSeleccionado) return;
    const uploadPromises = filesToUpload.map((file) => {
      const fData = new FormData();
      fData.append("archivo", file);
      fData.append("tipo", 1);
      fData.append("cuit_cliente", clienteSeleccionado.cuit);
      fData.append("nombre", file.name);
      return uploadFile(fData);
    });
    try {
      await Promise.all(uploadPromises);
      setFilesToUpload([]);
      await cargarDatos();
      onNotification("Archivos subidos con éxito", "success");
    } catch (err) {
      console.error("Error al subir archivos:", err.response?.data);
      onNotification("Error al subir archivos", "error");
    }
  };

  const handleEliminarArchivo = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este archivo?")) return;
    try {
      await deleteArchivo(id);
      await cargarDatos();
      onNotification("Archivo eliminado", "success");
    } catch (err) {
      console.error("Error al eliminar archivo:", err.response?.data);
      onNotification("Error al eliminar", "error");
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const coincideBusqueda =
      c.cuit.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideBaja = mostrarBaja ? true : !c.baja;
    const coincideOperaciones =
      filtroOperaciones === "Todos" ? true :
      filtroOperaciones === "Con operaciones" ? tieneOperacionesActivas(c.cuit) :
      !tieneOperacionesActivas(c.cuit);
    return coincideBusqueda && coincideBaja && coincideOperaciones;
  });

  const esFechaValida = (fechaInput) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(fechaInput);
    fechaSeleccionada.setMinutes(
      fechaSeleccionada.getMinutes() + fechaSeleccionada.getTimezoneOffset()
    );
    fechaSeleccionada.setHours(0, 0, 0, 0);
    return fechaSeleccionada <= hoy;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCUIT(formData.cuit)) {
      onNotification("El CUIT no es válido. Verifique los dígitos.", "error");
      return;
    }
    if (!esFechaValida(formData.fecha_inicio_actividad)) {
      onNotification("La fecha de inicio de actividad no puede ser mayor a la fecha actual.", "error");
      return;
    }
    try {
      if (isEditing && clienteSeleccionado) {
        const datosParaEnviar = { ...formData };
        delete datosParaEnviar.cuit;
        await updateCliente(clienteSeleccionado.cuit, datosParaEnviar);
        onNotification("¡Actualizado con éxito!", "success");
        await cargarDatos();
        setIsReadOnly(true);
      } else {
        await createCliente(formData);
        if (filesToUpload.length > 0) {
          const uploadPromises = filesToUpload.map((file) => {
            const fData = new FormData();
            fData.append("archivo", file);
            fData.append("tipo", 1);
            fData.append("cuit_cliente", formData.cuit);
            fData.append("nombre", file.name);
            return uploadFile(fData);
          });
          try {
            await Promise.all(uploadPromises);
            setFilesToUpload([]);
            onNotification(`${filesToUpload.length} archivos subidos con éxito`, "success");
          } catch (fileErr) {
            onNotification("Error al subir algunos archivos", "error");
          }
        }
        onNotification("¡Cliente registrado con éxito!", "success");
        await cargarDatos();
        volverALista(true);
      }
    } catch (err) {
      console.error("Estructura completa del error:", err.response?.data);
      const mensajeBackend = err.response?.data?.message || err.response?.data?.error;
      if (mensajeBackend) {
        onNotification(mensajeBackend, "error");
      } else if (err.response?.status === 400) {
        onNotification("Error en los datos: El CUIT ya registrado", "error");
      } else {
        onNotification("Error de comunicación con el servidor", "error");
      }
    }
  };

  const verDetalle = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(cliente);
    setIsEditing(true);
    setIsReadOnly(true);
    setView("form");
  };

  const volverALista = (saltarConfirmacion = false) => {
    if (saltarConfirmacion || window.confirm("¿Desea volver al listado?")) {
      setClienteSeleccionado(null);
      setIsEditing(false);
      setIsReadOnly(true);
      setView("list");
      setFilesToUpload([]);
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
      marginTop: "25px",
      marginBottom: "10px",
      paddingBottom: "8px",
      borderBottom: "2px solid #3182ce",
      color: "#2d3748",
      fontSize: "16px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    switchTrack: (active) => ({
      width: "44px",
      height: "24px",
      backgroundColor: active ? "#3182ce" : "#cbd5e0",
      borderRadius: "12px",
      position: "relative",
      transition: "background-color 0.3s ease",
      border: `2px solid ${active ? "#2b6cb0" : "#a0aec0"}`,
      flexShrink: 0,
    }),
    switchThumb: (active) => ({
      width: "16px",
      height: "16px",
      backgroundColor: "white",
      borderRadius: "50%",
      position: "absolute",
      top: "2px",
      left: active ? "22px" : "2px",
      transition: "left 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      pointerEvents: "none",
    }),
    statusTrack: (baja) => ({
      width: "50px",
      height: "26px",
      backgroundColor: baja ? "#fed7d7" : "#c6f6d5",
      borderRadius: "15px",
      position: "relative",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: `2px solid ${baja ? "#e53e3e" : "#38a169"}`,
    }),
    statusThumb: (baja) => ({
      width: "18px",
      height: "18px",
      backgroundColor: baja ? "#e53e3e" : "#38a169",
      borderRadius: "50%",
      position: "absolute",
      top: "2px",
      left: baja ? "2px" : "26px",
      transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      pointerEvents: "none",
    }),
    statusLabel: (isBaja) => ({
      fontSize: "13px",
      fontWeight: "bold",
      color: isBaja ? "#c53030" : "#2f855a",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }),
  };

  const dragDropZone = (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = "#ebf4ff";
        e.currentTarget.style.borderColor = "#3182ce";
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#f8fafc";
        e.currentTarget.style.borderColor = "#cbd5e0";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
          setFilesToUpload((prev) => [...prev, ...droppedFiles]);
          onNotification(`${droppedFiles.length} archivo(s) preparado(s).`, "success");
        }
      }}
      onClick={() => document.getElementById("file-input-clientes").click()}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "15px",
        backgroundColor: "#f8fafc",
        padding: "40px 20px",
        borderRadius: "12px",
        border: "2px dashed #cbd5e0",
        textAlign: "center",
        transition: "all 0.2s ease",
        cursor: "pointer",
        position: "relative",
        marginTop: "20px",
        marginBottom: "20px",
      }}
    >
      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "48px", color: "#3182ce" }}></i>
      <div>
        <p style={{ fontSize: "16px", fontWeight: "600", color: "#2d3748", margin: "0" }}>
          Arrastra la documentación aquí
        </p>
        <p style={{ fontSize: "13px", color: "#718096", marginTop: "5px" }}>
          O haz clic para seleccionar un archivo
        </p>
      </div>
      <input
        id="file-input-clientes"
        type="file"
        multiple
        onChange={(e) => {
          setFilesToUpload((prev) => [...prev, ...Array.from(e.target.files)]);
        }}
        style={{ display: "none" }}
      />
      {filesToUpload.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px", justifyContent: "center" }}>
          {filesToUpload.map((file, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#fff",
                padding: "5px 15px",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <span style={{ fontSize: "13px", color: "#2d3748" }}>
                <i className="fa-solid fa-file-pdf" style={{ color: "#e53e3e", marginRight: "5px" }}></i>
                {file.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilesToUpload(filesToUpload.filter((_, i) => i !== index));
                }}
                style={{ border: "none", background: "none", color: "#a0aec0", cursor: "pointer" }}
              >
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            </div>
          ))}
          {isEditing && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileUpload();
              }}
              style={{ ...styles.btnGreen, marginTop: "10px", width: "100%", justifyContent: "center" }}
            >
              <i className="fa-solid fa-cloud-arrow-up"></i> Subir
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      {view === "list" ? (
        <div>
          <div style={styles.header}>
            <div style={styles.searchWrapper}>
              <i className="fa-solid fa-magnifying-glass" style={styles.searchIcon}></i>
              <input
                style={styles.input}
                placeholder="Buscar por nombre o CUIT..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button
              style={styles.btnGreen}
              onClick={() => {
                setIsEditing(false);
                setIsReadOnly(false);
                setView("form");
              }}
            >
              <i className="fa-solid fa-plus"></i>Registrar
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "15px", flexWrap: "wrap" }}>
            <div
              onClick={() => setMostrarBaja(!mostrarBaja)}
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none", flexShrink: 0 }}
            >
              <div style={styles.switchTrack(mostrarBaja)}>
                <div style={styles.switchThumb(mostrarBaja)} />
              </div>
              <span style={{ fontSize: "13px", color: mostrarBaja ? "#2b6cb0" : "#718096", fontWeight: mostrarBaja ? "600" : "400", transition: "color 0.3s" }}>
                Mostrar inactivos
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { value: "Todos", label: "Todos" },
                { value: "Con operaciones", label: "Con operaciones" },
                { value: "Sin operaciones", label: "Sin operaciones" },
              ].map((op) => (
                <button
                  key={op.value}
                  onClick={() => setFiltroOperaciones(op.value)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: `1px solid ${filtroOperaciones === op.value ? "#3182ce" : "#cbd5e0"}`,
                    backgroundColor: filtroOperaciones === op.value ? "#ebf4ff" : "transparent",
                    color: filtroOperaciones === op.value ? "#2b6cb0" : "#718096",
                    fontWeight: filtroOperaciones === op.value ? "600" : "400",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {clientesFiltrados.map((c) => (
            <div key={c.cuit} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div style={{ width: "45px", height: "45px", borderRadius: "50%", backgroundColor: "#ebf4ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#3182ce" }}>
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <strong style={{ fontSize: "16px", color: "#2d3748" }}>{c.nombre}</strong>
                      {c.baja
                        ? <span style={styles.badge("#fff5f5", "#c53030")}>Inactivo</span>
                        : <span style={styles.badge("#f0fff4", "#22543d")}>Activo</span>
                      }
                      {tieneOperacionesActivas(c.cuit) && (
                        <span style={styles.badge("#fffeb3", "#856404")}>Con operaciones</span>
                      )}
                    </div>
                    <p style={{ margin: "4px 0 0 0", color: "#718096", fontSize: "13px" }}>
                      <i className="fa-solid fa-id-card" style={{ marginRight: "5px" }}></i>
                      CUIT: {c.cuit} |
                      <i className="fa-solid fa-location-dot" style={{ marginLeft: "10px", marginRight: "5px" }}></i>
                      {c.domicilio || "Sin domicilio"}
                    </p>
                  </div>
                </div>
                <button title="Ver Detalles" style={styles.btnAction("#3182ce")} onClick={() => verDetalle(c)}>
                  <i className="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>
          ))}

          {loading ? (
            <SkeletonTable rows={4} />
          ) : (
            clientesFiltrados.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#a0aec0", backgroundColor: "#fff", borderRadius: "12px", border: "2px dashed #e2e8f0" }}>
                <i className="fa-solid fa-box-open" style={{ fontSize: "50px", marginBottom: "15px", color: "#cbd5e0" }}></i>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#4a5568" }}>No hay coincidencias</h3>
                <p style={{ marginTop: "8px" }}>Prueba con otro nombre o CUIT.</p>
              </div>
            )
          )}
        </div>
      ) : (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={styles.header}>
            <button
              onClick={() => volverALista(false)}
              style={{ border: "none", background: "none", color: "#3182ce", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <i className="fa-solid fa-arrow-left"></i> Volver al listado
            </button>
            {isEditing && (
              <button
                style={{ ...styles.btnBlue, backgroundColor: isReadOnly ? "#3182ce" : "#718096" }}
                onClick={() => setIsReadOnly(!isReadOnly)}
              >
                <i className={isReadOnly ? "fa-solid fa-pen-to-square" : "fa-solid fa-xmark"}></i>
                {isReadOnly ? "Editar" : "Cancelar"}
              </button>
            )}
          </div>

          <div style={styles.card}>
            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}
            >
              <div style={styles.sectionTitle}>Datos Identificatorios</div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>CUIT *</label>
                <input
                  type="text"
                  pattern="[0-9]{11}"
                  style={{ ...styles.formInput, backgroundColor: isEditing ? "#f8fafc" : "#fff" }}
                  placeholder="Ej: 20123456789"
                  value={formData.cuit}
                  disabled={isEditing}
                  onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Razón Social / Nombre *</label>
                <input
                  style={styles.formInput}
                  placeholder="Ej: Logística S.A."
                  value={formData.nombre}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div style={styles.sectionTitle}>Información de Contacto</div>

              <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Domicilio *</label>
                <input
                  style={styles.formInput}
                  placeholder="Calle, Número, Localidad"
                  value={formData.domicilio || ""}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Teléfono Principal *</label>
                <input
                  type="number"
                  style={styles.formInput}
                  placeholder="Ej: 0113438401246"
                  value={formData.telefono_1 || ""}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, telefono_1: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Teléfono Secundario</label>
                <input
                  type="number"
                  style={styles.formInput}
                  placeholder="Opcional"
                  value={formData.telefono_2 || ""}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, telefono_2: e.target.value })}
                />
              </div>

              <div style={styles.sectionTitle}>Otros Datos</div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Fecha Inicio Actividad *</label>
                <input
                  type="date"
                  style={styles.formInput}
                  value={formData.fecha_inicio_actividad ? formData.fecha_inicio_actividad.split("T")[0] : ""}
                  max={today}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio_actividad: e.target.value })}
                  required
                />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Observaciones</label>
                <textarea
                  style={{ ...styles.formInput, height: "80px", resize: "none" }}
                  placeholder="Notas adicionales sobre el cliente..."
                  value={formData.observaciones || ""}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </div>

              {isAdmin && isEditing && (
                <>
                  <div style={styles.sectionTitle}>Estado Lógico del Cliente</div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: "15px",
                        padding: "12px", backgroundColor: "#f8fafc",
                        borderRadius: "10px", border: "1px solid #edf2f7",
                        cursor: isReadOnly ? "default" : "pointer", width: "fit-content",
                      }}
                      onClick={() => !isReadOnly && setFormData({ ...formData, baja: !formData.baja })}
                    >
                      <div style={styles.statusTrack(formData.baja)}>
                        <div style={styles.statusThumb(formData.baja)} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={styles.statusLabel(formData.baja)}>
                          {formData.baja ? "Inactivo" : "Activo"}
                        </span>
                        <span style={{ fontSize: "11px", color: "#718096" }}>
                          {isReadOnly ? "Modo lectura" : "Haz clic para cambiar el estado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!isEditing && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={styles.sectionTitle}>Documentación</div>
                  {dragDropZone}
                </div>
              )}

              {(!isEditing || !isReadOnly) && (
                <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                  <button
                    type="submit"
                    style={{ ...styles.btnGreen, width: "100%", justifyContent: "center", padding: "15px", fontSize: "16px" }}
                  >
                    <i className="fa-solid fa-floppy-disk"></i> Guardar
                  </button>
                </div>
              )}
            </form>

            {isEditing && (
              <div style={{ marginTop: "40px", borderTop: "2px solid #eee", paddingTop: "20px" }}>
                <div style={styles.sectionTitle}>Documentación</div>
                {!isReadOnly && dragDropZone}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "15px" }}>
                  {archivos
                    .filter((a) => a.cuit_cliente === clienteSeleccionado?.cuit)
                    .map((a) => (
                      <div
                        key={a.id}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #edf2f7", borderRadius: "8px" }}
                      >
                        <span style={{ fontSize: "13px", color: "#4a5568", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
                          <i className="fa-solid fa-file-pdf" style={{ marginRight: "8px", color: "#e53e3e" }}></i>
                          {a.nombre}
                        </span>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button onClick={() => downloadFile(a.id, a.nombre)} style={styles.btnAction("#3182ce")} title="Descargar">
                            <i className="fa-solid fa-download"></i>
                          </button>
                          {!isReadOnly && (
                            <button onClick={() => handleEliminarArchivo(a.id)} style={styles.btnAction("#e53e3e")} title="Eliminar">
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionClientes;
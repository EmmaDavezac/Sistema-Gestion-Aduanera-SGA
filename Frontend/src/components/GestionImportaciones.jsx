import { useState, useEffect, useRef, useCallback } from "react";
import {
  getImportaciones,
  createImportacion,
  updateImportacion,
  getClientes,
  getAduanas,
  getArchivosByImportacion,
  uploadFile,
  deleteArchivo,
} from "../api/api";
import SkeletonTable from "./SkeletonTable";
import { verificarDestinacionDuplicada } from "../utils/validaciones";
const GestionImportaciones = ({ onNotification, autoOpenForm, onFormOpened })  => {
  const [importaciones, setImportaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [aduanas, setAduanas] = useState([]);
  const [archivos, setArchivos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [view, setView] = useState("list");
  const [isEditing, setIsEditing] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [filtroNombreCliente, setFiltroNombreCliente] = useState("");
  const [mostrarBaja, setMostrarBaja] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const [formData, setFormData] = useState({
    numero_destinacion: "",
    condicion_venta: "",
    divisa: "",
    numero_factura: "",
    pais_destino: "",
    unitario_en_divisa: "",
    unidad: "",
    cantidad_unidades: "",
    fob_total_en_divisa: "",
    fob_total_en_dolar: "",
    numeracion: "",
    baja: false,
    aduana: "",
    cliente: "",
    puerto_embarque: "",
    oficializacion: "",

    estado: "",
  });
  const cargadoRef = useRef(false);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [dataImp, dataCli, dataAdu] = await Promise.all([
        getImportaciones(),
        getClientes(),
        getAduanas(),
      ]);
      setImportaciones(dataImp);
      setClientes(dataCli);
      setAduanas(dataAdu);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      onNotification("Error al cargar datos: " + (err.response?.data?.detail || "Intente nuevamente"), "error");
    } finally {
      setLoading(false);
    }
  }, []);
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr; 
    return date.toISOString().split('T')[0]; 
  };
  const cargarArchivos = useCallback(async (id) => {
    if (!id) return;
    try {
      const data = await getArchivosByImportacion(id);
      setArchivos(data);
    } catch (err) {
      console.error("Error al cargar archivos:", err);
    }
  }, []);
 
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : parseFloat(value);

    setFormData((prev) => {
      const newData = { ...prev, [name]: numValue };
      if (name === "cantidad_unidades" || name === "unitario_en_divisa") {
        newData.fob_total_en_divisa =
          newData.cantidad_unidades * newData.unitario_en_divisa;
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const camposObligatorios = [
      "cliente",
      "numero_destinacion",
      "divisa",
      "aduana",
      "cantidad_unidades",
      "unitario_en_divisa",
      "fob_total_en_divisa",
      "fob_total_en_dolar",
    ];
    const faltantes = camposObligatorios.filter((campo) => !formData[campo]);
    if (faltantes.length > 0) {
      onNotification(`Faltan campos obligatorios: ${faltantes.join(", ")}`, "error");
      
      return;
    }
    const esDuplicado = await verificarDestinacionDuplicada(
    formData.numero_destinacion, 
    isEditing ? selectedId : null 
  );

  if (esDuplicado) {
    onNotification("El número de destinación ya pertenece a otra operación", "error");
    return; }
    if (
      !window.confirm(
        `¿Desea ${isEditing ? "actualizar" : "registrar"} esta importación?`
      )
    )
      return;
    try {
      const dataToSend = {
        ...formData,
        aduana: formData.aduana ? parseInt(formData.aduana) : null,
        cliente: formData.cliente || null, 
        baja: formData.baja || false,
        cantidad_unidades: formData.cantidad_unidades === "" ? 0 : parseInt(formData.cantidad_unidades),
        unitario_en_divisa: formData.unitario_en_divisa === "" ? 0.0 : parseFloat(formData.unitario_en_divisa),
        fob_total_en_divisa: formData.fob_total_en_divisa === "" ? 0.0 : parseFloat(formData.fob_total_en_divisa),
        fob_total_en_dolar: formData.fob_total_en_dolar === "" ? 0.0 : parseFloat(formData.fob_total_en_dolar),
        oficializacion: formatDate(formData.oficializacion),
      };
      let importacionId = selectedId;
      if (isEditing && selectedId) {
        await updateImportacion(selectedId, dataToSend);
        onNotification("Importación actualizada con éxito", "success");
      } else {
        dataToSend.estado= "Inicializada"; 
        dataToSend.baja = false;
        const nuevaImportacion = await createImportacion(dataToSend);
        importacionId = nuevaImportacion?.id || nuevaImportacion?.data?.id;
        onNotification("Importación registrada con éxito", "success");
      }
      if (filesToUpload.length > 0 && importacionId) {
        const uploadPromises = filesToUpload.map((file) => {
          const fileData = new FormData();
          fileData.append("archivo", file);
          fileData.append("id_importacion", importacionId);
          fileData.append("tipo", 2); 
          fileData.append("nombre", file.name);
          return uploadFile(fileData);
        });
  
        try {
          await Promise.all(uploadPromises);
          setFilesToUpload([]);
          onNotification(`${filesToUpload.length} archivos subidos con éxito`, "success");
        } catch (fileErr) {
          onNotification("Error al subir algunos archivos", "error");
        }
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      await cargarDatos();
      volverALista(true);
    } catch (err) {
      console.error("Error al guardar importación:", err.response?.data);
      onNotification("Error al guardar importación: " + (err.response?.data?.detail || "Verifique los datos"), "error");
      
    }
  };

  const handleFileUpload = async () => {
    if (filesToUpload.length === 0 || !selectedId) return;
    
    const uploadPromises = filesToUpload.map((file) => {
      const data = new FormData();
      data.append("archivo", file);
      data.append("id_importacion", selectedId);
      data.append("tipo", 2);
      data.append("nombre", file.name);
      return uploadFile(data);
    });

    try {
      await Promise.all(uploadPromises);
      setFilesToUpload([]); 
      cargarArchivos(selectedId);
      onNotification("Archivos subidos con éxito", "success");
    } catch (err) {
      onNotification("Error al subir archivos", "error");
    }
  };

  const handleFileDelete = async (id) => {
    if (!window.confirm("¿Eliminar este documento?")) return;
    try {
      await deleteArchivo(id);
      cargarArchivos(selectedId);
    } catch (err) {
      onNotification("Error al eliminar archivo: " + (err.response?.data?.detail || "Intente nuevamente"), "error");
    }
  };

  const handleVerDetalle = async (imp) => {
    setSelectedId(imp.id);
    setFormData({
      ...imp,
      aduana: imp.aduana?.id || imp.aduana,
      cliente: imp.cliente,
    });
    setIsEditing(true);
    setIsReadOnly(true);
    setView("form");
    try {
      const data = await getArchivosByImportacion(imp.id);
      setArchivos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const volverALista = (saltarConfirmacion) => {
    if (saltarConfirmacion || window.confirm("¿Desea volver al listado?"))
 {
    setView("list");
    setIsEditing(false);
    setSelectedId(null);
    setArchivos([]);
    setFilesToUpload([]);
    setFormData({
      numero_destinacion: "",
      condicion_venta: "",
      vendedor: "",
      puerto_embarque: "",
      numero_factura: "",
      pais_origen: "",
      pais_destino: "",
      divisa: "",
      unitario_en_divisa: 0.0,
      unidad: "",
      cantidad_unidades: 0,
      fob_total_en_divisa: 0.0,
      fob_total_en_dolar: 0.0,
      numeracion: "",
      estado: "",
      baja: false,
      aduana: "",
      cliente: "",
      oficializacion: "",
    });
    window.scrollTo(0, 0);
  }};

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
      backgroundColor: isReadOnly ? "#f8fafc" : "#fff",
      color: isReadOnly ? "#4a5568" : "#2d3748",
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
      marginBottom: "5px",
      display: "block",
      whiteSpace: "nowrap",
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
    statusLabel: (active) => ({
      fontSize: "13px",
      fontWeight: "bold",
      color: active ? "#c53030" : "#2f855a",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }),
  };
const impFiltradas = importaciones.filter(i => {
  const t = busqueda.toLowerCase();
  const coincideBusqueda = 
    i.numero_destinacion?.toLowerCase().includes(t) ||
    i.cliente_nombre?.toLowerCase().includes(t) ||
    i.cliente?.toLowerCase().includes(t) ||
    i.oficializacion?.toLowerCase().includes(t);

  const coincideEstado =
    filtroEstado === "Todas" ? true : i.estado === filtroEstado;

  return coincideBusqueda && coincideEstado && (mostrarBaja ? true : !i.baja);
});

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
                placeholder="Buscar por CUIT del cliente, Vendedor o número de destinación..."
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
 style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}
>
  <div style={{
    width: "44px",
    height: "24px",
    backgroundColor: mostrarBaja ? "#3182ce" : "#cbd5e0",
    borderRadius: "12px",
    position: "relative",
    transition: "background-color 0.3s ease",
    border: `2px solid ${mostrarBaja ? "#2b6cb0" : "#a0aec0"}`,
    flexShrink: 0,
  }}>
    <div style={{
      width: "16px",
      height: "16px",
      backgroundColor: "white",
      borderRadius: "50%",
      position: "absolute",
      top: "2px",
      left: mostrarBaja ? "22px" : "2px",
      transition: "left 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }}/>
  </div>
  <span style={{
    fontSize: "13px",
    color: mostrarBaja ? "#2b6cb0" : "#718096",
    fontWeight: mostrarBaja ? "600" : "400",
    transition: "color 0.3s",
  }}>
    Mostrar dadas de baja
  </span>

</div>
<div style={{ display: "flex", gap: "8px" }}>
            {[
              { value: "Todas", label: "Todas" },
              { value: "Inicializada", label: "Inicializadas" },
              { value: "En Proceso", label: "En Proceso" },
              { value: "Finalizada", label: "Finalizadas" },
            ].map((op) => (
              <button
                key={op.value}
                onClick={() => setFiltroEstado(op.value)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: `1px solid ${filtroEstado === op.value ? "#3182ce" : "#cbd5e0"}`,
                  backgroundColor:
                    filtroEstado === op.value ? "#ebf4ff" : "transparent",
                  color: filtroEstado === op.value ? "#2b6cb0" : "#718096",
                  fontWeight: filtroEstado === op.value ? "600" : "400",
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
          {impFiltradas.map((imp) => (
            <div key={imp.id} style={styles.card}>
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
                    <i className="fa-solid fa-ship"></i>
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
                        ID: {imp.id}
                      </strong>
                      <span
                        style={styles.badge(
                          imp.estado === "Finalizado" ? "#f0fff4" : "#fffeb3",
                          imp.estado === "Finalizado" ? "#22543d" : "#856404"
                        )}
                      >
                        {imp.estado}
                      </span>
                      <span style={{color: imp.baja ? "#c53030" : "#2f855a", fontWeight: "bold", fontSize: "12px"}}
                        >
                          {imp.baja ? "Dada de baja":""}
                        </span>
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
                        style={{ marginLeft: "10px", marginRight: "5px" }}
                      ></i>
                      CUIT Cliente: {imp.cliente || "No Cargado"} |
                      <i
                        className="fa-solid fa-user-tie"
                        style={{ marginLeft: "10px", marginRight: "5px" }}
                      ></i>
                      Vendedor: {imp.vendedor || "No Cargado"} |
                      <i
                        className="fa-solid fa-globe"
                        style={{ marginLeft: "10px", marginRight: "5px" }}
                      ></i>
                      {imp.pais_origen || "No Cargado"} →{" "}
                      {imp.pais_destino || "No Cargado"} |
                      <i
                        className="fa-solid fa-user-tie"
                        style={{ marginLeft: "10px", marginRight: "5px" }}
                      ></i>
                      N° Destinación: {imp.numero_destinacion || "No Cargado"}
                      
                    </p>
                  </div>
                </div>
                <button
                  title="Ver Detalles"
                  style={styles.btnAction("#3182ce")}
                  onClick={() => handleVerDetalle(imp)}
                >
                  <i className="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>
          ))}
          {loading ? (
            <SkeletonTable rows={4} />
          ) : (
            impFiltradas.length === 0 && (
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
                  Prueba con otro CUIT, vendedor o número de destinación .
                </p>
              </div>
            )
          )}
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
              {isEditing && (
                <button
                  style={{
                    ...styles.btnBlue,
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
                  {isReadOnly ? "Editar" : "Cancelar"}
                </button>
              )}
            </div>
          </div>
          <div style={styles.card}>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "25px",
                alignItems: "end",
              }}
            >
              <div style={styles.sectionTitle}>Datos Generales</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label style={styles.label}>Cliente *</label>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => setShowClienteModal(true)}
                      style={{
                        fontSize: "11px",
                        color: "#3182ce",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-search"></i> Buscar Cliente
                    </button>
                  )}
                </div>
                <select
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                  required
                >
                  <option value="">Seleccione Cliente...</option>
                  {clientes
                    .filter((c) => c.baja === false)
                    .map((c) => (
                      <option key={c.cuit} value={c.cuit}>
                        {c.nombre} ({c.cuit})
                      </option>
                    ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>N° Destinación *</label>
                <input
                  name="numero_destinacion"
                  value={formData.numero_destinacion}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                  required
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>N° Factura *</label>
                <input
                  
                  name="numero_factura"
                  value={formData.numero_factura}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                  required
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Vendedor</label>
                <input
                  name="vendedor"
                  value={formData.vendedor}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Aduana *</label>
                <select
                  required
                  name="aduana"
                  value={formData.aduana}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                >
                  <option value="">Seleccione Aduana...</option>
                  {aduanas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Oficialización</label>
                <input
                  type="date"
                  name="oficializacion"
                  value={formData.oficializacion}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                />
              </div>
              {isEditing && (
              <div style={{ display: "flex", flexDirection: "column" }}>
        
                <label style={styles.label}>Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                >
                  <option value="Inicializada">Inicializada</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Finalizada">Finalizada</option>
                </select>
              </div>
              )}
              <div style={styles.sectionTitle}>Logística y Origen</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>País/Provincia de Origen</label>
                <input
                  name="pais_origen"
                  value={formData.pais_origen}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Destino</label>
                <input
                  name="pais_destino"
                  value={formData.pais_destino}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Puerto Embarque</label>
                <input
                  name="puerto_embarque"
                  value={formData.puerto_embarque}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                />
              </div>
             
              <div style={styles.sectionTitle}>Detalle de Mercadería</div>

<div style={{ display: "flex", flexDirection: "column" }}>
  <label style={styles.label}>Cantidad de unidades *</label>
  <input
    type="number"
    min="1"
    step="1"
    name="cantidad_unidades"
    value={formData.cantidad_unidades}
    onChange={handleNumericChange}
    style={styles.formInput}
    disabled={isReadOnly}
    required
  />
</div>
<div style={{ display: "flex", flexDirection: "column" }}>
  <label style={styles.label}>Unidad *</label>
  <select
    name="unidad"
    value={formData.unidad}
    onChange={handleInputChange}
    placeholder="Ej: M, KG"
    style={styles.formInput}
    disabled={isReadOnly}
    required
  >
    <option value="">Seleccione Unidad...</option>
    <option value="KG">KG - Kilogramo</option>
    <option value="L">L - Litro</option>
    <option value="M">M - Metro</option>
    <option value="PZA">PZA - Pieza</option>
    <option value="TON">TON - Tonelada</option>
    <option value="CBM">CBM - Metro Cúbico</option>
    <option value="SET">SET - Set</option>
    <option value="ROL">ROL - Rollo</option>
    <option value="PAR">PAR - Par</option>
    <option value="JUE">JUE - Juego</option>
    <option value="BUL">BUL - Bulto</option>
    <option value="SOB">SOB - Sobre</option>
    <option value="CJA">CJA - Caja</option>
    <option value="BAG">BAG - Bolsa</option>
  </select>
</div>
<div style={{ display: "flex", flexDirection: "column" }}>
  <label style={styles.label}>Unitario en Divisa *</label>
  <input
    type="number"
    min="0"
    name="unitario_en_divisa"
    value={formData.unitario_en_divisa}
    onChange={handleNumericChange}
    style={styles.formInput}
    disabled={isReadOnly}
    required
  />
</div>
              <div style={styles.sectionTitle}>Valores Comerciales</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Divisa *</label>
                <select
                  name="divisa"
                  value={formData.divisa}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                  required
                >
                  <option value="">Seleccione Divisa...</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="ARS">ARS</option>
                  <option value="BRL">BRL</option>
                  <option value="CNY">CNY</option>
                  <option value="JPY">JPY</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>FOB Total Divisa *</label>
                <input
                  type="number"
                  min="0"
                  name="fob_total_en_divisa"
                  value={formData.fob_total_en_divisa}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                  required
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>FOB Total USD *</label>
                <input
                  type="number"
                  min="0"
                  name="fob_total_en_dolar"
                  value={formData.fob_total_en_dolar}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                  required
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Condición de Venta *</label>
                <select
                  name="condicion_venta"
                  value={formData.condicion_venta}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  disabled={isReadOnly}
                  required
                >
                  <option value="">Condición de Venta...</option>
                  <option value="CFR">CFR</option>
                  <option value="CIF">CIF</option>
                  <option value="CIP">CIP</option>
                  <option value="CPT">CPT</option>
                  <option value="DAP">DAP</option>
                  <option value="DAT">DAT</option>
                  <option value="DDP">DDP</option>
                  <option value="EXW">EXW</option>
                  <option value="FAS">FAS</option>
                  <option value="FCA">FCA</option>
                  <option value="FOB">FOB</option>
                  <option value="MUL">MUL</option>
                </select>
              </div>
            
             
             

             

              {isAdmin && isEditing &&  (
                <>
                  <div style={styles.sectionTitle}>
                    Estado Lógico de la operación
                  </div>
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      marginTop: "10px",
                    }}
                  >
                    <div
                      tabIndex={0}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        padding: "12px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "10px",
                        border: "1px solid #edf2f7",
                        cursor: isReadOnly ? "default" : "pointer",
                        width: "fit-content",
                      }}
                      onClick={() =>
                        !isReadOnly &&
                        setFormData({ ...formData, baja: !formData.baja })
                      }
                    >
                      <div style={styles.switchTrack(formData.baja)}>
                        <div style={styles.switchThumb(formData.baja)}></div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={styles.statusLabel(formData.baja)}>
                          {formData.baja ? "Dada de baja" : "Activa"}
                        </span>
                        <span style={{ fontSize: "11px", color: "#718096" }}>
                          {isReadOnly
                            ? "Modo lectura"
                            : "Haz clic para cambiar el estado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {!isEditing && (
  <div 
    style={{ 
      gridColumn: "1 / -1", 
      marginTop: '20px',
      marginBottom: '30px', 
    }}
  >
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
          setFilesToUpload(prev => [...prev, ...droppedFiles]);
          onNotification(`${droppedFiles.length} archivo(s) preparado(s).`, "success");
        }
      }}
      onClick={() => document.getElementById('file-input-main').click()}
      style={{
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px', 
        backgroundColor: '#f8fafc', 
        padding: '40px 20px', 
        borderRadius: '12px',
        border: '2px dashed #cbd5e0',
        textAlign: 'center',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative' 
      }}
    >
      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '48px', color: '#3182ce' }}></i>
      <div>
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', margin: '0' }}>
          Arrastra la documentación aquí
        </p>
        <p style={{ fontSize: '13px', color: '#718096', marginTop: '5px' }}>
          O haz clic para seleccionar un archivo
        </p>
      </div>

      <input 
  id="file-input-main"
  type="file" 
  multiple
  onChange={(e) => {
    const nuevosArchivos = Array.from(e.target.files);
    setFilesToUpload((prev) => [...prev, ...nuevosArchivos]);
  }} 
  style={{ display: 'none' }} 
/>

{filesToUpload.length > 0 && (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px', justifyContent: 'center' }}>
    {filesToUpload.map((file, index) => (
      <div 
        key={index}
        style={{ 
          display: 'flex', alignItems: 'center', gap: '10px',
          backgroundColor: '#fff', padding: '5px 15px', borderRadius: '20px',
          border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <span style={{ fontSize: '13px', color: '#2d3748' }}>
          <i className="fa-solid fa-file-pdf" style={{ color: '#e53e3e', marginRight: '5px' }}></i> 
          {file.name}
        </span>
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFilesToUpload(filesToUpload.filter((_, i) => i !== index));
          }} 
          style={{ border: 'none', background: 'none', color: '#a0aec0', cursor: 'pointer' }}
        >
          <i className="fa-solid fa-circle-xmark"></i>
        </button>
      </div>
    ))}
  </div>
)}
    </div>
  </div>
)}
              {!isReadOnly && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    marginTop: "20px",
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      ...styles.btnBlue,
                      backgroundColor: "#2ecc71",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <i className="fa-solid fa-floppy-disk"></i> Guardar
                  </button>
                </div>
              )}
            </form>

            {isEditing && (
              <div
                style={{
                  marginTop: "40px",
                  borderTop: "2px solid #eee",
                  paddingTop: "20px",
                }}
              >
                <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>
                  <i
                    className="fa-solid fa-folder-open"
                    style={{ color: "#3182ce", marginRight: "10px" }}
                  ></i>
                  Documentación
                </h3>
                {!isReadOnly && (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                   onDrop={(e) => {
  e.preventDefault();
  const droppedFiles = Array.from(e.dataTransfer.files); 
  if (droppedFiles.length > 0) {
    setFilesToUpload(prev => [...prev, ...droppedFiles]);
    onNotification(`${droppedFiles.length} archivo(s) preparado(s).`, "success");
  }
}}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginBottom: "20px",
                      backgroundColor: "#f8fafc",
                      padding: "20px",
                      borderRadius: "8px",
                      border: "2px dashed #cbd5e0",
                      textAlign: "center",
                    }}
                  >
                    <i
                      className="fa-solid fa-cloud-arrow-up"
                      style={{ fontSize: "24px", color: "#718096" }}
                    ></i>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#718096",
                        margin: "5px 0",
                      }}
                    >
                      Arrastra un archivo aquí o selecciona uno
                    </p>
                    <input
  type="file"
  multiple
  onChange={(e) => setFilesToUpload(prev => [...prev, ...Array.from(e.target.files)])}
/>
                    {filesToUpload.length > 0 && (
  <div style={{ marginTop: '10px', fontSize: '13px', color: '#4a5568' }}>
    <strong>Archivos listos para subir:</strong>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {filesToUpload.map((file, idx) => (
        <li key={idx}>
          <i className="fa-solid fa-file-circle-check" style={{ color: '#48bb78', marginRight: '5px' }}></i>
          {file.name}
        </li>
      ))}
    </ul>
  </div>
)}
                  </div>
                )}
                
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {archivos.map((arch) => (
                    <div
                      key={arch.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px",
                        border: "1px solid #eee",
                        borderRadius: "8px",
                      }}
                    >
                      <span style={{ fontSize: "13px" }}>
                        <i
                          className="fa-solid fa-file-pdf"
                          style={{ color: "#e53e3e", marginRight: "10px" }}
                        ></i>
                        {arch.nombre}
                      </span>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <a
                          href={arch.archivo}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.btnAction("#3182ce")}
                        >
                          <i className="fa-solid fa-download"></i>
                        </a>
                        

                        {!isReadOnly && (
                          <button
                            onClick={() => handleFileDelete(arch.id)}
                            style={styles.btnAction("#e53e3e")}
                          >
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


      {showClienteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "12px",
              width: "400px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0 }}>
                <i className="fa-solid fa-users"></i> Buscar Cliente
              </h3>
              <button
                onClick={() => setShowClienteModal(false)}
                style={{
                  border: "none",
                  background: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#a0aec0",
                }}
              >
                &times;
              </button>
            </div>

            <input
              style={{
                ...styles.input,
                paddingLeft: "10px",
                marginBottom: "10px",
                boxSizing: "border-box", 
              }}
              placeholder="Escriba nombre del cliente..."
              value={filtroNombreCliente}
              onChange={(e) => setFiltroNombreCliente(e.target.value)}
              autoFocus
            />

            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                border: "1px solid #eee",
                borderRadius: "8px",
              }}
            >
              {clientes
                .filter(
                  (c) =>
                    !c.baja &&
                    c.nombre
                      .toLowerCase()
                      .includes(filtroNombreCliente.toLowerCase())
                )
                .map((c) => (
                  <div
                    key={c.cuit}
                    onClick={() => {
                      setFormData({ ...formData, cliente: c.cuit });
                      setShowClienteModal(false);
                      setFiltroNombreCliente("");
                    }}
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f7fafc")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div style={{ fontWeight: "600", color: "#2d3748" }}>
                      {c.nombre}
                    </div>
                    <small style={{ color: "#718096" }}>CUIT: {c.cuit}</small>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionImportaciones;

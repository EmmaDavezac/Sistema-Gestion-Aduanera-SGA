import { useState, useEffect } from "react";
import {
  getImportaciones,
  createImportacion,
  updateImportacion,
  getClientes,
  getAduanas,
  getArchivosByImportacion,
  uploadFile,
  deleteArchivo,
} from "../api/files";

const GestionImportaciones = ({ onUpdate }) => {
  // Estados de datos
  const [importaciones, setImportaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [aduanas, setAduanas] = useState([]);
  const [archivos, setArchivos] = useState([]);

  // Estados de UI
  const [busqueda, setBusqueda] = useState("");
  const [view, setView] = useState("list"); // 'list', 'form', 'detail'
  const [isEditing, setIsEditing] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true); // Bloquea inputs inicialmente
  const [selectedId, setSelectedId] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    numero_destinacion: "",
    condicion_venta: "",
    divisa: "",
    numero_factura: "",
    pais_destino: "",
    unitario_en_divisa: 0,
    unidad: "",
    cantidad_unidades: 0,
    fob_total_en_divisa: 0,
    fob_total_en_dolar: 0,
    numeracion: "",
    baja: false,
    aduana: "",
    cliente: "",
    codigo_afip: "",
    nombre_transporte: "",
    puerto_embarque: "",
    oficializacion: "",
    vencimiento_embarque: "",
    vencimiento_preimposicion: "",
    estado: "Pendiente",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [dataImp, dataCli, dataAdu] = await Promise.all([
        getImportaciones(),
        getClientes(),
        getAduanas(),
      ]);
      setImportaciones(dataImp);
      setClientes(dataCli);
      setAduanas(dataAdu);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  };

  const cargarArchivos = async (id) => {
    try {
      const data = await getArchivosByImportacion(id);
      setArchivos(data);
    } catch (err) {
      console.error("Error al cargar archivos:", err);
    }
  };

  // --- MANEJADORES DE ACCIÓN ---

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === "" ? 0 : parseFloat(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
      aduana: formData.aduana ? parseInt(formData.aduana) : null,
      cliente: formData.cliente ? formData.cliente : null, // O parseInt si es numérico
      cantidad_unidades: parseFloat(formData.cantidad_unidades),
      unitario_en_divisa: parseFloat(formData.unitario_en_divisa),
      fob_total_en_divisa: parseFloat(formData.fob_total_en_divisa),
      fob_total_en_dolar: parseFloat(formData.fob_total_en_dolar),
      };

      if (isEditing && selectedId) {
        await updateImportacion(selectedId, dataToSend);
        alert("Importación actualizada con éxito");
      } else {
        await createImportacion(dataToSend);
        alert("Importación registrada con éxito");
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await cargarDatos();
      volverALista();
    } catch (err) {
      alert(
        "Error al guardar: " +
          (err.response?.data?.detail || "Verifique los datos")
      );
    }
  };

  const handleFileUpload = async () => {
    if (!fileToUpload || !selectedId) return;
    const data = new FormData();
    data.append("archivo", fileToUpload);
    data.append("importacion", selectedId);
    try {
      await uploadFile(data);
      setFileToUpload(null);
      cargarArchivos(selectedId);
      alert("Documento subido");
    } catch (err) {
      alert("Error al subir archivo");
    }
  };

  const handleFileDelete = async (id) => {
    if (!window.confirm("¿Eliminar este documento?")) return;
    try {
      await deleteArchivo(id);
      cargarArchivos(selectedId);
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  // --- NAVEGACIÓN ---

  const handleVerDetalle = async (imp) => {
    setSelectedId(imp.id);
    setFormData({
      ...imp,
      aduana: imp.aduana?.id || imp.aduana,
      cliente: imp.cliente,
    });
    setIsEditing(true);
    setIsReadOnly(true); // Entra en modo lectura
    setView("form");
    try {
      const data = await getArchivosByImportacion(imp.id);
      setArchivos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const volverALista = () => {
    setView("list");
    setIsEditing(false);
    setSelectedId(null);
    setArchivos([]);
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
      estado: "Pendiente",
      baja: false,
      aduana: "",
      cliente: "",
      codigo_afip: "",
      nombre_transporte: "",
      oficializacion: "",
      vencimiento_embarque: "",
      vencimiento_preimposicion: "",
    });
  };

  // --- ESTILOS ---
  const styles = {
    container: { padding: '30px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    searchWrapper: { position: 'relative', width: '60%' },
    searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '15px', border: '1px solid #eee' },
    input: { padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', width: '100%', fontSize: '14px' },
    formInput: { 
      padding: '10px', 
      border: '1px solid #ddd', 
      borderRadius: '6px', 
      width: '100%', 
      marginTop: '5px',
      backgroundColor: isReadOnly ? "#f8fafc" : "#fff", // Gris si es solo lectura
      color: isReadOnly ? "#4a5568" : "#2d3748",
      transition: 'all 0.3s'
    },
    btnGreen: { padding: '12px 24px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
    btnBlue: { 
      padding: '10px 20px', 
      backgroundColor: '#3182ce', 
      color: 'white', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      fontWeight: '600', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px' 
    },
    btnAction: (color) => ({ padding: '8px 12px', backgroundColor: 'transparent', color: color, border: `1px solid ${color}`, borderRadius: '6px', cursor: 'pointer', transition: '0.3s', marginLeft: '8px' }),
    badge: (bg, color) => ({ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', backgroundColor: bg, color: color, fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }),
    label: { 
      fontWeight: '600', 
      fontSize: '13px', 
      color: '#4a5568', 
      marginBottom: '5px', 
      display: 'block', // Cambia inline-block por block
      whiteSpace: 'nowrap' // Evita que el nombre del campo se parta en dos líneas
  },
    sectionTitle: { 
      gridColumn: "1 / -1", // Crucial: de la primera a la última columna
      fontWeight: '700', 
      marginTop: '25px', 
      marginBottom: '10px',
      paddingBottom: '8px',
      borderBottom: '2px solid #3182ce',
      color: '#2d3748',
      fontSize: '16px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
  },
    switchTrack: (active) => ({
      width: '50px',
      height: '26px',
      backgroundColor: active ? '#fed7d7' : '#c6f6d5', // Fondo suave
      borderRadius: '15px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: `2px solid ${active ? '#e53e3e' : '#38a169'}`,
    }),
    switchThumb: (active) => ({
      width: '18px',
      height: '18px',
      backgroundColor: active ? '#e53e3e' : '#38a169', // Círculo fuerte
      borderRadius: '50%',
      position: 'absolute',
      top: '2px',
      left: active ? '26px' : '2px', // Desplazamiento
      transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }),
    statusLabel: (active) => ({
      fontSize: '13px',
      fontWeight: 'bold',
      color: active ? '#c53030' : '#2f855a',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }),
  };
  const impFiltradas = importaciones.filter(i => {
    const termino = busqueda.toLowerCase();
  
  
    // 2. Definir los criterios de coincidencia
    const matchDestinacion = i.numero_destinacion?.toLowerCase().includes(termino);
    const matchVendedor = i.vendedor?.toLowerCase().includes(termino);
    const matchClienteID = String(i.cliente || "").toLowerCase().includes(termino);
  
    return matchDestinacion || matchVendedor || matchClienteID;
  });
  
  return (
    <div style={styles.container}>
      {view === "list" ? (
        <div>
          <div style={styles.header}>
            <div style={styles.searchWrapper}>
              <i className="fa-solid fa-magnifying-glass" style={styles.searchIcon}></i>
              <input 
                style={styles.input} 
                placeholder="Buscar por CUIT del cliente o Vendedor..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button style={styles.btnGreen} onClick={() => { setIsEditing(false); setIsReadOnly(false); setView("form"); }}>
              <i className="fa-solid fa-plus"></i>Registrar
            </button>
          </div>

          {impFiltradas.map((imp) => (
            <div key={imp.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div  style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div  style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      backgroundColor: "#ebf4ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#3182ce",
                    }}>
                    <i className="fa-solid fa-ship"></i>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ fontSize: '16px', color: '#2d3748' }}>ID: {imp.id}</strong>
                      <span style={styles.badge(imp.estado === 'Finalizado' ? '#f0fff4' : '#fffeb3', imp.estado === 'Finalizado' ? '#22543d' : '#856404')}>
                        {imp.estado}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '13px' }}>
                      <i className="fa-solid fa-id-card" style={{ marginLeft: '10px', marginRight: '5px' }}></i>CUIT Cliente: {imp.cliente || "No Cargado"} | 
                      <i className="fa-solid fa-user-tie" style={{ marginLeft: '10px', marginRight: '5px' }}></i>Vendedor: {imp.vendedor || "No Cargado"} | 
                      <i className="fa-solid fa-globe" style={{ marginLeft: '10px', marginRight: '5px' }}></i>{imp.pais_origen || "No Cargado"} → {imp.pais_destino || "No Cargado"} |
                      <i className="fa-solid fa-user-tie" style={{ marginLeft: '10px', marginRight: '5px' }}></i>N° Destinación: {imp.numero_destinacion || "No Cargado"}

                    </p>
                  </div>
                </div>
                <button title="Ver Detalles" style={styles.btnAction('#3182ce')} onClick={() => handleVerDetalle(imp)}>
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
            
          ))}
          {impFiltradas.length === 0 && (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px', 
        color: '#a0aec0',
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '2px dashed #e2e8f0' // Un borde punteado queda muy bien para estados vacíos
      }}>
        <i className="fa-solid fa-box-open" style={{ fontSize: '50px', marginBottom: '15px', color: '#cbd5e0' }}></i>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#4a5568' }}>No hay coincidencias</h3>
        <p style={{ marginTop: '8px' }}>Prueba con otro CUIT o vendedor .</p>
      </div>
    )}
        </div>
      ) : (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
           <div style={styles.header}>
            <button onClick={volverALista} style={{ border: 'none', background: 'none', color: '#3182ce', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-arrow-left"></i> Volver al listado
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
  {isEditing && (
    <button 
      style={{ 
        ...styles.btnBlue, 
        backgroundColor: isReadOnly ? '#3182ce' : '#718096' 
      }} 
      onClick={() => setIsReadOnly(!isReadOnly)}
    >
      <i className={isReadOnly ? "fa-solid fa-pen-to-square" : "fa-solid fa-xmark"}></i>
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
    // CAMBIA ESTO:
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
    gap: "25px",
    alignItems: "end" // Ayuda a que los inputs y etiquetas alineen bien si varían de altura
  }}
>
              <div style={styles.sectionTitle}>Datos Generales</div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>N° Destinación</label>
                <input name="numero_destinacion" value={formData.numero_destinacion} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Vendedor</label>
                <input name="vendedor" value={formData.vendedor} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Estado</label>
                <select name="estado" value={formData.estado} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly}>
                  <option value="Inicializada">Inicializada</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
              
              <div style={styles.sectionTitle}>Logística y Origen</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>País Origen</label>
                <input name="pais_origen" value={formData.pais_origen} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>País Destino</label>
                <input name="pais_destino" value={formData.pais_destino} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Puerto Embarque</label>
                <input name="puerto_embarque" value={formData.puerto_embarque} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>

              <div style={styles.sectionTitle}>Valores Comercial</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Divisa</label>
                <input name="divisa" value={formData.divisa} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>FOB Total Divisa</label>
                <input type="number" name="fob_total_en_divisa" value={formData.fob_total_en_divisa} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>FOB Total USD</label>
                <input type="number" name="fob_total_en_dolar" value={formData.fob_total_en_dolar} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
<div style={styles.sectionTitle}>Identificación y AFIP</div>

<div style={{ display: 'flex', flexDirection: 'column' }}>
  <label style={styles.label}>Código AFIP</label>
  <input name="codigo_afip" value={formData.codigo_afip} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
</div>
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <label style={styles.label}>Cliente</label>
  <select name="cliente" value={formData.cliente} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly}>
    <option value="">Seleccione Cliente...</option>
    {clientes.map(c => (
            <option key={`cli-${c.cuit}`} value={c.cuit}>
                {c.nombre}
            </option>
        ))}
  </select>
</div>
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <label style={styles.label}>Aduana</label>
  <select name="aduana" value={formData.aduana} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly}>
    <option value="">Seleccione Aduana...</option>
    {aduanas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
  </select>
</div>

<div style={styles.sectionTitle}>Fechas y Transporte</div>

<div style={{ display: 'flex', flexDirection: 'column' }}>
  <label style={styles.label}>Oficialización</label>
  <input type="date" name="oficializacion" value={formData.oficializacion} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
</div>
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <label style={styles.label}>Venc. Embarque</label>
  <input type="date" name="vencimiento_embarque" value={formData.vencimiento_embarque} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
</div>
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <label style={styles.label}>Nombre Transporte</label>
  <input name="nombre_transporte" value={formData.nombre_transporte} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
</div>

{/* --- SECCIÓN ADICIONAL: DETALLE DE MERCADERÍA --- */}
<div style={styles.sectionTitle}>Detalle de Mercadería</div>

<div style={{ display: 'flex', flexDirection: 'column' }}>
  <label style={styles.label}>Cantidad</label>
  <input type="number" name="cantidad_unidades" value={formData.cantidad_unidades} onChange={handleNumericChange} style={styles.formInput} disabled={isReadOnly} />
</div>
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <label style={styles.label}>Unidad (UOM)</label>
  <input name="unidad" value={formData.unidad} onChange={handleInputChange} placeholder="Ej: UN, KG" style={styles.formInput} disabled={isReadOnly} />
</div>
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <label style={styles.label}>Unitario en Divisa</label>
  <input type="number" name="unitario_en_divisa" value={formData.unitario_en_divisa} onChange={handleNumericChange} style={styles.formInput} disabled={isReadOnly} />
</div>
<label style={styles.sectionTitle}>Estado Logico de la importacion</label>

<div style={{ 
    gridColumn: "1 / -1", // Haz que el switch ocupe todo el ancho para que no se deforme
    marginTop: '10px' 
}}>
  <div tabIndex={0}
   style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    padding: '12px', 
    backgroundColor: '#f8fafc', 
    borderRadius: '10px', 
    border: '1px solid #edf2f7', 
    cursor: isReadOnly ? 'default' : 'pointer',
    width: 'fit-content' // Para que no se estire a lo loco
  }}
    onClick={() => !isReadOnly && setFormData({...formData, baja: !formData.baja})}
  >
    {/* El Switch (Slide) */}
    <div style={styles.switchTrack(formData.baja)}>
      <div style={styles.switchThumb(formData.baja)}></div>
    </div>

    {/* Texto descriptivo */}
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={styles.statusLabel(formData.baja)}>
        {formData.baja ? "Dada de baja" : "Activa"}
      </span>
      <span style={{ fontSize: '11px', color: '#718096' }}>
        {isEditing ? "Haz clic para cambiar el estado" : "Modo lectura"}
      </span>
    </div>
  </div>
</div>
              {!isReadOnly && (
                <div style={{ 
        gridColumn: "1 / -1", // CAMBIO: De span 3 a 1/-1
        marginTop: "20px" }}>
                  <button type="submit" style={{ ...styles.btnBlue, backgroundColor: "#2ecc71", width: "100%", justifyContent: "center" }}>
                    Guardar Cambios
                  </button>
                </div>
              )}
            </form>
              {/* SECCIÓN ARCHIVOS */}
              {isEditing && (
                        <div style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: '15px' }}><i className="fa-solid fa-folder-open" style={{ color: '#3182ce', marginRight: '10px' }}></i>Documentación</h3>
                            {!isReadOnly && (
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                                    <input type="file" onChange={(e) => setFileToUpload(e.target.files[0])} style={{ flex: 1 }} />
                                    <button onClick={handleFileUpload} disabled={!fileToUpload} style={{ ...styles.btnGreen, padding: '8px 16px' }}>Subir</button>
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {archivos.map(arch => (
                                    <div key={arch.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '13px' }}><i className="fa-solid fa-file-pdf" style={{ color: '#e53e3e', marginRight: '10px' }}></i>{arch.nombre}</span>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <a href={arch.archivo} target="_blank" rel="noreferrer" style={styles.btnAction('#3182ce')}><i className="fa-solid fa-download"></i></a>
                                            
                                            {!isReadOnly && <button onClick={() => handleFileDelete(arch.id)} style={styles.btnAction('#e53e3e')}><i className="fa-solid fa-trash-can"></i></button>}
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

export default GestionImportaciones;
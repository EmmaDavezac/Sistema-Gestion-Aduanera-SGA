import { useState, useEffect } from 'react';
import {
    getExportaciones, 
    createExportacion,
    updateExportacion,
    getClientes,
    getAduanas,
    getArchivosByExportacion,
    uploadFile,
    deleteArchivo,
  } from "../api/files";

  const GestionExportaciones = ({ onUpdate }) => {
    // Estados de datos
    const [exportaciones, setExportaciones] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [aduanas, setAduanas] = useState([]);
    const [archivos, setArchivos] = useState([]);
  
    // Estados de UI
    const [busqueda, setBusqueda] = useState("");
    const [view, setView] = useState("list"); // 'list', 'form'
    const [isEditing, setIsEditing] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [fileToUpload, setFileToUpload] = useState(null);
    const initialFormState = {
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
        vendedor: "",
        oficializacion: "",
        vencimiento_embarque: "",
        vencimiento_preimposicion: "",
        estado: "Pendiente",
    };
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
    aduana_id: "",
    cliente_id: "",
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
          const [dataExp, dataCli, dataAdu] = await Promise.all([
            getExportaciones(),
            getClientes(),
            getAduanas(),
          ]);
          setExportaciones(dataExp);
          setClientes(dataCli);
          setAduanas(dataAdu);
          if (onUpdate) onUpdate();
        } catch (err) {
          console.error("Error al cargar datos:", err);
        }
      };

    // --- LÓGICA DE ARCHIVOS (Igual a Clientes) ---

    const cargarArchivos = async (id) => {
        try {
            const data = await getArchivosByExportacion(id);
            setArchivos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar archivos:", err);
            setArchivos([]); // Resetear a array vacío si falla
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
        cliente: formData.cliente,
        cantidad_unidades: parseFloat(formData.cantidad_unidades),
        unitario_en_divisa: parseFloat(formData.unitario_en_divisa),
        fob_total_en_divisa: parseFloat(formData.fob_total_en_divisa),
        fob_total_en_dolar: parseFloat(formData.fob_total_en_dolar),
      };

      if (isEditing && selectedId) {
        await updateExportacion(selectedId, dataToSend);
        alert("Exportación actualizada con éxito");
      } else {
        await createExportacion(dataToSend);
        alert("Exportación registrada con éxito");
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await cargarDatos();
      volverALista();
    } catch (err) {
      alert("Error al guardar: " + (err.response?.data?.detail || "Verifique los datos"));
    }
  };



  const handleFileUpload = async () => {
    if (!fileToUpload || !selectedId) return;

    const data = new FormData();
    data.append("archivo", fileToUpload);
    data.append("tipo", 3); // Asumiendo que 1=Cliente, 2=Import, 3=Export
    data.append("id_exportacion", selectedId); // <-- CAMBIO AQUÍ: Verifica si es 'id_exportacion' o 'exportacion'
    data.append("nombre", fileToUpload.name);

    try {
        await uploadFile(data);
        setFileToUpload(null);
        // Limpiar el input en el DOM
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
        
        await cargarArchivos(selectedId);
        alert("Documento subido con éxito");
    } catch (err) {
        console.error("Error detallado del servidor:", err.response?.data);
        // Esto te dirá exactamente qué campo falta o está mal:
        alert("Error al subir: " + JSON.stringify(err.response?.data));
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

  const handleVerDetalle = (exp) => {
    setSelectedId(exp.id);
    // Mapeo seguro para evitar el error de 'null' en los inputs
    const sanitizedData = {};
    
    Object.keys(initialFormState).forEach(key => {
        sanitizedData[key] = exp[key] ?? initialFormState[key];
    });
    
    // Manejo especial para relaciones
    sanitizedData.aduana = exp.aduana?.id || exp.aduana || "";
    sanitizedData.cliente = exp.cliente?.id || exp.cliente || "";

    setFormData(sanitizedData);
    setIsEditing(true);
    setIsReadOnly(true);
    setView("form");
    cargarArchivos(exp.id);
};

  const volverALista = () => {
    setView("list");
    setIsEditing(false);
    setSelectedId(null);
    setArchivos([]);
    setFormData({
      numero_destinacion: "", condicion_venta: "", vendedor: "", puerto_embarque: "",
      numero_factura: "", pais_destino: "", divisa: "",
      unitario_en_divisa: 0.0, unidad: "", cantidad_unidades: 0, fob_total_en_divisa: 0.0,
      fob_total_en_dolar: 0.0, numeracion: "", estado: "Pendiente", baja: false,
      aduana: "", cliente: "", codigo_afip: "", nombre_transporte: "",
      oficializacion: "", vencimiento_embarque: "", vencimiento_preimposicion: "",
    });
  };

  // --- ESTILOS (Idénticos a Importaciones) ---
  const styles = {
    container: { padding: '30px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    searchWrapper: { position: 'relative', width: '60%' },
    searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '15px', border: '1px solid #eee' },
    input: { padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', width: '100%', fontSize: '14px' },
    formInput: { 
      padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', marginTop: '5px',
      backgroundColor: isReadOnly ? "#f8fafc" : "#fff", color: isReadOnly ? "#4a5568" : "#2d3748", transition: 'all 0.3s'
    },
    btnGreen: { padding: '12px 24px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
    btnBlue: { padding: '10px 20px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
    btnAction: (color) => ({ padding: '8px 12px', backgroundColor: 'transparent', color: color, border: `1px solid ${color}`, borderRadius: '6px', cursor: 'pointer', transition: '0.3s', marginLeft: '8px' }),
    badge: (bg, color) => ({ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', backgroundColor: bg, color: color, fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }),
    label: { fontWeight: '600', fontSize: '13px', color: '#4a5568', marginBottom: '5px', display: 'inline-block' },
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
      width: '50px', height: '26px', backgroundColor: active ? '#fed7d7' : '#c6f6d5', borderRadius: '15px',
      position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease', border: `2px solid ${active ? '#e53e3e' : '#38a169'}`,
    }),
    switchThumb: (active) => ({
      width: '18px', height: '18px', backgroundColor: active ? '#e53e3e' : '#38a169', borderRadius: '50%',
      position: 'absolute', top: '2px', left: active ? '26px' : '2px', transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }),
    statusLabel: (active) => ({ fontSize: '13px', fontWeight: 'bold', color: active ? '#c53030' : '#2f855a', textTransform: 'uppercase' }),
  };

  const expFiltradas = exportaciones.filter(e => {
    const termino = busqueda.toLowerCase();
    return (
      e.numero_destinacion?.toLowerCase().includes(termino) ||
      e.vendedor?.toLowerCase().includes(termino) ||
      String(e.cliente || "").toLowerCase().includes(termino)
    );
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
                placeholder="Buscar exportación por Cliente o Vendedor..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button style={styles.btnGreen} onClick={() => { setIsEditing(false); setIsReadOnly(false); setView("form"); }}>
              <i className="fa-solid fa-plus"></i>Registrar
            </button>
          </div>

          {expFiltradas.map((exp) => (
            <div key={exp.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e53e3e' }}>
                    <i className="fa-solid fa-truck-ramp-box"></i>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ fontSize: '16px', color: '#2d3748' }}>ID: {exp.id}</strong>
                      <span style={styles.badge(exp.estado === 'Finalizado' ? '#f0fff4' : '#fffeb3', exp.estado === 'Finalizado' ? '#22543d' : '#856404')}>
                        {exp.estado}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '13px' }}>
                      <i className="fa-solid fa-id-card" style={{ marginRight: '5px' }}></i>CUIT Cliente:  {exp.cliente || "No Cargado"} | 
                      <i className="fa-solid fa-user-tie" style={{ marginLeft: '10px', marginRight: '5px' }}></i>Vendedor: {exp.vendedor || "No Cargado"} | 
                      <i className="fa-solid fa-plane-departure" style={{ marginLeft: '10px', marginRight: '5px' }}></i>Destino: {exp.pais_destino || "No Cargado"}
                    </p>
                  </div>
                </div>
                <button title="Ver Detalles" style={styles.btnAction('#3182ce')} onClick={() => handleVerDetalle(exp)}>
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
          ))}
             {expFiltradas.length === 0 && (
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
            {isEditing && (
              <button 
                style={{ ...styles.btnBlue, backgroundColor: isReadOnly ? '#3182ce' : '#718096' }} 
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
  style={{ 
    display: "grid", 
    // minmax(250px, 1fr) hace que si la pantalla mide menos de 250px, se apilen
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
    gap: "20px",
    alignItems: "start" 
  }}
>

              <div style={styles.sectionTitle}>Datos Generales de Exportación</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>N° Destinación</label>
                <input 
  name="numero_destinacion" 
  value={formData.numero_destinacion || ""} 
  onChange={handleInputChange} 
  style={styles.formInput} 
  disabled={isReadOnly} 
/>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Vendedor</label>
                <input 
  name="vendedor" 
  value={formData.vendedor || ""} 
  onChange={handleInputChange} 
  style={styles.formInput} 
  disabled={isReadOnly} 
/>

              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>N° Factura</label>
                <input name="numero_factura" value={formData.numero_factura} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Estado</label>
                <select name="estado" value={formData.estado} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
              

              <div style={styles.sectionTitle}>Valores Comerciales (FOB)</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Condición de Venta</label>
                <input name="condicion_venta" value={formData.condicion_venta} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} placeholder="Ej: FOB, CIF..." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Divisa</label>
                <input name="divisa" value={formData.divisa} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>FOB Total Divisa</label>
                <input type="number" name="fob_total_en_divisa" value={formData.fob_total_en_divisa} onChange={handleNumericChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>FOB Total USD</label>
                <input type="number" name="fob_total_en_dolar" value={formData.fob_total_en_dolar} onChange={handleNumericChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={styles.sectionTitle}>Logística de Salida</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>País Destino</label>
                <input name="pais_destino" value={formData.pais_destino} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Puerto Embarque</label>
                <input name="puerto_embarque" value={formData.puerto_embarque} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Transporte</label>
                <input name="nombre_transporte" value={formData.nombre_transporte} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={styles.sectionTitle}>Fechas y Plazos</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Fecha Oficialización</label>
                <input type="date" name="oficializacion" value={formData.oficializacion} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Vencimiento Embarque</label>
                <input type="date" name="vencimiento_embarque" value={formData.vencimiento_embarque} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Vencimiento Preimposición</label>
                <input type="date" name="vencimiento_preimposicion" value={formData.vencimiento_preimposicion} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={styles.sectionTitle}>Entidades e Identificación</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Cliente</label>
                <select name="cliente" value={formData.cliente} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly}>
                  <option value="">Seleccione Cliente...</option>
                  {clientes.map(c => (
  <option key={`cli-${c.id || c.cuit}`} value={c.id || c.cuit}>
    {c.nombre || c.razon_social}
  </option>
))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Aduana</label>
                <select name="aduana" value={formData.aduana} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly}>
                  <option value="">Seleccione Aduana...</option>
                  {aduanas.map(a => (
  <option key={`adu-${a.id}`} value={a.id}>
    {a.nombre}
  </option>
))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Código AFIP</label>
                <input name="codigo_afip" value={formData.codigo_afip} onChange={handleInputChange} style={styles.formInput} disabled={isReadOnly} />
              </div>

              <div style={styles.sectionTitle}>Mercadería y Cantidades</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Cantidad</label>
                <input type="number" name="cantidad_unidades" value={formData.cantidad_unidades} onChange={handleNumericChange} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Unidad (UOM)</label>
                <input name="unidad" value={formData.unidad} style={styles.formInput} disabled={isReadOnly} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={styles.label}>Unitario Divisa</label>
                <input type="number" name="unitario_en_divisa" value={formData.unitario_en_divisa} onChange={handleNumericChange} style={styles.formInput} disabled={isReadOnly} />
              </div>

              <div style={styles.sectionTitle}>Estado de la Operación</div>
              <div style={{ 
    gridColumn: "1 / -1", // Haz que el switch ocupe todo el ancho para que no se deforme
    marginTop: '10px' 
}}>
              <div  tabIndex={0}
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
                  <div style={styles.switchTrack(formData.baja)}>
                    <div style={styles.switchThumb(formData.baja)}></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={styles.statusLabel(formData.baja)}>{formData.baja ? "Dada de Baja" : "Activa"}</span>
                    <span style={{ fontSize: '11px', color: '#718096' }}>
        {isReadOnly ?  "Modo lectura": "Haz clic para cambiar el estado" }
      </span>
                  </div>
                </div>
              </div>

              {!isReadOnly && (
    <div style={{ 
        gridColumn: "1 / -1", // CAMBIO: De span 3 a 1/-1
        marginTop: "20px" 
    }}>
      <button type="submit" style={{ ...styles.btnBlue, backgroundColor: "#2ecc71", width: "100%", justifyContent: "center" }}>
        Guardar Exportación
      </button>
    </div>
)}
            </form>

            {isEditing && (
              <div style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}><i className="fa-solid fa-folder-open" style={{ color: '#3182ce', marginRight: '10px' }}></i>Documentación de Exportación</h3>
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

export default GestionExportaciones;
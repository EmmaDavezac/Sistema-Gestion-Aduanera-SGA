import { useState, useEffect } from 'react';
import { 
    getImportaciones, createImportacion, updateImportacion, deleteImportacion,
    getClientes, getAduanas,
    getArchivosByImportacion, uploadFile, deleteArchivo 
} from '../api/files';

const GestionImportaciones = ({ onUpdate }) => {
    // Estados de Datos
    const [importaciones, setImportaciones] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [aduanas, setAduanas] = useState([]);
    const [archivos, setArchivos] = useState([]);

    // Estados de UI
    const [view, setView] = useState("list"); // 'list' o 'detail'
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [fileToUpload, setFileToUpload] = useState(null);

    // Estado del Formulario
    const [formData, setFormData] = useState({
        numero_destinacion: '',
        condicion_venta: '',
        vendedor: '',
        puerto_embarque: '',
        numero_factura: '',
        pais_origen: '',
        pais_destino: '',
        divisa: '',
        unitario_en_divisa: 0.0,
        unidad: '',
        cantidad_unidades: 0,
        fob_total_en_divisa: 0.0,
        fob_total_en_dolar: 0.0,
        numeracion: '',
        estado: 'Pendiente',
        baja: false,
        aduana: '',
        cliente: ''
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [dataImp, dataCli, dataAdu] = await Promise.all([
                getImportaciones(),
                getClientes(),
                getAduanas()
            ]);
            setImportaciones(dataImp);
            setClientes(dataCli);
            setAduanas(dataAdu);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error("Error al cargar datos iniciales:", err);
        }
    };

    // --- LÓGICA DE ARCHIVOS (Igual a Clientes) ---

    const cargarArchivos = async (id) => {
        try {
            const docs = await getArchivosByImportacion(id);
            setArchivos(docs);
        } catch (err) {
            console.error("Error al cargar documentos:", err);
        }
    };

    const handleSubirArchivo = async () => {
        if (!fileToUpload) return;
    
        const fData = new FormData();
        fData.append("archivo", fileToUpload);
        fData.append("tipo", 2); // 2 es 'Importación'
        fData.append("id_importacion", selectedId); 
        fData.append("nombre", fileToUpload.name);
    
        try {
            await uploadFile(fData);
            alert("Archivo añadido");
            
            // 1. Limpiar el estado del archivo seleccionado
            setFileToUpload(null);
            
            // 2. IMPORTANTE: Recargar los archivos específicos de este expediente
            await cargarArchivos(selectedId); 
            
            // 3. Opcional: Recargar datos generales si es necesario
            await cargarDatos(); 
            // 4. Limpiar el input file en el DOM
            document.querySelector('input[type="file"]').value = "";
            
        } catch (err) {
            console.error("Error al subir:", err.response?.data);
            alert("Error al subir el archivo");
        }
    };
  

    const handleEliminarArchivo = async (archivoId) => {
        if (!window.confirm("¿Eliminar este documento?")) return;
        try {
            await deleteArchivo(archivoId);
            cargarArchivos(selectedId);
        } catch (err) {
            alert("Error al eliminar el archivo.");
        }
    };

    // --- MANEJO DE FORMULARIO ---

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, aduana: parseInt(formData.aduana) };
            if (isEditing) {
                await updateImportacion(selectedId, payload);
                alert("Importación actualizada.");
            } else {
                await createImportacion(payload);
                alert("Importación creada.");
            }
            cargarDatos();
            setView("list");
        } catch (err) {
            alert("Error al guardar los cambios.");
        }
    };

    const handleVerDetalle = (imp) => {
        setSelectedId(imp.id);
        setFormData({
            ...imp,
            aduana: imp.aduana?.id || imp.aduana,
            cliente: imp.cliente
        });
        setIsEditing(false);
        setView("detail");
        cargarArchivos(imp.id);
    };

    // --- ESTILOS ---
    const styles = {
        container: { padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh' },
        card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '15px' },
        input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px', color: '#555' },
        btnBlue: { padding: '10px 20px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        btnGreen: { padding: '10px 20px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
        fileRow: { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #edf2f7', alignItems: 'center' }
    };

    return (
        <div style={styles.container}>
            {view === "list" ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <input 
                            style={{ ...styles.input, width: '70%' }} 
                            placeholder="Buscar por N° Destinación o Cliente..." 
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <button style={styles.btnGreen} onClick={() => { 
                            setFormData({ numero_destinacion: '', estado: 'Pendiente', baja: false }); 
                            setView("detail"); 
                            setIsEditing(true); 
                            setSelectedId(null);
                        }}>
                            + Nueva Importación
                        </button>
                    </div>

                    {importaciones.filter(i => i.numero_destinacion.includes(busqueda)).map(imp => (
                        <div key={imp.id} style={styles.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <strong style={{ fontSize: '18px' }}>{imp.numero_destinacion}</strong>
                                    <p style={{ margin: '5px 0', color: '#666' }}>Cliente: {imp.cliente_nombre} | FOB: U$D {imp.fob_total_en_dolar}</p>
                                </div>
                                <button style={styles.btnBlue} onClick={() => handleVerDetalle(imp)}>Ver Expediente</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.card}>
                    <button onClick={() => setView("list")} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Volver al listado</button>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>{selectedId ? `Expediente: ${formData.numero_destinacion}` : 'Nueva Importación'}</h2>
                        {selectedId && (
                            <button 
                                onClick={() => setIsEditing(!isEditing)} 
                                style={{ backgroundColor: isEditing ? '#e53e3e' : '#ecc94b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                {isEditing ? 'Cancelar Edición' : 'Editar Datos'}
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} style={{ ...styles.grid, marginTop: '20px' }}>
                        <div>
                            <label style={styles.label}>N° Destinación</label>
                            <input name="numero_destinacion" style={styles.input} value={formData.numero_destinacion} onChange={handleInputChange} disabled={!isEditing} required />
                        </div>
                        <div>
                            <label style={styles.label}>Cliente</label>
                            <select name="cliente" style={styles.input} value={formData.cliente} onChange={handleInputChange} disabled={!isEditing} required>
                                <option value="">Seleccione...</option>
                                {clientes.map(c => <option key={c.cuit} value={c.cuit}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Aduana</label>
                            <select name="aduana" style={styles.input} value={formData.aduana} onChange={handleInputChange} disabled={!isEditing} required>
                                <option value="">Seleccione...</option>
                                {aduanas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Vendedor</label>
                            <input name="vendedor" style={styles.input} value={formData.vendedor} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                        <div>
                            <label style={styles.label}>FOB Total Dólares</label>
                            <input name="fob_total_en_dolar" type="number" step="0.01" style={styles.input} value={formData.fob_total_en_dolar} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                        <div>
                            <label style={styles.label}>Estado</label>
                            <select name="estado" style={styles.input} value={formData.estado} onChange={handleInputChange} disabled={!isEditing}>
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Finalizada">Finalizada</option>
                            </select>
                        </div>

                        {isEditing && (
                            <div style={{ gridColumn: 'span 3', marginTop: '10px' }}>
                                <button type="submit" style={{ ...styles.btnGreen, width: '100%' }}>Guardar Cambios de la Importación</button>
                            </div>
                        )}
                    </form>

                    {/* SECCIÓN DE ARCHIVOS (Igual que en Clientes) */}
                    {selectedId && (
                        <div style={{ marginTop: '40px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
                            <h3>Documentación Digital</h3>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
                                <input type="file" onChange={(e) => setFileToUpload(e.target.files[0])} />
                                <button onClick={handleSubirArchivo} disabled={!fileToUpload} style={{ ...styles.btnBlue, backgroundColor: fileToUpload ? '#3182ce' : '#cbd5e0' }}>
                                    Subir Archivo
                                </button>
                            </div>

                            {archivos.length > 0 ? (
                                archivos.map(arch => (
                                    <div key={arch.id} style={styles.fileRow}>
                                        <span>📄 {arch.nombre || arch.nombre_archivo || 'Documento'}</span>
                                        <div>
                                            <a href={arch.archivo} target="_blank" rel="noreferrer" style={{ marginRight: '15px', color: '#3182ce', textDecoration: 'none', fontWeight: 'bold' }}>Descargar</a>
                                            <button onClick={() => handleEliminarArchivo(arch.id)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}>Eliminar</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#999', textAlign: 'center' }}>No hay archivos adjuntos a esta importación.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GestionImportaciones;
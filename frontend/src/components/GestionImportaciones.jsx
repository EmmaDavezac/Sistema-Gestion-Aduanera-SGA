import { useState, useEffect } from 'react';
import { 
    getImportaciones, createImportacion, updateImportacion, deleteImportacion,
    getClientes, getAduanas,
    getArchivosByImportacion, uploadFile, deleteArchivo
} from '../api/files';

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
    const [selectedId, setSelectedId] = useState(null);
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
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleNumericChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value === '' ? 0 : parseFloat(value)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                aduana: parseInt(formData.aduana),
            };

            if (isEditing && selectedId) {
                await updateImportacion(selectedId, dataToSend);
                alert("Importación actualizada con éxito");
            } else {
                await createImportacion(dataToSend);
                alert("Importación registrada con éxito");
            }
            await cargarDatos();
            volverALista();
        } catch (err) {
            alert("Error al guardar: " + (err.response?.data?.detail || "Verifique los datos"));
        }
    };

    const handleUpload = async () => {
        if (!fileToUpload || !selectedId) return;
        const data = new FormData();
        data.append('archivo', fileToUpload);
        data.append('importacion', selectedId);
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

    const verDetalle = (imp) => {
        setSelectedId(imp.id);
        setFormData({
            ...imp,
            aduana: imp.aduana?.id || imp.aduana,
            cliente: imp.cliente
        });
        setView("detail");
        setIsEditing(false);
        cargarArchivos(imp.id);
    };

    const volverALista = () => {
        setView("list");
        setIsEditing(false);
        setSelectedId(null);
        setArchivos([]);
        setFormData({
            numero_destinacion: '', condicion_venta: '', vendedor: '', puerto_embarque: '',
            numero_factura: '', pais_origen: '', pais_destino: '', divisa: '',
            unitario_en_divisa: 0.0, unidad: '', cantidad_unidades: 0,
            fob_total_en_divisa: 0.0, fob_total_en_dolar: 0.0, numeracion: '',
            estado: 'Pendiente', baja: false, aduana: '', cliente: ''
        });
    };

    // --- ESTILOS ---

    const styles = {
        badge: (baja) => ({
            padding: "3px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold",
            backgroundColor: baja ? "#ffebeb" : "#e6fffa", color: baja ? "#e53e3e" : "#2c7a7b",
            border: baja ? "1px solid #feb2b2" : "1px solid #81e6d9",
        }),
        infoBox: { padding: "20px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #eee", marginBottom: "20px" },
        sectionTitle: { fontSize: "18px", fontWeight: "bold", color: "#2d3748", borderBottom: "2px solid #edf2f7", paddingBottom: "8px", marginBottom: "20px", marginTop: "30px" },
        input: { padding: "10px", border: "1px solid #ddd", borderRadius: "4px", width: "100%", backgroundColor: "#fcfcfc" },
        label: { display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "12px", color: "#666", textTransform: "uppercase" },
        btn: { padding: "10px 15px", borderRadius: "4px", cursor: "pointer", border: "none", fontWeight: "bold" },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
        fileItem: { display: "flex", justifyContent: "space-between", padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "6px", marginBottom: "8px", border: "1px solid #eee" }
    };

    const filteredImp = importaciones.filter(i => 
        i.numero_destinacion.toLowerCase().includes(busqueda.toLowerCase()) ||
        (i.cliente_nombre && i.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()))
    );

    return (
        <div style={{ padding: "20px" }}>
            {view === "list" && (
                <div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                        <input 
                            style={styles.input} 
                            placeholder="Buscar por destinación o cliente..." 
                            value={busqueda} 
                            onChange={(e) => setBusqueda(e.target.value)} 
                        />
                        <button 
                            style={{ ...styles.btn, backgroundColor: "#28a745", color: "white", minWidth: "180px" }} 
                            onClick={() => setView("form")}
                        >
                            + Nueva Importación
                        </button>
                    </div>

                    {filteredImp.map((i) => (
                        <div key={i.id} style={{ ...styles.infoBox, display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: i.baja ? "5px solid #e53e3e" : "5px solid #805ad5" }}>
                            <div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <strong style={{ fontSize: "16px" }}>{i.numero_destinacion}</strong>
                                    <span style={styles.badge(i.baja)}>{i.baja ? "BAJA" : i.estado}</span>
                                </div>
                                <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                                    {i.cliente_nombre} | FOB: U$D {i.fob_total_en_dolar.toLocaleString()}
                                </div>
                            </div>
                            <button 
                                style={{ ...styles.btn, backgroundColor: "#007bff", color: "white" }} 
                                onClick={() => verDetalle(i)}
                            >
                                Gestionar / Ver Archivos
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {(view === "form" || view === "detail") && (
                <div style={styles.infoBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <button style={styles.btn} onClick={volverALista}>← Volver al Listado</button>
                        {view === "detail" && (
                            <button 
                                style={{ ...styles.btn, backgroundColor: isEditing ? "#718096" : "#ecc94b", color: "white" }}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? "Cancelar Edición" : "Editar Datos"}
                            </button>
                        )}
                    </div>

                    <h3 style={styles.sectionTitle}>Datos Generales de la Operación</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.grid}>
                            <div>
                                <label style={styles.label}>N° Destinación</label>
                                <input name="numero_destinacion" style={styles.input} value={formData.numero_destinacion} onChange={handleInputChange} disabled={!isEditing && view !== "form"} required />
                            </div>
                            <div>
                                <label style={styles.label}>Cliente (CUIT)</label>
                                <select name="cliente" style={styles.input} value={formData.cliente} onChange={handleInputChange} disabled={!isEditing && view !== "form"} required>
                                    <option value="">Seleccione Cliente...</option>
                                    {clientes.map(c => <option key={c.cuit} value={c.cuit}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={styles.label}>Aduana</label>
                                <select name="aduana" style={styles.input} value={formData.aduana} onChange={handleInputChange} disabled={!isEditing && view !== "form"} required>
                                    <option value="">Seleccione Aduana...</option>
                                    {aduanas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={styles.label}>Vendedor</label>
                                <input name="vendedor" style={styles.input} value={formData.vendedor} onChange={handleInputChange} disabled={!isEditing && view !== "form"} />
                            </div>
                            <div>
                                <label style={styles.label}>País Origen</label>
                                <input name="pais_origen" style={styles.input} value={formData.pais_origen} onChange={handleInputChange} disabled={!isEditing && view !== "form"} />
                            </div>
                            <div>
                                <label style={styles.label}>Puerto Embarque</label>
                                <input name="puerto_embarque" style={styles.input} value={formData.puerto_embarque} onChange={handleInputChange} disabled={!isEditing && view !== "form"} />
                            </div>
                            <div>
                                <label style={styles.label}>FOB Total Dólares</label>
                                <input name="fob_total_en_dolar" type="number" step="0.01" style={styles.input} value={formData.fob_total_en_dolar} onChange={handleNumericChange} disabled={!isEditing && view !== "form"} />
                            </div>
                            <div>
                                <label style={styles.label}>Estado</label>
                                <select name="estado" style={styles.input} value={formData.estado} onChange={handleInputChange} disabled={!isEditing && view !== "form"}>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En Proceso">En Proceso</option>
                                    <option value="Finalizada">Finalizada</option>
                                    <option value="Cancelada">Cancelada</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input name="baja" type="checkbox" checked={formData.baja} onChange={handleInputChange} disabled={!isEditing && view !== "form"} />
                                <label style={{...styles.label, marginBottom: 0}}>Dada de Baja</label>
                            </div>
                        </div>

                        {(isEditing || view === "form") && (
                            <button type="submit" style={{ ...styles.btn, backgroundColor: "#805ad5", color: "white", width: '100%', marginTop: '25px' }}>
                                {isEditing ? "Guardar Cambios" : "Crear Nueva Importación"}
                            </button>
                        )}
                    </form>

                    {/* SECCIÓN DE ARCHIVOS ADJUNTOS */}
                    {view === "detail" && (
                        <>
                            <h3 style={styles.sectionTitle}>Documentación de Importación</h3>
                            <div style={{ ...styles.infoBox, backgroundColor: "#fdfdfd", borderStyle: "dashed" }}>
                                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                                    <input type="file" onChange={(e) => setFileToUpload(e.target.files[0])} style={{ flex: 1 }} />
                                    <button 
                                        onClick={handleUpload} 
                                        disabled={!fileToUpload}
                                        style={{ ...styles.btn, backgroundColor: fileToUpload ? "#4a5568" : "#cbd5e0", color: "white" }}
                                    >
                                        Subir Documento
                                    </button>
                                </div>

                                {archivos.length === 0 ? (
                                    <p style={{ textAlign: "center", color: "#a0aec0" }}>No hay archivos adjuntos a esta operación.</p>
                                ) : (
                                    archivos.map(file => (
                                        <div key={file.id} style={styles.fileItem}>
                                            <span style={{ fontWeight: "500" }}>📄 {file.nombre_archivo || "Archivo Adjunto"}</span>
                                            <div style={{ display: "flex", gap: "15px" }}>
                                                <a href={file.archivo} target="_blank" rel="noreferrer" style={{ color: "#3182ce", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}>Ver / Descargar</a>
                                                <button onClick={() => handleFileDelete(file.id)} style={{ background: "none", border: "none", color: "#e53e3e", cursor: "pointer", fontWeight: "bold" }}>Eliminar</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default GestionImportaciones;
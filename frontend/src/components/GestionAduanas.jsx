import { useState, useEffect } from 'react';
import { getAduanas, createAduana, updateAduana, deleteAduana } from '../api/files';

const GestionAduanas = () => {
    const [aduanas, setAduanas] = useState([]);
    const [view, setView] = useState("list"); // Control de vista igual a Usuarios
    const [isEditing, setIsEditing] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [formData, setFormData] = useState({ id: '', nombre: '' });

    useEffect(() => { cargarAduanas(); }, []);

    const cargarAduanas = async () => {
        try {
            const data = await getAduanas();
            setAduanas(data);
        } catch (err) { console.error("Error:", err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateAduana(formData.id, formData);
            } else {
                await createAduana(formData);
            }
            alert("Operación exitosa");
            setView("list");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            cargarAduanas();
        } catch (err) {
            alert("Error: ID ya existente o datos inválidos.");
        }
    };

    const handleEditar = (aduana) => {
        setFormData(aduana);
        setIsEditing(true);
        setView("form");
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar esta aduana?")) {
            await deleteAduana(id);
            cargarAduanas();
        }
    };

    const styles = {
        container: { padding: '30px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
        searchWrapper: { position: 'relative', width: '60%' },
        searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' },
        card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', marginBottom: '15px', border: '1px solid #eee'  },
        input: { padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '8px', width: '100%', fontSize: '14px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px', color: '#4a5568' },
        formInput: { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%', marginTop: '5px' },
        
        btnGreen: { padding: '12px 24px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
        btnAction: (color) => ({ padding: '8px 12px', backgroundColor: 'transparent', color: color, border: `1px solid ${color}`, borderRadius: '6px', cursor: 'pointer', transition: '0.3s', marginLeft: '8px' }),
        badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', backgroundColor: '#edf2f7', color: '#2d3748', fontWeight: 'bold' }
    };

    return (
        <div style={styles.container}>
            {view === "list" ? (
                <div>
                    <div style={styles.header}>
                        <div style={styles.searchWrapper}>
                            <i className="fa-solid fa-magnifying-glass" style={styles.searchIcon}></i>
                            <input 
                                style={ styles.input} 
                                placeholder="Buscar aduana por nombre o código..." 
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <button style={styles.btnGreen} onClick={() => { 
                            setFormData({ id: '', nombre: '' });
                            setIsEditing(false); setView("form"); 
                        }}>
                            <i className="fa-solid fa-plus"></i> Registrar
                        </button>
                    </div>

                    {aduanas.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || a.id.toString().includes(busqueda)).map(a => (
                        <div key={a.id} style={styles.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#ebf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3182ce' }}>
                                        <i className="fa-solid fa-landmark"></i>
                                    </div>
                                    <div>
                                        <span style={styles.badge}>Cód: {a.id}</span>
                                        <h3 style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#2d3748' }}>{a.nombre}</h3>
                                    </div>
                                </div>
                                <div>
                                    <button style={styles.btnAction('#3182ce')} onClick={() => handleEditar(a)}>
                                        <i className="fa-solid fa-pen-to-square"></i> 
                                    </button>
                                    
                                    <button  style={styles.btnAction('#e53e3e')}
                                    
                                     onClick={() => handleEliminar(a.id)}>
                                        <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <button onClick={() => setView("list")} style={{ border: 'none', background: 'none', color: '#3182ce', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <i className="fa-solid fa-arrow-left"></i> Volver al listado
                    </button>
                    
                    <div style={styles.card}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2d3748' }}>
                            <i className={isEditing ? "fa-solid fa-pen-to-square" : "fa-solid fa-plus"} style={{ marginRight: '10px', color: '#38a169' }}></i>
                            {isEditing ? `Editando Aduana: ${formData.id}` : 'Nueva Aduana'}
                        </h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={styles.label}>Código de Aduana (ID)</label>
                                <input 
                                    style={styles.formInput}
                                    value={formData.id} 
                                    onChange={e => setFormData({ ...formData, id: e.target.value })} 
                                    required 
                                    disabled={isEditing}
                                    placeholder="Ej: 001"
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={styles.label}>Nombre de la Aduana</label>
                                <input 
                                    style={styles.formInput}
                                    value={formData.nombre} 
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })} 
                                    required 
                                    placeholder="Ej: Aduana de Mendoza"
                                />
                            </div>
                            <button type="submit" style={{ ...styles.btnGreen, width: '100%', justifyContent: 'center' }}>
                                <i className="fa-solid fa-floppy-disk"></i> Guardar Aduana
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionAduanas;
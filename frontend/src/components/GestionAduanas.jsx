import { useState, useEffect } from 'react';
import { getAduanas, createAduana, updateAduana, deleteAduana } from '../api/files';

const GestionAduanas = () => {
    const [aduanas, setAduanas] = useState([]);
    const [formData, setFormData] = useState({ id: '', nombre: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { cargarAduanas(); }, []);

    const cargarAduanas = async () => {
        try {
            const data = await getAduanas();
            setAduanas(data);
        } catch (err) { console.error("Error al cargar aduanas"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateAduana(formData.id, formData);
                alert("Aduana actualizada");
            } else {
                await createAduana(formData);
                alert("Aduana creada");
            }
            setFormData({ id: '', nombre: '' });
            setIsEditing(false);
            cargarAduanas();
        } catch (err) { alert("Error en la operación. Verifique si el ID ya existe."); }
    };

    const styles = {
        infoBox: { padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee', marginBottom: '10px' },
        input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px', width: '100%' },
        btn: { padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }
    };

    return (
        <div style={{ padding: '10px' }}>
            <div style={styles.infoBox}>
                <h3>{isEditing ? 'Editar Aduana' : 'Nueva Aduana'}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        style={{...styles.input, width: '150px'}} 
                        placeholder="ID Aduana" 
                        value={formData.id} 
                        disabled={isEditing}
                        onChange={e => setFormData({...formData, id: e.target.value})} 
                        required 
                    />
                    <input 
                        style={styles.input} 
                        placeholder="Nombre de la Aduana" 
                        value={formData.nombre} 
                        onChange={e => setFormData({...formData, nombre: e.target.value})} 
                        required 
                    />
                    <button type="submit" style={{...styles.btn, backgroundColor: '#28a745', color: 'white', height: '42px'}}>
                        {isEditing ? 'Guardar' : 'Agregar'}
                    </button>
                    {isEditing && (
                        <button type="button" style={{...styles.btn, backgroundColor: '#718096', color: 'white'}} onClick={() => {setIsEditing(false); setFormData({id:'', nombre:''});}}>
                            Cancelar
                        </button>
                    )}
                </form>
            </div>

            <div style={styles.infoBox}>
                <h3>Lista de Aduanas</h3>
                {aduanas.map(a => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                        <span><strong>{a.id}</strong> - {a.nombre}</span>
                        <div>
                            <button style={{...styles.btn, backgroundColor: '#ecc94b', marginRight: '5px'}} onClick={() => { setIsEditing(true); setFormData(a); }}>✏️</button>
                            <button style={{...styles.btn, backgroundColor: '#e53e3e', color: 'white'}} onClick={async () => { if(window.confirm("¿Eliminar?")) { await deleteAduana(a.id); cargarAduanas(); } }}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GestionAduanas;
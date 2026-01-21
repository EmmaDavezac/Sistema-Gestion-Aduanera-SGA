import { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../api/files';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [view, setView] = useState("list");
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [busqueda, setBusqueda] = useState("");

    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        email: '',
        password: '',
        is_staff: false,
        is_active: true
    });

    useEffect(() => { cargarUsuarios(); }, []);

    const cargarUsuarios = async () => {
        try {
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (err) { console.error("Error:", err); }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Para actualizar, si el password está vacío, lo quitamos del envío
                const payload = { ...formData };
                if (!payload.password) delete payload.password;
                await updateUsuario(selectedId, payload);
            } else {
                await createUsuario(formData);
            }
            alert("Operación exitosa");
            setView("list");
            cargarUsuarios();
        } catch (err) {
            alert("Error al guardar: " + JSON.stringify(err.response?.data));
        }
    };

    const handleEditar = (user) => {
        setSelectedId(user.id);
        setFormData({
            username: user.username,
            first_name: user.first_name || '',
            email: user.email || '',
            password: '', // Password se deja vacío por seguridad al editar
            is_staff: user.is_staff,
            is_active: user.is_active
        });
        setIsEditing(true);
        setView("form");
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar este usuario?")) {
            await deleteUsuario(id);
            cargarUsuarios();
        }
    };

    const styles = {
        container: { padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh' },
        card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '15px' },
        input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' },
        btnBlue: { padding: '8px 15px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        btnGreen: { padding: '10px 20px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        badge: (color) => ({ padding: '4px 8px', borderRadius: '12px', fontSize: '11px', backgroundColor: color, color: 'white', marginLeft: '10px' })
    };

    return (
        <div style={styles.container}>
            {view === "list" ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <input 
                            style={{ ...styles.input, width: '70%' }} 
                            placeholder="Buscar usuario..." 
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <button style={styles.btnGreen} onClick={() => { 
                            setFormData({ username: '', first_name: '', email: '', password: '', is_staff: false, is_active: true });
                            setIsEditing(false); setView("form"); 
                        }}>+ Nuevo Usuario</button>
                    </div>

                    {usuarios.filter(u => u.username.includes(busqueda)).map(u => (
                        <div key={u.id} style={styles.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{u.username}</strong> 
                                    {u.is_staff && <span style={styles.badge('#805ad5')}>Admin</span>}
                                    {!u.is_active && <span style={styles.badge('#e53e3e')}>Inactivo</span>}
                                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>{u.first_name} | {u.email}</p>
                                </div>
                                <div>
                                    <button style={{ ...styles.btnBlue, marginRight: '10px' }} onClick={() => handleEditar(u)}>Editar</button>
                                    <button style={{ ...styles.btnBlue, backgroundColor: '#e53e3e' }} onClick={() => handleEliminar(u.id)}>Eliminar</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.card}>
                    <button onClick={() => setView("list")} style={{ marginBottom: '20px' }}>← Volver</button>
                    <h2>{isEditing ? `Editando: ${formData.username}` : 'Nuevo Usuario'}</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={styles.label}>Nombre de Usuario</label>
                            <input name="username" style={styles.input} value={formData.username} onChange={handleInputChange} required disabled={isEditing} />
                        </div>
                        <div>
                            <label style={styles.label}>Nombre Real</label>
                            <input name="first_name" style={styles.input} value={formData.first_name} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label style={styles.label}>Email</label>
                            <input name="email" type="email" style={styles.input} value={formData.email} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label style={styles.label}>Contraseña {isEditing && "(dejar vacío para no cambiar)"}</label>
                            <input name="password" type="password" style={styles.input} value={formData.password} onChange={handleInputChange} required={!isEditing} />
                        </div>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <label><input type="checkbox" name="is_staff" checked={formData.is_staff} onChange={handleInputChange} /> ¿Es Administrador?</label>
                            <label><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} /> Usuario Activo</label>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <button type="submit" style={{ ...styles.btnGreen, width: '100%' }}>Guardar Usuario</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default GestionUsuarios;
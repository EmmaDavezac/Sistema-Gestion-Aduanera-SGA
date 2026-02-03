import React, { useState, useEffect } from 'react';
import { getUsuarios, updateUsuario } from '../api/files';

const Profile = () => {
    // 1. Estado inicial con la estructura exacta de Django
    const [userData, setUserData] = useState({
        id: '',
        username: '',
        email: '',
        first_name: '',
        last_name: ''
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ msg: '', type: '' });

    const [passwords, setPasswords] = useState({
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            const lista = await getUsuarios();
            // Buscamos al usuario actual usando el username guardado en el login
            const actual = lista.find(u => u.username === localStorage.getItem('userName'));
            
            if (actual) {
                // Sincronizamos el estado con los datos del servidor
                setUserData({
                    id: actual.id,
                    username: actual.username || '',
                    email: actual.email || '',
                    first_name: actual.first_name || '',
                    last_name: actual.last_name || ''
                });
                // Guardamos el ID por si no estaba en el localStorage
                localStorage.setItem('userId', actual.id);
            }
        } catch (err) {
            showStatus('Error al cargar datos del servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDataChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        // Validar si se está intentando cambiar la contraseña
        if (showPasswordSection) {
            if (!passwords.new_password) {
                return showStatus('La contraseña no puede estar vacía', 'error');
            }
            if (passwords.new_password !== passwords.confirm_password) {
                return showStatus('Las contraseñas no coinciden', 'error');
            }
        }

        try {
            const dataToSave = { ...userData };
            
            // Si la sección de contraseña está abierta y hay datos, se incluye en el envío
            if (showPasswordSection && passwords.new_password) {
                dataToSave.password = passwords.new_password;
            }

            const response = await updateUsuario(userData.id, dataToSave);
            
            setUserData(response);
            localStorage.setItem('userName', response.username);
            
            showStatus('¡Perfil y seguridad actualizados!', 'success');
            setIsEditing(false);
            setShowPasswordSection(false);
            setPasswords({ new_password: '', confirm_password: '' }); // Limpiar campos
        } catch (err) {
            showStatus('Error al guardar los cambios', 'error');
        }
    };

    const showStatus = (msg, type) => {
        setStatus({ msg, type });
        setTimeout(() => setStatus({ msg: '', type: '' }), 4000);
    };

    if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Cargando perfil...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Mi Perfil</h2>
                
                {status.msg && (
                    <div style={{...styles.alert, backgroundColor: status.type === 'success' ? '#d4edda' : '#f8d7da', color: status.type === 'success' ? '#155724' : '#721c24'}}>
                        {status.msg}
                    </div>
                )}

                {/* --- SECCIÓN DE DATOS PERSONALES --- */}
                <div style={styles.sectionTitle}>Datos Personales</div>
                <div style={styles.field}>
                    <label style={styles.label}>Usuario</label>
                    <input name="username" value={userData.username} onChange={handleDataChange} disabled={!isEditing} style={styles.input} />
                </div>

                <div style={styles.row}>
                    <div style={styles.field}>
                        <label style={styles.label}>Nombre</label>
                        <input name="first_name" value={userData.first_name} onChange={handleDataChange} disabled={!isEditing} style={styles.input} />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Apellido</label>
                        <input name="last_name" value={userData.last_name} onChange={handleDataChange} disabled={!isEditing} style={styles.input} />
                    </div>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input name="email" value={userData.email} onChange={handleDataChange} disabled={!isEditing} style={styles.input} />
                </div>

                {/* --- SECCIÓN DE SEGURIDAD --- */}
                <div style={{...styles.sectionTitle, marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                    Seguridad
                </div>
                
                {!showPasswordSection ? (
                    <button 
                        onClick={() => { setShowPasswordSection(true); setIsEditing(true); }} 
                        style={styles.btnLink}
                    >
                        <i className="fa-solid fa-lock"></i> Cambiar contraseña
                    </button>
                ) : (
                    <div style={{animation: 'fadeIn 0.3s'}}>
                        <div style={styles.field}>
                            <label style={styles.label}>Nueva Contraseña</label>
                            <input 
                                type="password" 
                                name="new_password" 
                                value={passwords.new_password} 
                                onChange={handlePasswordChange} 
                                style={styles.input} 
                                placeholder="Min. 8 caracteres"
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Confirmar Contraseña</label>
                            <input 
                                type="password" 
                                name="confirm_password" 
                                value={passwords.confirm_password} 
                                onChange={handlePasswordChange} 
                                style={styles.input} 
                            />
                        </div>
                    </div>
                )}

                {/* --- ACCIONES --- */}
                <div style={styles.actions}>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} style={styles.btnEdit}>
                            Editar Datos
                        </button>
                    ) : (
                        <>
                            <button onClick={handleSave} style={styles.btnSave}>Guardar Todo</button>
                            <button onClick={() => { 
                                setIsEditing(false); 
                                setShowPasswordSection(false);
                                setPasswords({new_password: '', confirm_password: ''});
                            }} style={styles.btnCancel}>Cancelar</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' },
    card: { width: '100%', maxWidth: '500px', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' },
    title: { marginBottom: '20px', color: '#1a202c', textAlign: 'center' },
    sectionTitle: { fontSize: '14px', fontWeight: 'bold', color: '#a0aec0', marginBottom: '15px', textTransform: 'uppercase' },
    field: { marginBottom: '15px' },
    label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' },
    row: { display: 'flex', gap: '15px' },
    actions: { marginTop: '25px', display: 'flex', gap: '10px' },
    btnEdit: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    btnSave: { flex: 2, padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    btnCancel: { flex: 1, padding: '12px', backgroundColor: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    btnLink: { background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '14px', fontWeight: '600', padding: 0, display: 'flex', alignItems: 'center', gap: '5px' },
    alert: { padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }
};

export default Profile;
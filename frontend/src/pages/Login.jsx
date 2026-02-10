import { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Estado para el botón de "ojo"
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // auth.js ya se encarga de guardar el token y el isAdmin en localStorage
            await login(username, password);
            
            // Si la línea de arriba no falló, redirigimos
            navigate('/'); 
        } catch (err) {
            console.error("Error en login:", err);
            // Si el error tiene un mensaje del servidor, lo mostramos, si no, el genérico
            setError(err.detail || 'Usuario o contraseña incorrectos');
        } finally {
            setLoading(false);
        }

    };

    // --- OBJETOS DE ESTILO ---
    const styles = {
        container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#f0f2f5', fontFamily: "'Segoe UI', Roboto, sans-serif", margin: 0 },
        card: { 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '16px', // Un poco más redondeado
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)', 
            width: '100%', 
            maxWidth: '400px', 
            boxSizing: 'border-box',
            animation: 'slideUp 0.5s ease-out' // Animación de entrada
        },
        title: {
            textAlign: 'center',
            marginBottom: '8px',
            color: '#1a1a1a',
            fontSize: '24px',
            fontWeight: 'bold',
        },
        subtitle: {
            textAlign: 'center',
            marginBottom: '32px',
            color: '#666',
            fontSize: '14px',
        },
        inputGroup: { marginBottom: '20px', position: 'relative' }, // Añadimos position relative aquí
        label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#444' },
        input: (isLoading) => ({
            width: '100%', 
            padding: '12px', 
            paddingRight: '40px', 
            borderRadius: '8px', 
            border: '1px solid #ddd', 
            fontSize: '16px', 
            boxSizing: 'border-box', 
            outline: 'none',
            transition: 'all 0.3s',
            backgroundColor: isLoading ? '#f8f9fa' : 'white',
            cursor: isLoading ? 'not-allowed' : 'text'
        }),
        eyeButton: {
            position: 'absolute',
            right: '12px', // Un poquito más separado del borde
            top: '50%',    // Lo centramos verticalmente
            transform: 'translateY(10%)', // Ajuste fino según tu label
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#007bff', // Cambiamos a azul para que resalte
            fontSize: '18px',
            zIndex: 10, // Asegura que esté por encima del input
            display: 'flex',
            alignItems: 'center',
        },
        button: {
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#80bdff' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.1s active'
        },
        errorMsg: {
            backgroundColor: '#fff2f2',
            color: '#d32f2f',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center',
            border: '1px solid #ffcdd2',
        }
    };

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .btn-login:hover { background-color: #0069d9 !important; }
                .btn-login:active { transform: scale(0.98); }
                /* Animación de sacudida para errores */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    50% { transform: translateX(8px); }
    75% { transform: translateX(-8px); }
}

/* Efecto suave para que el mensaje aparezca */
@keyframes fadeInError {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
            `}</style>

            <div style={styles.card}>
                {/* Logo o Icono para dar identidad */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ backgroundColor: '#e7f1ff', width: '60px', height: '60px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-ship" style={{ color: '#007bff', fontSize: '24px' }}></i>
                    </div>
                </div>

                <h2 style={styles.title}>¡Bienvenido!</h2>
                <p style={styles.subtitle}>Ingresa tus credenciales para continuar</p>
                
                {error && (
    <div style={{
        ...styles.errorMsg, 
        animation: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both, fadeInError 0.3s ease' 
    }}>
        <i className="fa-solid fa-triangle-exclamation" style={{marginRight: '8px'}}></i>
        {error}
    </div>
)}
                
                <form onSubmit={handleSubmit}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Usuario</label>   
                <input 
    disabled={loading}
    type="text" 
    value={username} 
    placeholder='Ingresa tu usuario'
    onChange={(e) => {
        setUsername(e.target.value);
        if(error) setError(''); // Limpia el error mientras el usuario corrige
    }}
    style={styles.input(loading)}
    required
/>
                </div>

                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input 
                            disabled={loading}
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input(loading)}
                            required
                        />
                        <button 
                            type="button" 
                            placeholder='Ingresa tu contraseña'
                            onClick={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
                        >
                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-login"
                        style={styles.button}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-circle-notch fa-spin"></i> 
                                Validando...
                            </>
                        ) : 'Entrar al Sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
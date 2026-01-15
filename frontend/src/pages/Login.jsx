import { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/dashboard'); 
        } catch (err) {
            setError('Usuario o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    // --- OBJETOS DE ESTILO ---
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f0f2f5', // Gris azulado suave
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            margin: 0,
        },
        card: {
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '400px',
            boxSizing: 'border-box',
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
        inputGroup: {
            marginBottom: '20px',
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#444',
        },
        input: {
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '16px',
            boxSizing: 'border-box',
            outline: 'none',
            transition: 'border-color 0.2s',
        },
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#a0c4ff' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            marginTop: '10px',
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
            <div style={styles.card}>
                <h2 style={styles.title}>¡Bienvenido de nuevo!</h2>
                <p style={styles.subtitle}>Ingresa a SIGA para gestionar tus archivos</p>
                
                {error && <div style={styles.errorMsg}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nombre de usuario</label>
                        <input 
                            type="text" 
                            placeholder="Ej: emma_admin"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={styles.input}
                            onFocus={(e) => e.target.style.borderColor = '#007bff'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            onFocus={(e) => e.target.style.borderColor = '#007bff'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading ? 'Validando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
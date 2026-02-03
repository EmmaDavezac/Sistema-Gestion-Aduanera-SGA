import { useState, useEffect } from 'react';
import { 
    getClientes, 
    getAduanas, 
    getImportaciones, 
    getExportaciones,
    getUsuarios
} from '../api/files'; 

import GestionClientes from '../components/GestionClientes';
import GestionAduanas from '../components/GestionAduanas';
import GestionImportaciones from '../components/GestionImportaciones';
import GestionExportaciones from '../components/GestionExportaciones';
import AlertasVencimiento from '../components/AlertasVencimiento';
import GestionUsuarios from '../components/GestionUsuarios'; 
import HomeInfo from '../components/HomeInfo';
import Footer from '../components/Footer';
import Profile from '../components/Profile';

const Home = () => {
    const [view, setView] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <--- Nuevo estado
    const userName = localStorage.getItem('userName') || 'Usuario';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [highlightId, setHighlightId] = useState(null);
    useEffect(() => {
        cargarDatos();
    }, []);
    
    useEffect(() => {
        const closeMenu = () => setShowUserMenu(false);
        if (showUserMenu) {
            // El timeout evita que el mismo click que abre el menú lo cierre
            window.addEventListener('click', closeMenu);
        }
        return () => window.removeEventListener('click', closeMenu);
    }, [showUserMenu]);
    const cargarDatos = async () => {
        try {
            const [dataCli, dataAdu, dataImp, dataExp,dataUsr] = await Promise.all([
                getClientes(), 
                getAduanas(),
                getImportaciones(),
                getExportaciones(),
                getUsuarios()
            ]);
            
           
        } catch (err) {
            console.error("Error al sincronizar datos:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const styles = {
        container: { 
            padding: '20px clamp(10px, 5vw, 40px)', // Usa clamp para padding dinámico
            fontFamily: "'Segoe UI', Roboto, sans-serif", 
            backgroundColor: '#f4f7f6', 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        },
        header: { 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '25px',
            backgroundColor: 'white',
            padding: '15px 25px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        },
        logoSection: { display: 'flex', alignItems: 'center', gap: '15px' },
        logoIcon: { backgroundColor: '#007bff', color: 'white', padding: '10px', borderRadius: '8px', fontSize: '20px' },
        userProfile: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginRight: '20px',
            paddingRight: '20px',
            borderRight: '1px solid #eee'
        },
        userAvatar: {
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px'
        },
        logoutBtn: { 
            padding: '10px 20px', 
            backgroundColor: '#fff', 
            color: '#d9534f', 
            border: '1px solid #d9534f', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontWeight: '600',
            transition: '0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        navTabs: { 
            display: 'flex', 
            gap: '5px', 
            marginBottom: '20px', 
            backgroundColor: '#e9ecef', 
            padding: '5px', 
            borderRadius: '10px',
            // Responsive: permitimos scroll lateral suave en móviles
            overflowX: 'auto', 
            WebkitOverflowScrolling: 'touch', // Scroll suave en iOS
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
        },
        tab: (active) => ({
            padding: '10px 18px', 
            cursor: 'pointer', 
            borderRadius: '8px',
            backgroundColor: active ? 'white' : 'transparent',
            color: active ? '#007bff' : '#666', 
            fontWeight: '600', 
            fontSize: '14px',
            display: 'flex',
            flexDirection: 'row', // <--- Ícono arriba, texto abajo en móviles
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '12px',
            boxShadow: active ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
            transition: '0.2s',
            minWidth: '80px', // Asegura que el área táctil sea suficiente
            flexShrink: 0     // Evita que se compriman
        }),
        mainContent: { 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
            flex: 1,                // <--- CAMBIAR minHeight por flex: 1
            marginBottom: '20px'    // <--- Opcional: espacio antes del footer
        },
        dropdown: {
            position: 'absolute',
            top: '120%',
            right: '0',
            backgroundColor: 'white',
            minWidth: '200px',
            borderRadius: '8px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            padding: '10px 0',
            border: '1px solid #edf2f7'
        },
        dropdownHeader: {
            padding: '8px 15px',
            fontSize: '12px',
            color: '#a0aec0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        dropdownItem: {
            padding: '10px 15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#4a5568',
            transition: 'background 0.2s',
        },
        icon: {
            width: '16px',
            textAlign: 'center',
            color: '#007bff'
        },
        navContainer: {
            position: 'relative',
            marginBottom: '20px',
        },
        hamburger: {
            display: 'none', // Se activará en la Media Query (ver abajo)
            fontSize: '24px',
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            padding: '10px'
        },
        navTabs: (isOpen) => ({
            display: 'flex', 
            gap: '5px', 
            backgroundColor: '#e9ecef', 
            padding: '5px', 
            borderRadius: '10px',
            transition: 'all 0.3s ease',
            // En escritorio se ve normal, en móvil cambia según isOpen (ver CSS abajo)
        }),
        
    };

    // Función para cambiar vista y cerrar menú móvil
    const changeView = (newView) => {
        setView(newView);
        setIsMobileMenuOpen(false);
    };

    //Función para manejar el click en una alerta
    const handleAlertClick = (id) => {
        setView('exportaciones');
        setHighlightId(id);
        
        // Limpiamos el resaltado después de 5 segundos
        setTimeout(() => setHighlightId(null), 5000);
    };
   return (
    <div style={styles.container}>
            {/* Agrega este bloque de CSS en línea para manejar la responsividad de forma sencilla */}
            <style>{`
    .hamburger-btn {
        display: none;
        align-items: center;
        gap: 10px;
        background: white;
        border: 1px solid #ddd;
        padding: 10px 15px;
        border-radius: 8px;
        color: #007bff;
        cursor: pointer;
        font-weight: bold;
        width: 100%;
        margin-bottom: 10px;
    }

    /* Cambiamos a 1024px para cubrir el rango donde se cortaba */
    @media (max-width: 1024px) {
        .hamburger-btn {
            display: flex; 
        }

        .nav-tabs-desktop {
            flex-direction: column !important; /* Forzamos verticalidad */
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            
            /* Estado dinámico */
            max-height: ${isMobileMenuOpen ? '600px' : '0px'};
            opacity: ${isMobileMenuOpen ? '1' : '0'};
            margin-bottom: ${isMobileMenuOpen ? '20px' : '0px'};
            padding: ${isMobileMenuOpen ? '5px' : '0px'} !important;
            pointer-events: ${isMobileMenuOpen ? 'all' : 'none'};
            width: 100%;
        }

        .nav-tabs-desktop > div {
            width: 100%;
            justify-content: flex-start !important;
            padding: 12px 15px !important;
        }
    }

    /* Para pantallas GRANDES, nos aseguramos que se vea horizontal siempre */
    @media (min-width: 1025px) {
        .nav-tabs-desktop {
            display: flex !important;
            opacity: 1 !important;
            max-height: none !important;
            pointer-events: all !important;
        }
    }
`}</style>
        
            {/* Header Principal Refinado */}
            <div style={styles.header}>
                <div style={styles.logoSection}>
                    <div style={styles.logoIcon}><i className="fa-solid fa-ship"></i></div>
                    <div>
                        <h2 style={{ margin: 0, color: '#1a1a1a', fontSize: '20px' }}>SGA</h2>
                        <span style={{ fontSize: '12px', color: '#888' }}>Sistema de Gestión Aduanera</span>
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <div 
                        style={styles.userProfile} 
                        onClick={(e) => {
                            e.stopPropagation(); // Evita que el useEffect lo cierre al instante
                            setShowUserMenu(!showUserMenu);
                        }}
                    >
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                                @{userName} <i className="fa-solid fa-caret-down" style={{fontSize: '10px', marginLeft: '5px'}}></i>
                            </div>
                            <div style={{ fontSize: '11px', color: isAdmin ? '#28a745' : '#666' }}>
                                {isAdmin ? 'Administrador' : 'Operador'}
                            </div>
                        </div>
                        <div style={styles.userAvatar}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {showUserMenu && (
                        <div style={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                            <div style={{ padding: '10px 15px', fontSize: '12px', color: '#999', fontWeight: 'bold' }}>CUENTA</div>
                            
                            <div 
                                style={styles.dropdownItem} 
                                onClick={() => { setView('Profile'); setShowUserMenu(false); }}
                            >
                                <i className="fa-solid fa-circle-user" style={{color: '#007bff'}}></i> Mi Perfil
                            </div>

                            <div style={styles.dropdownItem} onClick={() => alert('Funcionalidad en desarrollo')} >
                                <i className="fa-solid fa-gear" style={{color: '#007bff'}}></i> Configuración
                            </div>

                            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '5px 0' }} />
                            
                            <div 
                                style={{ ...styles.dropdownItem, color: '#d9534f' }} 
                                onClick={handleLogout}
                            >
                                <i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AlertasVencimiento onAlertClick={handleAlertClick} />

            {/* Navegación por Pestañas con Iconos */}
           {/* NAVBAR CON HAMBURGUESA */}
           <div style={styles.navContainer}>
    {/* Botón Hamburguesa */}
    <button 
        className="hamburger-btn" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
        <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`} style={{fontSize: '20px'}}></i>
        <span>{isMobileMenuOpen ? 'CERRAR MENÚ' : 'MENÚ DE OPCIONES'}</span>
    </button>

    {/* Contenedor de Pestañas con Animación */}
    <div className="nav-tabs-desktop" style={styles.navTabs()}>
        <div style={styles.tab(view === 'home')} onClick={() => changeView('home')}>
            <i className="fa-solid fa-house"></i> INICIO
        </div>
        <div style={styles.tab(view === 'clientes')} onClick={() => changeView('clientes')}>
            <i className="fa-solid fa-users"></i> CLIENTES
        </div>
        {isAdmin && (
            <div style={styles.tab(view === 'aduanas')} onClick={() => changeView('aduanas')}>
                <i className="fa-solid fa-landmark"></i> ADUANAS
            </div>
        )}
        <div style={styles.tab(view === 'importaciones')} onClick={() => changeView('importaciones')}>
            <i className="fa-solid fa-file-import"></i> IMPORTACIONES
        </div>
        <div style={styles.tab(view === 'exportaciones')} onClick={() => changeView('exportaciones')}>
            <i className="fa-solid fa-file-export"></i> EXPORTACIONES
        </div>
        {isAdmin && (
            <div style={styles.tab(view === 'usuarios')} onClick={() => changeView('usuarios')}>
                <i className="fa-solid fa-user-shield"></i> USUARIOS
            </div>
        )}
    </div>
</div>

            {/* Contenido Dinámico */}
            <div style={styles.mainContent}>
                {/* ... (Toda tu lógica de renderizado se mantiene igual) ... */}
                {view === 'home' && <HomeInfo />}
                {view === 'clientes' && <GestionClientes onUpdate={cargarDatos} />}
                {view === 'aduanas' && <GestionAduanas onUpdate={cargarDatos} />}
                {view === 'importaciones' && <GestionImportaciones onUpdate={cargarDatos} />}
                {view === 'exportaciones' && <GestionExportaciones onUpdate={cargarDatos} highlightId={highlightId} />}
                {view === 'usuarios' && <GestionUsuarios onUpdate={cargarDatos} />}
                {view === 'Profile' && <Profile />} 
            </div>
          
            <Footer />
        </div>
        
    );
};

export default Home;
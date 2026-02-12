import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GestionClientes from '../components/GestionClientes';
import GestionAduanas from '../components/GestionAduanas';
import GestionImportaciones from '../components/GestionImportaciones';
import GestionExportaciones from '../components/GestionExportaciones';
import AlertasVencimiento from '../components/AlertasVencimiento';
import GestionUsuarios from '../components/GestionUsuarios'; 
import HomeInfo from '../components/HomeInfo';
import Footer from '../components/Footer';
import Profile from '../components/Profile';
import Toast from '../components/Toast';


const Home = () => {
    const [view, setView] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [highlightId, setHighlightId] = useState(null); 

    const userName = localStorage.getItem('userName') || 'Usuario';
    const isAdmin = localStorage.getItem('isAdmin') === 'true'; 

    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

    const showToast = (msg, type = 'success') => {
        setToast({ show: true, msg, type });
    };
   
    useEffect(() => {
        const closeMenu = () => setShowUserMenu(false);
        if (showUserMenu) {
            window.addEventListener('click', closeMenu);
        }
        return () => window.removeEventListener('click', closeMenu);
    }, [showUserMenu]);


    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

     const changeView = (newView) => {
        setView(newView);
        setIsMobileMenuOpen(false);
        window.scrollTo(0, 0)
    };

    const handleAlertClick = (id) => {
        setView('exportaciones');
        setHighlightId(id);
        
        setTimeout(() => setHighlightId(null), 5000);
    };

    const styles = {
        container: { 
            fontFamily: "'Segoe UI', Roboto, sans-serif", 
            backgroundColor: '#f4f7f6', 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', 
        },
        contentWrapper: {
            width: '100%',
            maxWidth: '1200px', 
            padding: '20px clamp(10px, 3vw, 30px)', 
            display: 'flex',
            flexDirection: 'column',
            flex: 1, 
            boxSizing: 'border-box'
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
            marginLeft: '20px', 
            paddingLeft: '20px', 
            borderLeft: '1px solid #eee', 
            cursor: 'pointer' 
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
        navTabs: (isOpen) => ({ 
            display: 'flex', 
            gap: '5px', 
            marginBottom: '20px', 
            backgroundColor: '#e9ecef', 
            padding: '5px', 
            borderRadius: '10px',
            overflowX: 'auto', 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            
        }),
        tab: (active) => ({
            position: 'relative', 
            padding: '12px 20px',
            cursor: 'pointer',
            color: active ? '#007bff' : '#64748b',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'color 0.3s ease',
        }),
        mainContent: { 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
            flex: 1, 
            marginBottom: '40px',
            minHeight: '400px' 
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
            display: 'none', 
            fontSize: '24px',
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            padding: '10px'
        },
        
      
        
    };

   
   return (
    <div style={styles.container}>
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
    .tab-item:hover {
        color: #007bff !important;
        background: rgba(0, 123, 255, 0.08);
        border-radius: 8px;
    }
    @media (max-width: 1024px) {
        .hamburger-btn {
            display: flex; 
        }

        .nav-tabs-desktop {
            flex-direction: column !important; 
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            
      
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

    @media (min-width: 1025px) {
        .nav-tabs-desktop {
            display: flex !important;
            opacity: 1 !important;
            max-height: none !important;
            pointer-events: all !important;
        }
    }
`}</style>
        <div style={styles.contentWrapper}>
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
                            e.stopPropagation(); 
                            setShowUserMenu(!showUserMenu);
                        }}
                    >
                       <div style={styles.userAvatar}>
        {userName.charAt(0).toUpperCase()}
    </div>

   
    <div style={{ textAlign: 'left' }}> 
        <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
            @{userName} <i className="fa-solid fa-caret-down" style={{fontSize: '10px', marginLeft: '5px'}}></i>
        </div>
        <div style={{ fontSize: '11px', color: isAdmin ? '#28a745' : '#666' }}>
            {isAdmin ? 'Administrador' : 'Usuario'}
        </div>
    </div>
    </div>

                    <AnimatePresence>
    {showUserMenu && (
        <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }}      
            exit={{ opacity: 0, y: -10, scale: 0.95 }}    
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={styles.dropdown} 
            onClick={(e) => e.stopPropagation()}
        >
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
                            </motion.div>
    )}
</AnimatePresence>
                    
                </div>
            </div>

            <AlertasVencimiento onAlertClick={handleAlertClick} />

       
           <div style={styles.navContainer}>
    <button 
        className="hamburger-btn" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
        <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`} style={{fontSize: '20px'}}></i>
    </button>

    <div className="nav-tabs-desktop" style={styles.navTabs()}>
    {['home','aduanas', 'clientes', 'importaciones', 'exportaciones', 'usuarios'].map((tabName) => {
        if ((tabName === 'usuarios' || tabName === 'aduanas') && !isAdmin) return null;
        
        const isActive = view === tabName;
        
        return (
            <div 
                key={tabName}
                style={styles.tab(isActive)} 
                onClick={() => changeView(tabName)}
                className="tab-item"
            >
                <i className={`fa-solid fa-${tabName === 'home' ? 'house' : tabName === 'clientes' ? 'users' : 'file-invoice'}`}></i>
                {tabName.toUpperCase()}

                {isActive && (
                    <motion.div 
                        layoutId="activeTabIndicator"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: '#007bff',
                            borderRadius: '10px'
                        }}
                    />
                )}
            </div>
        );
    })}
</div>
</div>

            <div style={styles.mainContent}>
                {view === 'home' && <HomeInfo />}
                {view === 'clientes' && <GestionClientes onNotification={showToast}  />}
                {view === 'aduanas' && <GestionAduanas  onNotification={showToast}  />}
                {view === 'importaciones' && <GestionImportaciones  onNotification={showToast} />}
                {view === 'exportaciones' && <GestionExportaciones  highlightId={highlightId} onNotification={showToast} />}
                {view === 'usuarios' && <GestionUsuarios onNotification={showToast} />}
                {view === 'Profile' && <Profile onNotification={showToast} />}
            </div>
        </div>

          
            <Footer />
            {toast.show && (
    <Toast 
        msg={toast.msg} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
    />
    
)} 

        </div>
        
    );
};

export default Home;
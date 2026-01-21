import React from 'react';

const Home = () => {
    const styles = {
        wrapper: { 
            padding: '40px 20px', 
            backgroundColor: '#f0f2f5', 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        },
        header: {
            textAlign: 'center',
            marginBottom: '40px',
        },
        title: { 
            fontSize: '32px', 
            color: '#1a365d', 
            fontWeight: 'bold',
            marginBottom: '10px' 
        },
        subtitle: {
            fontSize: '18px',
            color: '#64748b',
            margin: 0
        },
        gridFuncionalidades: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '25px', 
            maxWidth: '1200px', 
            width: '100%' 
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.header}>
                <h1 style={styles.title}>Bienvenido al Sistema SGA</h1>
                <p style={styles.subtitle}>Gestión Aduanera centralizada y eficiente</p>
            </div>
            
            <div style={styles.gridFuncionalidades}>
                <FeatureCard 
                    icon="fa-file-invoice" 
                    title="Gestión de Operaciones" 
                    text="Administre sus exportaciones e importaciones con trazabilidad completa." 
                    color="#3182ce" 
                />
                <FeatureCard 
                    icon="fa-users" 
                    title="Cartera de Clientes" 
                    text="Base de datos centralizada con perfiles detallados y documentación asociada." 
                    color="#38a169" 
                />
                <FeatureCard 
                    icon="fa-building-columns" 
                    title="Aduanas y Puntos" 
                    text="Control de jurisdicciones, dependencias y puntos de control operativos." 
                    color="#805ad5" 
                />
                <FeatureCard 
                    icon="fa-folder-tree" 
                    title="Repositorio Digital" 
                    text="Almacenamiento seguro de archivos y legajos digitales por operación." 
                    color="#e53e3e" 
                />
                <FeatureCard 
                    icon="fa-shield-halved" 
                    title="Seguridad y Roles" 
                    text="Gestión de usuarios y niveles de acceso para protección de datos críticos." 
                    color="#319795" 
                />
                <FeatureCard 
                    icon="fa-cloud-arrow-up" 
                    title="Acceso en la Nube" 
                    text="Opere desde cualquier lugar con una infraestructura segura y escalable." 
                    color="#d69e2e" 
                />
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, text, color }) => {
    const cardStyle = {
        backgroundColor: 'white',
        padding: '35px 25px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        textAlign: 'center',
        borderTop: `6px solid ${color}`,
        transition: 'all 0.3s ease',
        cursor: 'default'
    };

    return (
        <div 
            style={cardStyle} 
            onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.1)';
            }} 
            onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
            }}
        >
            <div style={{ 
                backgroundColor: `${color}15`, 
                width: '70px', 
                height: '70px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 20px'
            }}>
                <i className={`fa-solid ${icon}`} style={{ fontSize: '32px', color: color }}></i>
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#1a202c' }}>{title}</h3>
            <p style={{ fontSize: '15px', color: '#718096', lineHeight: '1.6', margin: 0 }}>{text}</p>
        </div>
    );
};

export default Home;
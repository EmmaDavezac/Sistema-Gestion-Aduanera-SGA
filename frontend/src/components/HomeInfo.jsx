import React from 'react';
import { motion } from 'framer-motion'; // 1. Importamos motion

const FEATURES = [
    { icon: "fa-file-invoice", title: "Gestión de Operaciones", text: "Administre sus exportaciones e importaciones con trazabilidad completa.", color: "#3182ce" },
    { icon: "fa-users", title: "Cartera de Clientes", text: "Base de datos centralizada con perfiles detallados y documentación asociada.", color: "#38a169" },
    { icon: "fa-building-columns", title: "Aduanas y Puntos", text: "Control de jurisdicciones, dependencias y puntos de control operativos.", color: "#805ad5" },
    { icon: "fa-shield-halved", title: "Seguridad y Roles", text: "Gestión de usuarios y niveles de acceso para protección de datos críticos.", color: "#319795" }
];

// 2. Definimos las variantes (instrucciones de animación)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2 // Retraso entre la aparición de cada tarjeta
        }
    }
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

const HomeInfo = () => {
    return (
        <section style={styles.wrapper}>
            {/* Animación para el encabezado */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={styles.header}
            >
                <h1 style={styles.title}>Bienvenido al Sistema SGA</h1>
                <p style={styles.subtitle}>Gestión Aduanera centralizada y eficiente</p>
                <div style={styles.underline}></div>
            </motion.header>
            
            {/* 3. Contenedor principal con stagger */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={styles.gridFuncionalidades}
            >
                {FEATURES.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </motion.div>
        </section>
    );
};

const FeatureCard = ({ icon, title, text, color }) => {
    return (
        <motion.article 
            variants={cardVariants}
            // MEJORA: Definimos explícitamente el estado inicial y de hover
            initial="hidden"
            animate="visible"
            whileHover={{ 
                y: -10,
                // Agregamos una transición tipo "spring" para que se sienta orgánico
                transition: { type: "spring", stiffness: 300, damping: 20 },
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" 
            }}
            // MEJORA: Aseguramos que el cursor sea un puntero para indicar interactividad
            style={{ ...styles.cardBase(color), cursor: 'pointer' }}
        >
            <div style={styles.iconContainer(color)}>
                <i className={`fa-solid ${icon}`} style={{ fontSize: '28px', color: color }}></i>
            </div>
            <h3 style={styles.cardTitle}>{title}</h3>
            <p style={styles.cardText}>{text}</p>
        </motion.article>
    );
};

const styles = {
    wrapper: { 
        padding: '60px 20px', 
        backgroundColor: '#f8fafc', // Un gris más moderno y suave
        minHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    header: {
        textAlign: 'center',
        marginBottom: '60px',
    },
    title: { 
        fontSize: 'clamp(28px, 5vw, 36px)', // Fuente responsiva
        color: '#1e293b', 
        fontWeight: '800',
        marginBottom: '10px',
        letterSpacing: '-0.5px'
    },
    subtitle: {
        fontSize: '18px',
        color: '#64748b',
        maxWidth: '600px',
        margin: '0 auto'
    },
    underline: {
        width: '60px',
        height: '4px',
        backgroundColor: '#3182ce',
        margin: '20px auto 0',
        borderRadius: '2px'
    },
    gridFuncionalidades: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '30px', 
        maxWidth: '1100px', 
        width: '100%' 
    },
    cardBase: (color) => ({
        backgroundColor: 'white',
        padding: '40px 30px',
        borderRadius: '20px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
        textAlign: 'center',
        borderTop: `6px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Efecto hover vía CSS (esto es un recordatorio de usar clases)
    }),
    iconContainer: (color) => ({
        backgroundColor: `${color}10`, // Opacidad del 10%
        width: '64px', 
        height: '64px', 
        borderRadius: '16px', // Bordes redondeados modernos vs círculos
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '24px'
    }),
    cardTitle: { 
        fontSize: '20px', 
        fontWeight: '700', 
        marginBottom: '12px', 
        color: '#1e293b' 
    },
    cardText: { 
        fontSize: '15px', 
        color: '#475569', 
        lineHeight: '1.6', 
        margin: 0 
    }
};

export default HomeInfo;
import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                
                <div style={styles.column}>
                    <div style={styles.brandGroup}>
                        <span style={styles.brandTitle}>SGA</span>
                        <span style={styles.brandDivider}>|</span>
                        <span style={styles.brandSubtitle}>Gestión Aduanera</span>
                    </div>
                    <p style={styles.description}>
                        Simplificando el trabajo de los despachantes de aduana.
                    </p>
                </div>

                <div style={styles.column}>
                    <span style={styles.sectionTitle}>Recursos</span>
                    <a 
                        href="https://github.com/EmmaDavezac/Sistema-Gestion-Aduanera-SGA/blob/main/Docs/ManualUsuario.pdf" 
                        style={styles.resourceLink}
                    >
                        <i className="fa-solid fa-book-open" style={{ marginRight: '8px' }}></i>
                        Documentación del proyecto
                    </a>
                </div>

                <div style={styles.column}>
                    <span style={styles.sectionTitle}>Soporte Técnico</span>
                    <div style={styles.contactGrid}>
                        <motion.a 
                            whileHover={{ x: 5, color: '#3182ce' }}
                            href="mailto:lucianodavezac@gmail.com" 
                            style={styles.contactLink}
                        >
                            <i className="fa-solid fa-envelope" ></i>
                            lucianodavezac@gmail.com
                        </motion.a>
                        <motion.a 
                            whileHover={ {x: 5, color: '#333'} }
                            href="https://github.com/EmmaDavezac" 
                            style={styles.contactLink}
                        >
                            <i className="fa-brands fa-github" ></i>
                            EmmaDavezac
                        </motion.a>
                        <motion.a 
                            whileHover={{ x: 5, color: '#25D366' }}
                            href="https://wa.me/543438471858" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={styles.contactLink}
                        >
                            <i className="fa-brands fa-whatsapp" style={styles.whatsappIcon}></i>
                            WhatsApp
                        </motion.a>
                    </div>
                </div>
            </div>

            <div style={styles.bottomBar}>
                <div style={styles.credits}>
                    Desarrollado con <i className="fa-solid fa-heart"></i> por <span style={styles.devName}><a href="http://github.com/EmmaDavezac" target="_blank" rel="noopener noreferrer" style={styles.devName}>Emmanuel Davezac</a></span>
                </div>
                <div style={styles.versionGroup}>
                    <span>© {year} Todos los derechos reservados</span>
                    <span style={styles.versionBadge}>v1.0.0</span>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#ffffff',
        borderTop: '2px solid #f1f5f9',
        padding: '40px 0 20px 0',
        marginTop: '60px',
        width: '100%',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    brandGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '5px'
    },
    brandTitle: { fontSize: '20px', fontWeight: '800', color: '#1a365d', letterSpacing: '-0.5px' },
    brandDivider: { color: '#cbd5e0', fontSize: '18px' },
    brandSubtitle: { fontSize: '14px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase' },
    description: { fontSize: '14px', color: '#718096', lineHeight: '1.6', margin: 0 },
    sectionTitle: { fontSize: '12px', fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
    resourceLink: { color: '#3182ce', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: '0.2s' },
    contactGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
    contactLink: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#4a5568', fontSize: '14px', transition: '0.2s' },
    whatsappIcon: { color: '#25D366' },
    bottomBar: {
        borderTop: '1px solid #f1f5f9',
        padding: '20px 40px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: '15px'
    },
    credits: { fontSize: '13px', color: '#718096' },
    devName: { color: '#2d3748', fontWeight: '700' , textDecoration: 'none'},
    versionGroup: { display: 'flex', alignItems: 'center', gap: '15px', color: '#a0aec0', fontSize: '12px' },
    versionBadge: { backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontWeight: '600', color: '#4a5568' }
};

export default Footer;
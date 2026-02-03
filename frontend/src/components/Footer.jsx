import React from 'react';

const Footer = () => {
    const year = new Date().getFullYear();

    const styles = {
        footer: {
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '15px 40px',
            marginTop: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#718096',
            fontSize: '13px'
        },
        section: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        devLink: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: '#4a5568',
            padding: '5px 10px',
            borderRadius: '6px',
            transition: '0.3s',
            backgroundColor: '#f8fafc',
            border: '1px solid #edf2f7'
        },
        whatsapp: { color: '#25D366', fontSize: '16px' },
        email: { color: '#EA4335', fontSize: '16px' }
    };

    return (
        <footer style={styles.footer}>
            <div style={styles.section}>
                <span style={{fontWeight: '700', color: '#2d3748'}}>SGA | Aduana</span>
                <span>© {year}</span>
            </div>

            <div style={styles.section}>
                <span style={{fontWeight: '600', marginRight: '5px'}}>Soporte Desarrollador:</span>
                
                {/* Link a WhatsApp */}
                <a 
                    href="https://wa.me/5491122334455" // Reemplaza con tu número
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={styles.devLink}
                >
                    <i className="fa-brands fa-whatsapp" style={styles.whatsapp}></i>
                    WhatsApp
                </a>

                {/* Link a Email */}
                <a 
                    href="mailto:desarrollador@ejemplo.com" 
                    style={styles.devLink}
                >
                    <i className="fa-solid fa-envelope" style={styles.email}></i>
                    Email
                </a>
            </div>

            <div style={styles.section}>
                <span style={{fontSize: '11px', color: '#a0aec0'}}>v1.0.2</span>
            </div>
        </footer>
    );
};

export default Footer;
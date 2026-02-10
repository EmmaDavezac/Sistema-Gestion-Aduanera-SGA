import React, { useEffect } from 'react';

const Toast = ({ msg, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000); // Se cierra tras 4 segundos
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        toast: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            minWidth: '280px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out',
            border: '1px solid #edf2f7'
        },
        content: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
        },
        icon: {
            fontSize: '20px',
            color: type === 'success' ? '#28a745' : '#d9534f'
        },
        message: {
            fontSize: '14px',
            color: '#4a5568',
            fontWeight: '500',
            flex: 1
        },
        progressBar: {
            height: '4px',
            backgroundColor: type === 'success' ? '#28a745' : '#d9534f',
            width: '100%',
            animation: 'shrink 4s linear forwards'
        }
    };

    return (
        <div style={styles.toast}>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
            <div style={styles.content}>
                <div style={styles.icon}>
                    <i className={type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'}></i>
                </div>
                <div style={styles.message}>{msg}</div>
                <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#cbd5e0' }}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div style={styles.progressBar}></div>
        </div>
    );
};

export default Toast;
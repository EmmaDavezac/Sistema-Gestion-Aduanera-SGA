import React, { useEffect } from 'react';

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    toast: {
      position: 'relative',
      width: '320px',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideIn 0.3s ease-out forwards',
      border: '1px solid #edf2f7',
      pointerEvents: 'auto',
      marginBottom: '10px'
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
    },
    icon: {
      fontSize: '20px',
      color: type === 'success' ? '#2ecc71' : '#e74c3c'
    },
    message: {
      fontSize: '14px',
      color: '#4a5568',
      fontWeight: '500',
      flex: 1,
      wordBreak: 'break-word'
    },
    indicatorContainer: {
      height: '4px',
      width: '100%',
      backgroundColor: '#f0f0f0', 
    },
    indicator: {
      height: '100%',
      backgroundColor: type === 'success' ? '#2ecc71' : '#e74c3c',
      width: '100%',
      transformOrigin: 'left',

      animation: 'shrinkBar 10s linear forwards'
    }
  };

  return (
    <div style={styles.toast}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shrinkBar {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
      
      <div style={styles.content}>
        <div style={styles.icon}>
          <i className={type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'}></i>
        </div>
        <div style={styles.message}>{msg}</div>
        <button 
          onClick={onClose} 
          style={{ 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer', 
            color: '#cbd5e0',
            fontSize: '18px',
            padding: '0 5px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#4a5568'}
          onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <div style={styles.indicatorContainer}>
        <div style={styles.indicator}></div>
      </div>
    </div>
  );
};

export default Toast;
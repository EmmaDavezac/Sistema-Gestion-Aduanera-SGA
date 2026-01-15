import React, { useState, useEffect } from 'react';
import { getExportacionesVencer } from '../api/files';

const AlertasVencimiento = ({ onAlertClick }) => {
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarAlertas = async () => {
            try {
                setLoading(true);
                const data = await getExportacionesVencer();
                console.log("Alertas cargadas desde API:", data);
                setAlertas(data);
                setError(null);
            } catch (err) {
                console.error("Error al obtener alertas:", err);
                setError("No se pudieron cargar las alertas de vencimiento.");
            } finally {
                setLoading(false);
            }
        };

        cargarAlertas();
        // Opcional: Recargar cada 5 minutos para mantener actualizado
        const interval = setInterval(cargarAlertas, 300000);
        return () => clearInterval(interval);
    }, []);

    const styles = {
        container: {
            backgroundColor: '#fff5f5',
            border: '1px solid #feb2b2',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '25px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: 'fadeIn 0.5s ease-in-out'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#c53030',
            margin: '0 0 15px 0',
            fontSize: '1.1rem',
            borderBottom: '2px solid #fed7d7',
            paddingBottom: '10px'
        },
        list: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        item: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            borderLeft: '4px solid #f56565',
            transition: 'transform 0.2s, box-shadow 0.2s',
            textDecoration: 'none',
            color: 'inherit'
        },
        itemHover: {
            transform: 'translateX(5px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        },
        destinacion: {
            fontWeight: 'bold',
            color: '#2d3748'
        },
        cliente: {
            fontSize: '0.9rem',
            color: '#718096',
            marginLeft: '8px'
        },
        fecha: {
            backgroundColor: '#fed7d7',
            color: '#9b2c2c',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 'bold'
        }
    };

    if (loading) return <div style={{padding: '10px', color: '#666'}}>Buscando vencimientos...</div>;
    if (error) return null; // No mostramos nada si hay error para no ensuciar el dashboard
    if (alertas.length === 0) return null; // No hay vencimientos, no se muestra el componente

    return (
        <div style={styles.container}>
            <h4 style={styles.header}>
                <span style={{fontSize: '1.4rem'}}>⚠️</span> 
                VENCIMIENTOS PRÓXIMOS (SIPE / PREIMPOSICIÓN)
            </h4>
            
            <div style={styles.list}>
                {alertas.map((exp) => (
                    <div 
                        key={exp.id} 
                        style={styles.item}
                        onClick={() => onAlertClick(exp.id)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = styles.itemHover.transform;
                            e.currentTarget.style.boxShadow = styles.itemHover.boxShadow;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div>
                            <span style={styles.destinacion}>{exp.numero_destinacion}</span>
                            <span style={styles.cliente}>| {exp.cliente_nombre || 'Cliente Final'}</span>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <span style={styles.fecha}>
                                Vence: {new Date(exp.vencimiento_preimposicion).toLocaleDateString('es-AR')}
                            </span>
                            <span style={{fontSize: '1.2rem'}}>🚨</span>
                        </div>
                    </div>
                ))}
            </div>
            <p style={{fontSize: '0.8rem', color: '#e53e3e', marginTop: '15px', fontStyle: 'italic'}}>
                * Se muestran las exportaciones con vencimiento en los próximos 7 días.
            </p>
        </div>
    );
};

export default AlertasVencimiento;
import React, { useState, useEffect, useCallback,useRef } from 'react';
import { getExportacionesVencer } from '../api/files';

const AlertasVencimiento = ({ onAlertClick }) => {
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    const cargarAlertas = useCallback(async () => {
        try {
            const data = await getExportacionesVencer();
            
            setAlertas(prev => {
                // Verificación profunda: solo actualiza si hay cambios reales en los IDs o fechas
                const idsPrev = prev.map(a => a.id).join(',');
                const idsNuevos = data.map(a => a.id).join(',');
                
                if (idsPrev === idsNuevos) return prev; // No cambia el estado, no hay re-render
                return data;
            });
        } catch (err) {
            console.error("Error al obtener alertas:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Agrega useRef a tus imports de React
    const cargadoRef = useRef(false);

    useEffect(() => {
        // Si ya se disparó la carga inicial, no hacer nada
        if (!cargadoRef.current) {
            cargarAlertas();
            cargadoRef.current = true;
        }

        // El intervalo sigue funcionando normal cada 5 minutos
        const interval = setInterval(cargarAlertas, 30000); 
        
        return () => {
            clearInterval(interval);
            // Opcional: si quieres que al volver a montar el componente cargue de nuevo:
            // cargadoRef.current = false; 
        };
    }, [cargarAlertas]);
        
    // --- CORRECCIÓN DE FECHA ---
    const obtenerConfiguracionUrgencia = (fechaVencimiento) => {
        if (!fechaVencimiento) return { label: "Sin fecha", bg: '#f1f5f9', text: '#64748b', border: '#cbd5e0' };

        // Parseo manual para evitar el error de "un día menos"
        const [year, month, day] = fechaVencimiento.split('-').map(Number);
        const vencimiento = new Date(year, month - 1, day);
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Resetear hora para comparar solo días
        
        const diferencia = vencimiento - hoy;
        const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

        if (dias <= 1) {
            return {
                label: dias === 0 ? "Vence hoy" : (dias < 0 ? "VENCIDO" : "Vence mañana"),
                bg: '#fee2e2', text: '#991b1b', border: '#ef4444'
            };
        } else if (dias <= 3) {
            return {
                label: `Faltan ${dias} días`,
                bg: '#ffedd5', text: '#9a3412', border: '#f97316'
            };
        } else {
            return {
                label: `Faltan ${dias} días`,
                bg: '#f0f9ff', text: '#075985', border: '#0ea5e9'
            };
        }
    };

    if (loading || alertas.length === 0 || !isVisible) return null;

    return (
        <div className="alertas-container">
            <style>{`
                .alertas-container {
                    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
                    padding: 1.5rem; margin-bottom: 2rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                    animation: slideIn 0.4s ease-out;
                }
                .alertas-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .alertas-title { display: flex; align-items: center; gap: 10px; color: #1e293b; font-weight: 700; margin: 0; }
                .count-badge {
                    background: #ef4444; color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.8rem;
                }
                .btn-close {
                    background: none; border: none; color: #94a3b8; cursor: pointer; padding: 5px;
                }
                .alerta-item {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 12px 16px; border-radius: 8px; margin-bottom: 8px;
                    cursor: pointer; transition: all 0.2s ease; border: 1px solid transparent;
                }
                .alerta-item:hover { transform: translateX(4px); filter: brightness(0.98); }
                .badge-vence {
                    padding: 4px 12px; border-radius: 99px; font-size: 0.75rem;
                    font-weight: 700; min-width: 100px; text-align: center;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

<div className="alertas-header">
                <h4 className="alertas-title">
                    <i className="fa-solid fa-bell" ></i>
                    VENCIMIENTOS PRÓXIMOS <span className="count-badge">{alertas.length}</span>
                </h4>
                <button className="btn-close" onClick={() => setIsVisible(false)} title="Cerrar avisos">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {alertas.map((exp) => {
                    const conf = obtenerConfiguracionUrgencia(exp.vencimiento_preimposicion);
                    return (
                        <div 
                            key={exp.id} 
                            className="alerta-item"
                            style={{ backgroundColor: conf.bg, borderLeft: `5px solid ${conf.border}` }}
                            onClick={() => onAlertClick(exp.id)}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '700', color: '#1e293b' }}>
                                    {exp.numero_destinacion}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                                    {exp.cliente_nombre || 'Sin cliente asignado'}
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Vence</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                                        {/* CORRECCIÓN: Mostrar fecha sin desfase */}
                                        {exp.vencimiento_preimposicion.split('-').reverse().join('/')}
                                    </div>
                                </div>
                                <span className="badge-vence" style={{ backgroundColor: '#ffffff80', color: conf.text, border: `1px solid ${conf.border}` }}>
                                    {conf.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AlertasVencimiento;
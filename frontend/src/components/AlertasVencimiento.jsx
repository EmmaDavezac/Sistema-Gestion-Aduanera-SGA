import React, { useState, useEffect, useCallback,useRef } from 'react';
import { getExportacionesVencer } from '../api/api';

const AlertasVencimiento = ({ onAlertClick }) => {
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const [filtroTab, setFiltroTab] = useState('todas'); 

const normalizarFechaUTC = (fechaStr) => {
    if (!fechaStr) return 0;
    const [y, m, d] = fechaStr.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
};
const tabStyle = (active, activeColor = '#1e293b') => ({
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    backgroundColor: active ? activeColor : 'transparent',
    color: active ? '#fff' : '#64748b',
});

const cargarAlertas = useCallback(async () => {
    try {
        const data = await getExportacionesVencer();
        const dataOrdenada = data.sort((a, b) => 
            normalizarFechaUTC(a.vencimiento_preimposicion) - normalizarFechaUTC(b.vencimiento_preimposicion)
        );

        setAlertas(prev => {
            // Comprobamos si hay algún ID nuevo que sea un vencimiento crítico
            const idsPrevios = new Set(prev.map(a => a.id));
            const t = new Date();
            const hoyUTC = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());

            // Filtramos las que acaban de llegar en este polling
            const nuevasAlertas = dataOrdenada.filter(a => !idsPrevios.has(a.id));
            
            // Si hay registros nuevos Y alguno ya está vencido o vence hoy...
            const tieneNuevosCriticos = nuevasAlertas.some(exp => 
                normalizarFechaUTC(exp.vencimiento_preimposicion) <= hoyUTC
            );

           

            // Evitar re-renderizado innecesario si la data es idéntica
            if (JSON.stringify(prev) === JSON.stringify(dataOrdenada)) return prev;
            return dataOrdenada;
        });
    } catch (err) {
        console.error("Error al obtener alertas:", err);
    } finally {
        setLoading(false);
    }
}, []);

const cargadoRef = useRef(false);

useEffect(() => {
    if (!cargadoRef.current) {
        cargarAlertas();
        cargadoRef.current = true;
    }
    const interval = setInterval(cargarAlertas, 30000); 
    return () => clearInterval(interval);
}, [cargarAlertas]);

const obtenerDiasDiferencia = (fechaStr) => {
    const fechaVenc = normalizarFechaUTC(fechaStr);
    const t = new Date();
    const fechaHoy = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
    return Math.round((fechaVenc - fechaHoy) / (1000 * 60 * 60 * 24));
};
// --- FILTRADO (ESTE ES EL ARRAY QUE DEBEMOS USAR) ---
const alertasFiltradas = alertas.filter(exp => {
    const dias = obtenerDiasDiferencia(exp.vencimiento_preimposicion);
    if (filtroTab === 'vencidas') return dias < 0;
    if (filtroTab === 'proximas') return dias >= 0;
    return true;
});
const obtenerConfiguracionUrgencia = (fechaVencimiento) => {
    if (!fechaVencimiento) return { label: "Sin fecha", bg: '#f1f5f9', text: '#64748b', border: '#cbd5e0' };

    const fechaVenc = normalizarFechaUTC(fechaVencimiento);
    const t = new Date();
    // Normalizamos HOY a medianoche UTC
    const fechaHoy = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());

    const milisegundosPorDia = 1000 * 60 * 60 * 24;
    // Usamos Math.round para evitar errores de precisión por segundos/minutos
    const dias = Math.round((fechaVenc - fechaHoy) / milisegundosPorDia);

    if (dias < 0) {
        return {
            label: `VENCIDO (${Math.abs(dias)}d)`,
            bg: '#450a0a', text: '#ffffff', border: '#991b1b'
        };
    } else if (dias === 0) {
        return { label: "Vence hoy", bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
    } else if (dias === 1) {
        return { label: "Vence mañana", bg: '#ffedd5', text: '#9a3412', border: '#f97316' };
    } else if (dias <= 3) {
        return { label: `Faltan ${dias} días`, bg: '#fff7ed', text: '#c2410c', border: '#fb923c' };
    } else {
        return { label: `Faltan ${dias} días`, bg: '#f0f9ff', text: '#075985', border: '#0ea5e9' };
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
                .alertas-header { 
                    display: flex; 
                    flex-direction: row; 
                    justify-content: space-between; 
                    align-items: center; 
                    gap: 1rem; 
                    margin-bottom: 1rem; 
                }
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
    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
        <i className="fa-solid fa-bell"></i> 
        EXPORTACIONES PROXIMAS A VENCER <span className="count-badge">{alertasFiltradas.length}</span>
    </h4>

    <div style={{ display: 'flex', gap: '5px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', flex: 1, maxWidth: '350px' }}>
        <button onClick={() => setFiltroTab('todas')} style={tabStyle(filtroTab === 'todas')}>Todas</button>
        <button onClick={() => setFiltroTab('vencidas')} style={tabStyle(filtroTab === 'vencidas', '#ef4444')}>Vencidas</button>
        <button onClick={() => setFiltroTab('proximas')} style={tabStyle(filtroTab === 'proximas', '#3b82f6')}>Próximas</button>
    </div>

    <button className="btn-close" onClick={() => setIsVisible(false)}><i className="fa-solid fa-xmark"></i></button>
</div>


            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {alertasFiltradas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
                        No hay registros en esta categoría
                    </div>
                ) : (
                    alertasFiltradas.map((exp) => {
                        const conf = obtenerConfiguracionUrgencia(exp.vencimiento_preimposicion);
                        const esVencido = conf.label.includes("VENCIDO");

                        return (
                            <div 
                                key={exp.id} 
                                className={`alerta-item ${esVencido ? 'vencido-pulse' : ''}`}
                                style={{ 
                                    backgroundColor: conf.bg, 
                                    borderLeft: `5px solid ${conf.border}`,
                                    color: esVencido ? '#fff' : 'inherit'
                                }}
                                onClick={() => onAlertClick(exp.id)}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '700', color: esVencido ? '#fff' : '#1e293b' }}>
                                        {esVencido && <i className="fa-solid fa-triangle-exclamation" style={{marginRight: '8px'}}></i>}
                                        {exp.numero_destinacion}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: esVencido ? '#fecaca' : '#475569' }}>
                                        {exp.cliente_nombre || 'Sin cliente asignado'}
                                    </span>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', color: esVencido ? '#fecaca' : '#64748b', textTransform: 'uppercase' }}>Vencimiento de Preimposicion</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                                            {exp.vencimiento_preimposicion.split('-').reverse().join('/')}
                                        </div>
                                    </div>
                                    <span className="badge-vence" style={{ backgroundColor: esVencido ? '#ef4444' : '#ffffff80', color: esVencido ? '#fff' : conf.text, border: `1px solid ${conf.border}` }}>
                                        {conf.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>    
        </div>
    );
};

export default AlertasVencimiento;
import { useState, useEffect } from 'react';
import { 
    getClientes, 
    getArchivos, 
    getAduanas, 
    getImportaciones, 
    getExportaciones 
} from '../api/files'; 

import FileUpload from '../components/FileUpload';
import GestionClientes from '../components/GestionClientes';
import GestionAduanas from '../components/GestionAduanas';
import GestionImportaciones from '../components/GestionImportaciones';
import GestionExportaciones from '../components/GestionExportaciones';
import AlertasVencimiento from '../components/AlertasVencimiento';

const Dashboard = () => {
    const [view, setView] = useState('archivos');
    const [archivos, setArchivos] = useState([]);
    const [stats, setStats] = useState({ 
        clientes: 0, 
        archivos: 0, 
        aduanas: 0, 
        importaciones: 0, 
        exportaciones: 0 
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [dataCli, dataArc, dataAdu, dataImp, dataExp] = await Promise.all([
                getClientes(), 
                getArchivos(),
                getAduanas(),
                getImportaciones(),
                getExportaciones()
            ]);
            
            setStats({ 
                clientes: dataCli.length, 
                archivos: dataArc.length,
                aduanas: dataAdu.length,
                importaciones: dataImp.length,
                exportaciones: dataExp.length
            });
            setArchivos(dataArc);
        } catch (err) {
            console.error("Error al sincronizar datos:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const styles = {
        container: { padding: '30px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
        logoutBtn: { padding: '8px 16px', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '30px' },
        card: { padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
        navTabs: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ccc', overflowX: 'auto' },
        tab: (active) => ({
            padding: '12px 20px', cursor: 'pointer', borderBottom: active ? '3px solid #007bff' : '3px solid transparent',
            color: active ? '#007bff' : '#555', fontWeight: 'bold', whiteSpace: 'nowrap', transition: '0.3s'
        }),
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
        th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', color: '#666', backgroundColor: '#fafafa' },
        td: { padding: '12px', borderBottom: '1px solid #f2f2f2' },
        mainContent: { backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
    };
    //Función para manejar el click en una alerta
    const handleAlertClick = (id) => {
        setView('exportaciones');
        setHighlightId(id);
        
        // Limpiamos el resaltado después de 5 segundos
        setTimeout(() => setHighlightId(null), 5000);
    };
    return (
        <div style={styles.container}>
            {/* Header Principal */}
            <div style={styles.header}>
                <h1 style={{ margin: 0, color: '#333' }}>SGA | Sistema de Gestión Aduanera</h1>
                <button style={styles.logoutBtn} onClick={handleLogout}>Cerrar Sesión</button>
            </div>

            {/* Panel de Estadísticas */}
            <div style={styles.statsGrid}>
                <div style={styles.card}><h2 style={{ margin: 0 }}>{stats.clientes}</h2><p style={{ color: '#888', margin: '5px 0 0' }}>Clientes</p></div>
                <div style={styles.card}><h2 style={{ margin: 0 }}>{stats.aduanas}</h2><p style={{ color: '#888', margin: '5px 0 0' }}>Aduanas</p></div>
                <div style={{...styles.card, borderTop: '4px solid #28a745'}}><h2 style={{ margin: 0 }}>{stats.importaciones}</h2><p style={{ color: '#888', margin: '5px 0 0' }}>Importaciones</p></div>
                <div style={{...styles.card, borderTop: '4px solid #007bff'}}><h2 style={{ margin: 0 }}>{stats.exportaciones}</h2><p style={{ color: '#888', margin: '5px 0 0' }}>Exportaciones</p></div>
                <div style={styles.card}><h2 style={{ margin: 0 }}>{stats.archivos}</h2><p style={{ color: '#888', margin: '5px 0 0' }}>Archivos</p></div>
            </div>
            <AlertasVencimiento onAlertClick={handleAlertClick} />

            {/* Navegación por Pestañas */}
            <div style={styles.navTabs}>
                
                <div style={styles.tab(view === 'archivos')} onClick={() => setView('archivos')}>📁 DOCUMENTACIÓN</div>
                <div style={styles.tab(view === 'clientes')} onClick={() => setView('clientes')}>👥 CLIENTES</div>
                <div style={styles.tab(view === 'aduanas')} onClick={() => setView('aduanas')}>🏛️ ADUANAS</div>
                <div style={styles.tab(view === 'importaciones')} onClick={() => setView('importaciones')}>📥 IMPORTACIONES</div>
                <div style={styles.tab(view === 'exportaciones')} onClick={() => setView('exportaciones')}>📤 EXPORTACIONES</div>
            </div>

            {/* Contenido Dinámico */}
            <div style={styles.mainContent}>
                {view === 'archivos' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '40px' }}>
                        <FileUpload onUploadSuccess={cargarDatos} />
                        <div>
                            <h3 style={{ marginTop: 0 }}>Últimos Archivos Subidos</h3>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Nombre del Archivo</th>
                                        <th style={styles.th}>Relación</th>
                                        <th style={styles.th}>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archivos.map(arc => (
                                        <tr key={arc.id}>
                                            <td style={styles.td}>{arc.nombre}</td>
                                            <td style={styles.td}>
                                                <span style={{ fontSize: '11px', color: '#444', backgroundColor: '#e9ecef', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                                                    {arc.tipo_display}
                                                </span>
                                            </td>
                                            <td style={styles.td}>{new Date(arc.fecha_subida).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {archivos.length === 0 && <tr><td colSpan="3" style={{...styles.td, textAlign: 'center', color: '#999'}}>No hay archivos registrados</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {view === 'clientes' && <GestionClientes onUpdate={cargarDatos} />}
                {view === 'aduanas' && <GestionAduanas onUpdate={cargarDatos} />}
                {view === 'importaciones' && <GestionImportaciones onUpdate={cargarDatos} />}
                {view === 'exportaciones' && <GestionExportaciones onUpdate={cargarDatos} />}
            </div>
        </div>
    );
};

export default Dashboard;
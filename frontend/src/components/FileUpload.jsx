import { useState } from 'react';
import { uploadFile } from '../api/files';

const FileUpload = ({ onUploadSuccess }) => {
    // Estados del formulario
    const [file, setFile] = useState(null);
    const [tipo, setTipo] = useState(1); // 1: Cliente, 2: Importación, 3: Exportación
    const [targetId, setTargetId] = useState(''); // CUIT o ID según el tipo
    const [uploading, setUploading] = useState(false);

    // --- Estilos ---
    const styles = {
        card: { padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' },
        label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#444' },
        input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
        button: { 
            width: '100%', padding: '12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer',
            backgroundColor: uploading ? '#6c757d' : '#007bff', color: 'white', transition: '0.3s'
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !targetId) return alert("Por favor, completa todos los campos.");

        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('tipo', tipo);
        
        // Asignamos el ID al campo correcto según el tipo seleccionado
        if (tipo == 1) formData.append('cuit_cliente', targetId);
        if (tipo == 2) formData.append('id_importacion', targetId);
        if (tipo == 3) formData.append('id_exportacion', targetId);

        setUploading(true);
        try {
            // En api/files.js, asegúrate que uploadFile reciba el formData completo
            await uploadFile(formData); 
            alert("✅ Archivo vinculado correctamente");
            
            // Limpiar formulario
            setFile(null);
            setTargetId('');
            e.target.reset();
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error(err);
            alert("❌ Error al subir: Verifica que el ID/CUIT exista en la base de datos");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={{ marginTop: 0 }}>📤 Vincular Documento</h3>
            <form onSubmit={handleUpload}>
                
                {/* Selector de Tipo */}
                <label style={styles.label}>Categoría del Archivo</label>
                <select 
                    style={styles.input} 
                    value={tipo} 
                    onChange={(e) => { setTipo(e.target.value); setTargetId(''); }}
                >
                    <option value={1}>Archivo de Cliente</option>
                    <option value={2}>Archivo de Importación</option>
                    <option value={3}>Archivo de Exportación</option>
                </select>

                {/* Input Dinámico (Cambia el placeholder según el tipo) */}
                <label style={styles.label}>
                    {tipo == 1 ? "CUIT del Cliente" : tipo == 2 ? "ID de Importación" : "ID de Exportación"}
                </label>
                <input 
                    style={styles.input}
                    type="text"
                    placeholder={tipo == 1 ? "Ej: 20-33444555-9" : "Ej: 45"}
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    required
                />

                {/* Selección de Archivo */}
                <label style={styles.label}>Seleccionar Documento</label>
                <input 
                    type="file" 
                    style={styles.input} 
                    onChange={(e) => setFile(e.target.files[0])} 
                    required 
                />

                <button type="submit" disabled={uploading} style={styles.button}>
                    {uploading ? "Procesando..." : "Subir y Vincular"}
                </button>
            </form>
        </div>
    );
};

export default FileUpload;
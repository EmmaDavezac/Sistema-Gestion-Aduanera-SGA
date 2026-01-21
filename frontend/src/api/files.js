import axios from 'axios';

// 1. Creamos la instancia
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/'
});


// 2. Interceptor de PETICIÓN (Añade el token antes de enviar)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 3. Interceptor de RESPUESTA (Maneja el error 401 si el token expira)
// AÑADE ESTO AQUÍ:
api.interceptors.response.use(
    (response) => response, // Si la respuesta es exitosa, no hace nada
    (error) => {
        if (error.response && error.response.status === 401) {
            // Si el servidor responde 401, el token ya no sirve
            console.warn("Sesión expirada o inválida. Redirigiendo al login...");
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


// ... debajo siguen tus funciones (getClientes, getExportaciones, etc.)


// --- ENDPOINTS PARA CLIENTES ---
// (Reemplaza a tu antigua lógica de Flask)

export const getClientes = async () => {
    const response = await api.get('clientes/');
    return response.data;
};

export const getClienteByCuit = async (cuit) => {
    const response = await api.get(`clientes/${cuit}/`);
    return response.data;
};

export const createCliente = async (clienteData) => {
    const response = await api.post('clientes/', clienteData);
    return response.data;
};

export const updateCliente = async (cuit, clienteData) => {
    const response = await api.put(`clientes/${cuit}/`, clienteData);
    return response.data;
};

export const deleteCliente = async (cuit) => {
    // Django REST maneja el DELETE por el lookup_field (cuit)
    const response = await api.delete(`clientes/${cuit}/`);
    return response.data;
};

export const darAltaCliente = async (cuit) => {
    // Es vital que la URL sea igual a la de update o baja
    // Si usas CUIT como ID, asegúrate de que la ruta sea clientes/EL_CUIT/
    return await api.patch(`clientes/${cuit}/`, { baja: false });
};

// --- ENDPOINTS PARA ARCHIVOS (DOCUMENTOS) ---

export const getArchivos = async () => {
    const response = await api.get('documentos/');
    return response.data;
};

export const getArchivosByImportacion = async (importacionId) => {
    // Usamos 'api' para el token y 'documentos/' por tu ArchivoViewSet
    const response = await api.get(`documentos/?importacion=${importacionId}`);
    return response.data;
};

export const uploadFile = async (formData) => {
    // Importante: Para subir archivos se usa multipart/form-data
    const response = await api.post('documentos/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const downloadFile = async (archivoId, nombreArchivo) => {
    try {
        const response = await api.get(`documentos/${archivoId}/descargar/`, {
            responseType: 'blob', // Crítico para archivos binarios
        });

        // Crear el link de descarga en el DOM
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Asignar el nombre del archivo
        link.setAttribute('download', nombreArchivo || 'archivo_descargado');
        
        document.body.appendChild(link);
        link.click();
        
        // Limpieza
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error al descargar el archivo:", error);
        alert("No se pudo descargar el archivo. Verifique su conexión o permisos.");
    }
};

export const deleteArchivo = async (archivoId) => {
    const response = await api.delete(`documentos/${archivoId}/`);
    return response.data;
};

// La baja de cliente suele ser un UPDATE del campo 'baja' a true
export const darBajaCliente = async (cuit) => {
    const response = await api.patch(`clientes/${cuit}/`, { baja: true });
    return response.data;
};

// --- ENDPOINTS COMPLEMENTARIOS (Aduanas, Impo, Expo) ---

export const getAduanas = async () => {
    const response = await api.get('aduanas/');
    return response.data;
};

export const createAduana = async (data) => {
    return await api.post('aduanas/', data);
};

export const updateAduana = async (id, data) => {
    return await api.put(`aduanas/${id}/`, data);
};

export const deleteAduana = async (id) => {
    return await api.delete(`aduanas/${id}/`);
};

export const getImportaciones = async () => {
    const response = await api.get('importaciones/');
    return response.data;
};

export const createImportacion = async (data) => {
    return await api.post('importaciones/', data);
};

export const updateImportacion = async (id, data) => {
    return await api.put(`importaciones/${id}/`, data);
};

export const deleteImportacion = async (id) => {
    return await api.delete(`importaciones/${id}/`);
};

export const getExportaciones = async () => {
    const response = await api.get('exportaciones/');
    return response.data;
};

export const createExportacion = async (data) => {
    return await api.post('exportaciones/', data);
};

export const updateExportacion = async (id, data) => {
    return await api.put(`exportaciones/${id}/`, data);
};

export const deleteExportacion = async (id) => {
    return await api.delete(`exportaciones/${id}/`);
};

export const getExportacionesVencer = async () => {
    // Usamos el action personalizado que definimos en Django
    const response = await api.get('exportaciones/proximas_a_vencer/');
    return response.data;
};

export const getUsuarios = async () => (await api.get('/usuarios/')).data;

export const createUsuario = async (data) => (await api.post('/usuarios/', data)).data;

export const updateUsuario = async (id, data) => (await api.put(`/usuarios/${id}/`, data)).data;

export const deleteUsuario = async (id) => await api.delete(`/usuarios/${id}/`);

export default api;


import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/'
});

// Este interceptor añade el token automáticamente a TODAS las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Importante: Verifica si tu backend usa "Bearer" o "Token"
        config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
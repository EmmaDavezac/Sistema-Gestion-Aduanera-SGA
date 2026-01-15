import api from './axios';

export const login = async (username, password) => {
    try {
        const response = await api.post('token/', { username, password });
        if (response.data.access) {
            // Guardamos ambos tokens
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Error de conexión");
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    window.location.href = '/login';
};
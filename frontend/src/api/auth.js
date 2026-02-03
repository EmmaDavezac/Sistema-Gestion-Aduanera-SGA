import api from './axios'; // Verifica que el archivo se llame axios.js
import { jwtDecode } from 'jwt-decode';

export const login = async (username, password) => {
    try {
        //console.log("Intentando login para:", username);
        const response = await api.post('token/', { username, password });
        
       // console.log("Respuesta del servidor:", response.data);

        if (response.data && response.data.access) {
            const token = response.data.access;
            localStorage.setItem('token', token);
            localStorage.setItem('refresh', response.data.refresh);
            
            const decoded = jwtDecode(token);
           // console.log("Payload del token:", decoded);

            // Guardamos el permiso
            localStorage.setItem('isAdmin', String(decoded.is_staff)); 
            localStorage.setItem('userName', String(decoded.username)); // Guardamos el nombre de usuario           
            return response.data;
        }
    } catch (error) {
        // Esto te dirá si el error es 401 (credenciales) o 500 (error de código en Django)
        console.error("Error en la petición:", error.response?.status, error.response?.data);
        throw error;
    }
};
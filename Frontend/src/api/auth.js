import api from "./axios";
import { jwtDecode } from "jwt-decode";

export const login = async (username, password, captcha_key, captcha_value) => {
  try {
    const response = await api.post("token/", { 
      username, 
      password,
      captcha_key,   
      captcha_value  
    });

    if (response.data && response.data.access) {
      const token = response.data.access;
      localStorage.setItem("token", token);
      localStorage.setItem("refresh", response.data.refresh);

      const decoded = jwtDecode(token);
      localStorage.setItem("isAdmin", String(decoded.is_staff));
      localStorage.setItem("userName", String(decoded.username));
      
      return response.data;
    }
  } catch (error) {
    console.error(
      "Error en la petición:",
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};
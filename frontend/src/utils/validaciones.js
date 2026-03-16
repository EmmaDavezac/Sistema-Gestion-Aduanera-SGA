import api from "../api/api";

export const validarCUIT = (cuit) => {
  const regex = /^[0-9]{11}$/;
  return regex.test(cuit);
};

export const verificarDestinacionDuplicada = async (numeroDestinacion, idActual = null) => {
  try {
    const response = await api.get(`/exportaciones?numero_destinacion=${numeroDestinacion}`);
    
    if (response.data.length > 0) {
      const duplicado = response.data.find(exp => exp.id !== idActual);
      return !!duplicado; 
    }
    return false;
  } catch (error) {
    console.error("Error al verificar el número de destinación:", error);
    return false; 
  }
};

const validaciones = {
  validarCUIT,
  verificarDestinacionDuplicada
};

export default validaciones;
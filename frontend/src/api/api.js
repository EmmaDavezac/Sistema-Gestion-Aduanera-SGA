import axios from "axios";

const api = axios.create({
  baseURL: "https://sistema-gestion-aduanera-sga-1.onrender.com/api/",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest.url.includes("token/")) {
      console.warn("Sesión expirada. Redirigiendo...");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userName");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export const getClientes = async () => {
  const response = await api.get("clientes/");
  return response.data;
};

export const getClienteByCuit = async (cuit) => {
  const response = await api.get(`clientes/${cuit}/`);
  return response.data;
};

export const createCliente = async (clienteData) => {
  const response = await api.post("clientes/", clienteData);
  return response.data;
};

export const updateCliente = async (cuit, clienteData) => {
  const { cuit: _, ...dataToSend } = clienteData;

  Object.keys(dataToSend).forEach((key) => {
    if (dataToSend[key] === "") {
      dataToSend[key] = null;
    }
  });

  return await api.patch(`clientes/${cuit}/`, dataToSend);
};
export const deleteCliente = async (cuit) => {
  const response = await api.delete(`clientes/${cuit}/`);
  return response.data;
};

export const darAltaCliente = async (cuit) => {
  return await api.patch(`clientes/${cuit}/`, { baja: false });
};

export const getArchivos = async () => {
  const response = await api.get("documentos/");
  return response.data;
};

export const getArchivosByImportacion = async (importacionId) => {
  const response = await api.get(`documentos/?importacion=${importacionId}`);
  return response.data;
};

export const uploadFile = async (formData) => {
  const response = await api.post("documentos/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const downloadFile = async (archivoId, nombreArchivo) => {
  try {
    const response = await api.get(`documentos/${archivoId}/descargar/`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", nombreArchivo || "archivo_descargado");
    document.body.appendChild(link);
    link.click();
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

export const darBajaCliente = async (cuit) => {
  const response = await api.patch(`clientes/${cuit}/`, { baja: true });
  return response.data;
};

export const getAduanas = async () => {
  const response = await api.get("aduanas/");
  return response.data;
};

export const createAduana = async (data) => {
  return await api.post("aduanas/", data);
};

export const deleteAduana = async (id) => {
  return await api.delete(`aduanas/${id}/`);
};

export const getImportaciones = async () => {
  const response = await api.get("importaciones/");
  return response.data;
};

export const createImportacion = async (data) => {
  return await api.post("importaciones/", data);
};

export const updateImportacion = async (id, data) => {
  return await api.put(`importaciones/${id}/`, data);
};

export const deleteImportacion = async (id) => {
  return await api.delete(`importaciones/${id}/`);
};

export const getExportaciones = async () => {
  const response = await api.get("exportaciones/");
  return response.data;
};

export const createExportacion = async (data) => {
  return await api.post("exportaciones/", data);
};

export const updateExportacion = async (id, data) => {
  return await api.put(`exportaciones/${id}/`, data);
};

export const deleteExportacion = async (id) => {
  return await api.delete(`exportaciones/${id}/`);
};

export const getExportacionesVencer = async () => {
  const response = await api.get("exportaciones/proximas_a_vencer/");
  return response.data;
};
export const getArchivosByExportacion = async (exportacionId) => {
  const response = await api.get(`documentos/?exportacion=${exportacionId}`);
  return response.data;
};

export const getUsuarios = async () => (await api.get("/usuarios/")).data;

export const createUsuario = async (data) =>
  (await api.post("/usuarios/", data)).data;

export const updateUsuario = async (id, data) =>
  (await api.put(`/usuarios/${id}/`, data)).data;

export default api;

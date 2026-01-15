import { useState, useEffect } from "react";
import {
  getClientes,
  createCliente,
  updateCliente,
  getArchivos,
  uploadFile,
  downloadFile,
  deleteArchivo,
  darBajaCliente,
  darAltaCliente,
} from "../api/files";

const GestionClientes = ({ onUpdate }) => {
  const [clientes, setClientes] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [view, setView] = useState("list");
  const [isEditing, setIsEditing] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);

  const [formData, setFormData] = useState({
    cuit: "",
    nombre: "",
    domicilio: "",
    telefono_1: "",
    telefono_2: "",
    fecha_inicio_actividad: "",
    observaciones: "",
    baja: false,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [c, a] = await Promise.all([getClientes(), getArchivos()]);
      setClientes(c);
      setArchivos(a);

      // Si hay un cliente seleccionado, actualizar sus datos desde la lista fresca
      if (clienteSeleccionado) {
        const actualizado = c.find(
          (item) => item.cuit === clienteSeleccionado.cuit
        );
        if (actualizado) {
          setClienteSeleccionado(actualizado);
          setFormData(actualizado);
        }
      }
    } catch (err) {
      console.error("Error cargando datos", err);
    }
  };
  const handleAltaCliente = async (cuit) => {
    if (!window.confirm("¿Deseas reactivar este cliente?")) return;
    try {
      const response = await darAltaCliente(cuit);
      console.log("Servidor respondió ok:", response);
      await cargarDatos();
      alert("Cliente reactivado con éxito");
    } catch (err) {
      console.error("ERROR AL DAR DE ALTA:");
      console.dir(err); // Esto te mostrará el objeto de error completo en la consola

      const msg =
        err.response?.data?.detail || "Error de conexión con el servidor";
      alert("No se pudo dar de alta: " + msg);
    }
  };
  const handleEliminarArchivo = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este archivo?")) return;
    try {
      await deleteArchivo(id);
      await cargarDatos();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  const handleBajaCliente = async (cuit) => {
    if (!window.confirm("¿Confirmas la baja de este cliente?")) return;
    try {
      await darBajaCliente(cuit);
      // Sincronizamos con el servidor
      await cargarDatos();
      alert("Cliente dado de baja correctamente");
    } catch (err) {
      alert("Error al procesar la baja");
    }
  };

  // Filtro limpio: No filtramos por 'baja', solo por búsqueda de texto
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.cuit.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && clienteSeleccionado) {
        await updateCliente(formData.cuit, formData);
        alert("Datos actualizados");
      } else {
        await createCliente(formData);
        alert("Cliente registrado");
      }
      await cargarDatos();
      if (onUpdate) onUpdate();
      volverALista();
    } catch (err) {
      alert("Error en la operación");
    }
  };

  const handleFileUpload = async () => {
    if (!fileToUpload) return;
    const fData = new FormData();
    fData.append("archivo", fileToUpload);
    fData.append("tipo", 1);
    fData.append("cuit_cliente", clienteSeleccionado.cuit);
    fData.append("nombre", fileToUpload.name);

    try {
      await uploadFile(fData);
      alert("Archivo añadido");
      setFileToUpload(null);
      await cargarDatos();
    } catch (err) {
      alert("Error al subir");
    }
  };

  const verMasInfo = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(cliente);
    setView("detail");
    setIsEditing(false);
  };

  const volverALista = () => {
    setClienteSeleccionado(null);
    setIsEditing(false);
    setView("list");
    setFormData({
      cuit: "",
      nombre: "",
      domicilio: "",
      telefono_1: "",
      telefono_2: "",
      fecha_inicio_actividad: "",
      observaciones: "",
      baja: false,
    });
  };

  const styles = {
    badge: (baja) => ({
      padding: "3px 10px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "bold",
      backgroundColor: baja ? "#ffebeb" : "#e6fffa",
      color: baja ? "#e53e3e" : "#2c7a7b",
      border: baja ? "1px solid #feb2b2" : "1px solid #81e6d9",
    }),
    infoBox: {
      padding: "15px",
      backgroundColor: "white",
      borderRadius: "8px",
      border: "1px solid #eee",
      marginBottom: "10px",
    },
    input: {
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      marginBottom: "10px",
      width: "100%",
      backgroundColor: "#fcfcfc",
    },
    btn: {
      padding: "10px 15px",
      borderRadius: "4px",
      cursor: "pointer",
      border: "none",
      fontWeight: "bold",
    },
  };

  return (
    <div style={{ padding: "10px" }}>
      {view === "list" && (
        <div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              style={styles.input}
              placeholder="Buscar cliente por CUIT o Razón Social..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button
              style={{
                ...styles.btn,
                backgroundColor: "#28a745",
                color: "white",
              }}
              onClick={() => setView("form")}
            >
              + Nuevo Cliente
            </button>
          </div>

          {clientesFiltrados.map((c) => (
            <div
              key={c.cuit}
              style={{
                ...styles.infoBox,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderLeft: c.baja ? "5px solid #e53e3e" : "5px solid #38a169",
                opacity: c.baja ? 0.8 : 1,
              }}
            >
              <div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <strong style={{ fontSize: "16px" }}>{c.nombre}</strong>
                  <span style={styles.badge(c.baja)}>
                    {c.baja ? "INACTIVO" : "ACTIVO"}
                  </span>
                </div>
                <div
                  style={{ fontSize: "13px", color: "#666", marginTop: "5px" }}
                >
                  CUIT: {c.cuit} | 📍 {c.domicilio || "Sin domicilio"}
                </div>
              </div>
              <button
                style={{
                  ...styles.btn,
                  backgroundColor: "#007bff",
                  color: "white",
                }}
                onClick={() => verMasInfo(c)}
              >
                Más Información
              </button>
            </div>
          ))}
        </div>
      )}

      {view === "form" && (
        <div style={styles.infoBox}>
          <button style={styles.btn} onClick={volverALista}>
            ← Cancelar
          </button>
          <h2 style={{ margin: "20px 0" }}>Registrar Nuevo Cliente</h2>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <input
              style={styles.input}
              placeholder="CUIT"
              onChange={(e) =>
                setFormData({ ...formData, cuit: e.target.value })
              }
              required
            />
            <input
              style={styles.input}
              placeholder="Razón Social"
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              required
            />
            <button
              type="submit"
              style={{
                ...styles.btn,
                backgroundColor: "#28a745",
                color: "white",
                gridColumn: "span 2",
              }}
            >
              Confirmar Registro
            </button>
          </form>
        </div>
      )}

      {view === "detail" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <button style={styles.btn} onClick={volverALista}>
              ← Volver a la lista
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              {/* 1. Estos botones SOLO se ven si isEditing es true */}
              {isEditing && (
                <>
                  {formData.baja ? (
                    <button
                      type="button"
                      style={{
                        ...styles.btn,
                        backgroundColor: "#38a169",
                        color: "white",
                      }}
                      onClick={() => handleAltaCliente(formData.cuit)}
                    >
                      Dar de Alta
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={{
                        ...styles.btn,
                        backgroundColor: "#e53e3e",
                        color: "white",
                      }}
                      onClick={() => handleBajaCliente(formData.cuit)}
                    >
                      Dar de Baja
                    </button>
                  )}
                </>
              )}

              {/* 2. El botón de Editar/Cancelar siempre es visible en el detalle */}
              <button
                type="button"
                style={{
                  ...styles.btn,
                  backgroundColor: isEditing ? "#718096" : "#ecc94b",
                  color: isEditing ? "white" : "black",
                }}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancelar Edición" : "Editar Información"}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div style={styles.infoBox}>
              <h3>
                Ficha del Cliente{" "}
                {formData.baja && (
                  <span style={{ color: "#e53e3e" }}>(DADO DE BAJA)</span>
                )}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        
        <div style={{ gridColumn: 'span 2' }}>
            <label style={styles.label}>Nombre / Razón Social</label>
            <input 
                style={styles.input} 
                value={formData.nombre} 
                disabled={!isEditing} 
                onChange={e => setFormData({...formData, nombre: e.target.value})} 
            />
        </div>

        <div>
            <label style={styles.label}>CUIT</label>
            <input 
                style={{...styles.input, backgroundColor: '#eee'}} 
                value={formData.cuit} 
                disabled={true} 
            />
        </div>

        <div>
            <label style={styles.label}>Domicilio</label>
            <input 
                style={styles.input} 
                value={formData.domicilio || ''} 
                disabled={!isEditing} 
                onChange={e => setFormData({...formData, domicilio: e.target.value})} 
            />
        </div>

        <div>
            <label style={styles.label}>Teléfono 1</label>
            <input 
                style={styles.input} 
                value={formData.telefono_1 || ''} 
                disabled={!isEditing} 
                onChange={e => setFormData({...formData, telefono_1: e.target.value})} 
            />
        </div>

        <div>
            <label style={styles.label}>Teléfono 2</label>
            <input 
                style={styles.input} 
                value={formData.telefono_2 || ''} 
                disabled={!isEditing} 
                onChange={e => setFormData({...formData, telefono_2: e.target.value})} 
            />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
            <label style={styles.label}>Observaciones</label>
            <textarea 
                style={{...styles.input, height: '80px'}} 
                value={formData.observaciones || ''} 
                disabled={!isEditing} 
                onChange={e => setFormData({...formData, observaciones: e.target.value})} 
            />
        </div>

        {isEditing && (
            <button type="submit" style={{...styles.btn, backgroundColor: '#3182ce', color: 'white', gridColumn: 'span 2', marginTop: '10px'}}>
                Guardar Todos los Cambios
            </button>
        )}
    </form>
            </div>

            <div style={styles.infoBox}>
              <h3>Documentos Asociados</h3>
              {isEditing && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "15px",
                    border: "2px dashed #cbd5e0",
                  }}
                >
                  <input
                    type="file"
                    onChange={(e) => setFileToUpload(e.target.files[0])}
                  />
                  <button
                    onClick={handleFileUpload}
                    style={{
                      ...styles.btn,
                      backgroundColor: "#3182ce",
                      color: "white",
                      fontSize: "12px",
                      marginTop: "10px",
                      width: "100%",
                    }}
                  >
                    Subir
                  </button>
                </div>
              )}
              {archivos
                .filter((a) => a.cuit_cliente === clienteSeleccionado.cuit)
                .map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px",
                      borderBottom: "1px solid #edf2f7",
                    }}
                  >
                    <span>{a.nombre}</span>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => downloadFile(a.id, a.nombre)}
                        style={styles.btn}
                      >
                        ⬇
                      </button>
                      {isEditing && (
                        <button
                          onClick={() => handleEliminarArchivo(a.id)}
                          style={{ ...styles.btn, color: "red" }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionClientes;

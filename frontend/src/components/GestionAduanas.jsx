import { useState, useEffect, useRef, useCallback } from "react";
import { getAduanas, createAduana, deleteAduana } from "../api/api";
import SkeletonTable from "./SkeletonTable";

const GestionAduanas = ({ onNotification }) => {
  const [aduanas, setAduanas] = useState([]);
  const [view, setView] = useState("list");
  const [busqueda, setBusqueda] = useState("");
  const [formData, setFormData] = useState({ id: "", nombre: "" });
  const [loading, setLoading] = useState(true);

  const cargadoRef = useRef(false);

  const cargarAduanas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAduanas();
      setAduanas(data);
    } catch (err) {
      onNotification("Error al cargar aduanas. Intente nuevamente.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cargadoRef.current) {
      cargarAduanas();
      cargadoRef.current = true;
    }
  }, [cargarAduanas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAduana(formData);
      onNotification("Aduana registrada con éxito", "success");
      setView("list");
      setFormData({ id: "", nombre: "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      cargarAduanas();
    } catch (err) {
      onNotification(
        "Error: El código (ID) ya existe o los datos son inválidos.",
        "error"
      );
    }
  };

  const handleEliminar = async (id) => {
    if (
      window.confirm(
        "¿Está seguro de eliminar esta aduana? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await deleteAduana(id);
        cargarAduanas();
        onNotification("Aduana eliminada exitosamente.", "success");
      } catch (err) {
        onNotification(
          "Error al eliminar la aduana. Intente nuevamente.",
          "error"
        );
      }
    }
  };

  const aduanasFiltradas = aduanas.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.id.toString().includes(busqueda)
  );

  const styles = {
    container: {
      padding: "30px",
      backgroundColor: "#f4f7f6",
      minHeight: "100vh",
      fontFamily: "Segoe UI, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
      gap: "15px",
      flexWrap: "wrap",
    },
    searchWrapper: { position: "relative", width: "60%" },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#888",
    },
    card: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      marginBottom: "15px",
      border: "1px solid #eee",
    },
    input: {
      padding: "12px 12px 12px 40px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      width: "100%",
      fontSize: "14px",
      boxSizing: "border-box",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "bold",
      fontSize: "12px",
      color: "#4a5568",
    },
    formInput: {
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      width: "100%",
      marginTop: "5px",
      boxSizing: "border-box",
    },
    btnGreen: {
      padding: "12px 24px",
      backgroundColor: "#2ecc71",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    btnDelete: {
      padding: "8px 12px",
      backgroundColor: "transparent",
      color: "#e53e3e",
      border: "1px solid #e53e3e",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "0.3s",
    },
    badge: {
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      backgroundColor: "#edf2f7",
      color: "#2d3748",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      {view === "list" ? (
        <div>
          <div style={styles.header}>
            <div style={styles.searchWrapper}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={styles.searchIcon}
              ></i>
              <input
                style={styles.input}
                placeholder="Buscar por nombre o código..."
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button style={styles.btnGreen} onClick={() => setView("form")}>
              <i className="fa-solid fa-plus"></i> Registrar
            </button>
          </div>

          {loading ? (
            <SkeletonTable rows={4} />
          ) : aduanasFiltradas.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#a0aec0",
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "2px dashed #e2e8f0",
              }}
            >
              <i
                className="fa-solid fa-box-open"
                style={{
                  fontSize: "50px",
                  marginBottom: "15px",
                  color: "#cbd5e0",
                }}
              ></i>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#4a5568" }}>
                No hay coincidencias
              </h3>
              <p style={{ marginTop: "8px" }}>
                Prueba con otro código u otro nombre.
              </p>
            </div>
          ) : (
            aduanasFiltradas.map((a) => (
              <div key={a.id} style={styles.card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        backgroundColor: "#ebf4ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3182ce",
                      }}
                    >
                      <i className="fa-solid fa-building-columns"></i>
                    </div>
                    <div>
                      <span style={styles.badge}>ID: {a.id}</span>
                      <h3
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "16px",
                          color: "#2d3748",
                        }}
                      >
                        {a.nombre}
                      </h3>
                    </div>
                  </div>
                  <button
                    style={styles.btnDelete}
                    onClick={() => handleEliminar(a.id)}
                    title="Eliminar Aduana"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <button
            onClick={() => setView("list")}
            style={{
              border: "none",
              background: "none",
              color: "#3182ce",
              cursor: "pointer",
              marginBottom: "20px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Cancelar y volver
          </button>

          <div style={styles.card}>
            <h2
              style={{ marginTop: 0, marginBottom: "20px", fontSize: "20px" }}
            >
              Registrar Aduana
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label style={styles.label}>
                  Código Identificador (No modificable después)
                </label>
                <input
                  style={styles.formInput}
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id: e.target.value.toUpperCase().slice(0, 4),
                    })
                  }
                  required
                  placeholder="Ej: 015"
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={styles.label}>Nombre Oficial</label>
                <input
                  style={styles.formInput}
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                  placeholder="Ej: Concepción del Uruguay"
                />
              </div>
              <button
                type="submit"
                style={{
                  ...styles.btnGreen,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <i className="fa-solid fa-check"></i> Confirmar Registro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAduanas;

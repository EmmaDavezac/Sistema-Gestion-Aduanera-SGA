import { useState, useEffect, useRef, useCallback } from "react";
import { getAduanas, createAduana, deleteAduana } from "../api/api";
import SkeletonTable from "./SkeletonTable";

const GestionAduanas = ({ onNotification }) => {
  const [aduanas, setAduanas] = useState([]);
  const [view, setView] = useState("list");
  const [busqueda, setBusqueda] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAduana, setSelectedAduana] = useState(null);
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

  const volverALista = (saltarConfirmacion = false) => {
    if (saltarConfirmacion || window.confirm("¿Desea volver al listado?")) {
      setView("list");
      setIsEditing(false);
      setSelectedAduana(null);
      setFormData({ id: "", nombre: "" });
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAduana(formData);
      onNotification("Aduana registrada con éxito", "success");
      await cargarAduanas();
      volverALista(true);
    } catch (err) {
      onNotification("Error: El código (ID) ya existe o los datos son inválidos.", "error");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta aduana? Esta acción no se puede deshacer.")) return;
    try {
      await deleteAduana(id);
      await cargarAduanas();
      onNotification("Aduana eliminada exitosamente.", "success");
    } catch (err) {
      onNotification("Error al eliminar la aduana. Intente nuevamente.", "error");
    }
  };

  const verDetalle = (aduana) => {
    setSelectedAduana(aduana);
    setFormData({ id: aduana.id, nombre: aduana.nombre });
    setIsEditing(true);
    setView("form");
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
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
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
    formInput: {
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      width: "100%",
      marginTop: "5px",
      boxSizing: "border-box",
      transition: "all 0.3s",
    },
    label: {
      fontWeight: "600",
      fontSize: "13px",
      color: "#4a5568",
      marginBottom: "5px",
      display: "inline-block",
    },
    sectionTitle: {
      gridColumn: "1 / -1",
      fontWeight: "700",
      marginTop: "25px",
      marginBottom: "10px",
      paddingBottom: "8px",
      borderBottom: "2px solid #3182ce",
      color: "#2d3748",
      fontSize: "16px",
      textTransform: "uppercase",
      letterSpacing: "1px",
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
    btnAction: (color) => ({
      padding: "8px 12px",
      backgroundColor: "transparent",
      color: color,
      border: `1px solid ${color}`,
      borderRadius: "6px",
      cursor: "pointer",
      transition: "0.3s",
      marginLeft: "8px",
    }),
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
              <i className="fa-solid fa-magnifying-glass" style={styles.searchIcon}></i>
              <input
                style={styles.input}
                placeholder="Buscar por nombre o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button
              style={styles.btnGreen}
              onClick={() => {
                setIsEditing(false);
                setFormData({ id: "", nombre: "" });
                setView("form");
              }}
            >
              <i className="fa-solid fa-plus"></i> Registrar
            </button>
          </div>

          {loading ? (
            <SkeletonTable rows={4} />
          ) : aduanasFiltradas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#a0aec0", backgroundColor: "#fff", borderRadius: "12px", border: "2px dashed #e2e8f0" }}>
              <i className="fa-solid fa-box-open" style={{ fontSize: "50px", marginBottom: "15px", color: "#cbd5e0" }}></i>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#4a5568" }}>No hay coincidencias</h3>
              <p style={{ marginTop: "8px" }}>Prueba con otro código u otro nombre.</p>
            </div>
          ) : (
            aduanasFiltradas.map((a) => (
              <div key={a.id} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ width: "45px", height: "45px", borderRadius: "50%", backgroundColor: "#ebf4ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#3182ce" }}>
                      <i className="fa-solid fa-building-columns"></i>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <strong style={{ fontSize: "16px", color: "#2d3748" }}>{a.nombre}</strong>
                        <span style={styles.badge}>ID: {a.id}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex" }}>
                    <button style={styles.btnAction("#3182ce")} onClick={() => verDetalle(a)} title="Ver Detalle">
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    <button style={styles.btnAction("#e53e3e")} onClick={() => handleEliminar(a.id)} title="Eliminar Aduana">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={styles.header}>
            <button
              onClick={() => volverALista(false)}
              style={{ border: "none", background: "none", color: "#3182ce", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <i className="fa-solid fa-arrow-left"></i> Volver al listado
            </button>
          </div>

          <div style={styles.card}>
            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}
            >
              <div style={styles.sectionTitle}>Datos de la Aduana</div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Código Identificador *</label>
                <input
                  style={{ ...styles.formInput, backgroundColor: isEditing ? "#f8fafc" : "#fff" }}
                  value={formData.id}
                  disabled={isEditing}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase().slice(0, 4) })}
                  required
                  placeholder="Ej: 015"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={styles.label}>Nombre *</label>
                <input
                  style={styles.formInput}
                  value={formData.nombre}
                  disabled={isEditing}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Concepción del Uruguay"
                />
              </div>

              {!isEditing && (
                <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                  <button
                    type="submit"
                    style={{ ...styles.btnGreen, width: "100%", justifyContent: "center", padding: "15px", fontSize: "16px" }}
                  >
                    <i className="fa-solid fa-floppy-disk"></i> Guardar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAduanas;
import React, { useState, useEffect } from "react";
import { getUsuarios, updateUsuario } from "../api/api";
import ProfileSkeleton from "./ProfileSkeleton";
const Profile = ({ onNotification }) => {
  const [userData, setUserData] = useState({
    id: "",
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [backupData, setBackupData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [loading, setLoading] = useState(true);

  const [passwords, setPasswords] = useState({
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const lista = await getUsuarios();
      const actual = lista.find(
        (u) => u.username === localStorage.getItem("userName")
      );

      if (actual) {
        const currentData = {
          id: actual.id,
          username: actual.username || "",
          email: actual.email || "",
          first_name: actual.first_name || "",
          last_name: actual.last_name || "",
        };

        setUserData(currentData);
        setBackupData(currentData);
        localStorage.setItem("userId", actual.id);
      }
    } catch (err) {
      onNotification("Error al cargar datos del servidor", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setUserData(backupData);
    setIsEditing(false);
    setShowPasswordSection(false);
    setPasswords({ new_password: "", confirm_password: "" });
  };

  const handleDataChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (showPasswordSection) {
      if (!passwords.new_password) {
        return onNotification("La contraseña no puede estar vacía", "error");
      }
      if (passwords.new_password !== passwords.confirm_password) {
        return onNotification("Las contraseñas no coinciden", "error");
      }
      if (passwords.new_password.length < 8) {
        return onNotification(
          "La contraseña debe tener al menos 8 caracteres",
          "error"
        );
      }
    }

    try {
      const dataToSave = { ...userData };

      if (showPasswordSection && passwords.new_password) {
        dataToSave.password = passwords.new_password;
      }

      const response = await updateUsuario(userData.id, dataToSave);

      setUserData(response);
      setBackupData(response);
      localStorage.setItem("userName", response.username);

      onNotification("¡Perfil y seguridad actualizados!", "success");
      setIsEditing(false);
      setShowPasswordSection(false);
      setPasswords({ new_password: "", confirm_password: "" });
    } catch (err) {
      onNotification("Error al guardar los cambios", "error");
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Mi Perfil</h2>

        <div style={styles.sectionTitle}>Datos Personales</div>
        <div style={styles.field}>
          <label style={styles.label}>Usuario</label>
          <input
            name="username"
            value={userData.username}
            onChange={handleDataChange}
            disabled
            style={styles.input}
          />
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Nombre</label>
            <input
              name="first_name"
              value={userData.first_name}
              onChange={handleDataChange}
              disabled={!isEditing}
              style={styles.input}
              required
              placeholder="Ingresa tu nombre"
            />
          </div>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Apellido</label>
            <input
              name="last_name"
              value={userData.last_name}
              onChange={handleDataChange}
              disabled={!isEditing}
              style={styles.input}
              required
              placeholder="Ingresa tu apellido"
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            name="email"
            value={userData.email}
            onChange={handleDataChange}
            disabled={!isEditing}
            style={styles.input}
            required
            placeholder="Ingresa tu email"
          />
        </div>

        <div
          style={{
            ...styles.sectionTitle,
            marginTop: "20px",
            borderTop: "1px solid #eee",
            paddingTop: "15px",
          }}
        >
          Seguridad
        </div>

        {!showPasswordSection ? (
          <button
            onClick={() => {
              setShowPasswordSection(true);
              setIsEditing(true);
            }}
            style={styles.btnLink}
          >
            <i className="fa-solid fa-lock"></i> Cambiar contraseña
          </button>
        ) : (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <div style={styles.field}>
              <label style={styles.label}>Nueva Contraseña</label>
              <input
                type="password"
                name="new_password"
                value={passwords.new_password}
                onChange={handlePasswordChange}
                style={styles.input}
                placeholder="Min. 8 caracteres"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirmar Contraseña</label>
              <input
                type="password"
                name="confirm_password"
                value={passwords.confirm_password}
                onChange={handlePasswordChange}
                style={styles.input}
              />
            </div>
          </div>
        )}

        <div style={styles.actions}>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={styles.btnEdit}>
              Editar Datos
            </button>
          ) : (
            <>
              <button onClick={handleSave} style={styles.btnSave}>
              <i className="fa-solid fa-floppy-disk"></i> Guardar
              </button>
              <button onClick={handleCancel} style={styles.btnCancel}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
  },
  title: { marginBottom: "20px", color: "#1a202c", textAlign: "center" },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#a0aec0",
    marginBottom: "15px",
    textTransform: "uppercase",
  },
  field: { marginBottom: "15px" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#4a5568",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box",
  },
  row: { display: "flex", gap: "15px" },
  actions: { marginTop: "25px", display: "flex", gap: "10px" },
  btnEdit: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnSave: {
    flex: 2,
    padding: "12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnCancel: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#edf2f7",
    color: "#4a5568",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnLink: {
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
};

export default Profile;

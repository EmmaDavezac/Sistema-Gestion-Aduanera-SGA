import { useState, useEffect } from "react";
import { getUsuarios, updateUsuario } from "../api/api";
import ProfileSkeleton from "./ProfileSkeleton";

const Profile = ({ onNotification }) => {
  const [userData, setUserData] = useState({
    id: "", username: "", email: "", first_name: "", last_name: "",
  });
  const [backupData, setBackupData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ new_password: "", confirm_password: "" });

  useEffect(() => { loadProfileData(); }, []);

  const loadProfileData = async () => {
    try {
      const lista = await getUsuarios();
      const actual = lista.find((u) => u.username === localStorage.getItem("userName"));
      if (actual) {
        const current = {
          id: actual.id,
          username: actual.username || "",
          email: actual.email || "",
          first_name: actual.first_name || "",
          last_name: actual.last_name || "",
        };
        setUserData(current);
        setBackupData(current);
        localStorage.setItem("userId", actual.id);
      }
    } catch {
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

  const handleSave = async () => {
    if (showPasswordSection) {
      if (!passwords.new_password) return onNotification("La contraseña no puede estar vacía", "error");
      if (passwords.new_password !== passwords.confirm_password) return onNotification("Las contraseñas no coinciden", "error");
      if (passwords.new_password.length < 8) return onNotification("La contraseña debe tener al menos 8 caracteres", "error");
    }
    try {
      const dataToSave = { ...userData };
      if (showPasswordSection && passwords.new_password) dataToSave.password = passwords.new_password;
      const response = await updateUsuario(userData.id, dataToSave);
      setUserData(response);
      setBackupData(response);
      localStorage.setItem("userName", response.username);
      onNotification("¡Perfil actualizado!", "success");
      setIsEditing(false);
      setShowPasswordSection(false);
      setPasswords({ new_password: "", confirm_password: "" });
    } catch {
      onNotification("Error al guardar los cambios", "error");
    }
  };

  if (loading) return <ProfileSkeleton />;

  const inputClass = (disabled) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm transition-colors ${
      disabled
        ? "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500"
    }`;

  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-full font-sans">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <i className="fa-solid fa-circle-user text-xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white m-0 tracking-tight">Mi Perfil</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 m-0">Gestioná tu información personal</p>
        </div>
      </div>

      <div className="max-w-2xl">
        {/* Card datos personales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              Datos Personales
            </span>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer border-none"
              >
                <i className="fa-solid fa-pen-to-square"></i> Editar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Usuario</label>
              <input
                value={userData.username}
                disabled
                className={inputClass(true)}
              />
            </div>
            <div>
              <label className={labelClass}>Nombre *</label>
              <input
                name="first_name"
                value={userData.first_name}
                onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                disabled={!isEditing}
                placeholder="Ingresá tu nombre"
                className={inputClass(!isEditing)}
              />
            </div>
            <div>
              <label className={labelClass}>Apellido *</label>
              <input
                name="last_name"
                value={userData.last_name}
                onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                disabled={!isEditing}
                placeholder="Ingresá tu apellido"
                className={inputClass(!isEditing)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Email *</label>
              <input
                name="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                disabled={!isEditing}
                placeholder="Ingresá tu email"
                className={inputClass(!isEditing)}
              />
            </div>
          </div>
        </div>

        {/* Card seguridad */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              Seguridad
            </span>
          </div>

          {!showPasswordSection ? (
            <button
              onClick={() => { setShowPasswordSection(true); setIsEditing(true); }}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold bg-none border-none cursor-pointer p-0 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <i className="fa-solid fa-lock"></i> Cambiar contraseña
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nueva Contraseña</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                  placeholder="Mín. 8 caracteres"
                  className={inputClass(false)}
                />
              </div>
              <div>
                <label className={labelClass}>Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwords.confirm_password}
                  onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                  placeholder="Repetir contraseña"
                  className={`${inputClass(false)} ${
                    passwords.confirm_password && passwords.new_password !== passwords.confirm_password
                      ? "border-red-400 dark:border-red-500"
                      : ""
                  }`}
                />
                {passwords.confirm_password && passwords.new_password !== passwords.confirm_password && (
                  <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        {isEditing && (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors cursor-pointer border-none text-sm"
            >
              <i className="fa-solid fa-floppy-disk"></i> Guardar cambios
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-semibold rounded-lg transition-colors cursor-pointer border-none text-sm"
            >
              <i className="fa-solid fa-xmark"></i> Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
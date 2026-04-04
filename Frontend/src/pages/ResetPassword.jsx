// ResetPassword.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    if (password.length < 8)  { setError("Mínimo 8 caracteres"); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/api/password-reset-confirm/`, { uid, token, password });
      navigate("/login", { state: { mensaje: "Contraseña actualizada. Podés iniciar sesión." } });
    } catch (err) {
      setError(err.response?.data?.error || "Link inválido o expirado.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full pl-10 pr-10 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-all ${
      hasError ? "border-red-400 dark:border-red-500" : "border-gray-200 dark:border-gray-700"
    }`;

  return (
    <div className="flex min-h-screen w-screen overflow-hidden font-sans bg-gray-50 dark:bg-gray-950">

      {/* Panel izquierdo */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] flex-shrink-0 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 p-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl">
            <i className="fa-solid fa-ship"></i>
          </div>
          <div>
            <div className="text-white font-extrabold text-xl tracking-tight">SGA</div>
            <div className="text-blue-200 text-[11px] uppercase tracking-widest">Sistema de Gestión Aduanera</div>
          </div>
        </div>

        <div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-3xl mb-6">
            <i className="fa-solid fa-key"></i>
          </div>
          <h1 className="text-white font-extrabold text-4xl leading-tight tracking-tight mb-4">
            Nueva<br />contraseña.
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
            Elegí una contraseña segura de al menos 8 caracteres. Una vez guardada podés iniciar sesión normalmente.
          </p>
        </div>

        <div className="text-blue-200/50 text-xs tracking-wide">UTN · FRCU · Ingeniería en Sistemas · 2026</div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-[420px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 sm:p-10">

          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <i className="fa-solid fa-ship"></i>
            </div>
            <span className="font-extrabold text-gray-900 dark:text-white text-lg">SGA</span>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">Nueva contraseña</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-7">Ingresá y confirmá tu nueva contraseña</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 text-sm mb-5">
              <i className="fa-solid fa-triangle-exclamation"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Nueva contraseña</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 8 caracteres" required
                  className={inputClass(false)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer text-sm">
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Mínimo 8 caracteres.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Confirmar contraseña</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
                <input type={showConfirm ? "text" : "password"} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repetir contraseña" required
                  className={inputClass(confirm && password !== confirm)}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer text-sm">
                  <i className={`fa-solid ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {confirm && password !== confirm && (
                <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all border-none cursor-pointer text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0">
              {loading
                ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Guardando...</>
                : <> Guardar contraseña</>
              }
            </button>

            <a href="/login" className="text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors no-underline">
              ← Volver al login
            </a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
// Login.jsx
import { useState, useEffect } from "react";
import { login } from "../api/auth";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaData, setCaptchaData] = useState({ key: "", url: "" });
  const [userCaptcha, setUserCaptcha] = useState("");
  const [focusedField, setFocusedField] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "https://sistema-gestion-aduanera-sga-1.onrender.com";

  useEffect(() => {
    fetchCaptcha();
    if (location.state?.mensaje) setSuccess(location.state.mensaje);
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/get-captcha/`);
      setCaptchaData({ key: res.data.key, url: res.data.image_url });
      setUserCaptcha("");
    } catch (err) {
      console.error("Error cargando captcha", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(username, password, captchaData.key, userCaptcha);
      navigate("/");
    } catch (err) {
      setError("");
      setTimeout(() => setError(err.response?.data?.error || "Usuario, contraseña o captcha incorrectos"), 10);
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none transition-all ${
      focusedField === field
        ? "border-blue-500 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
        : "border-gray-200 dark:border-gray-700"
    }`;

  return (
    <div className="flex min-h-screen w-screen overflow-hidden font-sans bg-gray-50 dark:bg-gray-950">
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .error-shake { animation: shake 0.4s ease both; }
      `}</style>

      {/* Panel izquierdo */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] flex-shrink-0 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 p-12 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl backdrop-blur-sm">
            <i className="fa-solid fa-ship"></i>
          </div>
          <div>
            <div className="text-white font-extrabold text-xl tracking-tight">SGA</div>
            <div className="text-blue-200 text-[11px] uppercase tracking-widest">Sistema de Gestión Aduanera</div>
          </div>
        </div>

        <div>
          <h1 className="text-white font-extrabold text-4xl leading-tight tracking-tight mb-5">
            Gestión aduanera<br />simplificada.
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
            Administrá importaciones, exportaciones y clientes desde un solo lugar. Rápido, seguro y eficiente.
          </p>
        </div>

        <div className="flex gap-3">
          {[
            { icon: "fa-file-invoice", val: "OPERACIONES", label: "Centralizadas" },
            { icon: "fa-users",        val: "CLIENTES",    label: "Gestionados" },
            { icon: "fa-shield-halved",val: "ACCESO",      label: "Seguro" },
          ].map((s) => (
            <div key={s.label} className="flex-1 bg-white/10 border border-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
              <i className={`fa-solid ${s.icon} text-white/80 text-lg block mb-2`}></i>
              <div className="text-white font-bold text-xs mb-0.5">{s.val}</div>
              <div className="text-blue-200/70 text-[10px] uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
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

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">¡Bienvenido!</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-7">Ingresá tus credenciales para continuar</p>

          {success && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5 text-sm mb-5">
              <i className="fa-solid fa-circle-check"></i> {success}
            </div>
          )}

          {error && (
            <div className="error-shake flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 text-sm mb-5">
              <i className="fa-solid fa-triangle-exclamation"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Usuario */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Usuario</label>
              <div className="relative">
                <i className={`fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none transition-colors ${focusedField === "username" ? "text-blue-500" : "text-gray-400"}`}></i>
                <input type="text" value={username} placeholder="Ingresá tu usuario"
                  disabled={loading} required
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => { setUsername(e.target.value); if (error) setError(""); }}
                  className={inputClass("username")}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Contraseña</label>
              <div className="relative">
                <i className={`fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none transition-colors ${focusedField === "password" ? "text-blue-500" : "text-gray-400"}`}></i>
                <input type={showPassword ? "text" : "password"} value={password}
                  placeholder="Ingresá tu contraseña" disabled={loading} required
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass("password")} pr-10`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer text-sm">
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Captcha */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Verificación de seguridad</label>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 bg-white  border-2 border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center overflow-hidden min-h-[48px] p-1">
                  {captchaData.url
                    ? <img src={`${captchaData.url}?t=${Date.now()}`} alt="captcha" key={captchaData.key} className="max-h-[52px] rounded-lg block" />
                    : <i className="fa-solid fa-circle-notch fa-spin text-gray-400 text-lg py-3"></i>
                  }
                </div>
                <button type="button" onClick={fetchCaptcha}
                  className="w-11 h-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-arrows-rotate"></i>
                </button>
              </div>
              <div className="relative">
                <i className={`fa-solid fa-shield absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none transition-colors ${focusedField === "captcha" ? "text-blue-500" : "text-gray-400"}`}></i>
                <input type="text" value={userCaptcha} placeholder="Resolvé la ecuación"
                  disabled={loading} required
                  onFocus={() => setFocusedField("captcha")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                  className={inputClass("captcha")}
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-all border-none cursor-pointer text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0">
              {loading
                ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Validando...</>
                : <> Ingresar</>
              }
            </button>

            <a href="/forgot-password" className="text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors no-underline">
              ¿Olvidaste tu contraseña?
            </a>
          </form>

          <div className="text-center text-xs text-gray-400 dark:text-gray-600 mt-7 pt-5 border-t border-gray-100 dark:border-gray-800">
            Desarrollado por <span className="text-blue-600 dark:text-blue-400 font-semibold">Emmanuel Davezac</span>
            <br />© 2026 SGA · UTN FRCU · <span className="text-blue-600 dark:text-blue-400">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
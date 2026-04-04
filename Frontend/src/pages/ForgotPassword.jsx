// ForgotPassword.jsx
import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/api/password-reset/`, { email });
      setEnviado(true);
    } catch {
      setError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

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
            <i className="fa-solid fa-lock"></i>
          </div>
          <h1 className="text-white font-extrabold text-4xl leading-tight tracking-tight mb-4">
            Recuperá tu<br />acceso.
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
            Ingresá tu email y te enviamos un link para restablecer tu contraseña. Expira en 1 hora.
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

          {enviado ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-circle-check text-green-500 text-3xl"></i>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">¡Email enviado!</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Revisá tu casilla. El link expira en 1 hora.</p>
              <a href="/login"
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors no-underline font-semibold">
                <i className="fa-solid fa-arrow-left"></i> Volver al login
              </a>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">Olvidé mi contraseña</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-7">Te enviamos un link para restablecerla</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 text-sm mb-5">
                  <i className="fa-solid fa-triangle-exclamation"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Email</label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com" required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all border-none cursor-pointer text-sm flex items-center justify-center gap-2">
                  {loading
                    ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Enviando...</>
                    : <>Enviar link</>
                  }
                </button>

                <a href="/login" className="text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors no-underline">
                  ← Volver al login
                </a>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
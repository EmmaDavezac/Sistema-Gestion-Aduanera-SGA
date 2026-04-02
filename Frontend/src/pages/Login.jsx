import { useState, useEffect } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaData, setCaptchaData] = useState({ key: "", url: "" });
  const [userCaptcha, setUserCaptcha] = useState("");
  const [focusedField, setFocusedField] = useState("");

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.1.102:8000";

  const fetchCaptcha = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/get-captcha/`);
      setCaptchaData({ key: res.data.key, url: res.data.image_url });
      setUserCaptcha("");
    } catch (err) {
      console.error("Error cargando captcha", err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password, captchaData.key, userCaptcha);
      navigate("/");
    } catch (err) {
      setError("");
      setTimeout(() => {
        setError(
          err.response?.data?.error || "Usuario, contraseña o captcha incorrectos"
        );
      }, 10);
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };
  const css = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
  .error-shake { animation: shake 0.4s ease both; }
  .sga-input::placeholder { color: #cbd5e1; }
  .submit-hover:hover { background-color: #1d4ed8 !important; transform: translateY(-1px); }
  .submit-hover:active { transform: translateY(0); }

  @media (max-width: 768px) {
    .sga-left-panel { display: none !important; }
    .sga-right-panel { 
      flex: 1 !important;
      width: 100% !important;
      padding: 24px 16px !important;
    }
  }
`;

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* ── Panel izquierdo ── */}
<div style={s.left} className="sga-left-panel">
        <div style={s.leftInner}>
          <div style={s.brand}>
            <div style={s.brandIcon}>
              <i className="fa-solid fa-ship" style={{ fontSize: 22 }}></i>
            </div>
            <div>
              <div style={s.brandName}>SGA</div>
              <div style={s.brandTagline}>Sistema de Gestión Aduanera</div>
            </div>
          </div>

          <div style={s.heroText}>
            <h1 style={s.heroTitle}>Gestión aduanera<br />simplificada.</h1>
            <p style={s.heroSub}>
              Administrá importaciones, exportaciones y clientes desde un solo lugar. Rápido, seguro y eficiente.
            </p>
          </div>

          <div style={s.statsRow}>
         {[
  { icon: "fa-file-invoice", label: "OPERACIONES", val: "Centralizadas" },
  { icon: "fa-users", label: "CLIENTES", val: "Gestionados" },
  { icon: "fa-shield-halved", label: "ACCESO", val: "Seguro" },
].map((stat) => (
  <div key={stat.label} style={s.statCard}>
    <i className={`fa-solid ${stat.icon}`} style={s.statIcon}></i>
    <div style={s.statVal}>{stat.val}</div>
    <div style={s.statLabel}>{stat.label}</div>
  </div>
))}
          </div>

          <div style={s.leftFooter}>
            UTN · FRCU · Ingeniería en Sistemas · 2026
          </div>
        </div>
      </div>

      {/* ── Panel derecho ── */}
    <div style={s.right} className="sga-right-panel">
        <div style={s.formBox}>
          <div style={s.formHeader}>
            <h2 style={s.formTitle}>¡Bienvenido!</h2>
            <p style={s.formSub}>Ingresá tus credenciales para continuar</p>
          </div>

          {error && (
            <div style={s.errorBox} className="error-shake">
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }}></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>

            {/* Usuario */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Usuario</label>
              <div style={s.inputWrap}>
                <i className="fa-solid fa-user" style={{
                  ...s.inputIcon,
                  color: focusedField === "username" ? "#2563eb" : "#94a3b8"
                }}></i>
                <input
                  type="text"
                  value={username}
                  placeholder="Ingresá tu usuario"
                  disabled={loading}
                  required
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => { setUsername(e.target.value); if (error) setError(""); }}
                  style={{
                    ...s.input,
                    borderColor: focusedField === "username" ? "#2563eb" : "#e2e8f0",
                    boxShadow: focusedField === "username" ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
                  }}
                  className="sga-input"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Contraseña</label>
              <div style={s.inputWrap}>
                <i className="fa-solid fa-lock" style={{
                  ...s.inputIcon,
                  color: focusedField === "password" ? "#2563eb" : "#94a3b8"
                }}></i>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Ingresá tu contraseña"
                  disabled={loading}
                  required
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    ...s.input,
                    paddingRight: 44,
                    borderColor: focusedField === "password" ? "#2563eb" : "#e2e8f0",
                    boxShadow: focusedField === "password" ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
                  }}
                  className="sga-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={s.eyeBtn}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Captcha */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Verificación de seguridad</label>
              <div style={s.captchaRow}>
                <div style={s.captchaImgWrap}>
                  {captchaData.url ? (
                   <img 
  src={`${captchaData.url}?t=${new Date().getTime()}`} 
  alt="captcha" 
  style={s.captchaImg}
  key={captchaData.key} 
/>
                  ) : (
                    <div style={s.captchaLoading}>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                    </div>
                  )}
                </div>
                <button type="button" onClick={fetchCaptcha} style={s.refreshBtn} title="Nuevo captcha">
                  <i className="fa-solid fa-arrows-rotate"></i>
                </button>
              </div>
              <div style={{ ...s.inputWrap, marginTop: 8 }}>
                <i className="fa-solid fa-shield" style={{
                  ...s.inputIcon,
                  color: focusedField === "captcha" ? "#2563eb" : "#94a3b8"
                }}></i>
                <input
                  type="text"
                  value={userCaptcha}
                  placeholder="Resolvé la ecuación"
                  disabled={loading}
                  required
                  onFocus={() => setFocusedField("captcha")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                  style={{
                    ...s.input,
                    borderColor: focusedField === "captcha" ? "#2563eb" : "#e2e8f0",
                    boxShadow: focusedField === "captcha" ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
                  }}
                  className="sga-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...s.submitBtn,
                backgroundColor: loading ? "#93c5fd" : "#2563eb",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              className={loading ? "" : "submit-hover"}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  Validando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i>
                  Ingresar
                </>
              )}
            </button>

            <a href="/forgot-password" style={s.forgotLink}>
              ¿Olvidaste tu contraseña?
            </a>
          </form>

         <div style={s.formFooterText}>
  Desarrollado por <span style={{ color: "#2563eb", fontWeight: 600 }}>Emmanuel Davezac</span>
  <br />
  © 2026 SGA · UTN FRCU · <span style={{ color: "#2563eb" }}>v1.0.0</span>
</div>
        </div>
      </div>
    </div>
  );
};

/* ── Styles ── */
const s = {
  page: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    overflow: "hidden",
  },

  // Left panel
  left: {
    flex: "0 0 45%",
    background: "linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
    display: "flex",
    alignItems: "stretch",
    position: "relative",
    overflow: "hidden",
  },
  leftInner: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "40px 48px",
    width: "100%",
    zIndex: 1,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.3)",
  },
  brandName: {
    fontSize: 22,
    fontWeight: 800,
    color: "white",
    letterSpacing: "-0.5px",
  },
  brandTagline: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  heroText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: 40,
  },
  heroTitle: {
    fontSize: "clamp(28px, 3vw, 42px)",
    fontWeight: 800,
    color: "white",
    lineHeight: 1.2,
    margin: "0 0 20px 0",
    letterSpacing: "-1px",
  },
  heroSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.7,
    margin: 0,
    maxWidth: 340,
  },
  statsRow: {
    display: "flex",
    gap: 12,
    marginTop: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "16px 12px",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(8px)",
  },
  statIcon: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
    display: "block",
  },
  statVal: {
    fontSize: 12,
    fontWeight: 700,
    color: "white",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  leftFooter: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    marginTop: 32,
    letterSpacing: "0.5px",
  },

  // Right panel
  right: {
    flex: 1,
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  },
  formBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 20,
    padding: "40px 36px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    border: "1px solid #e2e8f0",
  },
  formHeader: {
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 6px 0",
    letterSpacing: "-0.5px",
  },
  formSub: {
    fontSize: 14,
    color: "#64748b",
    margin: 0,
  },
  errorBox: {
    backgroundColor: "#fff1f2",
    color: "#be123c",
    border: "1px solid #fecdd3",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  fieldWrap: {
    marginBottom: 18,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 13,
    fontSize: 14,
    pointerEvents: "none",
    transition: "color 0.2s",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "11px 12px 11px 38px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "white",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    padding: 0,
  },
  captchaRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
 captchaImgWrap: {
  flex: 1,
  backgroundColor: "white",
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  minHeight: 48,
  padding: "2px",
},
  captchaImg: {
    borderRadius: 8,
    display: "block",
    maxHeight: 52,
  },
  captchaLoading: {
    color: "#94a3b8",
    fontSize: 18,
    padding: "12px 0",
  },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: 15,
    flexShrink: 0,
    transition: "background 0.2s",
  },
  submitBtn: {
    width: "100%",
    padding: "13px",
    borderRadius: 10,
    border: "none",
    color: "white",
    fontSize: 15,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    transition: "background-color 0.2s, transform 0.1s",
    letterSpacing: "0.3px",
  },
  forgotLink: {
    display: "block",
    textAlign: "center",
    marginTop: 14,
    fontSize: 13,
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 500,
  },
  formFooterText: {
    textAlign: "center",
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 28,
    paddingTop: 20,
    borderTop: "1px solid #f1f5f9",
  },
};

const css = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-6px); }
    40%     { transform: translateX(6px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }
  .error-shake { animation: shake 0.4s ease both; }
  .sga-input::placeholder { color: #cbd5e1; }
  .submit-hover:hover { background-color: #1d4ed8 !important; transform: translateY(-1px); }
  .submit-hover:active { transform: translateY(0); }

  @media (max-width: 768px) {
    .sga-left-panel { display: none !important; }
    .sga-right-panel { padding: 24px 16px !important; }
  }
`;

export default Login;
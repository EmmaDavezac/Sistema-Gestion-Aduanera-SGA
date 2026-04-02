import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GestionClientes from "../components/GestionClientes";
import GestionAduanas from "../components/GestionAduanas";
import GestionImportaciones from "../components/GestionImportaciones";
import GestionExportaciones from "../components/GestionExportaciones";
import AlertasVencimiento from "../components/AlertasVencimiento";
import GestionUsuarios from "../components/GestionUsuarios";
import HomeInfo from "../components/HomeInfo";
import Footer from "../components/Footer";
import Profile from "../components/Profile";
import Toast from "../components/Toast";

const TABS = [
  { name: "home",          icon: "fa-house",            label: "HOME" },
  { name: "aduanas",       icon: "fa-building-columns", label: "ADUANAS",       adminOnly: true },
  { name: "clientes",      icon: "fa-users",            label: "CLIENTES" },
  { name: "importaciones", icon: "fa-ship",             label: "IMPORTACIONES" },
  { name: "exportaciones", icon: "fa-truck-ramp-box",      label: "EXPORTACIONES" },
  { name: "usuarios",      icon: "fa-user-gear",        label: "USUARIOS",      adminOnly: true },
];

const Home = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const [autoOpenForm, setAutoOpenForm] = useState(false);
  const [toasts, setToasts] = useState([]);

  const userName = localStorage.getItem("userName") || "Usuario";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const showToast = (msg, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    const closeMenu = () => setShowUserMenu(false);
    if (showUserMenu) window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [showUserMenu]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const changeView = (newView) => {
    setView(newView);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleNavigateWithAction = (tab, action) => {
    changeView(tab);
    if (action === "new") setAutoOpenForm(true);
  };

  const handleAlertClick = (id) => {
    setView("exportaciones");
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 5000);
  };
const currentTabLabel = TABS.find(t => t.name === view)?.label || "Menú";
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 font-sans flex flex-col items-center">
      <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-5 flex flex-col flex-1 box-border">

        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-900 px-5 py-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white p-2.5 rounded-lg text-xl">
              <i className="fa-solid fa-ship"></i>
            </div>
            <div>
              <h2 className="m-0 text-gray-900 dark:text-white text-xl font-bold">SGA</h2>
              <span className="text-xs text-gray-400">Sistema de Gestión Aduanera</span>
            </div>
          </div>

          {/* User menu */}
          <div className="relative">
            <div
              className="flex items-center gap-3 ml-5 pl-5 border-l border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                  @{userName} <i className="fa-solid fa-caret-down text-[10px] ml-1"></i>
                </div>
                <div className={`text-xs ${isAdmin ? "text-green-500" : "text-gray-400"}`}>
                  {isAdmin ? "Administrador" : "Usuario"}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-[120%] right-0 bg-white dark:bg-gray-800 min-w-[200px] rounded-xl shadow-lg z-[1000] py-2 border border-gray-100 dark:border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 text-xs text-gray-400 font-bold uppercase tracking-wide">Cuenta</div>

                  <div
                    className="px-4 py-2.5 flex items-center gap-2.5 cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => { setView("Profile"); setShowUserMenu(false); }}
                  >
                    <i className="fa-solid fa-circle-user text-blue-500"></i> Mi Perfil
                  </div>

                  <div
                    className="px-4 py-2.5 flex items-center gap-2.5 cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => alert("Funcionalidad en desarrollo")}
                  >
                    <i className="fa-solid fa-gear text-blue-500"></i> Configuración
                  </div>

                  <hr className="my-1 border-gray-100 dark:border-gray-700" />

                  <div
                    className="px-4 py-2.5 flex items-center gap-2.5 cursor-pointer text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => { if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) handleLogout(); else setShowUserMenu(false); }}
                  >
                    <i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Alertas ── */}
        <AlertasVencimiento onAlertClick={handleAlertClick} />

        {/* ── Navegación ── */}
        <div className="relative mb-4">
          {/* Botón hamburguesa (mobile) */}
         <button
  className="lg:hidden flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg text-blue-600 font-bold w-full cursor-pointer shadow-sm"
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
>
  <div className="flex items-center gap-3">
    <i className={`fa-solid ${TABS.find(t => t.name === view)?.icon || 'fa-bars'}`}></i>
    <span className="uppercase tracking-wider text-sm">
      {view === "Profile" ? "Mi Perfil" : currentTabLabel}
    </span>
  </div>
  
  <i className={`fa-solid ${isMobileMenuOpen ? "fa-chevron-up" : "fa-chevron-down"} text-xs opacity-50`}></i>
</button>

          {/* Tabs */}
          <div className={`
  bg-gray-200 dark:bg-gray-800 p-1.5 rounded-xl
  lg:flex lg:flex-row lg:gap-1 lg:opacity-100 lg:max-h-none lg:pointer-events-auto lg:mt-0
  flex-col overflow-hidden transition-all duration-300 ease-in-out
  ${isMobileMenuOpen
    ? "flex opacity-100 max-h-[600px] mt-2"
    : "hidden"
  }
`}>
           {TABS.map((tab) => {
  if (tab.adminOnly && !isAdmin) return null;
  const isActive = view === tab.name;
  return (
    <div
      key={tab.name}
      onClick={() => changeView(tab.name)}
      className={`
        relative flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg cursor-pointer
        text-sm font-bold transition-all duration-200
        w-full lg:w-auto whitespace-nowrap
        ${isActive
          ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 shadow-sm lg:bg-transparent lg:shadow-none"
          : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
        }
      `}
    >
      <i className={`fa-solid ${tab.icon}`}></i>
      {tab.label}
      
      {/* Indicador inferior solo para escritorio */}
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute -bottom-1.5 left-2 right-2 h-[3px] bg-blue-600 rounded-full hidden lg:block"
        />
      )}
    </div>
  );
})}
          </div>
        </div>

        {/* ── Contenido ── */}
        <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl shadow-sm flex-1 min-h-[400px] border border-gray-100 dark:border-gray-800">
          {view === "home"          && <HomeInfo onNavigate={handleNavigateWithAction} />}
          {view === "clientes"      && <GestionClientes onNotification={showToast} autoOpenForm={autoOpenForm} onFormOpened={() => setAutoOpenForm(false)} />}
          {view === "aduanas"       && <GestionAduanas onNotification={showToast} />}
          {view === "importaciones" && <GestionImportaciones onNotification={showToast} autoOpenForm={autoOpenForm} onFormOpened={() => setAutoOpenForm(false)} />}
          {view === "exportaciones" && <GestionExportaciones highlightId={highlightId} onNotification={showToast} autoOpenForm={autoOpenForm} onFormOpened={() => setAutoOpenForm(false)} />}
          {view === "usuarios"      && <GestionUsuarios onNotification={showToast} />}
          {view === "Profile"       && <Profile onNotification={showToast} />}
        </div>
      </div>

      <Footer />

      {/* ── Toasts ── */}
      <div className="fixed top-5 right-5 z-[10000] flex flex-col gap-2.5">
        {toasts.map((t) => (
          <Toast key={t.id} msg={t.msg} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  );
};

export default Home;
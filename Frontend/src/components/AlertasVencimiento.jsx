import { useState, useEffect, useCallback, useRef } from "react";
import { getExportacionesVencer } from "../api/api";

const AlertasVencimiento = ({ onAlertClick }) => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [filtroTab, setFiltroTab] = useState("todas");
  const cargadoRef = useRef(false);

  const normalizarFechaUTC = (fechaStr) => {
    if (!fechaStr) return 0;
    const [y, m, d] = fechaStr.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };

  const obtenerDiasDiferencia = (fechaStr) => {
    const fechaVenc = normalizarFechaUTC(fechaStr);
    const t = new Date();
    const hoy = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
    return Math.round((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
  };

  const obtenerConfiguracionUrgencia = (fechaVencimiento) => {
    if (!fechaVencimiento) return { label: "Sin fecha", bg: "#f1f5f9", text: "#64748b", border: "#cbd5e0" };
    const dias = obtenerDiasDiferencia(fechaVencimiento);
    if (dias < 0)   return { label: `VENCIDA (${Math.abs(dias)}d)`, bg: "#450a0a", text: "#ffffff", border: "#991b1b" };
    if (dias === 0) return { label: "Vence hoy",          bg: "#fee2e2", text: "#991b1b", border: "#ef4444" };
    if (dias === 1) return { label: "Vence mañana",       bg: "#ffedd5", text: "#9a3412", border: "#f97316" };
    if (dias <= 3)  return { label: `Faltan ${dias} días`, bg: "#fff7ed", text: "#c2410c", border: "#fb923c" };
    return           { label: `Faltan ${dias} días`,      bg: "#f0f9ff", text: "#075985", border: "#0ea5e9" };
  };

  const cargarAlertas = useCallback(async () => {
    try {
      const data = await getExportacionesVencer();
      const dataOrdenada = data.sort(
        (a, b) => normalizarFechaUTC(a.vencimiento_preimposicion) - normalizarFechaUTC(b.vencimiento_preimposicion)
      );
      setAlertas((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(dataOrdenada)) return prev;
        return dataOrdenada;
      });
    } catch (err) {
      console.error("Error al obtener alertas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cargadoRef.current) { cargarAlertas(); cargadoRef.current = true; }
    const interval = setInterval(cargarAlertas, 60000);
    return () => clearInterval(interval);
  }, [cargarAlertas]);

  const alertasFiltradas = alertas.filter((exp) => {
    const dias = obtenerDiasDiferencia(exp.vencimiento_preimposicion);
    if (filtroTab === "vencidas") return dias < 0;
    if (filtroTab === "proximas") return dias >= 0;
    return true;
  });

  if (loading || alertas.length === 0 || !isVisible) return null;

  const TABS = [
    { value: "todas",    label: "Todas",    activeColor: "#1e293b" },
    { value: "vencidas", label: "Vencidas", activeColor: "#ef4444" },
    { value: "proximas", label: "Próximas", activeColor: "#3b82f6" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 shadow-sm animate-[slideIn_0.4s_ease-out]">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

     {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
  
  {/* Título + cerrar */}
  <div className="flex items-center justify-between gap-2 flex-1">
    <h4 className="m-0 flex items-center gap-2 text-gray-800 dark:text-gray-100 font-bold text-sm">
      <i className="fa-solid fa-bell "></i>
      <span className="hidden sm:inline">VENCIMIENTO DE EXPORTACIONES</span>
      <span className="sm:hidden">VENCIMIENTOS</span>
      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-md font-bold">
        {alertasFiltradas.length}
      </span>
    </h4>

    <button
      onClick={() => setIsVisible(false)}
      className="bg-transparent border-none text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-base p-1 sm:hidden"
    >
      <i className="fa-solid fa-xmark"></i>
    </button>
  </div>

  {/* Tabs + cerrar desktop */}
  <div className="flex items-center gap-2">
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex-1 sm:flex-none">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setFiltroTab(tab.value)}
          style={filtroTab === tab.value ? { backgroundColor: tab.activeColor } : {}}
          className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border-none
            ${filtroTab === tab.value
              ? "text-white"
              : "bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>

    <button
      onClick={() => setIsVisible(false)}
      className="hidden sm:block bg-transparent border-none text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-base p-1"
    >
      <i className="fa-solid fa-xmark"></i>
    </button>
  </div>

</div>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {alertasFiltradas.length === 0 ? (
          <div className="text-center py-5 text-gray-400 dark:text-gray-500 text-sm">
            No hay registros en esta categoría
          </div>
        ) : (
          alertasFiltradas.map((exp) => {
            const conf = obtenerConfiguracionUrgencia(exp.vencimiento_preimposicion);
            const esVencido = conf.label.includes("VENCIDA");

            return (
              <div
                key={exp.id}
                style={{ backgroundColor: conf.bg, borderLeftColor: conf.border, color: esVencido ? "#fff" : "inherit" }}
                className="flex flex-col gap-2 px-4 py-3 rounded-lg border-l-4 border border-transparent"
              >
                {/* Fila 1: título + badge urgencia */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-extrabold text-sm">
                    {esVencido && <i className="fa-solid fa-triangle-exclamation mr-1.5"></i>}
                    Operación #{exp.id}
                  </span>
                  <span
                    style={{ color: conf.text, borderColor: conf.border, backgroundColor: esVencido ? "#ef4444" : "#ffffffcc" }}
                    className="px-2.5 py-1 rounded-md text-xs font-bold border text-center whitespace-nowrap"
                  >
                    {conf.label}
                  </span>
                </div>

                {/* Fila 2: detalles */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-0.5 text-xs opacity-90">
                  <span><strong>Destinación:</strong> {exp.numero_destinacion || "N/A"}</span>
                  <span><strong>Cliente:</strong> {exp.cliente_nombre || "N/A"}</span>
                  <span><strong>Destino:</strong> {exp.pais_destino || "N/A"}</span>
                </div>

                {/* Fila 3: fecha + botón */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/5">
                  <div>
                    <div className="text-[10px] opacity-60 uppercase">Vence Preimp.</div>
                    <div className="text-xs font-bold">
                      {exp.vencimiento_preimposicion.split("-").reverse().join("/")}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm("¿Desea ver los detalles de esta operación?")) {
                        onAlertClick(exp.id);
                      }
                    }}
                    style={{ backgroundColor: esVencido ? "#ffffff22" : "#3182ce", borderColor: esVencido ? "#ffffff55" : "#2b6cb0" }}
                    className="px-3 py-1.5 text-white border rounded-md text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <span className="hidden sm:inline">Ver más</span>
                    <span className="sm:hidden">Ver</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertasVencimiento;
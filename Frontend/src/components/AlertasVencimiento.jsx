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
    if (dias < 0)  return { label: `VENCIDA (${Math.abs(dias)}d)`, bg: "#450a0a", text: "#ffffff", border: "#991b1b" };
    if (dias === 0) return { label: "Vence hoy",     bg: "#fee2e2", text: "#991b1b", border: "#ef4444" };
    if (dias === 1) return { label: "Vence mañana",  bg: "#ffedd5", text: "#9a3412", border: "#f97316" };
    if (dias <= 3)  return { label: `Faltan ${dias} días`, bg: "#fff7ed", text: "#c2410c", border: "#fb923c" };
    return { label: `Faltan ${dias} días`, bg: "#f0f9ff", text: "#075985", border: "#0ea5e9" };
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
    if (!cargadoRef.current) {
      cargarAlertas();
      cargadoRef.current = true;
    }
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
    { value: "todas",   label: "Todas",    activeColor: "#1e293b" },
    { value: "vencidas", label: "Vencidas", activeColor: "#ef4444" },
    { value: "proximas", label: "Próximas", activeColor: "#3b82f6" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-4 shadow-sm animate-[slideIn_0.4s_ease-out]">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h4 className="m-0 flex items-center gap-2.5 text-gray-800 dark:text-gray-100 font-bold whitespace-nowrap">
          <i className="fa-solid fa-bell text-yellow-500"></i>
          VENCIMIENTO DE EXPORTACIONES
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-md font-bold">
            {alertasFiltradas.length}
          </span>
        </h4>

        {/* Tabs filtro */}
        <div className="flex gap-1.5 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex-1 max-w-[350px]">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFiltroTab(tab.value)}
              style={filtroTab === tab.value ? { backgroundColor: tab.activeColor } : {}}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border-none
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
          className="bg-none border-none text-gray-400 dark:text-gray-500 cursor-pointer p-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-lg"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
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
                className="flex justify-between items-center px-4 py-3 rounded-lg border-l-4 border border-transparent flex-wrap gap-2 cursor-pointer hover:brightness-95 transition-all"
              >
                {/* Info principal */}
                <div className="flex flex-col flex-1 min-w-[200px]">
                  <span className="font-extrabold text-base">
                    {esVencido && <i className="fa-solid fa-triangle-exclamation mr-2"></i>}
                    Operación #{exp.id}
                  </span>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-sm opacity-90">
                    <span><strong>Destinación:</strong> {exp.numero_destinacion || "N/A"}</span>
                    <span><strong>Cliente:</strong> {exp.cliente_nombre || "N/A"}</span>
                    <span><strong>Destino:</strong> {exp.pais_destino || "N/A"}</span>
                  </div>
                </div>

                {/* Vencimiento + badge + botón */}
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="text-[11px] opacity-70 uppercase">Vence Preimp.</div>
                    <div className="text-sm font-bold">
                      {exp.vencimiento_preimposicion.split("-").reverse().join("/")}
                    </div>
                  </div>

                  <span
                    style={{ color: conf.text, borderColor: conf.border, backgroundColor: esVencido ? "#ef4444" : "#ffffffcc" }}
                    className="px-2.5 py-1 rounded-md text-xs font-bold border min-w-[100px] text-center"
                  >
                    {conf.label}
                  </span>

                  <button
                    onClick={() => {
                      if (window.confirm("¿Desea ver los detalles de esta operación?")) {
                        onAlertClick(exp.id);
                      }
                    }}
                    style={{ backgroundColor: esVencido ? "#ffffff22" : "#3182ce", borderColor: esVencido ? "#ffffff55" : "#2b6cb0" }}
                    className="px-3 py-1.5 text-white border rounded-md text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> Ver más
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
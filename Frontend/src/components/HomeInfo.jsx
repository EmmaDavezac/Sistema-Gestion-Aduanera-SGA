import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getClientes,
  getImportaciones,
  getExportaciones,
  getExportacionesVencer,
} from "../api/api";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const HomeInfo = ({ onNavigate }) => {
  const [data, setData] = useState({
    clientes: [], importaciones: [], exportaciones: [], vencimientos: [], loading: true,
  });

  const userName = localStorage.getItem("userName") || "Usuario";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    const cargar = async () => {
      try {
        const [clientes, importaciones, exportaciones, vencimientos] = await Promise.all([
          getClientes(), getImportaciones(), getExportaciones(), getExportacionesVencer(),
        ]);
        setData({ clientes, importaciones, exportaciones, vencimientos, loading: false });
      } catch {
        setData((d) => ({ ...d, loading: false }));
      }
    };
    cargar();
  }, []);

  const clientesActivos = data.clientes.filter((c) => !c.baja).length;
  const impActivas      = data.importaciones.filter((i) => !i.baja).length;
  const expActivas      = data.exportaciones.filter((e) => !e.baja).length;
  const porVencer       = data.vencimientos.length;

  const recientes = [
    ...data.importaciones.map((i) => ({ ...i, tipo: "importacion" })),
    ...data.exportaciones.map((e) => ({ ...e, tipo: "exportacion" })),
  ].sort((a, b) => b.id - a.id).slice(0, 6);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  if (data.loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <i className="fa-solid fa-circle-notch fa-spin text-blue-600 text-3xl"></i>
      </div>
    );
  }

  const STATS = [
    { label: "Clientes activos",         value: clientesActivos, icon: "fa-users",                nav: "clientes",      color: "blue" },
    { label: "Importaciones activas",    value: impActivas,      icon: "fa-ship",                 nav: "importaciones", color: "cyan" },
    { label: "Exportaciones activas",    value: expActivas,      icon: "fa-truck-ramp-box",        nav: "exportaciones", color: "green" },
    { label: "Exportaciones por vencer", value: porVencer,       icon: "fa-triangle-exclamation", nav: "exportaciones", color: porVencer > 0 ? "red" : "gray", alert: porVencer > 0 },
  ];

  const colorMap = {
    blue:  { bg: "bg-blue-50  dark:bg-blue-950",  icon: "bg-blue-100  dark:bg-blue-900  text-blue-600  dark:text-blue-400",  value: "text-blue-600  dark:text-blue-400",  border: "border-blue-200  dark:border-blue-800" },
    cyan:  { bg: "bg-cyan-50  dark:bg-cyan-950",  icon: "bg-cyan-100  dark:bg-cyan-900  text-cyan-600  dark:text-cyan-400",  value: "text-cyan-600  dark:text-cyan-400",  border: "border-cyan-200  dark:border-cyan-800" },
    green: { bg: "bg-green-50 dark:bg-green-950", icon: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400", value: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
    red:   { bg: "bg-red-50   dark:bg-red-950",   icon: "bg-red-100   dark:bg-red-900   text-red-600   dark:text-red-400",   value: "text-red-600   dark:text-red-400",   border: "border-red-200   dark:border-red-800" },
    gray:  { bg: "bg-gray-50  dark:bg-gray-800",  icon: "bg-gray-100  dark:bg-gray-700  text-gray-500  dark:text-gray-400",  value: "text-gray-700  dark:text-gray-300",  border: "border-gray-200  dark:border-gray-700" },
  };

  const QUICK_ACTIONS = [
    { label: "Nueva importación",  icon: "fa-ship",             color: "text-blue-600",   bg: "bg-blue-50  dark:bg-blue-900/30",   border: "border-blue-100  dark:border-blue-800", nav: "importaciones", action: "new" },
    { label: "Nueva exportación",  icon: "fa-truck-ramp-box",   color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/30", border: "border-orange-100 dark:border-orange-800", nav: "exportaciones", action: "new" },
    { label: "Nuevo cliente",      icon: "fa-user-plus",        color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/30",  border: "border-green-100  dark:border-green-800", nav: "clientes",      action: "new" },
    ...(isAdmin ? [
      { label: "Gestionar aduanas",  icon: "fa-building-columns", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/30", border: "border-purple-100 dark:border-purple-800", nav: "aduanas" },
      { label: "Gestionar usuarios", icon: "fa-user-gear",         color: "text-cyan-600",   bg: "bg-cyan-50   dark:bg-cyan-900/30",   border: "border-cyan-100   dark:border-cyan-800",   nav: "usuarios" },
    ] : []),
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-full font-sans">

      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:justify-between md:items-center mb-7 gap-4 w-full"
      >
        <div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
            {saludo}, <span className="text-blue-600">{userName}</span> 
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isAdmin ? "Panel de administración" : "Tu resumen de operaciones aduaneras"}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium shadow-sm whitespace-nowrap">
          <i className="fa-solid fa-calendar-check mr-2 text-blue-600"></i>
          {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </motion.div>

      {/* Contadores */}
      <motion.div variants={stagger} initial="hidden" animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {STATS.map((stat) => {
          const c = colorMap[stat.color];
          return (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              onClick={() => onNavigate?.(stat.nav)}
              className={`relative ${c.bg} ${c.border} border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg overflow-hidden`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${c.icon}`}>
                <i className={`fa-solid ${stat.icon} text-xl`}></i>
              </div>
              <div className={`text-4xl font-extrabold leading-none mb-1.5 tracking-tight ${c.value}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-snug">
                {stat.label}
              </div>
              {stat.alert && (
                <div className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_0_3px_#fee2e2]" />
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Fila inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">

        {/* Actividad reciente */}
        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
        >
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              <i className="fa-solid fa-clock-rotate-left mr-2 text-blue-600"></i>
              Actividad reciente
            </span>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
              {recientes.length} operaciones
            </span>
          </div>

          {recientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <i className="fa-solid fa-inbox text-4xl text-gray-300 dark:text-gray-600 mb-2"></i>
              <div className="text-sm text-gray-400">Sin operaciones registradas</div>
            </div>
          ) : (
            <div className="flex flex-col">
              {recientes.map((op) => {
                const esImp = op.tipo === "importacion";
                const estado = op.estado || "—";
                const estadoColor =
                  estado === "Finalizada" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                  estado === "En Proceso" ? "bg-blue-100  dark:bg-blue-900/30  text-blue-700  dark:text-blue-400"  :
                  "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";

                return (
                  <motion.div
                    key={`${op.tipo}-${op.id}`}
                    variants={fadeUp}
                    onClick={() => onNavigate?.(esImp ? "importaciones" : "exportaciones")}
                    className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors last:border-0"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${esImp ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "bg-orange-50 dark:bg-orange-900/30 text-orange-600"}`}>
                      <i className={`fa-solid ${esImp ? "fa-ship" : "fa-truck-ramp-box"}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1.5 mb-0.5">
                        {esImp ? "Importación" : "Exportación"} #{op.id}
                        {op.baja && <span className="text-[10px] font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 px-1.5 py-0.5 rounded">Baja</span>}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {op.numero_destinacion || "Sin destinación"} · {op.cliente || "Sin cliente"}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md flex-shrink-0 ${estadoColor}`}>
                      {estado}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Accesos rápidos */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
        >
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              <i className="fa-solid fa-bolt mr-2 text-yellow-500"></i>
              Accesos rápidos
            </span>
          </div>

          <div className="flex flex-col p-3 gap-1">
            {QUICK_ACTIONS.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate?.(item.nav, item.action)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors text-left w-full ${item.border} hover:${item.bg} bg-transparent`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${item.bg} ${item.color}`}>
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                <i className="fa-solid fa-chevron-right text-xs text-gray-300 dark:text-gray-600 ml-auto"></i>
              </button>
            ))}
          </div>

          {/* Mini resumen */}
          <div className="mx-3 mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Resumen del sistema
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { num: data.clientes.length,      label: "Total clientes" },
                { num: data.importaciones.length, label: "Total importaciones" },
                { num: data.exportaciones.length, label: "Total exportaciones" },
                { num: porVencer,                 label: "Por vencer", alert: true },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <span className={`text-2xl font-extrabold tracking-tight ${item.alert && item.num > 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                    {item.num}
                  </span>
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeInfo;
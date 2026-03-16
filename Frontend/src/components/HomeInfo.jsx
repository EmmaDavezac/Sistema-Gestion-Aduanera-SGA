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
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const HomeInfo = ({ onNavigate }) => {
  const [data, setData] = useState({
    clientes: [],
    importaciones: [],
    exportaciones: [],
    vencimientos: [],
    loading: true,
  });

  const userName = localStorage.getItem("userName") || "Usuario";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    const cargar = async () => {
      try {
        const [clientes, importaciones, exportaciones, vencimientos] =
          await Promise.all([
            getClientes(),
            getImportaciones(),
            getExportaciones(),
            getExportacionesVencer(),
          ]);
        setData({
          clientes,
          importaciones,
          exportaciones,
          vencimientos,
          loading: false,
        });
      } catch {
        setData((d) => ({ ...d, loading: false }));
      }
    };
    cargar();
  }, []);

  const clientesActivos = data.clientes.filter((c) => !c.baja).length;
  const impActivas = data.importaciones.filter((i) => !i.baja).length;
  const expActivas = data.exportaciones.filter((e) => !e.baja).length;
  const porVencer = data.vencimientos.length;

  // Últimas 6 operaciones combinadas
  const recientes = [
    ...data.importaciones.map((i) => ({ ...i, tipo: "importacion" })),
    ...data.exportaciones.map((e) => ({ ...e, tipo: "exportacion" })),
  ]
    .sort((a, b) => b.id - a.id)
    .slice(0, 6);

  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  if (data.loading) {
    return (
      <div style={s.loadingWrap}>
        <i
          className="fa-solid fa-circle-notch fa-spin"
          style={{ fontSize: 28, color: "#2563eb" }}
        ></i>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* ── Encabezado ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={s.pageHeader}
      >
        <div>
          <div style={s.greeting}>
            {saludo}, <span style={s.greetingName}>{userName}</span> 👋
          </div>
          <div style={s.greetingSub}>
            {isAdmin
              ? "Panel de administración"
              : "Tu resumen de operaciones aduaneras"}
          </div>
        </div>
        <div style={s.dateBadge}>
          <i
            className="fa-solid fa-calendar-check"
            style={{ marginRight: 6, color: "#2563eb" }}
          ></i>
          {new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
      </motion.div>

      {/* ── Contadores ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={s.statsGrid}
      >
        {[
          {
            label: "Clientes activos",
            value: clientesActivos,
            icon: "fa-users",
            color: "#2563eb",
            bg: "#eff6ff",
            nav: "clientes",
          },
          {
            label: "Importaciones activas",
            value: impActivas,
            icon: "fa-ship",
            color: "#0891b2",
            bg: "#ecfeff",
            nav: "importaciones",
          },
          {
            label: "Exportaciones activas",
            value: expActivas,
            icon: "fa-truck-ramp-box",
            color: "#059669",
            bg: "#ecfdf5",
            nav: "exportaciones",
          },
          {
            label: "Exportaciones por vencer",
            value: porVencer,
            icon: "fa-triangle-exclamation",
            color: porVencer > 0 ? "#dc2626" : "#6b7280",
            bg: porVencer > 0 ? "#fef2f2" : "#f9fafb",
            nav: "exportaciones",
            alert: porVencer > 0,
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            style={{
              ...s.statCard,
              backgroundColor: stat.bg,
              borderColor: stat.color + "30",
            }}
            className="stat-card-hover"
            onClick={() => onNavigate && onNavigate(stat.nav)}
          >
            <div
              style={{ ...s.statIconWrap, backgroundColor: stat.color + "18" }}
            >
              <i
                className={`fa-solid ${stat.icon}`}
                style={{ color: stat.color, fontSize: 20 }}
              ></i>
            </div>
            <div style={s.statValue(stat.color)}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
            {stat.alert && <div style={s.alertDot}></div>}
          </motion.div>
        ))}
      </motion.div>

      {/* ── Fila inferior ── */}
      <div style={s.bottomRow}>
        {/* Actividad reciente */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={s.recentCard}
        >
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>
              <i
                className="fa-solid fa-clock-rotate-left"
                style={{ marginRight: 8, color: "#2563eb" }}
              ></i>
              Actividad reciente
            </span>
            <span style={s.sectionCount}>{recientes.length} operaciones</span>
          </div>

          {recientes.length === 0 ? (
            <div style={s.emptyState}>
              <i
                className="fa-solid fa-inbox"
                style={{ fontSize: 32, color: "#cbd5e1", marginBottom: 8 }}
              ></i>
              <div style={{ color: "#94a3b8", fontSize: 14 }}>
                Sin operaciones registradas
              </div>
            </div>
          ) : (
            <div style={s.activityList}>
              {recientes.map((op) => {
                const esImp = op.tipo === "importacion";
                const estado = op.estado || "—";
                const estadoColor =
                  estado === "Finalizada"
                    ? "#059669"
                    : estado === "En Proceso"
                      ? "#2563eb"
                      : "#d97706";

                return (
                  <motion.div
                    key={`${op.tipo}-${op.id}`}
                    variants={fadeUp}
                    style={s.activityItem}
                    className="activity-item-hover"
                    onClick={() =>
                      onNavigate &&
                      onNavigate(
                        op.tipo === "importacion"
                          ? "importaciones"
                          : "exportaciones",
                      )
                    }
                  >
                    <div
                      style={{
                        ...s.activityIcon,
                        backgroundColor: esImp ? "#eff6ff" : "#fff7ed",
                        color: esImp ? "#2563eb" : "#ea580c",
                      }}
                    >
                      <i
                        className={`fa-solid ${esImp ? "fa-ship" : "fa-truck-ramp-box"}`}
                      ></i>
                    </div>
                    <div style={s.activityInfo}>
                      <div style={s.activityTitle}>
                        {esImp ? "Importación" : "Exportación"} #{op.id}
                        {op.baja && <span style={s.bajaBadge}>Baja</span>}
                      </div>
                      <div style={s.activitySub}>
                        {op.numero_destinacion || "Sin destinación"} ·{" "}
                        {op.cliente || "Sin cliente"}
                      </div>
                    </div>
                    <div
                      style={{
                        ...s.estadoBadge,
                        backgroundColor: estadoColor + "18",
                        color: estadoColor,
                      }}
                    >
                      {estado}
                    </div>
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
          style={s.quickCard}
        >
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>
              <i
                className="fa-solid fa-bolt"
                style={{ marginRight: 8, color: "#f59e0b" }}
              ></i>
              Accesos rápidos
            </span>
          </div>

          <div style={s.quickList}>
            {[
              {
                label: "Nueva importación",
                icon: "fa-ship",
                color: "#2563eb",
                nav: "importaciones",
                action: "new",
              },
              {
                label: "Nueva exportación",
                icon: "fa-truck-ramp-box",
                color: "#ea580c",
                nav: "exportaciones",
                action: "new",
              },
              {
                label: "Nuevo cliente",
                icon: "fa-user-plus",
                color: "#059669",
                nav: "clientes",
                action: "new",
              },
              ...(isAdmin
                ? [
                    {
                      label: "Gestionar aduanas",
                      icon: "fa-building-columns",
                      color: "#7c3aed",
                      nav: "aduanas",
                    },
                    {
                      label: "Gestionar usuarios",
                      icon: "fa-user-gear",
                      color: "#0891b2",
                      nav: "usuarios",
                    },
                  ]
                : []),
            ].map((item) => (
              <button
                key={item.label}
                style={{ ...s.quickBtn, borderColor: item.color + "30" }}
                className="quick-btn-hover"
                onClick={() => onNavigate && onNavigate(item.nav, item.action)}
              >
                <div
                  style={{
                    ...s.quickBtnIcon,
                    backgroundColor: item.color + "15",
                    color: item.color,
                  }}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <span style={s.quickBtnLabel}>{item.label}</span>
                <i
                  className="fa-solid fa-chevron-right"
                  style={{ fontSize: 11, color: "#cbd5e1", marginLeft: "auto" }}
                ></i>
              </button>
            ))}
          </div>

          {/* Mini resumen */}
          <div style={s.miniSummary}>
            <div style={s.miniSummaryTitle}>Resumen del sistema</div>
            <div style={s.miniSummaryGrid}>
              <div style={s.miniStat}>
                <span style={s.miniStatNum}>{data.clientes.length}</span>
                <span style={s.miniStatLabel}>Total clientes</span>
              </div>
              <div style={s.miniStat}>
                <span style={s.miniStatNum}>{data.importaciones.length}</span>
                <span style={s.miniStatLabel}>Total importaciones</span>
              </div>
              <div style={s.miniStat}>
                <span style={s.miniStatNum}>{data.exportaciones.length}</span>
                <span style={s.miniStatLabel}>Total exportaciones</span>
              </div>
              <div style={s.miniStat}>
                <span style={{ ...s.miniStatNum, color: "#dc2626" }}>
                  {porVencer}
                </span>
                <span style={s.miniStatLabel}>Por vencer</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const s = {
  page: {
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "100%",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.5px",
    marginBottom: 4,
  },
  greetingName: {
    color: "#2563eb",
  },
  greetingSub: {
    fontSize: 13,
    color: "#64748b",
  },
  dateBadge: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 13,
    color: "#475569",
    fontWeight: 500,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    whiteSpace: "nowrap",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: "20px 18px",
    border: "1.5px solid",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statValue: (color) => ({
    fontSize: 32,
    fontWeight: 800,
    color: color,
    lineHeight: 1,
    marginBottom: 6,
    letterSpacing: "-1px",
  }),
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  alertDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#dc2626",
    boxShadow: "0 0 0 3px #fee2e2",
  },
  bottomRow: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 16,
    alignItems: "start",
  },
  recentCard: {
    backgroundColor: "white",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  quickCard: {
    backgroundColor: "white",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #f1f5f9",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
  },
  sectionCount: {
    fontSize: 12,
    color: "#94a3b8",
    backgroundColor: "#f1f5f9",
    padding: "3px 8px",
    borderRadius: 6,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 20px",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 20px",
    borderBottom: "1px solid #f8fafc",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    flexShrink: 0,
  },
  activityInfo: {
    flex: 1,
    minWidth: 0,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  activitySub: {
    fontSize: 11,
    color: "#94a3b8",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  estadoBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 6,
    flexShrink: 0,
  },
  bajaBadge: {
    fontSize: 10,
    fontWeight: 600,
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "2px 6px",
    borderRadius: 4,
  },
  quickList: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 12px",
    gap: 4,
  },
  quickBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    backgroundColor: "transparent",
    border: "1px solid",
    borderRadius: 10,
    cursor: "pointer",
    transition: "background 0.15s",
    textAlign: "left",
    width: "100%",
  },
  quickBtnIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    flexShrink: 0,
  },
  quickBtnLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },
  miniSummary: {
    margin: "8px 12px 12px",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: "14px",
    border: "1px solid #f1f5f9",
  },
  miniSummaryTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: 12,
  },
  miniSummaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  miniStat: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  miniStatNum: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  miniStatLabel: {
    fontSize: 11,
    color: "#94a3b8",
  },
};

const css = `
  .stat-card-hover:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important;
    transition: all 0.2s ease;
  }
  .stat-card-hover {
    transition: all 0.2s ease;
  }
  .activity-item-hover:hover {
    background-color: #f8fafc;
  }
  .quick-btn-hover:hover {
    background-color: #f8fafc !important;
  }
  @media (max-width: 900px) {
    .home-bottom-row {
      grid-template-columns: 1fr !important;
    }
  }
`;

export default HomeInfo;

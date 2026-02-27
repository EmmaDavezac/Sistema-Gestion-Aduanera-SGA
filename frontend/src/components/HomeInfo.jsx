import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; 
import api from "../api/api";

const FEATURES = [
  {
    icon: "fa-solid fa-ship",
    title: "Gestión de Operaciones",
    text: "Registra, controla y sigue tus importaciones y exportaciones en un solo lugar.",
    color: "#3182ce",
  },
  {
    icon: "fa-users",
    title: "Gestión de Clientes",
    text: "Administra la información de tus clientes y mantené todo actualizado.",
    color: "#38a169",
  },
 
  {
    icon: "fa-file-lines",
    title: "Gestión de Documentos",
    text: "Guarda y consulta todos los documentos de cada operación cuando los necesites.",
    color: "#319795",
  },
  {
    icon: "fa-solid fa-calendar-days",
    title: "Control de Vencimientos",
    text: "Recibí alertas anticipadas para no perder fechas importantes de tus operaciones.",
    color: "#e53e3e",
  },
  {
    icon: "fa-solid fa-globe",
    title: "Acceso Multiplataforma",
    text: "Accede a tu información desde cualquier dispositivo con conexión a internet.",
   color: "#f6ad55",
  }
  
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, 
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const HomeInfo = () => {



  return (
    <section style={styles.wrapper}>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={styles.header}
      >
        <h1 style={styles.title}>SGA</h1>
        <p style={styles.subtitle}>Hola, bienvenido a tu plataforma de Gestión Aduanera </p>
        <div style={styles.underline}></div>
      </motion.header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={styles.gridFuncionalidades}
      >
        {FEATURES.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </motion.div>
    </section>
  );
};

const FeatureCard = ({ icon, title, text, color }) => {
  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        y: -10,
        transition: { type: "spring", stiffness: 300, damping: 20 },
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      }}
      style={{ ...styles.cardBase(color), cursor: "pointer" }}
    >
      <div style={styles.iconContainer(color)}>
        <i
          className={`fa-solid ${icon}`}
          style={{ fontSize: "28px", color: color }}
        ></i>
      </div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardText}>{text}</p>
    </motion.article>
  );
};

const styles = {
  wrapper: {
    padding: "20px 20px",
    backgroundColor: "#f8fafc",
    minHeight: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",

  },
  title: {
    fontSize: "clamp(24px, 4vw, 32px)",
    color: "#1e293b",
    fontWeight: "800",
    marginBottom: "10px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#64748b",
    maxWidth: "600px",
    margin: "0 auto",
  },
  underline: {
    width: "60px",
    height: "4px",
    backgroundColor: "#3182ce",
    margin: "20px auto 0",
    borderRadius: "2px",

  },
  gridFuncionalidades: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 280px))", 
    gap: "20px",
    maxWidth: "1200px",
    width: "100%",
    justifyContent: "center", 
    margin: "15px auto",
  },
  cardBase: (color) => ({
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    textAlign: "center",
    borderTop: `5px solid ${color}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%", 
    boxSizing: "border-box",
  }),
iconContainer: (color) => ({
    backgroundColor: `${color}15`,
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "15px",
  }),
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#1e293b",
  },
  cardText: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.5",
    margin: 0,
  },
};

export default HomeInfo;

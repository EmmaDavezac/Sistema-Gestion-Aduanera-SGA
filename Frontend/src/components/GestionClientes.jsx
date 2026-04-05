import { useState, useEffect, useRef, useCallback } from "react";
import {
  getClientes, createCliente, updateCliente, getArchivos,
  uploadFile, downloadFile, deleteArchivo, getImportaciones, getExportaciones,
} from "../api/api";
import { validarCUIT } from "../utils/validaciones";
import SkeletonTable from "./SkeletonTable";

const GestionClientes = ({ onNotification, autoOpenForm, onFormOpened }) => {
  const [clientes, setClientes] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [importaciones, setImportaciones] = useState([]);
  const [exportaciones, setExportaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [view, setView] = useState("list");
  const [isEditing, setIsEditing] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarBaja, setMostrarBaja] = useState(false);
  const [filtroOperaciones, setFiltroOperaciones] = useState("Todos");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const today = new Date().toISOString().split("T")[0];
  const cargadoRef = useRef(false);

  const [formData, setFormData] = useState({
    cuit: "", nombre: "", domicilio: "", telefono_1: "", telefono_2: "",
    fecha_inicio_actividad: "", observaciones: "", baja: false,
  });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [c, a, imp, exp] = await Promise.all([getClientes(), getArchivos(), getImportaciones(), getExportaciones()]);
      setClientes(c); setArchivos(a); setImportaciones(imp); setExportaciones(exp);
      if (clienteSeleccionado) {
        const actualizado = c.find((item) => item.cuit === clienteSeleccionado.cuit);
        if (actualizado) { setClienteSeleccionado(actualizado); setFormData(actualizado); }
      }
    } catch (err) {
      onNotification("Error cargando datos", "error");
    } finally {
      setLoading(false);
    }
  }, [clienteSeleccionado?.cuit]);

  useEffect(() => {
    if (autoOpenForm) { setView("form"); setIsEditing(false); setIsReadOnly(false); onFormOpened?.(); }
  }, [autoOpenForm]);

  useEffect(() => {
    if (!cargadoRef.current) { cargarDatos(); cargadoRef.current = true; }
  }, [cargarDatos]);

  const tieneOperacionesActivas = (cuit) =>
    importaciones.some((i) => i.cliente === cuit && !i.baja) ||
    exportaciones.some((e) => e.cliente === cuit && !e.baja);

  const clientesFiltrados = clientes.filter((c) => {
    const coincideBusqueda =
      c.cuit.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideBaja = mostrarBaja ? true : !c.baja;
    const coincideOperaciones =
      filtroOperaciones === "Todos" ? true :
      filtroOperaciones === "Con operaciones" ? tieneOperacionesActivas(c.cuit) :
      !tieneOperacionesActivas(c.cuit);
    return coincideBusqueda && coincideBaja && coincideOperaciones;
  });

  const esFechaValida = (fechaInput) => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(fechaInput);
    fechaSeleccionada.setMinutes(fechaSeleccionada.getMinutes() + fechaSeleccionada.getTimezoneOffset());
    fechaSeleccionada.setHours(0, 0, 0, 0);
    return fechaSeleccionada <= hoy;
  };

  const handleFileUpload = async () => {
    if (filesToUpload.length === 0 || !clienteSeleccionado) return;
    const uploadPromises = filesToUpload.map((file) => {
      const fData = new FormData();
      fData.append("archivo", file); fData.append("tipo", 1);
      fData.append("cuit_cliente", clienteSeleccionado.cuit); fData.append("nombre", file.name);
      return uploadFile(fData);
    });
    try {
      await Promise.all(uploadPromises);
      setFilesToUpload([]); await cargarDatos();
      onNotification("Archivos subidos con éxito", "success");
    } catch { onNotification("Error al subir archivos", "error"); }
  };

  const handleEliminarArchivo = async (id) => {
    if (!window.confirm("¿Eliminar este archivo?")) return;
    try { await deleteArchivo(id); await cargarDatos(); onNotification("Archivo eliminado", "success"); }
    catch { onNotification("Error al eliminar", "error"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCUIT(formData.cuit)) { onNotification("El CUIT no es válido.", "error"); return; }
    if (!esFechaValida(formData.fecha_inicio_actividad)) { onNotification("La fecha no puede ser mayor a hoy.", "error"); return; }
    try {
      if (isEditing && clienteSeleccionado) {
        const datosParaEnviar = { ...formData };
        delete datosParaEnviar.cuit;
        await updateCliente(clienteSeleccionado.cuit, datosParaEnviar);
        onNotification("¡Actualizado con éxito!", "success");
        await cargarDatos(); setIsReadOnly(true);
      } else {
        await createCliente(formData);
        if (filesToUpload.length > 0) {
          const uploadPromises = filesToUpload.map((file) => {
            const fData = new FormData();
            fData.append("archivo", file); fData.append("tipo", 1);
            fData.append("cuit_cliente", formData.cuit); fData.append("nombre", file.name);
            return uploadFile(fData);
          });
          try { await Promise.all(uploadPromises); setFilesToUpload([]); }
          catch { onNotification("Error al subir algunos archivos", "error"); }
        }
        onNotification("¡Cliente registrado con éxito!", "success");
        await cargarDatos(); volverALista(true);
      }
    } catch (err) {
      const mensajeBackend = err.response?.data?.message || err.response?.data?.error;
      if (mensajeBackend) onNotification(mensajeBackend, "error");
      else if (err.response?.status === 400) onNotification("El CUIT ya está registrado", "error");
      else onNotification("Error de comunicación con el servidor", "error");
    }
  };

  const verDetalle = (cliente) => {
    setClienteSeleccionado(cliente); setFormData(cliente);
    setIsEditing(true); setIsReadOnly(true); setView("form");
  };

  const volverALista = (saltarConfirmacion = false) => {
    if (saltarConfirmacion || window.confirm("¿Desea volver al listado?")) {
      setClienteSeleccionado(null); setIsEditing(false); setIsReadOnly(true);
      setView("list"); setFilesToUpload([]);
      setFormData({ cuit: "", nombre: "", domicilio: "", telefono_1: "", telefono_2: "", fecha_inicio_actividad: "", observaciones: "", baja: false });
      window.scrollTo(0, 0);
    }
  };

  // ── Clases reutilizables ──
  const inputClass = (disabled) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm transition-colors box-border no-spinner ${
      disabled
        ? "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500"
    }`;

  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

  const SectionTitle = ({ children }) => (
    <div className="col-span-full pb-2 mb-1 border-b-2 border-blue-500 text-gray-700 dark:text-gray-200 text-sm font-bold uppercase tracking-widest">
      {children}
    </div>
  );

  const Badge = ({ bg, color, children }) => (
    <span style={{ backgroundColor: bg, color }} className="px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
      {children}
    </span>
  );

  // ── Drag & Drop ──
  const DragDropZone = () => (
    <div
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("bg-blue-50", "border-blue-400"); }}
      onDragLeave={(e) => { e.currentTarget.classList.remove("bg-blue-50", "border-blue-400"); }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("bg-blue-50", "border-blue-400");
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
          setFilesToUpload((prev) => [...prev, ...droppedFiles]);
          onNotification(`${droppedFiles.length} archivo(s) preparado(s).`, "success");
        }
      }}
      onClick={() => document.getElementById("file-input-clientes").click()}
      className="flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-10 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center transition-all cursor-pointer mt-5 mb-5 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400"
    >
      <i className="fa-solid fa-cloud-arrow-up text-5xl text-blue-500"></i>
      <div>
        <p className="text-base font-semibold text-gray-700 dark:text-gray-200 m-0">Arrastra la documentación aquí</p>
        <p className="text-sm text-gray-400 mt-1">O haz clic para seleccionar un archivo</p>
      </div>
      <input id="file-input-clientes" type="file" multiple className="hidden"
        onChange={(e) => setFilesToUpload((prev) => [...prev, ...Array.from(e.target.files)])}
      />
      {filesToUpload.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 justify-center w-full">
          {filesToUpload.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
              <i className="fa-solid fa-file-pdf text-red-500 text-sm"></i>
              <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); setFilesToUpload(filesToUpload.filter((_, i) => i !== index)); }}
                className="border-none bg-none text-gray-300 hover:text-gray-500 cursor-pointer p-0">
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            </div>
          ))}
          {isEditing && (
            <button type="button" onClick={(e) => { e.stopPropagation(); handleFileUpload(); }}
              className="w-full flex items-center justify-center gap-2 mt-2 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg border-none cursor-pointer text-sm transition-colors">
              <i className="fa-solid fa-cloud-arrow-up"></i> Subir
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-full font-sans">

      {view === "list" ? (
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <div className="relative w-full sm:w-[60%]">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                placeholder="Buscar por Nombre o CUIT de Cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button
              onClick={() => { setIsEditing(false); setIsReadOnly(false); setView("form"); }}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors cursor-pointer border-none text-sm"
            >
              Registrar
            </button>
          </div>

          {/* Filtros */}
<div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">

  {/* Barra superior: toggle + contador */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
    <div onClick={() => setMostrarBaja(!mostrarBaja)}
      className="flex items-center gap-2.5 cursor-pointer select-none">
      <div className={`w-10 h-5 rounded-full relative transition-all duration-300 border-2 flex-shrink-0
        ${mostrarBaja ? "bg-blue-500 border-blue-600" : "bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500"}`}>
        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-300 shadow
          ${mostrarBaja ? "left-[18px]" : "left-[1px]"}`} />
      </div>
      <span className={`text-xs font-semibold transition-colors ${mostrarBaja ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
        Mostrar inactivos
      </span>
    </div>

    <span className="text-xs text-gray-400 dark:text-gray-500">
      <span className="font-bold text-gray-600 dark:text-gray-300">{clientesFiltrados.length}</span>
      <span> / {clientes.length}</span>
    </span>
  </div>

  {/* Pills */}
  <div className="flex p-2 gap-1.5">
    {[
      { value: "Todos",            label: "Todos",            icon: "fa-users" },
      { value: "Con operaciones",  label: "Con operaciones",  icon: "fa-file-invoice" },
      { value: "Sin operaciones",  label: "Sin operaciones",  icon: "fa-file-circle-xmark" },
    ].map((op) => (
      <button key={op.value} onClick={() => setFiltroOperaciones(op.value)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer
          ${filtroOperaciones === op.value
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            : "border-transparent text-gray-500 dark:text-gray-400 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}>
        <i className={`fa-solid ${op.icon} text-[10px]`}></i>
        <span className="hidden sm:inline">{op.label}</span>
        <span className="sm:hidden">{op.value === "Todos" ? "Todos" : op.value === "Con operaciones" ? "Con op." : "Sin op."}</span>
      </button>
    ))}
  </div>

  {/* Limpiar filtros */}
  {(mostrarBaja || filtroOperaciones !== "Todos") && (
    <div className="px-3 pb-2.5">
      <button
        onClick={() => { setMostrarBaja(false); setFiltroOperaciones("Todos"); }}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg transition-colors cursor-pointer bg-transparent"
      >
        <i className="fa-solid fa-xmark"></i> Limpiar filtros
      </button>
    </div>
  )}
</div>

          {/* Cards */}
      
        {clientesFiltrados.map((c) => (
  <div key={c.cuit} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-3 border border-gray-100 dark:border-gray-700">
    <div className="flex justify-between items-start gap-3">
      
      {/* Icono + info */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
          <i className="fa-solid fa-user"></i>
        </div>
        <div className="flex-1 min-w-0">
          {/* Nombre + badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <strong className="text-sm text-gray-800 dark:text-gray-100 truncate">{c.nombre}</strong>
            {c.baja
              ? <Badge bg="#fff5f5" color="#c53030">Inactivo</Badge>
              : <Badge bg="#f0fff4" color="#22543d">Activo</Badge>
            }
            {tieneOperacionesActivas(c.cuit) && <Badge bg="#fffeb3" color="#856404">Con operaciones</Badge>}
          </div>

          {/* Campos apilados en mobile, en línea en desktop */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400 dark:text-gray-500">
            <span>
              <i className="fa-solid fa-id-card mr-1"></i>
              {c.cuit}
            </span>
            <span className="truncate">
              <i className="fa-solid fa-location-dot mr-1"></i>
              {c.domicilio || "Sin domicilio"}
            </span>
          </div>
        </div>
      </div>

      {/* Botón ver */}
      <button
        onClick={() => verDetalle(c)}
        className="px-3 py-2 border border-blue-400 text-blue-500 rounded-lg bg-transparent cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm flex-shrink-0"
      >
        <i className="fa-solid fa-eye"></i>
      </button>

    </div>
  </div>
))}
 {loading ? <SkeletonTable rows={4} /> : clientesFiltrados.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <i className="fa-solid fa-box-open text-5xl mb-4 text-gray-300 dark:text-gray-600 block"></i>
              <h3 className="m-0 text-lg text-gray-600 dark:text-gray-300">No hay coincidencias</h3>
              <p className="mt-2 text-sm">Prueba con otro Nombre o CUIT de CLiente.</p>
            </div>
          )}
        </div>

      ) : (
      
        /* ── Formulario ── */
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
            <button onClick={() => volverALista(false)}
              className="flex items-center gap-2 border-none bg-none text-blue-600 dark:text-blue-400 cursor-pointer font-bold text-sm hover:text-blue-800 transition-colors">
              <i className="fa-solid fa-arrow-left"></i> Volver al listado
            </button>
            {isEditing && (


              <button onClick={() => setIsReadOnly(!isReadOnly)}
                className={`flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg border-none cursor-pointer text-sm transition-colors ${isReadOnly ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500 hover:bg-gray-600"}`}>
                <i className={isReadOnly ? "fa-solid fa-pen-to-square" : "fa-solid fa-xmark"}></i>
                {isReadOnly ? "Editar" : "Cancelar"}
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <SectionTitle>Datos Identificatorios</SectionTitle>

              <div>
                <label className={labelClass}>CUIT *</label>
                <input type="text" pattern="[0-9]{11}" placeholder="Ej: 20123456789"
                  value={formData.cuit} disabled={isEditing}
                  onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                  required className={inputClass(isEditing)} />
              </div>

              <div>
                <label className={labelClass}>Razón Social / Nombre *</label>
                <input placeholder="Ej: Logística S.A." value={formData.nombre}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required className={inputClass(isEditing && isReadOnly)} />
              </div>

              <SectionTitle>Información de Contacto</SectionTitle>

              <div className="col-span-full">
                <label className={labelClass}>Domicilio *</label>
                <input placeholder="Calle, Número, Localidad" value={formData.domicilio || ""}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                  required className={inputClass(isEditing && isReadOnly)} />
              </div>

              <div>
                <label className={labelClass}>Teléfono Principal *</label>
                <input type="number" placeholder="Ej: 0113438401246" value={formData.telefono_1 || ""}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, telefono_1: e.target.value })}
                  required className={inputClass(isEditing && isReadOnly)} />
              </div>

              <div>
                <label className={labelClass}>Teléfono Secundario</label>
                <input type="number" placeholder="Opcional" value={formData.telefono_2 || ""}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, telefono_2: e.target.value })}
                  className={inputClass(isEditing && isReadOnly)} />
              </div>

              <SectionTitle>Otros Datos</SectionTitle>

              <div>
                <label className={labelClass}>Fecha Inicio Actividad *</label>
                <input type="date" max={today}
                  value={formData.fecha_inicio_actividad ? formData.fecha_inicio_actividad.split("T")[0] : ""}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio_actividad: e.target.value })}
                  required className={inputClass(isEditing && isReadOnly)} />
              </div>

              <div className="col-span-full">
                <label className={labelClass}>Observaciones</label>
                <textarea placeholder="Notas adicionales..." value={formData.observaciones || ""}
                  disabled={isEditing && isReadOnly}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className={`${inputClass(isEditing && isReadOnly)} h-20 resize-none`} />
              </div>

              {isAdmin && isEditing && (
                <>
                  <SectionTitle>Estado Lógico del Cliente</SectionTitle>
                  <div className="col-span-full">
                    <div
                      onClick={() => !isReadOnly && setFormData({ ...formData, baja: !formData.baja })}
                      className={`flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 w-fit ${isReadOnly ? "cursor-default opacity-70" : "cursor-pointer"}`}
                    >
                      {/* Switch estado */}
                      <div 
  className="w-12 h-6 rounded-full relative border-2 transition-all duration-300"
  style={{ 
    backgroundColor: formData.baja ? "#fed7d7" : "#c6f6d5", 
    borderColor: formData.baja ? "#e53e3e" : "#38a169" 
  }}
>
                        <div style={{ backgroundColor: formData.baja ? "#e53e3e" : "#38a169", left: formData.baja ? "2px" : "26px" }}
                          className="w-4 h-4 rounded-full absolute top-0.5 transition-all duration-300 pointer-events-none" />
                      </div>
                      <div className="flex flex-col">
                        <span style={{ color: formData.baja ? "#c53030" : "#2f855a" }} className="text-xs font-bold uppercase tracking-wide">
                          {formData.baja ? "Inactivo" : "Activo"}
                        </span>
                        <span className="text-xs text-gray-400">{isReadOnly ? "Modo lectura" : "Haz clic para cambiar"}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!isEditing && (
                <div className="col-span-full">
                  <SectionTitle>Documentación</SectionTitle>
                  <DragDropZone />
                </div>
              )}

              {(!isEditing || !isReadOnly) && (
                <div className="col-span-full mt-2">
                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg border-none cursor-pointer text-base transition-colors">
                    Guardar
                  </button>
                </div>
              )}
            </form>

            {/* Documentación en edición */}
            {isEditing && (
              <div className="mt-10 pt-5 border-t-2 border-gray-100 dark:border-gray-700">
                <SectionTitle>Documentación</SectionTitle>
                {!isReadOnly && <DragDropZone />}
                <div className="flex flex-col gap-2 mt-4">
                  {archivos.filter((a) => a.cuit_cliente === clienteSeleccionado?.cuit).map((a) => (
                    <div key={a.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                        <i className="fa-solid fa-file-pdf text-red-500 mr-2"></i>{a.nombre}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => downloadFile(a.id, a.nombre)}
                          className="px-3 py-1.5 border border-blue-400 text-blue-500 rounded-lg bg-transparent cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm">
                          <i className="fa-solid fa-download"></i>
                        </button>
                        {!isReadOnly && (
                          <button onClick={() => handleEliminarArchivo(a.id)}
                            className="px-3 py-1.5 border border-red-400 text-red-500 rounded-lg bg-transparent cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionClientes;
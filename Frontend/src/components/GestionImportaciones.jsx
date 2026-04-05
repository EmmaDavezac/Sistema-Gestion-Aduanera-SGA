import { useState, useEffect, useRef, useCallback } from "react";
import {
  getImportaciones, createImportacion, updateImportacion,
  getClientes, getAduanas, getArchivosByImportacion, uploadFile, deleteArchivo,
} from "../api/api";
import SkeletonTable from "./SkeletonTable";

const GestionImportaciones = ({ onNotification, autoOpenForm, onFormOpened }) => {
  const [importaciones, setImportaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [aduanas, setAduanas] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [view, setView] = useState("list");
  const [isEditing, setIsEditing] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [filtroNombreCliente, setFiltroNombreCliente] = useState("");
  const [mostrarBaja, setMostrarBaja] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("Todas");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const cargadoRef = useRef(false);

  const [formData, setFormData] = useState({
    numero_destinacion: "", condicion_venta: "", divisa: "", numero_factura: "",
    pais_origen: "", pais_destino: "", unitario_en_divisa: 0, unidad: "",
    cantidad_unidades: 0, fob_total_en_divisa: 0, fob_total_en_dolar: 0,
    numeracion: "", baja: false, aduana: "", cliente: "", puerto_embarque: "",
    oficializacion: "", estado: "", vendedor: "",
  });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [dataImp, dataCli, dataAdu] = await Promise.all([getImportaciones(), getClientes(), getAduanas()]);
      setImportaciones(dataImp); setClientes(dataCli); setAduanas(dataAdu);
    } catch (err) {
      onNotification("Error al cargar datos: " + (err.response?.data?.detail || "Intente nuevamente"), "error");
    } finally { setLoading(false); }
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date) ? dateStr : date.toISOString().split("T")[0];
  };

  const cargarArchivos = useCallback(async (id) => {
    if (!id) return;
    try { const data = await getArchivosByImportacion(id); setArchivos(data); }
    catch (err) { onNotification("Error al cargar archivos", "error"); }
  }, []);

  useEffect(() => {
    if (autoOpenForm) { setView("form"); setIsEditing(false); setIsReadOnly(false); onFormOpened?.(); }
  }, [autoOpenForm]);

  useEffect(() => {
    if (!cargadoRef.current) { cargarDatos(); cargadoRef.current = true; }
  }, [cargarDatos]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : parseFloat(value);
    setFormData((prev) => {
      const newData = { ...prev, [name]: numValue };
      if (name === "cantidad_unidades" || name === "unitario_en_divisa")
        newData.fob_total_en_divisa = newData.cantidad_unidades * newData.unitario_en_divisa;
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const camposObligatorios = ["cliente", "numero_destinacion", "divisa", "aduana", "cantidad_unidades", "unitario_en_divisa", "fob_total_en_divisa", "fob_total_en_dolar"];
    const faltantes = camposObligatorios.filter((campo) => !formData[campo]);
    if (faltantes.length > 0) { onNotification(`Faltan campos: ${faltantes.join(", ")}`, "error"); return; }
    const esDuplicado = importaciones.some((imp) => imp.numero_destinacion === formData.numero_destinacion && String(imp.id) !== String(selectedId));
    if (esDuplicado) { onNotification("El número de destinación ya pertenece a otra operación", "error"); return; }
    if (!window.confirm(`¿Desea ${isEditing ? "actualizar" : "registrar"} esta importación?`)) return;
    try {
      const dataToSend = {
        ...formData,
        aduana: formData.aduana ? parseInt(formData.aduana) : null,
        cliente: formData.cliente || null,
        baja: formData.baja || false,
        cantidad_unidades: parseInt(formData.cantidad_unidades) || 0,
        unitario_en_divisa: parseFloat(formData.unitario_en_divisa) || 0,
        fob_total_en_divisa: parseFloat(formData.fob_total_en_divisa) || 0,
        fob_total_en_dolar: parseFloat(formData.fob_total_en_dolar) || 0,
        oficializacion: formatDate(formData.oficializacion),
      };
      let importacionId = selectedId;
      if (isEditing && selectedId) {
        await updateImportacion(selectedId, dataToSend);
        onNotification("Importación actualizada con éxito", "success");
      } else {
        dataToSend.estado = "Inicializada"; dataToSend.baja = false;
        const nuevaImportacion = await createImportacion(dataToSend);
        importacionId = nuevaImportacion?.id || nuevaImportacion?.data?.id;
        onNotification("Importación registrada con éxito", "success");
      }
      if (filesToUpload.length > 0 && importacionId) {
        const uploadPromises = filesToUpload.map((file) => {
          const fileData = new FormData();
          fileData.append("archivo", file); fileData.append("id_importacion", importacionId);
          fileData.append("tipo", 2); fileData.append("nombre", file.name);
          return uploadFile(fileData);
        });
        try { await Promise.all(uploadPromises); setFilesToUpload([]); }
        catch { onNotification("Error al subir algunos archivos", "error"); }
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      await cargarDatos(); volverALista(true);
    } catch (err) {
      onNotification("Error al guardar: " + (err.response?.data?.detail || "Verifique los datos"), "error");
    }
  };

  const handleFileUpload = async () => {
    if (filesToUpload.length === 0 || !selectedId) return;
    const uploadPromises = filesToUpload.map((file) => {
      const data = new FormData();
      data.append("archivo", file); data.append("id_importacion", selectedId);
      data.append("tipo", 2); data.append("nombre", file.name);
      return uploadFile(data);
    });
    try { await Promise.all(uploadPromises); setFilesToUpload([]); cargarArchivos(selectedId); onNotification("Archivos subidos con éxito", "success"); }
    catch { onNotification("Error al subir archivos", "error"); }
  };

  const handleFileDelete = async (id) => {
    if (!window.confirm("¿Eliminar este documento?")) return;
    try { await deleteArchivo(id); cargarArchivos(selectedId); }
    catch (err) { onNotification("Error al eliminar: " + (err.response?.data?.detail || "Intente nuevamente"), "error"); }
  };

  const handleVerDetalle = async (imp) => {
    setSelectedId(imp.id);
    setFormData({ ...imp, aduana: imp.aduana?.id || imp.aduana, cliente: imp.cliente });
    setIsEditing(true); setIsReadOnly(true); setView("form");
    try { const data = await getArchivosByImportacion(imp.id); setArchivos(data); }
    catch { onNotification("Error al cargar archivos", "error"); }
  };

  const volverALista = (saltarConfirmacion) => {
    if (saltarConfirmacion || window.confirm("¿Desea volver al listado?")) {
      setView("list"); setIsEditing(false); setSelectedId(null);
      setArchivos([]); setFilesToUpload([]);
      setFormData({ numero_destinacion: "", condicion_venta: "", vendedor: "", puerto_embarque: "", numero_factura: "", pais_origen: "", pais_destino: "", divisa: "", unitario_en_divisa: 0, unidad: "", cantidad_unidades: 0, fob_total_en_divisa: 0, fob_total_en_dolar: 0, numeracion: "", estado: "", baja: false, aduana: "", cliente: "", oficializacion: "" });
      window.scrollTo(0, 0);
    }
  };

  const impFiltradas = importaciones.filter((i) => {
    const t = busqueda.toLowerCase();
    const coincideBusqueda = i.numero_destinacion?.toLowerCase().includes(t) || i.cliente_nombre?.toLowerCase().includes(t) || i.cliente?.toLowerCase().includes(t) || i.oficializacion?.toLowerCase().includes(t);
    const coincideEstado = filtroEstado === "Todas" ? true : i.estado === filtroEstado;
    return coincideBusqueda && coincideEstado && (mostrarBaja ? true : !i.baja);
  });

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

  const DragDropZone = ({ inputId }) => (
    <div
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("bg-blue-50", "dark:bg-blue-900/20", "border-blue-400"); }}
      onDragLeave={(e) => { e.currentTarget.classList.remove("bg-blue-50", "dark:bg-blue-900/20", "border-blue-400"); }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("bg-blue-50", "border-blue-400");
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) { setFilesToUpload((prev) => [...prev, ...droppedFiles]); onNotification(`${droppedFiles.length} archivo(s) preparado(s).`, "success"); }
      }}
      onClick={() => document.getElementById(inputId).click()}
      className="flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-10 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center transition-all cursor-pointer mt-5 mb-5 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400"
    >
      <i className="fa-solid fa-cloud-arrow-up text-5xl text-blue-500"></i>
      <div>
        <p className="text-base font-semibold text-gray-700 dark:text-gray-200 m-0">Arrastra la documentación aquí</p>
        <p className="text-sm text-gray-400 mt-1">O haz clic para seleccionar un archivo</p>
      </div>
      <input id={inputId} type="file" multiple className="hidden"
        onChange={(e) => setFilesToUpload((prev) => [...prev, ...Array.from(e.target.files)])}
      />
      {filesToUpload.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 justify-center w-full">
          {filesToUpload.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
              <i className="fa-solid fa-file-pdf text-red-500 text-sm"></i>
              <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); setFilesToUpload(filesToUpload.filter((_, i) => i !== index)); }}
                className="border-none bg-transparent text-gray-300 hover:text-gray-500 cursor-pointer p-0">
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
                placeholder="Buscar por CUIT de Cliente, Vendedor o N° Destinación..."
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button onClick={() => { setIsEditing(false); setIsReadOnly(false); setView("form"); }}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors cursor-pointer border-none text-sm">
               Registrar
            </button>
          </div>

         {/* Filtros importaciones */}
<div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">

  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
    <div onClick={() => setMostrarBaja(!mostrarBaja)}
      className="flex items-center gap-2.5 cursor-pointer select-none">
      <div className={`w-10 h-5 rounded-full relative transition-all duration-300 border-2 flex-shrink-0
        ${mostrarBaja ? "bg-blue-500 border-blue-600" : "bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500"}`}>
        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-300 shadow
          ${mostrarBaja ? "left-[18px]" : "left-[1px]"}`} />
      </div>
      <span className={`text-xs font-semibold transition-colors ${mostrarBaja ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
        Mostrar dadas de baja
      </span>
    </div>
    <span className="text-xs text-gray-400 dark:text-gray-500">
      <span className="font-bold text-gray-600 dark:text-gray-300">{impFiltradas.length}</span>
      <span> / {importaciones.length}</span>
    </span>
  </div>

  <div className="flex p-2 gap-1.5">
    {[
      { value: "Todas",        label: "Todas",          icon: "fa-list" },
      { value: "Inicializada", label: "Inicializadas",  icon: "fa-circle-play" },
      { value: "En Proceso",   label: "En Proceso",     icon: "fa-spinner" },
      { value: "Finalizada",   label: "Finalizadas",    icon: "fa-circle-check" },
    ].map((op) => (
      <button key={op.value} onClick={() => setFiltroEstado(op.value)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer
          ${filtroEstado === op.value
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            : "border-transparent text-gray-500 dark:text-gray-400 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}>
        <i className={`fa-solid ${op.icon} text-[10px]`}></i>
        <span className="hidden sm:inline">{op.label}</span>
        <span className="sm:hidden">{op.value === "Todas" ? "Todas" : op.value === "Inicializada" ? "Init." : op.value === "En Proceso" ? "Proc." : "Final."}</span>
      </button>
    ))}
  </div>

  {(mostrarBaja || filtroEstado !== "Todas") && (
    <div className="px-3 pb-2.5">
      <button
        onClick={() => { setMostrarBaja(false); setFiltroEstado("Todas"); }}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg transition-colors cursor-pointer bg-transparent"
      >
        <i className="fa-solid fa-xmark"></i> Limpiar filtros
      </button>
    </div>
  )}
</div>

          {/* Cards */}
        {impFiltradas.map((imp) => (
  <div key={imp.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-3 border border-gray-100 dark:border-gray-700">
    <div className="flex justify-between items-start gap-3">

      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
          <i className="fa-solid fa-ship"></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <strong className="text-sm text-gray-800 dark:text-gray-100">ID: {imp.id}</strong>
            <Badge bg={imp.estado === "Finalizada" ? "#f0fff4" : "#fffeb3"} color={imp.estado === "Finalizada" ? "#22543d" : "#856404"}>
              {imp.estado}
            </Badge>
            {imp.baja && <Badge bg="#fff5f5" color="#c53030">Dada de baja</Badge>}
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 dark:text-gray-500">
            <span><i className="fa-solid fa-id-card mr-1"></i>CUIT: {imp.cliente || "No Cargado"}</span>
            <span><i className="fa-solid fa-user-tie mr-1"></i>Vendedor: {imp.vendedor || "No Cargado"}</span>
            <span><i className="fa-solid fa-globe mr-1"></i>{imp.pais_origen || "No Cargado"} → {imp.pais_destino || "No Cargado"}</span>
            <span>N° Dest: {imp.numero_destinacion || "No Cargado"}</span>
          </div>
        </div>
      </div>

      <button onClick={() => handleVerDetalle(imp)}
        className="px-3 py-2 border border-blue-400 text-blue-500 rounded-lg bg-transparent cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm flex-shrink-0">
        <i className="fa-solid fa-eye"></i>
      </button>

    </div>
  </div>
))}

{loading ? <SkeletonTable rows={4} /> : impFiltradas.length === 0 && (
  <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
    <i className="fa-solid fa-box-open text-5xl mb-4 text-gray-300 dark:text-gray-600 block"></i>
    <h3 className="m-0 text-lg text-gray-600 dark:text-gray-300">No hay coincidencias</h3>
    <p className="mt-2 text-sm">Prueba con otro CUIT de Cliente, Vendedor o N° Destinación.</p>
  </div>
)}
        </div>

      ) : (
        /* ── Formulario ── */
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
            <button onClick={() => volverALista(false)}
              className="flex items-center gap-2 border-none bg-transparent text-blue-600 dark:text-blue-400 cursor-pointer font-bold text-sm hover:text-blue-800 transition-colors">
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

              <SectionTitle>Datos Generales</SectionTitle>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={labelClass}>Cliente *</label>
                  {!isReadOnly && (
                    <button type="button" onClick={() => setShowClienteModal(true)}
                      className="text-xs text-blue-500 border-none bg-transparent cursor-pointer hover:text-blue-700">
                      <i className="fa-solid fa-search mr-1"></i> Buscar
                    </button>
                  )}
                </div>
                <select name="cliente" value={formData.cliente} onChange={handleInputChange} disabled={isReadOnly} required className={inputClass(isReadOnly)}>
                  <option value="">Seleccione Cliente...</option>
                  {clientes.filter((c) => !c.baja).map((c) => <option key={c.cuit} value={c.cuit}>{c.nombre} ({c.cuit})</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>N° Destinación *</label>
                <input name="numero_destinacion" value={formData.numero_destinacion || ""} onChange={handleInputChange} disabled={isReadOnly} required placeholder="Ej: 12345678" className={inputClass(isReadOnly)} />
              </div>

              <div>
                <label className={labelClass}>N° Factura *</label>
                <input name="numero_factura" value={formData.numero_factura} onChange={handleInputChange} disabled={isReadOnly} required placeholder="Ej: F123-45678" className={inputClass(isReadOnly)} />
              </div>

              <div>
                <label className={labelClass}>Vendedor</label>
                <input name="vendedor" value={formData.vendedor} onChange={handleInputChange} disabled={isReadOnly} placeholder="Ej: Empresa XYZ S.A." className={inputClass(isReadOnly)} />
              </div>

              <div>
                <label className={labelClass}>Aduana *</label>
                <select name="aduana" value={formData.aduana} onChange={handleInputChange} disabled={isReadOnly} required className={inputClass(isReadOnly)}>
                  <option value="">Seleccione Aduana...</option>
                  {aduanas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Oficialización</label>
                <input type="date" name="oficializacion" value={formData.oficializacion} onChange={handleInputChange} disabled={isReadOnly} className={inputClass(isReadOnly)} />
              </div>

              {isEditing && (
                <div>
                  <label className={labelClass}>Estado</label>
                  <select name="estado" value={formData.estado} onChange={handleInputChange} disabled={isReadOnly} className={inputClass(isReadOnly)}>
                    <option value="Inicializada">Inicializada</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Finalizada">Finalizada</option>
                  </select>
                </div>
              )}

              <SectionTitle>Logística y Origen</SectionTitle>

              <div>
                <label className={labelClass}>País/Provincia de Origen</label>
                <input name="pais_origen" value={formData.pais_origen} onChange={handleInputChange} disabled={isReadOnly} placeholder="Ej: Argentina" className={inputClass(isReadOnly)} />
              </div>
              <div>
                <label className={labelClass}>Destino</label>
                <input name="pais_destino" value={formData.pais_destino} onChange={handleInputChange} disabled={isReadOnly} placeholder="Ej: Brasil" className={inputClass(isReadOnly)} />
              </div>
              <div>
                <label className={labelClass}>Puerto Embarque</label>
                <input name="puerto_embarque" value={formData.puerto_embarque} onChange={handleInputChange} disabled={isReadOnly} placeholder="Ej: Buenos Aires" className={inputClass(isReadOnly)} />
              </div>

              <SectionTitle>Detalle de Mercadería</SectionTitle>

              <div>
                <label className={labelClass}>Cantidad de Unidades *</label>
                <input type="number" min="1" step="1" name="cantidad_unidades" value={formData.cantidad_unidades} onChange={handleNumericChange} disabled={isReadOnly} required className={inputClass(isReadOnly)} />
              </div>
              <div>
                <label className={labelClass}>Unidad *</label>
                <select name="unidad" value={formData.unidad} onChange={handleInputChange} disabled={isReadOnly} required className={inputClass(isReadOnly)}>
                  <option value="">Seleccione Unidad...</option>
                  {["KG","L","M","PZA","TON","CBM","SET","ROL","PAR","JUE","BUL","SOB","CJA","BAG"].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Unitario en Divisa *</label>
                <input type="number" min="0" name="unitario_en_divisa" value={formData.unitario_en_divisa} onChange={handleNumericChange} disabled={isReadOnly} required className={inputClass(isReadOnly)} />
              </div>

              <SectionTitle>Valores Comerciales</SectionTitle>

              <div>
                <label className={labelClass}>Divisa *</label>
                <select name="divisa" value={formData.divisa} onChange={handleInputChange} disabled={isReadOnly} required className={inputClass(isReadOnly)}>
                  <option value="">Seleccione Divisa...</option>
                  {["USD","EUR","ARS","BRL","CNY","JPY","GBP","CAD","AUD"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>FOB Total Divisa *</label>
                <input type="number" min="0" name="fob_total_en_divisa" value={formData.fob_total_en_divisa} onChange={handleNumericChange} disabled={isReadOnly} required className={inputClass(isReadOnly)} />
              </div>
              <div>
                <label className={labelClass}>FOB Total USD *</label>
                <input type="number" min="0" name="fob_total_en_dolar" value={formData.fob_total_en_dolar} onChange={handleNumericChange} disabled={isReadOnly} required className={inputClass(isReadOnly)} />
              </div>
              <div>
                <label className={labelClass}>Condición de Venta *</label>
                <select name="condicion_venta" value={formData.condicion_venta} onChange={handleInputChange} disabled={isReadOnly} required className={inputClass(isReadOnly)}>
                  <option value="">Seleccione...</option>
                  {["CFR","CIF","CIP","CPT","DAP","DAT","DDP","EXW","FAS","FCA","FOB","MUL"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {isAdmin && isEditing && (
                <>
                  <SectionTitle>Estado Lógico de la Operación</SectionTitle>
                  <div className="col-span-full">
                    <div
                      onClick={() => !isReadOnly && setFormData({ ...formData, baja: !formData.baja })}
                      className={`flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 w-fit ${isReadOnly ? "cursor-default opacity-70" : "cursor-pointer"}`}
                    >
                      <div style={{ backgroundColor: formData.baja ? "#fed7d7" : "#c6f6d5", borderColor: formData.baja ? "#e53e3e" : "#38a169" }}
                        className="w-12 h-6 rounded-full relative border-2 transition-all duration-300">
                        <div style={{ backgroundColor: formData.baja ? "#e53e3e" : "#38a169", left: formData.baja ? "2px" : "26px" }}
                          className="w-4 h-4 rounded-full absolute top-0.5 transition-all duration-300 pointer-events-none" />
                      </div>
                      <div className="flex flex-col">
                        <span style={{ color: formData.baja ? "#c53030" : "#2f855a" }} className="text-xs font-bold uppercase tracking-wide">
                          {formData.baja ? "Dada de baja" : "Activa"}
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
                  <DragDropZone inputId="file-input-imp-new" />
                </div>
              )}

              {!isReadOnly && (
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
                {!isReadOnly && <DragDropZone inputId="file-input-imp-edit" />}
                <div className="flex flex-col gap-2 mt-4">
                  {archivos.map((arch) => (
                    <div key={arch.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg mt-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                        <i className="fa-solid fa-file-pdf text-red-500 mr-2"></i>{arch.nombre}
                      </span>
                      <div className="flex gap-2">
                        <a href={arch.archivo} target="_blank" rel="noreferrer"
                          className="px-3 py-1.5 border border-blue-400 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm">
                          <i className="fa-solid fa-download"></i>
                        </a>
                        {!isReadOnly && (
                          <button onClick={() => handleFileDelete(arch.id)}
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

      {/* ── Modal cliente ── */}
      {showClienteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl w-[400px] shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0 text-gray-800 dark:text-gray-100 font-bold">
                <i className="fa-solid fa-users mr-2"></i> Buscar Cliente
              </h3>
              <button onClick={() => setShowClienteModal(false)} className="border-none bg-transparent text-gray-400 text-xl cursor-pointer hover:text-gray-600">&times;</button>
            </div>
            <input
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 mb-3 focus:outline-none focus:border-blue-500 box-border"
              placeholder="Escriba nombre del cliente..."
              value={filtroNombreCliente}
              onChange={(e) => setFiltroNombreCliente(e.target.value)}
              autoFocus
            />
            <div className="max-h-[250px] overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-lg">
              {clientes.filter((c) => !c.baja && c.nombre.toLowerCase().includes(filtroNombreCliente.toLowerCase())).map((c) => (
                <div key={c.cuit}
                  onClick={() => { setFormData({ ...formData, cliente: c.cuit }); setShowClienteModal(false); setFiltroNombreCliente(""); }}
                  className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors last:border-0">
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">{c.nombre}</div>
                  <small className="text-gray-400">CUIT: {c.cuit}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionImportaciones;
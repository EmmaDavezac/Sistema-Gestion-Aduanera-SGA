import { useState, useEffect, useRef, useCallback } from "react";
import { getAduanas, createAduana, deleteAduana } from "../api/api";
import SkeletonTable from "./SkeletonTable";

const GestionAduanas = ({ onNotification }) => {
  const [aduanas, setAduanas] = useState([]);
  const [view, setView] = useState("list");
  const [busqueda, setBusqueda] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", nombre: "" });
  const [loading, setLoading] = useState(true);
  const cargadoRef = useRef(false);

  const cargarAduanas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAduanas();
      setAduanas(data);
    } catch {
      onNotification("Error al cargar aduanas.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cargadoRef.current) { cargarAduanas(); cargadoRef.current = true; }
  }, [cargarAduanas]);

  const volverALista = (saltarConfirmacion = false) => {
    if (saltarConfirmacion || window.confirm("¿Desea volver al listado?")) {
      setView("list");
      setIsEditing(false);
      setFormData({ id: "", nombre: "" });
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAduana(formData);
      onNotification("Aduana registrada con éxito", "success");
      await cargarAduanas();
      volverALista(true);
    } catch {
      onNotification("Error: El código ya existe o los datos son inválidos.", "error");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta aduana? Esta acción no se puede deshacer.")) return;
    try {
      await deleteAduana(id);
      await cargarAduanas();
      onNotification("Aduana eliminada exitosamente.", "success");
    } catch {
      onNotification("Error al eliminar la aduana.", "error");
    }
  };

  const aduanasFiltradas = aduanas.filter(
    (a) => a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || a.id.toString().includes(busqueda)
  );

  const inputClass = (disabled) =>
    `w-full px-3 py-2.5 rounded-lg border text-sm transition-colors box-border ${
      disabled
        ? "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500"
    }`;

  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide";

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
                placeholder="Buscar por Nombre o Código de Aduana..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <button
              onClick={() => { setIsEditing(false); setFormData({ id: "", nombre: "" }); setView("form"); }}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors cursor-pointer border-none text-sm"
            >
           Registrar
            </button>
          </div>

          {/* Lista */}
     {loading ? (
  <SkeletonTable rows={4} />
) : aduanasFiltradas.length === 0 ? (
  <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
    <i className="fa-solid fa-box-open text-5xl mb-4 text-gray-300 dark:text-gray-600 block"></i>
    <h3 className="m-0 text-lg text-gray-600 dark:text-gray-300">No hay coincidencias</h3>
    <p className="mt-2 text-sm">Prueba con otro Código o Nombre de Aduana.</p>
  </div>
) : (
  aduanasFiltradas.map((a) => (
    <div key={a.id} className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-sm mb-4 border border-gray-100 dark:border-gray-700">
      {/* Contenedor Principal: Columna en móvil, Fila en escritorio */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        
        {/* Lado Izquierdo: Icono + Texto */}
        <div className="flex items-start sm:items-center gap-3">
          {/* Icono circular - se oculta en móviles muy pequeños si prefieres ahorrar espacio */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <i className="fa-solid fa-building-columns text-sm sm:text-base"></i>
          </div>

          {/* Textos: Se apilan en móvil */}
          <div className="flex flex-col gap-1 min-w-0">
            <strong className="text-sm sm:text-base text-gray-800 dark:text-gray-100 truncate break-words">
              {a.nombre}
            </strong>
            <div>
              <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 inline-block">
                ID: {a.id}
              </span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Botones de Acción */}
        <div className="flex items-center justify-end gap-2 border-t sm:border-none pt-3 sm:pt-0 border-gray-100 dark:border-gray-700">
          <button
            title="Ver Detalle"
            onClick={() => { setFormData({ id: a.id, nombre: a.nombre }); setIsEditing(true); setView("form"); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 border border-blue-400 text-blue-500 rounded-lg bg-transparent cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm"
          >
            <i className="fa-solid fa-eye"></i>
            <span className="sm:hidden font-semibold">Detalles</span>
          </button>
          
          <button
            title="Eliminar"
            onClick={() => handleEliminar(a.id)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 border border-red-400 text-red-500 rounded-lg bg-transparent cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
          >
            <i className="fa-solid fa-trash-can"></i>
            <span className="sm:hidden font-semibold">Borrar</span>
          </button>
        </div>

      </div>
    </div>
  ))
)}
        </div>

      ) : (
        /* ── Formulario ── */
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-5">
            <button
              onClick={() => volverALista(false)}
              className="flex items-center gap-2 border-none bg-none text-blue-600 dark:text-blue-400 cursor-pointer font-bold text-sm hover:text-blue-800 transition-colors"
            >
              <i className="fa-solid fa-arrow-left"></i> Volver al listado
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="pb-2 mb-5 border-b-2 border-blue-500 text-gray-700 dark:text-gray-200 text-sm font-bold uppercase tracking-widest">
              Datos de la Aduana
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              <div>
                <label className={labelClass}>Código Identificador *</label>
                <input
                  value={formData.id}
                  disabled={isEditing}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase().slice(0, 4) })}
                  required
                  placeholder="Ej: 015"
                  className={inputClass(isEditing)}
                />
              </div>

              <div>
                <label className={labelClass}>Nombre *</label>
                <input
                  value={formData.nombre}
                  disabled={isEditing}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Concepción del Uruguay"
                  className={inputClass(isEditing)}
                />
              </div>

              {!isEditing && (
                <div className="col-span-full mt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg border-none cursor-pointer text-base transition-colors"
                  >
                  Guardar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAduanas;
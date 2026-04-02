import { motion } from "framer-motion";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t-2 border-gray-100 dark:border-gray-800 pt-10 pb-5 mt-15 w-full">
      <div className="max-w-[1200px] mx-auto px-10 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-10 mb-10">

        {/* Marca */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-xl font-extrabold text-blue-900 dark:text-white tracking-tight">SGA</span>
            <span className="text-gray-300 dark:text-gray-600 text-lg">|</span>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Gestión Aduanera</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed m-0">
            Simplificando el trabajo de los despachantes de aduana.
          </p>
        </div>

        {/* Recursos */}
       <div className="flex flex-col gap-3">
  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recursos</span>
  <a                                          
    href="https://github.com/EmmaDavezac/Sistema-Gestion-Aduanera-SGA/blob/main/Docs/ManualUsuario.pdf"
    className="text-blue-500 dark:text-blue-400 no-underline text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
  >
    <i className="fa-solid fa-book-open mr-2"></i>
    Documentación del proyecto
  </a>
</div>

        {/* Soporte */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Soporte Técnico</span>
          <div className="flex flex-col gap-2.5">
            <motion.a whileHover={{ x: 5, color: "#3182ce" }}
              href="mailto:lucianodavezac@gmail.com"
              className="flex items-center gap-2.5 no-underline text-gray-500 dark:text-gray-400 text-sm transition-colors"
            >
              <i className="fa-solid fa-envelope"></i>
              lucianodavezac@gmail.com
            </motion.a>
            <motion.a whileHover={{ x: 5, color: "#333" }}
              href="https://github.com/EmmaDavezac"
              className="flex items-center gap-2.5 no-underline text-gray-500 dark:text-gray-400 text-sm transition-colors"
            >
              <i className="fa-brands fa-github"></i>
              EmmaDavezac
            </motion.a>
            <motion.a whileHover={{ x: 5, color: "#25D366" }}
              href="https://wa.me/543438471858"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 no-underline text-gray-500 dark:text-gray-400 text-sm transition-colors"
            >
              <i className="fa-brands fa-whatsapp text-green-500"></i>
              WhatsApp
            </motion.a>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-5 px-10 flex justify-between items-center max-w-[1200px] mx-auto flex-wrap gap-4">
        <div className="text-sm text-gray-400 dark:text-gray-500">
          Desarrollado con <i className="fa-solid fa-heart text-red-400"></i> por{" "}
          <a href="http://github.com/EmmaDavezac" target="_blank" rel="noopener noreferrer"
            className="text-gray-700 dark:text-gray-300 font-bold no-underline hover:text-blue-600 transition-colors">
            Emmanuel Davezac
          </a>
        </div>
        <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500 text-xs">
          <span>© {year} Todos los derechos reservados</span>
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-semibold text-gray-500 dark:text-gray-400">
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
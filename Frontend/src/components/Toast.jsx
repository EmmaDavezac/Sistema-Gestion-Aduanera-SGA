// Toast.jsx
import { useEffect } from "react";

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div className="relative w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 animate-[slideIn_0.3s_ease-out_forwards]">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes shrinkBar {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      <div className="flex items-center gap-3 p-4">
        <i className={`text-xl ${isSuccess ? "fa-solid fa-circle-check text-green-500" : "fa-solid fa-circle-xmark text-red-500"}`}></i>
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium flex-1 break-words">{msg}</span>
        <button
          onClick={onClose}
          className="border-none bg-none text-gray-300 dark:text-gray-500 text-lg cursor-pointer px-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="h-1 w-full bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-full origin-left animate-[shrinkBar_10s_linear_forwards] ${isSuccess ? "bg-green-500" : "bg-red-500"}`}
        />
      </div>
    </div>
  );
};

export default Toast;
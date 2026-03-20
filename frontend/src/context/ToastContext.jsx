import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

const STYLES = {
    success: { wrapper: "bg-white border-green-400",  icon: "bg-green-100 text-green-500", title: "text-green-700", bar: "bg-green-400" },
    error:   { wrapper: "bg-white border-red-400",    icon: "bg-red-100 text-red-500",     title: "text-red-700",   bar: "bg-red-400"   },
    warning: { wrapper: "bg-white border-yellow-400", icon: "bg-yellow-100 text-yellow-500", title: "text-yellow-700", bar: "bg-yellow-400" },
    info:    { wrapper: "bg-white border-blue-400",   icon: "bg-blue-100 text-blue-500",   title: "text-blue-700",  bar: "bg-blue-400"  },
};

const ICONS = {
    success: <FiCheckCircle size={22} />,
    error:   <FiAlertCircle size={22} />,
    warning: <FiAlertTriangle size={22} />,
    info:    <FiInfo size={22} />,
};

const TITLES = {
    success: "Éxito",
    error:   "Error",
    warning: "Advertencia",
    info:    "Información",
};

function ToastItem({ toast, onClose }) {
    const s = STYLES[toast.type];
    const btnRef = useRef(null);

    // Enfocar el botón de cerrar al montar para accesibilidad
    useEffect(() => {
        btnRef.current?.focus();
    }, []);

    return (
        <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`toast-title-${toast.id}`}
            aria-describedby={`toast-msg-${toast.id}`}
            className={`relative w-full max-w-sm rounded-2xl border-l-4 shadow-2xl overflow-hidden ${s.wrapper}`}
        >
            {/* Contenido */}
            <div className="flex items-start gap-4 px-5 py-4">
                <div className={`flex-shrink-0 rounded-full p-2 ${s.icon}`}>
                    {ICONS[toast.type]}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <p id={`toast-title-${toast.id}`} className={`text-sm font-bold ${s.title}`}>
                        {TITLES[toast.type]}
                    </p>
                    <p id={`toast-msg-${toast.id}`} className="mt-0.5 text-sm text-slate-700 leading-snug">
                        {toast.message}
                    </p>
                </div>
                <button
                    ref={btnRef}
                    onClick={() => onClose(toast.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 rounded-lg p-0.5"
                    aria-label="Cerrar"
                >
                    <FiX size={18} />
                </button>
            </div>

            {/* Barra de progreso */}
            <div className={`h-1 ${s.bar} animate-shrink`} />
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback(({ message, type = "info", duration = 4000 }) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }
    }, [dismiss]);

    // Cerrar con Escape
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape" && toasts.length > 0) {
                dismiss(toasts[toasts.length - 1].id);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [toasts, dismiss]);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            {/* Overlay de fondo cuando hay toasts */}
            {toasts.length > 0 && (
                <div
                    className="fixed inset-0 bg-black/30 z-[9998]"
                    onClick={() => dismiss(toasts[toasts.length - 1].id)}
                />
            )}

            {/* Contenedor centrado */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center space-y-3 w-full max-w-sm px-4 pointer-events-auto">
                    {toasts.map(t => (
                        <ToastItem key={t.id} toast={t} onClose={dismiss} />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx.toast;
}

import { useEffect, useRef } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

/**
 * Modal de confirmación reutilizable.
 * Props:
 *   open       – boolean, controla visibilidad
 *   title      – título del modal (default "¿Confirmar acción?")
 *   message    – mensaje descriptivo
 *   confirmText – texto del botón confirmar (default "Eliminar")
 *   onConfirm  – callback al confirmar
 *   onCancel   – callback al cancelar / cerrar
 */
export default function ConfirmModal({
    open,
    title = "¿Confirmar acción?",
    message,
    confirmText = "Eliminar",
    onConfirm,
    onCancel,
}) {
    const cancelRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        cancelRef.current?.focus();
        const handler = (e) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

            {/* Panel */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <FiAlertTriangle className="text-red-600" size={20} />
                        </div>
                        <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-1">
                    <button
                        ref={cancelRef}
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

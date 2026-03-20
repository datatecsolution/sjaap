import { useState } from "react";
import api from "../api/axiosConfig";
import { FiX, FiLock } from "react-icons/fi";
import { useToast } from "../context/ToastContext";

export default function CambiarPasswordModal({ onClose }) {
    const toast = useToast();
    const [form, setForm] = useState({ passwordActual: "", passwordNuevo: "", confirmar: "" });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.passwordActual) e.passwordActual = "Ingrese su contraseña actual.";
        if (!form.passwordNuevo) e.passwordNuevo = "Ingrese la nueva contraseña.";
        else if (form.passwordNuevo.length < 6) e.passwordNuevo = "Mínimo 6 caracteres.";
        if (form.passwordNuevo !== form.confirmar) e.confirmar = "Las contraseñas no coinciden.";
        return e;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setSaving(true);
        try {
            await api.put("/usuarios/mi-password", {
                passwordActual: form.passwordActual,
                passwordNuevo:  form.passwordNuevo,
            });
            toast({ message: "Contraseña actualizada correctamente.", type: "success" });
            onClose();
        } catch (err) {
            const msg = err.response?.data || "Error al cambiar la contraseña.";
            toast({ message: typeof msg === "string" ? msg : "Error al cambiar la contraseña.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center space-x-2">
                        <FiLock className="text-blue-600" size={18} />
                        <h2 className="text-lg font-bold text-slate-800">Cambiar Contraseña</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <FiX size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Contraseña actual <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            name="passwordActual"
                            value={form.passwordActual}
                            onChange={handleChange}
                            autoFocus
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.passwordActual ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                        />
                        {errors.passwordActual && <p className="text-xs text-red-600 mt-0.5">{errors.passwordActual}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Nueva contraseña <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            name="passwordNuevo"
                            value={form.passwordNuevo}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.passwordNuevo ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                        />
                        {errors.passwordNuevo && <p className="text-xs text-red-600 mt-0.5">{errors.passwordNuevo}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Confirmar nueva contraseña <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            name="confirmar"
                            value={form.confirmar}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.confirmar ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                        />
                        {errors.confirmar && <p className="text-xs text-red-600 mt-0.5">{errors.confirmar}</p>}
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
                        >
                            <FiLock size={15} />
                            <span>{saving ? "Guardando..." : "Cambiar contraseña"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

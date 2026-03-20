import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { FiX, FiSave } from "react-icons/fi";
import { useToast } from "../context/ToastContext";

export default function AbonadoForm({ onClose, onSave, abonadoEdit = null }) {
    const toast = useToast();
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        direccion: "",
        telefono: "",
        celular: "",
        email: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!formData.nombre.trim()) e.nombre = "El nombre es obligatorio.";
        else if (formData.nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres.";
        if (!formData.apellido.trim()) e.apellido = "El apellido es obligatorio.";
        else if (formData.apellido.trim().length < 2) e.apellido = "Mínimo 2 caracteres.";
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            e.email = "Ingrese un email válido.";
        if (formData.telefono && !/^\d[\d\s\-]{6,}$/.test(formData.telefono))
            e.telefono = "Formato inválido (solo números).";
        if (formData.celular && !/^\d[\d\s\-]{6,}$/.test(formData.celular))
            e.celular = "Formato inválido (solo números).";
        return e;
    };

    useEffect(() => {
        if (abonadoEdit) {
            setFormData({
                id: abonadoEdit.id,
                nombre: abonadoEdit.nombre || "",
                apellido: abonadoEdit.apellido || "",
                direccion: abonadoEdit.direccion || "",
                telefono: abonadoEdit.telefono || "",
                celular: abonadoEdit.celular || "",
                email: abonadoEdit.email || "",
            });
        }
    }, [abonadoEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setLoading(true);
        try {
            if (formData.id) {
                await api.put(`/abonados/${formData.id}`, formData);
            } else {
                await api.post("/abonados", formData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error("Error guardando abonado:", error);
            toast({ message: "Ocurrió un error al guardar el abonado.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">
                        {formData.id ? "Editar Abonado" : "Nuevo Abonado"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Nombre <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.nombre ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                            />
                            {errors.nombre && <p className="text-xs text-red-600 mt-0.5">{errors.nombre}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Apellido <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.apellido ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                            />
                            {errors.apellido && <p className="text-xs text-red-600 mt-0.5">{errors.apellido}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Teléfono</label>
                            <input
                                type="text"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.telefono ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                            />
                            {errors.telefono && <p className="text-xs text-red-600 mt-0.5">{errors.telefono}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Celular</label>
                            <input
                                type="text"
                                name="celular"
                                value={formData.celular}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.celular ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                            />
                            {errors.celular && <p className="text-xs text-red-600 mt-0.5">{errors.celular}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                            />
                            {errors.email && <p className="text-xs text-red-600 mt-0.5">{errors.email}</p>}
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">Dirección</label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (
                                <span>Guardando...</span>
                            ) : (
                                <>
                                    <FiSave />
                                    <span>Guardar Abonado</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

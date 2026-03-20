import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { FiX, FiSave } from "react-icons/fi";
import { useToast } from "../context/ToastContext";

export default function ConexionForm({ onClose, onSave, conexionEdit = null }) {
    const toast = useToast();
    const [formData, setFormData] = useState({
        abonado: { id: "" },
        barrioColonia: { id: "" }, // We will need a controller for this, or just map it 
        tipoConexion: { id: "" },
        estadoConexion: { id: "" },
        direccion: "",
        noForm: ""
    });

    const [abonados, setAbonados] = useState([]);
    const [searchTermAbonado, setSearchTermAbonado] = useState("");
    const [showAbonadoDropdown, setShowAbonadoDropdown] = useState(false);
    const [tipos, setTipos] = useState([]);
    const [estados, setEstados] = useState([]);
    // We also need barrios/colonias to create a conexion correctly based on the model.
    const [barrios, setBarrios] = useState([]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!formData.abonado.id) e.abonado = "Seleccione un abonado.";
        if (!formData.tipoConexion.id) e.tipoConexion = "Seleccione el tipo de conexión.";
        if (!formData.estadoConexion.id) e.estadoConexion = "Seleccione el estado.";
        if (!formData.direccion.trim()) e.direccion = "La dirección es obligatoria.";
        else if (formData.direccion.trim().length < 5) e.direccion = "Ingrese una dirección más detallada.";
        return e;
    };

    useEffect(() => {
        if (conexionEdit) {
            setFormData({
                id: conexionEdit.id,
                abonado: { id: conexionEdit.abonado?.id || "" },
                barrioColonia: { id: conexionEdit.barrioColonia?.id || "" },
                tipoConexion: { id: conexionEdit.tipoConexion?.id || "" },
                estadoConexion: { id: conexionEdit.estadoConexion?.id || "" },
                direccion: conexionEdit.direccion || "",
                noForm: conexionEdit.noForm || ""
            });
        }
        fetchDependencies();
    }, [conexionEdit]);

    useEffect(() => {
        if (conexionEdit && abonados.length > 0) {
            const ab = abonados.find(a => a.id === conexionEdit.abonado?.id);
            if (ab) {
                setSearchTermAbonado(`${ab.nombre} ${ab.apellido}`);
            }
        }
    }, [conexionEdit, abonados]);

    const filteredAbonados = abonados.filter(a => 
        `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTermAbonado.toLowerCase())
    );

    const fetchDependencies = async () => {
        try {
            const [abonadosRes, tiposRes, estadosRes] = await Promise.all([
                api.get("/abonados"),
                api.get("/tipos-conexiones"),
                api.get("/estados-conexiones")
            ]);
            setAbonados(abonadosRes.data);
            setTipos(tiposRes.data);
            setEstados(estadosRes.data);

            // Si no tenemos endpoint de barrios aún, podríamos atrapar el error
            try {
                const barriosRes = await api.get("/barrios");
                setBarrios(barriosRes.data);
            } catch (err) {
                console.warn("Falta endpoint de barrios/colonias");
            }
        } catch (error) {
            console.error("Error al obtener dependencias para el formulario:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (["abonado", "barrioColonia", "tipoConexion", "estadoConexion"].includes(name)) {
            setFormData({ ...formData, [name]: { id: parseInt(value) } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setLoading(true);
        try {
            if (formData.id) {
                await api.put(`/conexiones/${formData.id}`, formData);
            } else {
                await api.post("/conexiones", formData);
            }
            onSave(); // Refresca la tabla
            onClose(); // Cierra el modal
        } catch (error) {
            console.error("Error guardando conexión:", error);
            toast({ message: "Ocurrió un error al guardar la conexión.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">
                        {formData.id ? "Editar Conexión" : "Nueva Conexión"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 relative">
                            <label className="text-sm font-medium text-slate-700">Abonado <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Buscar abonado por nombre..."
                                value={searchTermAbonado}
                                onChange={(e) => {
                                    setSearchTermAbonado(e.target.value);
                                    setShowAbonadoDropdown(true);
                                    if (e.target.value === "") {
                                        setFormData({ ...formData, abonado: { id: "" } });
                                    }
                                }}
                                onFocus={() => setShowAbonadoDropdown(true)}
                                onBlur={() => setTimeout(() => setShowAbonadoDropdown(false), 200)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.abonado ? 'border-red-400 bg-red-50' : (!formData.abonado.id && searchTermAbonado ? 'border-red-300' : 'border-slate-300')}`}
                            />
                            {errors.abonado && <p className="text-xs text-red-600 mt-0.5">{errors.abonado}</p>}
                            {showAbonadoDropdown && (
                                <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-auto mt-1 top-full left-0">
                                    {filteredAbonados.length > 0 ? filteredAbonados.map(a => (
                                        <li
                                            key={a.id}
                                            className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-slate-700"
                                            onClick={() => {
                                                setFormData({ ...formData, abonado: { id: a.id } });
                                                setSearchTermAbonado(`${a.nombre} ${a.apellido}`);
                                                setShowAbonadoDropdown(false);
                                            }}
                                        >
                                            <span className="font-medium text-slate-800">{a.nombre} {a.apellido}</span>
                                            <span className="text-xs text-slate-500 ml-2">ID: {a.id}</span>
                                        </li>
                                    )) : (
                                        <li className="px-4 py-2 text-slate-500 text-sm">No se encontraron abonados</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Barrio/Colonia <span className="text-red-500">*</span></label>
                            <select
                                name="barrioColonia"
                                value={formData.barrioColonia.id}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Seleccione barrio/colonia</option>
                                {barrios.length > 0 ? barrios.map(b => (
                                    <option key={b.id} value={b.id}>{b.descripcion || b.nombre}</option>
                                )) : <option value="1">Barrio por defecto (ID: 1)</option>}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Tipo de Conexión <span className="text-red-500">*</span></label>
                            <select
                                name="tipoConexion"
                                value={formData.tipoConexion.id}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.tipoConexion ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                            >
                                <option value="">Seleccione el tipo</option>
                                {tipos.map(t => (
                                    <option key={t.id} value={t.id}>{t.descripcion}</option>
                                ))}
                            </select>
                            {errors.tipoConexion && <p className="text-xs text-red-600 mt-0.5">{errors.tipoConexion}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Estado <span className="text-red-500">*</span></label>
                            <select
                                name="estadoConexion"
                                value={formData.estadoConexion.id}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.estadoConexion ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                            >
                                <option value="">Seleccione un estado</option>
                                {estados.map(e => (
                                    <option key={e.id} value={e.id}>{e.estado}</option>
                                ))}
                            </select>
                            {errors.estadoConexion && <p className="text-xs text-red-600 mt-0.5">{errors.estadoConexion}</p>}
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">Dirección Exacta <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                placeholder="Describa la ubicación de la conexión..."
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.direccion ? "border-red-400 bg-red-50" : "border-slate-300"}`}
                            />
                            {errors.direccion && <p className="text-xs text-red-600 mt-0.5">{errors.direccion}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">No. Formulario</label>
                            <input
                                type="text"
                                name="noForm"
                                value={formData.noForm}
                                onChange={handleChange}
                                placeholder="Opcional..."
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex justify-end space-x-3">
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
                                    <span>Guardar Conexión</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

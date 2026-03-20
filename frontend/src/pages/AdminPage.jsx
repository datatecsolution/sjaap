import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiSearch } from "react-icons/fi";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

// ---- Generic inline row form ----
function InlineForm({ fields, initial, onSave, onCancel }) {
    const [data, setData] = useState(initial || {});

    const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(data);
    };

    return (
        <tr className="bg-blue-50">
            {fields.map(f => (
                <td key={f.name} className="px-4 py-2">
                    <input
                        type={f.type || "text"}
                        name={f.name}
                        value={data[f.name] || ""}
                        onChange={handleChange}
                        placeholder={f.label}
                        required={f.required}
                        className="w-full px-3 py-1.5 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </td>
            ))}
            <td className="px-4 py-2 text-center">
                <div className="flex justify-center space-x-2">
                    <button onClick={handleSubmit} className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 p-1.5 rounded-lg transition-colors" title="Guardar">
                        <FiSave size={16} />
                    </button>
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors" title="Cancelar">
                        <FiX size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ---- Generic CRUD table ----
function CrudTable({ title, endpoint, fields, renderRow }) {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showNew, setShowNew] = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => { fetch(); }, []);

    const fetch = async () => {
        try {
            setLoading(true);
            const res = await api.get(endpoint);
            setItems(res.data);
        } catch (e) {
            console.error(`Error fetching ${endpoint}:`, e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        try {
            if (data.id) {
                await api.put(`${endpoint}/${data.id}`, data);
            } else {
                await api.post(endpoint, data);
            }
            setEditingId(null);
            setShowNew(false);
            fetch();
        } catch (e) {
            console.error("Error guardando:", e);
            toast({ message: "Error al guardar.", type: "error" });
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`${endpoint}/${confirmId}`);
            setItems(items.filter(i => i.id !== confirmId));
        } catch (e) {
            console.error("Error eliminando:", e);
            toast({ message: "Error al eliminar. Puede tener registros asociados.", type: "error" });
        } finally {
            setConfirmId(null);
        }
    };

    const filteredItems = items.filter(item => {
        if (!searchTerm) return true;
        const query = searchTerm.toLowerCase();
        return fields.some(f => {
            const val = item[f.name];
            return val && String(val).toLowerCase().includes(query);
        });
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center gap-3">
                <h2 className="font-semibold text-slate-800 flex-shrink-0">{title}</h2>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <FiSearch className="text-slate-400" size={14} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                        />
                    </div>
                    <button
                        onClick={() => { setShowNew(true); setEditingId(null); }}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm shadow-sm"
                    >
                        <FiPlus size={14} />
                        <span>Nuevo</span>
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                            {fields.map(f => (
                                <th key={f.name} className="px-4 py-3 font-medium border-b border-slate-200">{f.label}</th>
                            ))}
                            <th className="px-4 py-3 text-center font-medium border-b border-slate-200">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {showNew && (
                            <InlineForm
                                fields={fields}
                                initial={{}}
                                onSave={handleSave}
                                onCancel={() => setShowNew(false)}
                            />
                        )}
                        {loading ? (
                            <tr>
                                <td colSpan={fields.length + 1} className="px-4 py-6 text-center text-slate-400">
                                    Cargando...
                                </td>
                            </tr>
                        ) : filteredItems.length === 0 && !showNew ? (
                            <tr>
                                <td colSpan={fields.length + 1} className="px-4 py-6 text-center text-slate-400">
                                    {searchTerm ? "No se encontraron resultados." : "No hay registros."}
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map(item => (
                                editingId === item.id ? (
                                    <InlineForm
                                        key={item.id}
                                        fields={fields}
                                        initial={item}
                                        onSave={handleSave}
                                        onCancel={() => setEditingId(null)}
                                    />
                                ) : (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        {renderRow(item)}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => { setEditingId(item.id); setShowNew(false); }}
                                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmId(item.id)}
                                                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        <ConfirmModal
            open={confirmId !== null}
            title="Eliminar registro"
            message="¿Está seguro que desea eliminar este registro? Puede fallar si tiene datos asociados."
            onConfirm={handleDelete}
            onCancel={() => setConfirmId(null)}
        />
        </div>
    );
}

// ---- Precios de Servicios (custom tab with dropdowns) ----
function PreciosServiciosTab() {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [tiposConexion, setTiposConexion] = useState([]);
    const [showNew, setShowNew] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ idServicio: "", precio: "", idTipoConexion: "" });
    const [confirmId, setConfirmId] = useState(null);

    useEffect(() => {
        fetchAll();
        api.get("/servicios").then(r => setServicios(r.data));
        api.get("/tipos-conexiones").then(r => setTiposConexion(r.data));
    }, []);

    const fetchAll = () => api.get("/precios-servicios").then(r => setItems(r.data));

    const handleSave = async () => {
        const payload = {
            servicio: { id: parseInt(form.idServicio) },
            precio: parseFloat(form.precio),
            tipoConexion: { id: parseInt(form.idTipoConexion) }
        };
        try {
            if (editingId) {
                await api.put(`/precios-servicios/${editingId}`, payload);
            } else {
                await api.post("/precios-servicios", payload);
            }
            setShowNew(false);
            setEditingId(null);
            setForm({ idServicio: "", precio: "", idTipoConexion: "" });
            fetchAll();
        } catch (e) {
            toast({ message: "Error al guardar.", type: "error" });
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({
            idServicio: item.servicio?.id || "",
            precio: item.precio || "",
            idTipoConexion: item.tipoConexion?.id || ""
        });
        setShowNew(true);
    };

    const handleDelete = async () => {
        await api.delete(`/precios-servicios/${confirmId}`);
        setConfirmId(null);
        fetchAll();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h2 className="font-semibold text-slate-800">Precios de Servicios</h2>
                <button onClick={() => { setShowNew(true); setEditingId(null); setForm({ idServicio: "", precio: "", idTipoConexion: "" }); }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm shadow-sm">
                    <FiPlus size={14} /><span>Nuevo</span>
                </button>
            </div>

            {showNew && (
                <div className="p-4 border-b border-slate-200 bg-blue-50 flex flex-wrap gap-3 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Servicio</label>
                        <select value={form.idServicio} onChange={e => setForm({ ...form, idServicio: e.target.value })}
                            className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                            <option value="">Seleccionar...</option>
                            {servicios.map(s => <option key={s.id} value={s.id}>{s.descripcion}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Tipo de Conexión</label>
                        <select value={form.idTipoConexion} onChange={e => setForm({ ...form, idTipoConexion: e.target.value })}
                            className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                            <option value="">Seleccionar...</option>
                            {tiposConexion.map(t => <option key={t.id} value={t.id}>{t.descripcion}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Precio (L)</label>
                        <input type="number" step="0.01" value={form.precio}
                            onChange={e => setForm({ ...form, precio: e.target.value })}
                            className="px-3 py-1.5 border border-blue-300 rounded-lg text-sm w-28 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={handleSave} className="text-green-600 bg-green-50 hover:bg-green-100 p-2 rounded-lg"><FiSave size={16} /></button>
                        <button onClick={() => { setShowNew(false); setEditingId(null); }} className="text-slate-500 bg-slate-100 hover:bg-slate-200 p-2 rounded-lg"><FiX size={16} /></button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 border-b border-slate-200">Servicio</th>
                            <th className="px-4 py-3 border-b border-slate-200">Tipo de Conexión</th>
                            <th className="px-4 py-3 border-b border-slate-200 text-right">Precio</th>
                            <th className="px-4 py-3 border-b border-slate-200 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.length === 0 ? (
                            <tr><td colSpan="4" className="px-4 py-6 text-center text-slate-400">No hay precios configurados.</td></tr>
                        ) : items.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-slate-800">{item.servicio?.descripcion}</td>
                                <td className="px-4 py-3 text-slate-500">{item.tipoConexion?.descripcion}</td>
                                <td className="px-4 py-3 text-right font-medium">L {parseFloat(item.precio).toFixed(2)}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center space-x-2">
                                        <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg"><FiEdit2 size={14} /></button>
                                        <button onClick={() => setConfirmId(item.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg"><FiTrash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        <ConfirmModal
            open={confirmId !== null}
            title="Eliminar precio"
            message="¿Está seguro que desea eliminar este precio de servicio?"
            onConfirm={handleDelete}
            onCancel={() => setConfirmId(null)}
        />
        </div>
    );
}

// ---- Tab definitions ----
const TABS = [
    { key: "barrios", label: "Barrios / Colonias" },
    { key: "tiposConexion", label: "Tipos de Conexión" },
    { key: "tiposUsuario", label: "Tipos de Usuario" },
    { key: "estadosConexion", label: "Estados de Conexión" },
    { key: "servicios", label: "Servicios" },
    { key: "preciosServicios", label: "Precios de Servicios" },
];

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("barrios");

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Administración</h1>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.key
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === "barrios" && (
                <CrudTable
                    title="Barrios y Colonias"
                    endpoint="/barrios"
                    fields={[
                        { name: "descripcion", label: "Descripción", required: true },
                        { name: "sector", label: "Sector" },
                    ]}
                    renderRow={item => (
                        <>
                            <td className="px-4 py-3 text-slate-800">{item.descripcion}</td>
                            <td className="px-4 py-3 text-slate-500">{item.sector || "—"}</td>
                        </>
                    )}
                />
            )}

            {activeTab === "tiposConexion" && (
                <CrudTable
                    title="Tipos de Conexión"
                    endpoint="/tipos-conexiones"
                    fields={[
                        { name: "descripcion", label: "Descripción", required: true },
                        { name: "observaciones", label: "Observaciones" },
                    ]}
                    renderRow={item => (
                        <>
                            <td className="px-4 py-3 text-slate-800">{item.descripcion}</td>
                            <td className="px-4 py-3 text-slate-500">{item.observaciones || "—"}</td>
                        </>
                    )}
                />
            )}

            {activeTab === "tiposUsuario" && (
                <CrudTable
                    title="Tipos de Usuario (Roles)"
                    endpoint="/tipos-usuarios"
                    fields={[
                        { name: "descripcion", label: "Descripción", required: true },
                        { name: "nivelAcceso", label: "Nivel de Acceso", type: "number" },
                    ]}
                    renderRow={item => (
                        <>
                            <td className="px-4 py-3 text-slate-800">{item.descripcion}</td>
                            <td className="px-4 py-3 text-slate-500">{item.nivelAcceso ?? "—"}</td>
                        </>
                    )}
                />
            )}

            {activeTab === "estadosConexion" && (
                <CrudTable
                    title="Estados de Conexión"
                    endpoint="/estados-conexiones"
                    fields={[
                        { name: "estado", label: "Estado", required: true },
                    ]}
                    renderRow={item => (
                        <td className="px-4 py-3 text-slate-800">{item.estado}</td>
                    )}
                />
            )}

            {activeTab === "servicios" && (
                <CrudTable
                    title="Servicios"
                    endpoint="/servicios"
                    fields={[
                        { name: "descripcion", label: "Descripción", required: true },
                        { name: "tipoServicio", label: "Tipo Servicio", type: "number" },
                    ]}
                    renderRow={item => (
                        <>
                            <td className="px-4 py-3 text-slate-800">{item.descripcion}</td>
                            <td className="px-4 py-3 text-slate-500">{item.tipoServicio ?? "—"}</td>
                        </>
                    )}
                />
            )}

            {activeTab === "preciosServicios" && <PreciosServiciosTab />}
        </div>
    );
}

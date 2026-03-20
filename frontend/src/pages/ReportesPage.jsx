import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { FiAlertCircle, FiTrendingUp, FiClock, FiDownload } from "react-icons/fi";
import { exportToExcel } from "../utils/exportExcel";

// ── Top Deudores ─────────────────────────────────────────────────────────────

function TopDeudoresTab() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limite, setLimite] = useState(20);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reportes/top-deudores?limite=${limite}`);
            setData(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [limite]);

    const totalDeuda = data.reduce((s, r) => s + Number(r.saldo || 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Mostrar</label>
                    <select value={limite} onChange={e => setLimite(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                        <option value="10">Top 10</option>
                        <option value="20">Top 20</option>
                        <option value="50">Top 50</option>
                        <option value="100">Todos</option>
                    </select>
                </div>
                <button onClick={() => exportToExcel(data.map(r => ({
                    "Conexión": r.idConexion, Abonado: r.abonado, Dirección: r.direccion,
                    Tipo: r.tipo, "Saldo (L)": Number(r.saldo).toFixed(2),
                    "Último movimiento": r.observacion
                })), "top-deudores")}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg">
                    <FiDownload size={14} /><span>Exportar</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
                <div className="flex items-center space-x-2 mb-1">
                    <FiAlertCircle className="text-red-500" size={18} />
                    <span className="font-semibold text-slate-700">Total deuda mostrada</span>
                </div>
                <span className="text-2xl font-bold text-red-600">
                    L {totalDeuda.toLocaleString("es-HN", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm text-slate-400 ml-2">({data.length} conexiones)</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 border-b border-slate-200 text-center">#</th>
                            <th className="px-4 py-3 border-b border-slate-200">Conexión</th>
                            <th className="px-4 py-3 border-b border-slate-200">Abonado</th>
                            <th className="px-4 py-3 border-b border-slate-200 hidden md:table-cell">Dirección</th>
                            <th className="px-4 py-3 border-b border-slate-200 hidden lg:table-cell">Tipo</th>
                            <th className="px-4 py-3 border-b border-slate-200 text-right">Saldo</th>
                            <th className="px-4 py-3 border-b border-slate-200 hidden md:table-cell">Último mov.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">Cargando...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">No hay deudores.</td></tr>
                        ) : data.map((r, i) => (
                            <tr key={r.idConexion} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-center text-slate-400">{i + 1}</td>
                                <td className="px-4 py-3 font-medium text-slate-700">#{r.idConexion}</td>
                                <td className="px-4 py-3 text-slate-800">{r.abonado}</td>
                                <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-xs truncate">{r.direccion}</td>
                                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{r.tipo}</td>
                                <td className="px-4 py-3 text-right font-semibold text-red-600">
                                    L {Number(r.saldo).toLocaleString("es-HN", { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-xs">{r.observacion}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Ingresos por Servicio ────────────────────────────────────────────────────

function IngresosServicioTab() {
    const anioActual = new Date().getFullYear();
    const [desde, setDesde] = useState(`${anioActual}-01-01`);
    const [hasta, setHasta] = useState(`${anioActual}-12-31`);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const buscar = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reportes/ingresos-servicio?desde=${desde}&hasta=${hasta}`);
            setData(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { buscar(); }, []);

    const totalIngreso = data.reduce((s, r) => s + Number(r.totalIngreso || 0), 0);
    const totalCantidad = data.reduce((s, r) => s + Number(r.cantidad || 0), 0);

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Desde</label>
                        <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Hasta</label>
                        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={buscar}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                        Consultar
                    </button>
                    <button onClick={() => exportToExcel(data.map(r => ({
                        Servicio: r.servicio, Cantidad: r.cantidad,
                        "Total Ingreso (L)": Number(r.totalIngreso).toFixed(2)
                    })), `ingresos-servicio-${desde}-${hasta}`)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg">
                        <FiDownload size={14} /><span>Exportar</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 border-b border-slate-200">Servicio</th>
                            <th className="px-4 py-3 border-b border-slate-200 text-center">Cantidad</th>
                            <th className="px-4 py-3 border-b border-slate-200 text-right">Total Ingreso</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-400">Cargando...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-400">Sin datos.</td></tr>
                        ) : data.map(r => (
                            <tr key={r.servicio} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{r.servicio}</td>
                                <td className="px-4 py-3 text-center text-slate-600">{r.cantidad}</td>
                                <td className="px-4 py-3 text-right font-semibold text-green-700">
                                    L {Number(r.totalIngreso).toLocaleString("es-HN", { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot className="bg-slate-100 font-semibold text-sm">
                            <tr>
                                <td className="px-4 py-3 text-slate-700">Total</td>
                                <td className="px-4 py-3 text-center text-slate-700">{totalCantidad}</td>
                                <td className="px-4 py-3 text-right text-green-700">
                                    L {totalIngreso.toLocaleString("es-HN", { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

// ── Antigüedad de Deuda ──────────────────────────────────────────────────────

function AntiguedadDeudaTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/reportes/antiguedad-deuda")
            .then(r => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center py-10 text-slate-400">Cargando...</div>;
    if (!data) return <div className="text-center py-10 text-slate-400">Error al cargar datos.</div>;

    const colores = [
        { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
        { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
        { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
        { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
    ];

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
                <div>
                    <div className="text-sm text-slate-500">Total deuda del sistema</div>
                    <div className="text-2xl font-bold text-red-600">
                        L {Number(data.totalDeuda).toLocaleString("es-HN", { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-500">Conexiones deudoras</div>
                    <div className="text-2xl font-bold text-slate-800">{data.totalConexiones}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(data.rangos || []).map((r, i) => (
                    <div key={r.rango} className={`rounded-xl shadow-sm border ${colores[i].border} ${colores[i].bg} p-5`}>
                        <div className="flex items-center space-x-2 mb-2">
                            <FiClock className={colores[i].text} size={16} />
                            <span className={`text-sm font-medium ${colores[i].text}`}>{r.rango}</span>
                        </div>
                        <div className={`text-2xl font-bold ${colores[i].text}`}>
                            L {Number(r.monto).toLocaleString("es-HN", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{r.conexiones} conexiones</div>
                    </div>
                ))}
            </div>

            <button onClick={() => exportToExcel((data.rangos || []).map(r => ({
                Rango: r.rango, Conexiones: r.conexiones,
                "Monto (L)": Number(r.monto).toFixed(2)
            })), "antiguedad-deuda")}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg">
                <FiDownload size={14} /><span>Exportar a Excel</span>
            </button>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
    const [tab, setTab] = useState("deudores");

    const TABS = [
        { key: "deudores", label: "Top Deudores", icon: <FiAlertCircle size={14} /> },
        { key: "ingresos", label: "Ingresos por Servicio", icon: <FiTrendingUp size={14} /> },
        { key: "antiguedad", label: "Antigüedad de Deuda", icon: <FiClock size={14} /> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
                <div className="flex space-x-1 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                    {TABS.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                            }`}>
                            {t.icon}
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {tab === "deudores" && <TopDeudoresTab />}
            {tab === "ingresos" && <IngresosServicioTab />}
            {tab === "antiguedad" && <AntiguedadDeudaTab />}
        </div>
    );
}

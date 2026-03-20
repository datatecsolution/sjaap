import { useState, useEffect, useMemo } from "react";
import api from "../api/axiosConfig";
import {
    FiSearch, FiTrendingUp, FiTrendingDown, FiAlertCircle,
    FiCheckCircle, FiList, FiUser, FiDollarSign, FiX, FiDownload
} from "react-icons/fi";
import { exportToExcel } from "../utils/exportExcel";
import Pagination from "../components/Pagination";

// ─── Tab: Resumen General ───────────────────────────────────────────────────

function ResumenTab() {
    const [resumen, setResumen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("todos"); // todos | deudores | credito | aldia
    const [busqueda, setBusqueda] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    useEffect(() => {
        api.get("/cuenta/resumen")
            .then(r => setResumen(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const datos = useMemo(() => {
        let lista = resumen;

        if (busqueda.trim()) {
            const q = busqueda.toLowerCase();
            lista = lista.filter(m =>
                m.conexion?.abonado?.nombre?.toLowerCase().includes(q) ||
                m.conexion?.abonado?.apellido?.toLowerCase().includes(q) ||
                String(m.conexion?.id).includes(q) ||
                m.conexion?.direccion?.toLowerCase().includes(q)
            );
        }

        if (filtro === "deudores") lista = lista.filter(m => parseFloat(m.saldo) > 0);
        if (filtro === "credito")  lista = lista.filter(m => parseFloat(m.saldo) < 0);
        if (filtro === "aldia")    lista = lista.filter(m => parseFloat(m.saldo) === 0);

        return lista.sort((a, b) => parseFloat(b.saldo) - parseFloat(a.saldo));
    }, [resumen, filtro, busqueda]);
    const pagedDatos = datos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const totalDeudores  = resumen.filter(m => parseFloat(m.saldo) > 0).length;
    const totalCredito   = resumen.filter(m => parseFloat(m.saldo) < 0).length;
    const totalAlDia     = resumen.filter(m => parseFloat(m.saldo) === 0).length;
    const montoTotal     = resumen.reduce((s, m) => s + parseFloat(m.saldo || 0), 0);

    const FILTROS = [
        { key: "todos",    label: "Todos",       count: resumen.length },
        { key: "deudores", label: "Deudores",     count: totalDeudores },
        { key: "credito",  label: "Con crédito",  count: totalCredito },
        { key: "aldia",    label: "Al día",       count: totalAlDia },
    ];

    return (
        <div className="space-y-5">
            {/* Tarjetas resumen */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="text-xs text-slate-500 mb-1">Total conexiones</div>
                    <div className="text-2xl font-bold text-slate-800">{resumen.length}</div>
                    <div className="text-xs text-slate-400 mt-1">con movimientos</div>
                </div>
                <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4">
                    <div className="flex justify-between">
                        <div className="text-xs text-red-500 mb-1">Deudores</div>
                        <FiAlertCircle className="text-red-400" size={16} />
                    </div>
                    <div className="text-2xl font-bold text-red-600">{totalDeudores}</div>
                    <div className="text-xs text-slate-400 mt-1">conexiones con saldo positivo</div>
                </div>
                <div className="bg-white rounded-xl border border-green-200 shadow-sm p-4">
                    <div className="flex justify-between">
                        <div className="text-xs text-green-600 mb-1">Con crédito</div>
                        <FiCheckCircle className="text-green-400" size={16} />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{totalCredito}</div>
                    <div className="text-xs text-slate-400 mt-1">conexiones con saldo negativo</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex justify-between">
                        <div className="text-xs text-slate-500 mb-1">Saldo total sistema</div>
                        <FiTrendingUp className={montoTotal >= 0 ? "text-red-400" : "text-green-400"} size={16} />
                    </div>
                    <div className={`text-2xl font-bold ${montoTotal >= 0 ? "text-red-600" : "text-green-600"}`}>
                        L {Math.abs(montoTotal).toFixed(0)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{montoTotal >= 0 ? "por cobrar" : "a favor abonados"}</div>
                </div>
            </div>

            {/* Filtros + búsqueda */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex space-x-1 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                    {FILTROS.map(f => (
                        <button key={f.key} onClick={() => { setFiltro(f.key); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                filtro === f.key
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}>
                            {f.label}
                            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                                filtro === f.key ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                            }`}>
                                {f.count}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-sm">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ID o dirección..."
                        value={busqueda}
                        onChange={e => { setBusqueda(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button onClick={() => exportToExcel(datos.map(m => ({
                    "Conexión": m.conexion?.id,
                    Abonado: `${m.conexion?.abonado?.nombre || ""} ${m.conexion?.abonado?.apellido || ""}`,
                    Dirección: m.conexion?.direccion || "",
                    Tipo: m.conexion?.tipoConexion?.descripcion || "",
                    "Saldo (L)": parseFloat(m.saldo || 0).toFixed(2),
                    "Último movimiento": m.observacion || ""
                })), "estado-cuenta")}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg flex-shrink-0">
                    <FiDownload size={14} /><span>Exportar</span>
                </button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 border-b border-slate-200">Conexión</th>
                                <th className="px-4 py-3 border-b border-slate-200">Abonado</th>
                                <th className="px-4 py-3 border-b border-slate-200 hidden md:table-cell">Dirección</th>
                                <th className="px-4 py-3 border-b border-slate-200 hidden lg:table-cell">Tipo</th>
                                <th className="px-4 py-3 border-b border-slate-200">Último movimiento</th>
                                <th className="px-4 py-3 border-b border-slate-200 text-right">Saldo</th>
                                <th className="px-4 py-3 border-b border-slate-200 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-400">Cargando cuentas...</td></tr>
                            ) : datos.length === 0 ? (
                                <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-400">No se encontraron registros.</td></tr>
                            ) : (
                                pagedDatos.map(m => {
                                    const saldo = parseFloat(m.saldo || 0);
                                    const isDeudor  = saldo > 0;
                                    const isCredito = saldo < 0;
                                    return (
                                        <tr key={m.noMov} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-700">
                                                #{m.conexion?.id}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800">
                                                    {m.conexion?.abonado?.nombre} {m.conexion?.abonado?.apellido}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-xs truncate">
                                                {m.conexion?.direccion || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                                                {m.conexion?.tipoConexion?.descripcion || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                <div>{m.observacion}</div>
                                                <div className="text-xs text-slate-400">
                                                    {new Date(m.fecha).toLocaleDateString("es-HN")}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold">
                                                <span className={isDeudor ? "text-red-600" : isCredito ? "text-green-600" : "text-slate-500"}>
                                                    L {saldo.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {isDeudor ? (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Debe</span>
                                                ) : isCredito ? (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Crédito</span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">Al día</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    total={datos.length}
                    page={page}
                    pageSize={PAGE_SIZE}
                    onPage={setPage}
                />
            </div>
        </div>
    );
}

// ─── Tab: Detalle por conexión ──────────────────────────────────────────────

function DetalleTab() {
    const [searchTerm, setSearchTerm]           = useState("");
    const [abonados, setAbonados]               = useState([]);
    const [conexiones, setConexiones]           = useState([]);
    const [selectedConexion, setSelectedConexion] = useState(null);
    const [movimientos, setMovimientos]         = useState([]);
    const [saldo, setSaldo]                     = useState(null);
    const [loading, setLoading]                 = useState(false);
    const [showPago, setShowPago]               = useState(false);
    const [pago, setPago]                       = useState({ monto: "", observacion: "" });
    const [savingPago, setSavingPago]           = useState(false);

    useEffect(() => {
        api.get("/abonados").then(r => setAbonados(r.data));
    }, []);

    const buscarConexiones = async () => {
        if (!searchTerm.trim()) return;
        const lower = searchTerm.toLowerCase();
        const found = abonados.filter(a =>
            a.nombre.toLowerCase().includes(lower) ||
            a.apellido.toLowerCase().includes(lower) ||
            String(a.id).includes(lower)
        );
        const ids = found.map(a => a.id);
        const res = await api.get("/conexiones");
        setConexiones(res.data.filter(c => c.abonado && ids.includes(c.abonado.id)));
        setSelectedConexion(null);
        setMovimientos([]);
        setSaldo(null);
    };

    const seleccionarConexion = async (conexion) => {
        setSelectedConexion(conexion);
        setLoading(true);
        try {
            const [movs, sal] = await Promise.all([
                api.get(`/cuenta/${conexion.id}`),
                api.get(`/cuenta/${conexion.id}/saldo`),
            ]);
            setMovimientos(movs.data);
            setSaldo(sal.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const totalDebitos  = movimientos.reduce((s, m) => s + (parseFloat(m.debito)  || 0), 0);
    const totalCreditos = movimientos.reduce((s, m) => s + (parseFloat(m.credito) || 0), 0);

    const registrarPago = async (e) => {
        e.preventDefault();
        if (!pago.monto || parseFloat(pago.monto) <= 0) return;
        setSavingPago(true);
        try {
            await api.post("/cuenta/abonar", {
                idConexion: selectedConexion.id,
                monto: parseFloat(pago.monto),
                observacion: pago.observacion || "Pago recibido",
            });
            setPago({ monto: "", observacion: "" });
            setShowPago(false);
            await seleccionarConexion(selectedConexion);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingPago(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Buscador */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Buscar abonado por nombre o ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && buscarConexiones()}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={buscarConexiones}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <FiSearch />
                    </button>
                </div>

                {conexiones.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {conexiones.map(c => (
                            <button key={c.id} onClick={() => seleccionarConexion(c)}
                                className={`text-left p-3 rounded-lg border transition-colors text-sm ${selectedConexion?.id === c.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}>
                                <div className="font-medium text-slate-800">
                                    {c.abonado?.nombre} {c.abonado?.apellido}
                                </div>
                                <div className="text-slate-500 text-xs">
                                    Conexión #{c.id} — {c.direccion}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {selectedConexion && (
                <>
                    {/* Resumen tarjetas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                            <div className="text-sm text-slate-500 mb-1">Abonado</div>
                            <div className="font-semibold text-slate-800">
                                {selectedConexion.abonado?.nombre} {selectedConexion.abonado?.apellido}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">{selectedConexion.direccion}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-sm text-slate-500 mb-1">Total Cargos</div>
                                    <div className="text-2xl font-bold text-red-600">L {totalDebitos.toFixed(2)}</div>
                                </div>
                                <FiTrendingUp className="text-red-400" size={20} />
                            </div>
                        </div>
                        <div className={`bg-white p-5 rounded-xl shadow-sm border-2 ${parseFloat(saldo) > 0 ? "border-red-300" : "border-green-300"}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-sm text-slate-500 mb-1">Saldo Actual</div>
                                    <div className={`text-2xl font-bold ${parseFloat(saldo) > 0 ? "text-red-600" : "text-green-600"}`}>
                                        L {parseFloat(saldo || 0).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {parseFloat(saldo) > 0 ? "Debe al sistema" : parseFloat(saldo) < 0 ? "Crédito a favor" : "Sin saldo pendiente"}
                                    </div>
                                </div>
                                <FiTrendingDown className={parseFloat(saldo) > 0 ? "text-red-400" : "text-green-400"} size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Registrar pago */}
                    {showPago && (
                        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-5">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-slate-700">Registrar Pago</h3>
                                <button onClick={() => setShowPago(false)} className="text-slate-400 hover:text-slate-600"><FiX /></button>
                            </div>
                            <form onSubmit={registrarPago} className="flex flex-wrap gap-3 items-end">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Monto (L)</label>
                                    <input type="number" min="0.01" step="0.01" required value={pago.monto}
                                        onChange={e => setPago({ ...pago, monto: e.target.value })}
                                        className="w-36 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                                </div>
                                <div className="flex-1 min-w-48 space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Observación</label>
                                    <input type="text" value={pago.observacion} placeholder="Pago recibido"
                                        onChange={e => setPago({ ...pago, observacion: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500" />
                                </div>
                                <button type="submit" disabled={savingPago}
                                    className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                                    {savingPago ? "Guardando..." : "Confirmar Pago"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Tabla movimientos */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-semibold text-slate-700">
                                Movimientos — Conexión #{selectedConexion.id}
                                <span className="ml-2 text-slate-400 font-normal text-sm">({movimientos.length} registros)</span>
                            </h2>
                            {!showPago && (
                                <button onClick={() => setShowPago(true)}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                                    <FiDollarSign size={14} />
                                    <span>Registrar Pago</span>
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-slate-200"># Mov</th>
                                        <th className="px-4 py-3 border-b border-slate-200">Fecha</th>
                                        <th className="px-4 py-3 border-b border-slate-200">Observación</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-right">Cargo</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-right">Abono</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-right">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400">Cargando...</td></tr>
                                    ) : movimientos.length === 0 ? (
                                        <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400">Sin movimientos registrados.</td></tr>
                                    ) : (
                                        movimientos.map(m => (
                                            <tr key={m.noMov} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-400">#{m.noMov}</td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {new Date(m.fecha).toLocaleDateString("es-HN")}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {m.observacion}
                                                    {m.noFactura && <span className="ml-1 text-xs text-blue-500">(Fact. #{m.noFactura})</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {m.debito
                                                        ? <span className="text-red-600 font-medium">L {parseFloat(m.debito).toFixed(2)}</span>
                                                        : <span className="text-slate-300">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {m.credito
                                                        ? <span className="text-green-600 font-medium">L {parseFloat(m.credito).toFixed(2)}</span>
                                                        : <span className="text-slate-300">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    <span className={parseFloat(m.saldo) > 0 ? "text-red-600" : parseFloat(m.saldo) < 0 ? "text-green-600" : "text-slate-600"}>
                                                        L {parseFloat(m.saldo).toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {movimientos.length > 0 && (
                                    <tfoot className="bg-slate-50 text-sm font-semibold">
                                        <tr>
                                            <td colSpan="3" className="px-4 py-3 text-slate-600">Totales</td>
                                            <td className="px-4 py-3 text-right text-red-600">L {totalDebitos.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right text-green-600">L {totalCreditos.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right">L {parseFloat(saldo || 0).toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function EstadoCuentaPage() {
    const [tab, setTab] = useState("resumen");

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Estado de Cuenta</h1>
                <div className="flex space-x-2">
                    <button onClick={() => setTab("resumen")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "resumen" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
                        <FiList size={15} />
                        <span>Resumen General</span>
                    </button>
                    <button onClick={() => setTab("detalle")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "detalle" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
                        <FiUser size={15} />
                        <span>Detalle por Abonado</span>
                    </button>
                </div>
            </div>

            {tab === "resumen" ? <ResumenTab /> : <DetalleTab />}
        </div>
    );
}

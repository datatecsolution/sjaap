import { useState, useEffect, useMemo } from "react";
import api from "../api/axiosConfig";
import { FiSearch, FiTrash2, FiCheckCircle, FiFileText, FiChevronDown, FiChevronRight, FiDownload, FiPrinter } from "react-icons/fi";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import ReciboModal from "../components/ReciboModal";
import { exportToExcel } from "../utils/exportExcel";

function ReportePeriodo() {
    const anioActual = new Date().getFullYear();
    const [desde, setDesde] = useState(`${anioActual}-01-01`);
    const [hasta, setHasta] = useState(`${anioActual}-12-31`);
    const [data, setData]   = useState([]);
    const [loading, setLoading] = useState(false);

    const buscar = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/facturas/resumen-periodo?desde=${desde}&hasta=${hasta}`);
            setData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { buscar(); }, []);

    const totales = data.reduce((acc, r) => ({
        totalFacturas:  acc.totalFacturas  + Number(r.totalFacturas),
        pagadas:        acc.pagadas        + Number(r.pagadas),
        pendientes:     acc.pendientes     + Number(r.pendientes),
        totalCobrado:   acc.totalCobrado   + Number(r.totalCobrado),
        totalPendiente: acc.totalPendiente + Number(r.totalPendiente),
    }), { totalFacturas: 0, pagadas: 0, pendientes: 0, totalCobrado: 0, totalPendiente: 0 });

    return (
        <div className="space-y-4">
            {/* Filtros */}
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
                        Período: r.periodo, "Total Facturas": r.totalFacturas,
                        Pagadas: r.pagadas, Pendientes: r.pendientes,
                        "Total Cobrado (L)": Number(r.totalCobrado).toFixed(2),
                        "Pendiente por Cobrar (L)": Number(r.totalPendiente).toFixed(2),
                    })), `reporte-facturacion-${desde}-${hasta}`)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg">
                        <FiDownload size={14} /><span>Exportar</span>
                    </button>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 border-b border-slate-200">Período</th>
                            <th className="px-4 py-3 border-b border-slate-200 text-center">Facturas</th>
                            <th className="px-4 py-3 border-b border-slate-200 text-center">Pagadas</th>
                            <th className="px-4 py-3 border-b border-slate-200 text-center">Pendientes</th>
                            <th className="px-4 py-3 border-b border-slate-200 text-right">Total Cobrado</th>
                            <th className="px-4 py-3 border-b border-slate-200 text-right">Por Cobrar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400">Cargando...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-400">Sin datos para el período seleccionado.</td></tr>
                        ) : data.map(r => (
                            <tr key={r.periodo} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-700">{r.periodo}</td>
                                <td className="px-4 py-3 text-center text-slate-600">{r.totalFacturas}</td>
                                <td className="px-4 py-3 text-center text-green-600 font-medium">{r.pagadas}</td>
                                <td className="px-4 py-3 text-center text-yellow-600 font-medium">{r.pendientes}</td>
                                <td className="px-4 py-3 text-right text-green-700 font-semibold">L {Number(r.totalCobrado).toLocaleString("es-HN", { minimumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-right text-red-600 font-semibold">L {Number(r.totalPendiente).toLocaleString("es-HN", { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot className="bg-slate-100 font-semibold text-sm">
                            <tr>
                                <td className="px-4 py-3 text-slate-700">Total</td>
                                <td className="px-4 py-3 text-center text-slate-700">{totales.totalFacturas}</td>
                                <td className="px-4 py-3 text-center text-green-700">{totales.pagadas}</td>
                                <td className="px-4 py-3 text-center text-yellow-700">{totales.pendientes}</td>
                                <td className="px-4 py-3 text-right text-green-700">L {totales.totalCobrado.toLocaleString("es-HN", { minimumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-right text-red-700">L {totales.totalPendiente.toLocaleString("es-HN", { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

export default function FacturacionPage() {
    const toast = useToast();

    // ── Estado nueva factura ──────────────────────────────────────────────────
    const [searchTerm, setSearchTerm]             = useState("");
    const [abonados, setAbonados]                 = useState([]);
    const [conexiones, setConexiones]             = useState([]);
    const [servicios, setServicios]               = useState([]);
    const [precios, setPrecios]                   = useState([]);
    const [selectedConexion, setSelectedConexion] = useState(null);
    const [detalles, setDetalles]                 = useState([]);
    const [efectivo, setEfectivo]                 = useState("");
    const [loading, setLoading]                   = useState(false);
    const [validando, setValidando]               = useState(false);

    // ── Estado historial ──────────────────────────────────────────────────────
    const [facturas, setFacturas]                 = useState([]);
    const [loadingFacturas, setLoadingFacturas]   = useState(true);
    const [tab, setTab]                           = useState("nueva");
    const [expandedId, setExpandedId]             = useState(null);

    // Confirmaciones
    const [confirmPagar, setConfirmPagar]         = useState(null);
    const [confirmEliminar, setConfirmEliminar]   = useState(null);

    // Recibo
    const [reciboFactura, setReciboFactura]       = useState(null);

    // Filtros historial
    const [filtroEstado, setFiltroEstado]         = useState("todos");
    const [filtroDesde, setFiltroDesde]           = useState("");
    const [filtroHasta, setFiltroHasta]           = useState("");
    const [filtroSearch, setFiltroSearch]         = useState("");

    const anioActual = new Date().getFullYear();
    const anios = Array.from({ length: 6 }, (_, i) => anioActual - i);

    useEffect(() => {
        Promise.all([api.get("/abonados"), api.get("/servicios")])
            .then(([a, s]) => { setAbonados(a.data); setServicios(s.data); });
        fetchFacturas();
    }, []);

    const fetchFacturas = async () => {
        try {
            setLoadingFacturas(true);
            const res = await api.get("/facturas");
            setFacturas(res.data.sort((a, b) => b.noFactura - a.noFactura));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingFacturas(false);
        }
    };

    // ── Filtrado del historial ────────────────────────────────────────────────
    const facturasFiltradas = useMemo(() => {
        return facturas.filter(f => {
            if (filtroEstado === "pendiente" && f.estado !== 0) return false;
            if (filtroEstado === "pagado"    && f.estado !== 1) return false;

            if (filtroDesde) {
                const desde = new Date(filtroDesde);
                if (new Date(f.fecha) < desde) return false;
            }
            if (filtroHasta) {
                const hasta = new Date(filtroHasta);
                hasta.setHours(23, 59, 59);
                if (new Date(f.fecha) > hasta) return false;
            }

            if (filtroSearch.trim()) {
                const q = filtroSearch.toLowerCase();
                const nombre = `${f.conexion?.abonado?.nombre ?? ""} ${f.conexion?.abonado?.apellido ?? ""}`.toLowerCase();
                if (!nombre.includes(q) && !String(f.noFactura).includes(q)) return false;
            }

            return true;
        });
    }, [facturas, filtroEstado, filtroDesde, filtroHasta, filtroSearch]);

    // ── Nueva factura: lógica ─────────────────────────────────────────────────
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
    };

    const seleccionarConexion = async (conexion) => {
        setSelectedConexion(conexion);
        setDetalles([]);
        setEfectivo("");
        if (conexion.tipoConexion) {
            const res = await api.get(`/precios-servicios/tipo/${conexion.tipoConexion.id}`);
            setPrecios(res.data);
        }
    };

    const agregarServicio = async (idServicio) => {
        const servicio = servicios.find(s => s.id === parseInt(idServicio));
        if (!servicio || !selectedConexion) return;
        const anio = String(anioActual);

        if (detalles.find(d => d.idServicio === servicio.id && d.anio === anio)) {
            toast({ message: `El servicio "${servicio.descripcion}" ya está en la factura para el año ${anio}.`, type: "warning" });
            return;
        }

        setValidando(true);
        try {
            const res = await api.get("/facturas/verificar", {
                params: { idConexion: selectedConexion.id, idServicio: servicio.id, anio }
            });
            if (res.data.pagado) {
                toast({ message: `El servicio "${servicio.descripcion}" del año ${anio} ya fue pagado para esta conexión.`, type: "warning" });
                return;
            }
        } catch (e) {
            console.error(e);
        } finally {
            setValidando(false);
        }

        const precioConfig = precios.find(p => p.servicio?.id === servicio.id);
        setDetalles(prev => [...prev, {
            idServicio: servicio.id,
            nombre: servicio.descripcion,
            precio: precioConfig ? String(precioConfig.precio) : "",
            anio,
        }]);
    };

    const actualizarDetalle = async (idx, field, value) => {
        setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));

        if (field === "anio" && selectedConexion) {
            const detalle = detalles[idx];
            if (detalles.find((d, i) => i !== idx && d.idServicio === detalle.idServicio && d.anio === value)) {
                toast({ message: `El servicio "${detalle.nombre}" ya está en la factura para el año ${value}.`, type: "warning" });
                setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, anio: detalles[idx].anio } : d));
                return;
            }
            setValidando(true);
            try {
                const res = await api.get("/facturas/verificar", {
                    params: { idConexion: selectedConexion.id, idServicio: detalle.idServicio, anio: value }
                });
                if (res.data.pagado) {
                    toast({ message: `El servicio "${detalle.nombre}" del año ${value} ya fue pagado para esta conexión.`, type: "warning" });
                    setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, anio: detalles[idx].anio } : d));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setValidando(false);
            }
        }
    };

    const eliminarDetalle = (idx) => setDetalles(detalles.filter((_, i) => i !== idx));

    const total  = detalles.reduce((s, d) => s + (parseFloat(d.precio) || 0), 0);
    const cambio = (parseFloat(efectivo) || 0) - total;

    const crearFactura = async () => {
        if (!selectedConexion || detalles.length === 0) return;
        if (detalles.some(d => !d.precio || isNaN(parseFloat(d.precio)))) {
            toast({ message: "Todos los servicios deben tener un precio válido.", type: "warning" });
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("/facturas", {
                idConexion: selectedConexion.id,
                efectivo:   parseFloat(efectivo) || total,
                detalles:   detalles.map(d => ({
                    idServicio:  d.idServicio,
                    precio:      parseFloat(d.precio),
                    observacion: d.anio || null,
                })),
            });
            toast({ message: "Factura creada exitosamente.", type: "success" });
            setReciboFactura(res.data);
            setSelectedConexion(null);
            setDetalles([]);
            setEfectivo("");
            setConexiones([]);
            setSearchTerm("");
            fetchFacturas();
            setTab("historial");
        } catch {
            toast({ message: "Error al crear la factura.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const pagarFactura = async () => {
        try {
            await api.put(`/facturas/${confirmPagar}/pagar`);
            fetchFacturas();
        } catch {
            toast({ message: "Error al procesar el pago.", type: "error" });
        } finally {
            setConfirmPagar(null);
        }
    };

    const eliminarFactura = async () => {
        try {
            await api.delete(`/facturas/${confirmEliminar}`);
            fetchFacturas();
        } catch {
            toast({ message: "No se puede eliminar una factura pagada.", type: "error" });
        } finally {
            setConfirmEliminar(null);
        }
    };

    const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Facturación</h1>
                <div className="flex space-x-2">
                    {[["nueva","Nueva Factura"],["historial","Historial"],["reporte","Reporte"]].map(([t, label]) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TAB: NUEVA FACTURA ──────────────────────────────────────── */}
            {tab === "nueva" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
                            <h2 className="font-semibold text-slate-700">1. Buscar Abonado / Conexión</h2>
                            <div className="flex space-x-2">
                                <input type="text" placeholder="Nombre, apellido o ID..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && buscarConexiones()}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                <button onClick={buscarConexiones}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <FiSearch />
                                </button>
                            </div>
                            {conexiones.length > 0 && (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {conexiones.map(c => (
                                        <button key={c.id} onClick={() => seleccionarConexion(c)}
                                            className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${selectedConexion?.id === c.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}>
                                            <div className="font-medium text-slate-800">{c.abonado?.nombre} {c.abonado?.apellido}</div>
                                            <div className="text-slate-500 text-xs">Conexión #{c.id} — {c.direccion} — {c.tipoConexion?.descripcion}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedConexion && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
                                <h2 className="font-semibold text-slate-700">2. Agregar Servicios</h2>
                                <select onChange={e => { agregarServicio(e.target.value); e.target.value = ""; }}
                                    disabled={validando}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait">
                                    <option value="">{validando ? "Verificando..." : "Seleccionar servicio..."}</option>
                                    {servicios.map(s => <option key={s.id} value={s.id}>{s.descripcion}</option>)}
                                </select>
                                {detalles.length > 0 && (
                                    <div className="space-y-2">
                                        {detalles.map((d, i) => (
                                            <div key={i} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-slate-800 truncate">{d.nombre}</div>
                                                    <div className="flex items-center space-x-1 mt-1">
                                                        <span className="text-xs text-slate-400">Año:</span>
                                                        <select value={d.anio} onChange={e => actualizarDetalle(i, "anio", e.target.value)}
                                                            className="text-xs px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-blue-400">
                                                            {anios.map(a => <option key={a} value={a}>{a}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="w-24">
                                                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                                                        <span className="px-2 text-slate-500 text-sm bg-slate-100">L</span>
                                                        <input type="number" step="0.01" value={d.precio}
                                                            onChange={e => actualizarDetalle(i, "precio", e.target.value)}
                                                            className="w-full px-2 py-1 text-sm focus:outline-none" />
                                                    </div>
                                                </div>
                                                <button onClick={() => eliminarDetalle(i)} className="text-red-400 hover:text-red-600 p-1">
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {selectedConexion && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
                            <h2 className="font-semibold text-slate-700">3. Resumen de Factura</h2>
                            <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                                {[
                                    ["Abonado",   `${selectedConexion.abonado?.nombre} ${selectedConexion.abonado?.apellido}`],
                                    ["Conexión",  `#${selectedConexion.id}`],
                                    ["Dirección", selectedConexion.direccion],
                                    ["Tipo",      selectedConexion.tipoConexion?.descripcion],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                        <span className="text-slate-500">{k}</span>
                                        <span className="font-medium text-right max-w-xs truncate">{v}</span>
                                    </div>
                                ))}
                            </div>
                            {detalles.length > 0 && (
                                <div className="border border-slate-200 rounded-lg overflow-hidden text-sm">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Servicio</th>
                                                <th className="px-3 py-2 text-right">Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {detalles.map((d, i) => (
                                                <tr key={i}>
                                                    <td className="px-3 py-2 text-slate-800">
                                                        {d.nombre}
                                                        {d.anio && <div className="text-xs text-slate-400">Año: {d.anio}</div>}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-medium">L {parseFloat(d.precio || 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50 font-semibold">
                                            <tr>
                                                <td className="px-3 py-2">Total</td>
                                                <td className="px-3 py-2 text-right">L {total.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Efectivo recibido</label>
                                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                                    <span className="px-3 py-2 text-slate-500 bg-slate-100 font-medium">L</span>
                                    <input type="number" step="0.01" placeholder="0.00" value={efectivo}
                                        onChange={e => setEfectivo(e.target.value)}
                                        className="flex-1 px-3 py-2 focus:outline-none" />
                                </div>
                                {efectivo && (
                                    <div className={`text-sm font-medium ${cambio >= 0 ? "text-green-600" : "text-red-500"}`}>
                                        Cambio: L {cambio.toFixed(2)}
                                    </div>
                                )}
                            </div>
                            <button onClick={crearFactura} disabled={loading || detalles.length === 0}
                                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors">
                                <FiFileText />
                                <span>{loading ? "Creando..." : "Crear Factura"}</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: HISTORIAL ─────────────────────────────────────────── */}
            {tab === "historial" && (
                <div className="space-y-4">
                    {/* Filtros */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Estado</label>
                                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="todos">Todos</option>
                                    <option value="pendiente">Pendientes</option>
                                    <option value="pagado">Pagados</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Desde</label>
                                <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Hasta</label>
                                <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="flex-1 min-w-48 space-y-1">
                                <label className="text-xs font-medium text-slate-500">Abonado o # Factura</label>
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input type="text" placeholder="Buscar..." value={filtroSearch}
                                        onChange={e => setFiltroSearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            {(filtroEstado !== "todos" || filtroDesde || filtroHasta || filtroSearch) && (
                                <button onClick={() => { setFiltroEstado("todos"); setFiltroDesde(""); setFiltroHasta(""); setFiltroSearch(""); }}
                                    className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">
                                    Limpiar
                                </button>
                            )}
                            <button
                                onClick={() => exportToExcel(facturasFiltradas.map(f => ({
                                    "# Factura": f.noFactura,
                                    Fecha: f.fecha,
                                    Abonado: `${f.conexion?.abonado?.nombre || ""} ${f.conexion?.abonado?.apellido || ""}`,
                                    Estado: f.estado === 1 ? "Pagado" : "Pendiente",
                                    "Total a Pagar": f.totalPagar,
                                    Efectivo: f.efectivo,
                                    Cambio: f.cambio,
                                })), "facturas")}
                                className="flex items-center space-x-1 px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg"
                            >
                                <FiDownload size={14} />
                                <span>Exportar</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-slate-200 w-8"></th>
                                        <th className="px-4 py-3 border-b border-slate-200"># Factura</th>
                                        <th className="px-4 py-3 border-b border-slate-200">Fecha</th>
                                        <th className="px-4 py-3 border-b border-slate-200">Abonado</th>
                                        <th className="px-4 py-3 border-b border-slate-200">Conexión</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-right">Total</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-center">Estado</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loadingFacturas ? (
                                        <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-400">Cargando...</td></tr>
                                    ) : facturasFiltradas.length === 0 ? (
                                        <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-400">No hay facturas con estos filtros.</td></tr>
                                    ) : (
                                        facturasFiltradas.map(f => (
                                            <>
                                                <tr key={f.noFactura} className="hover:bg-slate-50">
                                                    {/* Toggle detalle */}
                                                    <td className="px-2 py-3 text-center">
                                                        <button onClick={() => toggleExpand(f.noFactura)}
                                                            className="text-slate-400 hover:text-slate-600 p-1 rounded">
                                                            {expandedId === f.noFactura
                                                                ? <FiChevronDown size={14} />
                                                                : <FiChevronRight size={14} />}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">#{f.noFactura}</td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {new Date(f.fecha).toLocaleDateString("es-HN")}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-800">
                                                        {f.conexion?.abonado?.nombre} {f.conexion?.abonado?.apellido}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">#{f.conexion?.id}</td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        L {parseFloat(f.totalPagar).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.estado === 1 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                            {f.estado === 1 ? "Pagado" : "Pendiente"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex justify-center space-x-2">
                                                            <button onClick={() => setReciboFactura(f)}
                                                                className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                                                                title="Imprimir recibo">
                                                                <FiPrinter size={14} />
                                                            </button>
                                                            {f.estado === 0 && (
                                                                <button onClick={() => setConfirmPagar(f.noFactura)}
                                                                    className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 p-1.5 rounded-lg transition-colors"
                                                                    title="Marcar como pagada">
                                                                    <FiCheckCircle size={14} />
                                                                </button>
                                                            )}
                                                            {f.estado === 0 && (
                                                                <button onClick={() => setConfirmEliminar(f.noFactura)}
                                                                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                                                                    title="Eliminar">
                                                                    <FiTrash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Fila expandida con detalles */}
                                                {expandedId === f.noFactura && (
                                                    <tr key={`det-${f.noFactura}`} className="bg-blue-50/50">
                                                        <td colSpan="8" className="px-8 py-3">
                                                            {(!f.detalles || f.detalles.length === 0) ? (
                                                                <p className="text-xs text-slate-400 italic">Sin detalles registrados.</p>
                                                            ) : (
                                                                <table className="w-full text-xs">
                                                                    <thead>
                                                                        <tr className="text-slate-500 uppercase tracking-wider">
                                                                            <th className="py-1 text-left font-medium">Servicio</th>
                                                                            <th className="py-1 text-left font-medium">Año</th>
                                                                            <th className="py-1 text-right font-medium">Precio</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-blue-100">
                                                                        {f.detalles.map((d, i) => (
                                                                            <tr key={i}>
                                                                                <td className="py-1.5 text-slate-700">{d.servicio?.descripcion ?? "—"}</td>
                                                                                <td className="py-1.5 text-slate-500">{d.observacion ?? "—"}</td>
                                                                                <td className="py-1.5 text-right font-medium text-slate-700">L {parseFloat(d.precio).toFixed(2)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {!loadingFacturas && (
                            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500 text-right">
                                Mostrando {facturasFiltradas.length} de {facturas.length} facturas
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── TAB: REPORTE ────────────────────────────────────────────── */}
            {tab === "reporte" && <ReportePeriodo />}

            <ConfirmModal
                open={confirmPagar !== null}
                title="Marcar factura como pagada"
                message={`¿Confirma que la factura #${confirmPagar} ha sido cobrada? Esta acción no se puede deshacer.`}
                confirmText="Confirmar pago"
                onConfirm={pagarFactura}
                onCancel={() => setConfirmPagar(null)}
            />
            <ConfirmModal
                open={confirmEliminar !== null}
                title="Eliminar factura"
                message="¿Está seguro que desea eliminar esta factura? Solo se pueden eliminar facturas pendientes."
                onConfirm={eliminarFactura}
                onCancel={() => setConfirmEliminar(null)}
            />

            {reciboFactura && (
                <ReciboModal
                    factura={reciboFactura}
                    onClose={() => setReciboFactura(null)}
                />
            )}
        </div>
    );
}

import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { FiZap, FiAlertTriangle, FiClock, FiDownload } from "react-icons/fi";
import { exportToExcel } from "../utils/exportExcel";
import { useToast } from "../context/ToastContext";

export default function CobroMasivoPage() {
    const toast = useToast();

    const [tab, setTab]                 = useState("cobro"); // cobro | historial
    const [servicios, setServicios]     = useState([]);
    const [estados, setEstados]         = useState([]);
    const [idServicio, setIdServicio]   = useState("");
    const [idEstado, setIdEstado]       = useState("");
    const [anio, setAnio]               = useState(String(new Date().getFullYear()));
    const [loading, setLoading]         = useState(false);
    const [resultado, setResultado]     = useState(null);
    const [historial, setHistorial]     = useState([]);
    const [loadingHist, setLoadingHist] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        Promise.all([api.get("/servicios"), api.get("/estados-conexiones")])
            .then(([s, e]) => { setServicios(s.data); setEstados(e.data); });
    }, []);

    const fetchHistorial = async () => {
        setLoadingHist(true);
        try {
            const res = await api.get("/cuenta/historial-cobros");
            setHistorial(res.data);
        } catch {
            toast({ message: "Error al cargar el historial.", type: "error" });
        } finally {
            setLoadingHist(false);
        }
    };

    useEffect(() => {
        if (tab === "historial") fetchHistorial();
    }, [tab]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!idServicio || !idEstado || !anio.trim()) return;
        setShowConfirm(true);
    };

    const ejecutarCobro = async () => {
        setShowConfirm(false);
        setLoading(true);
        setResultado(null);
        try {
            const servicio = servicios.find(s => s.id === parseInt(idServicio));
            const observacion = `${servicio?.descripcion ?? "Servicio"} ${anio}`;

            const res = await api.post("/cuenta/debitar-masivo", {
                idServicio:        parseInt(idServicio),
                idEstadoConexion:  parseInt(idEstado),
                observacion,
            });
            setResultado(res.data);
            fetchHistorial();
            toast({ message: `Cobro masivo aplicado: ${res.data.procesadas} conexiones cargadas.`, type: "success" });
        } catch (err) {
            toast({ message: "Error al ejecutar el cobro masivo.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Cobro Masivo</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Aplica un cargo de servicio a todas las conexiones de un estado específico.
                    </p>
                </div>
                <div className="flex space-x-1 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                    <button onClick={() => setTab("cobro")}
                        className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "cobro" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
                        <FiZap size={14} />
                        <span>Aplicar</span>
                    </button>
                    <button onClick={() => setTab("historial")}
                        className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "historial" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>
                        <FiClock size={14} />
                        <span>Historial</span>
                    </button>
                </div>
            </div>

            {tab === "historial" && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                        <span className="font-semibold text-slate-700">Historial de cobros masivos</span>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => exportToExcel(historial.map(h => ({
                                Fecha: new Date(h.fecha).toLocaleString("es-HN"),
                                Observación: h.observacion,
                                Estado: h.estadoConexion?.estado || "",
                                Total: h.totalConexiones, Aplicados: h.procesadas,
                                "Ya cobradas": h.yaCobradas, "Sin precio": h.sinPrecio
                            })), "historial-cobros")}
                                className="flex items-center space-x-1 text-sm text-green-700 hover:text-green-800">
                                <FiDownload size={14} /><span>Exportar</span>
                            </button>
                            <button onClick={fetchHistorial} className="text-sm text-blue-600 hover:underline">Actualizar</button>
                        </div>
                    </div>
                    {loadingHist ? (
                        <div className="px-5 py-10 text-center text-slate-400 text-sm">Cargando historial...</div>
                    ) : historial.length === 0 ? (
                        <div className="px-5 py-10 text-center text-slate-400 text-sm">No hay registros de cobros masivos aún.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-slate-200">Fecha</th>
                                        <th className="px-4 py-3 border-b border-slate-200">Observación</th>
                                        <th className="px-4 py-3 border-b border-slate-200">Estado objetivo</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-center">Total</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-center text-green-600">Aplicados</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-center text-blue-600">Ya cobradas</th>
                                        <th className="px-4 py-3 border-b border-slate-200 text-center text-yellow-600">Sin precio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {historial.map(h => (
                                        <tr key={h.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                                {new Date(h.fecha).toLocaleString("es-HN")}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-700">{h.observacion}</td>
                                            <td className="px-4 py-3 text-slate-500">{h.estadoConexion?.estado || "—"}</td>
                                            <td className="px-4 py-3 text-center text-slate-600">{h.totalConexiones}</td>
                                            <td className="px-4 py-3 text-center font-semibold text-green-700">{h.procesadas}</td>
                                            <td className="px-4 py-3 text-center text-blue-600">{h.yaCobradas}</td>
                                            <td className="px-4 py-3 text-center text-yellow-600">{h.sinPrecio}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {tab === "cobro" && <>

            {/* Aviso */}
            <div className="flex items-start space-x-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <FiAlertTriangle className="flex-shrink-0 mt-0.5 text-yellow-500" size={18} />
                <p>Esta acción genera un cargo en la cuenta de cada conexión activa. Verifica el servicio y el año antes de continuar.</p>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Servicio a cobrar</label>
                        <select
                            value={idServicio}
                            onChange={e => setIdServicio(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccionar servicio...</option>
                            {servicios.map(s => (
                                <option key={s.id} value={s.id}>{s.descripcion}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Estado de conexión objetivo</label>
                        <select
                            value={idEstado}
                            onChange={e => setIdEstado(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccionar estado...</option>
                            {estados.map(e => (
                                <option key={e.id} value={e.id}>{e.estado}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Año del servicio</label>
                        <input
                            type="number"
                            value={anio}
                            onChange={e => setAnio(e.target.value)}
                            min="2000"
                            max="2099"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-400">Se registrará como observación en cada cargo, ej. "Agua Potable 2025"</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !idServicio || !idEstado}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                        <FiZap size={16} />
                        <span>{loading ? "Aplicando cobro..." : "Aplicar Cobro Masivo"}</span>
                    </button>
                </form>
            </div>

            {/* Resultado */}
            {resultado && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="font-semibold text-slate-700 mb-4">Resultado</h2>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-slate-800">{resultado.total}</div>
                            <div className="text-xs text-slate-500 mt-1">Conexiones encontradas</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-700">{resultado.procesadas}</div>
                            <div className="text-xs text-green-600 mt-1">Cargos aplicados</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-700">{resultado.yaCobradas}</div>
                            <div className="text-xs text-blue-600 mt-1">Ya cobradas</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-yellow-700">{resultado.sinPrecio}</div>
                            <div className="text-xs text-yellow-600 mt-1">Sin precio configurado</div>
                        </div>
                    </div>
                    {resultado.yaCobradas > 0 && (
                        <p className="text-xs text-blue-700 mt-3 bg-blue-50 rounded-lg p-3">
                            {resultado.yaCobradas} conexión(es) ya tenían este cobro registrado y fueron omitidas para evitar duplicados.
                        </p>
                    )}
                    {resultado.sinPrecio > 0 && (
                        <p className="text-xs text-yellow-700 mt-3 bg-yellow-50 rounded-lg p-3">
                            {resultado.sinPrecio} conexión(es) no fueron cargadas porque no tienen precio configurado para este servicio. Revisa la tabla de Precios de Servicios en Administración.
                        </p>
                    )}
                </div>
            )}
            </>}

            {/* Modal de confirmación */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 space-y-4">
                        <div className="flex items-start space-x-3">
                            <FiAlertTriangle className="flex-shrink-0 mt-0.5 text-red-500" size={24} />
                            <div>
                                <h3 className="font-semibold text-slate-800 text-lg">Confirmar cobro masivo</h3>
                                <p className="text-sm text-slate-600 mt-2">
                                    Estás a punto de aplicar el cargo de{" "}
                                    <strong>{servicios.find(s => s.id === parseInt(idServicio))?.descripcion}</strong>{" "}
                                    ({anio}) a todas las conexiones con estado{" "}
                                    <strong>{estados.find(e => e.id === parseInt(idEstado))?.estado}</strong>.
                                </p>
                                <p className="text-sm text-red-600 font-medium mt-2">
                                    Esta acción no se puede deshacer fácilmente.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={ejecutarCobro}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                                Sí, aplicar cobro
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

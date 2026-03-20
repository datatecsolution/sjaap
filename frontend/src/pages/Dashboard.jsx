import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { FiUsers, FiDroplet, FiActivity, FiFileText, FiAlertCircle, FiTrendingUp, FiClock } from "react-icons/fi";

function StatCard({ title, value, sub, icon, color, to }) {
    const card = (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${color.border} flex flex-col space-y-3 hover:shadow-md transition-shadow`}>
            <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-500">{title}</span>
                <div className={`p-2 rounded-xl ${color.icon}`}>{icon}</div>
            </div>
            <span className={`text-3xl font-bold ${color.value}`}>{value}</span>
            <span className="text-xs text-slate-400">{sub}</span>
        </div>
    );
    return to ? <Link to={to}>{card}</Link> : card;
}

export default function Dashboard() {
    const [base, setBase]   = useState(null);
    const [extra, setExtra] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/abonados"),
            api.get("/conexiones"),
            api.get("/estados-conexiones"),
            api.get("/dashboard/stats"),
        ]).then(([abonados, conexiones, estados, stats]) => {
            const estadoActivo = estados.data.find(e => e.estado?.toLowerCase().includes("activ"));
            const activas = estadoActivo
                ? conexiones.data.filter(c => c.estadoConexion?.id === estadoActivo.id).length
                : 0;
            setBase({
                totalAbonados:     abonados.data.length,
                totalConexiones:   conexiones.data.length,
                conexionesActivas: activas,
            });
            setExtra(stats.data);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, []);

    const eficiencia = base && base.totalConexiones > 0
        ? Math.round((base.conexionesActivas / base.totalConexiones) * 100)
        : 0;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Fila 1 — Infraestructura */}
            <div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Infraestructura</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Abonados"
                        value={base?.totalAbonados?.toLocaleString() ?? "—"}
                        sub="Registrados en el sistema"
                        icon={<FiUsers className="text-blue-500" size={18} />}
                        color={{ border: "border-slate-100", icon: "bg-blue-50", value: "text-slate-800" }}
                        to="/abonados"
                    />
                    <StatCard
                        title="Conexiones Activas"
                        value={base?.conexionesActivas?.toLocaleString() ?? "—"}
                        sub={`${eficiencia}% del total (${base?.totalConexiones} conexiones)`}
                        icon={<FiActivity className="text-green-500" size={18} />}
                        color={{ border: "border-slate-100", icon: "bg-green-50", value: "text-slate-800" }}
                        to="/conexiones"
                    />
                    <StatCard
                        title="Total Conexiones"
                        value={base?.totalConexiones?.toLocaleString() ?? "—"}
                        sub="Todas las conexiones registradas"
                        icon={<FiDroplet className="text-cyan-500" size={18} />}
                        color={{ border: "border-slate-100", icon: "bg-cyan-50", value: "text-slate-800" }}
                        to="/conexiones"
                    />
                </div>
            </div>

            {/* Fila 2 — Finanzas */}
            <div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Finanzas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Facturas Pendientes"
                        value={extra?.facturasPendientes?.toLocaleString() ?? "—"}
                        sub="Sin cobrar aún"
                        icon={<FiClock className="text-yellow-500" size={18} />}
                        color={{ border: "border-yellow-100", icon: "bg-yellow-50", value: "text-yellow-700" }}
                        to="/facturacion"
                    />
                    <StatCard
                        title="Ingresos del Mes"
                        value={extra ? `L ${Number(extra.ingresosMes).toLocaleString("es-HN", { minimumFractionDigits: 2 })}` : "—"}
                        sub={`Facturas pagadas en ${new Date().toLocaleString("es-HN", { month: "long" })}`}
                        icon={<FiTrendingUp className="text-green-500" size={18} />}
                        color={{ border: "border-green-100", icon: "bg-green-50", value: "text-green-700" }}
                        to="/facturacion"
                    />
                    <StatCard
                        title="Conexiones Deudoras"
                        value={extra?.totalDeudores?.toLocaleString() ?? "—"}
                        sub="Con saldo positivo en cuenta"
                        icon={<FiAlertCircle className="text-red-500" size={18} />}
                        color={{ border: "border-red-100", icon: "bg-red-50", value: "text-red-700" }}
                        to="/estado-cuenta"
                    />
                    <StatCard
                        title="Monto por Cobrar"
                        value={extra ? `L ${Number(extra.montoPorCobrar).toLocaleString("es-HN", { minimumFractionDigits: 2 })}` : "—"}
                        sub="Suma de saldos deudores"
                        icon={<FiFileText className="text-orange-500" size={18} />}
                        color={{ border: "border-orange-100", icon: "bg-orange-50", value: "text-orange-700" }}
                        to="/estado-cuenta"
                    />
                </div>
            </div>
        </div>
    );
}

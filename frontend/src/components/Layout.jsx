import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { FiHome, FiUsers, FiDroplet, FiLogOut, FiSettings, FiShield, FiFileText, FiBook, FiZap, FiLock, FiBarChart2 } from "react-icons/fi";
import CambiarPasswordModal from "./CambiarPasswordModal";

export default function Layout() {
    const { logout, user, isAdmin } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [showCambiarPassword, setShowCambiarPassword] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const allNavItems = [
        { name: "Dashboard", path: "/", icon: <FiHome className="h-5 w-5" />, roles: ["all"] },
        { name: "Abonados", path: "/abonados", icon: <FiUsers className="h-5 w-5" />, roles: ["all"] },
        { name: "Conexiones", path: "/conexiones", icon: <FiDroplet className="h-5 w-5" />, roles: ["all"] },
        { name: "Facturación", path: "/facturacion", icon: <FiFileText className="h-5 w-5" />, roles: ["all"] },
        { name: "Estado de Cuenta", path: "/estado-cuenta", icon: <FiBook className="h-5 w-5" />, roles: ["all"] },
        { name: "Reportes", path: "/reportes", icon: <FiBarChart2 className="h-5 w-5" />, roles: ["ADMIN"] },
        { name: "Cobro Masivo", path: "/cobro-masivo", icon: <FiZap className="h-5 w-5" />, roles: ["ADMIN"] },
        { name: "Usuarios", path: "/usuarios", icon: <FiShield className="h-5 w-5" />, roles: ["ADMIN"] },
        { name: "Administración", path: "/admin", icon: <FiSettings className="h-5 w-5" />, roles: ["ADMIN"] },
    ];

    const navItems = allNavItems.filter(item =>
        item.roles.includes("all") || item.roles.includes(user?.rol)
    );

    const initials = user
        ? `${(user.nombre || "")[0] || ""}${(user.apellido || "")[0] || ""}`.toUpperCase()
        : "?";

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl">
                <div className="p-6 flex items-center justify-center border-b border-slate-800">
                    <h1 className="text-2xl font-bold text-white tracking-widest">SJAAP</h1>
                </div>
                <nav className="flex-1 px-4 py-8 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                ? "bg-blue-600 text-white"
                                : "hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                    >
                        <FiLogOut className="h-5 w-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10">
                    <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800">
                            {navItems.find((i) => i.path === location.pathname)?.name || "Dashboard"}
                        </h2>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowCambiarPassword(true)}
                                className="flex items-center space-x-1.5 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                                title="Cambiar contraseña"
                            >
                                <FiLock size={15} />
                                <span className="hidden sm:inline">Cambiar contraseña</span>
                            </button>
                            <div className="flex items-center space-x-2">
                                <div className="hidden sm:block text-right">
                                    <div className="text-sm font-medium text-slate-700">{user?.nombre} {user?.apellido}</div>
                                    <div className="text-xs text-slate-400">{user?.rol || "Usuario"}</div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-blue-200">
                                    {initials}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <Outlet />
                </main>
            </div>
        {showCambiarPassword && (
            <CambiarPasswordModal onClose={() => setShowCambiarPassword(false)} />
        )}
        </div>
    );
}

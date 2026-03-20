import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiKey, FiDownload } from "react-icons/fi";
import { exportToExcel } from "../utils/exportExcel";
import UsuarioForm from "../components/UsuarioForm";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import { useToast } from "../context/ToastContext";

export default function UsuariosList() {
    const toast = useToast();
    const [usuarios, setUsuarios] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [usuarioToEdit, setUsuarioToEdit] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [resetId, setResetId] = useState(null);
    const [resetPass, setResetPass] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;

    useEffect(() => {
        const timer = setTimeout(() => { setSearchDebounced(searchTerm); setPage(1); }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsuarios();
    }, [page, searchDebounced]);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const response = await api.get("/usuarios/paginado", {
                params: { page: page - 1, size: PAGE_SIZE, search: searchDebounced }
            });
            setUsuarios(response.data.content);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/usuarios/${confirmId}`);
            setUsuarios(usuarios.filter(u => u.id !== confirmId));
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            toast({ message: "Error al eliminar el usuario.", type: "error" });
        } finally {
            setConfirmId(null);
        }
    };

    const handleResetPassword = async () => {
        if (!resetPass || resetPass.length < 6) {
            toast({ message: "La contraseña debe tener al menos 6 caracteres.", type: "warning" });
            return;
        }
        try {
            await api.put(`/usuarios/${resetId}/reset-password`, { passwordNuevo: resetPass });
            toast({ message: "Contraseña restablecida correctamente.", type: "success" });
        } catch {
            toast({ message: "Error al restablecer la contraseña.", type: "error" });
        } finally {
            setResetId(null);
            setResetPass("");
        }
    };

    // Data comes pre-filtered and pre-paged from server
    const filteredUsuarios = usuarios;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={async () => {
                            const all = await api.get("/usuarios");
                            exportToExcel(all.data.map(u => ({
                                ID: u.id, Nombre: u.nombre, Apellido: u.apellido,
                                Email: u.email, Teléfono: u.telefono || "",
                                Rol: u.tipoUsuario?.descripcion || ""
                            })), "usuarios");
                        }}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <FiDownload size={16} />
                        <span>Exportar</span>
                    </button>
                    <button
                        onClick={() => { setUsuarioToEdit(null); setShowForm(true); }}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <FiPlus />
                        <span>Nuevo Usuario</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, apellido o email..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium border-b border-slate-200">Usuario</th>
                                <th className="px-6 py-4 font-medium border-b border-slate-200">Email</th>
                                <th className="px-6 py-4 font-medium border-b border-slate-200">Rol</th>
                                <th className="px-6 py-4 text-center font-medium border-b border-slate-200">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : filteredUsuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsuarios.map((usuario) => (
                                    <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">
                                                {usuario.nombre} {usuario.apellido}
                                            </div>
                                            <div className="text-sm text-slate-500">{usuario.telefono || "Sin teléfono"}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {usuario.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {usuario.tipoUsuario?.descripcion || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-3">
                                                <button
                                                    onClick={() => { setUsuarioToEdit(usuario); setShowForm(true); }}
                                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => { setResetId(usuario.id); setResetPass(""); }}
                                                    className="text-yellow-600 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 p-2 rounded-lg transition-colors"
                                                    title="Restablecer contraseña"
                                                >
                                                    <FiKey />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmId(usuario.id)}
                                                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    total={totalElements}
                    page={page}
                    pageSize={PAGE_SIZE}
                    onPage={setPage}
                />
            </div>

            {showForm && (
                <UsuarioForm
                    usuarioEdit={usuarioToEdit}
                    onClose={() => setShowForm(false)}
                    onSave={() => {
                        setShowForm(false);
                        fetchUsuarios();
                    }}
                />
            )}

            <ConfirmModal
                open={confirmId !== null}
                title="Eliminar usuario"
                message="¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer."
                onConfirm={handleDelete}
                onCancel={() => setConfirmId(null)}
            />

            {/* Modal restablecer contraseña */}
            {resetId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800">Restablecer Contraseña</h3>
                        <p className="text-sm text-slate-500">
                            Ingrese la nueva contraseña para el usuario #{resetId}.
                        </p>
                        <input
                            type="password"
                            placeholder="Nueva contraseña (mín. 6 caracteres)"
                            value={resetPass}
                            onChange={e => setResetPass(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex space-x-3">
                            <button onClick={handleResetPassword}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                                Restablecer
                            </button>
                            <button onClick={() => { setResetId(null); setResetPass(""); }}
                                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2 rounded-lg text-sm font-medium">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

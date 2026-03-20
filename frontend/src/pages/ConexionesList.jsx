import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiDownload } from "react-icons/fi";
import { exportToExcel } from "../utils/exportExcel";
import ConexionForm from "../components/ConexionForm";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import { useToast } from "../context/ToastContext";

export default function ConexionesList() {
    const toast = useToast();
    const [conexiones, setConexiones] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [conexionToEdit, setConexionToEdit] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;

    useEffect(() => {
        const timer = setTimeout(() => { setSearchDebounced(searchTerm); setPage(1); }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchConexiones();
    }, [page, searchDebounced]);

    const fetchConexiones = async () => {
        try {
            setLoading(true);
            const response = await api.get("/conexiones/paginado", {
                params: { page: page - 1, size: PAGE_SIZE, search: searchDebounced }
            });
            setConexiones(response.data.content);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error("Error al obtener conexiones:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/conexiones/${confirmId}`);
            setConexiones(conexiones.filter(c => c.id !== confirmId));
        } catch (error) {
            console.error("Error al eliminar conexión:", error);
            toast({ message: "Error al eliminar la conexión.", type: "error" });
        } finally {
            setConfirmId(null);
        }
    };

    // Data comes pre-filtered and pre-paged from server

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Gestión de Conexiones</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={async () => {
                            const all = await api.get("/conexiones");
                            exportToExcel(all.data.map(c => ({
                            ID: c.id, Formulario: c.noForm || "",
                            Abonado: `${c.abonado?.nombre || ""} ${c.abonado?.apellido || ""}`,
                            Dirección: c.direccion || "",
                            Tipo: c.tipoConexion?.descripcion || "",
                            Estado: c.estadoConexion?.estado || ""
                        })), "conexiones");
                        }}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <FiDownload size={16} />
                        <span>Exportar</span>
                    </button>
                    <button
                        onClick={() => { setConexionToEdit(null); setShowForm(true); }}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <FiPlus />
                        <span>Nueva Conexión</span>
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
                            placeholder="Buscar por nombre, dirección o formulario..."
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
                                <th className="px-6 py-4 font-medium border-b border-slate-200">ID / Form</th>
                                <th className="px-6 py-4 font-medium border-b border-slate-200">Abonado / Dirección</th>
                                <th className="px-6 py-4 font-medium border-b border-slate-200">Tipo</th>
                                <th className="px-6 py-4 font-medium border-b border-slate-200">Estado</th>
                                <th className="px-6 py-4 text-center font-medium border-b border-slate-200">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Cargando conexiones...
                                    </td>
                                </tr>
                            ) : conexiones.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron conexiones.
                                    </td>
                                </tr>
                            ) : (
                                conexiones.map((conexion) => (
                                    <tr key={conexion.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-semibold text-slate-700">#{conexion.id}</div>
                                            <div className="text-xs text-slate-500">{conexion.noForm ? `Form: ${conexion.noForm}` : 'Sin form'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">
                                                {conexion.abonado?.nombre} {conexion.abonado?.apellido}
                                            </div>
                                            <div className="text-sm text-slate-500 truncate max-w-xs">{conexion.direccion}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {conexion.tipoConexion?.descripcion || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${conexion.estadoConexion?.estado?.toLowerCase().includes('activ')
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {conexion.estadoConexion?.estado || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-3">
                                                <button
                                                    onClick={() => { setConexionToEdit(conexion); setShowForm(true); }}
                                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmId(conexion.id)}
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
                <ConexionForm
                    conexionEdit={conexionToEdit}
                    onClose={() => setShowForm(false)}
                    onSave={() => {
                        setShowForm(false);
                        fetchConexiones();
                    }}
                />
            )}

            <ConfirmModal
                open={confirmId !== null}
                title="Eliminar conexión"
                message="¿Está seguro que desea eliminar esta conexión de agua? Esta acción no se puede deshacer."
                onConfirm={handleDelete}
                onCancel={() => setConfirmId(null)}
            />
        </div>
    );
}

import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiDownload } from "react-icons/fi";
import { exportToExcel } from "../utils/exportExcel";
import AbonadoForm from "../components/AbonadoForm";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import { useToast } from "../context/ToastContext";

export default function AbonadosList() {
    const toast = useToast();
    const [abonados, setAbonados] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [abonadoEdit, setAbonadoEdit] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;

    useEffect(() => {
        const timer = setTimeout(() => { setSearchDebounced(searchTerm); setPage(1); }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchAbonados();
    }, [page, searchDebounced]);

    const fetchAbonados = async () => {
        try {
            setLoading(true);
            const response = await api.get("/abonados/paginado", {
                params: { page: page - 1, size: PAGE_SIZE, search: searchDebounced }
            });
            setAbonados(response.data.content);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error("Error al obtener abonados:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/abonados/${confirmId}`);
            setAbonados(abonados.filter(a => a.id !== confirmId));
        } catch (error) {
            console.error("Error al eliminar abonado:", error);
            toast({ message: "Error al eliminar el abonado. Es posible que tenga conexiones de agua asociadas.", type: "error" });
        } finally {
            setConfirmId(null);
        }
    };

    const handleEdit = (abonado) => {
        setAbonadoEdit(abonado);
        setShowForm(true);
    };

    const handleNew = () => {
        setAbonadoEdit(null);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setAbonadoEdit(null);
    };

    // Data comes pre-filtered and pre-paged from server

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Gestión de Abonados</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={async () => {
                            const all = await api.get("/abonados");
                            exportToExcel(all.data.map(a => ({
                            ID: a.id, Nombre: a.nombre, Apellido: a.apellido,
                            Teléfono: a.telefono || "", Celular: a.celular || "",
                            Email: a.email || "", Dirección: a.direccion || ""
                        })), "abonados");
                        }}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <FiDownload size={16} />
                        <span>Exportar</span>
                    </button>
                    <button
                        onClick={handleNew}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <FiPlus />
                        <span>Nuevo Abonado</span>
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
                            placeholder="Buscar por nombre, apellido o teléfono..."
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
                                <th className="px-6 py-4 font-medium border-b border-slate-200">ID</th>
                                <th className="px-6 py-4 font-medium border-b border-slate-200">Nombre Completo</th>
                                <th className="px-6 py-4 font-medium border-b border-slate-200">Teléfono</th>
                                <th className="px-6 py-4 font-medium border-b border-slate-200">Email</th>
                                <th className="px-6 py-4 text-center font-medium border-b border-slate-200">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Cargando abonados...
                                    </td>
                                </tr>
                            ) : abonados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron abonados.
                                    </td>
                                </tr>
                            ) : (
                                abonados.map((abonado) => (
                                    <tr key={abonado.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500">#{abonado.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{abonado.nombre} {abonado.apellido}</div>
                                            <div className="text-sm text-slate-500 truncate max-w-xs">{abonado.direccion}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div>{abonado.telefono || <span className="text-slate-400 italic">—</span>}</div>
                                            {abonado.celular && <div className="text-xs text-slate-400">Cel: {abonado.celular}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {abonado.email || <span className="text-slate-400 italic">No registrado</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center space-x-3">
                                                <button
                                                    onClick={() => handleEdit(abonado)}
                                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmId(abonado.id)}
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
                <AbonadoForm
                    abonadoEdit={abonadoEdit}
                    onClose={handleFormClose}
                    onSave={fetchAbonados}
                />
            )}

            <ConfirmModal
                open={confirmId !== null}
                title="Eliminar abonado"
                message="¿Está seguro que desea eliminar este abonado? Esta acción no se puede deshacer y fallará si tiene conexiones asociadas."
                onConfirm={handleDelete}
                onCancel={() => setConfirmId(null)}
            />
        </div>
    );
}

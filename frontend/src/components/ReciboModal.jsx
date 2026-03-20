import { useRef } from "react";
import { FiPrinter, FiX } from "react-icons/fi";

export default function ReciboModal({ factura, onClose }) {
    const printRef = useRef(null);

    if (!factura) return null;

    const handlePrint = () => {
        const contenido = printRef.current.innerHTML;
        const ventana = window.open("", "_blank", "width=400,height=600");
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8"/>
                <title>Recibo #${factura.noFactura}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        width: 300px;
                        padding: 12px;
                        color: #000;
                    }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    .large { font-size: 15px; }
                    .xlarge { font-size: 18px; }
                    .divider { border-top: 1px dashed #000; margin: 6px 0; }
                    .row { display: flex; justify-content: space-between; margin: 2px 0; }
                    .row-label { flex: 1; }
                    .row-value { text-align: right; }
                    table { width: 100%; border-collapse: collapse; }
                    th { border-bottom: 1px solid #000; padding: 3px 0; text-align: left; font-size: 10px; text-transform: uppercase; }
                    td { padding: 3px 0; vertical-align: top; }
                    .td-right { text-align: right; }
                    .total-row td { font-weight: bold; border-top: 1px solid #000; padding-top: 4px; }
                    .mt { margin-top: 6px; }
                    .mb { margin-bottom: 6px; }
                </style>
            </head>
            <body>${contenido}</body>
            </html>
        `);
        ventana.document.close();
        ventana.focus();
        ventana.print();
        ventana.close();
    };

    const fecha = new Date(factura.fecha);
    const fechaStr = fecha.toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const horaStr  = fecha.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" });

    const abonado   = factura.conexion?.abonado;
    const conexion  = factura.conexion;
    const detalles  = factura.detalles ?? [];
    const total     = parseFloat(factura.totalPagar ?? 0);
    const efectivo  = parseFloat(factura.efectivo ?? total);
    const cambio    = parseFloat(factura.cambio ?? 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                {/* Header modal */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="font-semibold text-slate-800">Recibo de Factura</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors">
                        <FiX size={18} />
                    </button>
                </div>

                {/* Contenido del recibo (vista previa) */}
                <div className="p-5 overflow-y-auto max-h-[70vh]">
                    <div
                        ref={printRef}
                        className="font-mono text-xs text-slate-800 border border-dashed border-slate-300 rounded-lg p-4 space-y-1"
                    >
                        {/* Encabezado */}
                        <div className="center bold large">SJAAP</div>
                        <div className="center">San Juan Pueblo</div>
                        <div className="center">Junta de Agua</div>
                        <div className="divider" />

                        {/* Datos factura */}
                        <div className="row">
                            <span className="row-label">Factura N°</span>
                            <span className="row-value bold">{factura.noFactura}</span>
                        </div>
                        <div className="row">
                            <span className="row-label">Fecha</span>
                            <span className="row-value">{fechaStr}</span>
                        </div>
                        <div className="row">
                            <span className="row-label">Hora</span>
                            <span className="row-value">{horaStr}</span>
                        </div>
                        <div className="divider" />

                        {/* Datos del abonado */}
                        <div className="bold">ABONADO:</div>
                        <div>{abonado?.nombre} {abonado?.apellido}</div>
                        <div className="row">
                            <span className="row-label">Conexión #</span>
                            <span className="row-value">{conexion?.id}</span>
                        </div>
                        {conexion?.direccion && (
                            <div style={{ fontSize: "10px" }}>{conexion.direccion}</div>
                        )}
                        {conexion?.tipoConexion?.descripcion && (
                            <div style={{ fontSize: "10px" }}>{conexion.tipoConexion.descripcion}</div>
                        )}
                        <div className="divider" />

                        {/* Servicios */}
                        <table>
                            <thead>
                                <tr>
                                    <th>Servicio</th>
                                    <th style={{ textAlign: "center" }}>Año</th>
                                    <th className="td-right">Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detalles.map((d, i) => (
                                    <tr key={i}>
                                        <td>{d.servicio?.descripcion ?? "—"}</td>
                                        <td style={{ textAlign: "center" }}>{d.observacion ?? "—"}</td>
                                        <td className="td-right">L {parseFloat(d.precio).toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan="2">TOTAL</td>
                                    <td className="td-right">L {total.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="divider" />

                        {/* Pago */}
                        <div className="row">
                            <span className="row-label">Efectivo</span>
                            <span className="row-value">L {efectivo.toFixed(2)}</span>
                        </div>
                        <div className="row bold">
                            <span className="row-label">Cambio</span>
                            <span className="row-value">L {cambio.toFixed(2)}</span>
                        </div>
                        <div className="divider" />

                        {/* Pie */}
                        <div className="center mt">¡Gracias por su pago!</div>
                        <div className="center" style={{ fontSize: "10px" }}>Conserve este recibo</div>
                    </div>
                </div>

                {/* Botones */}
                <div className="px-5 py-4 border-t border-slate-200 flex space-x-3">
                    <button
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                    >
                        <FiPrinter size={16} />
                        <span>Imprimir</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

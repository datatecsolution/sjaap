import * as XLSX from "xlsx";

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx).
 * @param {Object[]} data    - Array de filas (objetos planos)
 * @param {string}   filename - Nombre del archivo sin extensión
 */
export function exportToExcel(data, filename) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

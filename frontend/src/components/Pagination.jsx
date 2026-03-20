import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Reusable pagination component.
 * Props:
 *   total      – total number of items
 *   page       – current page (1-based)
 *   pageSize   – items per page
 *   onPage     – callback(newPage)
 */
export default function Pagination({ total, page, pageSize, onPage }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (totalPages <= 1) return null;

    const from = (page - 1) * pageSize + 1;
    const to   = Math.min(page * pageSize, total);

    // Build visible page numbers with ellipsis
    const pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push("…");
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
        if (page < totalPages - 2) pages.push("…");
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <span className="text-xs text-slate-500">
                Mostrando {from}–{to} de {total}
            </span>
            <div className="flex items-center space-x-1">
                <button
                    onClick={() => onPage(page - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <FiChevronLeft size={16} />
                </button>

                {pages.map((p, i) =>
                    p === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPage(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                p === page
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <FiChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

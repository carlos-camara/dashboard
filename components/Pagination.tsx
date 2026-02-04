
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className = '' }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                // Start: [1, 2, 3, 4, ..., N]
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                // End: [1, ..., N-3, N-2, N-1, N]
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // Middle: [1, ..., P-1, P, P+1, ..., N]
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className={`flex items-center justify-center space-x-2 py-4 ${className}`}>
            <button
                disabled={currentPage === 1}
                onClick={(e) => { e.stopPropagation(); onPageChange(currentPage - 1); }}
                className="p-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 disabled:opacity-30 disabled:hover:bg-slate-900/50 transition-all duration-200 group"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center space-x-1.5 bg-slate-950/40 p-1.5 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {typeof page === 'number' ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onPageChange(page); }}
                                className={`
                                    min-w-[32px] h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-300
                                    ${currentPage === page
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                        : 'text-slate-500 hover:text-white hover:bg-slate-800'
                                    }
                                `}
                            >
                                {page}
                            </button>
                        ) : (
                            <span className="w-8 h-8 flex items-center justify-center text-slate-600">
                                <MoreHorizontal size={14} />
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <button
                disabled={currentPage === totalPages}
                onClick={(e) => { e.stopPropagation(); onPageChange(currentPage + 1); }}
                className="p-2 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 disabled:opacity-30 disabled:hover:bg-slate-900/50 transition-all duration-200 group"
            >
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
        </div>
    );
};

export default Pagination;

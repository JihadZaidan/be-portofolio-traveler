import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

const getPages = (total: number): (number | 'dots')[] => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | 'dots')[] = [1, 2, 3, 4];

    if (total > 7) {
        pages.push('dots');
        pages.push(total);
    }

    return pages;
};

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = getPages(totalPages);

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <div className="flex items-center justify-center gap-3">
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 text-xs shadow-sm disabled:opacity-40"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {pages.map((page, index) => {
                if (page === 'dots') {
                    return (
                        <div key={`dots-${index}`} className="flex h-8 w-8 items-center justify-center text-slate-500 text-xs">
                            ...
                        </div>
                    );
                }

                const isActive = page === currentPage;

                return (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs shadow-sm transition-colors ${
                            isActive
                                ? 'bg-sky-500 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 text-xs shadow-sm disabled:opacity-40"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

export default Pagination;

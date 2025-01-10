import { PaginationButton } from "./PaginationButton";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const maxPagesToShow = 3;

    const getPageNumbers = (): (string | number)[] => {
        if (totalPages <= maxPagesToShow + 2) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= maxPagesToShow) {
            return [...Array.from({ length: maxPagesToShow }, (_, i) => i + 1), '...', totalPages];
        }

        if (currentPage > totalPages - maxPagesToShow) {
            return [1, '...', ...Array.from({ length: maxPagesToShow }, (_, i) => totalPages - maxPagesToShow + i + 1)];
        }

        return [1, '...', currentPage, '...', totalPages];
    };

    const pageNumbers = getPageNumbers();

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    return (
        <div className="flex justify-center items-center space-x-2">
            <PaginationButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                type="navigation"
            >
                -
            </PaginationButton>

            {pageNumbers.map((num, index) =>
                num === '...' ? (
                    <span key={index} className="px-3 py-1 text-neutral-400">...</span>
                ) : (
                    <PaginationButton
                        key={index}
                        onClick={() => handlePageChange(num as number)}
                        active={currentPage === num}
                        type="page"
                    >
                        {num}
                    </PaginationButton>
                )
            )}

            <PaginationButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                type="navigation"
            >
                +
            </PaginationButton>
        </div>
    );
};
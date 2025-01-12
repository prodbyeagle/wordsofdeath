import { PaginationButton } from "./PaginationButton";

/**
 * Props for the Pagination component.
 */
interface PaginationProps {
    /**
     * The current active page.
     */
    currentPage: number;

    /**
     * The total number of pages.
     */
    totalPages: number;

    /**
     * Callback function to handle page changes.
     * @param page The page number to switch to.
     */
    onPageChange: (page: number) => void;
}

/**
 * A pagination component to navigate through multiple pages.
 *
 * @param currentPage The current active page.
 * @param totalPages The total number of pages.
 * @param onPageChange Callback function to handle page changes.
 * @returns A component rendering pagination buttons with navigation.
 */
export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const maxPagesToShow = 3;

    /**
     * Generates an array of page numbers or ellipses for the pagination display.
     * 
     * @returns An array of page numbers and ellipses.
     */
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

    /**
     * Handles page change events and triggers the callback if the page is valid.
     * 
     * @param page The page number to navigate to.
     */
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

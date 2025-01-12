/**
 * Props for the PaginationButton component.
 */
interface PaginationButtonProps {
    /**
     * The content to display inside the button.
     */
    children: React.ReactNode;

    /**
     * Callback function triggered when the button is clicked.
     */
    onClick: () => void;

    /**
     * Whether the button is disabled.
     */
    disabled?: boolean;

    /**
     * Whether the button is active (used for page buttons).
     */
    active?: boolean;

    /**
     * Specifies the button type, either for navigation or a page number.
     */
    type: 'navigation' | 'page';

    /**
     * An accessible label for the button, used for screen readers.
     */
    'aria-label'?: string;
}

/**
 * A button component for use in the Pagination component, styled based on its type, active state, and disabled state.
 *
 * @param children The content to display inside the button.
 * @param onClick Callback function triggered when the button is clicked.
 * @param disabled Whether the button is disabled.
 * @param active Whether the button is active (used for page buttons).
 * @param type Specifies the button type, either for navigation or a page number.
 * @param ariaLabel An accessible label for the button, used for screen readers.
 * @returns A styled button component for pagination.
 */
export const PaginationButton = ({
    children,
    onClick,
    disabled,
    active,
    type,
    'aria-label': ariaLabel
}: PaginationButtonProps) => {
    const baseStyles = "min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg transition-colors duration-200";

    /**
     * Determines the styles to apply based on the button type, active state, and disabled state.
     *
     * @returns A string of class names for styling the button.
     */
    const getButtonStyles = () => {
        if (type === 'navigation' && disabled) {
            return `${baseStyles} text-neutral-600`;
        }

        if (active) {
            return `${baseStyles} bg-neutral-600 text-neutral-100`;
        }

        return `${baseStyles} text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800`;
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={getButtonStyles()}
            aria-label={ariaLabel}
            aria-current={active ? 'page' : undefined}
        >
            {children}
        </button>
    );
};

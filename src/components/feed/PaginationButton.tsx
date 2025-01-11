interface PaginationButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    type: 'navigation' | 'page';
    'aria-label'?: string;
}

export const PaginationButton = ({
    children,
    onClick,
    disabled,
    active,
    type,
    'aria-label': ariaLabel
}: PaginationButtonProps) => {
    const baseStyles = "min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg transition-colors duration-200";

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
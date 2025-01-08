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

    if (type === 'navigation' && disabled) {
        return (
            <button
                disabled
                className={`${baseStyles} text-zinc-600 cursor-not-allowed`}
                aria-label={ariaLabel}
            >
                {children}
            </button>
        );
    }

    const styles = active
        ? `${baseStyles} bg-green-600 text-white`
        : `${baseStyles} text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800`;

    return (
        <button
            onClick={onClick}
            className={styles}
            aria-label={ariaLabel}
            aria-current={active ? 'page' : undefined}
        >
            {children}
        </button>
    );
};
import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * The variant of the button, which determines its style.
     * - `primary`: A neutral button for primary actions.
     * - `secondary`: A neutral dark button.
     * - `outline`: A transparent button with a border.
     * - `destructive`: A red button for dangerous actions.
     * @default "primary"
     */
    variant?: "primary" | "secondary" | "outline" | "destructive";

    /**
     * The size of the button.
     * - `sm`: Small button.
     * - `md`: Medium button (default).
     * - `lg`: Large button.
     * @default "md"
     */
    size?: "sm" | "md" | "lg";

    /**
     * Whether the button is in a loading state.
     * If `true`, a spinner will be displayed, and the button will be disabled.
     * @default false
     */
    loading?: boolean;
}

/**
 * A versatile Button component with support for multiple variants, sizes, 
 * loading state, and custom class names.
 *
 * @param {ButtonProps} props - The props for the Button component.
 * @returns {JSX.Element} A styled button element.
 */
export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    className,
    disabled,
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";

    const variants = {
        primary:
            "bg-neutral-600 text-neutral-100 hover:bg-neutral-700 focus:ring-neutral-500 active:bg-neutral-800",
        secondary:
            "bg-neutral-700 text-neutral-100 hover:bg-neutral-800 focus:ring-neutral-500 active:bg-neutral-900",
        outline:
            "border-2 border-neutral-400 text-neutral-100 hover:bg-neutral-700 focus:ring-neutral-500 active:bg-neutral-800",
        destructive:
            "bg-red-600 text-neutral-100 hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
    };

    const sizes = {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-5 py-3 text-lg",
    };

    return (
        <button
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Spinner className="w-6 h-6" />
            ) : (
                children
            )}
        </button>
    );
};

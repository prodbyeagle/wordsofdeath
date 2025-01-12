import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

/**
 * The props for the Button component, allowing for customization of variant, size, and loading state.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Specifies the style variant of the button.
     * - `primary`: A neutral button for primary actions (default).
     * - `secondary`: A dark button for secondary actions.
     * - `outline`: A transparent button with a border, ideal for less prominent actions.
     * - `destructive`: A red button for dangerous or destructive actions, such as delete.
     * @default "primary"
     */
    variant?: "primary" | "secondary" | "outline" | "destructive";

    /**
     * Defines the button size.
     * - `sm`: Small button with reduced padding and font size.
     * - `md`: Medium button (default) with standard padding and font size.
     * - `lg`: Large button with increased padding and font size.
     * @default "md"
     */
    size?: "sm" | "md" | "lg";

    /**
     * Indicates whether the button is in a loading state.
     * - When `true`, a spinner is shown inside the button, and the button is disabled.
     * @default false
     */
    loading?: boolean;
}

/**
 * A customizable Button component that supports different styles (variants), sizes, and a loading state.
 * This component can display a loading spinner when in the loading state, making it suitable for actions 
 * that require async operations (e.g., form submissions, data fetching).
 *
 * @param {ButtonProps} props - The properties for the button component, including variant, size, and loading state.
 * @returns {JSX.Element} A styled button element, either displaying content or a spinner based on the loading state.
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

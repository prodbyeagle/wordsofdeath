import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Props for the Input component.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * Label text displayed above the input field.
     * @default undefined
     */
    label?: string;

    /**
     * Icon displayed inside the input field (on the left side).
     * Should be a valid Lucide React Icon.
     * @default undefined
     */
    icon: LucideIcon;

    /**
     * Error message displayed below the input field.
     * If provided, the input field will also display an error styling.
     * @default undefined
     */
    error?: string;
}

/**
 * A customizable input component with optional label, icon, and error message.
 * 
 * @param {InputProps} props - The properties for the Input component.
 * @returns {JSX.Element} The rendered Input component.
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Username"
 *   placeholder="Enter your username"
 * />
 * 
 * <Input
 *   label="Search"
 *   icon={SearchIcon}
 *   placeholder="Search for users"
 * />
 * 
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error="Invalid email address"
 * />
 * ```
 */
export const Input: React.FC<InputProps> = ({
    label,
    icon: Icon,
    error,
    className,
    ...props
}) => {
    return (
        <div className={`w-full ${className || ''}`}>
            {label && (
                <label htmlFor={props.id || props.name} className="block mb-2 text-sm font-medium text-neutral-400">
                    {label}
                </label>
            )}
            <div className="relative flex items-center">
                {Icon && (
                    <div className="absolute left-3 flex items-center justify-center text-neutral-400">
                        <Icon size={16} />
                    </div>
                )}
                <input
                    {...props}
                    className={`w-full pl-10 pr-4 py-2 text-base bg-neutral-800 border border-neutral-700 
                    rounded-lg placeholder:text-neutral-500 text-white focus:outline-none focus:ring-1 
                    focus:ring-neutral-400 focus:border-neutral-400
                    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                />
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
};

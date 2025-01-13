import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { LogInIcon } from "lucide-react";

interface LoginPromptProps {
    /** 
     * A boolean indicating whether the login prompt is displayed as a dialog or a full-page component. 
     * If `true`, the prompt appears as a dialog. If `false`, it occupies the full screen.
     */
    dialog: boolean;
}

/** 
 * A component that prompts the user to log in. 
 * It displays a message and a login button which redirects the user to the authentication URL.
 * The appearance of the prompt can vary based on whether it is a dialog or a full-page prompt.
 * 
 * @param {boolean} dialog - Determines whether the prompt is displayed as a dialog or a full-page component.
 * @returns {JSX.Element} The LoginPrompt component.
 */
const getApiBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_DEVELOPMENT === "true"
        ? "http://localhost:3001"
        : "https://wordsofdeath-backend.vercel.app";
};

export const LoginPrompt: React.FC<LoginPromptProps> = ({ dialog }) => {
    const loginUrl = `${getApiBaseUrl()}/api/auth`;

    return (
        <div className={`flex bg-neutral-900 items-center justify-center p-8 ${!dialog ? 'min-h-screen' : ''}`}>
            <div className="w-full max-w-md bg-neutral-800 rounded-2xl p-8 shadow-xl border border-neutral-700/50">
                <div className="text-center space-y-3 mb-8">
                    <h1 className="text-2xl font-bold text-neutral-100">
                        Willkommen zurück!
                    </h1>
                    <p className="text-neutral-400">
                        Melde dich an, um die Plattform zu nutzen.
                    </p>
                </div>

                <Link href={loginUrl}>
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        content="Anmelden"
                        icon={LogInIcon}
                    >
                    </Button>
                </Link>
            </div>
        </div>
    );
};

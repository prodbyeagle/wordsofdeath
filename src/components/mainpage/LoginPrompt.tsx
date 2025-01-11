import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";

interface LoginPromptProps {
    modal: boolean;
}

export const LoginPrompt: React.FC<LoginPromptProps> = ({ modal }) => {
    return (
        <div className={`flex bg-neutral-900 items-center justify-center p-8 ${!modal ? 'min-h-screen' : ''}`}>
            <div className="w-full max-w-md bg-neutral-800 rounded-2xl p-8 shadow-xl border border-neutral-700/50">
                <div className="text-center space-y-3 mb-8">
                    <h1 className="text-2xl font-bold text-neutral-100">
                        Willkommen zurück!
                    </h1>
                    <p className="text-neutral-400">
                        Melde dich an, um die Plattform zu nutzen.
                    </p>
                </div>

                <Link href="http://localhost:3001/auth/discord">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                    >
                        Anmelden
                    </Button>
                </Link>
            </div>
        </div>
    );
};

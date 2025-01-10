import Link from "next/link";
import { Button } from "../ui/Button";

export const LoginPrompt = () => {
    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-800 rounded-2xl p-8 shadow-xl border border-neutral-700/50">
                <div className="text-center space-y-3 mb-8">
                    <h1 className="text-2xl font-bold text-neutral-100">
                        Willkommen zurück!
                    </h1>
                    <p className="text-neutral-400">
                        Melde dich an, um die Plattform zu nutzen.
                    </p>
                </div>

                <Link href="https://wordsofdeath-backend.vercel.app/auth/discord">
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

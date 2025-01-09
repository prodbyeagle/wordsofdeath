import Link from "next/link";
import { Button } from "../ui/Button";

export const LoginPrompt = () => {
    return (
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-800 rounded-2xl p-8 shadow-xl border border-zinc-700/50">
                <div className="text-center space-y-3 mb-8">
                    <h1 className="text-2xl font-bold text-zinc-100">
                        Willkommen zurück!
                    </h1>
                    <p className="text-zinc-400">
                        Melde dich an, um die Plattform zu nutzen.
                    </p>
                </div>

                <Link href="/signin">
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

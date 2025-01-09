/* eslint-disable react-hooks/exhaustive-deps */
// Homepage.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from "react";
import { CacheManager } from "@/lib/avatarCache";
import { fetchEntries as fetchEntriesFromAPI } from "@/lib/api";
import type { Entry, User } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import { LoginPrompt } from "@/components/mainpage/LoginPrompt";
import { Pagination } from "@/components/mainpage/Pagination";
import { EntryCard } from "@/components/mainpage/EntryCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

const Homepage = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [uniqueEntries, setUniqueEntries] = useState<Entry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newEntry, setNewEntry] = useState<string>("");
    const [categories, setCategories] = useState<string>("");
    const [user] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const entriesPerPage = 10;
    const [cacheManager, setCacheManager] = useState<CacheManager | null>(null);
    const [avatarUrls, setAvatarUrls] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get("page");
        setPage(pageParam ? parseInt(pageParam, 25) : 1);
    }, []);

    useEffect(() => {
        const cookies = document.cookie.split("; ");
        const token = cookies.find((row) => row.startsWith("wordsofdeath="));
        if (token) {
            setIsLoggedIn(true);
            loadEntries(token.split("=")[1]);
            setCacheManager(new CacheManager());
        } else {
            console.warn("No token found.");
        }
    }, []);

    useEffect(() => {
        const loadAvatars = async () => {
            const authors = [...new Set(entries.map((entry) => entry.author))];
            for (const author of authors) {
                await cacheManager?.getAvatarUrl(author);
            }
        };
        if (cacheManager) {
            loadAvatars();
        }
    }, [entries, cacheManager]);

    const loadEntries = async (token: string): Promise<Entry[]> => {
        const fetchedEntries = await fetchEntriesFromAPI(token);
        setEntries(fetchedEntries);
        return fetchedEntries;
    };

    useEffect(() => {
        const startIdx = (page - 1) * entriesPerPage;
        const endIdx = startIdx + entriesPerPage;
        setUniqueEntries(entries.slice(startIdx, endIdx));
    }, [page, entries]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        router.push(`/?page=${newPage}`, undefined);
    };

    const handleNewEntrySubmit = async () => {
        const token = document.cookie.split("; ").find((row) => row.startsWith("wordsofdeath="))?.split("=")[1];
        if (!token || !newEntry.trim()) {
            setError("Kein Token oder leerer Eintrag.");
            return;
        }

        try {
            const response = await fetch("https://wordsofdeath-backend.vercel.app/api/entries", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    entry: newEntry,
                    timestamp: new Date().toISOString(),
                    categories: categories.split(",").map((cat) => cat.trim()).filter(Boolean),
                    author: user?.username,
                }),
            });

            if (response.ok) {
                setNewEntry("");
                setCategories("");
                setIsModalOpen(false);
                loadEntries(token);
            } else {
                setError(`Fehler beim Erstellen des Eintrags: ${response.statusText}`);
            }
        } catch (error) {
            setError("Fehler beim Erstellen des Eintrags.");
        }
    };

    useEffect(() => {
        const loadAvatars = async () => {
            const authors = [...new Set(entries.map((entry) => entry.author))];
            const newAvatarUrls: { [key: string]: string } = {};
            for (const author of authors) {
                const avatarUrl = await cacheManager?.getAvatarUrl(author);
                if (avatarUrl) {
                    newAvatarUrls[author] = avatarUrl;
                }
            }
            setAvatarUrls(newAvatarUrls);
        };
        if (cacheManager && entries.length > 0) {
            loadAvatars();
        }
    }, [entries, cacheManager]);

    if (!isLoggedIn) {
        return <LoginPrompt />;
    }

    const totalPages = Math.ceil(entries.length / entriesPerPage);

    return (
        <div className="min-h-screen pt-16 bg-neutral-900 text-neutral-100">
            <div className="max-w-2xl mx-auto px-4 py-10">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-center">Feed</h1>
                </header>

                <div className="mb-8">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>

                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3 px-8"
                    variant="primary"
                >
                    <Plus size={18} className="mr-2" />
                    <span>Neuen Eintrag hinzufügen</span>
                </Button>

                <main className="mt-8">
                    <div className="space-y-4">
                        {uniqueEntries.length > 0 ? (
                            uniqueEntries.map((entry) => (
                                <EntryCard
                                    key={entry.id}
                                    entry={entry}
                                    avatarUrl={avatarUrls[entry.author] || ""}
                                    badges={false}
                                />
                            ))
                        ) : (
                            <p className="text-center text-neutral-500">Noch keine Einträge vorhanden.</p>
                        )}
                    </div>
                </main>

                <footer className="mt-8">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </footer>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Neuen Eintrag erstellen"
                className="w-full bg-neutral-800/80 md:max-w-md"
            >
                <textarea
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    placeholder="Gib hier deinen neuen Eintrag ein..."
                    className="w-full p-3 bg-neutral-700 border resize-none border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-neutral-100"
                    rows={1}
                    minLength={3}
                />

                <input
                    type="text"
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                    placeholder="Füge Kategorien hinzu (kommagetrennt)"
                    className="w-full p-3 h-12 bg-neutral-700 border border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-neutral-100"
                />

                <Button
                    onClick={handleNewEntrySubmit}
                    className="w-full bg-neutral-600 hover:bg-neutral-700 text-neutral-100 font-semibold py-3 px-8 rounded-xl"
                    disabled={!newEntry.trim() || !categories.trim()}
                >
                    Eintrag hinzufügen
                </Button>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </Modal>
        </div>
    );
};

export default Homepage;

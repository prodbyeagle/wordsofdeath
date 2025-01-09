/* eslint-disable react-hooks/exhaustive-deps */
// Homepage.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useCallback, useEffect, useState } from "react";
import { AvatarCacheManager } from "@/lib/avatarCache";
import { fetchEntries as fetchEntriesFromAPI, fetchUserData } from "@/lib/api";
import type { Entry, User } from "@/types";
import Modal from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import { LoginPrompt } from "@/components/mainpage/LoginPrompt";
import { Pagination } from "@/components/mainpage/Pagination";
import { EntryCard } from "@/components/mainpage/EntryCard";
import { MessageCirclePlus } from "lucide-react";

const Homepage = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [uniqueEntries, setUniqueEntries] = useState<Entry[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newEntry, setNewEntry] = useState<string>("");
    const [categories, setCategories] = useState<string>("");
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const entriesPerPage = 25;
    const [avatarCacheManager, setAvatarCacheManager] = useState<AvatarCacheManager | null>(null);

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
            setAvatarCacheManager(new AvatarCacheManager(fetchUserDataFromCache));
        } else {
            console.warn("No token found.");
        }
    }, []);

    const fetchUserDataFromCache = useCallback(async (author: string): Promise<string | null> => {
        return await fetchUserData(author, avatarCacheManager);
    }, [avatarCacheManager]);

    useEffect(() => {
        const loadAvatars = async () => {
            const authors = [...new Set(entries.map((entry) => entry.author))];
            for (const author of authors) {
                await avatarCacheManager?.getAvatarUrl(author);
            }
        };
        if (avatarCacheManager) {
            loadAvatars();
        }
    }, [entries, avatarCacheManager]);

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
            const response = await fetch("http://localhost:3001/api/entries", {
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

    if (!isLoggedIn) {
        return <LoginPrompt />;
    }

    const totalPages = Math.ceil(entries.length / entriesPerPage);

    return (
        <div className="min-h-screen bg-zinc-900 text-white">
            <div className="max-w-2xl mx-auto px-4 py-10">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-center">Feed</h1>
                </header>

                <div className="sticky top-4 z-10 space-y-4 backdrop-blur-lg bg-zinc-900/80 p-4 rounded-xl">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 duration-100 transition-all border-2 border-green-600 rounded-xl shadow-lg text-white font-semibold py-3 px-8"
                >
                    <MessageCirclePlus className="w-5 h-5" />
                    <span>Neuen Eintrag hinzufügen</span>
                </button>

                <main className="mt-8">
                    <div className="space-y-4">
                        {uniqueEntries.length > 0 ? (
                            uniqueEntries.map((entry) => (
                                <EntryCard
                                    key={entry.id}
                                    entry={entry}
                                    user={user}
                                    avatarUrl={avatarCacheManager?.getAvatarCache()?.[entry.author] || ""}
                                    userRoles={avatarCacheManager?.getRoles(entry.author) || []}
                                />
                            ))
                        ) : (
                            <p className="text-center text-zinc-500">Noch keine Einträge vorhanden.</p>
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
                className="w-full bg-zinc-800/80 md:max-w-md"
            >
                <textarea
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    placeholder="Gib hier deinen neuen Eintrag ein..."
                    className="w-full p-3 bg-zinc-700 border resize-none border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-white"
                    rows={1}
                    minLength={3}
                />

                <input
                    type="text"
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                    placeholder="Füge Kategorien hinzu (kommagetrennt)"
                    className="w-full p-3 h-12 bg-zinc-700 border border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-white"
                />

                <button
                    onClick={handleNewEntrySubmit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl"
                >
                    Eintrag hinzufügen
                </button>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </Modal>
        </div>
    );
};

export default Homepage;

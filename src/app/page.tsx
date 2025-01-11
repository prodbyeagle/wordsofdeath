/* eslint-disable react-hooks/exhaustive-deps */
// Homepage.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from "react";
import { CacheManager } from "@/lib/avatarCache";
import { createEntry, fetchEntries as fetchEntriesFromAPI, fetchSomeEntries, getAuthToken } from "@/lib/api";
import type { Entry, User } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import { LoginPrompt } from "@/components/mainpage/LoginPrompt";
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
    const [loading, setLoading] = useState<boolean>(false);
    const entriesPerPage = 10;
    const [cacheManager, setCacheManager] = useState<CacheManager | null>(null);
    const [avatarUrls, setAvatarUrls] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            setIsLoggedIn(true);
            loadEntries(token);
            setCacheManager(new CacheManager());
        } else {
            console.warn("No token found.");
        }
    }, []);

    useEffect(() => {
        if (cacheManager && entries.length > 0) {
            const loadAvatars = async () => {
                const authors = [...new Set(entries.map((entry) => entry.author))];
                const newAvatarUrls: { [key: string]: string } = {};
                for (const author of authors) {
                    const avatarUrl = await cacheManager.getAvatarUrl(author);
                    if (avatarUrl) {
                        newAvatarUrls[author] = avatarUrl;
                    }
                }
                setAvatarUrls(newAvatarUrls);
            };
            loadAvatars();
        }
    }, [entries, cacheManager]);

    const loadEntries = async (token: string): Promise<Entry[]> => {
        const fetchedEntries = await fetchEntriesFromAPI(token);
        setEntries(fetchedEntries);
        setUniqueEntries(fetchedEntries);
        return fetchedEntries;
    };

    const handleScroll = () => {
        const bottom =
            window.innerHeight + document.documentElement.scrollTop ===
            document.documentElement.offsetHeight;
        if (bottom && !loading) {
            setLoading(true);
            loadMoreEntries();
        }
    };


    const loadMoreEntries = async () => {
        const token = getAuthToken();

        if (!token) {
            console.error("Kein Token gefunden.");
            return;
        }

        try {
            setLoading(true);
            const newEntries = await fetchSomeEntries(token, entriesPerPage);

            console.log("Neue Einträge:", newEntries);

            if (newEntries.length > 0) {
                setEntries((prevEntries) => {
                    const updatedEntries = [...prevEntries, ...newEntries];
                    setUniqueEntries(updatedEntries);
                    return updatedEntries;
                });
            } else {
                console.log("Keine neuen Einträge.");
            }
        } catch (error) {
            console.error("Fehler beim Abrufen von Einträgen:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [loading]);

    useEffect(() => {
        setUniqueEntries(entries.slice(0, entriesPerPage));
    }, [entries]);

    const handleNewEntrySubmit = async () => {
        if (!newEntry.trim()) {
            setError("Entry cannot be empty.");
            return;
        }

        const errorMessage = await createEntry(newEntry, categories, user);

        if (errorMessage) {
            setError(errorMessage);
        } else {
            setNewEntry("");
            setCategories("");
            setIsModalOpen(false);
            loadEntries(document.cookie.split("; ").find((row) => row.startsWith("wordsofdeath="))?.split("=")[1] || "");
        }
    };

    if (!isLoggedIn) {
        return <LoginPrompt modal={false} />;
    }

    return (
        <div className="min-h-screen pt-16 bg-neutral-900 text-neutral-100">
            <div className="max-w-2xl mx-auto px-4 py-10">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-center">Feed</h1>
                </header>

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
                            uniqueEntries.map((entry, index) => (
                                <EntryCard
                                    key={`${entry.id}-${index}`}
                                    entry={entry}
                                    avatar={avatarUrls[entry.author] || ''}
                                    userRoles={cacheManager?.getRoles(entry.author) || []}
                                    tooltip={false}
                                />
                            ))
                        ) : (
                            <p className="text-center text-neutral-500">Noch keine Einträge vorhanden.</p>
                        )}

                        {loading && <p className="text-center text-neutral-500">Lade mehr Einträge...</p>}
                    </div>
                </main>
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

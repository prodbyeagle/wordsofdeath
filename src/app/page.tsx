/* eslint-disable react-hooks/exhaustive-deps */
// Homepage.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from "react";
import { CacheManager } from "@/lib/avatarCache";
import { createEntry, fetchEntries, getAuthToken, deleteEntry, fetchAdminStatus } from "@/lib/api";
import type { Entry, User } from "@/types";
import { Dialog } from "@/components/ui/Dialog";
import { useRouter } from "next/navigation";
import { LoginPrompt } from "@/components/feed/LoginPrompt";
import { Pagination } from "@/components/feed/Pagination";
import { EntryCard } from "@/components/feed/EntryCard";
import { Pencil, Plus, Search, Send, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const Homepage = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [uniqueEntries, setUniqueEntries] = useState<Entry[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [newEntry, setNewEntry] = useState<string>("");
    const [categories, setCategories] = useState<string>("");
    const [user] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const entriesPerPage = 15;
    const [cacheManager, setCacheManager] = useState<CacheManager | null>(null);
    const [avatarUrls, setAvatarUrls] = useState<{ [key: string]: string }>({});
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get("p");
        setPage(pageParam ? parseInt(pageParam, 15) : 1);
    }, []);

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            setIsLoggedIn(true);
            loadEntries(token);
            setCacheManager(new CacheManager());
            fetchAdminStatus(token).then(status => setIsAdmin(status));
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
        const fetchedEntries = await fetchEntries(token);
        setEntries(fetchedEntries);
        setFilteredEntries(fetchedEntries);
        return fetchedEntries;
    };

    useEffect(() => {
        const startIdx = (page - 1) * entriesPerPage;
        const endIdx = startIdx + entriesPerPage;
        setUniqueEntries(filteredEntries.slice(startIdx, endIdx));
    }, [page, filteredEntries]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        router.push(`/?p=${newPage}`, undefined);
    };

    const handleNewEntrySubmit = async () => {
        const errorMessage = await createEntry(newEntry, categories, user) as string | null;

        if (errorMessage) {
            setError(errorMessage);
        } else {
            setNewEntry("");
            setCategories("");
            setIsDialogOpen(false);
            const authToken = getAuthToken();
            if (authToken) {
                loadEntries(authToken);
            } else {
                console.error("Auth token is null or undefined");
            }
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            setFilteredEntries(entries);
        } else {
            setFilteredEntries(
                entries.filter(
                    (entry) =>
                        entry.entry.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    };

    if (!isLoggedIn) {
        return <LoginPrompt dialog={false} />;
    }

    const totalPages = Math.ceil(entries.length / entriesPerPage);

    const handleDelete = async (id: string) => {
        const authToken = getAuthToken();
        if (!authToken) {
            console.error("Auth token is null or undefined");
            return;
        }

        const errorMessage = await deleteEntry(authToken, id);
        if (errorMessage !== null) {
            console.error("Fehler beim Löschen des Eintrags:", errorMessage);
            return;
        }

        setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
    };

    return (
        <div className="min-h-screen pt-16 bg-neutral-900 text-neutral-100">
            <div className="max-w-2xl mx-auto px-4 py-10">
                <header className="mb-6">
                    <h1 className="text-4xl font-bold text-center">Feed</h1>
                </header>

                <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="flex-1 w-full md:w-auto">
                        <Input
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            icon={Search}
                            placeholder="Durchsuche WordsOfDeath..."
                        />
                    </div>
                    <div className="flex-shrink-0 w-full md:w-2/6">
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="w-full"
                            variant="primary"
                            content="Add Entry"
                            icon={Plus}
                        >
                        </Button>
                    </div>
                </div>

                <main className="mt-6">
                    <div className="space-y-3">
                        {uniqueEntries.length > 0 ? (
                            uniqueEntries.map((entry) => (
                                <EntryCard
                                    key={entry.id}
                                    entry={entry}
                                    avatar={avatarUrls[entry.author] || ''}
                                    userRoles={cacheManager?.getRoles(entry.author) || []}
                                    tooltip={false}
                                    isAdmin={isAdmin}
                                    onDelete={handleDelete}
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

            <Dialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Neuen Eintrag erstellen"
                className="w-full md:max-w-md"
            >
                <Input
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    placeholder="Gib hier deinen neuen Eintrag ein..."
                    className="w-full mb-4"
                    icon={Pencil}
                />

                <Input
                    type="text"
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                    placeholder="Füge Kategorien hinzu (kommagetrennt)"
                    className="w-full mb-4"
                    icon={Tag}
                />

                <Button
                    onClick={handleNewEntrySubmit}
                    variant="primary"
                    className="w-full"
                    icon={Send}
                    content="Eintrag hinzufügen"
                    disabled={newEntry.trim().length < 3 || !categories.trim()}
                >
                </Button>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </Dialog>
        </div>
    );
};

export default Homepage;

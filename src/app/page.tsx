/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useCallback, useEffect, useState } from "react";
import type { Entry, User } from "@/types";
import Modal from "@/components/Modal";
import { useRouter } from 'next/navigation';
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
    const [newEntry, setNewEntry] = useState<string>('');
    const [entryType, setEntryType] = useState<string>('word');
    const [categories, setCategories] = useState<string>('');
    const [variation, setVariation] = useState<string>('');
    const [user] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const entriesPerPage = 25;
    const [avatarCache, setAvatarCache] = useState<{ [username: string]: string }>({});
    const [userRoles, setUserRoles] = useState<{ [username: string]: string[] }>({});

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        setPage(pageParam ? parseInt(pageParam, 25) : 1);
    }, []);

    useEffect(() => {
        const cookies = document.cookie.split('; ');
        const token = cookies.find(row => row.startsWith('wordsofdeath='));
        if (token) {
            setIsLoggedIn(true);
            fetchEntries();
        } else {
            console.warn("No token found.");
        }
    }, []);

    const fetchUserData = useCallback(async (author: string): Promise<User | null> => {
        if (avatarCache[author]) return null;

        try {
            const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/user/u/${author}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${document.cookie.split('=')[1]}`,
                },
            });

            if (!response.ok) {
                console.error(`Failed to fetch user data for ${author}`);
                throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            const avatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}`;

            setAvatarCache((prevCache) => ({ ...prevCache, [author]: avatarUrl }));
            setUserRoles((prevRoles) => ({ ...prevRoles, [author]: userData.roles || [] }));

            return userData;
        } catch (error) {
            console.error('Error fetching avatar:', error);
            return null;
        }
    }, [avatarCache, setUserRoles]);

    useEffect(() => {
        const loadAvatars = async () => {
            const authors = [...new Set(entries.map(entry => entry.author))];
            const avatarsToLoad = authors.filter(author => !avatarCache[author]);

            for (const author of avatarsToLoad) {
                await fetchUserData(author);
            }
        };
        loadAvatars();
    }, [entries, avatarCache, fetchUserData]);


    const fetchEntries = async () => {
        try {
            const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/entries`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${document.cookie.split('=')[1]}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch entries');

            const data: Entry[] = await response.json();

            if (Array.isArray(data)) {
                const unique = data.filter(
                    (entry, index, self) =>
                        index === self.findIndex((e) => e.id === entry.id)
                );
                setEntries(unique);
                setUniqueEntries(unique.slice(0, entriesPerPage));
            } else {
                throw new Error('Invalid entries data format');
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
        }
    };

    useEffect(() => {
        const startIdx = (page - 1) * entriesPerPage;
        const endIdx = startIdx + entriesPerPage;
        setUniqueEntries(entries.slice(startIdx, endIdx));
    }, [page, entries]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        router.push(
            `/?page=${newPage}`,
            undefined
        );
    };

    const handleNewEntrySubmit = async () => {
        const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];
        if (!token || !newEntry.trim()) {
            setError("Kein Token oder leerer Eintrag.");
            return;
        }

        try {
            const response = await fetch('https://wordsofdeath-backend.vercel.app/api/entries', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    entry: newEntry,
                    type: entryType,
                    timestamp: new Date().toISOString(),
                    categories: categories.split(',').map(cat => cat.trim()).filter(Boolean),
                    author: user?.username,
                    variation: variation.trim() ? variation.split(',').map(var1 => var1.trim()).filter(Boolean) : [],
                }),
            });

            if (response.ok) {
                setNewEntry('');
                setCategories('');
                setVariation('');
                setIsModalOpen(false);
                fetchEntries();
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
                                    avatarUrl={avatarCache[entry.author]}
                                    userRoles={userRoles[entry.author]}
                                />
                            ))
                        ) : (
                            <p className="text-center text-zinc-500">
                                Noch keine Einträge vorhanden.
                            </p>
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
                <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value)}
                    className="w-full p-3 h-12 bg-zinc-700 border border-neutral-600 rounded-lg mb-4 text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-zinc-600 transition-all duration-200 ease-in-out"
                >
                    <option value="word" className="bg-zinc-700 hover:bg-zinc-600 p-2 rounded-lg">Wort</option>
                    <option value="sentence" className="bg-zinc-700 hover:bg-zinc-600 p-2 rounded-lg">Satz</option>
                </select>
                <input
                    type="text"
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                    placeholder="Kategorien min. 1 (durch Komma getrennt)"
                    className="w-full p-3 bg-zinc-700 border border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-white"
                    minLength={3}
                />
                <input
                    type="text"
                    value={variation}
                    onChange={(e) => setVariation(e.target.value)}
                    placeholder="Variationen [nicht nötig] (durch Komma getrennt)"
                    className="w-full p-3 bg-zinc-700 border border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-white"
                    minLength={3}
                />
                <button
                    onClick={handleNewEntrySubmit}
                    disabled={newEntry.trim() === '' || categories.trim() === ''}
                    className={`w-full py-3 ${newEntry.trim() === '' || categories.trim() === '' ? 'border border-zinc-600 bg-transparent cursor-default text-zinc-500' : 'bg-blue-500 hover:bg-blue-600 border border-blue-500 text-zinc-200'} rounded-lg font-medium transition-all duration-150`}
                >
                    Eintrag erstellen
                </button>
                {error && <div className="text-red-500 text-center mt-4">{error}</div>}
            </Modal>
        </div>
    );
};

export default Homepage;
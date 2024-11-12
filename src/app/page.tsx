/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection JSIgnoredPromiseFromCall

'use client';

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { Entry, User } from "@/types";
import Link from 'next/link';
import Modal from "@/components/Modal";
import { useRouter } from 'next/navigation';
import { BadgeCheck, CircleUserRound, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

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
    const entriesPerPage = 10;
    const [avatarCache, setAvatarCache] = useState<{ [username: string]: string }>({});
    const [userRoles, setUserRoles] = useState<{ [username: string]: string[] }>({});

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        setPage(pageParam ? parseInt(pageParam, 10) : 1);
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
            const avatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;

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
        return (
            <div className="min-h-screen bg-zinc-800 text-white flex flex-col items-center justify-center">
                <div className="bg-zinc-900 p-8 rounded-xl shadow-lg border border-zinc-600 text-center mb-10">
                    <h1 className="text-4xl font-bold mb-4">Du bist nicht eingeloggt!</h1>
                    <p className="text-lg text-zinc-400 mb-6">Bitte melde dich an, um die Plattform zu nutzen.</p>
                    <Link href="/signin">
                        <button
                            className="bg-[#d683ff] hover:bg-[#aa6dc9] border-2 border-[#d683ff] text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-200">
                            Anmelden
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const totalPages = Math.ceil(entries.length / entriesPerPage);

    const renderPagination = () => {
        const maxPagesToShow = 3;

        let pageNumbers: (string | number)[] = [];
        if (totalPages <= maxPagesToShow + 2) {
            pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            if (page <= maxPagesToShow) {
                pageNumbers = [...Array.from({ length: maxPagesToShow }, (_, i) => i + 1), '...', totalPages];
            } else if (page > totalPages - maxPagesToShow) {
                pageNumbers = [1, '...', ...Array.from({ length: maxPagesToShow }, (_, i) => totalPages - maxPagesToShow + i + 1)];
            } else {
                pageNumbers = [1, '...', page, '...', totalPages];
            }
        }

        return (
            <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-md border-2 border-[#d683ff] ${page === 1 ? 'bg-zinc-900 border-zinc-900 text-zinc-500' : 'bg-[#d683ff] hover:bg-[#aa6dc9] text-white'
                        } transition-colors duration-200`}
                >
                    Previous
                </button>

                {pageNumbers.map((num, index) =>
                    num === '...' ? (
                        <span key={index} className="px-3 py-1 text-zinc-400">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => handlePageChange(num as number)}
                            className={`px-3 py-1 rounded-md border-2 border-[#d683ff] ${page === num ? 'bg-[#d683ff] text-white' : 'bg-zinc-700 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                                } hover:bg-[#aa6dc9] transition-colors duration-200`}
                        >
                            {num}
                        </button>
                    )
                )}

                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded-md border-2 border-[#d683ff] ${page === totalPages ? 'bg-zinc-900 border-zinc-900 text-zinc-500' : 'bg-[#d683ff] hover:bg-[#aa6dc9] text-white'
                        } transition-colors duration-200`}
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center py-10">
            <div className="max-w-2xl w-full px-2">
                <h2 className="text-4xl font-bold mb-8 text-center">Feed</h2>

                <div className="mb-4">{renderPagination()}</div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mb-8 w-full bg-green-600 hover:bg-green-700 duration-100 transition-all border-2 border-green-600 rounded-lg shadow-lg text-white font-semibold py-3 px-8"
                >
                    + Neuen Eintrag hinzufügen
                </button>


                <div className="flex flex-col space-y-4">
                    {uniqueEntries.length > 0 ? (
                        uniqueEntries.map((entry) => (
                            <Link key={entry.id} href={`/e/${entry.id}`} passHref>
                                <div
                                    className="bg-zinc-700 p-6 rounded-md shadow-md hover:rounded-2xl hover:bg-zinc-800 duration-300 hover:shadow-4xl hover:scale-[1.03] hover:border-l-green-500 transition-all border-2 border-zinc-700 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        {avatarCache[entry.author] ? (
                                            <Image
                                                src={avatarCache[entry.author]}
                                                alt={`${entry.author}'s avatar`}
                                                className="w-6 h-6 rounded-full"
                                                width={28}
                                                height={28}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "";
                                                }}
                                            />
                                        ) : (
                                            <CircleUserRound size={28} className="text-zinc-400" />
                                        )}
                                        <span className="text-zinc-300 font-medium">@{entry.author}</span>
                                        <div className="-space-x-1 flex flex-row items-center">
                                            {userRoles[entry.author]?.includes('admin') && (
                                                <BadgeCheck
                                                    className="text-blue-400 cursor-default rounded-md duration-100 transition-all"
                                                    size={14} aria-label="Admin Badge" />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-lg font-medium mb-2">{entry.entry}</p>
                                    <div className="text-sm text-zinc-400 flex items-center space-x-1">
                                        <Clock size={14} className="text-zinc-400" />
                                        <p className="text-sm text-zinc-400">
                                            {formatDistanceToNow(new Date(entry.timestamp), {
                                                addSuffix: true,
                                                locale: de
                                            })} erstellt.
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-center text-zinc-500">Noch keine Einträge vorhanden.</p>
                    )}
                </div>
                {renderPagination()}
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
                    maxLength={72}
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
                    placeholder="Kategorien (durch Komma getrennt)"
                    className="w-full p-3 bg-zinc-700 border border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-white"
                    maxLength={32}
                    minLength={3}
                />
                <input
                    type="text"
                    value={variation}
                    onChange={(e) => setVariation(e.target.value)}
                    placeholder="Variationen (durch Komma getrennt)"
                    className="w-full p-3 bg-zinc-700 border border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-white"
                    maxLength={32}
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

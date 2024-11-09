/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Entry, User } from "@/types";
import Link from 'next/link';
import Modal from "@/components/Modal";
import { useRouter } from 'next/navigation';
import { Clock, User as UserIcon, BrainCog, BadgeCheck } from "lucide-react";

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
         const response = await fetch(`http://localhost:3001/user/u/${author}`, {
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
         const response = await fetch(`http://localhost:3001/api/entries`, {
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
         setError("[SERVER]: Kein Token oder leerer Eintrag.");
         return;
      }

      try {
         const response = await fetch('http://localhost:3001/api/entries', {
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
            setError(`[SERVER]: Fehler beim Erstellen des Eintrags: ${response.statusText}`);
         }
      } catch (error) {
         setError("[SERVER]: Fehler beim Erstellen des Eintrags.");
      }
   };

   const getRelativeTime = (timestamp: string): string => {
      const now = new Date();
      const entryTime = new Date(timestamp);
      const secondsAgo = Math.floor((now.getTime() - entryTime.getTime()) / 1000);

      const daysAgo = Math.floor(secondsAgo / (3600 * 24));
      if (daysAgo > 0) {
         return `Erstellt vor: ${daysAgo} Tag${daysAgo === 1 ? '' : 'en'}`;
      }

      const hoursAgo = Math.floor(secondsAgo / 3600);
      if (hoursAgo > 0) {
         return `Erstellt vor: ${hoursAgo} Stunde${hoursAgo === 1 ? '' : 'n'}`;
      }

      const minutesAgo = Math.floor(secondsAgo / 60);
      if (minutesAgo > 0) {
         return `Erstellt vor: ${minutesAgo} Minute${minutesAgo === 1 ? '' : 'n'}`;
      }

      return `Erstellt vor: Jetzt`;
   };

   if (!isLoggedIn) {
      return (
         <div className="min-h-screen bg-zinc-800 text-white flex flex-col items-center justify-center">
            <div className="bg-zinc-900 p-8 rounded-xl shadow-lg border border-zinc-600 text-center mb-10">
               <h1 className="text-4xl font-bold mb-4">Du bist nicht eingeloggt!</h1>
               <p className="text-lg text-zinc-400 mb-6">Bitte melde dich an, um die Plattform zu nutzen.</p>
               <Link href="/signin">
                  <button className="bg-[#d683ff] hover:bg-[#aa6dc9] border-2 border-[#d683ff] text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-200">
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
                        <div className="bg-zinc-700 p-6 rounded-lg shadow-md hover:bg-zinc-800 duration-300 hover:shadow-4xl hover:scale-110 transition-all border-2 border-zinc-700 cursor-pointer">
                           <Link href={`/u/${entry.author}`} passHref>
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
                                    <UserIcon size={28} className="text-zinc-400" />
                                 )}
                                 <span className="cursor-pointer hover:text-violet-300 hover:font-semibold duration-300 transition-all">@{entry.author}</span>
                                 <div className="-space-x-1 flex flex-row items-center">
                                    {userRoles[entry.author]?.includes('admin') && (
                                       <BadgeCheck className="p-1 text-blue-500" size={24} aria-label="Admin Badge" />
                                    )}
                                    {userRoles[entry.author]?.includes('developer') && (
                                       <BrainCog className="p-1 text-neutral-300" size={24} aria-label="Developer Badge" />
                                    )}
                                 </div>
                              </div>
                           </Link>
                           <p className="text-lg font-medium mb-2">{entry.entry}</p>
                           <div className="text-sm text-zinc-400 flex items-center space-x-2">
                              <Clock size={20} className="text-zinc-400" />
                              <span>{getRelativeTime(entry.timestamp)}</span>
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
               className="w-full p-3 bg-zinc-700 border-2 resize-none border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-white"
               rows={1}
               maxLength={72}
               minLength={3}
            />
            <select
               value={entryType}
               onChange={(e) => setEntryType(e.target.value)}
               className="w-full p-3 h-12 bg-zinc-700 border-2 border-neutral-600 rounded-lg mb-4 text-white"
            >
               <option value="word">Wort</option>
               <option value="sentence">Satz</option>
            </select>
            <input
               type="text"
               value={categories}
               onChange={(e) => setCategories(e.target.value)}
               placeholder="Kategorien (durch Komma getrennt)"
               className="w-full p-3 bg-zinc-700 border-2 border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-white"
            />
            <input
               type="text"
               value={variation}
               onChange={(e) => setVariation(e.target.value)}
               placeholder="Variationen (durch Komma getrennt)"
               className="w-full p-3 bg-zinc-700 border-2 border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-white"
            />
            <button
               onClick={handleNewEntrySubmit}
               className="w-full py-3 bg-blue-500 hover:bg-blue-600 border-2 border-blue-500 rounded-lg shadow-md text-white font-medium transition-all duration-150"
            >
               Eintrag erstellen
            </button>
            {error && <div className="text-red-500 text-center mt-4">{error}</div>}
         </Modal>
      </div>
   );
};

export default Homepage;

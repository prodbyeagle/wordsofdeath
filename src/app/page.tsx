/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from "react";
import { Entry, User } from "@/types";
import Link from 'next/link';
import Modal from "@/components/Modal";

const Homepage = () => {
   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
   const [entries, setEntries] = useState<Entry[]>([]);
   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
   const [newEntry, setNewEntry] = useState<string>('');
   const [entryType, setEntryType] = useState<string>('word');
   const [categories, setCategories] = useState<string>('');
   const [variation, setVariation] = useState<string>('');
   const [user, setUser] = useState<User | null>(null);
   const [error, setError] = useState<string | null>(null);

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

   const fetchEntries = async () => {
      try {
         const response = await fetch('http://localhost:3001/api/entries', {
            method: 'GET',
            headers: {
               'Authorization': `Bearer ${document.cookie.split('=')[1]}`,
            },
         });

         if (!response.ok) {
            throw new Error('Failed to fetch entries');
         }

         const data = await response.json();
         setEntries(data);
      } catch (error) {
         console.error('Error fetching entries:', error);
      }
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
               categories: categories.split(',').map(cat => cat.trim()),
               author: user?.username,
               variation: variation.trim() ? variation.split(',').map(var1 => var1.trim()) : [],
            }),
         });

         if (response.ok) {
            setNewEntry('');
            setCategories('');
            setVariation('');
            setIsModalOpen(false);
            fetchEntries(); // refresh entries after adding a new one
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

      return `Erstellt vor: 100 Lichtjahren`;
   };

   const getAvatarUrl = (id: string, avatar: string): string => {
      return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
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

   return (
      <div className="min-h-screen bg-zinc-800 text-white flex flex-col items-center py-10">
         <div className="max-w-2xl w-full px-2">
            <h2 className="text-4xl font-bold mb-8 text-center">Feed</h2>

            <button
               onClick={() => setIsModalOpen(true)}
               className="mb-8 bg-green-600 hover:bg-green-700 duration-100 transition-all border-2 border-green-600 rounded-lg shadow-lg text-white font-semibold py-3 px-8"
            >
               + Neuen Eintrag hinzufügen
            </button>

            <div className="flex flex-col space-y-6">
               {entries.length > 0 ? (
                  [...entries].reverse().map((entry) => (
                     <Link key={entry.id} href={`/e/${entry.id}`}>
                        <div className="bg-zinc-600 p-6 rounded-lg shadow-md hover:bg-zinc-700 duration-100 transition-all border-2 border-zinc-600 cursor-pointer">
                           <p className="text-lg font-medium mb-2">{entry.entry}</p>
                           <div className="text-sm text-zinc-400 flex justify-between">
                              <span>Von {entry.author}</span>
                              <span>{getRelativeTime(entry.timestamp)}</span>
                           </div>
                        </div>
                     </Link>
                  ))
               ) : (
                  <p className="text-center text-zinc-500">Noch keine Einträge vorhanden.</p>
               )}
            </div>
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

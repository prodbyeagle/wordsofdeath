/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from "react";
import type { User } from "@/types";
import Modal from "@/components/Modal";

const Library = () => {
   const [error, setError] = useState<string | null>(null);
   const [loading, setLoading] = useState<boolean>(true);
   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
   const [newEntry, setNewEntry] = useState<string>('');
   const [entryType, setEntryType] = useState<string>('word');
   const [categories, setCategories] = useState<string>('');
   const [variation, setVariation] = useState<string>('');
   const [user, setUser] = useState<User | null>(null);

   // const getAvatarUrl = (user: User | null): string => {
   //    return user ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '/placeholder-avatar.png';
   // };

   useEffect(() => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='))?.split('=')[1];
      if (!token) {
         setError("[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden.");
         setLoading(false);
         return;
      }

      try {
         const payload = JSON.parse(atob(token.split('.')[1])) as User;
         setUser(payload);
      } catch (error) {
         setError("[SERVER]: Fehler beim Verarbeiten des Tokens.");
      } finally {
         setLoading(false);
      }
   }, []);

   const handleNewEntrySubmit = async () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='))?.split('=')[1];
      if (!token || !newEntry.trim()) {
         setError("[SERVER]: Kein Token oder leerer Eintrag.");
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
         } else {
            setError(`[SERVER]: Fehler beim Erstellen des Eintrags: ${response.statusText}`);
         }
      } catch (error) {
         setError("[SERVER]: Fehler beim Erstellen des Eintrags.");
      }
   };

   return (
      <div className="flex h-screen bg-zinc-800 items-center justify-center text-white">
         <div className="w-full max-w-3xl p-8 bg-zinc-900 shadow-lg rounded-2xl border border-zinc-600 transition-all duration-300 hover:shadow-xl mx-2">
            <h1 className="text-4xl font-bold text-center text-white mb-6">Neuen Eintrag erstellen</h1>
            <button
               onClick={() => setIsModalOpen(true)}
               className="w-full py-3 bg-green-600 hover:bg-green-700 border-2 border-green-600 rounded-lg shadow-lg text-white font-semibold transition-all duration-150 mb-6"
            >
               + Neuen Eintrag hinzufügen
            </button>

            {loading && (
               <div className="flex justify-center items-center h-64">
                  <div className="loader text-lg font-medium text-gray-300">Lade...</div>
               </div>
            )}
            {error && (
               <div className="text-red-500 text-center text-lg font-medium">{error}</div>
            )}
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
         </Modal>
      </div>
   );
};

export default Library;

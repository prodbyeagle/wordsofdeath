'use client'

import { useState, useEffect } from 'react';
import { Entry, Whitelist } from '@/types';
import { Trash, UserPlus, UserRoundCog } from 'lucide-react';
import Modal from '@/components/Modal';
import Tooltip from '@/components/Tooltip';
import Link from 'next/link';
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const Admin = () => {
   const [whitelistedUsers, setWhitelistedUsers] = useState<Whitelist[]>([]);
   const [entries, setEntries] = useState<Entry[]>([]);
   const [newUser, setNewUser] = useState('');
   const [isAdmin, setIsAdmin] = useState(false);
   const [loading, setLoading] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);

   useEffect(() => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];
      if (!token) {
         return;
      }

      const fetchUserStatus = async () => {
         try {
            const response = await fetch("http://localhost:3001/auth/admin", {
               method: 'GET',
               headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Fehler beim Überprüfen des Admin-Status.");
            const data = await response.json();
            setIsAdmin(data.isAdmin);
            if (!data.isAdmin)
               throw new Error("User is not admin!")
         } catch (error) {
            console.error("Fehler beim Überprüfen des Admin-Status:", error);
         }
      };

      const fetchUsersAndEntries = async () => {
         setLoading(true);
         try {
            const [usersResponse, entriesResponse] = await Promise.all([
               fetch("http://localhost:3001/api/whitelist", { headers: { 'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1]}` } }),
               fetch("http://localhost:3001/api/entries", { headers: { 'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1]}` } }),
            ]);

            if (!usersResponse.ok || !entriesResponse.ok) throw new Error("Fehler beim Abrufen der Daten.");
            setWhitelistedUsers(await usersResponse.json());
            setEntries(await entriesResponse.json());
         } catch (error) {
            console.error("Fehler beim Abrufen der Daten:", error);
         } finally {
            setLoading(false);
         }
      };

      if (isAdmin) {
         fetchUsersAndEntries();
      } else {
         fetchUserStatus();
      }
   }, [isAdmin]);

   const addUserToWhitelist = async () => {
      if (!newUser.trim()) return;
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];
      try {
         const response = await fetch("http://localhost:3001/api/whitelist", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newUser }),
         });

         if (!response.ok) throw new Error("Fehler beim Hinzufügen des Benutzers.");
         const newUserData = await response.json();
         setWhitelistedUsers(prev => [...prev, newUserData]);
         setNewUser("");
         setIsModalOpen(false);
      } catch (error) {
         console.error("Fehler beim Hinzufügen des Benutzers:", error);
      }
   };

   const removeUserFromWhitelist = async (username: string) => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];
      try {
         const response = await fetch(`http://localhost:3001/api/whitelist/${username}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
         });

         if (!response.ok) throw new Error("Fehler beim Entfernen des Benutzers.");
         setWhitelistedUsers(prev => prev.filter(user => user.username !== username));
      } catch (error) {
         console.error("Fehler beim Entfernen des Benutzers:", error);
      }
   };

   const deleteEntry = async (entryId: string) => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];
      try {
         const response = await fetch(`http://localhost:3001/api/entries/${entryId}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` },
         });

         if (!response.ok) throw new Error("Fehler beim Löschen des Eintrags.");
         setEntries(prev => prev.filter(entry => entry.id !== entryId));
      } catch (error) {
         console.error("Fehler beim Löschen des Eintrags:", error);
      }
   };

   return (
      <div className="bg-zinc-800 min-h-screen text-white p-8">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold">WordsOfDeath Admin Dashboard</h1>
            <button
               onClick={() => setIsModalOpen(true)} // Modal öffnen
               className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center space-x-2 transition"
            >
               <UserPlus className="w-5 h-5" />
               <span>Benutzer Hinzufügen</span>
            </button>
         </div>

         <h2 className="text-xl font-semibold mb-4">Whitelist Users</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whitelistedUsers.map(user => (
               <div key={user._id} className="bg-zinc-700 p-3 cursor-default rounded-md shadow-md hover:rounded-2xl hover:bg-zinc-800 duration-300 hover:shadow-4xl hover:scale-[1.03] transition-all border-2 border-zinc-700">
                  <h4 className="text-lg font-semibold mb-2">{user.username}</h4>
                  <div className="flex justify-between">
                     <button
                        onClick={() => removeUserFromWhitelist(user.username)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition flex items-center space-x-2"
                     >
                        <Trash size={16} />
                     </button>
                     <Link
                        href={`/u/${user.username}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition flex items-center space-x-2"
                     >
                        <UserRoundCog size={16} />
                     </Link>
                  </div>
               </div>
            ))}
         </div>

         {loading && <div>Loading...</div>}

         <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Einträge</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {entries.map(entry => (
                  <Tooltip delay={500} fontSize='text-base' position='top' key={entry._id} content={entry.entry}>
                     <div key={entry.id} className="bg-zinc-700 cursor-default p-6 rounded-md shadow-md hover:rounded-2xl hover:bg-zinc-800 duration-300 hover:shadow-4xl hover:scale-[1.03] transition-all border-2 border-zinc-700">
                        <h4 className="text-lg font-semibold mb-2 truncate">{entry.entry}</h4>
                        <div className="text-sm text-zinc-400 mb-2">
                           <p className='italic' >{formatDistanceToNow(new Date(entry.timestamp), { includeSeconds: true, addSuffix: true, locale: de })}{" "} erstellt.</p>
                           <p>Von: @{entry.author}</p>
                        </div>
                        <button
                           onClick={() => deleteEntry(entry.id)}
                           className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition flex items-center space-x-2"
                        >
                           <Trash size={16} />
                        </button>
                     </div>
                  </Tooltip>
               ))}
            </div>
         </div>

         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Benutzer hinzufügen">
            <div>
               <input
                  type="text"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  placeholder="dwhincandi ..."
                  className="w-full p-3 bg-zinc-700 border border-neutral-600 rounded-lg mb-4 placeholder-gray-400 text-white"
               />
               <button
                  onClick={addUserToWhitelist}
                  disabled={newUser.length < 3}
                  className={`w-full py-3 ${newUser.length < 3 ? 'border border-zinc-600 bg-transparent cursor-default text-zinc-500' : 'bg-blue-500 hover:bg-blue-600 border border-blue-500 text-zinc-200'} rounded-lg font-medium transition-all duration-150`}
               >
                  Hinzufügen
               </button>
            </div>
         </Modal>
      </div>
   );
};

export default Admin;

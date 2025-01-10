'use client'

import { useState, useEffect } from 'react';
import { Entry, Whitelist } from '@/types';
import { Trash, UserPlus, UserRoundCog, Users, BookText, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Tooltip } from '@/components/ui/Tooltip';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TimeStamp } from '@/components/ui/Timestamp';

const Admin = () => {
   const [whitelistedUsers, setWhitelistedUsers] = useState<Whitelist[]>([]);
   const [entries, setEntries] = useState<Entry[]>([]);
   const [newUser, setNewUser] = useState('');
   const [isAdmin, setIsAdmin] = useState(false);
   const [loading, setLoading] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [activeTab, setActiveTab] = useState<'users' | 'entries'>('users');

   useEffect(() => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];
      if (!token) return;

      const fetchUserStatus = async () => {
         try {
            const response = await fetch("http://localhost:3001/auth/admin", {
               method: 'GET',
               headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Fehler beim Überprüfen des Admin-Status.");
            const data = await response.json();
            setIsAdmin(data.isAdmin);
            if (!data.isAdmin) throw new Error("User is not admin!");
         } catch (error) {
            console.error("Fehler beim Überprüfen des Admin-Status:", error);
         }
      };

      const fetchUsersAndEntries = async () => {
         setLoading(true);
         try {
            const [usersResponse, entriesResponse] = await Promise.all([
               fetch("https://wordsofdeath-backend.vercel.app/api/whitelist", { headers: { 'Authorization': `Bearer ${token}` } }),
               fetch("https://wordsofdeath-backend.vercel.app/api/entries", { headers: { 'Authorization': `Bearer ${token}` } }),
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
         const response = await fetch("https://wordsofdeath-backend.vercel.app/api/whitelist", {
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
         const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/whitelist/${username}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` },
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
         const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/entries/${entryId}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` },
         });

         if (!response.ok) throw new Error("Fehler beim Löschen des Eintrags.");
         setEntries(prev => prev.filter(entry => entry.id !== entryId));
      } catch (error) {
         console.error("Fehler beim Löschen des Eintrags:", error);
      }
   };
   if (loading) {
      return (
         <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
            <div className="flex items-center gap-3">
               <Loader2 className="w-6 h-6 animate-spin" />
               <span className="text-neutral-300">Lade Dashboard...</span>
            </div>
         </div>
      );
   }

   function goToPage(username: string): void {
      window.location.href = `/u/${username}`;
   }

   return (
      <div className="min-h-screen bg-neutral-900 p-6 pt-24">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
               <div>
                  <h1 className="text-4xl font-bold text-white">
                     Admin Dashboard
                  </h1>
                  <p className="text-neutral-400 mt-2">
                     Verwalte Benutzer und Einträge
                  </p>
               </div>
               <Button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5"
                  variant='secondary'
               >
                  <UserPlus size={18} className="mr-2" />
                  Benutzer Hinzufügen
               </Button>
            </div>

            <div className="flex gap-2 mb-6">
               <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg transition-all duration-200
                     ${activeTab === 'users'
                        ? 'bg-neutral-700 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
               >
                  <Users className="w-5 h-5" />
                  Benutzer ({whitelistedUsers.length})
               </button>
               <button
                  onClick={() => setActiveTab('entries')}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg transition-all duration-200
                     ${activeTab === 'entries'
                        ? 'bg-neutral-700 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
               >
                  <BookText className="w-5 h-5" />
                  Einträge ({entries.length})
               </button>
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
               {activeTab === 'users' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {whitelistedUsers.map(user => (
                        <div key={user._id}
                           className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 hover:border-neutral-700 transition-all duration-300">
                           <div className="flex justify-between items-center">
                              <h4 className="text-lg font-semibold text-white">
                                 {user.username}
                              </h4>
                              <div className="flex gap-3">
                                 <Tooltip content="Zum User">
                                    <Button
                                       onClick={() => goToPage(user.username)}
                                       variant='primary'
                                    >
                                       <UserRoundCog size={18} />
                                    </Button>
                                 </Tooltip>
                                 <Tooltip content="Entfernen">
                                    <Button
                                       onClick={() => removeUserFromWhitelist(user.username)}
                                       variant='destructive'
                                    >
                                       <Trash size={18} />
                                    </Button>
                                 </Tooltip>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {activeTab === 'entries' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {entries.map(entry => (
                        <div key={entry._id}
                           className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 hover:border-neutral-700 transition-all duration-300">
                           <div className="mb-4">
                              <h4 className="text-lg font-semibold text-white truncate">
                                 {entry.entry}
                              </h4>
                              <div className="flex flex-col gap-1.5 mt-3">
                                 <p className="text-sm text-neutral-400">
                                    Von: <Link href={`/u/${entry.author}`} className="hover:text-neutral-100 transition-colors">@{entry.author}</Link>
                                 </p>
                                 <TimeStamp timestamp={entry.timestamp} />
                              </div>
                           </div>
                           <div className="flex justify-end">
                              <Tooltip content="Löschen">
                                 <Button
                                    onClick={() => deleteEntry(entry.id)}
                                    variant='destructive'
                                 >
                                    <Trash size={18} />
                                 </Button>
                              </Tooltip>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Benutzer hinzufügen">
            <div className="p-4">
               <input
                  type="text"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  placeholder="Benutzernamen eingeben..."
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg mb-4 
                     placeholder:text-neutral-500 text-white focus:outline-none focus:border-neutral-400"
               />
               <Button
                  onClick={addUserToWhitelist}
                  disabled={newUser.length < 3}
                  className={`w-full py-3`}
               >
                  Hinzufügen
               </Button>
            </div>
         </Modal>
      </div>
   );
};

export default Admin;
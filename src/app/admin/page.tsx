'use client'

import { useState, useEffect } from 'react';
import { Whitelist } from '@/types';
import { UserX, UserPlus, Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TimeStamp } from '@/components/ui/Timestamp';
import { LoginPrompt } from '@/components/mainpage/LoginPrompt';

const Admin = () => {
   const [whitelistedUsers, setWhitelistedUsers] = useState<Whitelist[]>([]);
   const [newUser, setNewUser] = useState('');
   const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
   const [isRemoveUserModalOpen, setIsRemoveUserModalOpen] = useState(false);
   const [userToRemove, setUserToRemove] = useState<Whitelist | null>(null);
   const [loading, setLoading] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [isAdmin, setIsAdmin] = useState(false);

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

      fetchUserStatus();

      const fetchWhitelistedUsers = async () => {
         setLoading(true);
         try {
            const response = await fetch("https://wordsofdeath-backend.vercel.app/api/whitelist", {
               headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Fehler beim Abrufen der Whitelist-Daten.");
            setWhitelistedUsers(await response.json());
         } catch (error) {
            console.error("Fehler beim Abrufen der Whitelist-Daten:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchWhitelistedUsers();
   }, []);

   const addUserToWhitelist = async () => {
      if (!newUser.trim()) return;
      if (!isAdmin) return;

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
         setIsAddUserModalOpen(false);
      } catch (error) {
         console.error("Fehler beim Hinzufügen des Benutzers:", error);
      }
   };

   const removeUserFromWhitelist = async (username: string) => {
      if (!username || !isAdmin) return;

      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];
      try {
         const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/whitelist/${username}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` },
         });

         if (!response.ok) throw new Error("Fehler beim Entfernen des Benutzers.");
         setWhitelistedUsers(prev => prev.filter(user => user.username !== username));
         setIsRemoveUserModalOpen(false);
      } catch (error) {
         console.error("Fehler beim Entfernen des Benutzers:", error);
      }
   };

   const filteredUsers = whitelistedUsers.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
   );

   if (!isAdmin) {
      return <LoginPrompt />;
   }

   if (loading) {
      return (
         <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
            <div className="flex items-center gap-3">
               <span className="text-neutral-300">Lade Whitelist...</span>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-neutral-900 p-6 pt-24">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
               <div>
                  <h1 className="text-4xl font-bold text-white">Whitelist-Verwaltung</h1>
                  <p className="text-neutral-400 mt-2">Verwalte die Benutzer, die auf die Anwendung zugreifen dürfen</p>
               </div>
               <div className="flex gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                     <input
                        type="text"
                        placeholder="Suche nach Benutzern..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg 
                           text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
                     />
                  </div>
                  {isAdmin && (
                     <Button
                        onClick={() => setIsAddUserModalOpen(true)}
                        className="px-5 py-2.5"
                        variant="secondary"
                     >
                        <UserPlus size={18} className="mr-2" />
                        Benutzer Hinzufügen
                     </Button>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredUsers.map(user => (
                  <span key={user._id || user.username} className="block group">
                     <article className="h-full bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-500/50 transition-all duration-300">
                        <div className="p-4">
                           <header className="flex items-center space-x-3">
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium text-neutral-200 truncate">
                                       {user.username}
                                    </span>
                                 </div>
                                 <TimeStamp timestamp={user.added_at} showIcon={true} />
                              </div>
                              {isAdmin && (
                                 <Button
                                    onClick={() => {
                                       setUserToRemove(user);
                                       setIsRemoveUserModalOpen(true);
                                    }}
                                    variant="destructive"
                                 >
                                    <UserX size={18} />
                                 </Button>
                              )}
                           </header>
                        </div>
                     </article>
                  </span>
               ))}
            </div>
         </div>

         <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Benutzer hinzufügen">
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
                  disabled={newUser.length < 3 || !isAdmin}
                  className="w-full py-3"
               >
                  Hinzufügen
               </Button>
            </div>
         </Modal>

         <Modal
            isOpen={isRemoveUserModalOpen}
            onClose={() => setIsRemoveUserModalOpen(false)}
            title={`Benutzer ${userToRemove?.username}`}
         >
            <div className="p-4">
               <p className="text-neutral-400">Möchten Sie den Benutzer <strong>{userToRemove?.username}</strong> wirklich entfernen?</p>
               <Button
                  onClick={() => removeUserFromWhitelist(userToRemove?.username || '')}
                  variant="destructive"
                  className="w-full py-3 mt-4"
               >
                  Entfernen
               </Button>
            </div>
         </Modal>
      </div>
   );
};

export default Admin;

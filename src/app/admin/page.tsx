'use client';

import React, { useEffect, useState } from "react";
import { Entry, User } from "@/types";
import Link from "next/link";
import Toast from "@/components/Toast";

const SkeletonLoader: React.FC<{ count: number }> = ({ count }) => (
   <div>
      {[...Array(count)].map((_, index) => (
         <div key={index} className="animate-pulse mb-2 bg-zinc-700 h-6 rounded-md"></div>
      ))}
   </div>
);

const Admin: React.FC = () => {
   const [whitelistedUsers, setWhitelistedUsers] = useState<User[]>([]);
   const [entries, setEntries] = useState<Entry[]>([]);
   const [newUser, setNewUser] = useState<string>("");
   const [toasts, setToasts] = useState<{ type: 'info' | 'warning' | 'error'; message: string }[]>([]);
   const [isAdmin, setIsAdmin] = useState<boolean>(false);
   const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];

      if (!token) {
         addToast('error', "[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden.");
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
            if (!data.isAdmin) addToast('warning', "Zugriff verweigert: Keine Administratorrechte.");
         } catch (error) {
            console.error("Fehler beim Überprüfen des Admin-Status:", error);
            addToast('error', "Fehler beim Überprüfen des Admin-Status.");
         }
      };

      const fetchUsersAndEntries = async () => {
         setLoading(true);
         try {
            const [usersResponse, entriesResponse] = await Promise.all([
               fetch("http://localhost:3001/api/whitelist", { headers: { 'Authorization': `Bearer ${token}` } }),
               fetch("http://localhost:3001/api/entries", { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            if (!usersResponse.ok || !entriesResponse.ok) throw new Error("Fehler beim Abrufen der Daten.");
            setWhitelistedUsers(await usersResponse.json());
            setEntries(await entriesResponse.json());
         } catch (error) {
            console.error("Fehler beim Abrufen der Daten:", error);
            addToast('error', "Fehler beim Abrufen der Daten.");
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

   const addToast = (type: 'info' | 'warning' | 'error', message: string) => {
      setToasts(prevToasts => [...prevToasts, { type, message }]);
   };

   const addUserToWhitelist = async () => {
      if (!newUser.trim()) return addToast('warning', "Bitte geben Sie einen Benutzernamen ein.");
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
         addToast('info', "Benutzer erfolgreich hinzugefügt.");
      } catch {
         addToast('error', "Fehler beim Hinzufügen des Benutzers.");
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
         addToast('info', "Benutzer erfolgreich entfernt.");
      } catch {
         addToast('error', "Fehler beim Entfernen des Benutzers.");
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
         setEntries(prev => prev.filter(entry => entry._id !== entryId));
         addToast('info', "Eintrag erfolgreich gelöscht.");
      } catch {
         addToast('error', "Fehler beim Löschen des Eintrags.");
      }
   };

   if (!isAdmin) return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-center p-4">
         <div className="max-w-md bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700">
            <h2 className="text-2xl font-semibold text-red-500 mb-4">Zugriff verweigert</h2>
            <p className="text-zinc-300 mb-4">Sie haben keine Berechtigung, auf das Dashboard zuzugreifen.</p>
            <Link href="/" passHref>
               <button className="bg-red-500 hover:bg-red-600 py-2 px-4 rounded-md transition">Zurück zur Startseite</button>
            </Link>
         </div>
      </div>
   );

   return (
      <div className="min-h-screen p-6 bg-zinc-900 text-white">
         <div className="max-w-5xl mx-auto bg-zinc-800 p-8 rounded-lg shadow-md border border-zinc-700">
            {toasts.map((toast, index) => (
               <Toast key={index} type={toast.type} message={toast.message} position="bottom-left" />
            ))}
            <h2 className="text-2xl font-semibold mb-4">Admin-Dashboard</h2>
            <div className="space-y-4">
               <div>
                  <h3 className="font-semibold mb-2">Benutzer hinzufügen</h3>
                  <div className="flex space-x-2">
                     <input
                        type="text"
                        value={newUser}
                        onChange={(e) => setNewUser(e.target.value)}
                        placeholder="Benutzername"
                        className="w-full px-4 py-2 bg-zinc-700 rounded-lg border border-zinc-600 text-white"
                     />
                     <button onClick={addUserToWhitelist} className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded-lg transition">Hinzufügen</button>
                  </div>
               </div>
               <div>
                  <h3 className="font-semibold mb-2">Whitelisted Benutzer</h3>
                  {loading ? <SkeletonLoader count={5} /> : (
                     <ul className="space-y-2">
                        {whitelistedUsers.map(user => (
                           <li key={user.username} className="flex items-center justify-between p-2 bg-zinc-700 rounded-lg">
                              <span>{user.username}</span>
                              <button onClick={() => removeUserFromWhitelist(user.username)} className="bg-red-500 hover:bg-red-600 py-1 px-3 rounded-lg transition">Entfernen</button>
                           </li>
                        ))}
                     </ul>
                  )}
               </div>
               <div>
                  <h3 className="font-semibold mb-2">Einträge</h3>
                  {loading ? <SkeletonLoader count={5} /> : (
                     <ul className="space-y-2">
                        {entries.map(entry => (
                           <li key={entry._id} className="flex items-center justify-between p-2 bg-zinc-700 rounded-lg">
                              <span>{`${entry.entry} | ${entry.type}`}</span>
                              <button onClick={() => deleteEntry(entry._id)} className="bg-red-500 hover:bg-red-600 py-1 px-3 rounded-lg transition">Entfernen</button>
                           </li>
                        ))}
                     </ul>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default Admin;

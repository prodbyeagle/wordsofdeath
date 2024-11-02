'use client'

import React, { useEffect, useState } from "react";
import { Entry, User } from "@/types"; // Stelle sicher, dass die Typen korrekt definiert sind

const Dashboard: React.FC = () => {
   const [whitelistedUsers, setWhitelistedUsers] = useState<User[]>([]);
   const [entries, setEntries] = useState<Entry[]>([]);
   const [newUser, setNewUser] = useState<string>("");
   const [error, setError] = useState<string | null>(null);

   // Fetch whitelisted users and entries on mount
   useEffect(() => {
      const fetchUsersAndEntries = async () => {
         const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='))?.split('=')[1];
         if (!token) {
            setError("[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden.");
            return;
         }

         try {
            const [usersResponse, entriesResponse] = await Promise.all([
               fetch("http://localhost:3001/api/whitelist", {
                  method: 'GET',
                  headers: { 'Authorization': `Bearer ${token}` },
               }),
               fetch("http://localhost:3001/api/entries", {
                  method: 'GET',
                  headers: { 'Authorization': `Bearer ${token}` },
               }),
            ]);

            if (!usersResponse.ok || !entriesResponse.ok) {
               throw new Error("Fehler beim Abrufen der Daten.");
            }

            const usersData: User[] = await usersResponse.json();
            const entriesData: Entry[] = await entriesResponse.json();

            setWhitelistedUsers(usersData);
            setEntries(entriesData);
         } catch (error) {
            setError("Fehler beim Abrufen der Daten.");
            console.error(error);
         }
      };

      fetchUsersAndEntries();
   }, []);

   const addUserToWhitelist = async () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='))?.split('=')[1];
      if (!token) {
         setError("[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden.");
         return;
      }

      if (!newUser.trim()) return;

      try {
         const response = await fetch("http://localhost:3001/api/whitelist", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newUser }),
         });

         if (!response.ok) {
            throw new Error("Fehler beim Hinzufügen des Benutzers.");
         }

         const addedUser: User = await response.json();
         setWhitelistedUsers(prev => [...prev, addedUser]);
         setNewUser("");
      } catch (error) {
         setError("Fehler beim Hinzufügen des Benutzers.");
         console.error(error);
      }
   };

   const removeUserFromWhitelist = async (userId: string) => {
      if (!userId) {
         console.error("Ungültige Benutzer-ID:", userId);
         return; // Vorzeitiger Rückgabe, wenn die ID ungültig ist
      }

      const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='))?.split('=')[1];
      if (!token) {
         setError("[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden.");
         return;
      }

      try {
         const response = await fetch(`http://localhost:3001/api/whitelist/${userId}`, {
            method: "DELETE",
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Fehler beim Entfernen des Benutzers.");
         }

         console.log("Benutzer erfolgreich entfernt.");
         setWhitelistedUsers(prev => prev.filter(user => user.id !== userId));
      } catch (error) {
         setError("Fehler beim Entfernen des Benutzers.");
         console.error("Fehlerdetails:", error);
      }
   };

   const deleteEntry = async (entryId: string) => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='))?.split('=')[1];
      if (!token) {
         setError("[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden.");
         return;
      }

      try {
         const response = await fetch(`http://localhost:3001/api/entries/${entryId}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` },
         });

         if (!response.ok) {
            throw new Error("Fehler beim Löschen des Eintrags.");
         }

         setEntries(prev => prev.filter(entry => entry._id !== entryId));
      } catch (error) {
         setError("Fehler beim Löschen des Eintrags.");
         console.error(error);
      }
   };

   return (
      <div className="min-h-screen bg-zinc-800 text-white p-10">
         <div className="max-w-5xl mx-auto p-8 rounded-xl shadow-md border border-zinc-600">
            <h2 className="text-3xl font-semibold mb-6">Admin-Dashboard</h2>
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-4 border border-zinc-600 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Benutzerverwaltung</h3>
                  <input
                     type="text"
                     value={newUser}
                     onChange={(e) => setNewUser(e.target.value)}
                     placeholder="Benutzername hinzufügen"
                     className="w-full p-2 mb-2 bg-zinc-700 rounded"
                  />
                  <button
                     onClick={addUserToWhitelist}
                     className="w-full py-2 bg-green-600 hover:bg-green-700 rounded"
                  >
                     Benutzer hinzufügen
                  </button>
                  <ul className="mt-4">
                     {whitelistedUsers.map(user => (
                        <li key={user.id} className="flex justify-between items-center bg-zinc-700 p-2 rounded mb-2">
                           <span>{user.username}</span>
                           <button
                              onClick={() => removeUserFromWhitelist(user.id)}
                              className="text-red-600 hover:text-red-800"
                           >
                              Entfernen
                           </button>
                        </li>
                     ))}
                  </ul>
               </div>

               <div className="p-4 border border-zinc-600 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Einträge verwalten</h3>
                  <ul>
                     {entries.map(entry => (
                        <li key={entry._id} className="bg-zinc-700 p-2 rounded mb-2 flex justify-between items-center">
                           <span>{entry.entry}</span>
                           <div>
                              <button
                                 onClick={() => deleteEntry(entry._id)}
                                 className="text-red-600 hover:text-red-800 mr-2"
                              >
                                 Löschen
                              </button>
                              <button className="text-blue-600 hover:text-blue-800">Bearbeiten</button>
                           </div>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Dashboard;

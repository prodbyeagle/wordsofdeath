'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from "react";
import { Entry, User } from "@/types";

const Dashboard: React.FC = () => {
   const [whitelistedUsers, setWhitelistedUsers] = useState<User[]>([]);
   const [entries, setEntries] = useState<Entry[]>([]);
   const [newUser, setNewUser] = useState<string>("");
   const [error, setError] = useState<{ type: 'info' | 'warning' | 'error'; message: string } | null>(null);
   const [isAdmin, setIsAdmin] = useState<boolean>(false);
   const [activeTab, setActiveTab] = useState<'users' | 'entries'>('users');

   useEffect(() => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='))?.split('=')[1];

      if (!token) {
         setError({ type: 'error', message: "[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden." });
         return;
      }

      const fetchUserStatus = async () => {
         try {
            const response = await fetch("http://localhost:3001/api/check-admin", {
               method: 'GET',
               headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
               throw new Error("Fehler beim Überprüfen des Admin-Status.");
            }

            const data = await response.json();
            setIsAdmin(data.isAdmin);

            if (!data.isAdmin) {
               setError({ type: 'warning', message: "Zugriff verweigert: Du hast keine Administratorrechte." });
               return;
            }
         } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler.";
            setError({ type: 'error', message: "Fehler beim Überprüfen des Admin-Status: " + errorMessage });
            console.error(error);
         }
      };

      fetchUserStatus();

      const fetchUsersAndEntries = async () => {
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
            const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler.";
            setError({ type: 'error', message: "Fehler beim Abrufen der Daten: " + errorMessage });
            console.error(error);
         }
      };

      if (isAdmin) {
         fetchUsersAndEntries();
      }
   }, [isAdmin]);

   const addUserToWhitelist = async () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='))?.split('=')[1];
      if (!token) {
         setError({ type: 'error', message: "[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden." });
         return;
      }

      if (!newUser.trim()) {
         setError({ type: 'warning', message: "Bitte geben Sie einen Benutzernamen ein." });
         return;
      }

      try {
         const response = await fetch("http://localhost:3001/api/whitelist", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newUser }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Fehler beim Hinzufügen des Benutzers.");
         }

         const addedUser: User = await response.json();
         setWhitelistedUsers(prev => [...prev, addedUser]);
         setNewUser("");
         setError({ type: 'info', message: "Benutzer erfolgreich hinzugefügt." });
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler.";
         setError({ type: 'error', message: "Fehler beim Hinzufügen des Benutzers: " + errorMessage });
         console.error(error);
      }
   };

   const removeUserFromWhitelist = async (username: string) => {
      if (!username) {
         console.error("Ungültiger Username:", username);
         return;
      }

      const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='))?.split('=')[1];
      if (!token) {
         setError({ type: 'error', message: "[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden." });
         return;
      }

      try {
         const response = await fetch(`http://localhost:3001/api/whitelist/${username}`, {
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
         setWhitelistedUsers(prev => prev.filter(user => user.username !== username));
         setError({ type: 'info', message: "Benutzer erfolgreich entfernt." });
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler.";
         setError({ type: 'error', message: "Fehler beim Entfernen des Benutzers: " + errorMessage });
         console.error("Fehlerdetails:", error);
      }
   };

   const deleteEntry = async (entryId: string) => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='))?.split('=')[1];
      if (!token) {
         setError({ type: 'error', message: "[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden." });
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
         setError({ type: 'info', message: "Eintrag erfolgreich gelöscht." });
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler.";
         setError({ type: 'error', message: "Fehler beim Löschen des Eintrags: " + errorMessage });
         console.error(error);
      }
   };

   // Rendering-Logik für nicht admin Benutzer
   if (!isAdmin) {
      return (
         <div className="min-h-screen bg-zinc-800 text-white p-10">
            <h2 className="text-3xl text-red-300 hover:text-red-600 hover:font-extralight font-semibold mb-6 duration-750 transition">Zugriff verweigert</h2>
            <p>Sie haben keine Berechtigung, um auf dieses Dashboard zuzugreifen.</p>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-zinc-800 text-white p-10">
         <div className="max-w-5xl mx-auto p-8 rounded-xl shadow-md border border-zinc-600">
            <h2 className="text-3xl font-semibold mb-6">Admin-Dashboard</h2>
            {error && (
               <div className={`border ${error.type === 'error' ? 'border-red-500' : error.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'} text-white p-4 rounded-md mb-6`}>
                  <p className="font-semibold">{error.type === 'error' ? 'Fehler:' : error.type === 'warning' ? 'Warnung:' : 'Information:'}</p>
                  <p>{error.message}</p>
               </div>
            )}
            <div className="mb-4">
               <button onClick={() => setActiveTab('users')} className={`py-2 px-4 rounded-l-md ${activeTab === 'users' ? 'bg-zinc-600' : 'bg-zinc-500'} hover:bg-zinc-400`}>Benutzerverwaltung</button>
               <button onClick={() => setActiveTab('entries')} className={`py-2 px-4 rounded-r-md ${activeTab === 'entries' ? 'bg-zinc-600' : 'bg-zinc-500'} hover:bg-zinc-400`}>Einträge verwalten</button>
            </div>

            {activeTab === 'users' && (
               <div className="p-6 border border-zinc-600 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Benutzerverwaltung</h3>
                  <input
                     type="text"
                     value={newUser}
                     onChange={(e) => setNewUser(e.target.value)}
                     placeholder="Benutzername hinzufügen"
                     className="w-full p-2 mb-2 border border-zinc-600 rounded bg-zinc-700 text-white"
                  />
                  <button
                     onClick={addUserToWhitelist}
                     className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded">
                     Hinzufügen
                  </button>
                  <ul className="mt-4">
                     {whitelistedUsers.map((user) => (
                        <li key={user.username} className="flex justify-between items-center py-2 border-b border-zinc-600">
                           {user.username}
                           <button
                              onClick={() => removeUserFromWhitelist(user.username)}
                              className="text-red-500 hover:text-red-400">
                              Entfernen
                           </button>
                        </li>
                     ))}
                  </ul>
               </div>
            )}

            {activeTab === 'entries' && (
               <div className="p-6 border border-zinc-600 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Einträge verwalten</h3>
                  <ul>
                     {entries.map(entry => (
                        <li key={entry._id} className="bg-zinc-700 p-2 rounded mb-2 flex justify-between items-center">
                           <span>{entry.entry}</span>
                           <div>
                              <button
                                 onClick={() => deleteEntry(entry._id)}
                                 className="text-red-600 hover:text-red-800 mr-2 transition-colors duration-300"
                              >
                                 Löschen
                              </button>
                              <button className="text-blue-600 hover:text-blue-800 transition-colors duration-300">Bearbeiten</button>
                           </div>
                        </li>
                     ))}
                  </ul>
               </div>
            )}
         </div>
      </div>
   );

};

export default Dashboard;

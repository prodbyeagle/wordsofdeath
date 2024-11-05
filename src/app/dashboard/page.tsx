'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from "react";
import { Entry, User } from "@/types";
import Link from "next/link";

const SkeletonLoader: React.FC<{ count: number }> = ({ count }) => {
   return (
      <div>
         {[...Array(count)].map((_, index) => (
            <div key={index} className="animate-pulse mb-2 bg-zinc-700 h-6 rounded-md"></div>
         ))}
      </div>
   );
};

const Dashboard: React.FC = () => {
   const [whitelistedUsers, setWhitelistedUsers] = useState<User[]>([]);
   const [entries, setEntries] = useState<Entry[]>([]);
   const [newUser, setNewUser] = useState<string>("");
   const [error, setError] = useState<{ type: 'info' | 'warning' | 'error'; message: string } | null>(null);
   const [isAdmin, setIsAdmin] = useState<boolean>(false);
   const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];

      if (!token) {
         setError({ type: 'error', message: "[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden." });
         return;
      }

      const fetchUserStatus = async () => {
         try {
            const response = await fetch("https://wordsofdeath-backend.vercel.app/api/check-admin", {
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
         setLoading(true);
         try {
            const [usersResponse, entriesResponse] = await Promise.all([
               fetch("https://wordsofdeath-backend.vercel.app/api/whitelist", {
                  method: 'GET',
                  headers: { 'Authorization': `Bearer ${token}` },
               }),
               fetch("https://wordsofdeath-backend.vercel.app/api/entries", {
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
         } finally {
            setLoading(false);
         }
      };

      if (isAdmin) {
         fetchUsersAndEntries();
      }
   }, [isAdmin]);

   const addUserToWhitelist = async () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];
      if (!token) {
         setError({ type: 'error', message: "[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden." });
         return;
      }

      if (!newUser.trim()) {
         setError({ type: 'warning', message: "Bitte geben Sie einen Benutzernamen ein." });
         return;
      }

      try {
         const response = await fetch("https://wordsofdeath-backend.vercel.app/api/whitelist", {
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

      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];
      if (!token) {
         setError({ type: 'error', message: "[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden." });
         return;
      }

      try {
         const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/whitelist/${username}`, {
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

         setWhitelistedUsers(prev => prev.filter(user => user.username !== username));
         setError({ type: 'info', message: "Benutzer erfolgreich entfernt." });
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler.";
         setError({ type: 'error', message: "Fehler beim Entfernen des Benutzers: " + errorMessage });
         console.error("Fehlerdetails:", error);
      }
   };

   const deleteEntry = async (entryId: string) => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];
      if (!token) {
         setError({ type: 'error', message: "[SERVER]: Authentifizierung fehlgeschlagen: Kein Token gefunden." });
         return;
      }

      try {
         const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/entries/${entryId}`, {
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
         <div className="min-h-screen bg-zinc-800 text-white flex flex-col items-center justify-center p-6 space-y-4">
            <div className="bg-zinc-900 p-8 rounded-xl shadow-md border border-zinc-600 text-center max-w-lg">
               <h2 className="text-4xl font-bold text-red-400 mb-4">Zugriff verweigert</h2>
               <p className="text-lg mb-6 text-zinc-300">
                  Sie haben keine Berechtigung, um auf dieses Dashboard zuzugreifen.
               </p>
               <Link href="/" passHref>
                  <button className="bg-red-400 hover:bg-red-500 border-2 border-red-400 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-200">
                     Zurück zur Startseite
                  </button>
               </Link>
            </div>
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
               <h3 className="text-xl font-semibold mb-4">Benutzer zur Whitelist hinzufügen</h3>
               <div className="flex space-x-2 mb-4">
                  <input
                     type="text"
                     value={newUser}
                     onChange={(e) => setNewUser(e.target.value)}
                     className="flex-grow p-2 bg-zinc-700 border border-zinc-600 rounded-md"
                     placeholder="Benutzernamen eingeben"
                  />
                  <button
                     onClick={addUserToWhitelist}
                     className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"
                  >
                     Hinzufügen
                  </button>
               </div>
            </div>

            <div className="mb-4">
               <h3 className="text-xl font-semibold mb-4">Whitelisted Benutzer</h3>
               {loading ? (
                  <SkeletonLoader count={5} />
               ) : (
                  <ul className="space-y-2">
                     {whitelistedUsers.map(user => (
                        <li key={user.username} className="flex justify-between items-center p-2 bg-zinc-700 rounded-md">
                           <span>{user.username}</span>
                           <button
                              onClick={() => removeUserFromWhitelist(user.username)}
                              className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md"
                           >
                              Entfernen
                           </button>
                        </li>
                     ))}
                  </ul>
               )}
            </div>

            <div className="mb-4">
               <h3 className="text-xl font-semibold mb-4">Einträge</h3>
               {loading ? (
                  <SkeletonLoader count={5} />
               ) : (
                  <ul className="space-y-2">
                     {entries.map(entry => (
                        <li key={entry._id} className="flex justify-between items-center p-2 bg-zinc-700 rounded-md">
                           <span>{`${entry.entry} | ${entry.type}`}</span>
                           <button
                              onClick={() => deleteEntry(entry.id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md"
                           >
                              Entfernen
                           </button>
                        </li>
                     ))}
                  </ul>

               )}
            </div>
         </div>
      </div>
   );
};

export default Dashboard;

'use client'

import React, { useEffect, useState } from "react";
import { Entry } from "@/types";

const Library = () => {
   const [entries, setEntries] = useState<Entry[]>([]);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchEntries = async () => {
         const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='))?.split('=')[1];

         if (!token) {
            setError("Authentifizierung fehlgeschlagen: Kein Token gefunden.");
            return;
         }

         try {
            const response = await fetch('http://localhost:3001/api/entries', {
               method: 'GET',
               headers: {
                  'Authorization': `Bearer ${token}`,
               },
            });

            if (!response.ok) {
               if (response.status === 401) {
                  setError("Nicht autorisiert. Bitte erneut anmelden.");
               } else if (response.status === 403) {
                  setError("Zugriff verweigert: Ungültiges Token.");
               } else {
                  setError(`Fehler: ${response.statusText}`);
               }
               return;
            }

            const data = await response.json();
            setEntries(data);
         } catch (error) {
            console.error("Netzwerkfehler beim Abrufen der Einträge:", error);
            setError("Fehler beim Abrufen der Einträge.");
         }
      };

      fetchEntries();
   }, []);

   return (
      <div>
         <h1 className="text-3xl font-bold">Bibliothek</h1>
         {error ? (
            <div className="text-red-500">{error}</div>
         ) : (
            <ul>
               {entries.map(entry => (
                  <li key={entry._id} className="text-lg">
                     <strong>{entry.entry}</strong>
                     <div>Autor: {entry.author}</div>
                     <div>Kategorien: {entry.categories.join(", ")}</div>
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
};

export default Library;

'use client'

import React, { useEffect, useState } from "react";

interface TokenPayload {
   username: string;
   // Füge hier weitere Eigenschaften hinzu, falls dein Token mehr Daten enthält
}

const Homepage = () => {
   const [username, setUsername] = useState<string | null>(null);
   const [greeting, setGreeting] = useState<string>("");

   useEffect(() => {
      // Alle Cookies auslesen
      const cookies = document.cookie.split('; ');
      console.log("Alle Cookies:", cookies); // Logge alle Cookies

      // Token aus Cookies finden
      const token = cookies.find(row => row.startsWith('wordsofdeath='));
      if (token) {
         const tokenValue = token.split('=')[1];
         console.log("Token gefunden:", tokenValue); // Logge den gefundenen Token

         try {
            const decoded: TokenPayload = JSON.parse(atob(tokenValue.split('.')[1])); // Token ohne jwt-decode dekodieren
            console.log("Dekodierte Daten:", decoded); // Logge die dekodierten Daten

            setUsername(decoded.username);
            setGreeting(getGreetingMessage());
         } catch (error) {
            console.error("Fehler beim Dekodieren des Tokens:", error); // Logge Fehler, falls die Dekodierung fehlschlägt
         }
      } else {
         console.log("Kein Token gefunden."); // Logge, wenn kein Token vorhanden ist
      }
   }, []);

   const getGreetingMessage = (): string => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
         return "Guten Morgen";
      } else if (currentHour < 18) {
         return "Guten Mittag";
      } else {
         return "Guten Abend";
      }
   };

   return (
      <div className="min-h-screen bg-zinc-800 text-white flex items-center justify-center">
         <div className="max-w-3xl p-8 rounded-xl shadow-md border border-zinc-600 text-center">
            <h1 className="text-4xl font-bold mb-4">{greeting}, {username}!</h1>
            <p className="text-lg mb-6">Eine Plattform zum Speichern und Durchsuchen von Wörtern und Sätzen, exklusiv für Discord-Nutzer.</p>
            <button className="bg-zinc-600 hover:bg-zinc-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200">
               Jetzt Starten
            </button>
         </div>
      </div>
   );
};

export default Homepage;

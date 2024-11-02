'use client';

import React, { useEffect, useState } from "react";
import { TokenPayload } from "@/types/types";
import Link from 'next/link';

const Homepage = () => {
   const [username, setUsername] = useState<string | null>(null);
   const [greeting, setGreeting] = useState<string>("");
   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

   useEffect(() => {
      const cookies = document.cookie.split('; ');
      console.log("Alle Cookies:", cookies);

      const token = cookies.find(row => row.startsWith('wod_token='));
      if (token) {
         const tokenValue = token.split('=')[1];
         try {
            const decoded: TokenPayload = JSON.parse(atob(tokenValue.split('.')[1]));

            setUsername(decoded.username);
            setGreeting(getGreetingMessage());
            setIsLoggedIn(true);
         } catch (error) {
            console.error("Fehler beim Dekodieren des Tokens:", error);
         }
      } else {
         console.log("Kein Token gefunden.");
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
         <div className="max-w-3xl bg-zinc-900 p-8 rounded-xl shadow-md border border-zinc-600 text-center">
            {isLoggedIn ? (
               <>
                  <h1 className="text-4xl font-bold mb-4">{greeting}, {username}!</h1>
                  <p className="text-lg mb-6">Eine Plattform zum Speichern und Durchsuchen von Wörtern und Sätzen, exklusiv für Discord-Nutzer.</p>
                  <button className="bg-zinc-600 hover:bg-zinc-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200">
                     Jetzt Starten
                  </button>
               </>
            ) : (
               <>
                  <h1 className="text-4xl font-bold mb-4">Du bist nicht eingeloggt!</h1>
                  <p className="text-lg mb-6">Bitte melde dich an, um die Plattform nutzen zu können.</p>
                  <Link href="/signin">
                     <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200">
                        Anmelden
                     </button>
                  </Link>
               </>
            )}
         </div>
      </div>
   );
};

export default Homepage;

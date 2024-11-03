'use client';

import React, { useEffect, useState } from "react";
import { TokenPayload, Entry } from "@/types";
import Link from 'next/link';

const Homepage = () => {
   const [username, setUsername] = useState<string | null>(null);
   const [greeting, setGreeting] = useState<string>("");
   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
   const [entries, setEntries] = useState<Entry[]>([]);

   useEffect(() => {
      const cookies = document.cookie.split('; ');
      const token = cookies.find(row => row.startsWith('wod_token='));
      if (token) {
         const tokenValue = token.split('=')[1];
         try {
            const decoded: TokenPayload = JSON.parse(atob(tokenValue.split('.')[1]));
            setUsername(decoded.username);
            setGreeting(getGreetingMessage());
            setIsLoggedIn(true);
            fetchEntries();
         } catch (error) {
            console.warn("Error decoding token:", error);
         }
      } else {
         console.warn("No token found.");
      }
   }, []);

   const getGreetingMessage = (): string => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
         return "Guten Morgen";
      } else if (currentHour < 18) {
         return "Guten Tag";
      } else {
         return "Guten Abend";
      }
   };

   const fetchEntries = async () => {
      try {
         const response = await fetch('https://wordsofdeath-backend.vercel.app/api/entries', {
            method: 'GET',
            headers: {
               'Authorization': `Bearer ${document.cookie.split('=')[1]}`,
            },
         });

         if (!response.ok) {
            throw new Error('Failed to fetch entries');
         }

         const data = await response.json();
         setEntries(data);
      } catch (error) {
         console.error('Error fetching entries:', error);
      }
   };

   const getRelativeTime = (timestamp: string): string => {
      const now = new Date();
      const entryTime = new Date(timestamp);
      const secondsAgo = Math.floor((now.getTime() - entryTime.getTime()) / 1000);

      if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
      const minutesAgo = Math.floor(secondsAgo / 60);
      if (minutesAgo < 60) return `${minutesAgo} minutes ago`;
      const hoursAgo = Math.floor(minutesAgo / 60);
      if (hoursAgo < 24) return `${hoursAgo} hours ago`;
      const daysAgo = Math.floor(hoursAgo / 24);
      if (daysAgo < 30) return `${daysAgo} days ago`;
      const monthsAgo = Math.floor(daysAgo / 30);
      if (monthsAgo < 12) return `${monthsAgo} months ago`;
      const yearsAgo = Math.floor(monthsAgo / 12);
      return `${yearsAgo} years ago`;
   };

   return (
      <div className="min-h-screen bg-zinc-800 text-white flex flex-col items-center py-10">
         <div className="max-w-2xl bg-zinc-900 p-8 rounded-xl shadow-lg border border-zinc-600 text-center mb-10 w-full">
            {isLoggedIn ? (
               <>
                  <h1 className="text-4xl font-semibold mb-2">{greeting}, {username}!</h1>
                  <p className="text-lg text-zinc-400 mb-6">Willkommen zurück! Hier ist dein persönlicher Feed.</p>
               </>
            ) : (
               <>
                  <h1 className="text-4xl font-bold mb-4">Du bist nicht eingeloggt!</h1>
                  <p className="text-lg text-zinc-400 mb-6">Bitte melde dich an, um die Plattform zu nutzen.</p>
                  <Link href="/signin">
                     <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-200">
                        Anmelden
                     </button>
                  </Link>
               </>
            )}
         </div>

         <div className="max-w-2xl w-full">
            <h2 className="text-3xl font-bold mb-6 text-center">Feed</h2>
            <div className="space-y-6">
               {entries.map((entry) => (
                  <div key={entry.timestamp} className="bg-zinc-700 p-6 rounded-lg shadow-md border border-zinc-600 hover:scale-[1.02] transition-transform">
                     <p className="text-lg font-medium mb-2">{entry.entry}</p>
                     <div className="text-sm text-zinc-400 flex justify-between">
                        <span>Von {entry.author}</span>
                        <span>{getRelativeTime(entry.timestamp)}</span>
                     </div>
                  </div>
               ))}
               {entries.length === 0 && (
                  <p className="text-center text-zinc-500">Noch keine Einträge vorhanden.</p>
               )}
            </div>
         </div>
      </div>
   );
};

export default Homepage;

'use client';

import React, { useEffect, useState } from "react";
import { Entry } from "@/types";
import Link from 'next/link';

const Homepage = () => {
   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
   const [entries, setEntries] = useState<Entry[]>([]);

   useEffect(() => {
      const cookies = document.cookie.split('; ');
      const token = cookies.find(row => row.startsWith('wordsofdeath='));
      if (token) {
         try {
            setIsLoggedIn(true);
            fetchEntries();
         } catch (error) {
            console.warn("Error decoding token:", error);
         }
      } else {
         console.warn("No token found.");
      }
   }, []);

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

      if (secondsAgo < 60) return `${secondsAgo} Sekunde${secondsAgo === 1 ? '' : 'n'} her`;
      const minutesAgo = Math.floor(secondsAgo / 60);
      if (minutesAgo < 60) return `${minutesAgo} Minute${minutesAgo === 1 ? '' : 'n'} her`;
      const hoursAgo = Math.floor(minutesAgo / 60);
      if (hoursAgo < 24) return `${hoursAgo} Stunde${hoursAgo === 1 ? '' : 'n'} her`;
      const daysAgo = Math.floor(hoursAgo / 24);
      return `${daysAgo} Tag${daysAgo === 1 ? '' : 'e'} her`;
   };

   return (
      <div className="min-h-screen bg-zinc-800 text-white flex flex-col items-center py-10">
         <div className="max-w-2xl w-full">
            <h2 className="text-3xl font-bold mb-6 text-center">Feed</h2>
            <div className="space-y-6">
               {isLoggedIn ? (
                  entries.length > 0 ? (
                     entries.map((entry) => (
                        <div key={entry.timestamp} className="bg-zinc-700 p-6 rounded-lg shadow-md border border-zinc-600">
                           <p className="text-lg font-medium mb-2">{entry.entry}</p>
                           <div className="text-sm text-zinc-400 flex justify-between">
                              <span>Von {entry.author}</span>
                              <span>{getRelativeTime(entry.timestamp)}</span>
                           </div>
                        </div>
                     ))
                  ) : (
                     <p className="text-center text-zinc-500">Noch keine Einträge vorhanden.</p>
                  )
               ) : (
                  <div className="bg-zinc-900 p-8 rounded-xl shadow-lg border border-zinc-600 text-center mb-10">
                     <h1 className="text-4xl font-bold mb-4">Du bist nicht eingeloggt!</h1>
                     <p className="text-lg text-zinc-400 mb-6">Bitte melde dich an, um die Plattform zu nutzen.</p>
                     <Link href="/signin">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-200">
                           Anmelden
                        </button>
                     </Link>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default Homepage;

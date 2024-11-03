'use client';

import React, { useEffect, useState } from "react";
import { TokenPayload } from "@/types";
import Link from 'next/link';

interface Entry {
   entry: string;
   author: string;
   timestamp: string;
}

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
         return "Good morning";
      } else if (currentHour < 18) {
         return "Good afternoon";
      } else {
         return "Good evening";
      }
   };

   const fetchEntries = async () => {
      try {
         const response = await fetch('http://localhost:3001/api/entries', {
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

   return (
      <div className="min-h-screen bg-zinc-800 text-white flex flex-col items-center justify-center">
         <div className="max-w-3xl bg-zinc-900 p-8 rounded-xl shadow-md border border-zinc-600 text-center mb-8">
            {isLoggedIn ? (
               <>
                  {/* <h1 className="text-4xl font-bold mb-4">{greeting}, {username}!</h1>
                  <p className="text-lg">A platform to store and search words and sentences, exclusively for Discord users.</p> */}
                  {/* <button className="bg-zinc-600 hover:bg-zinc-500 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200">
                     Get Started
                  </button> */}
               </>
            ) : (
               <>
                  <h1 className="text-4xl font-bold mb-4">You are not logged in!</h1>
                  <p className="text-lg mb-6">Please sign in to use the platform.</p>
                  <Link href="/signin">
                     <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200">
                        Sign In
                     </button>
                  </Link>
               </>
            )}
         </div>

         <div className="max-w-3xl bg-zinc-900 p-4 rounded-xl shadow-md border border-zinc-600 text-left">
            <h2 className="text-2xl font-bold mb-4">Feed</h2>
            <ul>
               {entries.map((entry) => (
                  <li key={entry.timestamp} className="border-b border-zinc-600 py-2">
                     <p className="text-lg">{entry.entry}</p>
                     <p className="text-sm text-zinc-400">By {entry.author} on {new Date(entry.timestamp).toLocaleString()}</p>
                  </li>
               ))}
            </ul>
         </div>
      </div>
   );
};

export default Homepage;

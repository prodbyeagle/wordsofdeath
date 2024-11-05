import React from "react";
import Image from "next/image";
import { connectToDatabase } from "@/db";
import { Entry, User } from "@/types";

interface EntryProps {
   params: {
      id: string;
   };
}

const EntryPage = async ({ params }: EntryProps) => {
   const { id } = params;

   const fetchEntryById = async (id: string, token: string | undefined): Promise<Entry | null> => {
      const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/entries/${id}`, {
         method: "GET",
         headers: {
            'Authorization': `Bearer ${token}`,
         },
      });

      if (!response.ok) {
         return null;
      }
      return await response.json();
   };

   const getUserById = async (id: string): Promise<User | null> => {
      const database = await connectToDatabase();
      const user = await database.collection("users").findOne({ id: id }) as User;
      return user || null;
   };

   const { cookies } = await import('next/headers');
   const cookieStore = await cookies();
   const token = cookieStore.get('wordsofdeath')?.value;

   const entry: Entry | null = await fetchEntryById(id, token);
   let user: User | null = null;

   if (entry && entry.authorId) {
      user = await getUserById(entry.authorId);
   }

   if (!entry) {
      return <div className="text-center text-red-500">Eintrag nicht gefunden.</div>;
   }

   const getAvatarUrl = (id: string, avatar: string): string => {
      return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
   };

   const getRelativeTime = (timestamp: string): string => {
      const now = new Date();
      const entryTime = new Date(timestamp);
      const secondsAgo = Math.floor((now.getTime() - entryTime.getTime()) / 1000);

      const daysAgo = Math.floor(secondsAgo / (3600 * 24));
      if (daysAgo > 0) {
         return `Erstellt vor: ${daysAgo} Tag${daysAgo === 1 ? '' : 'en'}`;
      }

      const hoursAgo = Math.floor(secondsAgo / 3600);
      if (hoursAgo > 0) {
         return `Erstellt vor: ${hoursAgo} Stunde${hoursAgo === 1 ? '' : 'n'}`;
      }

      const minutesAgo = Math.floor(secondsAgo / 60);
      if (minutesAgo > 0) {
         return `Erstellt vor: ${minutesAgo} Minute${minutesAgo === 1 ? '' : 'n'}`;
      }

      return `Erstellt vor: 1 Sekunde`;
   };

   return (
      <div className="min-h-screen bg-zinc-800 text-white p-4 flex flex-col items-center">
         <div className="max-w-2xl w-full p-6 rounded-xl shadow-lg border border-zinc-600 bg-zinc-900">
            <h2 className="text-4xl font-bold mb-4">{entry.entry}</h2>
            <p className="text-lg font-medium mb-2">ID: {entry.id}</p>
            <div className="text-sm text-zinc-400 flex justify-between mb-4">
               <span>Von: {user ? user.username : entry.author}</span>
               <span>{getRelativeTime(entry.timestamp)}</span>
            </div>
            <div className="mt-4">
               <h3 className="text-xl font-semibold">Variationen:</h3>
               <ul className="list-disc ml-6">
                  {entry.variation.length > 0 ? (
                     entry.variation.map((var1, index) => (
                        <li key={index}>{var1}</li>
                     ))
                  ) : (
                     <li>Keine Variationen</li>
                  )}
               </ul>
            </div>
            <div className="mt-4">
               <h3 className="text-xl font-semibold">Kategorien:</h3>
               <p>{entry.categories.length > 0 ? entry.categories.join(", ") : "Keine Kategorien"}</p>
            </div>
            {user && (
               <div className="mt-4 flex items-center">
                  <Image
                     src={user.avatar ? getAvatarUrl(user.id, user.avatar) : "/default-avatar.png"}
                     alt={`${user.username}'s Avatar`}
                     width={48}
                     height={48}
                     className="rounded-full mr-4"
                     loading="lazy"
                  />
                  <span className="text-lg">Autor: {user.username}</span>
               </div>
            )}
         </div>
      </div>
   );
};

export default EntryPage;
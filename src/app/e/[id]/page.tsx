import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Entry, User } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface EntryProps {
   params: Promise<{
      id: string;
   }>;
}

const EntryPage = async ({ params }: EntryProps) => {
   const { id } = await params;

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
      const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/user/i/${id}`, {
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

   const { cookies } = await import('next/headers');
   const cookieStore = await cookies();
   const token = cookieStore.get('wordsofdeath')?.value;

   const entry: Entry | null = await fetchEntryById(id, token);
   let user: User | null = null;

   if (entry && entry.authorId) {
      user = await getUserById(entry.authorId);
   }

   if (!entry) {
      return (
         <div className="min-h-screen bg-zinc-800 text-white flex flex-col items-center justify-center">
            <div className="bg-zinc-900 p-8 rounded-xl shadow-lg border border-zinc-600 text-center">
               <h1 className="text-4xl font-bold text-red-500 mb-4">Eintrag nicht gefunden</h1>
               <p className="text-lg text-zinc-400 mb-6">
                  Der gesuchte Eintrag ist nicht verfügbar oder wurde möglicherweise gelöscht.
               </p>
               <Link href="/" passHref>
                  <button className="bg-[#d683ff] hover:bg-[#aa6dc9] border-2 border-[#d683ff] text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-200">
                     Zurück zur Startseite
                  </button>
               </Link>
            </div>
         </div>
      );
   }


   const getAvatarUrl = (id: string, avatar: string): string => {
      return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
   };

   return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center py-12 px-6">
         <div className="max-w-3xl w-full p-8 rounded-xl shadow-lg border border-zinc-600 bg-zinc-800">
            <h2 className="text-3xl font-bold mb-6">{entry.entry}</h2>
            <div className="text-sm text-zinc-400 mb-6">
               <span>{formatDistanceToNow(new Date(entry.timestamp), { includeSeconds: true, addSuffix: true, locale: de })}</span>
            </div>

            {entry.variation.length > 0 && (
               <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Variationen:</h3>
                  <ul className="list-disc ml-6">
                     {entry.variation.map((var1, index) => (
                        <li key={index}>{var1}</li>
                     ))}
                  </ul>
               </div>
            )}

            {entry.categories.length > 0 && (
               <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Kategorien:</h3>
                  <p>{entry.categories.join(", ")}</p>
               </div>
            )}

            {user && (
               <div className="mt-6 flex items-center">
                  <Image
                     src={user.avatar ? getAvatarUrl(user.id, user.avatar) : "/default-avatar.png"}
                     alt={`${user.username}'s Avatar`}
                     width={40}
                     height={40}
                     className="rounded-full mr-4"
                     loading="lazy"
                  />
                  <span className="text-lg">von @{user.username}</span>
               </div>
            )}
         </div>
      </div>
   );


};

export default EntryPage;

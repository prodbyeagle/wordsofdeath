import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Entry, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Clock } from "lucide-react";

interface EntryProps {
   params: Promise<{
      id: string;
   }>;
}

const EntryPage = async ({ params }: EntryProps) => {
   const { id } = await params;

   const fetchEntryById = async (id: string, token: string | undefined): Promise<Entry | null> => {
      const response = await fetch(`http://localhost:3001/api/entries/${id}`, {
         method: "GET",
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });
      if (!response.ok) return null;
      return await response.json();
   };

   const fetchAllEntries = async (token: string | undefined): Promise<Entry[]> => {
      const response = await fetch(`http://localhost:3001/api/entries`, {
         method: "GET",
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });
      if (!response.ok) return [];
      return await response.json();
   };

   const getUserById = async (id: string, token: string | undefined): Promise<User | null> => {
      const response = await fetch(`http://localhost:3001/api/user/i/${id}`, {
         method: "GET",
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });
      if (!response.ok) return null;
      return await response.json();
   };

   const { cookies } = await import("next/headers");
   const cookieStore = await cookies();
   const token = cookieStore.get("wordsofdeath")?.value;

   const entry: Entry | null = await fetchEntryById(id, token);
   let user: User | null = null;

   if (entry && entry.authorId) {
      user = await getUserById(entry.authorId, token);
   }

   if (!entry) {
      return (
         <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center">
            <div className="bg-zinc-800 p-8 rounded-xl shadow-lg border border-zinc-600 text-center">
               <h1 className="text-4xl font-bold text-red-400 mb-4">Eintrag nicht gefunden</h1>
               <p className="text-lg text-zinc-400 mb-6">
                  Der gesuchte Eintrag ist nicht verfügbar oder wurde möglicherweise gelöscht.
               </p>
               <Link href="/" passHref>
                  <button className="bg-zinc-600 hover:bg-zinc-600 border-2 border-zinc-700 text-white font-semibold py-2 px-6 rounded-md shadow-md transition duration-200">
                     Zurück zur Startseite
                  </button>
               </Link>
            </div>
         </div>
      );
   }

   const allEntries = await fetchAllEntries(token);
   const relevantEntries = allEntries.filter(
      (otherEntry) =>
         otherEntry.id !== entry.id &&
         otherEntry.categories.some((category) => entry.categories.includes(category))
   ).slice(0, 3);

   const getAvatarUrl = (id: string, avatar: string): string => {
      return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
   };

   return (
      <div className="min-h-screen bg-zinc-900 text-zinc-200 flex items-center justify-center py-12 px-6">
         <div className="max-w-3xl w-full p-8 rounded-xl shadow-2xl bg-zinc-800">
            <h2 className="text-3xl font-bold mb-4">{entry.entry}</h2>
            <div className="text-sm text-zinc-400 mb-6 flex items-center space-x-1">
               <Clock size={16} className="text-zinc-400" />
               <span>
                  {formatDistanceToNow(new Date(entry.timestamp), {
                     includeSeconds: true,
                     addSuffix: true,
                     locale: de,
                  })}{" "}
                  erstellt.
               </span>
            </div>

            {/* Variationen */}
            {entry.variation.length > 0 && (
               <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3 text-zinc-200">Variationen</h3>
                  <div className="bg-zinc-700 p-4 rounded-xl">
                     <ul className="list-disc ml-6 space-y-1">
                        {entry.variation.map((var1, index) => (
                           <li key={index} className="text-zinc-300">
                              {var1}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            )}

            {/* Kategorien */}
            {entry.categories.length > 0 && (
               <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3 text-zinc-200">Kategorien</h3>
                  <div className="flex flex-wrap gap-2">
                     {entry.categories.map((category, index) => (
                        <Link key={index} href={`/c/${category}`} passHref>
                           <span className="px-3 py-1 bg-zinc-700 border-2 border-zinc-700 text-zinc-200 rounded-full text-sm cursor-pointer hover:bg-zinc-800 transition-all duration-300">
                              {category}
                           </span>
                        </Link>
                     ))}
                  </div>
               </div>
            )}

            {/* Autor */}
            {user && (
               <div className="mt-8 flex items-center">
                  <Image
                     src={user.avatar ? getAvatarUrl(user.id, user.avatar) : "/default-avatar.png"}
                     alt={`${user.username}'s Avatar`}
                     width={36}
                     height={36}
                     className="rounded-full mr-4"
                     loading="lazy"
                  />
                  <span className="text-lg font-medium">von @{user.username}</span>
               </div>
            )}

            {/* Relevante Einträge */}
            {relevantEntries.length > 0 && (
               <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-3 text-zinc-200">Relevante Einträge</h3>
                  <div className="space-y-4">
                     {relevantEntries.map((relevantEntry) => (
                        <div key={relevantEntry.id} className="p-4 rounded-xl bg-zinc-700 border-2 border-zinc-700 transition-all transform hover:rounded-3xl hover:scale-[1.02] hover:bg-zinc-800">
                           <Link href={`/e/${relevantEntry.id}`} passHref>
                              <button className="text-zinc-300 text-lg font-medium transition-all hover:text-zinc-200">
                                 {relevantEntry.entry}
                              </button>
                           </Link>
                           <p className="text-zinc-400 text-sm mt-1">
                              {formatDistanceToNow(new Date(relevantEntry.timestamp), {
                                 includeSeconds: true,
                                 addSuffix: true,
                                 locale: de,
                              })}
                           </p>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default EntryPage;

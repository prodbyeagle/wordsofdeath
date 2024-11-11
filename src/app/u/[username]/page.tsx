/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { User, Entry } from "@/types";
import { BadgeCheck, BrainCog } from "lucide-react";
import Tooltip from "@/components/Tooltip";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface UserProfileProps {
   params: Promise<{ username: string }>;
}

const UserProfile = ({ params }: UserProfileProps) => {
   const [user, setUser] = useState<User | null>(null);
   const [entries, setEntries] = useState<Entry[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         const { username } = await params;

         try {
            const userResponse = await fetch(`http://localhost:3001/api/user/u/${username}`, {
               method: 'GET',
               headers: {
                  'Authorization': `Bearer ${document.cookie.split('=')[1]}`,
               },
            });

            if (userResponse.ok) {
               const userData = await userResponse.json();
               setUser(userData);

               const entriesResponse = await fetch(`http://localhost:3001/api/entries/u/${username}`, {
                  method: 'GET',
                  headers: {
                     'Authorization': `Bearer ${document.cookie.split('=')[1]}`,
                  },
               });

               if (entriesResponse.ok) {
                  const entriesData = await entriesResponse.json();
                  setEntries(entriesData);
               } else {
                  console.error("Fehler beim Abrufen der Einträge");
               }
            } else {
               console.error("Benutzer nicht gefunden");
               setUser(null);
            }
         } catch (error) {
            console.error("Fehler beim Abrufen der Benutzerdaten:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [params]);

   const getAvatarUrl = (id: string, avatar: string): string => {
      return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
   };

   if (loading) return <p>Lade Daten...</p>;

   return (
      <div className="min-h-screen bg-zinc-900 text-white p-4 flex flex-col md:flex-row gap-4">
         <div className="flex flex-col items-center md:items-start max-w-xs w-full p-6 rounded-xl shadow-md border border-zinc-700 bg-zinc-800">
            {user ? (
               <>
                  <Image
                     src={user.avatar ? getAvatarUrl(user.id, user.avatar) : "/default-avatar.png"}
                     alt={`${user.username}'s Avatar`}
                     width={96}
                     height={96}
                     className="rounded-full mb-4 border border-zinc-600 shadow-sm"
                     priority
                  />
                  <h2 className="text-2xl font-semibold mb-2 flex items-center">
                     @{user.username}
                     {user.roles.includes("admin") && (
                        <Tooltip delay={500} content="Admin">
                           <BadgeCheck className="ml-1 p-1 hover:bg-zinc-600 hover:scale-110 text-blue-600 rounded-md duration-100 transition-all" size={30} aria-label="Admin Badge" />
                        </Tooltip>
                     )}
                     {user.roles.includes("developer") && (
                        <Tooltip delay={500} content="Developer">
                           <BrainCog className=" p-1 hover:bg-zinc-600 hover:scale-110 text-fuchsia-400 rounded-md duration-100 transition-all" size={30} aria-label="Developer Badge" />
                        </Tooltip>
                     )}
                  </h2>
                  <p className="text-sm text-zinc-400">
                     Hat WordsOfDeath {formatDistanceToNow(new Date(user.joined_at), { addSuffix: true, locale: de })} betreten.
                  </p>
               </>
            ) : (
               <p className="text-zinc-400">Benutzer nicht gefunden.</p>
            )}
         </div>

         <div className="flex-1 p-6 rounded-xl shadow-md border border-zinc-700 bg-zinc-800">
            <h3 className="text-2xl font-semibold mb-6">Hochgeladene Einträge</h3>
            {entries.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {entries.map((entry) => (
                     <div key={entry._id} className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-semibold text-lg text-white mb-2">{entry.entry}</h4>

                        {entry.variation.length > 0 && (
                           <p className="text-sm text-zinc-400 mb-1">
                              Variationen:{" "}
                              <span className="text-zinc-300">{entry.variation.join(", ")}</span>
                           </p>
                        )}

                        {entry.categories.length > 0 && (
                           <p className="text-sm text-zinc-400 mb-2">
                              Kategorien:{" "}
                              <span className="text-zinc-300">{entry.categories.join(", ")}</span>
                           </p>
                        )}

                        <p className="text-xs text-zinc-500">Erstellt {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: de })}</p>
                     </div>
                  ))}
               </div>
            ) : (
               <p className="text-zinc-400">Noch keine Einträge hochgeladen.</p>
            )}
         </div>
      </div>
   );
};

export default UserProfile;

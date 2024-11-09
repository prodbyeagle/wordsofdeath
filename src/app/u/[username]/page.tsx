import React from "react";
import Image from "next/image";
import { getUser, connectToDatabase } from "@/db";
import { User, Entry } from "@/types";
import { BadgeCheck, BrainCog } from "lucide-react";
import Tooltip from "@/components/Tooltip";

interface UserProfileProps {
   params: Promise<{ username: string }>;
}

const UserProfile = async ({ params }: UserProfileProps) => {
   const { username } = await params;

   const user: User | null = (await getUser(username)) as User | null;

   const getEntriesByUser = async (user: string): Promise<Entry[]> => {
      const database = await connectToDatabase();
      return database.collection("entries").find({ author: user }).toArray() as Promise<Entry[]>;
   };

   let entries: Entry[] = [];
   if (user) {
      try {
         entries = await getEntriesByUser(user.username);
      } catch (error) {
         console.error("Fehler beim Abrufen der Einträge:", error);
      }
   }

   const getAvatarUrl = (id: string, avatar: string): string => {
      return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
   };

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
                     loading="lazy"
                  />
                  <h2 className="text-2xl font-semibold mb-2 flex items-center">
                     @{user.username}
                     {user.roles.includes("admin") && (
                        <Tooltip content="This user has admin privileges and can manage site settings and users.">
                           <BadgeCheck className="ml-1 p-1 hover:bg-zinc-600 hover:scale-110 text-blue-500 rounded-md duration-100 transition-all" size={30} aria-label="Admin Badge" />
                        </Tooltip>
                     )}
                     {user.roles.includes("developer") && (
                        <Tooltip content="This user contributed to the website and backend development.">
                           <BrainCog className="ml-1 p-1 hover:bg-zinc-600 hover:scale-110 text-neutral-300 rounded-md duration-100 transition-all" size={30} aria-label="Developer Badge" />
                        </Tooltip>
                     )}
                  </h2>
                  <p className="text-sm text-zinc-400">Beigetreten am: {new Date(user.joined_at).toLocaleDateString()}</p>
               </>
            ) : (
               <p className="text-zinc-400">Benutzer nicht gefunden.</p>
            )}
         </div>

         <div className="flex-1 p-6 rounded-xl shadow-md border border-zinc-700 bg-zinc-800">
            <h3 className="text-2xl font-semibold mb-6">Hochgeladene Einträge</h3>
            {entries.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                        <p className="text-xs text-zinc-500">Erstellt am: {new Date(entry.timestamp).toLocaleDateString()}</p>
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

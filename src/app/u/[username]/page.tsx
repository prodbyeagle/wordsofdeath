import React from "react";
import Image from "next/image";
import { getUser, connectToDatabase } from "@/db";
import { User, Entry } from "@/types";

const UserProfile = async ({ params }: { params: { username: string } }) => {
   const { username } = params;
   const user: User | null = await getUser(username) as User | null;

   const getEntriesByUser = async (user: string): Promise<Entry[]> => {
      const database = await connectToDatabase();
      return database.collection("entries").find({ author: user }).toArray() as Promise<Entry[]>;
   };

   let entries: Entry[] = [];
   if (user) {
      try {
         entries = await getEntriesByUser(user.username);
         console.log("Einträge für Benutzer:", username, entries); // Logging der abgerufenen Einträge
      } catch (error) {
         console.error("Fehler beim Abrufen der Einträge:", error);
      }
   }

   const getAvatarUrl = (id: string, avatar: string): string => {
      return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
   };

   return (
      <div className="min-h-screen bg-zinc-800 text-white p-4 flex flex-col md:flex-row">
         <div className="max-w-md w-full p-6 rounded-xl shadow-md border border-zinc-600 mb-4 md:mb-0 md:mr-4">
            {user ? (
               <>
                  <div className="flex items-center mb-4">
                     <Image
                        src={user.avatar ? getAvatarUrl(user.id, user.avatar) : "/default-avatar.png"}
                        alt={`${user.username}'s Avatar`}
                        width={48}
                        height={48}
                        className="rounded-full mr-4"
                        loading="lazy"
                     />
                     <h2 className="text-3xl font-semibold">@{user.username}</h2>
                  </div>
                  <p>Beigetreten am: {new Date(user.joined_at).toLocaleDateString()}</p>
               </>
            ) : (
               <p className="text-zinc-400">Benutzer nicht gefunden.</p>
            )}
         </div>

         <div className="flex-1 p-6 rounded-xl shadow-md border border-zinc-600">
            <h3 className="text-2xl font-semibold mb-4">Hochgeladene Einträge</h3>
            {entries.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {entries.map((entry) => (
                     <div key={entry._id} className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-md">
                        <h4 className="font-bold">{entry.entry}</h4>
                        {/* <p className="text-sm text-gray-400">Typ: {entry.type}</p> */}
                        <p className="text-sm text-gray-200">
                           Variationen: {entry.variation.length > 0 ? entry.variation.join(", ") : "Keine Variationen"}
                        </p>
                        <p className="text-sm text-gray-200">
                           Kategorien: {entry.categories.join(", ") || "Keine Kategorien"}
                        </p>
                        <p className="text-xs text-zinc-400">Erstellt am: {new Date(entry.timestamp).toLocaleDateString()}</p>
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

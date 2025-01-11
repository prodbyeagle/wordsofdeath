/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { UserRoleBadges } from "@/components/ui/UserRoleBadges";
import { TimeStamp } from "@/components/ui/Timestamp";
import { User, Entry } from "@/types";
import { Calendar, LibraryBig, Filter, Search } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { fetchEntriesByUsername, fetchUserDataByUsername, getAuthToken } from "@/lib/api";

interface UserProfileProps {
   params: Promise<{ username: string }>;
}

const UserProfile = ({ params }: UserProfileProps) => {
   const [user, setUser] = useState<User | null>(null);
   const [entries, setEntries] = useState<Entry[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

   useEffect(() => {
      const fetchData = async () => {
         const { username } = await params;

         try {
            const token = getAuthToken();

            if (token) {
               const userData = await fetchUserDataByUsername(username, token);
               setUser(userData);

               const userEntries = await fetchEntriesByUsername(username, token);
               setEntries(userEntries);
            } else {
               console.error("Auth token is null or undefined");
            }

         } catch (error) {
            console.error("Error fetching data:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [params]);


   const filteredAndSortedEntries = entries
      .filter((entry) =>
         entry.entry.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
         const timeA = new Date(a.timestamp).getTime();
         const timeB = new Date(b.timestamp).getTime();
         return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
      });


   if (loading) {
      return (
         <div className="min-h-screen bg-neutral-900 p-6 pt-20">
            <div className="max-w-6xl mx-auto">
               <div className="h-64 bg-neutral-800/50 rounded-2xl animate-pulse mb-6" />
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                     <div key={i} className="h-48 bg-neutral-800/50 rounded-xl animate-pulse" />
                  ))}
               </div>
            </div>
         </div>
      );
   }

   if (!user) {
      return (
         <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
            <div className="text-center">
               <h1 className="text-3xl font-bold text-neutral-100 mb-4">Benutzer nicht gefunden</h1>
               <p className="text-neutral-400 mb-8">Dieser Benutzer existiert nicht oder wurde gelöscht.</p>
               <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-100 transition-colors"
               >
                  Zurück
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-neutral-900 p-6 pt-20">
         <div className="max-w-6xl mx-auto">
            <div className="bg-neutral-800/50 rounded-2xl p-8 mb-8 border border-neutral-700/50 backdrop-blur-sm">
               <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="relative group">
                     <UserAvatar avatar={user.avatar} id={user.id} username={user.username} size="username" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                        <h1 className="text-4xl font-bold text-neutral-100">{user.username}</h1>
                        <div className="flex justify-center md:justify-start gap-1">
                           {user.roles?.map((role, index) => (
                              <UserRoleBadges key={index} roles={[role]} />
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-col md:flex-row gap-6 text-neutral-400">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                           <Calendar className="w-4 h-4" />
                           <TimeStamp timestamp={user.joined_at} showIcon={false} extended text="beigetreten" />
                        </div>
                        <div className="flex items-center text-sm justify-center md:justify-start gap-2">
                           <LibraryBig className="w-4 h-4" />
                           <span>{entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-neutral-800/50 rounded-xl p-4 mb-6 border border-neutral-700/50 backdrop-blur-sm">
               <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                     <input
                        type="text"
                        placeholder="Einträge durchsuchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-neutral-900/50 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                     />
                  </div>
                  <div className="flex gap-4">
                     <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                        className="bg-neutral-900/50 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600"
                     >
                        <option value="newest">Neueste zuerst</option>
                        <option value="oldest">Älteste zuerst</option>
                     </select>
                  </div>
               </div>
            </div>

            {filteredAndSortedEntries.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedEntries.map((entry) => (
                     <div
                        key={entry._id}
                        className="group bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50 hover:border-neutral-600 backdrop-blur-sm transition-all duration-300"
                     >
                        <p className="text-lg text-neutral-100 mb-4 line-clamp-3">{entry.entry}</p>
                        {entry.categories.length > 0 && (
                           <div className="flex flex-wrap gap-2 mb-4">
                              {entry.categories.map((category) => (
                                 <span
                                    key={category}
                                    className="text-xs px-3 py-1 rounded-full bg-neutral-900/50 text-neutral-300 border border-neutral-700/50"
                                 >
                                    {category}
                                 </span>
                              ))}
                           </div>
                        )}
                        <TimeStamp timestamp={entry.timestamp} />
                     </div>
                  ))}
               </div>
            ) : (
               <div className="bg-neutral-800/50 rounded-xl p-8 text-center border border-neutral-700/50 backdrop-blur-sm">
                  <Filter className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-neutral-100 mb-2">Keine Einträge gefunden</h3>
                  <p className="text-neutral-400">
                     {searchTerm
                        ? "Versuche es mit anderen Filtereinstellungen."
                        : "Dieser Benutzer hat noch keine Einträge erstellt."}
                  </p>
               </div>
            )}
         </div>
      </div>
   );
};

export default UserProfile;
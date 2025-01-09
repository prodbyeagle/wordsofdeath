/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { UserRoleBadges } from "@/components/UserRoleBadges";
import { TimeStamp } from "@/components/Timestamp";
import { User, Entry } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";

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
               method: "GET",
               headers: {
                  Authorization: `Bearer ${document.cookie.split("=")[1]}`,
               },
            });

            if (userResponse.ok) {
               const userData = await userResponse.json();
               setUser(userData);

               const entriesResponse = await fetch(`http://localhost:3001/api/entries/u/${username}`, {
                  method: "GET",
                  headers: {
                     Authorization: `Bearer ${document.cookie.split("=")[1]}`,
                  },
               });

               if (entriesResponse.ok) {
                  const entriesData = await entriesResponse.json();
                  setEntries(entriesData);
               }
            } else {
               setUser(null);
            }
         } catch (error) {
            console.error("Error fetching data:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [params]);

   if (loading) {
      return (
         <div className="min-h-screen bg-neutral-900 p-6 pt-20">
            <div className="max-w-7xl mx-auto">
               <div className="flex flex-col lg:flex-row gap-8">
                  {/* Profile Skeleton */}
                  <div className="w-full lg:w-80 bg-neutral-800/50 rounded-2xl p-6 backdrop-blur-sm">
                     <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-neutral-700 animate-pulse" />
                        <div className="w-48 h-6 mt-4 bg-neutral-700 rounded animate-pulse" />
                        <div className="w-36 h-4 mt-3 bg-neutral-700 rounded animate-pulse" />
                     </div>
                  </div>

                  {/* Entries Skeleton */}
                  <div className="flex-1 bg-neutral-800/50 rounded-2xl p-6 backdrop-blur-sm">
                     <div className="w-48 h-8 bg-neutral-700 rounded animate-pulse mb-8" />
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                           <div key={i} className="bg-neutral-800 rounded-xl p-4 animate-pulse">
                              <div className="w-3/4 h-5 bg-neutral-700 rounded mb-3" />
                              <div className="w-1/2 h-4 bg-neutral-700 rounded mb-2" />
                              <div className="w-1/3 h-3 bg-neutral-700 rounded mt-4" />
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-neutral-900 p-6 pt-20">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
               <div className="w-full lg:w-80 bg-neutral-800/50 rounded-2xl p-6 backdrop-blur-sm border border-neutral-700/50">
                  {user ? (
                     <div className="flex flex-col items-center">
                        <div className="relative">
                           <img
                              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`}
                              alt={user.username}
                              className="w-32 h-32 rounded-full border-4 border-neutral-700/50 duration-300"
                           />
                           <div className="absolute -bottom-2 -right-2 bg-neutral-800 rounded-full p-1.5 border border-neutral-700">
                              <div className="flex gap-1.5">
                                 {user.roles?.map((role, index) => (
                                    <UserRoleBadges key={index} roles={[role]} />
                                 ))}
                              </div>
                           </div>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold bg-clip-text text-neutral-100">
                           {user.username}
                        </h2>
                        <p className="mt-2 text-sm text-neutral-400">
                           Mitglied seit {formatDistanceToNow(new Date(user.joined_at), { addSuffix: true, locale: de })}
                        </p>
                     </div>
                  ) : (
                     <div className="text-center py-8">
                        <p className="text-neutral-400">Benutzer nicht gefunden</p>
                     </div>
                  )}
               </div>

               <div className="flex-1 bg-neutral-800/50 rounded-2xl p-6 backdrop-blur-sm border border-neutral-700/50">
                  <h3 className="text-2xl font-bold mb-6 bg-clip-text text-neutral-100">
                     {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'}
                  </h3>
                  {entries.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {entries.map((entry) => (
                           <Link key={entry._id} href={`/e/${entry.id}`}>
                              <div className="group bg-neutral-900/50 rounded-xl p-4 border border-neutral-800 hover:border-neutral-600 transition-all duration-300 hover:scale-[1.02]">
                                 <h4 className="font-semibold text-lg text-neutral-100 group-hover:text-neutral-100 mb-2 truncate">
                                    {entry.entry}
                                 </h4>
                                 {entry.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                       {entry.categories.map((category) => (
                                          <span key={category} className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-400">
                                             {category}
                                          </span>
                                       ))}
                                    </div>
                                 )}
                                 <TimeStamp timestamp={entry.timestamp} />
                              </div>
                           </Link>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-12">
                        <p className="text-neutral-400">Keine Einträge vorhanden</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default UserProfile;
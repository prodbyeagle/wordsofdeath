/* eslint-disable react-hooks/exhaustive-deps */
"use client";
// src/app/c/[name]/page.tsx

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Entry } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface CategoryPageProps {
   params: Promise<{ name: string }>
}

const CategoryPage = ({ params }: CategoryPageProps) => {
   const [entries, setEntries] = useState<Entry[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchEntriesByCategory = async () => {
         const { name } = await params
         try {
            const response = await fetch(`http://localhost:3001/api/categories/${name}`, {
               method: "GET",
               headers: {
                  'Authorization': `Bearer ${document.cookie.split('=')[1]}`,
               },
            });
            if (response.ok) {
               const data = await response.json();
               setEntries(data);
            } else {
               setEntries([]);
            }
         } catch (error) {
            console.error("Fehler beim Abrufen der Einträge:", error);
            setEntries([]);
         } finally {
            setLoading(false);
         }
      };

      fetchEntriesByCategory();
   }, []);

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
            <div className="text-center p-8 bg-zinc-800 rounded-lg shadow-lg border border-zinc-600">
               <p className="text-xl text-zinc-400">Lade Einträge...</p>
            </div>
         </div>
      );
   }

   if (entries.length === 0) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
            <div className="text-center p-8 bg-zinc-800 rounded-lg shadow-lg border border-zinc-600">
               <h1 className="text-3xl font-bold mb-4">Keine Einträge in dieser Kategorie</h1>
               <p className="text-zinc-400 mb-6">
                  Es wurden keine Einträge für die Kategorie gefunden.
               </p>
               <Link href="/" passHref>
                  <button className="bg-zinc-700 hover:bg-zinc-600 border border-zinc-500 text-white font-semibold py-2 px-6 rounded-md transition">
                     Zurück zur Startseite
                  </button>
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-zinc-900 text-zinc-200 py-12 px-6">
         <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">
               Einträge in der Kategorie
            </h1>
            <div className="space-y-4">
               {entries.map((entry) => (
                  <div key={entry.id} className="p-4 bg-zinc-800 rounded-lg shadow-lg border border-zinc-600">
                     <Link href={`/e/${entry.id}`} passHref>
                        <h2 className="text-2xl font-semibold mb-2 text-zinc-300 hover:text-zinc-100 transition">
                           {entry.entry}
                        </h2>
                     </Link>
                     <p className="text-sm text-zinc-400">
                        {formatDistanceToNow(new Date(entry.timestamp), {
                           includeSeconds: true,
                           addSuffix: true,
                           locale: de,
                        })}{" "}
                        erstellt.
                     </p>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

export default CategoryPage;

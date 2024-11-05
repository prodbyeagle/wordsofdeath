'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Dropdown from './Dropdown';
import { User } from '@/types';
import { LogOut, Shield, User as UserIcon } from 'lucide-react';
import { Entry } from '@/types'; // Importiere das Entry-Interface

const Navbar = () => {
   const [user, setUser] = useState<User | null>(null);
   const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
   const [searchTerm, setSearchTerm] = useState<string>('');
   const [suggestions, setSuggestions] = useState<Entry[]>([]); // Hier wird der Typ auf Entry[] geändert
   const [categories, setCategories] = useState<string[]>([]);
   const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

   const getAvatarUrl = (id: string, avatar: string): string => {
      return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
   };

   useEffect(() => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='));
      if (token) {
         const tokenValue = token.split('=')[1];
         const decoded = JSON.parse(atob(tokenValue.split('.')[1])) as User;

         setUser({
            username: decoded.username,
            avatar: decoded.avatar,
            id: decoded.id,
            joined_at: decoded.joined_at,
            roles: decoded.roles,
         });
      }
   }, []);

   const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
   };

   const handleLogout = () => {
      document.cookie = 'wordsofdeath=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
      window.location.href = '/signin';
   };

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);

      // Clear previous debounce timer
      if (debounceTimer) {
         clearTimeout(debounceTimer);
      }

      // Set new debounce timer
      if (value.length > 2) {
         const timer = setTimeout(async () => {
            const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/search?q=${value}`);
            const data = await response.json();

            setSuggestions(data.words || []); // Typanpassung hier
            setCategories(data.categories || []);
         }, 500);

         setDebounceTimer(timer);
      } else {
         setSuggestions([]);
         setCategories([]);
      }
   };

   return (
      <nav className="p-2 bg-zinc-900 backdrop-blur-xl flex justify-between items-center">
         <Link href="/" className="text-xl ml-1 font-bold border border-zinc-900 text-white hover:bg-zinc-800 hover:border-zinc-700 rounded-md p-1 duration-100 transition-all">
            WOD
         </Link>

         <div className="relative">
            <input
               type="text"
               value={searchTerm}
               onChange={handleSearchChange}
               placeholder="Suche..."
               className="p-2 rounded-md bg-zinc-800 text-white border border-zinc-600 focus:outline-none focus:border-amber-300 transition-all"
            />
            {suggestions.length > 0 && (
               <div className="absolute left-0 right-0 bg-zinc-900 rounded-md shadow-lg mt-1 z-10">
                  <ul className="max-h-60 overflow-y-auto">
                     {suggestions.map((word) => (
                        <li
                           key={word._id}
                           className="px-4 py-2 hover:bg-zinc-700 cursor-pointer transition-colors duration-200"
                           onClick={() => window.location.href = `/${word.id}`}
                        >
                           <div className="flex flex-col">
                              <strong className="text-white text-lg">{word.entry}</strong>
                              <div className="text-zinc-400 text-sm">
                                 {word.categories.join(', ')}
                              </div>
                           </div>
                        </li>
                     ))}
                  </ul>
               </div>
            )}
            {categories.length > 0 && (
               <div className="mt-2">
                  <h3 className="text-sm font-semibold text-white">Kategorien:</h3>
                  <ul className="text-zinc-400">
                     {categories.map((category, index) => (
                        <li key={index} className="py-1">{category}</li>
                     ))}
                  </ul>
               </div>
            )}
         </div>

         {user && (
            <div onClick={toggleDropdown} className="mr-1 relative flex items-center space-x-3 border border-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 rounded-md p-1 duration-100 transition-all">
               <span className="text-white font-medium cursor-pointer">
                  {user.username}
               </span>
               <Image
                  src={getAvatarUrl(user.id, user.avatar)}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full cursor-pointer"
                  onClick={toggleDropdown}
               />
               <Dropdown isOpen={dropdownOpen} toggleDropdown={toggleDropdown}>
                  <div className="bg-zinc-800 rounded-md shadow-lg p-1 space-y-1">
                     <Link href={`/dashboard`} className="flex items-center rounded-md px-4 py-2 text-base text-gray-200 hover:bg-zinc-600 duration-100 transition-all">
                        <Shield className="mr-2 w-5 h-5" /> Admin
                     </Link>
                     <Link href={`/u/${user.username}`} className="flex items-center rounded-md px-4 py-2 text-base text-gray-200 hover:bg-zinc-600 duration-100 transition-all">
                        <UserIcon className="mr-2 w-5 h-5" /> Konto
                     </Link>
                     <hr className="border-zinc-600 border-t" />
                     <Link href={`https://wordsofdeath-backend.vercel.app`} className="flex items-center rounded-md px-4 py-2 text-base text-amber-200 hover:bg-amber-600/30 duration-100 transition-all" onClick={handleLogout}>
                        <LogOut className="mr-2 w-5 h-5" /> Abmelden
                     </Link>
                  </div>
               </Dropdown>
            </div>
         )}
      </nav>
   );
};

export default Navbar;

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Dropdown from './Dropdown';
import { User, Entry } from '@/types';
import { Database, LogOut, Shield, User as UserIcon, Home } from 'lucide-react';

const Navbar = () => {
   const [user, setUser] = useState<User | null>(null);
   const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
   const [searchTerm, setSearchTerm] = useState<string>('');
   const [suggestions, setSuggestions] = useState<Entry[]>([]);
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
            joined_at: decoded.joined_at, // not in token
            roles: decoded.roles, // not in token
         });
      }
   }, []);

   const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

   const handleLogout = () => {
      document.cookie = 'wordsofdeath=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
      window.location.href = '/signin';
   };

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);

      if (debounceTimer) clearTimeout(debounceTimer);

      if (value.length > 2) {
         const timer = setTimeout(async () => {
            const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='))?.split('=')[1];

            if (!token) return;
            const response = await fetch(`http://localhost:3001/api/search?q=${value}`, {
               method: "GET",
               headers: {
                  'Authorization': `Bearer ${token}`,
               },
            });

            const data = await response.json();

            setSuggestions(data.words || []);
            setCategories(data.categories || []);
         }, 750);

         setDebounceTimer(timer);
      } else {
         setSuggestions([]);
         setCategories([]);
      }
   };

   return (
      <nav className="p-2 bg-zinc-900 backdrop-blur-xl flex flex-col md:flex-row md:justify-between items-center space-y-2 md:space-y-0 ">
         <div className="flex items-center space-x-2">
            <Link href="/" className="rounded-md p-2 duration-100 transition-all">
               <Home
                  size={42}
                  className="border text-white hover:scale-[1.08] bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-600 border-zinc-900 rounded-md p-2 duration-100 transition cursor-pointer" />
            </Link>

            {user && (
               <div onClick={toggleDropdown} className="relative flex items-center space-x-3 border border-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 rounded-md p-1 duration-100 transition-all">
                  <Image
                     src={getAvatarUrl(user.id, user.avatar)}
                     alt="User avatar"
                     width={32}
                     height={32}
                     className="rounded-full cursor-pointer"
                     onClick={toggleDropdown}
                     loading='lazy'
                  />
                  <span className="text-white font-medium cursor-pointer">
                     {user.username}
                  </span>
                  <Dropdown isOpen={dropdownOpen} toggleDropdown={toggleDropdown}>
                     <div className="bg-zinc-800 rounded-md shadow-lg p-1 space-y-1 z-20">
                        <Link href={`/admin`} className="flex items-center rounded-md px-4 py-2 text-base text-sky-200 hover:bg-sky-400/30 duration-100 transition-all">
                           <Shield className="mr-2 w-5 h-5" /> Admin
                        </Link>
                        <Link href={`/u/${user.username}`} className="flex items-center rounded-md px-4 py-2 text-base text-gray-200 hover:bg-zinc-600 duration-100 transition-all">
                           <UserIcon className="mr-2 w-5 h-5" /> Konto
                        </Link>
                        <hr className="border-zinc-600 border-t" />
                        <Link href={`http://localhost:3001`} className="flex items-center rounded-md px-4 py-2 text-base text-amber-200 hover:bg-amber-600/30 duration-100 transition-all" onClick={handleLogout}>
                           <Database className="mr-2 w-5 h-5" /> Backend
                        </Link>
                        <div onClick={toggleDropdown} className="flex items-center cursor-pointer rounded-md px-4 py-2 text-base text-red-400 hover:bg-red-400/30 duration-100 transition-all">
                           <LogOut className="mr-2 w-5 h-5" /> Abmelden
                        </div>
                     </div>
                  </Dropdown>
               </div>
            )}
         </div>

         <div className="relative w-full md:w-1/2 lg:w-1/3 mr-2">
            <input
               type="text"
               value={searchTerm}
               onChange={handleSearchChange}
               placeholder="Suche..."
               className="w-full p-2 rounded-md bg-zinc-800 text-white border border-zinc-600 focus:outline-none focus:outline-amber-300 transition-all"
            />
            {suggestions.length > 0 && (
               <div className="absolute left-0 right-0 bg-zinc-900 rounded-md shadow-lg font-light mt-1 z-10">
                  <ul className="max-h-60 overflow-y-auto space-y-1">
                     {suggestions.map((word) => (
                        <li
                           key={word._id}
                           className="px-4 py-2 hover:bg-zinc-700 rounded-md cursor-pointer transition-colors duration-100"
                           onClick={() => window.location.href = `/e/${word.id}`}
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
                  <hr className="border-zinc-600 border-t" />
                  <h3 className="text-sm font-semibold text-white">Kategorien:</h3>
                  <ul className="text-zinc-400">
                     {categories.map((category, index) => (
                        <li key={index} className="py-1">{category}</li>
                     ))}
                  </ul>
               </div>
            )}
         </div>
      </nav>
   );
};

export default Navbar;

// src/components/Navbar.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Dropdown from './Dropdown';
import { User } from '@/types';

const Navbar = () => {
   const [user, setUser] = useState<User | null>(null);
   const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

   const getAvatarUrl = (id: string, avatar: string): string => {
      return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
   };

   useEffect(() => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wod_token='));
      if (token) {
         const tokenValue = token.split('=')[1];
         const decoded = JSON.parse(atob(tokenValue.split('.')[1])) as User;

         setUser({
            username: decoded.username,
            avatar: decoded.avatar,
            id: decoded.id,
            joined_at: decoded.joined_at, // does not exist in the JWT payload.
         });
      }
   }, []);

   const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
   };

   const handleLogout = () => {
      document.cookie = 'wod_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
      window.location.href = '/signin';
   };

   return (
      <nav className="p-2 bg-zinc-900 backdrop-blur-xl flex justify-between items-center">
         <Link href="/" className="text-xl font-bold text-white">
            WordsOfDeath
         </Link>
         {user && (
            <div onClick={toggleDropdown} className="relative flex items-center space-x-3 border border-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 rounded-md p-1 duration-100 transition-all">
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
                  <>
                     <Link href="/settings" className="block px-4 py-2 text-sm text-gray-200 hover:bg-zinc-600 duration-100 transition-all">
                        Einstellungen
                     </Link>
                     <Link href={`/u/${user.username}`} className="block px-4 py-2 text-sm text-gray-200 hover:bg-zinc-600 duration-100 transition-all">
                        Konto
                     </Link>
                     <button
                        className="block w-full text-left text-sm px-4 py-2 text-red-600 hover:bg-red-600/30 duration-100 transition-all"
                        onClick={handleLogout}
                     >
                        Ausloggen
                     </button>
                     <div className="block px-4 py-2 text-sm text-gray-400 cursor-default opacity-50">
                        Neuer Eintrag
                     </div>
                  </>
               </Dropdown>
            </div>
         )}
      </nav>
   );
};

export default Navbar;

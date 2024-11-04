'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Dropdown from './Dropdown';
import { User } from '@/types';
import { LogOut, Shield, User as UserIcon, Plus } from 'lucide-react';

const Navbar = () => {
   const [user, setUser] = useState<User | null>(null);
   const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

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
            joined_at: decoded.joined_at, // does not exist in the JWT payload.
            roles: decoded.roles, // does not exist in the JWT payload.
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

   return (
      <nav className="p-2 bg-zinc-900 backdrop-blur-xl flex justify-between items-center">
         <Link href="/" className="text-xl ml-1 font-bold border border-zinc-900 text-white hover:bg-zinc-800 hover:border-zinc-700 rounded-md p-1 duration-100 transition-all">
            WOD | add dynamic entry pages /e/:_id | update the ui a bit (its boring) | fix the vercel cookie error (or just use localstorage...) | add searchbar (intelligente)
         </Link>
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
                     <hr className="border-zinc-600 border-t" />
                     <Link href={`/new`} className="flex items-center rounded-md px-4 py-2 text-base text-gray-200 hover:bg-zinc-600 duration-100 transition-all">
                        <Plus className="mr-2 w-5 h-5" /> Neuer Eintrag
                     </Link>
                     <Link href={`/u/${user.username}`} className="flex items-center rounded-md px-4 py-2 text-base text-gray-200 hover:bg-zinc-600 duration-100 transition-all">
                        <UserIcon className="mr-2 w-5 h-5" /> Konto
                     </Link>
                     <hr className="border-zinc-600 border-t" />
                     <button
                        className="flex items-center w-full text-left rounded-md text-base px-4 py-2 text-red-600 hover:bg-red-600/30 duration-100 transition-all"
                        onClick={handleLogout}
                     >
                        <LogOut className="mr-2 w-5 h-5" /> Ausloggen
                     </button>
                  </div>
               </Dropdown>

            </div>
         )}
      </nav>
   );
};

export default Navbar;

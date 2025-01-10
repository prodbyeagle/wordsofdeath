'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { UserAvatar } from './UserAvatar';
import { User } from '@/types';
import { LogOut, Shield, CircleUserRound, Home, Menu } from 'lucide-react';

const Navbar = () => {
   const [user, setUser] = useState<User | null>(null);
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

   const menuRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='));
      if (token) {
         const tokenValue = token.split('=')[1];
         const decoded = JSON.parse(atob(tokenValue.split('.')[1])) as User;
         setUser(decoded);
      }
   }, []);

   const handleLogout = () => {
      document.cookie = 'wordsofdeath=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
      window.location.href = '/';
   };

   const handleMenuSelect = () => {
      setIsMenuOpen(false);
      setIsMobileMenuOpen(false);
   };

   return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/30 backdrop-blur-xl border-b border-neutral-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
               <div className="flex items-center">
                  <Link href="/" className="p-2 rounded-lg hover:bg-neutral-800 transition-colors">
                     <Home className="w-6 h-6 text-neutral-100" />
                  </Link>
               </div>

               <div className="flex items-center">
                  <button
                     onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                     className="md:hidden p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                     <Menu className="w-6 h-6 text-neutral-100" />
                  </button>

                  {user && (
                     <div className="hidden md:block">
                        <div ref={menuRef} className="relative">
                           <button
                              onClick={() => setIsMenuOpen(!isMenuOpen)}
                              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
                           >
                              <UserAvatar avatar={user.avatar} username={user.username} id={user.id} />
                              <span className="text-neutral-100 font-medium">{user.username}</span>
                           </button>

                           {isMenuOpen && (
                              <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 overflow-hidden">
                                 <Link
                                    href={`/u/${user.username}`}
                                    className="flex items-center px-4 py-3 text-neutral-100 hover:bg-neutral-700 transition-colors"
                                    onClick={handleMenuSelect}
                                 >
                                    <CircleUserRound className="w-5 h-5 mr-3" />
                                    Account
                                 </Link>
                                 <Link
                                    href="/admin"
                                    className="flex items-center px-4 py-3 text-neutral-100 hover:bg-neutral-700 transition-colors border-t border-neutral-700"
                                    onClick={handleMenuSelect}
                                 >
                                    <Shield className="w-5 h-5 mr-3" />
                                    Admin
                                 </Link>
                                 <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-400/20 transition-colors border-t border-neutral-700"
                                 >
                                    <LogOut className="w-5 h-5 mr-3" />
                                    Abmelden
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {isMobileMenuOpen && (
               <div className="md:hidden border-t border-neutral-700">

                  {user && (
                     <div className="pb-4 px-4">
                        <div className="space-y-1">
                           <Link
                              href={`/u/${user.username}`}
                              className="flex items-center px-4 py-3 text-neutral-100 hover:bg-neutral-700 rounded-lg transition-colors mt-4"
                              onClick={handleMenuSelect}
                           >
                              <CircleUserRound className="w-5 h-5 mr-3" />
                              Account
                           </Link>
                           <Link
                              href="/admin"
                              className="flex items-center px-4 py-3 text-neutral-100 hover:bg-neutral-700 rounded-lg transition-colors"
                              onClick={handleMenuSelect}
                           >
                              <Shield className="w-5 h-5 mr-3" />
                              Admin
                           </Link>
                           <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                           >
                              <LogOut className="w-5 h-5 mr-3" />
                              Abmelden
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            )}
         </div>
      </nav>
   );
};

export default Navbar;
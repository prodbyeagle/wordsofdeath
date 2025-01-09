'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Entry } from '@/types';
import { LogOut, Shield, CircleUserRound, Home, Search, X, Menu } from 'lucide-react';

const Navbar = () => {
   const [user, setUser] = useState<User | null>(null);
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const [isSearchActive, setIsSearchActive] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [suggestions, setSuggestions] = useState<Entry[]>([]);
   const [isLoading, setIsLoading] = useState(false);

   const searchRef = useRef<HTMLDivElement>(null);
   const menuRef = useRef<HTMLDivElement>(null);
   const searchInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      const token = document.cookie.split('; ').find(row => row.startsWith('wordsofdeath='));
      if (token) {
         const tokenValue = token.split('=')[1];
         const decoded = JSON.parse(atob(tokenValue.split('.')[1])) as User;
         setUser(decoded);
      }

      const handleClickOutside = (event: MouseEvent) => {
         if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setIsSearchActive(false);
         }
         if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const handleSearch = async (value: string) => {
      if (value.length <= 2) {
         setSuggestions([]);
         return;
      }

      setIsLoading(true);
      const token = document.cookie
         .split('; ')
         .find(row => row.startsWith('wordsofdeath='))
         ?.split('=')[1];

      if (!token) return;

      try {
         const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/search?q=${value}`, {
            headers: { 'Authorization': `Bearer ${token}` },
         });
         const data = await response.json();
         setSuggestions(data.words || []);
      } catch (error) {
         console.error('Search error:', error);
      } finally {
         setIsLoading(false);
      }
   };

   const handleSearchFocus = () => {
      setIsSearchActive(true);
      if (searchInputRef.current) {
         searchInputRef.current.focus();
      }
   };

   const handleSearchSelect = (word: Entry) => {
      setSearchTerm(word.entry);
      setIsSearchActive(false);
      setIsMobileMenuOpen(false);
   };

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

                  <div className="hidden md:block ml-4">
                     <div ref={searchRef} className="relative">
                        <div
                           className={`flex items-center bg-neutral-800 rounded-lg transition-all duration-200 ${isSearchActive ? 'w-[300px]' : 'w-[200px]'}`}
                        >
                           <Search className="w-5 h-5 text-neutral-400 ml-3" />
                           <input
                              ref={searchInputRef}
                              type="text"
                              value={searchTerm}
                              onChange={(e) => {
                                 setSearchTerm(e.target.value);
                                 handleSearch(e.target.value);
                              }}
                              onFocus={handleSearchFocus}
                              placeholder="Suche..."
                              className="w-full px-3 py-2 bg-transparent text-neutral-100 placeholder-neutral-400 focus:outline-none"
                           />
                           {searchTerm && (
                              <button
                                 onClick={() => {
                                    setSearchTerm('');
                                    setSuggestions([]);
                                 }}
                                 className="p-2 hover:bg-neutral-700 rounded-lg transition-colors mr-1"
                              >
                                 <X className="w-4 h-4 text-neutral-400" />
                              </button>
                           )}
                        </div>


                        {isSearchActive && (searchTerm.length > 2 || suggestions.length > 0) && (
                           <div className="absolute top-full left-0 w-full mt-2 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 overflow-hidden">
                              {isLoading ? (
                                 <div className="p-4 text-center text-neutral-400">Suche...</div>
                              ) : suggestions.length > 0 ? (
                                 <div className="max-h-[400px] overflow-y-auto">
                                    {suggestions.map((word) => (
                                       <Link
                                          href={`/e/${word.id}`}
                                          key={word._id}
                                          className="block px-4 py-3 hover:bg-neutral-700 transition-colors border-b border-neutral-700 last:border-none"
                                          onClick={() => handleSearchSelect(word)}
                                       >
                                          <div className="font-medium text-neutral-100">{word.entry}</div>
                                          <div className="text-sm text-neutral-400 mt-1">
                                             {word.categories.join(', ')}
                                          </div>
                                       </Link>
                                    ))}
                                 </div>
                              ) : searchTerm.length > 2 && (
                                 <div className="p-4 text-center text-neutral-400">
                                    Keine Ergebnisse gefunden
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  </div>
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
                              <Image
                                 src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`}
                                 alt={user.username}
                                 width={32}
                                 height={32}
                                 className="rounded-full"
                                 unoptimized
                              />
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
                  <div className="p-4">
                     <div className="relative">
                        <div className="flex items-center bg-neutral-800 rounded-lg">
                           <Search className="w-5 h-5 text-neutral-400 ml-3" />
                           <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => {
                                 setSearchTerm(e.target.value);
                                 handleSearch(e.target.value);
                              }}
                              placeholder="Suche..."
                              className="w-full px-3 py-2 bg-transparent text-neutral-100 placeholder-neutral-400 focus:outline-none"
                           />
                           {searchTerm && (
                              <button
                                 onClick={() => {
                                    setSearchTerm('');
                                    setSuggestions([]);
                                 }}
                                 className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                              >
                                 <X className="w-4 h-4 text-neutral-400" />
                              </button>
                           )}
                        </div>

                        {(searchTerm.length > 2 || suggestions.length > 0) && (
                           <div className="absolute left-0 right-0 mt-2 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 overflow-hidden">
                              {isLoading ? (
                                 <div className="p-4 text-center text-neutral-400">Suche...</div>
                              ) : suggestions.length > 0 ? (
                                 <div className="max-h-[300px] overflow-y-auto">
                                    {suggestions.map((word) => (
                                       <Link
                                          href={`/e/${word.id}`}
                                          key={word._id}
                                          className="block px-4 py-3 hover:bg-neutral-700 transition-colors border-b border-neutral-700 last:border-none"
                                          onClick={() => handleSearchSelect(word)}
                                       >
                                          <div className="font-medium text-neutral-100">{word.entry}</div>
                                          <div className="text-sm text-neutral-400 mt-1">
                                             {word.categories.join(', ')}
                                          </div>
                                       </Link>
                                    ))}
                                 </div>
                              ) : searchTerm.length > 2 && (
                                 <div className="p-4 text-center text-neutral-400">
                                    Keine Ergebnisse gefunden
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  </div>

                  {user && (
                     <div className="pb-4 px-4">
                        <div className="space-y-1">
                           <Link
                              href={`/u/${user.username}`}
                              className="flex items-center px-4 py-3 text-neutral-100 hover:bg-neutral-700 rounded-lg transition-colors"
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
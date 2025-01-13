'use client'

import { useState, useEffect } from 'react';
import { Whitelist } from '@/types';
import { UserX, UserPlus, Search, User, UserCheck, X, CircleSlash } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { TimeStamp } from '@/components/ui/Timestamp';
import { addUserToWhitelist, fetchAdminStatus, fetchWhitelistedUsers, getAuthToken, removeUserFromWhitelist } from '@/lib/api';
import { AdminDeniedPage } from '@/components/ui/AdminDenied';
import { Input } from '@/components/ui/Input';

const Admin = () => {
   const [whitelistedUsers, setWhitelistedUsers] = useState<Whitelist[]>([]);
   const [newUser, setNewUser] = useState('');
   const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
   const [isRemoveUserDialogOpen, setIsRemoveUserDialogOpen] = useState(false);
   const [userToRemove, setUserToRemove] = useState<Whitelist | null>(null);
   const [loading, setLoading] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [isAdmin, setIsAdmin] = useState(false);

   useEffect(() => {
      const token = getAuthToken();
      if (!token) return;

      const init = async () => {
         try {
            const isAdminStatus = await fetchAdminStatus(token);
            setIsAdmin(isAdminStatus);
            if (!isAdminStatus) return null;

            const whitelist = await fetchWhitelistedUsers(token);
            setWhitelistedUsers(whitelist);
         } catch (error) {
            console.error(error);
         } finally {
            setLoading(false);
         }
      };

      init();
   }, []);

   const handleAddUser = async () => {
      if (!newUser.trim() || !isAdmin) return;

      const token = getAuthToken();
      if (!token) return;

      try {
         const addedUser = await addUserToWhitelist(token, newUser);
         if (addedUser) {
            setWhitelistedUsers((prev) => [...prev, addedUser]);
            setNewUser("");
            setIsAddUserDialogOpen(false);
         }
      } catch (error) {
         console.error(error);
      }
   };

   const handleRemoveUser = async (username: string) => {
      if (!username || !isAdmin) return;

      const token = getAuthToken();
      if (!token) return;

      try {
         const success = await removeUserFromWhitelist(token, username);
         if (success) {
            setWhitelistedUsers((prev) =>
               prev.filter((user) => user.username !== username)
            );
            setIsRemoveUserDialogOpen(false);
         }
      } catch (error) {
         console.error(error);
      }
   };

   const filteredUsers = whitelistedUsers.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
   );

   if (!isAdmin) {
      return <AdminDeniedPage />;
   }

   if (loading) {
      return (
         <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
            <div className="flex items-center gap-3">
               <span className="text-neutral-300">Lade Whitelist...</span>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-neutral-900 p-6 pt-24">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
               <div>
                  <h1 className="text-4xl font-bold text-white">Whitelist-Verwaltung</h1>
                  <p className="text-neutral-400 mt-2">Verwalte die Benutzer, die auf die Anwendung zugreifen dürfen</p>
               </div>
               <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64 flex items-center">
                     <div className="absolute left-3 flex items-center justify-center h-full">
                        <Search className="text-neutral-400 w-5 h-5" />
                     </div>
                     <Input
                        type="text"
                        icon={Search}
                        placeholder="Suche nach Benutzern..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
                  {isAdmin && (
                     <Button
                        onClick={() => setIsAddUserDialogOpen(true)}
                        className="px-5 py-2.5"
                        variant="secondary"
                        icon={UserPlus}
                        content='Benutzer Hinzufügen'
                     >
                     </Button>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredUsers.map(user => (
                  <span key={user._id || user.username} className="block group">
                     <article className="h-full bg-neutral-800/50 rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-500/50 transition-all duration-300">
                        <div className="p-4">
                           <header className="flex items-center space-x-3">
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium text-neutral-200 truncate">
                                       {user.username}
                                    </span>
                                 </div>
                                 <TimeStamp timestamp={user.added_at} live />
                              </div>
                              {isAdmin && (
                                 <Button
                                    onClick={() => {
                                       setUserToRemove(user);
                                       setIsRemoveUserDialogOpen(true);
                                    }}
                                    variant="destructive"
                                    icon={UserX}
                                    content='Entfernen'
                                 >
                                 </Button>
                              )}
                           </header>
                        </div>
                     </article>
                  </span>
               ))}
            </div>
         </div>

         <Dialog isOpen={isAddUserDialogOpen} onClose={() => setIsAddUserDialogOpen(false)} title="Benutzer hinzufügen">
            <div className="p-4">
               <Input
                  type="text"
                  value={newUser}
                  icon={User}
                  onChange={(e) => setNewUser(e.target.value)}
                  placeholder="Benutzernamen eingeben..."
                  className="mb-4"
               />
               <Button
                  onClick={() => handleAddUser()}
                  disabled={newUser.length < 3 || !isAdmin}
                  className="w-full"
                  icon={UserCheck}
               >
                  Hinzufügen
               </Button>
            </div>
         </Dialog>

         <Dialog
            isOpen={isRemoveUserDialogOpen}
            onClose={() => setIsRemoveUserDialogOpen(false)}
            title={`Benutzer ${userToRemove?.username}`}
         >
            <div className="p-4">
               <p className="text-neutral-400">Möchten Sie den Benutzer <strong>{userToRemove?.username}</strong> wirklich entfernen?</p>
               <Button
                  onClick={() => handleRemoveUser(userToRemove?.username || '')}
                  variant="destructive"
                  className="w-full mt-4"
                  icon={X}
                  content='Ja. Entfernen'
               >
               </Button>
               <Button
                  onClick={() => setIsRemoveUserDialogOpen(false)}
                  variant="primary"
                  className="w-full mt-4"
                  icon={CircleSlash}
                  content='Nein. Doch nicht'
               >
               </Button>
            </div>
         </Dialog>
      </div>
   );
};

export default Admin;

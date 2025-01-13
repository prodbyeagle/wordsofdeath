'use client'

import { useState, useEffect } from 'react';
import { Whitelist } from '@/types';
import { UserX, Search, User, UserCheck, X, CircleSlash, Badge, UserPlus, UserCircle } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { TimeStamp } from '@/components/ui/Timestamp';
import { addUserToWhitelist, fetchAdminStatus, fetchWhitelistedUsers, getAuthToken, removeUserFromWhitelist, fetchBadgesForUser, addBadgeToUser, removeBadgeFromUser } from '@/lib/api';
import { AdminDeniedPage } from '@/components/ui/AdminDenied';
import { Input } from '@/components/ui/Input';
import { BadgeManagementDialog } from '@/components/ui/BadgeDialog';

const Admin = () => {
   const [whitelistedUsers, setWhitelistedUsers] = useState<Whitelist[]>([]);
   const [newUser, setNewUser] = useState('');
   const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
   const [isRemoveUserDialogOpen, setIsRemoveUserDialogOpen] = useState(false);
   const [userToRemove, setUserToRemove] = useState<Whitelist | null>(null);
   const [userToManageBadges, setUserToManageBadges] = useState<Whitelist | null>(null);
   const [badges, setBadges] = useState<string[]>([]);
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

   const handleAddBadge = async (role: string) => {
      if (!userToManageBadges || !role || !isAdmin) return;

      const token = getAuthToken();
      if (!token) return;

      try {
         const success = await addBadgeToUser(token, userToManageBadges.username, role);
         if (success) {
            setBadges((prev) => [...prev, role]);
         }
      } catch (error) {
         console.error(error);
      }
   };

   const handleRemoveBadge = async (role: string) => {
      if (!userToManageBadges || !role || !isAdmin) return;

      const token = getAuthToken();
      if (!token) return;

      try {
         const success = await removeBadgeFromUser(token, userToManageBadges.username, role);
         if (success) {
            setBadges((prev) => prev.filter((badge) => badge !== role));
         }
      } catch (error) {
         console.error(error);
      }
   };

   const filteredUsers = whitelistedUsers.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const openBadgeManagementDialog = async (user: Whitelist) => {
      setUserToManageBadges(user);
      const token = getAuthToken();
      if (!token) return;

      try {
         const userBadges = await fetchBadgesForUser(user.username, token);
         setBadges(userBadges);
      } catch (error) {
         console.error(error);
      }
   };

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

   function goToUserpage(user: Whitelist) {
      window.location.href = `/user/${user.username}`;
   }

   return (
      <div className="min-h-screen bg-neutral-900 p-6 pt-24">
         <div className="max-w-7xl mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
               <div className="text-center sm:text-left">
                  <h1 className="text-4xl font-bold text-white">Whitelist-Verwaltung</h1>
                  <p className="text-neutral-400 mt-2">Verwalte die Benutzer, die auf die Anwendung zugreifen dürfen</p>
               </div>
               <div className="flex items-center w-full sm:w-auto space-x-4">
                  <Input
                     type="text"
                     icon={Search}
                     placeholder="Suche nach Benutzern..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isAdmin && (
                     <Button
                        onClick={() => setIsAddUserDialogOpen(true)}
                        variant="secondary"
                        icon={UserPlus}
                        content='Hinzufügen'
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
                              <div className="flex gap-2">
                                 <Button
                                    onClick={() => {
                                       goToUserpage(user);
                                    }}
                                    variant="primary"
                                    icon={UserCircle}
                                 />
                                 {isAdmin && (
                                    <Button
                                       onClick={() => openBadgeManagementDialog(user)}
                                       icon={Badge}
                                    />
                                 )}
                                 {isAdmin && (
                                    <Button
                                       onClick={() => {
                                          setUserToRemove(user);
                                          setIsRemoveUserDialogOpen(true);
                                       }}
                                       variant="destructive"
                                       icon={UserX}
                                    />
                                 )}
                              </div>
                           </header>
                        </div>
                     </article>
                  </span>
               ))}
            </div>
         </div>

         <Dialog isOpen={isAddUserDialogOpen} onClose={() => setIsAddUserDialogOpen(false)} title="Benutzer hinzufügen">
            <div>
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
                  content='Hinzufügen'
               >
               </Button>
            </div>
         </Dialog>

         <Dialog
            isOpen={isRemoveUserDialogOpen}
            onClose={() => setIsRemoveUserDialogOpen(false)}
            title={`Benutzer ${userToRemove?.username}`}
         >
            <div>
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
                  className="w-full mt-4"
                  icon={CircleSlash}
                  content='Nein. Doch nicht'
               >
               </Button>
            </div>
         </Dialog>

         <BadgeManagementDialog
            isOpen={userToManageBadges !== null}
            onClose={() => setUserToManageBadges(null)}
            username={userToManageBadges?.username || ''}
            currentBadges={badges}
            onAddBadge={handleAddBadge}
            onRemoveBadge={handleRemoveBadge}
         />
      </div>
   );
};

export default Admin;

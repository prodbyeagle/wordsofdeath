"use client";

//! cookie hat keine max age und löscht sich nach dem besuch

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const DiscordCallback = () => {
   const router = useRouter();
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchToken = async () => {
         try {
            console.log('Start des Token-Abrufs');

            const token = new URLSearchParams(window.location.search).get('token');
            if (!token) {
               console.error('Kein Authentifizierungstoken vorhanden');
               setError('Kein Authentifizierungstoken vorhanden.');
               return;
            }

            console.log('Authentifizierungstoken gefunden:', token);

            document.cookie = `wordsofdeath=${token}; Max-Age=2592000; path=/; secure; SameSite=Strict`;
            console.log('Token erfolgreich als Cookie gespeichert:', token);

            router.push('/');
            window.location.reload();
         } catch (error) {
            console.error('Fehler beim Verarbeiten des Tokens:', error);
            setError('Fehler beim Verarbeiten des Tokens. Bitte versuchen Sie es erneut.');
         }
      };

      fetchToken();
   }, [router]);

   if (error) {
      return (
         <div className="text-red-500 text-center">
            <h2 className="text-xl font-bold">Fehler!</h2>
            <p>{error}</p>
         </div>
      );
   }

   return <p>Authentifizierung wird verarbeitet...</p>;
};

export default DiscordCallback;

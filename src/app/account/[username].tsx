import React from "react";
import Image from "next/image";  // Importiere Next.js Image-Komponente
import { getUser } from "../../db";

const Account = async ({ params }: { params: { username: string } }) => {
   const user = await getUser(params.username);

   return (
      <div className="min-h-screen bg-zinc-800 text-white p-10 flex items-center justify-center">
         <div className="max-w-md p-8 rounded-xl shadow-md border border-zinc-600 text-center">
            {user ? (
               <>
                  <h2 className="text-3xl font-semibold mb-4">Profil: {user.name}</h2>
                  <Image
                     src={user.avatar}
                     alt="User Avatar"
                     width={96}
                     height={96}
                     className="rounded-full mb-4"
                     loading="lazy"
                  />
                  <p>Beigetreten am: {new Date(user.joined_at).toLocaleDateString()}</p>
               </>
            ) : (
               <p className="text-zinc-400">Benutzer nicht gefunden.</p>
            )}
         </div>
      </div>
   );
};

export default Account;

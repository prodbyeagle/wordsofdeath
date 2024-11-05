"use client";

import React from 'react';

const SignInPage: React.FC = () => {
   const handleSignIn = () => {
      window.location.href = 'https://wordsofdeath-backend.vercel.app/auth/discord';
   };

   return (
      <div className="flex h-screen bg-zinc-800 items-center justify-center">
         <div className="w-full max-w-md p-8 bg-zinc-900 shadow-lg rounded-xl border border-zinc-600">
            <h1 className="text-3xl font-bold text-center text-[#d683ff] mb-4">Willkommen zurück!</h1>
            <p className="text-center mb-6 text-gray-300">
               Melde dich mit Discord an, um auf <span className="font-semibold text-[#d683ff]">WordsofDeath</span> zuzugreifen.
            </p>
            <button
               onClick={handleSignIn}
               className="w-full py-3 bg-[#d683ff] hover:bg-[#aa6dc9] border-2 border-[#d683ff] rounded-lg shadow-md text-white font-semibold transition-all duration-150"
            >
               Anmelden mit Discord
            </button>
            <div className="mt-6 text-center">
               <p className="text-gray-400">Hast du noch keinen Account?</p>
               <button
                  onClick={handleSignIn}
                  className="text-[#d683ff] hover:underline"
               >
                  Jetzt registrieren
               </button>
            </div>
         </div>
      </div>
   );
};

export default SignInPage;

"use client";

import React from 'react';

const SignInPage: React.FC = () => {
   const handleSignIn = () => {
      window.location.href = 'https://wordsofdeath-backend.vercel.app/auth/discord';
   };

   return (
      <div className="flex h-screen bg-zinc-800 items-center justify-center text-white">
         <div className="w-full max-w-md p-6 bg-zinc-900 shadow-md rounded-xl border border-zinc-600">
            <h1 className="text-2xl font-semibold text-center mb-6">Sign In</h1>
            <p className="text-center mb-4">Melde dich mit Discord an, um auf WordsofDeath zuzugreifen.</p>
            <button
               onClick={handleSignIn}
               className="w-full py-3 px-4 mt-4 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md text-white font-medium transition-all duration-150"
            >
               Anmelden mit Discord
            </button>
         </div>
      </div>
   );
};

export default SignInPage;

"use client";

import React, { useState } from "react";

const SignInPage: React.FC = () => {
   const [hoverIndex, setHoverIndex] = useState<number | null>(null);
   const MAX_AFFECTED_LETTERS = 3;

   const handleMouseEnter = (index: number) => setHoverIndex(index);
   const handleMouseLeave = () => setHoverIndex(null);

   const handleSignIn = () => {
      window.location.href = 'https://wordsofdeath-backend.vercel.app/auth/discord';
   };

   const renderWelcomeText = () => {
      const text = "Welcome";
      return (
         <h1
            className="text-4xl font-bold text-center text-zinc-200 mb-6 flex justify-center space-x-0"
            onMouseLeave={handleMouseLeave}
         >
            {text.split("").map((letter, index) => {
               const distance = hoverIndex !== null ? Math.abs(hoverIndex - index) : null;
               const fontSize = distance !== null && distance <= MAX_AFFECTED_LETTERS
                  ? `${2 + (MAX_AFFECTED_LETTERS - distance) * 0.2}rem`
                  : "2rem";

               return (
                  <span
                     key={index}
                     onMouseEnter={() => handleMouseEnter(index)}
                     style={{ fontSize }}
                     className="cursor-default transition-all duration-300"
                  >
                     {letter}
                  </span>
               );
            })}
         </h1>
      );
   };

   return (
      <div className="flex h-screen bg-zinc-900 items-center justify-center">
         <div className="w-full max-w-md p-10 bg-zinc-800 shadow-xl mx-2 rounded-xl border border-zinc-600 text-center">
            {renderWelcomeText()}
            <p className="text-zinc-300 mb-6">
               Melde dich mit Discord an, um auf <span className="font-semibold text-[#d683ff]">WordsofDeath</span> zuzugreifen.
            </p>
            <button
               onClick={handleSignIn}
               className="w-full py-3 bg-[#d683ff] hover:bg-[#aa6dc9] border-2 border-[#d683ff] rounded-lg shadow-md text-white font-semibold transition-all duration-150"
            >
               Anmelden mit Discord
            </button>
            <div className="mt-6">
               <p className="text-zinc-400">Hast du noch keinen Account?</p>
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

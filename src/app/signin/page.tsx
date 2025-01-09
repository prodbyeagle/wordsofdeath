"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

const SignInPage: React.FC = () => {
   const handleSignIn = () => {
      window.location.href = "http://localhost:3001/auth/discord";
   };

   return (
      <div className="flex h-screen bg-neutral-900 items-center justify-center p-4">
         <div className="w-full max-w-md bg-neutral-800 p-8 shadow-lg rounded-xl border border-neutral-600 text-center">
            <h1 className="text-4xl font-bold text-neutral-100 mb-6">
               Willkommen
            </h1>
            <p className="text-neutral-300 mb-6">
               Melde dich mit Discord an, um auf die Plattform zuzugreifen.
               <span className="font-semibold text-neutral-100"></span>
            </p>
            <Button
               onClick={handleSignIn}
               variant="primary"
               size="lg"
               className="w-full"
            >
               Anmelden mit Discord
            </Button>
         </div>
      </div>
   );
};

export default SignInPage;

import React from "react";

const Dashboard = () => {
   return (
      <div className="min-h-screen bg-zinc-800 text-white p-10">
         <div className="max-w-5xl mx-auto p-8 rounded-xl shadow-md border border-zinc-600">
            <h2 className="text-3xl font-semibold mb-6">Admin-Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-4 border border-zinc-600 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Benutzerverwaltung</h3>
                  <p>Verwalte die Zugriffsrechte und bearbeite Benutzerprofile.</p>
               </div>
               <div className="p-4 border border-zinc-600 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold mb-2">Einträge verwalten</h3>
                  <p>Organisiere und überprüfe gespeicherte Wörter und Sätze.</p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Dashboard;

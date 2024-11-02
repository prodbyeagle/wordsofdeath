// src/components/Dropdown.tsx
import React from 'react';

interface DropdownProps {
   children: React.ReactNode;
   isOpen: boolean;
   toggleDropdown: () => void;
   disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ isOpen, toggleDropdown, disabled, children }) => {
   if (!isOpen || disabled) return null; // Dropdown nicht anzeigen, wenn es geschlossen oder deaktiviert ist

   return (
      <div className="absolute right-0 top-12 mt-2 w-48 bg-zinc-900/20 backdrop-blur-xl rounded-md shadow-lg z-10 border border-zinc-600">
         <div className="py-1 duration-100 transition-all" onClick={toggleDropdown}>
            {children}
         </div>
      </div>
   );
};

export default Dropdown;

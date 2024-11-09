// src/components/Dropdown.tsx
import React, { useEffect, useRef } from 'react';

interface DropdownProps {
   children: React.ReactNode;
   isOpen: boolean;
   toggleDropdown: () => void;
   disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ isOpen, toggleDropdown, disabled, children }) => {
   const dropdownRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            toggleDropdown();
         }
      };

      if (isOpen && !disabled) {
         document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, [isOpen, disabled, toggleDropdown]);

   if (!isOpen || disabled) return null;

   return (
      <div
         ref={dropdownRef}
         className="absolute right-0 top-12 mt-2 w-48 bg-transparent backdrop-blur-xl rounded-md shadow-lg z-20 border border-zinc-600"
      >
         <div className="duration-100 transition-all" onClick={toggleDropdown}>
            {children}
         </div>
      </div>
   );
};

export default Dropdown;

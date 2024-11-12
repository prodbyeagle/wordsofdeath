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

   return (
      <div
         ref={dropdownRef}
         className={`absolute right-0 top-12 mt-2 w-48 bg-transparent backdrop-blur-xl rounded-2xl shadow-xl z-20 border border-zinc-600 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}
         style={{ transitionProperty: 'opacity, transform' }}
      >
         {children}
      </div>
   );
};

export default Dropdown;

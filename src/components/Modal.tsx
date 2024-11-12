// src/components/Modal.tsx

import React, { useEffect, useState, ReactNode } from 'react';
import { X } from 'lucide-react';
import '../styles/Modal.css';

interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
   title?: string;
   children: ReactNode;
   className?: string;
   shadowSize?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, shadowSize }) => {
   const [show, setShow] = useState(isOpen);

   useEffect(() => {
      if (isOpen) {
         setShow(true);
      } else {
         const timer = setTimeout(() => setShow(false), 300);
         return () => clearTimeout(timer);
      }
   }, [isOpen]);

   if (!show) return null;

   const shadowClass = shadowSize ? `shadow-${shadowSize}` : '';

   return (
      <div className={`fixed inset-0 px-2 flex items-center justify-center bg-neutral-950 bg-opacity-60 backdrop-blur-xl z-50 ${isOpen ? 'modal-enter' : 'modal-exit'}`}>
         <div className={`p-4 rounded-xl ${shadowClass} w-fit relative transition-all duration-100 max-h-150 overflow-y-scroll border border-neutral-600 max-w-200 ${className}`}>
            <button onClick={onClose} className="absolute top-5 right-5 text-white p-0 border border-transparent hover:border-neutral-600 hover:scale-105 transition-all duration-200 rounded">
               <X />
            </button>
            {title && (
               <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
            )}
            <div>{children}</div>
         </div>
      </div>
   );
};

export default Modal;

import React, { useEffect, useState, ReactNode } from 'react';
import { X } from 'lucide-react';
import '../../styles/Modal.css';

/**
 * Props for the Modal component, which controls the visibility, content, and styling of a modal dialog.
 */
interface ModalProps {
   /**
    * A boolean that determines if the modal is open.
    * @default false
    */
   isOpen: boolean;

   /**
    * A function to close the modal when triggered (e.g., by clicking the close button).
    */
   onClose: () => void;

   /**
    * The title of the modal, displayed at the top of the modal content.
    */
   title?: string;

   /**
    * The content displayed inside the modal.
    */
   children: ReactNode;

   /**
    * Additional custom classes for the modal container.
    */
   className?: string;

   /**
    * The size of the modal shadow. This determines the intensity of the shadow effect around the modal.
    */
   shadowSize?: string;
}

/**
 * A Modal component that provides a flexible dialog box with customizable content, title, and styling.
 * Supports opening and closing the modal with animations, and allows closing the modal via the Escape key or close button.
 *
 * @param {ModalProps} props - The properties for the Modal component, including visibility, title, and content.
 * @returns {JSX.Element | null} A modal dialog, or null if the modal is not open.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, shadowSize }) => {
   const [show, setShow] = useState(isOpen);

   useEffect(() => {
      if (isOpen) {
         setShow(true);
      } else {
         const timer = setTimeout(() => setShow(false), 300);
         return () => clearTimeout(timer);
      }
   }, [isOpen]);

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'Escape' && isOpen) {
            onClose();
         }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
   }, [isOpen, onClose]);

   if (!show) return null;

   const shadowClass = shadowSize ? `shadow-${shadowSize}` : '';

   return (
      <div
         aria-hidden={!isOpen}
         aria-modal="true"
         role="dialog"
         className={`fixed inset-0 px-2 flex items-center justify-center bg-neutral-950 bg-opacity-60 backdrop-blur-xl z-50 ${isOpen ? 'modal-enter' : 'modal-exit'}`}
      >
         <div className={`p-4 rounded-xl ${shadowClass} bg-neutral-900 w-fit relative transition-all duration-100 max-h-150 overflow-y-scroll border border-neutral-800 max-w-200 ${className}`}>
            <button
               onClick={onClose}
               aria-label="Close modal"
               className="absolute top-5 right-5 text-neutral-100 p-0 bg-transparent hover:bg-neutral-800 hover:scale-105 transition-all duration-200 rounded"
            >
               <X size={24} />
            </button>
            {title && (
               <h2 className="text-xl font-semibold mb-4 text-neutral-100">{title}</h2>
            )}
            <div>{children}</div>
         </div>
      </div>
   );
};

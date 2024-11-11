'use client';

import React, { useEffect, useState } from 'react';

type ToastProps = {
   /**
    * The type of the toast, which determines its color.
    * - 'info' for blue
    * - 'warning' for yellow
    * - 'error' for red
    */
   type: 'info' | 'warning' | 'error';

   /**
    * The message to display in the toast.
    */
   message: string;

   /**
    * The position where the toast will appear on the screen.
    * - 'top-left' for top left corner
    * - 'top-right' for top right corner
    * - 'bottom-left' for bottom left corner
    * - 'bottom-right' for bottom right corner
    *
    * Defaults to 'top-right'.
    */
   position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

   /**
    * The duration for which the toast will be visible in milliseconds.
    * Defaults to 3000ms (3 seconds).
    */
   duration?: number;
};

/**
 * A Toast component that displays a temporary message with an animation.
 * The toast fades in and out based on the provided duration, type, and position.
 */
const Toast: React.FC<ToastProps> = ({ type, message, position = 'top-right', duration = 3000 }) => {
   const [isVisible, setIsVisible] = useState(true);

   useEffect(() => {
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
   }, [duration]);

   /**
    * Determines the background color for the toast based on its type.
    * @returns {string} The class name for the background color.
    */
   const getToastStyle = (): string => {
      switch (type) {
         case 'error':
            return 'bg-red-500';
         case 'warning':
            return 'bg-yellow-500';
         case 'info':
         default:
            return 'bg-blue-500';
      }
   };

   /**
    * Determines the CSS properties for positioning and animation of the toast.
    * @returns {React.CSSProperties} The position and animation styles for the toast.
    */
   const getPositionStyle = (): React.CSSProperties => {
      switch (position) {
         case 'top-left':
            return {
               position: 'fixed',
               top: '1rem',
               left: '1rem',
               animation: 'fadeInFromTop 0.5s ease-out, fadeOutToTop 0.5s ease-in 2.5s forwards',
            };
         case 'top-right':
            return {
               position: 'fixed',
               top: '1rem',
               right: '1rem',
               animation: 'fadeInFromTop 0.5s ease-out, fadeOutToTop 0.5s ease-in 2.5s forwards',
            };
         case 'bottom-left':
            return {
               position: 'fixed',
               bottom: '1rem',
               left: '1rem',
               animation: 'fadeInFromBottom 0.5s ease-out, fadeOutToBottom 0.5s ease-in 2.5s forwards',
            };
         case 'bottom-right':
         default:
            return {
               position: 'fixed',
               bottom: '1rem',
               right: '1rem',
               animation: 'fadeInFromBottom 0.5s ease-out, fadeOutToBottom 0.5s ease-in 2.5s forwards',
            };
      }
   };

   return (
       isVisible && (
           <div
               style={{
                  ...getPositionStyle(),
                  opacity: isVisible ? 1 : 0,
                  transition: 'opacity 0.5s ease-out',
               }}
           >
              <div
                  className={`${getToastStyle()} p-4 mb-2 text-white rounded-md shadow-lg transition-all transform`}
              >
                 <span>{message}</span>
              </div>
           </div>
       )
   );
};

export default Toast;

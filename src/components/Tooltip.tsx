'use client';

import React, { useState, useRef, ReactNode } from 'react';

interface TooltipProps {
   /** 
    * The content to be displayed in the tooltip. 
    */
   content: string;
   /** 
    * The child elements that will trigger the tooltip on hover. 
    */
   children: ReactNode;
   /** 
    * The position of the tooltip relative to the child element. 
    * Can be 'top', 'bottom', 'left', or 'right'. 
    * Default is 'bottom'.
    */
   position?: 'top' | 'bottom' | 'left' | 'right';
   /** 
    * The delay in milliseconds before the tooltip is displayed. 
    * Default is 300 milliseconds. 
    */
   delay?: number;
   /** 
    * Font size class for the tooltip text. 
    * Default is 'text-sm'.
    */
   fontSize?: string;
}

/** 
 * A Tooltip component that displays information when the user hovers over a child element. 
 * 
 * @param {string} content - The content to be displayed in the tooltip. 
 * @param {ReactNode} children - The child element that triggers the tooltip on hover. 
 * @param {'top' | 'bottom' | 'left' | 'right'} [position='bottom'] - The position of the tooltip relative to the child element. 
 * @param {number} [delay=300] - The delay in milliseconds before the tooltip is displayed. 
 * @param {string} [fontSize='text-sm'] - The font size class for the tooltip text. 
 * @returns {JSX.Element} The Tooltip component.
 */
const Tooltip: React.FC<TooltipProps> = ({
   content,
   children,
   position = 'bottom',
   delay = 300,
   fontSize = 'text-xs',
}): React.JSX.Element => {
   const [isVisible, setIsVisible] = useState<boolean>(false);
   const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
   const tooltipRef = useRef<HTMLDivElement | null>(null);
   const targetRef = useRef<HTMLDivElement | null>(null);

   const showTooltip = () => {
      const id = setTimeout(() => setIsVisible(true), delay);
      setTimeoutId(id);
   };

   const hideTooltip = () => {
      if (timeoutId) {
         clearTimeout(timeoutId);
      }
      setIsVisible(false);
   };

   return (
      <div
         className="relative inline-block"
         onMouseEnter={showTooltip}
         onMouseLeave={hideTooltip}
         ref={targetRef}
      >
         <div
            ref={tooltipRef}
            className={`absolute z-10 px-2 py-1 bg-zinc-700 border border-zinc-600 text-white rounded-md whitespace-nowrap cursor-default transition-opacity duration-300 ease-in-out ${fontSize} 
            ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} 
            ${position === 'bottom' ? 'top-full mt-2 left-1/2 transform -translate-x-1/2'
                  : position === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'
                     : position === 'left' ? 'right-full mr-2 top-1/2 transform -translate-y-1/2'
                        : 'left-full ml-2 top-1/2 transform -translate-y-1/2'}`}
         >
            {content}
         </div>
         {children}
      </div>
   );
};

export default Tooltip;

'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  side?: 'left' | 'right' | 'bottom';
  className?: string;
}

export function Drawer({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  side = 'right',
  className = '' 
}: DrawerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Sur mobile, force bottom sheet
  const actualSide = isMobile ? 'bottom' : side;

  const getDrawerClasses = () => {
    const baseClasses = "fixed bg-background border shadow-lg transition-transform duration-300 ease-in-out z-[10000] flex flex-col";
    
    switch (actualSide) {
      case 'left':
        return `${baseClasses} left-0 top-0 h-full max-h-screen w-80 border-r transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`;
      case 'right':
        return `${baseClasses} right-0 top-0 h-full max-h-screen w-80 border-l transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`;
      case 'bottom':
        return `${baseClasses} bottom-0 left-0 w-full max-h-[80vh] border-t rounded-t-lg transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`;
      default:
        return baseClasses;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9999] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`${getDrawerClasses()} ${className}`}>
        {/* Header fixe */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          {actualSide === 'bottom' && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              {/* <div className="w-8 h-1 bg-gray-300 rounded-full" /> */}
            </div>
          )}
          <h3 className="text-lg font-semibold truncate">{title || 'Menu'}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </>
  );
}

export default Drawer;
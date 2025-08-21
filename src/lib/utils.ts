import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Body scroll lock utility for mobile devices
let scrollLockCount = 0;
let originalBodyStyle = '';

export const lockBodyScroll = () => {
  scrollLockCount++;
  
  if (scrollLockCount === 1) {
    // Store original body style
    originalBodyStyle = document.body.style.overflow;
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
  }
};

export const unlockBodyScroll = () => {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  
  if (scrollLockCount === 0) {
    // Restore original body style
    document.body.style.overflow = originalBodyStyle;
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    
    // Restore scroll position
    const scrollY = document.body.style.top;
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }
};

export const isBodyScrollLocked = () => scrollLockCount > 0;

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * PWA Compatibility Utilities
 * These functions help detect and handle common PWA issues, especially on iOS Safari
 */

export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isIOSSafari = (): boolean => {
  return isIOS() && isSafari();
};

export const isPWAIOSSafari = (): boolean => {
  return isPWA() && isIOSSafari();
};

/**
 * Safe localStorage operations for PWA environments
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof localStorage === 'undefined') return null;
      
      // Test access first (iOS Safari can throw errors)
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`localStorage.getItem('${key}') failed:`, error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof localStorage === 'undefined') return false;
      
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`localStorage.setItem('${key}') failed:`, error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      if (typeof localStorage === 'undefined') return false;
      
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`localStorage.removeItem('${key}') failed:`, error);
      return false;
    }
  },
  
  clear: (): boolean => {
    try {
      if (typeof localStorage === 'undefined') return false;
      
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('localStorage.clear() failed:', error);
      return false;
    }
  }
};

/**
 * Check if the current environment has storage issues
 */
export const hasStorageIssues = (): boolean => {
  return isPWAIOSSafari() || !safeLocalStorage.setItem('test', 'test');
};

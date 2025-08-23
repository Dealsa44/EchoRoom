import { useEffect, useState } from 'react';
import { serviceWorkerManager } from '../lib/serviceWorkerManager';

export const useServiceWorker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);

  useEffect(() => {
    // Register the service worker
    serviceWorkerManager.register();

    // Set up update callback
    serviceWorkerManager.onUpdateAvailable(() => {
      setUpdateAvailable(true);
    });

    // Check if update is already available
    setUpdateAvailable(serviceWorkerManager.isUpdateAvailable());
    
    // Set development mode status
    setIsDevelopmentMode(serviceWorkerManager.isDevelopment());
    
    // Add keyboard shortcut for manual update check (Ctrl+U / Cmd+U)
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
        event.preventDefault();
        console.log('🔄 Manual update check triggered via keyboard shortcut');
        serviceWorkerManager.forceUpdateCheck();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const applyUpdate = async () => {
    setIsUpdating(true);
    try {
      await serviceWorkerManager.applyUpdate();
      // The page will reload automatically when the update is applied
    } catch (error) {
      console.error('Failed to apply update:', error);
      setIsUpdating(false);
    }
  };

  const checkForUpdates = async () => {
    try {
      await serviceWorkerManager.forceUpdateCheck();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  return {
    updateAvailable,
    isUpdating,
    applyUpdate,
    checkForUpdates,
    isDevelopmentMode,
    updateInterval: serviceWorkerManager.getUpdateInterval(),
    registration: serviceWorkerManager.getRegistration()
  };
};

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface OfflineMessage {
  id: string;
  content: string;
  timestamp: Date;
  recipient: string;
  type: 'text' | 'image' | 'voice' | 'file';
  retry: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface OfflineState {
  isOnline: boolean;
  queuedMessages: OfflineMessage[];
  lastSyncTime: Date | null;
  syncInProgress: boolean;
  cacheSize: number;
}

const CACHE_PREFIX = 'echoroom_cache_';
const OFFLINE_QUEUE_KEY = 'echoroom_offline_queue';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const useOfflineSupport = () => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    queuedMessages: [],
    lastSyncTime: null,
    syncInProgress: false,
    cacheSize: 0
  });

  const calculateCacheSize = useCallback(() => {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
    }
    setState(prev => ({ ...prev, cacheSize: totalSize }));
  }, []);

  // Initialize offline queue from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (savedQueue) {
      try {
        const queue = JSON.parse(savedQueue).map((msg: { timestamp: string; [key: string]: unknown }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setState(prev => ({ ...prev, queuedMessages: queue }));
      } catch (error) {
        console.error('Failed to load offline queue:', error);
      }
    }
    
    calculateCacheSize();
  }, [calculateCacheSize]);

  const syncQueuedMessages = useCallback(async () => {
    if (state.syncInProgress || state.queuedMessages.length === 0 || !state.isOnline) {
      return;
    }

    setState(prev => ({ ...prev, syncInProgress: true }));

    const messagesToSync = [...state.queuedMessages];
    const failedMessages: OfflineMessage[] = [];
    let successCount = 0;

    for (const message of messagesToSync) {
      try {
        // Simulate API call to send message
        const success = await sendMessage(message);
        
        if (success) {
          successCount++;
        } else {
          // Retry logic
          if (message.retry < 3) {
            failedMessages.push({ ...message, retry: message.retry + 1 });
          } else {
            console.error('Failed to send message after 3 retries:', message);
          }
        }
      } catch (error) {
        console.error('Error sending queued message:', error);
        if (message.retry < 3) {
          failedMessages.push({ ...message, retry: message.retry + 1 });
        }
      }
    }

    setState(prev => ({
      ...prev,
      queuedMessages: failedMessages,
      syncInProgress: false,
      lastSyncTime: new Date()
    }));

    if (successCount > 0) {
      toast({
        title: "Messages synced",
        description: `${successCount} message(s) sent successfully`,
      });
    }

    if (failedMessages.length > 0) {
      // Some messages failed to sync - toast removed per user request
    }
  }, [state.queuedMessages, state.syncInProgress, state.isOnline]);

  const sendMessage = async (message: OfflineMessage): Promise<boolean> => {
    // Simulate network delay and potential failure
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate 10% failure rate for demonstration
    return Math.random() > 0.1;
  };

  // Online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      // Back online - toast removed per user request
      syncQueuedMessages();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      // You're offline - toast removed per user request
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueuedMessages]);

  // Save offline queue to localStorage whenever it changes
  useEffect(() => {
    if (state.queuedMessages.length > 0) {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(state.queuedMessages));
    } else {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    }
  }, [state.queuedMessages]);

  const queueMessage = useCallback((message: Omit<OfflineMessage, 'id' | 'retry'>) => {
    const queuedMessage: OfflineMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36),
      retry: 0
    };

    setState(prev => ({
      ...prev,
      queuedMessages: [...prev.queuedMessages, queuedMessage]
    }));

    // Message queued - toast removed per user request
  }, []);

  // Cache management
  const cleanupCache = useCallback(() => {
    const cacheKeys: { key: string; timestamp: number }[] = [];
    
    // Collect all cache keys with timestamps
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheEntry = JSON.parse(cached);
            cacheKeys.push({ key, timestamp: cacheEntry.timestamp });
          }
        } catch (error) {
          // Remove invalid cache entries
          localStorage.removeItem(key);
        }
      }
    }
    
    // Sort by timestamp (oldest first) and remove oldest entries
    cacheKeys.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(cacheKeys.length * 0.3); // Remove 30% of cache
    
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(cacheKeys[i].key);
    }
    
    calculateCacheSize();
    
    // Cache cleaned - toast removed per user request
  }, [calculateCacheSize]);

  const setCache = useCallback(<T>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl
      };
      
      const cacheKey = CACHE_PREFIX + key;
      const serialized = JSON.stringify(cacheEntry);
      
      // Check if adding this would exceed cache limit
      const newSize = new Blob([serialized]).size;
      if (state.cacheSize + newSize > MAX_CACHE_SIZE) {
        cleanupCache();
      }
      
      localStorage.setItem(cacheKey, serialized);
      calculateCacheSize();
      
      return true;
    } catch (error) {
      console.error('Failed to set cache:', error);
      return false;
    }
  }, [state.cacheSize, cleanupCache, calculateCacheSize]);

  const getCache = useCallback(<T>(key: string): T | null => {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const cacheEntry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache has expired
      if (now - cacheEntry.timestamp > cacheEntry.ttl) {
        localStorage.removeItem(cacheKey);
        calculateCacheSize();
        return null;
      }
      
      return cacheEntry.data;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }, [calculateCacheSize]);

  const clearAllCache = useCallback(() => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    
    setState(prev => ({ ...prev, cacheSize: 0 }));
    
    // Cache cleared - toast removed per user request
  }, []);

  const retrySync = useCallback(() => {
    if (state.isOnline && state.queuedMessages.length > 0) {
      syncQueuedMessages();
    }
  }, [state.isOnline, state.queuedMessages.length, syncQueuedMessages]);

  const getCacheStats = useCallback(() => {
    let entryCount = 0;
    let oldestEntry: Date | null = null;
    let newestEntry: Date | null = null;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheEntry = JSON.parse(cached);
            const entryDate = new Date(cacheEntry.timestamp);
            
            entryCount++;
            if (!oldestEntry || entryDate < oldestEntry) {
              oldestEntry = entryDate;
            }
            if (!newestEntry || entryDate > newestEntry) {
              newestEntry = entryDate;
            }
          }
        } catch (error) {
          // Invalid entry, skip
        }
      }
    }
    
    return {
      entryCount,
      totalSize: state.cacheSize,
      oldestEntry,
      newestEntry,
      maxSize: MAX_CACHE_SIZE
    };
  }, [state.cacheSize]);

  return {
    // State
    isOnline: state.isOnline,
    queuedMessages: state.queuedMessages,
    lastSyncTime: state.lastSyncTime,
    syncInProgress: state.syncInProgress,
    cacheSize: state.cacheSize,
    
    // Actions
    queueMessage,
    syncQueuedMessages,
    retrySync,
    
    // Cache management
    setCache,
    getCache,
    cleanupCache,
    clearAllCache,
    getCacheStats
  };
};
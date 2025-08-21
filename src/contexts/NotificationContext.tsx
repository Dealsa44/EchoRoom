import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

interface ChatNotification {
  id: string;
  type: 'message' | 'match' | 'reaction' | 'mention';
  title: string;
  body: string;
  avatar?: string;
  userId?: string;
  chatId?: string;
  timestamp: Date;
  isRead: boolean;
  data?: Record<string, unknown>;
}

interface NotificationContextType {
  // Permission management
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  
  // Notifications
  notifications: ChatNotification[];
  unreadCount: number;
  showNotification: (notification: Omit<ChatNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  
  // Real-time features
  isOnline: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  lastSeen: Date | null;
  
  // Typing indicators
  typingUsers: Record<string, { name: string; avatar: string; timestamp: Date }>;
  setUserTyping: (userId: string, name: string, avatar: string) => void;
  setUserStoppedTyping: (userId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; avatar: string; timestamp: Date }>>({});

  // Initialize notification permission
  useEffect(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default'
      });
    }
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus('connected');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('disconnected');
      setLastSeen(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Typing indicator cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTypingUsers(prev => {
        const filtered = Object.entries(prev).reduce((acc, [userId, data]) => {
          const timeDiff = now.getTime() - data.timestamp.getTime();
          if (timeDiff < 3000) { // Keep typing indicator for 3 seconds
            acc[userId] = data;
          }
          return acc;
        }, {} as Record<string, { name: string; avatar: string; timestamp: Date }>);
        return filtered;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Page visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setLastSeen(new Date());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      const newPermission = {
        granted: result === 'granted',
        denied: result === 'denied',
        default: result === 'default'
      };
      setPermission(newPermission);
      return result === 'granted';
    }

    return false;
  };

  const showNotification = (notificationData: Omit<ChatNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const notification: ChatNotification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36),
      timestamp: new Date(),
      isRead: false
    };

    setNotifications(prev => [notification, ...prev]);

    // Show browser notification if permission granted and page is not visible
    if (permission.granted && document.hidden) {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.body,
          icon: '/EchoRoom.png',
          badge: '/EchoRoom.png',
          tag: notification.chatId || 'echoroom-chat',
          requireInteraction: false,
          silent: false
        });

        browserNotification.onclick = () => {
          window.focus();
          if (notification.chatId) {
            // Navigate to chat (would need router context in real implementation)
            window.location.hash = `/private-chat/${notification.userId}`;
          }
          browserNotification.close();
        };

        // Auto close after 3 seconds
        setTimeout(() => {
          browserNotification.close();
        }, 3000);
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }

    // Show toast notification if page is visible
    // Toast notifications removed per user request

    // Play notification sound (simulate)
    if (isOnline) {
      try {
        // In a real app, you'd play an actual sound file
        const audioContext = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        // Silently fail if audio context is not available
      }
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const setUserTyping = (userId: string, name: string, avatar: string) => {
    setTypingUsers(prev => ({
      ...prev,
      [userId]: { name, avatar, timestamp: new Date() }
    }));
  };

  const setUserStoppedTyping = (userId: string) => {
    setTypingUsers(prev => {
      const { [userId]: _, ...rest } = prev;
      return rest;
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    // Permission management
    permission,
    requestPermission,
    
    // Notifications
    notifications,
    unreadCount,
    showNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    
    // Real-time features
    isOnline,
    connectionStatus,
    lastSeen,
    
    // Typing indicators
    typingUsers,
    setUserTyping,
    setUserStoppedTyping
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
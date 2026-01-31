// Notification storage utility for tracking unread items
// This manages persistent counts for archived chats and call history

export interface NotificationCounts {
  archivedChats: number;
  callHistory: number;
}

const NOTIFICATION_STORAGE_KEY = 'driftzo_notification_counts';

// Get current notification counts from localStorage
export const getNotificationCounts = (): NotificationCounts => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to parse notification counts from localStorage:', error);
  }
  
  return {
    archivedChats: 0,
    callHistory: 0
  };
};

// Save notification counts to localStorage
export const saveNotificationCounts = (counts: NotificationCounts): void => {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(counts));
  } catch (error) {
    console.warn('Failed to save notification counts to localStorage:', error);
  }
};

// Increment archived chats count
export const incrementArchivedChatsCount = (): void => {
  const counts = getNotificationCounts();
  counts.archivedChats += 1;
  saveNotificationCounts(counts);
};

// Increment call history count
export const incrementCallHistoryCount = (): void => {
  const counts = getNotificationCounts();
  counts.callHistory += 1;
  saveNotificationCounts(counts);
};

// Mark archived chats as read (reset count to 0)
export const markArchivedChatsAsRead = (): void => {
  const counts = getNotificationCounts();
  counts.archivedChats = 0;
  saveNotificationCounts(counts);
};

// Mark call history as read (reset count to 0)
export const markCallHistoryAsRead = (): void => {
  const counts = getNotificationCounts();
  counts.callHistory = 0;
  saveNotificationCounts(counts);
};

// Reset all notification counts
export const resetAllNotificationCounts = (): void => {
  saveNotificationCounts({
    archivedChats: 0,
    callHistory: 0
  });
};

// Get specific count
export const getArchivedChatsCount = (): number => {
  return getNotificationCounts().archivedChats;
};

export const getCallHistoryCount = (): number => {
  return getNotificationCounts().callHistory;
};

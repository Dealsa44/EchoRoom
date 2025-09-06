// Conversation storage utilities for managing conversation states in localStorage
import { incrementArchivedChatsCount } from './notificationStorage';

export interface ConversationState {
  id: string;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  isLeft?: boolean; // For group chats that have been left
  leftAt?: string; // Timestamp when left
}

export interface ConversationStorage {
  [conversationId: string]: ConversationState;
}

const STORAGE_KEY = 'conversationStates';

/**
 * Get all conversation states from localStorage
 */
export const getConversationStates = (): ConversationStorage => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to parse conversation states from localStorage:', error);
    return {};
  }
};

/**
 * Save conversation states to localStorage
 */
export const saveConversationStates = (states: ConversationStorage): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch (error) {
    console.error('Failed to save conversation states to localStorage:', error);
  }
};

/**
 * Get a specific conversation state
 */
export const getConversationState = (conversationId: string): ConversationState => {
  const states = getConversationStates();
  return states[conversationId] || {
    id: conversationId,
    isPinned: false,
    isArchived: false,
    isMuted: false,
    isLeft: false
  };
};

/**
 * Update a specific conversation state
 */
export const updateConversationState = (
  conversationId: string, 
  updates: Partial<ConversationState>
): void => {
  const currentState = getConversationState(conversationId);
  const states = getConversationStates();
  
  // Check if we're archiving a conversation that wasn't previously archived
  if (updates.isArchived === true && !currentState.isArchived) {
    incrementArchivedChatsCount();
  }
  
  states[conversationId] = {
    ...currentState,
    ...updates,
    id: conversationId
  };
  saveConversationStates(states);
};

/**
 * Mark a group conversation as left
 */
export const markConversationAsLeft = (conversationId: string): void => {
  updateConversationState(conversationId, {
    isLeft: true,
    leftAt: new Date().toISOString(),
    isPinned: false, // Remove pin when leaving
    isArchived: false // Remove archive when leaving
  });
};

/**
 * Mark a group conversation as rejoined (when joining from chat rooms)
 */
export const markConversationAsRejoined = (conversationId: string): void => {
  updateConversationState(conversationId, {
    isLeft: false,
    leftAt: undefined
  });
};

/**
 * Delete a conversation state entirely
 */
export const deleteConversationState = (conversationId: string): void => {
  const states = getConversationStates();
  delete states[conversationId];
  saveConversationStates(states);
};

/**
 * Get all left group conversations
 */
export const getLeftConversations = (): ConversationState[] => {
  const states = getConversationStates();
  return Object.values(states).filter(state => state.isLeft);
};

/**
 * Clear all conversation states (useful for logout)
 */
export const clearConversationStates = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

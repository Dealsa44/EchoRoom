import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { logoutUser, getCurrentUserFromStorage } from '@/lib/auth';

type SafeMode = 'light' | 'deep' | 'learning';
type ChatStyle = 'introverted' | 'balanced' | 'outgoing';
type Language = 'en' | 'ka';

// New types for gender and orientation features
export type GenderIdentity = 
  | 'female' 
  | 'male' 
  | 'non-binary' 
  | 'transgender' 
  | 'agender' 
  | 'genderfluid' 
  | 'other' 
  | 'prefer-not-to-say'
  | string; // For custom gender identities

export type Orientation = 
  | 'heterosexual' 
  | 'homosexual' 
  | 'bisexual' 
  | 'asexual' 
  | 'pansexual' 
  | 'queer' 
  | 'other'
  | string; // For custom orientations

export type AttractionPreference = 'women' | 'men' | 'non-binary' | 'all-genders';

export type RelationshipIntent = 'relationship' | 'friendship' | 'both';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  interests: string[];
  languages: string[];
  chatStyle: ChatStyle;
  safeMode: SafeMode;
  anonymousMode: boolean;
  aiAssistant: boolean;
  // New fields for gender and orientation
  genderIdentity: GenderIdentity;
  orientation: Orientation;
  attractionPreferences: AttractionPreference[];
  lookingForRelationship: boolean;
  customGender?: string; // For custom gender identity
  customOrientation?: string; // For custom orientation
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  language: Language;
  isDarkMode: boolean;
  safeMode: SafeMode;
  joinedRooms: string[];
}

interface AppContextType extends AppState {
  setUser: (user: User | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setLanguage: (lang: Language) => void;
  toggleDarkMode: () => void;
  setSafeMode: (mode: SafeMode) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state with saved user if available
  const initializeState = (): AppState => {
    const savedUser = getCurrentUserFromStorage();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Safely parse joined rooms from localStorage
    let savedJoinedRooms: string[] = [];
    try {
      const joinedRoomsData = localStorage.getItem('joinedRooms');
      if (joinedRoomsData) {
        savedJoinedRooms = JSON.parse(joinedRoomsData);
      }
    } catch (error) {
      console.error('Failed to parse joined rooms from localStorage:', error);
      // Reset to empty array if parsing fails
      localStorage.setItem('joinedRooms', JSON.stringify([]));
    }
    
    // Apply dark mode class if saved
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
    return {
      user: savedUser,
      isAuthenticated: !!savedUser,
      language: 'en',
      isDarkMode: savedDarkMode,
      safeMode: 'light',
      joinedRooms: savedJoinedRooms,
    };
  };

  const [state, setState] = useState<AppState>(initializeState);

  // Debug: Log state changes
  useEffect(() => {
    console.log('=== AppContext State Change ===');
    console.log('Joined rooms:', state.joinedRooms);
    console.log('Is authenticated:', state.isAuthenticated);
    console.log('User:', state.user?.username || 'None');
    console.log('localStorage joinedRooms:', localStorage.getItem('joinedRooms'));
    console.log('===============================');
  }, [state.joinedRooms, state.isAuthenticated, state.user]);

  // Listen for storage events (changes from other tabs only)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'joinedRooms' && e.newValue) {
        try {
          const parsedRooms = JSON.parse(e.newValue);
          console.log('Storage event - syncing joinedRooms from other tab:', parsedRooms);
          setState(prev => ({ ...prev, joinedRooms: parsedRooms }));
        } catch (error) {
          console.error('Failed to sync from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setUser = (user: User | null) => {
    setState(prev => ({ ...prev, user }));
  };

  const setIsAuthenticated = (isAuthenticated: boolean) => {
    setState(prev => ({ ...prev, isAuthenticated }));
  };

  const setLanguage = (language: Language) => {
    setState(prev => ({ ...prev, language }));
  };

  const toggleDarkMode = () => {
    const newDarkMode = !state.isDarkMode;
    setState(prev => ({ ...prev, isDarkMode: newDarkMode }));
    
    // Save to localStorage
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Toggle dark class
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setSafeMode = (safeMode: SafeMode) => {
    setState(prev => ({ ...prev, safeMode }));
  };

  const joinRoom = (roomId: string) => {
    console.log('=== JOIN ROOM ===');
    console.log('Joining room:', roomId);
    console.log('Current joinedRooms:', state.joinedRooms);
    
    // Calculate new joined rooms immediately
    const currentJoinedRooms = state.joinedRooms;
    const newJoinedRooms = currentJoinedRooms.includes(roomId) 
      ? currentJoinedRooms 
      : [...currentJoinedRooms, roomId];
    
    console.log('New joinedRooms:', newJoinedRooms);
    
    // Persist to localStorage BEFORE updating state
    localStorage.setItem('joinedRooms', JSON.stringify(newJoinedRooms));
    console.log('Saved to localStorage:', JSON.stringify(newJoinedRooms));
    
    // Update state
    setState(prev => ({ 
      ...prev, 
      joinedRooms: newJoinedRooms
    }));
  };

  const leaveRoom = (roomId: string) => {
    console.log('=== LEAVE ROOM ===');
    console.log('Leaving room:', roomId);
    console.log('Current joinedRooms:', state.joinedRooms);
    
    // Calculate new joined rooms immediately
    const currentJoinedRooms = state.joinedRooms;
    const newJoinedRooms = currentJoinedRooms.filter(id => id !== roomId);
    
    console.log('New joinedRooms:', newJoinedRooms);
    
    // Persist to localStorage BEFORE updating state
    localStorage.setItem('joinedRooms', JSON.stringify(newJoinedRooms));
    console.log('Saved to localStorage:', JSON.stringify(newJoinedRooms));
    
    // Update state
    setState(prev => ({ 
      ...prev, 
      joinedRooms: newJoinedRooms
    }));
  };

  const logout = () => {
    logoutUser();
    
    // Clear joined rooms from localStorage
    localStorage.setItem('joinedRooms', JSON.stringify([]));
    
    setState(prev => ({ 
      ...prev, 
      user: null, 
      isAuthenticated: false,
      joinedRooms: [], // Clear joined rooms on logout
    }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setUser,
      setIsAuthenticated,
      setLanguage,
      toggleDarkMode,
      setSafeMode,
      joinRoom,
      leaveRoom,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
};
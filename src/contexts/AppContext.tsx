import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { logoutUser, getCurrentUser } from '@/lib/authApi';
import { ProfileQuestion } from '@/types';
import { clearConversationStates } from '@/lib/conversationStorage';
import { GenderIdentity, Orientation, AttractionPreference, getAttractionPreferences } from './app-utils';

// Import UserLanguage type from auth.ts
type UserLanguage = {
  code: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
};

type SafeMode = 'light' | 'deep' | 'learning';
type ChatStyle = 'introvert' | 'ambievert' | 'extrovert';
type Language = 'en' | 'ka';

type RelationshipIntent = 'relationship' | 'friendship' | 'both';

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  about: string; // New field for registration answers
  interests: string[];
  languages: UserLanguage[];
  chatStyle: ChatStyle;
  safeMode: SafeMode;
  anonymousMode: boolean;
  aiAssistant: boolean;
  // Date of birth and calculated age
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  age: number; // Calculated from dateOfBirth
  location: string;
  hometown?: string;
  relationshipStatus?: string;
  // Fields for gender and orientation
  genderIdentity: GenderIdentity;
  orientation: Orientation;
  lookingForRelationship: boolean;
  lookingForFriendship: boolean;
  customGender?: string; // For custom gender identity
  customOrientation?: string; // For custom orientation
  // New lifestyle fields
  smoking: 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say';
  drinking: 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say';
  hasChildren: 'no' | 'yes' | 'want-someday' | 'have-and-want-more' | 'have-and-dont-want-more' | 'not-sure-yet' | 'prefer-not-to-say';
  education: 'high-school' | 'bachelor' | 'master' | 'phd' | 'other' | 'prefer-not-to-say';
  occupation: string;
  religion: 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'atheist' | 'agnostic' | 'other' | 'prefer-not-to-say';
  politicalViews: 'liberal' | 'conservative' | 'moderate' | 'apolitical' | 'other' | 'prefer-not-to-say';
  languageProficiency: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'native'>;
  // Profile photos
  photos?: string[];
  // Profile questions for fun and personality insights
  profileQuestions: ProfileQuestion[];
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  language: Language;
  isDarkMode: boolean;
  safeMode: SafeMode;
  joinedRooms: string[];
}

export interface AppContextType extends AppState {
  setUser: (user: User | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setLanguage: (lang: Language) => void;
  toggleDarkMode: () => void;
  setSafeMode: (mode: SafeMode) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state with saved user if available
  const initializeState = (): AppState => {
    let savedUser: User | null = null;
    let savedDarkMode = false;
    let savedJoinedRooms: string[] = [];
    
    try {
      // Enhanced PWA environment detection
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      // Safely get user from storage with enhanced error handling
      try {
        savedUser = getCurrentUser();
      } catch (userError) {
        console.warn('Failed to get user from storage, trying fallback methods:', userError);
        
        // Try sessionStorage fallback for iOS PWA
        if (isPWA && isIOS) {
          try {
            const sessionUser = sessionStorage.getItem('driftzo_current_user');
            if (sessionUser) {
              const parsedUser = JSON.parse(sessionUser);
              if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
                console.log('Using sessionStorage fallback for iOS PWA');
                savedUser = parsedUser;
              }
            }
          } catch (sessionError) {
            console.warn('SessionStorage fallback also failed:', sessionError);
          }
        }
      }
      
      // Safely get dark mode preference
      try {
        const darkModeData = localStorage.getItem('darkMode');
        savedDarkMode = darkModeData === 'true';
      } catch (darkModeError) {
        console.warn('Failed to get dark mode preference:', darkModeError);
        savedDarkMode = false;
      }
      
      // Safely parse joined rooms from localStorage
      try {
        const joinedRoomsData = localStorage.getItem('joinedRooms');
        if (joinedRoomsData) {
          const parsed = JSON.parse(joinedRoomsData);
          if (Array.isArray(parsed)) {
            savedJoinedRooms = parsed;
          } else {
            console.warn('Invalid joined rooms data format, resetting to empty array');
            try {
              localStorage.setItem('joinedRooms', JSON.stringify([]));
            } catch (setError) {
              console.warn('Failed to reset joined rooms:', setError);
            }
          }
        }
      } catch (joinedRoomsError) {
        console.warn('Failed to parse joined rooms:', joinedRoomsError);
        savedJoinedRooms = [];
        try {
          localStorage.removeItem('joinedRooms');
        } catch (cleanupError) {
          console.warn('Failed to clean up joined rooms:', cleanupError);
        }
      }
    } catch (error) {
      console.error('Failed to initialize app state from localStorage:', error);
      // Reset corrupted data with enhanced error handling
      try {
        localStorage.removeItem('driftzo_current_user');
        sessionStorage.removeItem('driftzo_current_user');
        localStorage.setItem('joinedRooms', JSON.stringify([]));
        localStorage.setItem('darkMode', 'false');
      } catch (resetError) {
        console.error('Failed to reset corrupted localStorage data:', resetError);
      }
    }
    
    return {
      user: savedUser,
      isAuthenticated: !!savedUser,
      language: 'en',
      isDarkMode: savedDarkMode,
      safeMode: savedUser?.safeMode || 'light',
      joinedRooms: savedJoinedRooms
    };
  };

  const [state, setState] = useState<AppState>(initializeState);

  // Apply initial dark mode to DOM
  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []); // Run only once on mount

  // Listen for storage events (changes from other tabs only)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'joinedRooms' && e.newValue) {
        try {
          const parsedRooms = JSON.parse(e.newValue);

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
    
    // Save to localStorage with safe fallback
    try {
      localStorage.setItem('darkMode', newDarkMode.toString());
    } catch (error) {
      console.warn('Failed to save dark mode preference to localStorage:', error);
    }
    
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
    // Calculate new joined rooms immediately
    const currentJoinedRooms = state.joinedRooms;
    const newJoinedRooms = currentJoinedRooms.includes(roomId) 
      ? currentJoinedRooms 
      : [...currentJoinedRooms, roomId];
    
    // Persist to localStorage BEFORE updating state with safe fallback
    try {
      localStorage.setItem('joinedRooms', JSON.stringify(newJoinedRooms));
    } catch (error) {
      console.warn('Failed to save joined rooms to localStorage:', error);
      // Try to clear corrupted data and save again
      try {
        localStorage.removeItem('joinedRooms');
        localStorage.setItem('joinedRooms', JSON.stringify(newJoinedRooms));
      } catch (retryError) {
        console.error('Failed to save joined rooms even after cleanup:', retryError);
      }
    }
    
    // Update state
    setState(prev => ({ 
      ...prev, 
      joinedRooms: newJoinedRooms
    }));
  };

  const leaveRoom = (roomId: string) => {
    // Calculate new joined rooms immediately
    const currentJoinedRooms = state.joinedRooms;
    const newJoinedRooms = currentJoinedRooms.filter(id => id !== roomId);
    
    // Persist to localStorage BEFORE updating state with safe fallback
    try {
      localStorage.setItem('joinedRooms', JSON.stringify(newJoinedRooms));
    } catch (error) {
      console.warn('Failed to save joined rooms to localStorage:', error);
      // Try to clear corrupted data and save again
      try {
        localStorage.removeItem('joinedRooms');
        localStorage.setItem('joinedRooms', JSON.stringify(newJoinedRooms));
      } catch (retryError) {
        console.error('Failed to save joined rooms even after cleanup:', retryError);
      }
    }
    
    // Update state
    setState(prev => ({ 
      ...prev, 
      joinedRooms: newJoinedRooms
    }));
  };

  const logout = () => {
    // Clear user data with safe fallback
    try {
      logoutUser();
    } catch (error) {
      console.warn('Failed to logout user from storage:', error);
      // Try to clear manually
      try {
        localStorage.removeItem('driftzo_current_user');
        sessionStorage.removeItem('driftzo_current_user');
      } catch (cleanupError) {
        console.warn('Failed to manually clear user data:', cleanupError);
      }
    }
    
    // Clear joined rooms from localStorage with safe fallback
    try {
      localStorage.setItem('joinedRooms', JSON.stringify([]));
    } catch (error) {
      console.warn('Failed to clear joined rooms from localStorage:', error);
    }
    
    // Clear conversation states
    try {
      clearConversationStates();
    } catch (error) {
      console.warn('Failed to clear conversation states:', error);
    }
    
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
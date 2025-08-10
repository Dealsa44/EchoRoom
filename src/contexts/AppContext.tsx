import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { logoutUser, getCurrentUserFromStorage } from '@/lib/auth';
import { ProfileQuestion } from '@/types';
import { clearConversationStates } from '@/lib/conversationStorage';

type SafeMode = 'light' | 'deep' | 'learning';
type ChatStyle = 'introvert' | 'ambievert' | 'extrovert';
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

// Helper function to derive attraction preferences from gender and orientation
export const getAttractionPreferences = (genderIdentity: GenderIdentity, orientation: Orientation): AttractionPreference[] => {
  // Handle custom orientations as 'other'
  const normalizedOrientation = typeof orientation === 'string' && 
    !['heterosexual', 'homosexual', 'bisexual', 'asexual', 'pansexual', 'queer'].includes(orientation) 
    ? 'other' : orientation;

  switch (normalizedOrientation) {
    case 'heterosexual':
      if (genderIdentity === 'male') return ['women'];
      if (genderIdentity === 'female') return ['men'];
      if (genderIdentity === 'non-binary') return ['all-genders']; // Non-binary hetero is complex, default to all
      return ['all-genders'];
      
    case 'homosexual':
      if (genderIdentity === 'male') return ['men'];
      if (genderIdentity === 'female') return ['women'];
      if (genderIdentity === 'non-binary') return ['non-binary'];
      return ['all-genders'];
      
    case 'bisexual':
      return ['women', 'men'];
      
    case 'pansexual':
    case 'queer':
      return ['all-genders'];
      
    case 'asexual':
      return []; // Asexual people may not be sexually attracted to anyone, but could be romantically attracted
      
    case 'other':
    default:
      return ['all-genders']; // Default to all genders for unknown orientations
  }
};

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  about: string; // New field for registration answers
  interests: string[];
  languages: string[];
  chatStyle: ChatStyle;
  safeMode: SafeMode;
  anonymousMode: boolean;
  aiAssistant: boolean;
  // Date of birth and calculated age
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  age: number; // Calculated from dateOfBirth
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
  hasChildren: 'no' | 'yes' | 'planning' | 'prefer-not-to-say';
  education: 'high-school' | 'bachelor' | 'master' | 'phd' | 'other' | 'prefer-not-to-say';
  occupation: string;
  religion: 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'atheist' | 'agnostic' | 'other' | 'prefer-not-to-say';
  politicalViews: 'liberal' | 'conservative' | 'moderate' | 'apolitical' | 'other' | 'prefer-not-to-say';
  languageProficiency: string;
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
    // Calculate new joined rooms immediately
    const currentJoinedRooms = state.joinedRooms;
    const newJoinedRooms = currentJoinedRooms.includes(roomId) 
      ? currentJoinedRooms 
      : [...currentJoinedRooms, roomId];
    
    // Persist to localStorage BEFORE updating state
    localStorage.setItem('joinedRooms', JSON.stringify(newJoinedRooms));
    
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
    
    // Persist to localStorage BEFORE updating state
    localStorage.setItem('joinedRooms', JSON.stringify(newJoinedRooms));
    
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
    
    // Clear conversation states
    clearConversationStates();
    
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
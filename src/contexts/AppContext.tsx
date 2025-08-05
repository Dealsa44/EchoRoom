import React, { createContext, useContext, useState, ReactNode } from 'react';

type SafeMode = 'light' | 'deep' | 'learning';
type ChatStyle = 'introverted' | 'balanced' | 'outgoing';
type Language = 'en' | 'ka';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  interests: string[];
  languages: string[];
  chatStyle: ChatStyle;
  safeMode: SafeMode;
  anonymousMode: boolean;
  aiAssistant: boolean;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  language: Language;
  isDarkMode: boolean;
  safeMode: SafeMode;
}

interface AppContextType extends AppState {
  setUser: (user: User | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setLanguage: (lang: Language) => void;
  toggleDarkMode: () => void;
  setSafeMode: (mode: SafeMode) => void;
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
  const [state, setState] = useState<AppState>({
    user: null,
    isAuthenticated: false,
    language: 'en',
    isDarkMode: false,
    safeMode: 'light',
  });

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
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
    document.documentElement.classList.toggle('dark');
  };

  const setSafeMode = (safeMode: SafeMode) => {
    setState(prev => ({ ...prev, safeMode }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setUser,
      setIsAuthenticated,
      setLanguage,
      toggleDarkMode,
      setSafeMode,
    }}>
      {children}
    </AppContext.Provider>
  );
};
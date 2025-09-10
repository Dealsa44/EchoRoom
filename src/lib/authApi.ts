// New authentication service that uses the real API
import { authApi, User as ApiUser } from '@/services/api';
import { GenderIdentity, Orientation } from '@/contexts/app-utils';
import { ProfileQuestion } from '@/types';

// Convert API User to local User format
const convertApiUserToLocalUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.id,
    username: apiUser.username,
    email: apiUser.email,
    password: '', // Don't store password in frontend
    avatar: apiUser.avatar || '',
    bio: apiUser.bio || '',
    about: apiUser.about || '',
    interests: apiUser.interests?.map(i => i.interest) || [],
    languages: apiUser.languages || [],
    chatStyle: (apiUser.chatStyle as 'introvert' | 'ambievert' | 'extrovert') || 'ambievert',
    safeMode: (apiUser.safeMode as 'light' | 'deep' | 'learning') || 'light',
    anonymousMode: apiUser.anonymousMode || false,
    aiAssistant: apiUser.aiAssistant || false,
    dateOfBirth: apiUser.dateOfBirth || '',
    age: apiUser.dateOfBirth ? calculateAge(apiUser.dateOfBirth) : 0,
    location: apiUser.location || '',
    hometown: apiUser.hometown,
    relationshipStatus: apiUser.relationshipStatus,
    genderIdentity: (apiUser.genderIdentity as GenderIdentity) || 'prefer-not-to-say',
    orientation: (apiUser.orientation as Orientation) || 'other',
    lookingForRelationship: apiUser.lookingForRelationship || false,
    lookingForFriendship: apiUser.lookingForFriendship || false,
    customGender: apiUser.customGender,
    customOrientation: apiUser.customOrientation,
    smoking: (apiUser.smoking as 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say') || 'prefer-not-to-say',
    drinking: (apiUser.drinking as 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say') || 'prefer-not-to-say',
    hasChildren: (apiUser.hasChildren as 'no' | 'yes' | 'want-someday' | 'have-and-want-more' | 'have-and-dont-want-more' | 'not-sure-yet' | 'prefer-not-to-say') || 'prefer-not-to-say',
    education: (apiUser.education as 'high-school' | 'bachelor' | 'master' | 'phd' | 'other' | 'prefer-not-to-say') || 'prefer-not-to-say',
    occupation: apiUser.occupation || '',
    religion: (apiUser.religion as 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'atheist' | 'agnostic' | 'other' | 'prefer-not-to-say') || 'prefer-not-to-say',
    politicalViews: (apiUser.politicalViews as 'liberal' | 'conservative' | 'moderate' | 'apolitical' | 'other' | 'prefer-not-to-say') || 'prefer-not-to-say',
    languageProficiency: {},
    photos: apiUser.photos || [],
    profileQuestions: apiUser.profileQuestions || [],
  };
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1;
  }
  
  return age;
};

// Local User interface (matching your existing structure)
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  about: string;
  interests: string[];
  languages: Array<{
    code: string;
    name: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
  }>;
  chatStyle: 'introvert' | 'ambievert' | 'extrovert';
  safeMode: 'light' | 'deep' | 'learning';
  anonymousMode: boolean;
  aiAssistant: boolean;
  dateOfBirth: string;
  age: number;
  location: string;
  hometown?: string;
  relationshipStatus?: string;
  genderIdentity: GenderIdentity;
  orientation: Orientation;
  lookingForRelationship: boolean;
  lookingForFriendship: boolean;
  customGender?: string;
  customOrientation?: string;
  smoking: 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say';
  drinking: 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say';
  hasChildren: 'no' | 'yes' | 'want-someday' | 'have-and-want-more' | 'have-and-dont-want-more' | 'not-sure-yet' | 'prefer-not-to-say';
  education: 'high-school' | 'bachelor' | 'master' | 'phd' | 'other' | 'prefer-not-to-say';
  occupation: string;
  religion: 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'atheist' | 'agnostic' | 'other' | 'prefer-not-to-say';
  politicalViews: 'liberal' | 'conservative' | 'moderate' | 'apolitical' | 'other' | 'prefer-not-to-say';
  languageProficiency: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'native'>;
  photos?: string[];
  profileQuestions: ProfileQuestion[];
}

// Registration data interface
interface RegisterData {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
  location: string;
  hometown?: string;
  relationshipStatus?: string;
  languages?: Array<{
    code: string;
    name: string;
    proficiency: string;
  }>;
  interests?: string[];
  genderIdentity?: string;
  orientation?: string;
  customGender?: string;
  customOrientation?: string;
  ethnicity?: string;
  lookingForRelationship?: boolean;
  lookingForFriendship?: boolean;
  relationshipType?: string;
  smoking?: string;
  drinking?: string;
  hasChildren?: string;
  education?: string;
  occupation?: string;
  religion?: string;
  politicalViews?: string;
  about?: string;
  chatStyle?: string;
  photos?: string[];
}

// Login data interface
interface LoginData {
  email: string;
  password: string;
}

// Storage key for current user
const CURRENT_USER_KEY = 'echoroom_current_user';

// Save user to localStorage
const saveCurrentUser = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Failed to save user to localStorage:', error);
  }
};

// Get user from localStorage
const getCurrentUserFromStorage = (): User | null => {
  try {
    const userData = localStorage.getItem(CURRENT_USER_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Failed to get user from localStorage:', error);
    return null;
  }
};

// API Authentication Functions
export const registerUser = async (data: RegisterData): Promise<{ success: boolean; user?: User; token?: string; message?: string; errors?: string[] }> => {
  try {
    console.log('🔍 Calling authApi.register with data:', data);
    const response = await authApi.register(data);
    console.log('📋 authApi.register response:', response);
    
    if (response.success && response.user) {
      // Store the token
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      
      // Convert API user to local user format
      const localUser = convertApiUserToLocalUser(response.user);
      saveCurrentUser(localUser);
      
      console.log('✅ Registration successful, user:', localUser);
      
      return { 
        success: true, 
        user: localUser,
        token: response.token,
        message: response.message
      };
    } else {
      console.log('❌ Registration failed:', response.message);
      return { 
        success: false, 
        errors: response.errors || [response.message || 'Registration failed'] 
      };
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      errors: [error.message || 'Registration failed'] 
    };
  }
};

export const loginUser = async (data: LoginData): Promise<{ success: boolean; user?: User; errors?: string[] }> => {
  try {
    const response = await authApi.login(data);
    
    if (response.success && response.user) {
      // Store the token
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      
      // Convert API user to local user format
      const localUser = convertApiUserToLocalUser(response.user);
      saveCurrentUser(localUser);
      
      return { 
        success: true, 
        user: localUser
      };
    } else {
      return { 
        success: false, 
        errors: [response.message || 'Login failed'] 
      };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return { 
      success: false, 
      errors: [error.message || 'Login failed'] 
    };
  }
};

export const logoutUser = (): void => {
  try {
    // Call API logout (optional)
    authApi.logout().catch(console.error);
    
    // Clear local storage
    saveCurrentUser(null);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getCurrentUser = (): User | null => {
  return getCurrentUserFromStorage();
};

// Email verification functions
export const sendVerificationCode = async (email: string): Promise<{ success: boolean; message?: string; errors?: string[] }> => {
  try {
    const response = await authApi.sendVerificationCode(email);
    
    if (response.success) {
      return { success: true, message: response.message };
    } else {
      return { 
        success: false, 
        errors: [response.message || 'Failed to send verification code'] 
      };
    }
  } catch (error: any) {
    console.error('Send verification code error:', error);
    return { 
      success: false, 
      errors: [error.message || 'Failed to send verification code'] 
    };
  }
};

export const verifyEmailCode = async (email: string, code: string): Promise<{ success: boolean; message?: string; errors?: string[] }> => {
  try {
    const response = await authApi.verifyEmailCode(email, code);
    
    if (response.success) {
      return { 
        success: true, 
        message: response.message
      };
    } else {
      return { 
        success: false, 
        errors: [response.message || 'Invalid verification code'] 
      };
    }
  } catch (error: any) {
    console.error('Verify email code error:', error);
    return { 
      success: false, 
      errors: [error.message || 'Invalid verification code'] 
    };
  }
};

// Export types
export type { User, RegisterData, LoginData };

import { GenderIdentity, Orientation } from '@/contexts/app-utils';

// Define missing types locally
type Ethnicity = 'white' | 'black' | 'hispanic' | 'asian' | 'middle-eastern' | 'pacific-islander' | 'mixed' | 'other' | 'prefer-not-to-say';
type RelationshipType = 'casual' | 'serious' | 'marriage' | 'friendship';
type UserLanguage = {
  code: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
};

// Define User interface locally to match AppContext
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  about: string;
  interests: string[];
  languages: UserLanguage[];
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
  profileQuestions: any[];
}
import { getRandomProfileQuestions } from '@/data/profileQuestions';

const USERS_STORAGE_KEY = 'echoroom_users';
const CURRENT_USER_KEY = 'echoroom_current_user';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  location: string;
  hometown?: string;
  relationshipStatus?: string;
  languages: UserLanguage[];
  chatStyle: 'introvert' | 'ambievert' | 'extrovert';
  interests: string[];
  // Fields for gender and orientation
  genderIdentity: GenderIdentity;
  orientation: Orientation;
  ethnicity: Ethnicity;
  lookingForRelationship: boolean;
  lookingForFriendship: boolean;
  relationshipType?: RelationshipType;
  customGender?: string;
  customOrientation?: string;
  // Lifestyle fields
  smoking: 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say';
  drinking: 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say';
  hasChildren: 'no' | 'yes' | 'want-someday' | 'have-and-want-more' | 'have-and-dont-want-more' | 'not-sure-yet' | 'prefer-not-to-say';
  education: 'high-school' | 'bachelor' | 'master' | 'phd' | 'other' | 'prefer-not-to-say';
  occupation: string;
  religion: 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'atheist' | 'agnostic' | 'other' | 'prefer-not-to-say';
  politicalViews: 'liberal' | 'conservative' | 'moderate' | 'apolitical' | 'other' | 'prefer-not-to-say';
  about: string;
  languageProficiency?: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'native'>;
  photos?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

// Utility functions
export const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const validateAge = (dateOfBirth: string): boolean => {
  const age = calculateAge(dateOfBirth);
  return age >= 18;
};

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return errors;
};

export const validateUsername = (username: string): string[] => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  if (username.length > 20) {
    errors.push('Username must be less than 20 characters');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  return errors;
};

// Local storage functions
const getUsers = (): User[] => {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const getCurrentUser = (): User | null => {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const saveCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Authentication functions
export const registerUser = (data: RegisterData): Promise<{ success: boolean; user?: User; errors?: string[] }> => {
  return new Promise((resolve) => {
    // Validate input
    const errors: string[] = [];
    
    const usernameErrors = validateUsername(data.username);
    const emailErrors = validateEmail(data.email) ? [] : ['Please enter a valid email address'];
    const passwordErrors = validatePassword(data.password);
    const ageErrors = validateAge(data.dateOfBirth) ? [] : ['You must be at least 18 years old to register'];
    
    errors.push(...usernameErrors, ...emailErrors, ...passwordErrors, ...ageErrors);
    
    if (data.interests.length < 3) {
      errors.push('Please select at least 3 interests');
    }
    
    if (errors.length > 0) {
      resolve({ success: false, errors });
      return;
    }
    
    // Check if user already exists
    const users = getUsers();
    const existingUser = users.find(u => u.email === data.email || u.username === data.username);
    
    if (existingUser) {
      if (existingUser.email === data.email) {
        resolve({ success: false, errors: ['An account with this email already exists'] });
      } else {
        resolve({ success: false, errors: ['This username is already taken'] });
      }
      return;
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username: data.username,
      email: data.email,
      password: data.password, // In a real app, this would be hashed
      avatar: '🌱',
      bio: 'New to EchoRoom, excited to connect!',
      interests: data.interests,
      languages: data.languages,
      chatStyle: data.chatStyle,
      safeMode: 'light',
      anonymousMode: false,
      aiAssistant: true,
      // Date of birth and calculated age
      dateOfBirth: data.dateOfBirth,
      age: calculateAge(data.dateOfBirth),
      location: data.location,
      hometown: data.hometown,
      relationshipStatus: data.relationshipStatus,
      // New fields for gender and orientation
      genderIdentity: data.genderIdentity,
      orientation: data.orientation,
      ethnicity: data.ethnicity,

      lookingForRelationship: data.lookingForRelationship,
      lookingForFriendship: data.lookingForFriendship,
      relationshipType: data.relationshipType,
      customGender: data.customGender,
      customOrientation: data.customOrientation,
      // Lifestyle fields
      smoking: data.smoking,
      drinking: data.drinking,
      hasChildren: data.hasChildren,
      education: data.education,
      occupation: data.occupation,
      religion: data.religion,
      politicalViews: data.politicalViews,
      about: data.about,
      languageProficiency: data.languageProficiency,
      // Use photos from registration data, or sample photos if none provided
      photos: data.photos && data.photos.length > 0 ? data.photos : [
        'https://picsum.photos/400/400?random=1',
        'https://picsum.photos/400/400?random=2'
      ],
      profileQuestions: getRandomProfileQuestions(5)
    } as User;
    
    // Save user
    users.push(newUser);
    saveUsers(users);
    saveCurrentUser(newUser);
    
    resolve({ success: true, user: newUser });
  });
};

export const loginUser = (data: LoginData): Promise<{ success: boolean; user?: User; errors?: string[] }> => {
  return new Promise((resolve) => {
    const users = getUsers();
    const user = users.find(u => u.email === data.email && u.password === data.password);
    
    if (!user) {
      resolve({ success: false, errors: ['Invalid email or password'] });
      return;
    }
    
    saveCurrentUser(user);
    resolve({ success: true, user });
  });
};

export const logoutUser = (): void => {
  saveCurrentUser(null);
};

export const getCurrentUserFromStorage = (): User | null => {
  return getCurrentUser();
};

export const updateUserProfile = (userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; errors?: string[] }> => {
  return new Promise((resolve) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      resolve({ success: false, errors: ['User not found'] });
      return;
    }
    
    // Validate updates if they include email or username
    const errors: string[] = [];
    
    if (updates.email && !validateEmail(updates.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (updates.username) {
      const usernameErrors = validateUsername(updates.username);
      errors.push(...usernameErrors);
    }
    
    if (updates.password) {
      const passwordErrors = validatePassword(updates.password);
      errors.push(...passwordErrors);
    }
    
    if (errors.length > 0) {
      resolve({ success: false, errors });
      return;
    }
    
    // Check for conflicts
    if (updates.email || updates.username) {
      const existingUser = users.find(u => 
        u.id !== userId && 
        (u.email === updates.email || u.username === updates.username)
      );
      
      if (existingUser) {
        if (existingUser.email === updates.email) {
          errors.push('An account with this email already exists');
        } else {
          errors.push('This username is already taken');
        }
        resolve({ success: false, errors });
        return;
      }
    }
    
    // Update user
    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    saveUsers(users);
    saveCurrentUser(updatedUser);
    
    resolve({ success: true, user: updatedUser });
  });
}; 
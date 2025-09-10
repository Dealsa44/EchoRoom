// API service for communicating with EchoRoom backend
const API_BASE_URL = 'https://echoroombackend-production.up.railway.app/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  token?: string;
  errors?: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  about?: string;
  dateOfBirth?: string;
  location?: string;
  hometown?: string;
  relationshipStatus?: string;
  chatStyle?: string;
  safeMode?: string;
  anonymousMode?: boolean;
  aiAssistant?: boolean;
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
  photos?: string[];
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  languages?: Array<{
    id: string;
    code: string;
    name: string;
    proficiency: string;
  }>;
  interests?: Array<{
    id: string;
    interest: string;
  }>;
  profileQuestions?: Array<{
    id: string;
    question: string;
    answer?: string;
  }>;
}

export interface RegisterData {
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
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerificationData {
  email: string;
  code: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('echoroom_token');
};

// Helper function to set auth token
const setAuthToken = (token: string): void => {
  localStorage.setItem('echoroom_token', token);
};

// Helper function to remove auth token
const removeAuthToken = (): void => {
  localStorage.removeItem('echoroom_token');
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Authentication API functions
export const authApi = {
  // Send verification code to email
  sendVerificationCode: async (email: string): Promise<ApiResponse> => {
    return apiRequest('/auth/send-verification-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Verify email code
  verifyEmailCode: async (email: string, code: string): Promise<ApiResponse> => {
    return apiRequest('/auth/verify-email-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  // Register user
  register: async (data: RegisterData): Promise<ApiResponse<User>> => {
    const response = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      setAuthToken(response.data.token);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
      };
    }

    return {
      success: false,
      message: response.message || 'Registration failed',
      errors: response.errors,
    };
  },

  // Login user
  login: async (data: LoginData): Promise<ApiResponse<User>> => {
    const response = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      setAuthToken(response.data.token);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
      };
    }

    return {
      success: false,
      message: response.message || 'Login failed',
      errors: response.errors,
    };
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    const response = await apiRequest('/auth/logout', {
      method: 'POST',
    });

    removeAuthToken();
    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/auth/me');
  },
};

// User API functions
export const userApi = {
  // Get user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/user/profile');
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Search users
  searchUsers: async (query: string, limit = 20, offset = 0): Promise<ApiResponse<User[]>> => {
    return apiRequest<User[]>(`/user/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);
  },
};

// Chat API functions
export const chatApi = {
  // Get all chat rooms
  getChatRooms: async (category?: string, limit = 20, offset = 0): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return apiRequest<any[]>(`/chat/rooms?${params.toString()}`);
  },

  // Get single chat room
  getChatRoom: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/chat/rooms/${id}`);
  },

  // Join chat room
  joinChatRoom: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/chat/rooms/${id}/join`, {
      method: 'POST',
    });
  },

  // Leave chat room
  leaveChatRoom: async (id: string): Promise<ApiResponse> => {
    return apiRequest(`/chat/rooms/${id}/leave`, {
      method: 'POST',
    });
  },

  // Get room messages
  getRoomMessages: async (id: string, limit = 50, offset = 0): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/chat/rooms/${id}/messages?limit=${limit}&offset=${offset}`);
  },

  // Send message
  sendMessage: async (roomId: string, content: string, type = 'text', imageUrl?: string, fileData?: any, voiceData?: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        type,
        imageUrl,
        fileData,
        voiceData,
      }),
    });
  },
};

export default {
  authApi,
  userApi,
  chatApi,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
};

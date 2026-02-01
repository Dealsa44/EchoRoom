// API service for communicating with Driftzo backend
const API_BASE_URL = 'https://echoroom-backend-23jb.onrender.com/api';

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
  return localStorage.getItem('driftzo_token');
};

// Helper function to set auth token
const setAuthToken = (token: string): void => {
  localStorage.setItem('driftzo_token', token);
};

// Helper function to remove auth token
const removeAuthToken = (): void => {
  localStorage.removeItem('driftzo_token');
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
  verifyEmailCode: async (email: string, code: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    return apiRequest<{ user: User; token: string }>('/auth/verify-email-code', {
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

    if (response.success && response.user) {
      setAuthToken(response.token);
      return {
        success: true,
        user: response.user,
        token: response.token,
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

    if (response.success && response.user) {
      setAuthToken(response.token);
      return {
        success: true,
        user: response.user,
        token: response.token,
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

  // Discover feed for Match page (compatible real users only)
  getDiscover: async (): Promise<{ success: boolean; users?: DiscoverProfile[]; message?: string }> => {
    return apiRequest<any>('/user/discover');
  },

  // Public profile by id (for viewing another user's profile)
  getPublicProfile: async (id: string): Promise<{ success: boolean; profile?: DiscoverProfile; message?: string }> => {
    return apiRequest<any>(`/user/${id}`);
  },
};

// Profile shape returned by discover and getPublicProfile (Match card / other's profile)
export interface DiscoverProfile {
  id: string;
  name: string;
  avatar: string;
  age: number;
  location: string;
  hometown?: string;
  relationshipStatus?: string;
  distance: number;
  bio: string;
  about: string;
  interests: string[];
  languages: Array<{ language: string; level: string }>;
  languageLevel: string;
  chatStyle: string;
  lastActive: string;
  isOnline: boolean;
  sharedInterests: number;
  genderIdentity: string;
  orientation: string;
  ethnicity: string;
  lookingForRelationship: boolean;
  lookingForFriendship: boolean;
  relationshipType?: string;
  smoking: string;
  drinking: string;
  hasChildren: string;
  education: string;
  occupation: string;
  religion: string;
  politicalViews: string;
  photos: string[];
  isVerified: boolean;
  profileCompletion: number;
  iceBreakerAnswers: Record<string, string>;
  profileQuestions: Array<{ id: string; question: string; category?: string; answer?: string }>;
}

// Forum types (list + thread)
export interface ForumPostListItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  categoryLabel?: string;
  tags: string[];
  isStickied: boolean;
  author: string;
  authorId: string;
  authorAvatar: string;
  replies: number;
  upvotes: number;
  lastActivity: string;
  createdAt: string;
}

export interface ForumCommentNode {
  id: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  authorLevel: string;
  content: string;
  createdAt: string;
  upvotes: number;
  userLiked: boolean;
  replies: ForumCommentNode[];
}

export interface ForumPostDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  categoryLabel?: string;
  tags: string[];
  isStickied: boolean;
  author: string;
  authorId: string;
  authorAvatar: string;
  authorLevel: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  userLiked: boolean;
  comments: ForumCommentNode[];
  replyCount: number;
}

// Forum API
export const forumApi = {
  getPosts: async (params?: { category?: string; search?: string; sort?: string }): Promise<{ success: boolean; posts?: ForumPostListItem[]; message?: string }> => {
    const q = new URLSearchParams();
    if (params?.category && params.category !== 'all') q.set('category', params.category);
    if (params?.search) q.set('search', params.search);
    if (params?.sort) q.set('sort', params.sort);
    const query = q.toString();
    return apiRequest<any>(`/forum/posts${query ? `?${query}` : ''}`);
  },

  getPost: async (id: string): Promise<{ success: boolean; post?: ForumPostDetail; message?: string }> => {
    return apiRequest<any>(`/forum/posts/${id}`);
  },

  getPostCount: async (): Promise<{ success: boolean; count?: number; message?: string }> => {
    return apiRequest<any>('/forum/posts/count');
  },

  createPost: async (data: { title: string; content: string; category: string; tags?: string[] }): Promise<{ success: boolean; post?: ForumPostListItem; message?: string }> => {
    return apiRequest<any>('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  reactPost: async (postId: string): Promise<{ success: boolean; liked?: boolean; count?: number; message?: string }> => {
    return apiRequest<any>(`/forum/posts/${postId}/react`, { method: 'PUT' });
  },

  addComment: async (postId: string, content: string, parentId?: string): Promise<{ success: boolean; comment?: ForumCommentNode; message?: string }> => {
    return apiRequest<any>(`/forum/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId: parentId || undefined }),
    });
  },

  reactComment: async (commentId: string): Promise<{ success: boolean; liked?: boolean; count?: number; message?: string }> => {
    return apiRequest<any>(`/forum/comments/${commentId}/react`, { method: 'PUT' });
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
  forumApi,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
};

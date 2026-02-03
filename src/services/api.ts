// API service for communicating with Driftzo backend
const API_BASE_URL = 'https://echoroom-backend-23jb.onrender.com/api';

/** Base URL for Socket.IO (same host as API, no /api path) */
export function getSocketUrl(): string {
  return API_BASE_URL.replace(/\/api\/?$/, '');
}

// Types for API responses (index signature allows endpoint-specific payloads: event, events, posts, hosted, joined, etc.)
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  token?: string;
  errors?: string[];
  [key: string]: any;
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

// Generic cache: fast reads, stale-while-revalidate, invalidate on mutations
const CACHE_TTL_MS = 60 * 1000; // 1 minute
const apiCache: Record<string, { data: any; ts: number }> = {};

function getCached<T>(key: string): T | null {
  const ent = apiCache[key];
  if (!ent || Date.now() - ent.ts > CACHE_TTL_MS) return null;
  return ent.data as T;
}
function setCached(key: string, data: any) {
  apiCache[key] = { data, ts: Date.now() };
}
export function invalidateApiCache(keyOrKeys: string | string[] | ((k: string) => boolean)) {
  if (typeof keyOrKeys === 'string') {
    delete apiCache[keyOrKeys];
    return;
  }
  if (Array.isArray(keyOrKeys)) {
    keyOrKeys.forEach((k) => delete apiCache[k]);
    return;
  }
  Object.keys(apiCache).forEach((k) => {
    if (keyOrKeys(k)) delete apiCache[k];
  });
}

/** Return cached data if fresh; else fetch. When returning cached, revalidate in background so next read is up to date. */
async function cachedOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key);
  if (cached != null) {
    fetcher().then((fresh) => {
      setCached(key, fresh);
    }).catch(() => {});
    return cached;
  }
  const data = await fetcher();
  setCached(key, data);
  return data;
}

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
    const response = await apiRequest<User>('/auth/register', {
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
    const response = await apiRequest<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.user) {
      setAuthToken(response.token);
      invalidateApiCache(['auth/me', 'user/profile']);
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
    invalidateApiCache('auth/me');
    return response;
  },

  // Get current user (cached; revalidate in background)
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return cachedOrFetch('auth/me', () => apiRequest<User>('/auth/me'));
  },
};

// User API functions
export const userApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    return cachedOrFetch('user/profile', () => apiRequest<User>('/user/profile'));
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const res = await apiRequest<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res.success) invalidateApiCache((k) => k === 'auth/me' || k.startsWith('user/profile'));
    return res;
  },

  searchUsers: async (query: string, limit = 20, offset = 0): Promise<ApiResponse<User[]>> => {
    return cachedOrFetch(`user/search/${encodeURIComponent(query)}/${limit}/${offset}`, () =>
      apiRequest<User[]>(`/user/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`)
    );
  },

  getDiscover: async (intent?: string): Promise<{ success: boolean; users?: DiscoverProfile[]; message?: string }> => {
    const key = `user/discover/${intent ?? 'all'}`;
    return cachedOrFetch(key, async () => {
      const q = intent && intent !== 'all' ? `?intent=${encodeURIComponent(intent)}` : '';
      return apiRequest<any>(`/user/discover${q}`);
    });
  },

  getPublicProfile: async (id: string): Promise<{ success: boolean; profile?: DiscoverProfile; message?: string }> => {
    return cachedOrFetch(`user/profile/${id}`, () => apiRequest<any>(`/user/${id}`));
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
    const key = `forum/posts/${query || '_'}`;
    return cachedOrFetch(key, () => apiRequest<any>(`/forum/posts${query ? `?${query}` : ''}`));
  },

  getPost: async (id: string): Promise<{ success: boolean; post?: ForumPostDetail; message?: string }> => {
    return cachedOrFetch(`forum/post/${id}`, () => apiRequest<any>(`/forum/posts/${id}`));
  },

  getPostCount: async (): Promise<{ success: boolean; count?: number; message?: string }> => {
    return cachedOrFetch('forum/posts/count', () => apiRequest<any>('/forum/posts/count'));
  },

  createPost: async (data: { title: string; content: string; category: string; tags?: string[] }): Promise<{ success: boolean; post?: ForumPostListItem; message?: string }> => {
    const res = await apiRequest<any>('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success) invalidateApiCache((k) => k.startsWith('forum/'));
    return res;
  },

  reactPost: async (postId: string): Promise<{ success: boolean; liked?: boolean; count?: number; message?: string }> => {
    const res = await apiRequest<any>(`/forum/posts/${postId}/react`, { method: 'PUT' });
    if (res.success) invalidateApiCache([`forum/post/${postId}`, 'forum/posts/count']);
    return res;
  },

  addComment: async (postId: string, content: string, parentId?: string): Promise<{ success: boolean; comment?: ForumCommentNode; message?: string }> => {
    const res = await apiRequest<any>(`/forum/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId: parentId || undefined }),
    });
    if (res.success) invalidateApiCache([`forum/post/${postId}`]);
    return res;
  },

  reactComment: async (commentId: string): Promise<{ success: boolean; liked?: boolean; count?: number; message?: string }> => {
    return apiRequest<any>(`/forum/comments/${commentId}/react`, { method: 'PUT' });
  },
};

// Events API types
export interface EventListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  location: string;
  address?: string;
  date: string;
  time: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  currency: string;
  organizer: { id: string; name: string; avatar: string; isVerified: boolean };
  tags: string[];
  isPrivate: boolean;
  isFeatured: boolean;
  image?: string;
  language?: string;
  highlights: string[];
  isJoined: boolean;
  isBookmarked: boolean;
  reactionCount?: number;
  createdAt: string;
  lastUpdated: string;
}

export interface EventDetail extends EventListItem {
  longDescription?: string;
  aboutEvent?: string;
  virtualMeetingLink?: string;
  additionalInfo?: string;
  agenda?: string[];
  rules?: string[];
  cancellationPolicy?: string;
  refundPolicy?: string;
  transportation?: string[];
  parking?: string;
  accessibility?: string[];
  photos?: string[];
  documents?: Array<{ name: string; url: string; type: string; size: string }>;
  organizer: EventListItem['organizer'] & {
    bio?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    socialMedia?: Record<string, string>;
  };
  isOrganizer?: boolean;
  reactionCount: number;
  userReacted?: boolean;
}

export interface EventParticipantItem {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  joinedAt: string;
  status: string;
  isOrganizer: boolean;
}

export interface EventMessageItem {
  id: string;
  user: { id: string; name: string; avatar: string };
  content: string;
  timestamp: string;
  type: string;
}

// Simple in-memory cache for events (avoid refetch when navigating back quickly)
const EVENTS_CACHE_TTL_MS = 60 * 1000; // 1 minute
const eventsCache: {
  event: Record<string, { data: { success: boolean; event?: EventDetail }; ts: number }>;
  my: { data: { success: boolean; hosted?: EventListItem[]; joined?: EventListItem[] }; ts: number } | null;
  list: Record<string, { data: { success: boolean; events?: EventListItem[] }; ts: number }>;
} = { event: {}, my: null, list: {} };

function getCachedEvent(id: string): { success: boolean; event?: EventDetail } | null {
  const ent = eventsCache.event[id];
  if (!ent || Date.now() - ent.ts > EVENTS_CACHE_TTL_MS) return null;
  return ent.data;
}
function setCachedEvent(id: string, data: { success: boolean; event?: EventDetail }) {
  eventsCache.event[id] = { data, ts: Date.now() };
}
function getCachedMy(): { success: boolean; hosted?: EventListItem[]; joined?: EventListItem[] } | null {
  if (!eventsCache.my || Date.now() - eventsCache.my.ts > EVENTS_CACHE_TTL_MS) return null;
  return eventsCache.my.data;
}
function setCachedMy(data: { success: boolean; hosted?: EventListItem[]; joined?: EventListItem[] }) {
  eventsCache.my = { data, ts: Date.now() };
}
function getCachedList(key: string): { success: boolean; events?: EventListItem[] } | null {
  const ent = eventsCache.list[key];
  if (!ent || Date.now() - ent.ts > EVENTS_CACHE_TTL_MS) return null;
  return ent.data;
}
function setCachedList(key: string, data: { success: boolean; events?: EventListItem[] }) {
  eventsCache.list[key] = { data, ts: Date.now() };
}
function invalidateEventsCache(opts?: { eventId?: string; my?: boolean; list?: boolean }) {
  if (opts?.eventId) delete eventsCache.event[opts.eventId];
  if (opts?.my) eventsCache.my = null;
  if (opts?.list) eventsCache.list = {};
}

// Events API
export const eventsApi = {
  list: async (params?: { category?: string; type?: string; date?: string; price?: string; search?: string; sort?: string }): Promise<{ success: boolean; events?: EventListItem[]; message?: string }> => {
    const q = new URLSearchParams();
    if (params?.category && params.category !== 'all') q.set('category', params.category);
    if (params?.type && params.type !== 'all') q.set('type', params.type);
    if (params?.date && params.date !== 'all') q.set('date', params.date);
    if (params?.price && params.price !== 'all') q.set('price', params.price);
    if (params?.search) q.set('search', params.search);
    if (params?.sort) q.set('sort', params.sort);
    const query = q.toString();
    const key = query || '_';
    const cached = getCachedList(key);
    if (cached) {
      apiRequest<any>(`/events${query ? `?${query}` : ''}`).then((res) => { if (res.success) setCachedList(key, res); }).catch(() => {});
      return cached;
    }
    const res = await apiRequest<any>(`/events${query ? `?${query}` : ''}`);
    if (res.success) setCachedList(key, res);
    return res;
  },

  getMy: async (): Promise<{ success: boolean; hosted?: EventListItem[]; joined?: EventListItem[]; message?: string }> => {
    const cached = getCachedMy();
    if (cached) {
      apiRequest<any>('/events/my').then((res) => { if (res.success) setCachedMy(res); }).catch(() => {});
      return cached;
    }
    const res = await apiRequest<any>('/events/my');
    if (res.success) setCachedMy(res);
    return res;
  },

  get: async (id: string): Promise<{ success: boolean; event?: EventDetail; message?: string }> => {
    const cached = getCachedEvent(id);
    if (cached) {
      apiRequest<any>(`/events/${id}`).then((res) => { if (res.success && res.event) setCachedEvent(id, res); }).catch(() => {});
      return cached;
    }
    const res = await apiRequest<any>(`/events/${id}`);
    if (res.success && res.event) setCachedEvent(id, res);
    return res;
  },

  create: async (data: Record<string, unknown>): Promise<{ success: boolean; event?: EventListItem; message?: string }> => {
    const res = await apiRequest<any>('/events', { method: 'POST', body: JSON.stringify(data) });
    if (res.success) invalidateEventsCache({ my: true, list: true });
    return res;
  },

  update: async (id: string, data: Record<string, unknown>): Promise<{ success: boolean; message?: string }> => {
    const res = await apiRequest<any>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (res.success) invalidateEventsCache({ eventId: id, my: true, list: true });
    return res;
  },

  delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiRequest<any>(`/events/${id}`, { method: 'DELETE' });
    if (res.success) invalidateEventsCache({ eventId: id, my: true, list: true });
    return res;
  },

  join: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiRequest<any>(`/events/${id}/join`, { method: 'POST' });
    if (res.success) invalidateEventsCache({ eventId: id, my: true, list: true });
    return res;
  },

  leave: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiRequest<any>(`/events/${id}/leave`, { method: 'POST' });
    if (res.success) invalidateEventsCache({ eventId: id, my: true, list: true });
    return res;
  },

  react: async (id: string): Promise<{ success: boolean; reacted?: boolean; count?: number; message?: string }> => {
    const res = await apiRequest<any>(`/events/${id}/react`, { method: 'PUT' });
    if (res.success) invalidateEventsCache({ eventId: id });
    return res;
  },

  getParticipants: async (id: string): Promise<{ success: boolean; participants?: EventParticipantItem[]; message?: string }> => {
    return cachedOrFetch(`events/participants/${id}`, () => apiRequest<any>(`/events/${id}/participants`));
  },

  removeParticipant: async (eventId: string, userId: string): Promise<{ success: boolean; message?: string }> => {
    const res = await apiRequest<any>(`/events/${eventId}/participants/${userId}`, { method: 'DELETE' });
    if (res.success) {
      invalidateApiCache(`events/participants/${eventId}`);
      invalidateEventsCache({ eventId });
    }
    return res;
  },

  getMessages: async (id: string): Promise<{ success: boolean; messages?: EventMessageItem[]; message?: string }> => {
    return cachedOrFetch(`events/messages/${id}`, () => apiRequest<any>(`/events/${id}/messages`));
  },

  sendMessage: async (id: string, content: string): Promise<{ success: boolean; message?: EventMessageItem | string }> => {
    const res = await apiRequest<any>(`/events/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) });
    if (res.success) invalidateApiCache(`events/messages/${id}`);
    return res as { success: boolean; message?: EventMessageItem | string };
  },
};

// Chat API functions
export const chatApi = {
  getChatRooms: async (category?: string, limit = 20, offset = 0): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    const key = `chat/rooms/${category ?? '_'}/${limit}/${offset}`;
    return cachedOrFetch(key, () => apiRequest<any[]>(`/chat/rooms?${params.toString()}`));
  },

  getChatRoom: async (id: string): Promise<ApiResponse<any>> => {
    return cachedOrFetch(`chat/room/${id}`, () => apiRequest<any>(`/chat/rooms/${id}`));
  },

  joinChatRoom: async (id: string): Promise<ApiResponse> => {
    const res = await apiRequest(`/chat/rooms/${id}/join`, { method: 'POST' });
    if (res.success) invalidateApiCache((k) => k.startsWith('chat/'));
    return res;
  },

  leaveChatRoom: async (id: string): Promise<ApiResponse> => {
    const res = await apiRequest(`/chat/rooms/${id}/leave`, { method: 'POST' });
    if (res.success) invalidateApiCache((k) => k.startsWith('chat/'));
    return res;
  },

  getRoomMessages: async (id: string, limit = 50, offset = 0): Promise<ApiResponse<any[]>> => {
    const key = `chat/room/${id}/messages/${limit}/${offset}`;
    return cachedOrFetch(key, () =>
      apiRequest<any[]>(`/chat/rooms/${id}/messages?limit=${limit}&offset=${offset}`)
    );
  },

  sendMessage: async (roomId: string, content: string, type = 'text', imageUrl?: string, fileData?: any, voiceData?: any): Promise<ApiResponse<any>> => {
    const res = await apiRequest<any>(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        type,
        imageUrl,
        fileData,
        voiceData,
      }),
    });
    if (res.success) invalidateApiCache((k) => k.startsWith(`chat/room/${roomId}/`));
    return res;
  },
};

// Conversation (DM) types
export interface ConversationListItem {
  id: string;
  otherUser: { id: string; name: string; avatar: string };
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
    type: string;
  } | null;
  lastMessageAt: string | null;
  isArchived: boolean;
}

export interface DirectMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: string;
  reactions: Array<{ userId: string; emoji: string }>;
  createdAt: string;
}

// Persistent cache for conversations/messages (localStorage) so messenger works offline / feels faster
const CONVERSATIONS_CACHE_KEY = 'driftzo:conversations';
const CONVERSATIONS_ARCHIVED_CACHE_KEY = 'driftzo:conversations:archived';
const MESSAGES_CACHE_KEY_PREFIX = 'driftzo:messages:';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getPersistedConversations(archived = false): ConversationListItem[] | null {
  try {
    const key = archived ? CONVERSATIONS_ARCHIVED_CACHE_KEY : CONVERSATIONS_CACHE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_MAX_AGE_MS) return null;
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
function setPersistedConversations(archived: boolean, data: ConversationListItem[]) {
  try {
    const key = archived ? CONVERSATIONS_ARCHIVED_CACHE_KEY : CONVERSATIONS_CACHE_KEY;
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}
export function getPersistedMessages(conversationId: string): DirectMessageItem[] | null {
  try {
    const raw = localStorage.getItem(MESSAGES_CACHE_KEY_PREFIX + conversationId);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_MAX_AGE_MS) return null;
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
function setPersistedMessages(conversationId: string, data: DirectMessageItem[]) {
  try {
    localStorage.setItem(MESSAGES_CACHE_KEY_PREFIX + conversationId, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

// Conversation (DM) API
export const conversationApi = {
  list: async (archived = false): Promise<{ success: boolean; conversations?: ConversationListItem[]; message?: string }> => {
    const q = archived ? '?archived=true' : '';
    try {
      const res = await apiRequest<ConversationListItem[]>(`/conversations${q}`);
      if (res.success && res.conversations) setPersistedConversations(archived, res.conversations);
      return res;
    } catch (e) {
      const cached = getPersistedConversations(archived);
      if (cached) return { success: true, conversations: cached };
      throw e;
    }
  },

  getOrCreate: async (otherUserId: string): Promise<{
    success: boolean;
    conversation?: { id: string; otherUser: { id: string; name: string; avatar: string } };
    message?: string;
  }> => {
    return apiRequest<any>(`/conversations/with/${encodeURIComponent(otherUserId)}`);
  },

  /** Sync: read cached messages from localStorage (for instant show when opening chat) */
  getCachedMessages: (conversationId: string): DirectMessageItem[] | null => getPersistedMessages(conversationId),

  getMessages: async (conversationId: string, limit = 50, offset = 0): Promise<{ success: boolean; messages?: DirectMessageItem[]; message?: string }> => {
    try {
      const res = await apiRequest<DirectMessageItem[]>(
        `/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
      );
      if (res.success && res.messages && offset === 0) setPersistedMessages(conversationId, res.messages);
      return res;
    } catch (e) {
      if (offset === 0) {
        const cached = getPersistedMessages(conversationId);
        if (cached) return { success: true, messages: cached };
      }
      throw e;
    }
  },

  sendMessage: async (conversationId: string, content: string): Promise<{ success: boolean; message?: DirectMessageItem | string }> => {
    const res = await apiRequest<DirectMessageItem>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: content.trim() }),
    });
    if (res.success) invalidateApiCache((k) => k.startsWith('conversations/'));
    return res as { success: boolean; message?: DirectMessageItem | string };
  },

  setArchived: async (conversationId: string, isArchived: boolean): Promise<ApiResponse> => {
    const res = await apiRequest(`/conversations/${conversationId}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ isArchived }),
    });
    if (res.success) invalidateApiCache((k) => k.startsWith('conversations'));
    return res;
  },

  deleteConversation: async (conversationId: string): Promise<ApiResponse> => {
    const res = await apiRequest(`/conversations/${conversationId}`, { method: 'DELETE' });
    if (res.success) invalidateApiCache((k) => k.startsWith('conversations'));
    return res;
  },

  reactToMessage: async (messageId: string, emoji: string): Promise<{ success: boolean; message?: DirectMessageItem | string }> => {
    const res = await apiRequest<DirectMessageItem>(`/conversations/messages/${messageId}/react`, {
      method: 'PUT',
      body: JSON.stringify({ emoji }),
    });
    return res as { success: boolean; message?: DirectMessageItem | string };
  },
};

export default {
  authApi,
  userApi,
  chatApi,
  forumApi,
  eventsApi,
  conversationApi,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
};

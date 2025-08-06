// Shared type definitions for EchoRoom app

export interface Profile {
  id: number;
  name: string;
  avatar: string;
  age: number;
  location: string;
  distance: number;
  bio: string;
  interests: string[];
  languageLevel: string;
  chatStyle: 'introverted' | 'balanced' | 'outgoing';
  lastActive: string;
  isOnline: boolean;
  sharedInterests: number;
  genderIdentity: string;
  orientation: string;
  lookingForRelationship: boolean;
  photos: string[];
  isVerified: boolean;
  profileCompletion: number;
  iceBreakerAnswers: Record<string, string>;
}

export interface ChatMessage {
  id: number;
  sender: 'me' | 'other' | string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'file';
  translated?: boolean;
  corrected?: boolean;
  originalContent?: string;
  translatedContent?: string;
  hasErrors?: boolean;
  corrections?: Array<{
    original: string;
    corrected: string;
    explanation: string;
    rule: string;
  }>;
  reactions?: string[];
  isEdited?: boolean;
  isDeleted?: boolean;
  replyTo?: number | null;
  deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'read';
  isEncrypted?: boolean;
}

export interface ChatRoom {
  id: string;
  title: string;
  category: string;
  members: number;
  description: string;
  isPrivate: boolean;
  activeNow: number;
  tags: string[];
  icon: string;
}

export interface ConversationContext {
  lastMessage: string;
  participants: string[];
  topic?: string;
  mood?: string;
  language?: string;
}

export interface SmartReply {
  text: string;
  confidence: number;
  category: 'supportive' | 'question' | 'agreement' | 'clarification' | 'empathy';
  tone: 'formal' | 'casual' | 'warm' | 'professional';
  emoji?: string;
}
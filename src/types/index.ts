// Shared type definitions for EchoRoom app

export interface ProfileQuestion {
  id: string;
  question: string;
  category: 'funny' | 'flirty' | 'deep' | 'casual' | 'creative';
  answer?: string;
}

export interface Profile {
  id: number;
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
  chatStyle: 'introvert' | 'ambievert' | 'extrovert';
  lastActive: string;
  isOnline: boolean;
  sharedInterests: number;
  genderIdentity: string;
  orientation: string;
  ethnicity: string;
  lookingForRelationship: boolean;
  lookingForFriendship: boolean;
  relationshipType?: string;
  smoking: 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say';
  drinking: 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say';
  hasChildren: 'no' | 'yes' | 'want-someday' | 'have-and-want-more' | 'have-and-dont-want-more' | 'not-sure-yet' | 'prefer-not-to-say';
  education: 'high-school' | 'bachelor' | 'master' | 'phd' | 'other' | 'prefer-not-to-say';
  occupation: string;
  religion: 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'atheist' | 'agnostic' | 'other' | 'prefer-not-to-say';
  politicalViews: 'liberal' | 'conservative' | 'moderate' | 'apolitical' | 'other' | 'prefer-not-to-say';
  photos: string[];
  isVerified: boolean;
  profileCompletion: number;
  iceBreakerAnswers: Record<string, string>;
  profileQuestions: ProfileQuestion[];
}

export interface ChatMessage {
  id: number;
  sender: 'me' | 'other' | string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'file';
  imageUrl?: string;
  fileData?: {
    name: string;
    size: string;
    url?: string;
  };
  voiceData?: {
    duration: number;
    waveform: number[];
    url?: string;
  };
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
  reactions?: Array<{
    emoji: string;
    userName: string;
  }>;
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

// Call System Types
export type CallType = 'voice' | 'video';
export type CallStatus = 'incoming' | 'outgoing' | 'ongoing' | 'completed' | 'missed' | 'declined' | 'ended';
export type CallDirection = 'incoming' | 'outgoing';

export interface CallRecord {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  type: CallType;
  status: CallStatus;
  direction: CallDirection;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  callQuality: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}

export interface CallSettings {
  videoQuality: 'low' | 'medium' | 'high';
  audioQuality: 'low' | 'medium' | 'high';
  autoAnswer: boolean;
  autoMute: boolean;
  speakerDefault: boolean;
  bandwidthLimit: 'low' | 'medium' | 'high' | 'unlimited';
}

export interface CallState {
  isInCall: boolean;
  currentCall?: CallRecord;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  callDuration: number;
  isConnecting: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}
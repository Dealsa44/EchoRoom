import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { safePlayAudio, createMobileAudio } from '@/lib/audioUtils';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Send, Bot, UserX, Flag, Users, Eye, EyeOff, Languages, MessageCircle, Lightbulb, Mic, Headphones, PenTool, Eye as EyeIcon, Brain, Star, Zap, Award, BookOpen, Hash, Reply, MoreVertical, Pin, Trash2, Shield, Volume, VolumeX, Crown, Settings, BarChart3, Paperclip, Square, X, Play, Pause, File, Download, Heart, Smile, ThumbsUp, Camera, Image, Edit3, CheckCircle, CheckCheck, Lock, HelpCircle, Volume2 } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { useLanguageAI } from '@/hooks/useLanguageAI';
import { LanguageCode } from '@/types/languageAI';
import { toast } from '@/hooks/use-toast';
import { chatRooms } from '@/data/chatRooms';
import AIAssistantModal from '@/components/modals/AIAssistantModal';
import LanguagePracticePanel from '@/components/language/LanguagePracticePanel';
import AITooltip from '@/components/ai/AITooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import TypingIndicator from '@/components/ui/TypingIndicator';
import MultiTypingIndicator from '@/components/ui/MultiTypingIndicator';

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, safeMode, leaveRoom } = useApp();
  const {
    learningLanguage,
    languageLevel,
    practiceMode,
    autoCorrect,
    grammarCheckEnabled,
    translationEnabled,
    speakingConfidence,
    listeningComprehension,
    writingAccuracy,
    readingSpeed,
    simulateGrammarCheck,
    simulateTranslation,
    simulateVocabularySuggestion,
    simulateConversationStarter,
    updateSkillProgress,
    addCorrection,
    addWordLearned,
    startLearningSession,
    endLearningSession,
    currentSession,
    getLearningInsights
  } = useLanguageAI();

  const [message, setMessage] = useState('');
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showLanguagePanel, setShowLanguagePanel] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [activeChannel, setActiveChannel] = useState('general');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showModTools, setShowModTools] = useState(false);
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [pinnedMessages, setPinnedMessages] = useState<Set<number>>(new Set());
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordingTimerRef, setRecordingTimerRef] = useState<NodeJS.Timeout | null>(null);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);
  const [actionSheetMessageId, setActionSheetMessageId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('english');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Find the actual room data based on the ID
  const room = chatRooms.find(r => r.id === id);
  
  // If room not found, redirect to chat rooms
  useEffect(() => {
    if (!room) {
      // Room not found - toast removed per user request
      navigate('/chat-rooms');
    }
  }, [room, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef) {
        clearInterval(recordingTimerRef);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (audioUpdateTimerRef.current) {
        clearInterval(audioUpdateTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (mediaRecorder) {
        mediaRecorder.ondataavailable = null;
        mediaRecorder.onstop = null;
        mediaRecorder.stop();
        setMediaRecorder(null);
        setAudioChunks([]);
        setRecordedAudioBlob(null);
      }
    };
  }, []);

  const roomData = room ? {
    id: room.id,
    title: room.title,
    description: room.description,
    members: room.members,
    activeNow: room.activeNow,
    icon: room.icon,
    category: room.category,
    tags: room.tags,
    isPrivate: room.isPrivate,
    isAnonymousAllowed: true,
    channels: getChannelsForCategory(room.category),
    moderators: getModeratorsByCategory(room.category),
    rules: getRulesByCategory(room.category)
  } : null;

  // Helper functions to get category-specific content
  function getChannelsForCategory(category: string) {
    const baseChannels = [
      { id: 'general', name: 'General', description: 'Main discussion', isDefault: true }
    ];

    const categoryChannels = {
      'languages': [
        { id: 'grammar', name: 'Grammar Help', description: 'Grammar questions and tips' },
        { id: 'pronunciation', name: 'Pronunciation', description: 'Pronunciation practice' },
        { id: 'culture', name: 'Culture Exchange', description: 'Cultural discussions' },
        { id: 'resources', name: 'Resources', description: 'Learning materials and links' }
      ],
      'philosophy': [
        { id: 'ethics', name: 'Ethics', description: 'Moral philosophy discussions' },
        { id: 'metaphysics', name: 'Metaphysics', description: 'Nature of reality' },
        { id: 'logic', name: 'Logic', description: 'Reasoning and argumentation' }
      ],
      'books': [
        { id: 'reviews', name: 'Book Reviews', description: 'Share your book reviews' },
        { id: 'recommendations', name: 'Recommendations', description: 'Get book suggestions' },
        { id: 'discussions', name: 'Book Discussions', description: 'Discuss current reads' }
      ],
      'wellness': [
        { id: 'meditation', name: 'Meditation', description: 'Meditation practices' },
        { id: 'mindfulness', name: 'Mindfulness', description: 'Mindful living tips' },
        { id: 'support', name: 'Support', description: 'Mutual support and encouragement' }
      ],
      'art': [
        { id: 'writing', name: 'Creative Writing', description: 'Share your writing' },
        { id: 'feedback', name: 'Feedback', description: 'Get constructive feedback' },
        { id: 'prompts', name: 'Writing Prompts', description: 'Creative challenges' }
      ],
      'science': [
        { id: 'physics', name: 'Physics', description: 'Physics discussions' },
        { id: 'technology', name: 'Technology', description: 'Latest tech trends' },
        { id: 'research', name: 'Research', description: 'Share interesting research' }
      ]
    };

    return [...baseChannels, ...(categoryChannels[category] || [])];
  }

  function getModeratorsByCategory(category: string) {
    const categoryMods = {
      'languages': ['LanguageHelper', 'PracticeBot'],
      'philosophy': ['SocratesBot', 'LogicMaster'],
      'books': ['BookBot', 'LiteraryGuide'],
      'wellness': ['ZenMaster', 'WellnessBot'],
      'art': ['CreativeBot', 'ArtMentor'],
      'science': ['ScienceBot', 'TechGuru']
    };
    return categoryMods[category] || ['ModeratorBot', 'Helper'];
  }

  function getRulesByCategory(category: string) {
    const baseRules = [
      'Be respectful to all members',
      'Stay on topic',
      'No spam or harassment'
    ];

    const categoryRules = {
      'languages': [...baseRules, 'Help others learn and practice', 'Be patient with learners'],
      'philosophy': [...baseRules, 'Support arguments with reasoning', 'Respect different viewpoints'],
      'books': [...baseRules, 'Use spoiler warnings', 'Cite sources when discussing'],
      'wellness': [...baseRules, 'Provide emotional support', 'No medical advice'],
      'art': [...baseRules, 'Give constructive feedback', 'Respect creative expression'],
      'science': [...baseRules, 'Cite scientific sources', 'Promote evidence-based discussion']
    };

    return categoryRules[category] || baseRules;
  }

  // Generate initial messages based on room category
  const getInitialMessages = (category: string, roomTitle: string, moderators: string[]) => {
    const moderatorName = moderators[0] || 'Helper';
    const moderatorAvatar = room.icon;

    const categoryMessages = {
      'languages': [
        {
          id: 1,
          user: { name: moderatorName, avatar: moderatorAvatar, isAnonymous: false, role: 'moderator' },
          content: `Welcome to ${roomTitle}! Feel free to practice your language skills here.`,
          timestamp: '2 min ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '👋', count: 3, users: ['user1', 'user2', 'user3'] }]
        },
        {
          id: 2,
          user: { name: 'Anonymous', avatar: '👤', isAnonymous: true, role: 'member' },
          content: 'Hello! I am learning English. Can someone help me practice?',
          timestamp: '1 min ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '❤️', count: 2, users: ['user4', 'user5'] }]
        },
        {
          id: 3,
          user: { name: 'Maya', avatar: '🎨', isAnonymous: false, role: 'member' },
          content: '🎵 Voice message (0:15)',
          timestamp: '30 sec ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [],
          type: 'voice',
          voiceData: {
            duration: 15,
            waveform: [0.2, 0.5, 0.8, 0.3, 0.7, 0.4, 0.9, 0.1, 0.6, 0.3, 0.8, 0.2, 0.4, 0.7, 0.5, 0.9, 0.3, 0.6, 0.1, 0.8]
          }
        }
      ],
      'philosophy': [
        {
          id: 1,
          user: { name: moderatorName, avatar: moderatorAvatar, isAnonymous: false, role: 'moderator' },
          content: `Welcome to ${roomTitle}! Share your thoughts and explore deep questions together.`,
          timestamp: '2 min ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '🤔', count: 5, users: ['user1', 'user2', 'user3', 'user4', 'user5'] }]
        },
        {
          id: 2,
          user: { name: 'DeepThinker', avatar: '💭', isAnonymous: false, role: 'member' },
          content: 'What do you think about the nature of consciousness? Is it purely physical?',
          timestamp: '1 min ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '🧠', count: 3, users: ['user6', 'user7', 'user8'] }]
        }
      ],
      'books': [
        {
          id: 1,
          user: { name: moderatorName, avatar: moderatorAvatar, isAnonymous: false, role: 'moderator' },
          content: `Welcome to ${roomTitle}! Share your latest reads and discover new stories.`,
          timestamp: '2 min ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '📖', count: 4, users: ['user1', 'user2', 'user3', 'user4'] }]
        },
        {
          id: 2,
          user: { name: 'BookWorm', avatar: '🐛', isAnonymous: false, role: 'member' },
          content: 'Just finished "The Midnight Library" - absolutely amazing! Anyone else read it?',
          timestamp: '1 min ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '⭐', count: 6, users: ['user5', 'user6', 'user7', 'user8', 'user9', 'user10'] }]
        }
      ],
      'wellness': [
        {
          id: 1,
          user: { name: moderatorName, avatar: moderatorAvatar, isAnonymous: false, role: 'moderator' },
          content: `Welcome to ${roomTitle}! This is a safe space for wellness and mindfulness.`,
          timestamp: '2 min ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '🧘', count: 7, users: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7'] }]
        },
        {
          id: 2,
          user: { name: 'ZenSeeker', avatar: '🕯️', isAnonymous: false, role: 'member' },
          content: 'Today\'s meditation session was incredibly peaceful. How is everyone feeling?',
          timestamp: '1 min ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '☮️', count: 5, users: ['user8', 'user9', 'user10', 'user11', 'user12'] }]
        }
      ],
      'art': [
        {
          id: 1,
          user: { name: moderatorName, avatar: moderatorAvatar, isAnonymous: false, role: 'moderator' },
          content: `Welcome to ${roomTitle}! Share your creative works and get constructive feedback.`,
          timestamp: '2 min ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '🎨', count: 8, users: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8'] }]
        },
        {
          id: 2,
          user: { name: 'PoetSoul', avatar: '🖋️', isAnonymous: false, role: 'member' },
          content: 'Just shared a new poem in the writing channel. Would love your thoughts!',
          timestamp: '1 min ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '💫', count: 4, users: ['user9', 'user10', 'user11', 'user12'] }]
        }
      ],
      'science': [
        {
          id: 1,
          user: { name: moderatorName, avatar: moderatorAvatar, isAnonymous: false, role: 'moderator' },
          content: `Welcome to ${roomTitle}! Discuss the latest in science and technology.`,
          timestamp: '2 min ago',
          isAI: false,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '🔬', count: 6, users: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'] }]
        },
        {
          id: 2,
          user: { name: 'ScienceBot', avatar: '🤖', isAnonymous: false, role: 'bot' },
          content: 'New breakthrough in quantum computing was announced today! Thoughts on the implications?',
          timestamp: '1 min ago',
          isAI: true,
          channel: 'general',
          replyTo: null,
          replies: [],
          isPinned: false,
          reactions: [{ emoji: '⚛️', count: 9, users: ['user7', 'user8', 'user9', 'user10', 'user11', 'user12', 'user13', 'user14', 'user15'] }]
        }
      ]
    };

    return categoryMessages[category] || categoryMessages['languages'];
  };

  const [messages, setMessages] = useState(() => 
    roomData ? getInitialMessages(roomData.category, roomData.title, roomData.moderators) : []
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!room || !roomData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-primary h-8 w-8 mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Generate AI suggestions based on room category
  const getAISuggestions = (category: string) => {
    const categorySuggestions = {
      'languages': [
        "What's your favorite way to learn new vocabulary?",
        "How do you practice pronunciation?",
        "What language challenges do you face most often?",
        "What's your goal for language learning this week?"
      ],
      'philosophy': [
        "What philosophical question keeps you up at night?",
        "How do you define consciousness?",
        "What's your perspective on free will vs determinism?",
        "How do you find meaning in existence?"
      ],
      'books': [
        "What book changed your perspective on life?",
        "What's your favorite literary genre and why?",
        "Which author has influenced your thinking the most?",
        "What book are you currently reading?"
      ],
      'wellness': [
        "What's your favorite mindfulness practice?",
        "How do you manage stress in daily life?",
        "What brings you the most inner peace?",
        "How do you practice self-care?"
      ],
      'art': [
        "What inspires your creative process?",
        "How do you overcome creative blocks?",
        "What art form speaks to you most deeply?",
        "How has creativity impacted your life?"
      ],
      'science': [
        "What scientific discovery fascinates you most?",
        "How do you think AI will change our future?",
        "What's the most complex scientific concept you understand?",
        "Which field of science excites you most?"
      ]
    };

    return categorySuggestions[category] || categorySuggestions['languages'];
  };

  const aiSuggestions = getAISuggestions(room.category);

  const currentChannelMessages = messages.filter(msg => msg.channel === activeChannel);
  const pinnedChannelMessages = currentChannelMessages.filter(msg => msg.isPinned);
  const isUserModerator = user && roomData.moderators.includes(user.username || '');

  const handleReaction = (messageId: number, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          // Toggle reaction
          const userInReaction = existingReaction.users.includes(user?.username || '');
          if (userInReaction) {
            return {
              ...msg,
              reactions: msg.reactions.map(r => r.emoji === emoji 
                ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== user?.username) }
                : r
              ).filter(r => r.count > 0)
            };
          } else {
            return {
              ...msg,
              reactions: msg.reactions.map(r => r.emoji === emoji 
                ? { ...r, count: r.count + 1, users: [...r.users, user?.username || ''] }
                : r
              )
            };
          }
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, users: [user?.username || ''] }]
          };
        }
      }
      return msg;
    }));
  };

  const handleReplyToMessage = (messageId: number) => {
    setReplyingTo(messageId);
  };

  // Long-press for mobile to open actions sheet
  const startLongPress = (messageId: number) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => setActionSheetMessageId(messageId), 400);
  };
  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePinMessage = (messageId: number) => {
    if (!isUserModerator) return;
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
    
    setPinnedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
    
    // Pin/unpin message - toast removed per user request
  };

  const handleDeleteMessage = (messageId: number) => {
    const msg = messages.find(m => m.id === messageId);
    const isMyMessage = msg?.user.name === (anonymousMode ? 'Anonymous' : (user?.username || 'Guest'));
    
    if (!isUserModerator && !isMyMessage) return;
    
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    // Message deleted - toast removed per user request
  };

  const handleEditMessage = (messageId: number) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    
    setEditingMessageId(messageId);
    setEditingText(msg.content);
  };

  const saveEditedMessage = () => {
    if (!editingText.trim() || !editingMessageId) return;
    
    setMessages(prev => prev.map(msg => 
      msg.id === editingMessageId 
        ? { ...msg, content: editingText, isEdited: true } : msg
    ));
    
    setEditingMessageId(null);
    setEditingText('');
    
    // Message updated - toast removed per user request
  };

  const handleTranslate = (messageId: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const translation = simulateTranslation(msg.content, targetLanguage);
        return {
          ...msg,
          translated: !msg.translated,
          translatedContent: translation
        };
      }
      return msg;
    }));
  };

  const handleGrammarCheck = (messageId: number) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    
    const corrections = simulateGrammarCheck(msg.content);
    
    if (corrections.length > 0) {
      corrections.forEach(correction => {
        addCorrection(
          correction.originalText,
          correction.correctedText,
          correction.explanation,
          correction.rule,
          correction.example,
          correction.severity
        );
      });
      
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, corrected: true, hasErrors: false } : m
      ));
      
      // Grammar check with issues - toast removed per user request
    } else {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, corrected: true, hasErrors: false } : m
      ));
      
      // Grammar check no issues - toast removed per user request
    }
  };

  const renderMessageContent = (msg: { content: string; [key: string]: unknown }) => {
    // Simple message rendering - can be enhanced with grammar highlighting
    return <p className="text-sm break-words">{msg.content}</p>;
  };

  const handleMuteUser = (username: string) => {
    if (!isUserModerator) return;
    
    setMutedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(username)) {
        newSet.delete(username);
      } else {
        newSet.add(username);
      }
      return newSet;
    });
    
    // Mute/unmute user - toast removed per user request
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'moderator': return <Crown size={12} className="text-yellow-500" />;
      case 'bot': return <Bot size={12} className="text-blue-500" />;
      default: return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'moderator': return 'text-yellow-600';
      case 'bot': return 'text-blue-600';
      default: return '';
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Check for grammar if practice mode is enabled
    if (practiceMode && grammarCheckEnabled) {
      const corrections = simulateGrammarCheck(message);
      if (corrections.length > 0) {
        corrections.forEach(correction => {
          addCorrection(
            correction.originalText,
            correction.correctedText,
            correction.explanation,
            correction.rule,
            correction.example,
            correction.severity
          );
        });
        
        // Grammar correction notification - toast removed per user request
      }
    }

    // Update skill progress
    updateSkillProgress('writing', 1);
    updateSkillProgress('speaking', 1);

    const newMessage = {
      id: messages.length + 1,
      user: {
        name: anonymousMode ? 'Anonymous' : (user?.username || 'Guest'),
        avatar: anonymousMode ? '👤' : (user?.avatar || '👤'),
        isAnonymous: anonymousMode,
        role: 'member'
      },
      content: message,
      timestamp: 'now',
      isAI: false,
      channel: activeChannel,
      replyTo: replyingTo,
      replies: [],
      isPinned: false,
      reactions: []
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setReplyingTo(null);

    // Enhanced AI response simulation
    setTimeout(() => {
      const messageLower = message.toLowerCase();
      let aiResponse = '';
      
      // Contextual AI responses based on message content
      if (messageLower.includes('hello') || messageLower.includes('hi')) {
        aiResponse = `Hello! Great to see you practicing ${learningLanguage}. How can I help you today?`;
      } else if (messageLower.includes('grammar') || messageLower.includes('correct')) {
        aiResponse = `Grammar practice is essential! I noticed you're working on ${languageLevel} level. Would you like some grammar tips?`;
      } else if (messageLower.includes('vocabulary') || messageLower.includes('words')) {
        const suggestions = simulateVocabularySuggestion(message);
        aiResponse = `Great vocabulary question! Here are some related words you might find useful: ${suggestions.slice(0, 3).join(', ')}`;
      } else if (messageLower.includes('pronunciation') || messageLower.includes('speak')) {
        aiResponse = `Pronunciation is key! Your speaking confidence is at ${speakingConfidence}%. Keep practicing - you're doing great!`;
      } else if (messageLower.includes('help') || messageLower.includes('difficult')) {
        aiResponse = `Don't worry, learning a language takes time! Your current level is ${languageLevel}, and you're making good progress. What specific area would you like to focus on?`;
      } else if (messageLower.includes('thank')) {
        aiResponse = `You're welcome! Your dedication to learning ${learningLanguage} is impressive. Keep up the great work!`;
      } else if (messageLower.includes('how are you')) {
        aiResponse = `I'm doing well, thank you for asking! I'm here to help you practice ${learningLanguage}. How are you feeling about your progress today?`;
      } else if (messageLower.includes('practice') || messageLower.includes('learn')) {
        aiResponse = `Excellent attitude! Practice makes perfect. Your learning streak is ${insights.strengths.length > 0 ? 'strong' : 'building'}. What would you like to practice today?`;
      } else {
        // Generate contextual response based on learning level
        const responses = {
          a1: [
            "That's a good start! Keep practicing simple sentences.",
            "Great effort! Try to use basic vocabulary you know.",
            "Good job! Remember to practice regularly."
          ],
          b1: [
            "Good point! You're developing intermediate skills well.",
            "Interesting! Try to use more complex sentence structures.",
            "Well said! Your vocabulary is growing nicely."
          ],
          c1: [
            "Excellent insight! You're showing advanced language skills.",
            "Very thoughtful! Your language proficiency is impressive.",
            "Great analysis! You're thinking like a native speaker."
          ]
        };
        
        aiResponse = responses[languageLevel]?.[Math.floor(Math.random() * responses[languageLevel].length)] || 
                   "That's interesting! Keep up the good work with your language learning.";
      }

      const aiMessage = {
        id: messages.length + 2,
        user: { name: 'AI Assistant', avatar: '🤖', isAnonymous: false, role: 'bot' },
        content: aiResponse,
        timestamp: 'just now',
        isAI: true,
        channel: activeChannel,
        replyTo: null,
        replies: [],
        isPinned: false,
        reactions: []
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Occasionally suggest vocabulary or conversation starters
      if (Math.random() > 0.8) {
        setTimeout(() => {
          const topics = ['hobbies', 'food', 'travel', 'work', 'family'];
          const randomTopic = topics[Math.floor(Math.random() * topics.length)];
          const starters = simulateConversationStarter(randomTopic, languageLevel);
          const suggestion = starters[Math.floor(Math.random() * starters.length)];
          
          const suggestionMessage = {
            id: messages.length + 3,
            user: { name: 'AI Assistant', avatar: '🤖', isAnonymous: false },
            content: `💡 Conversation starter: "${suggestion}"`,
            timestamp: 'just now',
            isAI: true
          };
          
          setMessages(prev => [...prev, suggestionMessage]);
        }, 1000);
      }
    }, 1500 + Math.random() * 1000); // Random delay for more realistic feel
  };

    const handleVoiceRecord = async () => {
    if (!isRecording) {
      try {
        // Use mobile-optimized audio constraints
        const constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
            channelCount: 1
          }
        };
        
        // iOS Safari specific optimizations
        if (/iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())) {
          constraints.audio.sampleRate = 48000;
          constraints.audio.echoCancellation = false;
          constraints.audio.noiseSuppression = false;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const recorder = new MediaRecorder(stream, { 
          mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
        });
        const chunks: Blob[] = [];
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
            setAudioChunks([...chunks]);
          }
        };
        
        recorder.onstop = () => {
          if (chunks.length > 0) {
            const audioBlob = new Blob(chunks, { 
              type: recorder.mimeType || 'audio/webm' 
            });
            
            // Validate the blob
            if (audioBlob.size > 100) {
              console.log('Recording completed successfully, blob size:', audioBlob.size);
              setRecordedAudioBlob(audioBlob);
            } else {
              console.warn('Recording blob seems too small, size:', audioBlob.size);
              setRecordedAudioBlob(audioBlob);
            }
          } else {
            console.error('No audio chunks collected during recording');
          }
          
          stream.getTracks().forEach(track => track.stop());
        };
        
        setMediaRecorder(recorder);
        setAudioChunks([]);
        recorder.start(100); // Record in 100ms chunks for better pause/resume
        setIsRecording(true);
        setRecordingTime(0);
        
        // Generate static waveform heights
        const heights = Array.from({ length: 20 }, () => Math.random() * 60 + 20);
        setWaveformHeights(heights);
      
        // Start timer
        const timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setRecordingTimerRef(timer);
        
        // Start animation loop
        const animate = () => {
          setAnimationFrame(prev => prev + 1);
          if (isRecording) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        // Fallback to simulation
        setIsRecording(true);
        setRecordingTime(0);
        const timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        setRecordingTimerRef(timer);
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      // Request data before stopping to ensure all chunks are available
      try {
        mediaRecorder.requestData();
        mediaRecorder.stop();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
    setIsRecording(false);
    if (recordingTimerRef) {
      clearInterval(recordingTimerRef);
      setRecordingTimerRef(null);
    }
    
    // Stop animation loop
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      setAnimationFrame(0);
    }
  };

  const handleSendRecording = () => {
    // Stop any currently playing audio
    if (playingVoiceId === -1 && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingVoiceId(null);
      setCurrentAudioTime(0);
      if (audioUpdateTimerRef.current) {
        clearInterval(audioUpdateTimerRef.current);
        audioUpdateTimerRef.current = null;
      }
    }
    
    if (recordedAudioBlob || recordingTime > 0) {
      // Validate and fix the audio blob if needed
      let finalAudioBlob = recordedAudioBlob;
      
      if (recordedAudioBlob && recordedAudioBlob.size < 100) {
        console.warn('Audio blob too small, attempting to fix...');
        // Try to create a valid blob from the collected chunks
        if (audioChunks.length > 0) {
          const mimeType = mediaRecorder?.mimeType || 'audio/webm';
          finalAudioBlob = new Blob(audioChunks, { type: mimeType });
          console.log('Created new blob from chunks, size:', finalAudioBlob.size);
        }
      }
      
      const newMessage = {
        id: messages.length + 1,
        sender: 'me' as const,
        content: `🎵 Voice message (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})`,
        timestamp: 'now',
        translated: false,
        corrected: false,
        originalContent: '',
        translatedContent: '',
        hasErrors: false,
        corrections: [],
        type: 'voice' as const,
        reactions: [],
        isEdited: false,
        isDeleted: false,
        replyTo: replyingTo,
        deliveryStatus: 'sent' as const,
        isEncrypted: true,
              voiceData: {
          duration: recordingTime,
          waveform: Array.from({ length: 20 }, () => Math.random()),
          audioBlob: finalAudioBlob
        }
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
      
      // Reset recording state
      setRecordedAudioBlob(null);
      setRecordingTime(0);
      setIsRecording(false);
      setPlayingVoiceId(null);
      setCurrentAudioTime(0);
      
      // Clear timer if running
      if (recordingTimerRef) {
        clearInterval(recordingTimerRef);
        setRecordingTimerRef(null);
      }
      
      // Stop media recorder if active
      if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
        mediaRecorder.stop();
      }
    }
  };

  const handleVoiceRecordingComplete = (audioBlob: Blob, duration: number) => {
    const newMessage = {
      id: messages.length + 1,
      sender: 'me' as const,
      content: `🎵 Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`,
      timestamp: 'now',
      translated: false,
      corrected: false,
      originalContent: '',
      translatedContent: '',
      hasErrors: false,
      corrections: [],
      type: 'voice' as const,
      reactions: [],
      isEdited: false,
      isDeleted: false,
      replyTo: replyingTo,
      deliveryStatus: 'sent' as const,
      isEncrypted: true,
      voiceData: {
        duration: duration,
        waveform: Array.from({ length: 20 }, () => Math.random()),
        audioBlob: audioBlob
      }
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
    setShowAttachments(false);
  };

  // Helper function to get actual audio duration from blob
  const getAudioDuration = (blob: Blob): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        // Validate duration before resolving
        if (duration && isFinite(duration) && duration > 0) {
          resolve(duration);
        } else {
          // If duration is invalid, try to estimate from blob size
          const estimatedDuration = Math.max(1, Math.ceil(blob.size / 10000)); // Rough estimate
          resolve(estimatedDuration);
        }
      };
      audio.onerror = () => {
        // If audio fails to load, estimate from blob size
        const estimatedDuration = Math.max(1, Math.ceil(blob.size / 10000)); // Rough estimate
        resolve(estimatedDuration);
      };
      audio.src = URL.createObjectURL(blob);
    });
  };

  const handleVoicePlay = async (messageId: number, duration: number) => {
    if (playingVoiceId === messageId) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingVoiceId(null);
      setCurrentAudioTime(0);
      if (audioUpdateTimerRef.current) {
        clearInterval(audioUpdateTimerRef.current);
        audioUpdateTimerRef.current = null;
      }
    } else {
      // Start playing
      setPlayingVoiceId(messageId);
      setCurrentAudioTime(0);
      
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        const audio = createMobileAudio();
        
        audio.onended = () => {
          setPlayingVoiceId(null);
          setCurrentAudioTime(0);
          if (audioUpdateTimerRef.current) {
            clearInterval(audioUpdateTimerRef.current);
            audioUpdateTimerRef.current = null;
          }
        };
        
        audio.ontimeupdate = () => {
          if (audioRef.current) {
            setCurrentAudioTime(audioRef.current.currentTime);
          }
        };
        
        audio.onerror = (error) => {
          console.error('Audio error:', error);
          setPlayingVoiceId(null);
          setCurrentAudioTime(0);
        };
        
        audioRef.current = audio;
      }
      
      // If it's the current recording, play the recorded blob
      if (messageId === -1 && recordedAudioBlob && audioRef.current) {
        try {
          const audioUrl = URL.createObjectURL(recordedAudioBlob);
          audioRef.current.src = audioUrl;
          
          // Get the actual duration of the audio blob (including resumed parts)
          const actualDuration = await getAudioDuration(recordedAudioBlob);
          setAudioDuration(actualDuration);
          
          // Mobile-friendly audio playback
          const success = await safePlayAudio(audioRef.current);
          if (success) {
            // Update progress in real time - use actual audio duration
            audioUpdateTimerRef.current = setInterval(() => {
              if (audioRef.current && !audioRef.current.paused) {
                const newTime = audioRef.current.currentTime;
                // Update visual progress to match actual audio position
                setCurrentAudioTime(newTime);
                
                // Stop playback when reaching the end
                if (newTime >= actualDuration) {
                  audioRef.current.pause();
                  setPlayingVoiceId(null);
                  setCurrentAudioTime(0);
                  if (audioUpdateTimerRef.current) {
                    clearInterval(audioUpdateTimerRef.current);
                    audioUpdateTimerRef.current = null;
                  }
                }
              }
            }, 100);
          } else {
            setPlayingVoiceId(null);
            setCurrentAudioTime(0);
          }
          
          // Store the actual audio duration for visual progress calculations
          setAudioDuration(actualDuration);
        } catch (error) {
          console.error('Error setting up audio playback:', error);
          setPlayingVoiceId(null);
          setCurrentAudioTime(0);
        }
      } else {
        // For sent messages, check if they have audio blob
        const message = messages.find(msg => msg.id === messageId);
        if (message && message.voiceData?.audioBlob && audioRef.current) {
          try {
            // Validate the audio blob
            if (message.voiceData.audioBlob.size < 100) {
              console.warn('Audio blob too small, size:', message.voiceData.audioBlob.size);
              setPlayingVoiceId(null);
              setCurrentAudioTime(0);
              return;
            }
            
            const audioUrl = URL.createObjectURL(message.voiceData.audioBlob);
            audioRef.current.src = audioUrl;
            
            // Ensure audio is properly loaded before playing
            await audioRef.current.load();
            
            // Mobile-friendly audio playback
            const success = await safePlayAudio(audioRef.current);
            if (success) {
              console.log('Voice message playback started successfully');
              // Update progress in real time
              audioUpdateTimerRef.current = setInterval(() => {
                if (audioRef.current && !audioRef.current.paused) {
                  setCurrentAudioTime(audioRef.current.currentTime);
                }
              }, 100);
            } else {
              console.error('Failed to play voice message');
              setPlayingVoiceId(null);
              setCurrentAudioTime(0);
            }
          } catch (error) {
            console.error('Error setting up audio playback:', error);
            setPlayingVoiceId(null);
            setCurrentAudioTime(0);
          }
        } else {
          // For messages without audio blob, simulate playback for demo
          audioUpdateTimerRef.current = setInterval(() => {
            setCurrentAudioTime(prev => {
              if (prev >= duration) {
                setPlayingVoiceId(null);
                if (audioUpdateTimerRef.current) {
                  clearInterval(audioUpdateTimerRef.current);
                  audioUpdateTimerRef.current = null;
                }
                return 0;
              }
              return prev + 0.1;
            });
          }, 100);
        }
      }
    }
  };

  const handleVoiceSeek = (messageId: number, duration: number, seekTime: number) => {
    if (playingVoiceId === messageId) {
      setCurrentAudioTime(seekTime);
      // In real implementation, this would seek the actual audio
      if (audioRef.current) {
        audioRef.current.currentTime = seekTime;
      }
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      // Request data before stopping to ensure all chunks are available
      mediaRecorder.requestData();
      // Stop the current recording session completely
      mediaRecorder.stop();
    }
    setIsRecording(false);
    
    // Stop recording timer completely
    if (recordingTimerRef) {
      clearInterval(recordingTimerRef);
      setRecordingTimerRef(null);
    }
    
    // Stop animation loop completely
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      setAnimationFrame(0);
    }
    
    // Reset playback position to 0
    setCurrentAudioTime(0);
    
    // Create current audio blob for preview from collected chunks
    if (audioChunks.length > 0) {
      const currentBlob = new Blob(audioChunks, { type: 'audio/webm' });
      setRecordedAudioBlob(currentBlob);
    }
    
    // Clear the media recorder - we'll create a new one on resume
    setMediaRecorder(null);
  };

  const handleResumeRecording = async () => {
    // Stop any currently playing audio
    if (playingVoiceId === -1 && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingVoiceId(null);
      setCurrentAudioTime(0);
      if (audioUpdateTimerRef.current) {
        clearInterval(audioUpdateTimerRef.current);
        audioUpdateTimerRef.current = null;
      }
    }
    
    // Always start a new recording session
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => {
            const newChunks = [...prev, event.data];
            // Update blob with all chunks
            const audioBlob = new Blob(newChunks, { type: 'audio/webm' });
            setRecordedAudioBlob(audioBlob);
            return newChunks;
          });
        }
      };
      
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start(100);
    } catch (error) {
      console.error('Error resuming recording:', error);
    }
    
    setIsRecording(true);
    // Resume timer - continue from where we left off
    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    setRecordingTimerRef(timer);
    
    // Restart animation loop
    const animate = () => {
      if (isRecording) {
        setAnimationFrame(prev => prev + 1);
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  const pauseAllVoiceMessages = () => {
    // Pause any currently playing voice message
    if (playingVoiceId !== null && audioRef.current) {
      audioRef.current.pause();
      setPlayingVoiceId(null);
      setCurrentAudioTime(0);
      if (audioUpdateTimerRef.current) {
        clearInterval(audioUpdateTimerRef.current);
        audioUpdateTimerRef.current = null;
      }
    }
  };

  const handleDeleteRecording = () => {
    // Stop any currently playing audio
    if (playingVoiceId === -1 && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingVoiceId(null);
      setCurrentAudioTime(0);
      if (audioUpdateTimerRef.current) {
        clearInterval(audioUpdateTimerRef.current);
        audioUpdateTimerRef.current = null;
      }
    }
    
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
    setPlayingVoiceId(null);
    setCurrentAudioTime(0);
    setRecordedAudioBlob(null);
    
    // Stop recording timer
    if (recordingTimerRef) {
      clearInterval(recordingTimerRef);
      setRecordingTimerRef(null);
    }
    
    // Stop animation loop completely
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      setAnimationFrame(0);
    }
    
    // Clear audio chunks
    setAudioChunks([]);
  };

  const handleImageUpload = () => {
    // Simulate image upload
    const newMessage = {
      id: messages.length + 1,
      user: {
        name: anonymousMode ? 'Anonymous' : (user?.username || 'Guest'),
        avatar: anonymousMode ? '👤' : (user?.avatar || '👤'),
        isAnonymous: anonymousMode,
        role: 'member'
      },
      content: '📷 Photo',
      timestamp: 'now',
      isAI: false,
      channel: activeChannel,
      replyTo: replyingTo,
      replies: [],
      isPinned: false,
      reactions: [],
      type: 'image',
      imageUrl: 'https://picsum.photos/300/200?random=' + Math.random()
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
    setShowAttachments(false);
    
    // Photo sent - toast removed per user request
  };

  const handleFileUpload = () => {
    // Simulate file upload
    const newMessage = {
      id: messages.length + 1,
      user: {
        name: anonymousMode ? 'Anonymous' : (user?.username || 'Guest'),
        avatar: anonymousMode ? '👤' : (user?.avatar || '👤'),
        isAnonymous: anonymousMode,
        role: 'member'
      },
      content: '📄 Document.pdf',
      timestamp: 'now',
      isAI: false,
      channel: activeChannel,
      replyTo: replyingTo,
      replies: [],
      isPinned: false,
      reactions: [],
      type: 'file',
      fileData: {
        name: 'Language_Practice_Notes.pdf',
        size: '2.4 MB',
        type: 'application/pdf'
      }
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
    setShowAttachments(false);
    
    // File sent - toast removed per user request
  };

  const handleBackNavigation = () => {
    if (currentSession) {
      endLearningSession();
    }
    
    // Smart navigation: check where user came from
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    
    if (from === 'chat-inbox' || from === 'messages') {
      navigate('/chat-inbox');
    } else if (from === 'chat-rooms') {
      // When going back to chat-rooms, check if there was an original source
      // This handles the case: Community → Chat Rooms → Join Room → Back
      navigate('/chat-rooms?from=community');
    } else if (from === 'community') {
      navigate('/community');
    } else {
      // Default fallback: try to go back in history, or go to community
      navigate(-1);
    }
  };

  const handleLeaveRoom = () => {
    if (currentSession) {
      endLearningSession();
    }
    
    // Remove from joined rooms
    if (id) {
      leaveRoom(id);
    }
    
    // After leaving, navigate back
    handleBackNavigation();
  };

  const sendSuggestedMessage = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleSuggestionFromAI = (suggestion: string) => {
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      user: { name: 'AI Assistant', avatar: '🤖', isAnonymous: false },
      content: suggestion,
      timestamp: 'just now',
      isAI: true
    }]);
  };

  const insights = getLearningInsights();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
              <div className="fixed top-0 left-0 right-0 z-40 chat-room-header border-b border-border shadow-soft safe-top">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto w-full min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackNavigation}
              className="flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold truncate">{roomData.title}</h1>
            </div>
          </div>
          
          {/* Room Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleLeaveRoom}
                className="text-destructive"
              >
                <ArrowLeft size={14} className="mr-2" />
                Leave Room
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full content-safe-top ${showAIPanel ? 'pb-48' : 'pb-32'}`}>
        <div className="space-y-4">
          {messages.filter(msg => msg.channel === activeChannel).map((msg) => {
            const replyToMessage = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
            const isMyMessage = msg.user.name === (anonymousMode ? 'Anonymous' : (user?.username || 'Guest'));
            
            return (
              <div
                key={msg.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  onTouchStart={() => startLongPress(msg.id)}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  className={`max-w-[80%] relative group transition-colors ${
                  isMyMessage 
                    ? 'bg-primary text-primary-foreground hover:!bg-primary hover:brightness-95' 
                    : 'bg-card hover:bg-muted/60 dark:hover:bg-white/10'
                } ${msg.user?.isAnonymous ? 'opacity-90' : ''}`}>
                  <CardContent className="p-3">
                    {/* User info at top for public chat (except for own messages) */}
                    {!isMyMessage && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm">{msg.user.avatar}</div>
                        <span className={`font-medium text-sm ${msg.user?.isAnonymous ? 'text-muted-foreground' : ''}`}>
                          {msg.user.name}
                        </span>
                        {msg.isAI && <Badge variant="secondary" className="text-xs">AI</Badge>}
                      </div>
                    )}

                    {/* Reply indicator */}
                    {replyToMessage && (
                      <div className="text-xs p-2 mb-2 bg-black/10 rounded border-l-2 border-primary/50">
                        <div className="flex items-center gap-1 mb-1">
                          <Reply size={10} />
                          <span className="font-medium">
                            {isMyMessage ? 'You' : replyToMessage.user.name}
                          </span>
                        </div>
                        <div className="truncate opacity-80">
                          {replyToMessage.content}
                        </div>
                      </div>
                    )}

                    {/* Message content */}
                    <div className="text-sm mb-2">
                      {editingMessageId === msg.id ? (
                        <div className="space-y-2">
                          <Input
                            id="editMessage"
                            name="editMessage"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="text-sm"
                            autoComplete="off"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveEditedMessage}>Save</Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              setEditingMessageId(null);
                              setEditingText('');
                            }}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {msg.type === 'image' && (
                            <div className="mb-2">
                              <img
                                src={msg.imageUrl}
                                alt="Shared image"
                                className="rounded-lg max-w-full h-auto"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          )}
                          
                          {/* Voice message content */}
                          {msg.type === 'voice' && msg.voiceData && (
                            <div className="flex items-center gap-2 p-2 bg-black/10 rounded">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 flex-shrink-0"
                                onClick={() => handleVoicePlay(msg.id, msg.voiceData!.duration)}
                              >
                                {playingVoiceId === msg.id ? <Pause size={14} /> : <Play size={14} />}
                              </Button>
                              
                              {/* Clickable waveform visualization - extends all the way to the right */}
                              <div className="flex items-center gap-1 flex-1 cursor-pointer">
                                {msg.voiceData.waveform.map((height, i) => (
                                  <div
                                    key={i}
                                    className={`w-1 rounded transition-colors duration-200 ${
                                      playingVoiceId === msg.id && i < (currentAudioTime / msg.voiceData!.duration) * msg.voiceData.waveform.length
                                        ? 'bg-primary' 
                                        : 'bg-current'
                                    }`}
                                    style={{ height: `${Math.max(height * 20, 4)}px` }}
                                    onClick={() => {
                                      if (playingVoiceId === msg.id) {
                                        const seekTime = (i / msg.voiceData.waveform.length) * msg.voiceData!.duration;
                                        handleVoiceSeek(msg.id, msg.voiceData!.duration, seekTime);
                                      }
                                    }}
                                    title={playingVoiceId === msg.id ? `Click to seek to ${Math.floor((i / msg.voiceData.waveform.length) * msg.voiceData!.duration)}s` : ''}
                                  />
                                ))}
                              </div>
                              
                              <span className="text-xs min-w-[30px] flex-shrink-0">
                                {playingVoiceId === msg.id 
                                  ? `${Math.floor(currentAudioTime)}:${(currentAudioTime % 60).toFixed(1).padStart(4, '0')}`
                                  : `${Math.floor(msg.voiceData.duration / 60)}:${(msg.voiceData.duration % 60).toString().padStart(2, '0')}`
                                }
                              </span>
                            </div>
                          )}

                          {msg.type === 'file' && msg.fileData && (
                            <div className="flex items-center gap-2 p-2 bg-black/10 rounded">
                              <File size={16} />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{msg.fileData.name}</div>
                                <div className="text-xs opacity-70">{msg.fileData.size}</div>
                              </div>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Download size={12} />
                              </Button>
                            </div>
                          )}

                          {(msg.type === 'text' || !msg.type) && (
                            <div className="break-words">
                              {renderMessageContent(msg)}
                              {msg.isEdited && (
                                <span className="text-xs opacity-50 ml-2">(edited)</span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {msg.reactions.map((reaction, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 bg-black/10 rounded-full text-xs"
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.userName || reaction.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(msg.translated || (autoTranslateEnabled && !isMyMessage)) && (
                      <div className="text-xs opacity-80 mt-2 p-2 bg-primary/10 rounded break-words">
                        <Languages size={12} className="inline mr-1" />
                        Translation: {msg.translatedContent || `[${targetLanguage?.toUpperCase() || 'EN'}] ${msg.content}`}
                      </div>
                    )}

                    {practiceMode && msg.hasErrors && (
                      <div className="text-xs mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <BookOpen size={12} className="inline mr-1 text-yellow-600" />
                        <span className="text-yellow-800">Click underlined words for grammar help!</span>
                      </div>
                    )}
                    
                    {/* Meta row: time + delivery; separated from actions to avoid overflow */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs opacity-70">{msg.timestamp}</span>
                        {msg.isEncrypted && (
                          <Lock size={10} className="opacity-50" />
                        )}
                        {isMyMessage && (
                          <div className="flex items-center">
                            {msg.deliveryStatus === 'sent' && <CheckCircle size={10} className="opacity-50" />}
                            {msg.deliveryStatus === 'delivered' && <CheckCircle size={10} className="text-blue-500" />}
                            {msg.deliveryStatus === 'read' && <CheckCheck size={10} className="text-blue-500" />}
                          </div>
                        )}
                    </div>

                    {/* Desktop actions (hover to reveal) */}
                    <div className="mt-1 hidden md:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button variant="ghost" size="sm" className="h-6 px-1 text-xs hover:bg-primary/10" onClick={() => handleReaction(msg.id, '❤️')}>❤️</Button>
                      <Button variant="ghost" size="sm" className="h-6 px-1 text-xs hover:bg-primary/10" onClick={() => handleReaction(msg.id, '👍')}>👍</Button>
                      <Button variant="ghost" size="sm" className="h-6 px-1 text-xs hover:bg-primary/10" onClick={() => handleReaction(msg.id, '😊')}>😊</Button>
                      <Button variant="ghost" size="sm" className="h-6 px-1 hover:bg-primary/10" onClick={() => handleReplyToMessage(msg.id)}><Reply size={10} /></Button>
                      {isMyMessage && !msg.isDeleted && (
                        <>
                          <Button variant="ghost" size="sm" className="h-6 px-1 hover:bg-primary/10" onClick={() => handleEditMessage(msg.id)}><Edit3 size={10} /></Button>
                          <Button variant="ghost" size="sm" className="h-6 px-1 text-red-500 hover:bg-red-50" onClick={() => handleDeleteMessage(msg.id)}><Trash2 size={10} /></Button>
                        </>
                      )}
                      {isMyMessage && practiceMode && (
                        <AITooltip title="Grammar Check" description="Check this message for grammar and spelling errors">
                          <Button variant="ghost" size="sm" className="h-6 px-1 hover:bg-primary/10" onClick={() => handleGrammarCheck(msg.id)}>
                            {msg.corrected ? <CheckCircle size={10} className="text-green-500" /> : <BookOpen size={10} />}
                          </Button>
                        </AITooltip>
                      )}
                      {!autoTranslateEnabled && (
                        <AITooltip title="Translate Message" description="See this message in your learning language">
                          <Button variant="ghost" size="sm" className="h-6 px-1 hover:bg-primary/10" onClick={() => handleTranslate(msg.id)}>
                            <Languages size={10} className={msg.translated ? 'text-primary' : ''} />
                          </Button>
                        </AITooltip>
                      )}
                      {!isMyMessage && (
                        <AITooltip title="Ask AI for Help" description="Get AI suggestions for how to respond to this message">
                          <Button variant="ghost" size="sm" className="h-6 px-1 hover:bg-primary/10" onClick={() => {
                  pauseAllVoiceMessages();
                  setShowAIModal(true);
                }}>
                            <HelpCircle size={10} />
                          </Button>
                        </AITooltip>
                      )}
                      {isUserModerator && (
                        <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => handlePinMessage(msg.id)}>
                          <Pin size={10} />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {/* Typing indicators for multiple users */}
          <MultiTypingIndicator
            typingUsers={Array.from(typingUsers).map(typingUser => ({
              name: typingUser,
              avatar: typingUser === 'Luna' ? '🌙' : typingUser === 'Alex' ? '📚' : typingUser === 'Sage' ? '🌱' : typingUser === 'Maya' ? '🎨' : '👤'
            }))}
            isVisible={typingUsers.size > 0}
          />

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showAIPanel && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4 max-w-md mx-auto w-full z-20">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Bot size={16} className="text-primary" />
            AI Conversation Help
          </h4>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full text-left justify-start h-auto p-2"
                onClick={() => sendSuggestedMessage(suggestion)}
              >
                <MessageCircle size={12} className="mr-2 text-primary" />
                <span className="text-sm leading-tight">{suggestion}</span>
              </Button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                pauseAllVoiceMessages();
                setShowAIModal(true);
              }}
              className="w-full text-xs"
            >
              <Lightbulb size={12} className="mr-1" />
              More AI Help & Language Practice
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
              <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 max-w-md mx-auto w-full">
        {anonymousMode && (
          <div className="mb-2 text-xs text-muted-foreground flex items-center gap-1">
            <EyeOff size={12} />
            Anonymous mode active
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-2">
          <AITooltip 
            title="AI Assistant"
            description="Get conversation help, grammar checks, and language practice support"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                pauseAllVoiceMessages();
                setShowAIModal(true);
              }}
            >
              <Bot size={14} />
              <span className="ml-1 text-xs hidden sm:inline">AI Help</span>
            </Button>
          </AITooltip>
          
          <AITooltip 
            title="Quick Translate"
            description="Translate your message before sending"
          >
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (message.trim()) {
                  const translation = simulateTranslation(message, learningLanguage);
                  // Translation - toast removed per user request
                }
              }}
            >
              <Languages size={14} />
              <span className="ml-1 text-xs hidden sm:inline">Translate</span>
            </Button>
          </AITooltip>

          <AITooltip 
            title="Language Tools"
            description="Access language practice, pronunciation challenges, and vocabulary tracking"
          >
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                pauseAllVoiceMessages();
                setShowLanguagePanel(true);
              }}
              className={showLanguagePanel ? 'text-primary' : ''}
            >
              <BookOpen size={14} />
              <span className="ml-1 text-xs hidden sm:inline">Language Tools</span>
            </Button>
          </AITooltip>

          {practiceMode && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              <Zap size={10} className="mr-1" />
              <span className="hidden sm:inline">Practice Active</span>
            </Badge>
          )}
        </div>
        
        {/* Attachment panel */}
        {showAttachments && (
          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  pauseAllVoiceMessages();
                  handleImageUpload();
                }}
                className="flex-col h-auto p-3 gap-1"
              >
                <Image size={20} />
                <span className="text-xs">Photo</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  pauseAllVoiceMessages();
                  // Simulate camera
                  handleImageUpload();
                }}
                className="flex-col h-auto p-3 gap-1"
              >
                <Camera size={20} />
                <span className="text-xs">Camera</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  pauseAllVoiceMessages();
                  handleFileUpload();
                }}
                className="flex-col h-auto p-3 gap-1"
              >
                <File size={20} />
                <span className="text-xs">File</span>
              </Button>
            </div>
          </div>
        )}

                {/* Voice recording interface - always red */}
        {(isRecording || recordingTime > 0) && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-red-600">
                <div className={`w-3 h-3 bg-red-600 rounded-full ${isRecording ? 'animate-pulse' : ''}`}></div>
                <span className="text-sm font-medium">
                  {isRecording ? 'Recording' : (playingVoiceId === -1 ? 'Recording Playing' : 'Recording Paused')} {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
                {!isRecording && recordingTime > 0 && (
                  <span className="text-xs text-muted-foreground min-w-[40px]">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>
              {isRecording && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePauseRecording}
                    className="h-8 px-3 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <Pause size={14} />
                    <span className="ml-1 text-xs">Pause</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteRecording}
                    className="h-8 px-3 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <X size={14} />
                    <span className="ml-1 text-xs">Delete</span>
                  </Button>
                </div>
              )}
            </div>
            
            {/* Interactive waveform visualization with button on the left */}
            <div className="space-y-3 mb-3">
              <div className="flex items-center gap-3">
                {!isRecording && recordingTime > 0 && (
                  <Button
                    onClick={() => handleVoicePlay(-1, recordingTime)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                  >
                    {playingVoiceId === -1 ? <Pause size={14} /> : <Play size={14} />}
                    <span className="ml-1 text-xs">
                      {playingVoiceId === -1 ? 'Pause' : 'Play'}
                    </span>
                  </Button>
                )}
                
                <div className="flex items-center h-12 flex-1">
                  {Array.from({ length: 20 }, (_, i) => {
                    const height = waveformHeights[i] || 40;
                    const isActive = isRecording || (playingVoiceId === -1 && i < (currentAudioTime / recordingTime) * 20);
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded cursor-pointer transition-colors duration-200 ${
                          isActive ? 'bg-red-500' : 'bg-red-300'
                        }`}
                        style={{ 
                          height: isRecording ? `${height + Math.sin((animationFrame * 0.1) + i) * 15}%` : `${height}%`,
                          transition: 'height 0.05s ease-out'
                        }}
                        onClick={() => {
                          if (!isRecording && recordingTime > 0) {
                            const seekTime = (i / 20) * recordingTime;
                            handleVoiceSeek(-1, recordingTime, seekTime);
                          }
                        }}
                        title={!isRecording ? `Click to seek to ${Math.floor((i / 20) * recordingTime)}s` : ''}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            {!isRecording && recordingTime > 0 && (
              <div className="flex gap-2">
                <Button
                  onClick={handleResumeRecording}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <Play size={14} />
                  <span className="ml-1 text-xs">Resume</span>
                </Button>
                
                <Button
                  onClick={handleSendRecording}
                  variant="default"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Send size={14} />
                  <span className="ml-1 text-xs">Send</span>
                </Button>
                
                <Button
                  onClick={handleDeleteRecording}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <X size={14} />
                  <span className="ml-1 text-xs">Delete</span>
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              pauseAllVoiceMessages();
              setShowAttachments(!showAttachments);
            }}
            className={`p-2 ${showAttachments ? 'text-primary' : ''}`}
          >
            <Paperclip size={16} />
          </Button>
          
          <Input
            id="messageInput"
            name="messageInput"
            placeholder="Type a thoughtful message..."
            value={message}
            onChange={(e) => {
              const newValue = e.target.value;
              setMessage(newValue);
              
              // Show typing indicator when user starts typing (but don't show for current user)
              if (newValue.length > 0 && !isTyping) {
                setIsTyping(true);
                // Add current user to typing users (but this won't be displayed)
                setTypingUsers(prev => new Set(prev).add(user?.username || 'Guest'));
              }
              
              // Clear existing timeout and set new one
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              
              // Hide typing indicator after 1 second of no typing
              typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                // Remove current user from typing users
                setTypingUsers(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(user?.username || 'Guest');
                  return newSet;
                });
              }, 1000);
              
              // Simulate other users typing (realistic behavior)
              if (newValue.length > 0 && Math.random() > 0.7) {
                const mockUsers = ['Luna', 'Alex', 'Sage', 'Maya'];
                const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
                
                setTimeout(() => {
                  setTypingUsers(prev => new Set(prev).add(randomUser));
                  
                  // Hide typing after random duration
                  setTimeout(() => {
                    setTypingUsers(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(randomUser);
                      return newSet;
                    });
                  }, Math.random() * 3000 + 2000);
                }, Math.random() * 2000 + 1000);
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            autoComplete="off"
            className="flex-1"
          />
          
          {message.trim() ? (
            <Button
              onClick={handleSendMessage}
              variant="cozy"
              className="px-3"
            >
              <Send size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleVoiceRecord}
              variant="ghost"
              className={`px-3 ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
            >
              <Mic size={16} />
            </Button>
        )}
      </div>

      {/* Language Practice Panel */}
      {showLanguagePanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full max-h-[80vh] overflow-y-auto">
            <LanguagePracticePanel 
              isOpen={showLanguagePanel} 
              onClose={() => setShowLanguagePanel(false)} 
            />
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AIAssistantModal 
        isOpen={showAIModal} 
        onClose={() => setShowAIModal(false)} 
      />

      {/* Mobile actions sheet (long-press) */}
      <Sheet open={actionSheetMessageId !== null} onOpenChange={(open) => !open && setActionSheetMessageId(null)}>
        <SheetContent side="bottom" className="max-w-md mx-auto" aria-describedby="message-actions-description">
          <SheetHeader>
            <SheetTitle>Message actions</SheetTitle>
            <SheetDescription id="message-actions-description">
              Choose an action to perform on this message
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-4 gap-3">
            <Button variant="outline" onClick={() => { if (actionSheetMessageId) handleReaction(actionSheetMessageId, '❤️'); setActionSheetMessageId(null); }} className="flex-col h-auto py-3">❤️<span className="text-xs mt-1">Love</span></Button>
            <Button variant="outline" onClick={() => { if (actionSheetMessageId) handleReaction(actionSheetMessageId, '👍'); setActionSheetMessageId(null); }} className="flex-col h-auto py-3">👍<span className="text-xs mt-1">Like</span></Button>
            <Button variant="outline" onClick={() => { if (actionSheetMessageId) handleReaction(actionSheetMessageId, '😊'); setActionSheetMessageId(null); }} className="flex-col h-auto py-3">😊<span className="text-xs mt-1">Smile</span></Button>
            <Button variant="outline" onClick={() => { if (actionSheetMessageId) handleReplyToMessage(actionSheetMessageId); setActionSheetMessageId(null); }} className="flex-col h-auto py-3"><Reply size={16} /><span className="text-xs mt-1">Reply</span></Button>
            <Button variant="outline" onClick={() => { if (actionSheetMessageId) handleTranslate(actionSheetMessageId); setActionSheetMessageId(null); }} className="flex-col h-auto py-3"><Languages size={16} /><span className="text-xs mt-1">Translate</span></Button>
            <Button variant="outline" onClick={() => { if (actionSheetMessageId) handleGrammarCheck(actionSheetMessageId); setActionSheetMessageId(null); }} className="flex-col h-auto py-3"><BookOpen size={16} /><span className="text-xs mt-1">Grammar</span></Button>
            {/** Edit/Delete available for own messages; handlers will no-op otherwise */}
            <Button variant="outline" onClick={() => { if (actionSheetMessageId) handleEditMessage(actionSheetMessageId); setActionSheetMessageId(null); }} className="flex-col h-auto py-3"><Edit3 size={16} /><span className="text-xs mt-1">Edit</span></Button>
            <Button variant="destructive" onClick={() => { if (actionSheetMessageId) handleDeleteMessage(actionSheetMessageId); setActionSheetMessageId(null); }} className="flex-col h-auto py-3"><Trash2 size={16} /><span className="text-xs mt-1">Delete</span></Button>
          </div>
        </SheetContent>
      </Sheet>
      </div>
    </div>
  );
};

export default ChatRoom;

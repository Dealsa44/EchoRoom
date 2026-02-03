import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Languages, CheckCircle, Bot, UserX, Flag, BookOpen, Zap, Target, HelpCircle, Heart, Smile, ThumbsUp, Edit3, Trash2, Reply, Image, Mic, File, Camera, Paperclip, CheckCheck, Volume2, Download, Play, Pause, Lock, Square, X, Shield, Moon, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/hooks/useApp';
import { useSocket } from '@/contexts/SocketContext';
import { conversationApi, type DirectMessageItem } from '@/services/api';
import { ChatMessage } from '@/types';
import AIAssistantModal from '@/components/modals/AIAssistantModal';
import LanguageCorrectionTooltip from '@/components/language/LanguageCorrectionTooltip';
import LanguagePracticePanel from '@/components/language/LanguagePracticePanel';
import AITooltip from '@/components/ai/AITooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import CallButtons from '@/components/calls/CallButtons';
import CameraScreen from '@/components/calls/CameraScreen';
import PhotoGallery from '@/components/ui/PhotoGallery';

// Display message shape (id from API is string; replyTo kept as string | null for consistency)
type DisplayMessage = Omit<ChatMessage, 'id' | 'replyTo'> & { id: string; replyTo?: string | null };

const PrivateChat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDarkMode, toggleDarkMode } = useApp();
  const { socket, isConnected, joinConversation, leaveConversation, emitTypingStart, emitTypingStop } = useSocket();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [partner, setPartner] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(true);

  // Function to handle back navigation based on source
  const handleBackNavigation = () => {
    const state = location.state as { from?: string } | null;
    
    if (state?.from === 'profile') {
      navigate(`/profile/${userId}`);
    } else if (state?.from === 'user-actions') {
      // If coming from user actions, go back to chat inbox
      navigate('/chat-inbox');
    } else if (state?.from === 'chat-inbox') {
      // If coming from chat inbox, go back to chat inbox
      navigate('/chat-inbox');
    } else {
      // Default fallback to chat inbox
      navigate('/chat-inbox');
    }
  };
  
  const [message, setMessage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('georgian');
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [userLevel, setUserLevel] = useState('b1');
  const [showLanguagePanel, setShowLanguagePanel] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [actionSheetMessageId, setActionSheetMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const chatPartner = partner
    ? { id: partner.id, name: partner.name, avatar: partner.avatar, status: 'offline' as const, languageLearning: '' }
    : { id: userId || '', name: '…', avatar: '🌟', status: 'offline' as const, languageLearning: '' };

  function mapApiMessageToDisplay(m: DirectMessageItem): DisplayMessage {
    const isMe = m.senderId === user?.id;
    return {
      id: m.id,
      sender: isMe ? 'me' : 'them',
      content: m.content,
      timestamp: m.createdAt,
      translated: false,
      corrected: false,
      originalContent: '',
      translatedContent: '',
      hasErrors: false,
      corrections: [],
      type: m.type as 'text',
      reactions: (m.reactions || []).map((r) => ({ emoji: r.emoji, userName: r.userId === user?.id ? 'You' : 'Them' })),
      isEdited: false,
      isDeleted: false,
      replyTo: null,
      deliveryStatus: 'delivered',
      isEncrypted: true,
    };
  }

  const [messages, setMessages] = useState<DisplayMessage[]>([]);

  // Persist conversation id + partner for offline: key by other user id
  const CONV_CACHE_KEY = 'driftzo:conv:';
  const getCachedConversation = (otherUserId: string) => {
    try {
      const raw = localStorage.getItem(CONV_CACHE_KEY + otherUserId);
      if (!raw) return null;
      const { conversationId, otherUser } = JSON.parse(raw);
      if (conversationId && otherUser) return { conversationId, otherUser };
    } catch {}
    return null;
  };
  const setCachedConversation = (otherUserId: string, conversationId: string, otherUser: { id: string; name: string; avatar: string }) => {
    try {
      localStorage.setItem(CONV_CACHE_KEY + otherUserId, JSON.stringify({ conversationId, otherUser }));
    } catch {}
  };

  // Load conversation and messages: show cache first (instant), then refresh from API
  useEffect(() => {
    if (!userId || !user) {
      setMessagesLoading(false);
      return;
    }
    const cachedConv = getCachedConversation(userId);
    if (cachedConv) {
      setConversationId(cachedConv.conversationId);
      setPartner({ id: cachedConv.otherUser.id, name: cachedConv.otherUser.name, avatar: cachedConv.otherUser.avatar || '🌟' });
      const cachedMessages = conversationApi.getCachedMessages(cachedConv.conversationId);
      if (cachedMessages?.length) {
        setMessages(cachedMessages.map(mapApiMessageToDisplay));
        setMessagesLoading(false);
      } else {
        setMessagesLoading(true);
      }
    } else {
      setMessagesLoading(true);
    }
    conversationApi
      .getOrCreate(userId)
      .then((res) => {
        if (!res.success || !res.conversation) {
          toast({ title: 'Error', description: res.message || 'Could not open conversation', variant: 'destructive' });
          setMessagesLoading(false);
          return;
        }
        const { id: cId, otherUser: ou } = res.conversation;
        setConversationId(cId);
        setPartner({ id: ou.id, name: ou.name, avatar: ou.avatar || '🌟' });
        setCachedConversation(userId, cId, { id: ou.id, name: ou.name, avatar: ou.avatar || '🌟' });
        return conversationApi.getMessages(cId);
      })
      .then((res) => {
        if (res?.success && res.messages) {
          setMessages(res.messages.map(mapApiMessageToDisplay));
        }
        setMessagesLoading(false);
      })
      .catch(() => {
        const cached = getCachedConversation(userId);
        if (cached) {
          setConversationId(cached.conversationId);
          setPartner({ id: cached.otherUser.id, name: cached.otherUser.name, avatar: cached.otherUser.avatar || '🌟' });
          const cachedMsgs = conversationApi.getCachedMessages(cached.conversationId);
          if (cachedMsgs?.length) setMessages(cachedMsgs.map(mapApiMessageToDisplay));
          setMessagesLoading(false);
        } else {
          toast({ title: 'Error', description: 'Failed to load conversation', variant: 'destructive' });
          setMessagesLoading(false);
        }
      });
  }, [userId, user?.id]);

  // Join/leave conversation room for real-time events
  useEffect(() => {
    if (!conversationId) return;
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
  }, [conversationId, joinConversation, leaveConversation]);

  // Real-time: new message (only add when message is from the other person; sender already added from API response)
  useEffect(() => {
    if (!socket || !conversationId || !user) return;
    const onNewMessage = (payload: DirectMessageItem) => {
      if (payload.senderId === user.id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        const next = mapApiMessageToDisplay(payload);
        return [...prev, next].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
    };
    socket.on('message:new', onNewMessage);
    return () => {
      socket.off('message:new', onNewMessage);
    };
  }, [socket, conversationId, user?.id]);

  // Real-time: reaction update
  useEffect(() => {
    if (!socket || !conversationId || !user) return;
    const onReaction = (payload: { messageId: string; message: DirectMessageItem }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === payload.messageId ? mapApiMessageToDisplay(payload.message) : msg
        )
      );
    };
    socket.on('message:reaction', onReaction);
    return () => {
      socket.off('message:reaction', onReaction);
    };
  }, [socket, conversationId, user?.id]);

  // Real-time: typing indicators (partner only); auto-hide after 4s if no typing:stop
  const partnerTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!socket || !conversationId || !partner || !user) return;
    const onTypingStart = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === conversationId && data.userId === partner.id) {
        if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
        setPartnerTyping(true);
        partnerTypingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 4000);
      }
    };
    const onTypingStop = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === conversationId && data.userId === partner.id) {
        if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
        partnerTypingTimeoutRef.current = null;
        setPartnerTyping(false);
      }
    };
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    return () => {
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
    };
  }, [socket, conversationId, partner?.id, user?.id]);

  // Poll for new messages when socket is disconnected (fallback)
  useEffect(() => {
    if (!conversationId || isConnected) return;
    const POLL_INTERVAL_MS = 6000;
    const interval = setInterval(() => {
      conversationApi.getMessages(conversationId).then((res) => {
        if (res.success && res.messages) {
          setMessages(res.messages.map(mapApiMessageToDisplay));
        }
      });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [conversationId, user?.id, isConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Emit typing:start when user types (debounced), typing:stop when they stop or send
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!conversationId) return;
    if (!message.trim()) {
      emitTypingStop(conversationId);
      return;
    }
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      emitTypingStart(conversationId);
      typingDebounceRef.current = null;
    }, 300);
    return () => {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    };
  }, [message, conversationId, emitTypingStart, emitTypingStop]);

  useEffect(() => {
    return () => {
      if (conversationId) emitTypingStop(conversationId);
    };
  }, [conversationId, emitTypingStop]);

  // Auto-scroll to bottom when typing indicator appears (only if already at bottom)
  useEffect(() => {
    if (partnerTyping && messagesEndRef.current) {
      const messagesContainer = messagesEndRef.current.parentElement?.parentElement;
      if (messagesContainer) {
        const isAtBottom = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - 10;
        if (isAtBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [partnerTyping]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Message reaction: call API and update local state
  const handleReaction = (messageId: string, emoji: string) => {
    conversationApi.reactToMessage(messageId, emoji).then((res) => {
      const updated = res.success && res.message && typeof res.message !== 'string' ? res.message : null;
      if (updated) {
        setMessages(prev => prev.map(msg => msg.id === messageId ? mapApiMessageToDisplay(updated) : msg));
      }
    });
  };

  // Message editing (local only for now; API edit can be added later)
  const handleEditMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.sender === 'me') {
      setEditingMessageId(messageId);
      setEditingText(message.content);
    }
  };

  const saveEditedMessage = () => {
    if (editingMessageId && editingText.trim()) {
      setMessages(prev => prev.map(msg => 
        msg.id === editingMessageId 
          ? { ...msg, content: editingText, isEdited: true }
          : msg
      ));
      setEditingMessageId(null);
      setEditingText('');
      // Message edited - toast removed per user request
    }
  };

  // Message deletion (local only for now; API delete can be added later)
  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, content: 'This message was deleted', isDeleted: true, type: 'text' as const }
        : msg
    ));
  };

  // Reply to message
  const handleReplyToMessage = (messageId: string) => {
    setReplyingTo(messageId);
  };

  // Long-press helpers for mobile to open actions sheet
  const startLongPress = (messageId: string) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => setActionSheetMessageId(messageId), 400);
  };
  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // File attachment handlers
  const handleImageUpload = () => {
    setShowPhotoGallery(true);
    setShowAttachments(false);
  };

  const handlePhotoGalleryClose = () => {
    setShowPhotoGallery(false);
  };

  const handleSendPhotos = (photos: File[]) => {
    // Create messages for each photo
    photos.forEach((photo, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const newMessage: DisplayMessage = {
          id: `local-img-${Date.now()}-${index}`,
          sender: 'me',
          content: '📷 Photo',
          timestamp: new Date().toISOString(),
          translated: false,
          corrected: false,
          originalContent: '',
          translatedContent: '',
          hasErrors: false,
          corrections: [],
          type: 'image',
          reactions: [],
          isEdited: false,
          isDeleted: false,
          replyTo: replyingTo ?? null,
          deliveryStatus: 'sent',
          isEncrypted: true,
          imageUrl: imageData
        };
        setMessages(prev => [...prev, newMessage]);
      };
      reader.readAsDataURL(photo);
    });

    setReplyingTo(null);
    setShowPhotoGallery(false);
  };

  const handleImageCaptured = (imageData: string) => {
    const newMessage: DisplayMessage = {
      id: `local-cam-${Date.now()}`,
      sender: 'me',
      content: '📷 Photo',
      timestamp: new Date().toISOString(),
      translated: false,
      corrected: false,
      originalContent: '',
      translatedContent: '',
      hasErrors: false,
      corrections: [],
      type: 'image',
      reactions: [],
      isEdited: false,
      isDeleted: false,
      replyTo: replyingTo ?? null,
      deliveryStatus: 'sent',
      isEncrypted: true,
      imageUrl: imageData
    };
    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
    
    // Photo sent - toast removed per user request
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const handleSendRecording = () => {
    const newMessage: DisplayMessage = {
      id: `local-voice-${Date.now()}`,
      sender: 'me',
      content: `🎵 Voice message (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})`,
      timestamp: new Date().toISOString(),
      translated: false,
      corrected: false,
      originalContent: '',
      translatedContent: '',
      hasErrors: false,
      corrections: [],
      type: 'voice',
      reactions: [],
      isEdited: false,
      isDeleted: false,
      replyTo: replyingTo ?? null,
      deliveryStatus: 'sent',
      isEncrypted: true,
      voiceData: {
        duration: recordingTime,
        waveform: Array.from({ length: 20 }, () => Math.random())
      }
    };
    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
    handleStopRecording();
  };

  const handleFileUpload = () => {
    const newMessage: DisplayMessage = {
      id: `local-file-${Date.now()}`,
      sender: 'me',
      content: '📄 Document.pdf',
      timestamp: new Date().toISOString(),
      translated: false,
      corrected: false,
      originalContent: '',
      translatedContent: '',
      hasErrors: false,
      corrections: [],
      type: 'file',
      reactions: [],
      isEdited: false,
      isDeleted: false,
      replyTo: replyingTo ?? null,
      deliveryStatus: 'sent',
      isEncrypted: true,
      fileData: {
        name: 'Language_Practice_Notes.pdf',
        size: '2.4 MB'
      }
    };
    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
    setShowAttachments(false);
    
    // File sent - toast removed per user request
  };

  const handleSendMessage = () => {
    const text = message.trim();
    if (!text || !conversationId) return;

    setIsTyping(false);
    setMessage('');
    setReplyingTo(null);
    emitTypingStop(conversationId);

    conversationApi.sendMessage(conversationId, text).then((res) => {
      if (res.success && res.message && typeof res.message !== 'string') {
        setMessages(prev => [...prev, mapApiMessageToDisplay(res.message as DirectMessageItem)]);
      } else {
        toast({ title: 'Error', description: typeof res.message === 'string' ? res.message : 'Failed to send message', variant: 'destructive' });
        setMessage(text);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleGrammarCheck = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, corrected: true } : msg
    ));
  };

  const handleTranslate = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, translated: !msg.translated, translatedContent: msg.translatedContent || `[${targetLanguage.toUpperCase()}] ${msg.content}` }
        : msg
    ));
  };

  const handleSuggestionFromAI = (suggestion: string) => {
    setMessage(suggestion);
    setShowAIModal(false);
  };

  const renderMessageContent = (msg: { hasErrors?: boolean; corrections?: Array<{ original: string; corrected: string; explanation: string; rule: string; [key: string]: unknown }>; content: string; [key: string]: unknown }) => {
    if (msg.hasErrors && msg.corrections?.length > 0) {
      const content = msg.content;
      
      return (
        <div>
          {msg.corrections.map((correction, index: number) => {
            const parts = content.split(correction.corrected);
            return (
              <span key={index}>
                {parts[0]}
                <LanguageCorrectionTooltip
                  originalText={correction.original}
                  correctedText={correction.corrected}
                  explanation={correction.explanation}
                  rule={correction.rule}
                  example={`Correct: "I love ${correction.corrected} choice." Wrong: "I love ${correction.original} choice."`}
                >
                  <span className="underline decoration-red-500 decoration-wavy cursor-pointer">
                    {correction.corrected}
                  </span>
                </LanguageCorrectionTooltip>
                {parts[1]}
              </span>
            );
          })}
        </div>
      );
    }
    
    return <span>{msg.content}</span>;
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 chat-room-header border-b border-border shadow-soft safe-top">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto w-full min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={handleBackNavigation}
              className="h-10 w-10 bg-transparent hover:bg-transparent active:bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 m-0 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              className="flex items-center gap-2 min-w-0 flex-1 p-2 h-auto bg-transparent hover:bg-transparent active:bg-transparent border-none outline-none focus:outline-none focus:ring-0 m-0 rounded-lg transition-colors"
              onClick={() => navigate(`/user-actions/${userId}`)}
            >
              <div className="text-2xl flex-shrink-0">{chatPartner.avatar}</div>
              <div className="min-w-0 flex-1 text-left">
                <h1 className="font-semibold truncate">{chatPartner.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs text-muted-foreground truncate">{chatPartner.status}</span>
                </div>
              </div>
            </button>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="opacity-50 pointer-events-none" title="Coming soon" aria-hidden>
              <CallButtons
                participantId={chatPartner.id || '1'}
                participantName={chatPartner.name}
                participantAvatar={typeof chatPartner.avatar === 'string' ? chatPartner.avatar : '🌟'}
                variant="full"
                callType="private"
              />
            </div>
            <button
              onClick={toggleDarkMode}
              className="h-10 w-10 bg-transparent hover:bg-transparent active:bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 m-0 flex items-center justify-center rounded-lg transition-all hover:scale-110"
            >
              {isDarkMode ? 
                <Sun size={20} className="text-warning hover:text-warning transition-smooth" /> : 
                <Moon size={20} className="text-secondary hover:text-secondary transition-smooth" />
              }
            </button>
          </div>
        </div>
      </div>



      {/* Language Practice Panel */}
      <LanguagePracticePanel
        isOpen={showLanguagePanel}
        onClose={() => setShowLanguagePanel(false)}
      />

      {/* Messages - top padding from chat-content-below-header only (no py-4) so header never covers first message */}
      <div className={`flex-1 overflow-y-auto px-4 max-w-md mx-auto w-full chat-content-below-header ${showAttachments ? 'pb-52' : 'pb-36'}`}>
        {messagesLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading messages…</div>
        ) : (
        <div className="space-y-4">
          {messages.map((msg) => {
            const replyToMessage = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
            
            return (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  onTouchStart={() => startLongPress(msg.id)}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  className={`max-w-[80%] relative group transition-colors ${
                  msg.sender === 'me' 
                    ? 'bg-primary text-primary-foreground hover:!bg-primary hover:brightness-95' 
                    : 'bg-card hover:bg-muted/60 dark:hover:bg-white/10'
                } ${msg.isDeleted ? 'opacity-60' : ''}`}>
                  <CardContent className="p-3">
                    {/* Reply indicator */}
                    {replyToMessage && (
                      <div className="text-xs p-2 mb-2 bg-black/10 rounded border-l-2 border-primary/50">
                        <div className="flex items-center gap-1 mb-1">
                          <Reply size={10} />
                          <span className="font-medium">
                            {replyToMessage.sender === 'me' ? 'You' : chatPartner.name}
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
                          {msg.type === 'image' && msg.imageUrl && (
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
                          
                          {msg.type === 'voice' && msg.voiceData && (
                            <div className="flex items-center gap-2 p-2 bg-black/10 rounded">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  if (playingVoiceId === msg.id) {
                                    setPlayingVoiceId(null);
                                  } else {
                                    setPlayingVoiceId(msg.id);
                                    setTimeout(() => setPlayingVoiceId(null), msg.voiceData!.duration * 1000);
                                  }
                                }}
                              >
                                {playingVoiceId === msg.id ? <Pause size={14} /> : <Play size={14} />}
                              </Button>
                              <div className="flex-1 flex items-center gap-1">
                                {msg.voiceData.waveform.map((height, i) => (
                                  <div
                                    key={i}
                                    className={`w-1 bg-current rounded ${
                                      playingVoiceId === msg.id ? 'animate-pulse' : ''
                                    }`}
                                    style={{ height: `${Math.max(height * 20, 4)}px` }}
                                  />
                                ))}
                              </div>
                              <span className="text-xs">{msg.voiceData.duration}s</span>
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
                            <>
                              {renderMessageContent(msg as any)}
                              {msg.isEdited && (
                                <span className="text-xs opacity-50 ml-2">(edited)</span>
                              )}
                            </>
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
                            <span>{reaction.userName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(msg.translated || (autoTranslateEnabled && msg.sender === 'them')) && (
                      <div className="text-xs opacity-80 mt-2 p-2 bg-primary/10 rounded">
                        <Languages size={12} className="inline mr-1" />
                        Translation: {msg.translatedContent || `[${targetLanguage.toUpperCase()}] ${msg.content}`}
                      </div>
                    )}

                    {practiceMode && msg.hasErrors && (
                      <div className="text-xs mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <BookOpen size={12} className="inline mr-1 text-yellow-600" />
                        <span className="text-yellow-800">Click underlined words for grammar help!</span>
                      </div>
                    )}
                    
                    {/* Meta row: time + delivery */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs opacity-70">{msg.timestamp}</span>
                        {msg.isEncrypted && (
                          <Lock size={10} className="opacity-50" />
                        )}
                        {msg.sender === 'me' && (
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
                      {msg.sender === 'me' && !msg.isDeleted && (
                        <>
                          <Button variant="ghost" size="sm" className="h-6 px-1 hover:bg-primary/10" onClick={() => handleEditMessage(msg.id)}><Edit3 size={10} /></Button>
                          <Button variant="ghost" size="sm" className="h-6 px-1 text-red-500 hover:bg-red-50" onClick={() => handleDeleteMessage(msg.id)}><Trash2 size={10} /></Button>
                        </>
                      )}
                      {msg.sender === 'me' && practiceMode && (
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
                      {msg.sender === 'them' && (
                        <AITooltip title="Ask AI for Help" description="Get AI suggestions for how to respond to this message">
                          <Button variant="ghost" size="sm" className="h-6 px-1 hover:bg-primary/10" onClick={() => setShowAIModal(true)}>
                            <HelpCircle size={10} />
                          </Button>
                        </AITooltip>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {/* Typing indicator */}
          {partnerTyping && (
            <div className="flex justify-start">
              <Card className="bg-card max-w-[80%]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="text-lg">{chatPartner.avatar}</div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User typing indicator - REMOVED */}

          <div ref={messagesEndRef} />
        </div>
        )}
      </div>

      {/* Photo Gallery */}
      {showPhotoGallery && (
        <PhotoGallery
          onClose={handlePhotoGalleryClose}
          onSendPhotos={handleSendPhotos}
          maxPhotos={10}
        />
      )}

      {/* Attachment panel - positioned above fixed input */}
      {showAttachments && !showPhotoGallery && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 max-w-md mx-auto w-full z-10">
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleImageUpload}
              className="flex-col h-auto p-3 gap-1"
            >
              <Image size={20} />
              <span className="text-xs">Photo</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCamera(true);
                setShowAttachments(false);
              }}
              className="flex-col h-auto p-3 gap-1"
            >
              <Camera size={20} />
              <span className="text-xs">Camera</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFileUpload}
              className="flex-col h-auto p-3 gap-1 col-span-1"
            >
              <File size={20} />
              <span className="text-xs">File</span>
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      {!showPhotoGallery && (
        <div className={`fixed bottom-0 left-0 right-0 bg-card p-4 max-w-md mx-auto w-full border-t border-border ${showAttachments ? 'bottom-20' : ''}`}>
        {/* Reply indicator */}
        {replyingTo && (
          <div className="mb-3 p-2 bg-primary/10 rounded border-l-2 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply size={12} />
                <span className="text-sm">
                  Replying to {messages.find(m => m.id === replyingTo)?.sender === 'me' ? 'yourself' : chatPartner.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {messages.find(m => m.id === replyingTo)?.content}
            </p>
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
              onClick={() => setShowAIModal(true)}
              className={aiAssistantEnabled ? 'text-primary' : ''}
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
              onClick={() => setShowLanguagePanel(true)}
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
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled
            aria-disabled="true"
            title="Images, voice, and files coming soon"
            className="p-2 opacity-50 cursor-not-allowed"
          >
            <Paperclip size={16} />
          </Button>
          
          <Input
            id="privateChatMessage"
            name="privateChatMessage"
            placeholder="Type a thoughtful message..."
            value={message}
            onChange={handleInputChange}
            onBlur={() => conversationId && emitTypingStop(conversationId)}
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
              variant="ghost"
              disabled
              aria-disabled="true"
              title="Voice messages coming soon"
              className="px-3 opacity-50 cursor-not-allowed"
            >
              <Mic size={16} />
            </Button>
          )}
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Recording {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStopRecording}
                className="h-8 px-3 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <Square size={14} />
                <span className="ml-1 text-xs">Stop</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSendRecording}
                className="h-8 px-3 bg-red-600 hover:bg-red-700"
              >
                <Send size={14} />
                <span className="ml-1 text-xs">Send</span>
              </Button>
            </div>
          </div>
        )}
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
              <Button variant="outline" onClick={() => { if (actionSheetMessageId) handleEditMessage(actionSheetMessageId); setActionSheetMessageId(null); }} className="flex-col h-auto py-3"><Edit3 size={16} /><span className="text-xs mt-1">Edit</span></Button>
              <Button variant="destructive" onClick={() => { if (actionSheetMessageId) handleDeleteMessage(actionSheetMessageId); setActionSheetMessageId(null); }} className="flex-col h-auto py-3"><Trash2 size={16} /><span className="text-xs mt-1">Delete</span></Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Camera Screen */}
        <CameraScreen
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
          onImageCaptured={handleImageCaptured}
        />
    </div>
  );
};

export default PrivateChat;
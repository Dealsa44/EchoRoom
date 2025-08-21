import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Languages, CheckCircle, Bot, UserX, Flag, BookOpen, Zap, Target, HelpCircle, Heart, Smile, ThumbsUp, Edit3, Trash2, Reply, Image, Mic, File, Camera, Paperclip, MoreVertical, CheckCheck, Volume2, Download, Play, Pause, Lock, BarChart3, Palette, Square, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ChatMessage } from '@/types';
import AIAssistantModal from '@/components/modals/AIAssistantModal';
import LanguageCorrectionTooltip from '@/components/language/LanguageCorrectionTooltip';
import LanguagePracticePanel from '@/components/language/LanguagePracticePanel';
import AITooltip from '@/components/ai/AITooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import CompatibilityDashboard from '@/components/ai/CompatibilityDashboard';
import MoodThemeSelector from '@/components/ai/MoodThemeSelector';
import CallButtons from '@/components/calls/CallButtons';

const PrivateChat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
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
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);
  const [actionSheetMessageId, setActionSheetMessageId] = useState<number | null>(null);
  const [showCompatibilityDashboard, setShowCompatibilityDashboard] = useState(false);
  const [showMoodThemeSelector, setShowMoodThemeSelector] = useState(false);
  const [currentMoodTheme, setCurrentMoodTheme] = useState('default');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock user data - in real app this would come from API
  const getUserById = (id: string) => {
    const users = {
      '1': { name: 'Luna', avatar: '🌙', status: 'online', languageLearning: 'English' },
      '2': { name: 'Alex', avatar: '📚', status: 'online', languageLearning: 'Japanese' },
      '3': { name: 'Sage', avatar: '🌱', status: 'online', languageLearning: 'Spanish' },
      '4': { name: 'Maya', avatar: '🎨', status: 'online', languageLearning: 'Italian' },
      '5': { name: 'Kai', avatar: '🏃', status: 'away', languageLearning: 'English' }
    };
    return users[id as keyof typeof users] || users['1'];
  };

  const userInfo = getUserById(userId || '1');
  const chatPartner = {
    id: userId,
    name: userInfo.name,
    avatar: userInfo.avatar,
    status: userInfo.status,
    languageLearning: userInfo.languageLearning
  };

  const getInitialMessage = (userName: string) => {
    const messages = {
      'Luna': 'Hi! I saw we both love philosophy. What\'s your favorite philosophical question?',
      'Alex': 'Hey! I noticed you\'re interested in books. What\'s the last book that really changed your perspective?',
      'Sage': 'Hello! I love that we both practice mindfulness. What\'s your favorite way to find inner peace?',
      'Maya': 'Hi there! I see you appreciate art. What kind of creative expression speaks to you most?',
      'Kai': 'Hey! I noticed we both value fitness. What\'s your favorite way to stay active?'
    };
    return messages[userName as keyof typeof messages] || messages['Luna'];
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'them',
      content: getInitialMessage(userInfo.name),
      timestamp: '5 min ago',
      translated: false,
      corrected: false,
      originalContent: '',
      translatedContent: '',
      hasErrors: false,
      corrections: [],
      type: 'text',
      reactions: [],
      isEdited: false,
      isDeleted: false,
      replyTo: null,
      deliveryStatus: 'delivered',
      isEncrypted: true
    },
    {
      id: 2,
      sender: 'me',
      content: 'Hello! I think about "What makes life meaningful?" quite often. What about you?',
      timestamp: '3 min ago',
      translated: false,
      corrected: false,
      originalContent: '',
      translatedContent: '',
      hasErrors: false,
      corrections: [],
      type: 'text',
      reactions: [{ emoji: '❤️', userName: userInfo.name }],
      isEdited: false,
      isDeleted: false,
      replyTo: null,
      deliveryStatus: 'read',
      isEncrypted: true
    },
    {
      id: 3,
      sender: 'them',
      content: 'That\'s beautiful! I often wonder about the nature of happiness. Is it something we find or create?',
      timestamp: '2 min ago',
      translated: false,
      corrected: false,
      originalContent: '',
      translatedContent: '',
      hasErrors: false,
      corrections: [],
      type: 'text',
      reactions: [{ emoji: '👍', userName: 'You' }],
      isEdited: false,
      isDeleted: false,
      replyTo: null,
      deliveryStatus: 'delivered',
      isEncrypted: true
    },
    {
      id: 4,
      sender: 'me',
      content: 'I think happiness is something we create through our choices and mindset.',
      timestamp: '1 min ago',
      translated: false,
      corrected: false,
      originalContent: 'I think hapiness is something we create through our choises and mindset.',
      translatedContent: '',
      hasErrors: true,
      corrections: [
        {
          original: 'hapiness',
          corrected: 'happiness',
          explanation: 'Spelling error: "happiness" has two p\'s',
          rule: 'Common spelling rule'
        },
        {
          original: 'choises',
          corrected: 'choices',
          explanation: 'Spelling error: the plural of "choice" is "choices"',
          rule: 'Irregular plural form'
        }
      ],
      type: 'text',
      reactions: [],
      isEdited: true,
      isDeleted: false,
      replyTo: null,
      deliveryStatus: 'read',
      isEncrypted: true
    },
    {
      id: 5,
      sender: 'them',
      content: '🎵 Voice message',
      timestamp: '30 sec ago',
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
      replyTo: 4,
      deliveryStatus: 'delivered',
      isEncrypted: true,
      voiceData: {
        duration: 15,
        waveform: [0.2, 0.5, 0.8, 0.3, 0.7, 0.4, 0.9, 0.1, 0.6, 0.3]
      }
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    if (isTyping) {
      setPartnerTyping(false);
      typingTimer = setTimeout(() => {
        setPartnerTyping(true);
        setTimeout(() => setPartnerTyping(false), 2000);
      }, 1000);
    }
    return () => clearTimeout(typingTimer);
  }, [isTyping]);

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

  // Message reaction handlers
  const handleReaction = (messageId: number, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.userName === 'You');
        if (existingReaction) {
          if (existingReaction.emoji === emoji) {
            // Remove reaction
            return { ...msg, reactions: msg.reactions?.filter(r => r.userName !== 'You') || [] };
          } else {
            // Change reaction
            return { 
              ...msg, 
              reactions: msg.reactions?.map(r => r.userName === 'You' ? { ...r, emoji } : r) || []
            };
          }
        } else {
          // Add reaction
          return { 
            ...msg, 
            reactions: [...(msg.reactions || []), { emoji, userName: 'You' }]
          };
        }
      }
      return msg;
    }));
    
    // Reaction added - toast removed per user request
  };

  // Message editing
  const handleEditMessage = (messageId: number) => {
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

  // Message deletion
  const handleDeleteMessage = (messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: 'This message was deleted', isDeleted: true, type: 'text' as const }
        : msg
    ));
    // Message deleted - toast removed per user request
  };

  // Reply to message
  const handleReplyToMessage = (messageId: number) => {
    setReplyingTo(messageId);
    // Focus input (would need ref in real implementation)
  };

  // Long-press helpers for mobile to open actions sheet
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

  // File attachment handlers
  const handleImageUpload = () => {
    // Simulate image upload
    const newMessage = {
      id: messages.length + 1,
      sender: 'me' as const,
      content: '📷 Photo',
      timestamp: 'now',
      translated: false,
      corrected: false,
      originalContent: '',
      translatedContent: '',
      hasErrors: false,
      corrections: [],
      type: 'image' as const,
      reactions: [],
      isEdited: false,
      isDeleted: false,
      replyTo: replyingTo,
      deliveryStatus: 'sent' as const,
      isEncrypted: true,
      imageUrl: 'https://picsum.photos/300/200?random=' + Math.random()
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
    setShowAttachments(false);
    
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
        waveform: Array.from({ length: 20 }, () => Math.random())
      }
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyingTo(null);
    handleStopRecording();
  };

  const handleFileUpload = () => {
    // Simulate file upload
    const newMessage = {
      id: messages.length + 1,
      sender: 'me' as const,
      content: '📄 Document.pdf',
      timestamp: 'now',
      translated: false,
      corrected: false,
      originalContent: '',
      translatedContent: '',
      hasErrors: false,
      corrections: [],
      type: 'file' as const,
      reactions: [],
      isEdited: false,
      isDeleted: false,
      replyTo: replyingTo,
      deliveryStatus: 'sent' as const,
      isEncrypted: true,
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

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Simulate grammar checking in practice mode
    const hasErrors = practiceMode && Math.random() > 0.6;
    const corrections = hasErrors ? [
      {
        original: 'there',
        corrected: 'their',
        explanation: '"Their" shows possession, "there" indicates location',
        rule: 'Homophones usage'
      }
    ] : [];

    const newMessage = {
      id: messages.length + 1,
      sender: 'me' as const,
      content: message,
      timestamp: 'now',
      translated: false,
      corrected: false,
      originalContent: hasErrors ? message.replace('their', 'there') : '',
      translatedContent: '',
      hasErrors,
      corrections,
      type: 'text' as const,
      reactions: [],
      isEdited: false,
      isDeleted: false,
      replyTo: replyingTo,
      deliveryStatus: 'sent' as const,
      isEncrypted: true
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setReplyingTo(null);
    setIsTyping(false);

    if (hasErrors && practiceMode) {
      // Grammar suggestion - toast removed per user request
    }

    // Simulate response
    setTimeout(() => {
      const responses = [
        "That's such an interesting perspective! I never thought about it that way.",
        "I completely agree with you on that point.",
        "Could you tell me more about what you mean by that?",
        "That reminds me of something I read recently..."
      ];
      
      const response = {
        id: messages.length + 2,
        sender: 'them' as const,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: 'just now',
        translated: false,
        corrected: false,
        originalContent: '',
        translatedContent: `[${targetLanguage.toUpperCase()}] ${responses[Math.floor(Math.random() * responses.length)]}`,
        hasErrors: false,
        corrections: [],
        type: 'text' as const,
        reactions: [],
        isEdited: false,
        isDeleted: false,
        replyTo: null,
        deliveryStatus: 'delivered' as const,
        isEncrypted: true
      };
      
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleGrammarCheck = (messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, corrected: true }
        : msg
    ));
    
    // Grammar checked - toast removed per user request
  };

  const handleTranslate = (messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            translated: !msg.translated,
            translatedContent: msg.translatedContent || `[${targetLanguage.toUpperCase()}] ${msg.content}`
          }
        : msg
    ));
    
    if (!messages.find(msg => msg.id === messageId)?.translated) {
      // Translation ready - toast removed per user request
    }
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

  const handleBlock = () => {
    // User blocked - toast removed per user request
    navigate('/match');
  };

  const handleReport = () => {
    // Report submitted - toast removed per user request
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border shadow-soft">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto w-full min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="text-2xl flex-shrink-0">{chatPartner.avatar}</div>
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold truncate">{chatPartner.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs text-muted-foreground truncate">{chatPartner.status}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <CallButtons
              participantId={chatPartner.id || '1'}
              participantName={chatPartner.name}
              participantAvatar={chatPartner.avatar}
              variant="full"
            />
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => {
                  setShowCompatibilityDashboard(false);
                  setShowMoodThemeSelector(true);
                }}>
                  <Palette size={16} className="mr-2" />
                  Mood Themes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setShowMoodThemeSelector(false);
                  setShowCompatibilityDashboard(true);
                }}>
                  <BarChart3 size={16} className="mr-2" />
                  Compatibility
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReport}>
                  <Flag size={16} className="mr-2" />
                  Report User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>



      {/* Language Practice Panel */}
      <LanguagePracticePanel
        isOpen={showLanguagePanel}
        onClose={() => setShowLanguagePanel(false)}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full pt-20 pb-32">
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
                    <span className="text-xs text-muted-foreground">typing...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>



      {/* Message Input */}
              <div className="fixed bottom-0 left-0 right-0 bg-card p-4 max-w-md mx-auto w-full border-t border-border">
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

        {/* Attachment panel */}
        {showAttachments && (
          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                onClick={handleFileUpload}
                className="flex-col h-auto p-3 gap-1"
              >
                <File size={20} />
                <span className="text-xs">File</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceRecord}
                className={`flex-col h-auto p-3 gap-1 ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
              >
                <Mic size={20} />
                <span className="text-xs">{isRecording ? 'Stop' : 'Voice'}</span>
              </Button>
            </div>
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
            onClick={() => setShowAttachments(!showAttachments)}
            className={`p-2 ${showAttachments ? 'text-primary' : ''}`}
          >
            <Paperclip size={16} />
          </Button>
          
          <Input
            id="privateChatMessage"
            name="privateChatMessage"
            placeholder="Type a thoughtful message..."
            value={message}
            onChange={handleInputChange}
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

        {/* AI Assistant Modal */}
        <AIAssistantModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
        />

        {/* Compatibility Dashboard */}
        <CompatibilityDashboard
          partnerId={userId || '1'}
          partnerName={userInfo.name}
          isOpen={showCompatibilityDashboard}
          onClose={() => setShowCompatibilityDashboard(false)}
        />

        {/* Mood Theme Selector */}
        <MoodThemeSelector
          currentTheme={currentMoodTheme}
          messages={messages.map(msg => ({ 
            content: msg.content, 
            timestamp: new Date() 
          }))}
          onThemeChange={setCurrentMoodTheme}
          isOpen={showMoodThemeSelector}
          onClose={() => setShowMoodThemeSelector(false)}
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
      </div>
    </div>
  );
};

export default PrivateChat;
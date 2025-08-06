import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Send, Bot, UserX, Flag, Users, Eye, EyeOff, Languages, MessageCircle, Lightbulb, Mic, Headphones, PenTool, Eye as EyeIcon, Brain, Star, Zap, Award, BookOpen, Hash, Reply, MoreVertical, Pin, Trash2, Shield, Volume, VolumeX, Crown, Settings, BarChart3 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguageAI } from '@/contexts/LanguageAIContext';
import { toast } from '@/hooks/use-toast';
import { chatRooms } from '@/data/chatRooms';
import AIAssistantModal from '@/components/modals/AIAssistantModal';
import LanguagePracticePanel from '@/components/language/LanguagePracticePanel';
import AITooltip from '@/components/ai/AITooltip';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find the actual room data based on the ID
  const room = chatRooms.find(r => r.id === id);
  
  // If room not found, redirect to chat rooms
  useEffect(() => {
    if (!room) {
      toast({
        title: "Room not found",
        description: "The chat room you're looking for doesn't exist.",
        variant: "destructive",
      });
      navigate('/chat-rooms');
    }
  }, [room, navigate]);

  if (!room) {
    return <div>Loading...</div>;
  }

  const roomData = {
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
  };

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
    getInitialMessages(room.category, room.title, roomData.moderators)
  );

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    toast({
      title: pinnedMessages.has(messageId) ? "Message unpinned" : "Message pinned",
      description: "Moderator action completed",
    });
  };

  const handleDeleteMessage = (messageId: number) => {
    if (!isUserModerator) return;
    
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast({
      title: "Message deleted",
      description: "Moderator action completed",
      variant: "destructive",
    });
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

    toast({
      title: mutedUsers.has(username) ? `${username} unmuted` : `${username} muted`,
      description: "Moderator action completed",
    });
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
        
        toast({
          title: "Grammar Correction",
          description: `Found ${corrections.length} grammar issue(s). Check the language panel for details.`,
        });
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

  const handleLeaveRoom = () => {
    if (currentSession) {
      endLearningSession();
    }
    
    // Remove from joined rooms
    if (id) {
      leaveRoom(id);
    }
    
    navigate(-1);
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
      <div className="sticky top-0 z-40 chat-room-header border-b border-border shadow-soft">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto w-full">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLeaveRoom}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold">{roomData.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card 
              key={msg.id} 
              className={`${msg.isAI ? 'bg-primary/5 border-primary/20' : 'bg-card'} ${msg.user.isAnonymous ? 'opacity-90' : ''}`}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className="text-lg">{msg.user.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-sm ${msg.user.isAnonymous ? 'text-muted-foreground' : ''}`}>
                        {msg.user.name}
                      </span>
                      {msg.isAI && <Badge variant="secondary" className="text-xs">AI</Badge>}
                      <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showAIPanel && (
        <div className="border-t border-border bg-card p-4 max-w-md mx-auto w-full">
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
              onClick={() => setShowAIModal(true)}
              className="w-full text-xs"
            >
              <Lightbulb size={12} className="mr-1" />
              More AI Help & Language Practice
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4 max-w-md mx-auto w-full">
        {anonymousMode && (
          <div className="mb-2 text-xs text-muted-foreground flex items-center gap-1">
            <EyeOff size={12} />
            Anonymous mode active
          </div>
        )}
        <div className="flex gap-2 mb-2">
          <AITooltip 
            title="Quick Suggestions"
            description="Get conversation starters and thoughtful questions for this room"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={showAIPanel ? 'text-primary' : ''}
            >
              <Bot size={14} />
              <span className="ml-1 text-xs">Quick Help</span>
            </Button>
          </AITooltip>
          
          <AITooltip 
            title="Full AI Assistant"
            description="Access comprehensive language learning and conversation support"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIModal(true)}
            >
              <Languages size={14} />
              <span className="ml-1 text-xs">AI Assistant</span>
            </Button>
          </AITooltip>
        </div>
        
        <div className="flex gap-2">
          <Input
            id="messageInput"
            name="messageInput"
            placeholder="Share your thoughts..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            variant="cozy"
          >
            <Send size={16} />
          </Button>
        </div>
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
    </div>
  );
};

export default ChatRoom;
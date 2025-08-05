import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Send, Bot, UserX, Flag, Users, Eye, EyeOff, Languages, MessageCircle, Lightbulb, Mic, Headphones, PenTool, Eye as EyeIcon, Brain, Star, Zap, Award, BookOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguageAI } from '@/contexts/LanguageAIContext';
import { toast } from '@/hooks/use-toast';
import AIAssistantModal from '@/components/modals/AIAssistantModal';
import LanguagePracticePanel from '@/components/language/LanguagePracticePanel';
import AITooltip from '@/components/ai/AITooltip';

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, safeMode } = useApp();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roomData = {
    id: id,
    title: 'Language Learning Hub',
    description: 'Practice your language skills with native speakers and AI assistance',
    members: 127,
    activeNow: 8,
    isAnonymousAllowed: true
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      user: { name: 'LanguageHelper', avatar: '🌍', isAnonymous: false },
      content: 'Welcome to the Language Learning Hub! Feel free to practice your language skills here.',
      timestamp: '2 min ago',
      isAI: false
    },
    {
      id: 2,
      user: { name: 'Anonymous', avatar: '👤', isAnonymous: true },
      content: 'Hello! I am learning English. Can someone help me practice?',
      timestamp: '1 min ago',
      isAI: false
    },
    {
      id: 3,
      user: { name: 'AI Assistant', avatar: '🤖', isAnonymous: false },
      content: 'Great initiative! I can help you practice English. What would you like to work on today?',
      timestamp: '30 sec ago',
      isAI: true
    }
  ]);

  const aiSuggestions = [
    "What's your favorite way to learn new vocabulary?",
    "How do you practice pronunciation?",
    "What language challenges do you face most often?",
    "What's your goal for language learning this week?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        isAnonymous: anonymousMode
      },
      content: message,
      timestamp: 'now',
      isAI: false
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

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
        user: { name: 'AI Assistant', avatar: '🤖', isAnonymous: false },
        content: aiResponse,
        timestamp: 'just now',
        isAI: true
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
    navigate('/chat-rooms');
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
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-soft">
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
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users size={12} />
                <span>{roomData.activeNow} active now</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {roomData.isAnonymousAllowed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAnonymousMode(!anonymousMode)}
                className={anonymousMode ? 'text-primary' : ''}
              >
                {anonymousMode ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setShowAIModal(true)}>
              <Bot size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowLanguagePanel(!showLanguagePanel)}>
              <Languages size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Safe Mode Indicator */}
      <div className="bg-safe-light/20 border-b border-border p-2">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <Badge className={`bg-safe-${safeMode}`}>
            {safeMode} mode active
          </Badge>
          <span className="text-xs text-muted-foreground">
            Conversations are filtered for safety
          </span>
        </div>
      </div>

      {/* Messages */}
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
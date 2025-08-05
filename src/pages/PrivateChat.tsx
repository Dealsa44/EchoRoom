import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Languages, CheckCircle, Bot, UserX, Flag, BookOpen, Zap, Target, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import AIAssistantModal from '@/components/modals/AIAssistantModal';
import LanguageCorrectionTooltip from '@/components/language/LanguageCorrectionTooltip';
import LanguagePracticePanel from '@/components/language/LanguagePracticePanel';
import AITooltip from '@/components/ai/AITooltip';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatPartner = {
    id: userId,
    name: 'Luna',
    avatar: '🌙',
    status: 'online',
    safeMode: true,
    languageLearning: 'English'
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'them',
      content: 'Hi! I saw we both love philosophy. What\'s your favorite philosophical question?',
      timestamp: '5 min ago',
      translated: false,
      corrected: false,
      originalContent: '',
      translatedContent: '',
      hasErrors: false,
      corrections: []
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
      corrections: []
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
      corrections: []
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
      ]
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      corrections
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    if (hasErrors && practiceMode) {
      toast({
        title: "Grammar suggestion",
        description: "I found a small error in your message. Click the underlined word to learn more!",
      });
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
        corrections: []
      };
      
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleGrammarCheck = (messageId: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, corrected: true }
        : msg
    ));
    
    toast({
      title: "Grammar Checked",
      description: "Your message looks great! No corrections needed.",
    });
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
      toast({
        title: "Translation Ready",
        description: "Message translated to your learning language",
      });
    }
  };

  const handleSuggestionFromAI = (suggestion: string) => {
    setMessage(suggestion);
    setShowAIModal(false);
  };

  const renderMessageContent = (msg: any) => {
    if (msg.hasErrors && msg.corrections?.length > 0) {
      let content = msg.content;
      
      return (
        <div>
          {msg.corrections.map((correction: any, index: number) => {
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
    toast({
      title: "User Blocked",
      description: `${chatPartner.name} has been blocked and reported.`,
      variant: "destructive",
    });
    navigate('/match');
  };

  const handleReport = () => {
    toast({
      title: "Report Submitted",
      description: "Thank you for helping keep EchoRoom safe.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-soft">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/match')}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <div className="text-2xl">{chatPartner.avatar}</div>
              <div>
                <h1 className="font-semibold">{chatPartner.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">{chatPartner.status}</span>
                  {chatPartner.safeMode && (
                    <Badge variant="secondary" className="text-xs">Safe Mode</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleReport}>
              <Flag size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleBlock}>
              <UserX size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-muted/50 border-b border-border p-3">
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages size={16} className="text-primary" />
              <span className="text-sm">Learning: {chatPartner.languageLearning}</span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-20 h-6 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="georgian">🇬🇪</SelectItem>
                  <SelectItem value="english">🇺🇸</SelectItem>
                  <SelectItem value="spanish">🇪🇸</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <AITooltip 
                title="Practice Mode"
                description="AI will actively help you improve your language skills while chatting"
              >
                <div className="flex items-center gap-1">
                  <Switch
                    checked={practiceMode}
                    onCheckedChange={setPracticeMode}
                    className="scale-75"
                  />
                  <Label className="text-xs">Practice Mode</Label>
                </div>
              </AITooltip>
              
              <AITooltip 
                title="Auto-Translate"
                description="Automatically show translations for incoming messages"
              >
                <div className="flex items-center gap-1">
                  <Switch
                    checked={autoTranslateEnabled}
                    onCheckedChange={setAutoTranslateEnabled}
                    className="scale-75"
                  />
                  <Label className="text-xs">Auto-Translate</Label>
                </div>
              </AITooltip>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLanguagePanel(!showLanguagePanel)}
              className="h-6 px-2 text-xs"
            >
              <Target size={12} className="mr-1" />
              {userLevel.toUpperCase()}
            </Button>
          </div>
        </div>
      </div>

      {/* Language Practice Panel */}
      <LanguagePracticePanel
        isOpen={showLanguagePanel}
        onClose={() => setShowLanguagePanel(false)}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] ${
                msg.sender === 'me' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card'
              }`}>
                <CardContent className="p-3">
                  <div className="text-sm mb-2">
                    {renderMessageContent(msg)}
                  </div>
                  
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
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">{msg.timestamp}</span>
                    
                    <div className="flex gap-1">
                      {msg.sender === 'me' && practiceMode && (
                        <AITooltip 
                          title="Grammar Check"
                          description="Check this message for grammar and spelling errors"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleGrammarCheck(msg.id)}
                          >
                            {msg.corrected ? <CheckCircle size={12} className="text-green-500" /> : <BookOpen size={12} />}
                          </Button>
                        </AITooltip>
                      )}
                      
                      {!autoTranslateEnabled && (
                        <AITooltip 
                          title="Translate Message"
                          description="See this message in your learning language"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleTranslate(msg.id)}
                          >
                            <Languages size={12} className={msg.translated ? 'text-primary' : ''} />
                          </Button>
                        </AITooltip>
                      )}

                      {msg.sender === 'them' && (
                        <AITooltip 
                          title="Ask AI for Help"
                          description="Get AI suggestions for how to respond to this message"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setShowAIModal(true)}
                          >
                            <HelpCircle size={12} />
                          </Button>
                        </AITooltip>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4 max-w-md mx-auto w-full">
        <div className="flex gap-2 mb-2">
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
              <span className="ml-1 text-xs">AI Help</span>
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
                  toast({
                    title: "Translation",
                    description: `"${message}" → [${targetLanguage.toUpperCase()}] ${message}`,
                  });
                }
              }}
            >
              <Languages size={14} />
              <span className="ml-1 text-xs">Translate</span>
            </Button>
          </AITooltip>

          {practiceMode && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              <Zap size={10} className="mr-1" />
              Practice Active
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Type a thoughtful message..."
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

        {/* AI Assistant Modal */}
        <AIAssistantModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onSendSuggestion={handleSuggestionFromAI}
        />
      </div>
    </div>
  );
};

export default PrivateChat;
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Heart, 
  Smile, 
  ThumbsUp, 
  MessageCircle, 
  Sparkles,
  Brain,
  RefreshCw,
  Send,
  Lightbulb
} from 'lucide-react';

interface SmartReply {
  id: string;
  text: string;
  tone: 'friendly' | 'professional' | 'casual' | 'enthusiastic' | 'supportive' | 'curious';
  category: 'agreement' | 'question' | 'compliment' | 'continuation' | 'empathy' | 'encouragement';
  confidence: number;
  emoji?: string;
}

interface ConversationContext {
  lastMessage: string;
  conversationTone: string;
  userPersonality: string;
  relationship: string;
  topic: string;
  languageLevel: string;
  culturalContext: string;
}

interface SmartRepliesProps {
  context: ConversationContext;
  onSelectReply: (reply: string) => void;
  isVisible: boolean;
  maxReplies?: number;
}

const SmartReplies: React.FC<SmartRepliesProps> = ({
  context,
  onSelectReply,
  isVisible,
  maxReplies = 6
}) => {
  const [replies, setReplies] = useState<SmartReply[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string>('auto');

  useEffect(() => {
    if (isVisible && context.lastMessage) {
      generateReplies();
    }
  }, [isVisible, context.lastMessage, selectedTone]);

  const generateReplies = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const generatedReplies = await generateContextualReplies(context);
    setReplies(generatedReplies.slice(0, maxReplies));
    setIsGenerating(false);
  };

  const generateContextualReplies = async (ctx: ConversationContext): Promise<SmartReply[]> => {
    const lastMessageLower = ctx.lastMessage.toLowerCase();
    const replies: SmartReply[] = [];

    // Analyze message sentiment and content
    const isQuestion = lastMessageLower.includes('?') || 
                     lastMessageLower.startsWith('what') || 
                     lastMessageLower.startsWith('how') ||
                     lastMessageLower.startsWith('why') ||
                     lastMessageLower.startsWith('when') ||
                     lastMessageLower.startsWith('where');

    const isPositive = lastMessageLower.includes('great') || 
                      lastMessageLower.includes('good') || 
                      lastMessageLower.includes('amazing') ||
                      lastMessageLower.includes('love') ||
                      lastMessageLower.includes('wonderful');

    const isNegative = lastMessageLower.includes('sad') || 
                      lastMessageLower.includes('difficult') || 
                      lastMessageLower.includes('hard') ||
                      lastMessageLower.includes('problem') ||
                      lastMessageLower.includes('worried');

    const isLearningRelated = lastMessageLower.includes('learn') || 
                             lastMessageLower.includes('language') || 
                             lastMessageLower.includes('practice') ||
                             lastMessageLower.includes('study') ||
                             lastMessageLower.includes('grammar');

    // Generate appropriate replies based on context
    if (isQuestion) {
      replies.push({
        id: '1',
        text: "That's a great question! Let me think about it...",
        tone: 'friendly',
        category: 'agreement',
        confidence: 85,
        emoji: '🤔'
      });

      if (isLearningRelated) {
        replies.push({
          id: '2',
          text: "I'd love to help you with that! What specific part would you like to focus on?",
          tone: 'supportive',
          category: 'encouragement',
          confidence: 90,
          emoji: '💪'
        });
      }
    }

    if (isPositive) {
      replies.push({
        id: '3',
        text: "I'm so happy to hear that! 😊",
        tone: 'enthusiastic',
        category: 'empathy',
        confidence: 92,
        emoji: '😊'
      });

      replies.push({
        id: '4',
        text: "That's wonderful! Tell me more about it.",
        tone: 'curious',
        category: 'continuation',
        confidence: 88,
        emoji: '✨'
      });
    }

    if (isNegative) {
      replies.push({
        id: '5',
        text: "I understand how that can feel challenging. You're not alone in this.",
        tone: 'supportive',
        category: 'empathy',
        confidence: 89,
        emoji: '🤗'
      });

      replies.push({
        id: '6',
        text: "That sounds tough. Is there anything I can do to help?",
        tone: 'supportive',
        category: 'encouragement',
        confidence: 87,
        emoji: '💙'
      });
    }

    if (isLearningRelated) {
      replies.push({
        id: '7',
        text: "Language learning is such a journey! What's been your biggest breakthrough so far?",
        tone: 'curious',
        category: 'question',
        confidence: 91,
        emoji: '🌟'
      });

      replies.push({
        id: '8',
        text: "Practice makes perfect! Keep up the great work.",
        tone: 'enthusiastic',
        category: 'encouragement',
        confidence: 86,
        emoji: '🎯'
      });
    }

    // Add some general conversational replies
    replies.push(
      {
        id: '9',
        text: "I completely agree with you on that.",
        tone: 'friendly',
        category: 'agreement',
        confidence: 82,
        emoji: '👍'
      },
      {
        id: '10',
        text: "That's really interesting! I never thought about it that way.",
        tone: 'curious',
        category: 'compliment',
        confidence: 84,
        emoji: '💭'
      },
      {
        id: '11',
        text: "Could you tell me more about what you mean by that?",
        tone: 'curious',
        category: 'question',
        confidence: 80,
        emoji: '❓'
      }
    );

    // Adjust for language level
    if (ctx.languageLevel === 'A1' || ctx.languageLevel === 'A2') {
      return replies.map(reply => ({
        ...reply,
        text: simplifyText(reply.text),
        confidence: reply.confidence - 5
      }));
    }

    // Adjust for cultural context
    if (ctx.culturalContext === 'formal') {
      return replies.map(reply => ({
        ...reply,
        text: formalizeText(reply.text),
        tone: reply.tone === 'casual' ? 'professional' : reply.tone
      }));
    }

    return replies;
  };

  const simplifyText = (text: string): string => {
    return text
      .replace(/That's really interesting!/g, 'That's cool!')
      .replace(/I completely agree with you on that/g, 'I agree!')
      .replace(/Could you tell me more about what you mean by that\?/g, 'Can you explain more?')
      .replace(/I understand how that can feel challenging/g, 'That sounds hard')
      .replace(/Language learning is such a journey!/g, 'Learning languages is fun!');
  };

  const formalizeText = (text: string): string => {
    return text
      .replace(/That's cool!/g, 'That is quite interesting.')
      .replace(/I agree!/g, 'I concur with your perspective.')
      .replace(/😊/g, '')
      .replace(/🤗/g, '')
      .replace(/💪/g, '');
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'friendly': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-gray-100 text-gray-800';
      case 'casual': return 'bg-green-100 text-green-800';
      case 'enthusiastic': return 'bg-orange-100 text-orange-800';
      case 'supportive': return 'bg-purple-100 text-purple-800';
      case 'curious': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'agreement': return <ThumbsUp size={12} />;
      case 'question': return <MessageCircle size={12} />;
      case 'compliment': return <Heart size={12} />;
      case 'continuation': return <Sparkles size={12} />;
      case 'empathy': return <Heart size={12} />;
      case 'encouragement': return <Zap size={12} />;
      default: return <MessageCircle size={12} />;
    }
  };

  const handleReplySelect = (reply: SmartReply) => {
    onSelectReply(reply.text);
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const refreshReplies = () => {
    generateReplies();
  };

  if (!isVisible) return null;

  return (
    <Card className="border-t-0 rounded-t-none shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-purple-600" />
            <span className="text-sm font-medium">Smart Replies</span>
            <Badge variant="secondary" className="text-xs">
              AI Powered
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshReplies}
              disabled={isGenerating}
              className="h-7 w-7 p-0"
            >
              <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {isGenerating ? (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain size={16} className="animate-pulse text-purple-600" />
              Generating personalized replies...
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {replies.map((reply) => (
                <Button
                  key={reply.id}
                  variant="outline"
                  onClick={() => handleReplySelect(reply)}
                  className="h-auto p-3 text-left justify-start hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {reply.emoji ? (
                        <span className="text-lg">{reply.emoji}</span>
                      ) : (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getToneColor(reply.tone)}`}>
                          {getCategoryIcon(reply.category)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-left">{reply.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs ${getToneColor(reply.tone)}`}>
                          {reply.tone}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {reply.confidence}% match
                        </span>
                      </div>
                    </div>
                    
                    <Send size={14} className="text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </Button>
              ))}
            </div>

            {replies.length === 0 && (
              <div className="text-center py-4">
                <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No smart replies available for this message
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            AI suggestions based on context, tone, and your conversation style
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartReplies;
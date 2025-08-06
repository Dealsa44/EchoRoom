import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  RefreshCw,
  Send,
  Book,
  Music,
  Camera,
  Coffee,
  Plane,
  Palette
} from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  interests: string[];
  languageLevel: string;
  chatStyle: string;
  iceBreakerAnswers: Record<string, string>;
  bio: string;
}

interface ConversationStarter {
  id: string;
  type: 'icebreaker' | 'shared_interest' | 'language_practice' | 'personality_match' | 'cultural_exchange';
  category: string;
  starter: string;
  explanation: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  confidence: number; // 0-100
}

interface SmartConversationStartersProps {
  profile: Profile;
  onSelectStarter: (starter: string) => void;
  onClose?: () => void;
}

const SmartConversationStarters = ({ profile, onSelectStarter, onClose }: SmartConversationStartersProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const generateStarters = (): ConversationStarter[] => {
    const starters: ConversationStarter[] = [];

    // Icebreaker questions based on profile answers
    if (profile.iceBreakerAnswers) {
      Object.entries(profile.iceBreakerAnswers).forEach(([question, answer]) => {
        if (question.includes('weekend')) {
          starters.push({
            id: 'weekend-' + refreshKey,
            type: 'icebreaker',
            category: 'Personal',
            starter: `I saw you love ${answer.toLowerCase()}! What's your perfect weekend routine?`,
            explanation: 'Based on their weekend preferences',
            icon: Coffee,
            confidence: 95
          });
        }
        
        if (question.includes('travel')) {
          starters.push({
            id: 'travel-' + refreshKey,
            type: 'icebreaker',
            category: 'Travel',
            starter: `${answer} sounds amazing! What draws you to that place?`,
            explanation: 'Connecting through travel interests',
            icon: Plane,
            confidence: 90
          });
        }
        
        if (question.includes('book')) {
          starters.push({
            id: 'book-' + refreshKey,
            type: 'icebreaker',
            category: 'Books',
            starter: `I'm intrigued by your choice of "${answer}". What resonated with you most?`,
            explanation: 'Deep dive into their reading interests',
            icon: Book,
            confidence: 88
          });
        }
      });
    }

    // Shared interests
    profile.interests.forEach(interest => {
      const interestStarters = {
        'Philosophy': [
          `I see you're into philosophy too! What philosophical question keeps you up at night?`,
          `Fellow philosophy lover! Do you lean more towards Eastern or Western philosophical traditions?`,
          `What's a philosophical concept that completely changed how you see the world?`
        ],
        'Photography': [
          `Your photography interest caught my eye! What's your favorite subject to capture?`,
          `I love that we both appreciate photography. Film or digital?`,
          `What's the story behind your most meaningful photograph?`
        ],
        'Music': [
          `Music connects us! What genre speaks to your soul?`,
          `I noticed we both love music. Any artists you've been obsessed with lately?`,
          `What's a song that instantly transports you to another place?`
        ],
        'Travel': [
          `Fellow wanderer! What's the most transformative place you've visited?`,
          `I love meeting other travel enthusiasts. What's next on your bucket list?`,
          `Solo travel or with companions? I'm curious about your travel style!`
        ],
        'Art': [
          `Art appreciation is such a beautiful trait! What medium speaks to you most?`,
          `I see we share a love for art. Any exhibitions that blew your mind recently?`,
          `What's a piece of art that made you feel something profound?`
        ],
        'Reading': [
          `A fellow bookworm! What genre is your guilty pleasure?`,
          `What book are you currently lost in?`,
          `Fiction or non-fiction? I'm always looking for recommendations!`
        ]
      };

      const starters_for_interest = interestStarters[interest as keyof typeof interestStarters];
      if (starters_for_interest) {
        const randomStarter = starters_for_interest[Math.floor(Math.random() * starters_for_interest.length)];
        starters.push({
          id: `interest-${interest}-${refreshKey}`,
          type: 'shared_interest',
          category: interest,
          starter: randomStarter,
          explanation: `You both love ${interest}`,
          icon: interest === 'Music' ? Music : interest === 'Photography' ? Camera : interest === 'Art' ? Palette : Book,
          confidence: 85
        });
      }
    });

    // Language practice based on level
    const languageStarters = {
      'A1': [
        `I see you're learning at A1 level! What's the most challenging part so far?`,
        `Beginning language learners inspire me! What motivated you to start?`,
        `A1 level takes courage! What's your favorite word you've learned so far?`
      ],
      'B1': [
        `B1 level is such an exciting stage! What's helping you progress the most?`,
        `I love that you're at B1 level. What's your biggest language learning breakthrough been?`,
        `Intermediate level opens so many doors! What's your favorite way to practice?`
      ],
      'B2': [
        `B2 level shows real dedication! What aspects of the language do you find most beautiful?`,
        `Upper-intermediate is impressive! Any language learning tips you swear by?`,
        `At B2, you must have some great stories. What's your funniest language mistake?`
      ],
      'C1': [
        `C1 level is amazing! What keeps you motivated at this advanced stage?`,
        `Your advanced level is inspiring. What's the most nuanced aspect you've mastered?`,
        `C1 proficiency opens up so much culture. What's your favorite discovery?`
      ]
    };

    const levelStarters = languageStarters[profile.languageLevel as keyof typeof languageStarters];
    if (levelStarters) {
      const randomStarter = levelStarters[Math.floor(Math.random() * levelStarters.length)];
      starters.push({
        id: `language-${profile.languageLevel}-${refreshKey}`,
        type: 'language_practice',
        category: 'Language Learning',
        starter: randomStarter,
        explanation: `Tailored for ${profile.languageLevel} level`,
        icon: MessageCircle,
        confidence: 80
      });
    }

    // Personality-based starters based on chat style
    const personalityStarters = {
      'introverted': [
        `I appreciate thoughtful conversation too. What's a topic you could discuss for hours?`,
        `Fellow deep thinker! What's something you've been pondering lately?`,
        `I value meaningful exchanges. What's a question that reveals someone's true nature?`
      ],
      'balanced': [
        `I love your balanced approach to conversation! What brings out your most animated side?`,
        `Balanced personalities are fascinating. What's your secret to reading the room?`,
        `You seem wonderfully adaptable. What's your favorite type of social setting?`
      ],
      'outgoing': [
        `Your outgoing energy is infectious! What's the best conversation you've had recently?`,
        `I love meeting vibrant people! What's your favorite way to connect with others?`,
        `Your social nature intrigues me. What's the most interesting person you've met?`
      ]
    };

    const styleStarters = personalityStarters[profile.chatStyle as keyof typeof personalityStarters];
    if (styleStarters) {
      const randomStarter = styleStarters[Math.floor(Math.random() * styleStarters.length)];
      starters.push({
        id: `personality-${profile.chatStyle}-${refreshKey}`,
        type: 'personality_match',
        category: 'Personality',
        starter: randomStarter,
        explanation: `Matches your ${profile.chatStyle} style`,
        icon: Heart,
        confidence: 75
      });
    }

    // Cultural exchange opportunities
    starters.push({
      id: `culture-exchange-${refreshKey}`,
      type: 'cultural_exchange',
      category: 'Culture',
      starter: `I'd love to learn about your culture! What's something unique about where you're from?`,
      explanation: 'Perfect for cultural exchange',
      icon: Sparkles,
      confidence: 70
    });

    // Bio-based starters
    if (profile.bio) {
      const bioKeywords = profile.bio.toLowerCase();
      if (bioKeywords.includes('meaningful')) {
        starters.push({
          id: `bio-meaningful-${refreshKey}`,
          type: 'personality_match',
          category: 'Values',
          starter: `I see you value meaningful connections too. What makes a conversation truly meaningful to you?`,
          explanation: 'Based on their bio emphasis on meaning',
          icon: Heart,
          confidence: 92
        });
      }
      
      if (bioKeywords.includes('deep')) {
        starters.push({
          id: `bio-deep-${refreshKey}`,
          type: 'personality_match',
          category: 'Depth',
          starter: `I appreciate your love for deep conversations. What's a topic that always leads to profound discussions?`,
          explanation: 'Matches their preference for depth',
          icon: Lightbulb,
          confidence: 90
        });
      }
    }

    // Sort by confidence score
    return starters.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
  };

  const starters = generateStarters();
  const categories = ['all', ...Array.from(new Set(starters.map(s => s.category)))];
  
  const filteredStarters = selectedCategory === 'all' 
    ? starters 
    : starters.filter(s => s.category === selectedCategory);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 80) return 'text-blue-600 bg-blue-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <Card className="w-full max-w-sm mx-auto max-h-[85vh] overflow-hidden" ref={modalRef}>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles size={18} className="text-primary" />
              Smart Starters
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="h-7 w-7 p-0"
              >
                <RefreshCw size={14} />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-7 w-7 p-0"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            AI-generated starters for {profile.name}
          </p>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
          <CardContent className="space-y-3 p-4 pb-6">
            {/* Category filters */}
            <div className="flex flex-wrap gap-1">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="h-6 px-2 text-xs capitalize"
                >
                  {category === 'all' ? 'All' : category}
                </Button>
              ))}
            </div>

            {/* Conversation starters */}
            <div className="space-y-2">
              {filteredStarters.map((starter) => {
                const IconComponent = starter.icon;
                return (
                  <Card key={starter.id} className="border hover:shadow-md hover:border-primary/20 transition-all duration-200">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <IconComponent size={12} className="text-primary" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              {starter.category}
                            </Badge>
                            <Badge 
                              className={`text-xs px-1 py-0 ${getConfidenceColor(starter.confidence)}`}
                            >
                              {starter.confidence}%
                            </Badge>
                          </div>
                          
                          <p className="text-sm font-medium mb-1 line-clamp-2">
                            {starter.starter}
                          </p>
                          
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                            {starter.explanation}
                          </p>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectStarter(starter.starter)}
                            className="h-6 px-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Send size={10} className="mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default SmartConversationStarters;
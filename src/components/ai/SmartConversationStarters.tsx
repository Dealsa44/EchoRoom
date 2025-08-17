import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Brain, 
  Heart, 
  Coffee, 
  BookOpen, 
  Music, 
  Camera, 
  Globe, 
  Lightbulb,
  MessageCircle,
  RefreshCw,
  Star
} from 'lucide-react';
import { Profile } from '@/types';

interface ConversationStarter {
  id: string;
  category: 'icebreaker' | 'deep' | 'playful' | 'shared-interest' | 'philosophical' | 'creative';
  text: string;
  reasoning: string;
  confidence: number; // 0-100
  personalizedFor: string[];
}

interface SmartConversationStartersProps {
  targetProfile: Profile;
  currentUserInterests: string[];
  onSelectStarter: (starter: string) => void;
}

const SmartConversationStarters = ({ 
  targetProfile, 
  currentUserInterests, 
  onSelectStarter 
}: SmartConversationStartersProps) => {
  const [starters, setStarters] = useState<ConversationStarter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Generate personalized conversation starters
  const generateStarters = useCallback((): ConversationStarter[] => {
    const sharedInterests = targetProfile.interests.filter(interest => 
      currentUserInterests.some(userInterest => 
        userInterest.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(userInterest.toLowerCase())
      )
    );

    const starters: ConversationStarter[] = [];

    // Icebreaker starters
    starters.push(
      {
        id: 'ice1',
        category: 'icebreaker',
        text: `Hi ${targetProfile.name}! I noticed you're ${targetProfile.age} and from ${targetProfile.location.split(',')[0]}. What's the best thing about living there?`,
        reasoning: 'Personal but not intrusive, shows you read their profile',
        confidence: 85,
        personalizedFor: ['location', 'age']
      },
      {
        id: 'ice2', 
        category: 'icebreaker',
        text: `Hello! Your profile caught my attention. What's one thing that always makes you smile?`,
        reasoning: 'Positive and open-ended, encourages sharing happy thoughts',
        confidence: 90,
        personalizedFor: ['general']
      }
    );

    // Shared interest starters
    if (sharedInterests.length > 0) {
      sharedInterests.forEach((interest, index) => {
        starters.push({
          id: `shared${index}`,
          category: 'shared-interest',
          text: `I see we both love ${interest}! What got you into it?`,
          reasoning: `You both share an interest in ${interest} - perfect conversation bridge`,
          confidence: 95,
          personalizedFor: [interest]
        });
      });
    }

    // Interest-specific starters based on their profile
    targetProfile.interests.forEach((interest, index) => {
      const interestStarters = getInterestSpecificStarters(interest, targetProfile.name);
      starters.push(...interestStarters.map((starter, starterIndex) => ({
        ...starter,
        id: `interest${index}_${starterIndex}`,
      })));
    });

    // Deep conversation starters
    starters.push(
      {
        id: 'deep1',
        category: 'philosophical',
        text: `What's something you've learned recently that changed your perspective?`,
        reasoning: 'Encourages sharing personal growth and meaningful experiences',
        confidence: 75,
        personalizedFor: ['general']
      },
      {
        id: 'deep2',
        category: 'philosophical', 
        text: `If you could have dinner with anyone from history, who would it be and why?`,
        reasoning: 'Classic but effective - reveals values and interests',
        confidence: 80,
        personalizedFor: ['general']
      }
    );

    // Playful starters
    starters.push(
      {
        id: 'play1',
        category: 'playful',
        text: `Quick question: coffee or tea? And please tell me there's a fascinating story behind your choice! ☕`,
        reasoning: 'Light-hearted with room for storytelling',
        confidence: 85,
        personalizedFor: ['general']
      },
      {
        id: 'play2',
        category: 'playful',
        text: `I'm conducting very important research: what's your go-to comfort food when you need cheering up?`,
        reasoning: 'Playful tone while learning about their preferences',
        confidence: 88,
        personalizedFor: ['general']
      }
    );

    // Creative starters
    starters.push(
      {
        id: 'creative1',
        category: 'creative',
        text: `If your life was a book, what would the current chapter be titled?`,
        reasoning: 'Creative and introspective, reveals current life situation',
        confidence: 78,
        personalizedFor: ['general']
      },
      {
        id: 'creative2',
        category: 'creative',
        text: `What's something you're passionate about that most people don't know much about?`,
        reasoning: 'Gives them a chance to share something unique and personal',
        confidence: 82,
        personalizedFor: ['general']
      }
    );

    // Profile-specific starters based on bio
    if (targetProfile.bio.toLowerCase().includes('travel')) {
      starters.push({
        id: 'travel1',
        category: 'shared-interest',
        text: `I see you love traveling! What's the most unexpected thing you've discovered in your travels?`,
        reasoning: 'References their bio and asks for a unique story',
        confidence: 92,
        personalizedFor: ['travel']
      });
    }

    if (targetProfile.bio.toLowerCase().includes('book')) {
      starters.push({
        id: 'books1',
        category: 'shared-interest',
        text: `Fellow book lover! What's a book that completely surprised you?`,
        reasoning: 'Connects over shared love of reading',
        confidence: 90,
        personalizedFor: ['books']
      });
    }

    // Relationship intent based starters
    if (targetProfile.lookingForRelationship) {
      starters.push({
        id: 'relationship1',
        category: 'deep',
        text: `What does a perfect day look like to you?`,
        reasoning: 'Helps understand their lifestyle and values for relationship compatibility',
        confidence: 83,
        personalizedFor: ['relationship']
      });
    } else {
      starters.push({
        id: 'friendship1',
        category: 'playful',
        text: `What's the most interesting thing you've learned lately?`,
        reasoning: 'Great for building friendship connections',
        confidence: 85,
        personalizedFor: ['friendship']
      });
    }

    return starters.sort((a, b) => b.confidence - a.confidence);
  }, [targetProfile, currentUserInterests]);

  const getInterestSpecificStarters = (interest: string, name: string): Omit<ConversationStarter, 'id'>[] => {
    const lowerInterest = interest.toLowerCase();
    
    if (lowerInterest.includes('philosophy')) {
      return [{
        category: 'philosophical',
        text: `I noticed you're into philosophy! What philosophical idea has influenced your life the most?`,
        reasoning: 'Deep conversation starter for philosophy enthusiasts',
        confidence: 88,
        personalizedFor: [interest]
      }];
    }
    
    if (lowerInterest.includes('music')) {
      return [{
        category: 'shared-interest', 
        text: `Music lover! What song can you play on repeat and never get tired of?`,
        reasoning: 'Music creates emotional connections',
        confidence: 87,
        personalizedFor: [interest]
      }];
    }
    
    if (lowerInterest.includes('art')) {
      return [{
        category: 'creative',
        text: `I see you appreciate art! Do you create or just enjoy experiencing it?`,
        reasoning: 'Opens discussion about their relationship with art',
        confidence: 85,
        personalizedFor: [interest]
      }];
    }
    
    if (lowerInterest.includes('fitness') || lowerInterest.includes('sport')) {
      return [{
        category: 'playful',
        text: `Fellow fitness enthusiast! What's your favorite way to stay active?`,
        reasoning: 'Connects over shared health interests',
        confidence: 84,
        personalizedFor: [interest]
      }];
    }
    
    if (lowerInterest.includes('cooking') || lowerInterest.includes('food')) {
      return [{
        category: 'playful',
        text: `I see you're into ${interest}! What's your signature dish or favorite cuisine?`,
        reasoning: 'Food is a universal connector',
        confidence: 89,
        personalizedFor: [interest]
      }];
    }
    
    if (lowerInterest.includes('nature') || lowerInterest.includes('hiking')) {
      return [{
        category: 'shared-interest',
        text: `Nature lover! What's your favorite outdoor spot or activity?`,
        reasoning: 'Great for planning future activities together',
        confidence: 86,
        personalizedFor: [interest]
      }];
    }

    // Default interest starter
    return [{
      category: 'shared-interest',
      text: `I noticed you're interested in ${interest}. What drew you to it?`,
      reasoning: `Shows genuine interest in their ${interest} hobby`,
      confidence: 75,
      personalizedFor: [interest]
    }];
  };

  useEffect(() => {
    setLoading(true);
    // Simulate AI processing time
    const timer = setTimeout(() => {
      const generatedStarters = generateStarters();
      setStarters(generatedStarters);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [targetProfile, currentUserInterests, generateStarters]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'icebreaker': return <Coffee className="h-4 w-4" />;
      case 'deep': return <Brain className="h-4 w-4" />;
      case 'playful': return <Heart className="h-4 w-4" />;
      case 'shared-interest': return <Star className="h-4 w-4" />;
      case 'philosophical': return <BookOpen className="h-4 w-4" />;
      case 'creative': return <Camera className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'icebreaker': return 'bg-blue-100 text-blue-800';
      case 'deep': return 'bg-purple-100 text-purple-800';
      case 'playful': return 'bg-pink-100 text-pink-800';
      case 'shared-interest': return 'bg-green-100 text-green-800';
      case 'philosophical': return 'bg-indigo-100 text-indigo-800';
      case 'creative': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStarters = selectedCategory === 'all' 
    ? starters 
    : starters.filter(starter => starter.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All', icon: Globe },
    { value: 'icebreaker', label: 'Icebreakers', icon: Coffee },
    { value: 'shared-interest', label: 'Shared', icon: Star },
    { value: 'playful', label: 'Playful', icon: Heart },
    { value: 'philosophical', label: 'Deep', icon: Brain },
    { value: 'creative', label: 'Creative', icon: Camera }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">
            Analyzing {targetProfile.name}'s profile to generate personalized conversation starters...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Smart Conversation Starters
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-generated conversation starters based on {targetProfile.name}'s profile and your shared interests
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={selectedCategory === value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(value)}
              className="text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Starters List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredStarters.slice(0, 8).map((starter) => (
            <Card key={starter.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getCategoryColor(starter.category)}`}
                  >
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(starter.category)}
                      <span className="capitalize">{starter.category.replace('-', ' ')}</span>
                    </div>
                  </Badge>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${
                            i < Math.round(starter.confidence / 20) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {starter.confidence}%
                    </span>
                  </div>
                </div>

                <p className="text-sm mb-2 leading-relaxed">{starter.text}</p>
                
                <p className="text-xs text-muted-foreground mb-3 italic">
                  💡 {starter.reasoning}
                </p>

                {starter.personalizedFor.length > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <Lightbulb className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">
                      Personalized for: {starter.personalizedFor.join(', ')}
                    </span>
                  </div>
                )}

                <Button 
                  size="sm" 
                  onClick={() => onSelectStarter(starter.text)}
                  className="w-full"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Use This Starter
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStarters.length === 0 && (
          <div className="text-center py-6">
            <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No starters found for this category. Try a different filter!
            </p>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {Math.min(8, filteredStarters.length)} of {filteredStarters.length} suggestions
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setStarters(generateStarters());
                setLoading(false);
              }, 800);
            }}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartConversationStarters;
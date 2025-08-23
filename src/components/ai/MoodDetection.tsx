import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Smile, 
  Frown, 
  Meh, 
  Zap, 
  Brain,
  TrendingUp,
  Calendar,
  Clock,
  Lightbulb,
  MessageCircle,
  Music,
  Coffee,
  Sun,
  Moon,
  CloudRain
} from 'lucide-react';

interface MoodData {
  primary: string;
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
  energy: number;
  positivity: number;
  stress: number;
  engagement: number;
}

interface MoodHistory {
  timestamp: Date;
  mood: string;
  confidence: number;
  context: string;
  trigger?: string;
}

interface PersonalizedRecommendation {
  id: string;
  type: 'activity' | 'conversation' | 'learning' | 'wellness' | 'social';
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  confidence: number;
  reason: string;
}

interface MoodDetectionProps {
  messages: string[];
  isActive: boolean;
}

const MoodDetection: React.FC<MoodDetectionProps> = ({ messages, isActive }) => {
  const [currentMood, setCurrentMood] = useState<MoodData>({
    primary: 'neutral',
    confidence: 0,
    emotions: {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      trust: 0,
      anticipation: 0
    },
    energy: 50,
    positivity: 50,
    stress: 20,
    engagement: 70
  });

  const [moodHistory, setMoodHistory] = useState<MoodHistory[]>([
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      mood: 'excited',
      confidence: 87,
      context: 'language learning discussion',
      trigger: 'achievement sharing'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      mood: 'curious',
      confidence: 92,
      context: 'philosophy conversation',
      trigger: 'deep question asked'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      mood: 'supportive',
      confidence: 89,
      context: 'helping another user',
      trigger: 'empathy expression'
    }
  ]);

  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMood = useCallback(async (messageList: string[]) => {
    setIsAnalyzing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const recentMessages = messageList.slice(-5).join(' ').toLowerCase();
    const moodData = await performSentimentAnalysis(recentMessages);
    
    setCurrentMood(moodData);
    
    // Add to history if mood changed significantly
    if (Math.abs(moodData.confidence - currentMood.confidence) > 20 || moodData.primary !== currentMood.primary) {
      const historyEntry: MoodHistory = {
        timestamp: new Date(),
        mood: moodData.primary,
        confidence: moodData.confidence,
        context: detectContext(recentMessages),
        trigger: detectTrigger(recentMessages)
      };
      
      setMoodHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    }
    
    setIsAnalyzing(false);
  }, [currentMood]);

  useEffect(() => {
    if (isActive && messages.length > 0) {
      analyzeMood(messages);
    }
  }, [messages, isActive, analyzeMood]);

  useEffect(() => {
    if (currentMood.primary !== 'neutral') {
      generateRecommendations(currentMood);
    }
  }, [currentMood]);

  const performSentimentAnalysis = async (text: string): Promise<MoodData> => {
    // Simulate advanced mood analysis
    const positiveWords = ['happy', 'great', 'amazing', 'wonderful', 'excited', 'love', 'awesome', 'fantastic', 'brilliant', 'perfect'];
    const negativeWords = ['sad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'disappointed', 'worried', 'stressed', 'difficult'];
    const energeticWords = ['excited', 'pumped', 'energized', 'motivated', 'enthusiastic', 'passionate', 'dynamic'];
    const calmWords = ['peaceful', 'relaxed', 'calm', 'serene', 'tranquil', 'content', 'satisfied'];
    const curiousWords = ['interesting', 'curious', 'wonder', 'question', 'explore', 'discover', 'learn'];
    const supportiveWords = ['help', 'support', 'care', 'understand', 'empathy', 'comfort', 'encourage'];

    let joy = 0, sadness = 0, surprise = 0, trust = 0, anticipation = 0;
    const anger = 0, fear = 0;
    let energy = 50, positivity = 50, stress = 20, engagement = 70;
    let primaryMood = 'neutral';
    let confidence = 0;

    // Analyze word presence and context
    positiveWords.forEach(word => {
      if (text.includes(word)) {
        joy += 15;
        positivity += 10;
        energy += 5;
      }
    });

    negativeWords.forEach(word => {
      if (text.includes(word)) {
        sadness += 15;
        positivity -= 10;
        stress += 10;
      }
    });

    energeticWords.forEach(word => {
      if (text.includes(word)) {
        energy += 20;
        anticipation += 10;
        engagement += 15;
      }
    });

    calmWords.forEach(word => {
      if (text.includes(word)) {
        energy -= 10;
        stress -= 15;
        trust += 10;
      }
    });

    curiousWords.forEach(word => {
      if (text.includes(word)) {
        surprise += 10;
        anticipation += 15;
        engagement += 20;
      }
    });

    supportiveWords.forEach(word => {
      if (text.includes(word)) {
        trust += 20;
        joy += 10;
        engagement += 10;
      }
    });

    // Determine primary mood
    const emotions = { joy, sadness, anger, fear, surprise, trust, anticipation };
    const maxEmotion = Object.entries(emotions).reduce((a, b) => emotions[a[0] as keyof typeof emotions] > emotions[b[0] as keyof typeof emotions] ? a : b);
    
    if (maxEmotion[1] > 20) {
      primaryMood = maxEmotion[0];
      confidence = Math.min(maxEmotion[1] + 30, 95);
    } else if (energy > 70) {
      primaryMood = 'energetic';
      confidence = 75;
    } else if (engagement > 80) {
      primaryMood = 'engaged';
      confidence = 80;
    } else if (stress > 60) {
      primaryMood = 'stressed';
      confidence = 70;
    }

    // Normalize values
    energy = Math.max(0, Math.min(100, energy));
    positivity = Math.max(0, Math.min(100, positivity));
    stress = Math.max(0, Math.min(100, stress));
    engagement = Math.max(0, Math.min(100, engagement));

    return {
      primary: primaryMood,
      confidence,
      emotions: {
        joy: Math.min(joy, 100),
        sadness: Math.min(sadness, 100),
        anger: Math.min(anger, 100),
        fear: Math.min(fear, 100),
        surprise: Math.min(surprise, 100),
        disgust: 0,
        trust: Math.min(trust, 100),
        anticipation: Math.min(anticipation, 100)
      },
      energy,
      positivity,
      stress,
      engagement
    };
  };

  const detectContext = (text: string): string => {
    if (text.includes('learn') || text.includes('language') || text.includes('practice')) return 'language learning';
    if (text.includes('philosophy') || text.includes('think') || text.includes('meaning')) return 'philosophical discussion';
    if (text.includes('help') || text.includes('support') || text.includes('advice')) return 'seeking/offering help';
    if (text.includes('travel') || text.includes('culture') || text.includes('country')) return 'cultural exchange';
    return 'general conversation';
  };

  const detectTrigger = (text: string): string | undefined => {
    if (text.includes('achievement') || text.includes('success') || text.includes('accomplished')) return 'achievement sharing';
    if (text.includes('question') || text.includes('?')) return 'curiosity expression';
    if (text.includes('understand') || text.includes('feel')) return 'empathy expression';
    if (text.includes('excited') || text.includes('amazing')) return 'enthusiasm expression';
    return undefined;
  };

  const generateRecommendations = async (mood: MoodData) => {
    const recs: PersonalizedRecommendation[] = [];

    // Mood-based recommendations
    if (mood.primary === 'joy' || mood.positivity > 70) {
      recs.push({
        id: '1',
        type: 'social',
        title: 'Share Your Joy',
        description: 'Your positive energy is contagious! Consider sharing an encouraging message in a group chat.',
        icon: Heart,
        confidence: 85,
        reason: 'High positivity detected'
      });
    }

    if (mood.primary === 'curious' || mood.emotions.surprise > 60) {
      recs.push({
        id: '2',
        type: 'learning',
        title: 'Explore New Topics',
        description: 'Your curiosity is peaked! This might be a great time to dive into a new language lesson or cultural topic.',
        icon: Lightbulb,
        confidence: 90,
        reason: 'High curiosity and engagement'
      });
    }

    if (mood.stress > 60 || mood.primary === 'sadness') {
      recs.push({
        id: '3',
        type: 'wellness',
        title: 'Take a Mindful Break',
        description: 'Consider stepping back for a moment. Try a brief meditation or listen to calming music.',
        icon: Coffee,
        confidence: 88,
        reason: 'Elevated stress levels detected'
      });
    }

    if (mood.energy > 80) {
      recs.push({
        id: '4',
        type: 'activity',
        title: 'Channel Your Energy',
        description: 'You seem energized! This could be perfect for tackling challenging language exercises or leading a discussion.',
        icon: Zap,
        confidence: 82,
        reason: 'High energy levels'
      });
    }

    if (mood.engagement > 80) {
      recs.push({
        id: '5',
        type: 'conversation',
        title: 'Deep Dive Discussion',
        description: 'You\'re highly engaged! Consider starting a meaningful conversation about topics you\'re passionate about.',
        icon: MessageCircle,
        confidence: 87,
        reason: 'High engagement detected'
      });
    }

    // Time-based recommendations
    const hour = new Date().getHours();
    if (hour < 12 && mood.energy > 60) {
      recs.push({
        id: '6',
        type: 'learning',
        title: 'Morning Learning Session',
        description: 'Your morning energy is great for focused learning. Try some vocabulary practice!',
        icon: Sun,
        confidence: 75,
        reason: 'Morning energy optimization'
      });
    } else if (hour > 18 && mood.positivity > 60) {
      recs.push({
        id: '7',
        type: 'social',
        title: 'Evening Social Time',
        description: 'Perfect time for relaxed conversations and connecting with language partners.',
        icon: Moon,
        confidence: 78,
        reason: 'Evening social optimization'
      });
    }

    setRecommendations(recs.slice(0, 4));
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'joy': return <Smile className="text-green-500" />;
      case 'sadness': return <Frown className="text-blue-500" />;
      case 'anger': return <Frown className="text-red-500" />;
      case 'fear': return <Frown className="text-purple-500" />;
      case 'surprise': return <Zap className="text-yellow-500" />;
      case 'trust': return <Heart className="text-pink-500" />;
      case 'anticipation': return <TrendingUp className="text-orange-500" />;
      case 'curious': return <Lightbulb className="text-blue-400" />;
      case 'energetic': return <Zap className="text-orange-400" />;
      case 'engaged': return <MessageCircle className="text-green-400" />;
      case 'stressed': return <CloudRain className="text-gray-500" />;
      default: return <Meh className="text-gray-400" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'joy': return 'bg-green-100 text-green-800';
      case 'sadness': return 'bg-blue-100 text-blue-800';
      case 'curious': return 'bg-blue-100 text-blue-800';
      case 'energetic': return 'bg-orange-100 text-orange-800';
      case 'engaged': return 'bg-green-100 text-green-800';
      case 'stressed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isActive) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="text-purple-600" />
        <h2 className="text-xl font-bold">Mood & Wellness Insights</h2>
        {isAnalyzing && (
          <Badge variant="secondary" className="animate-pulse">
            Analyzing...
          </Badge>
        )}
      </div>

      {/* Current Mood */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getMoodIcon(currentMood.primary)}
              Current Mood
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge className={`text-lg px-4 py-2 ${getMoodColor(currentMood.primary)}`}>
                {currentMood.primary.charAt(0).toUpperCase() + currentMood.primary.slice(1)}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {currentMood.confidence}% confidence
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Energy</span>
                  <span>{currentMood.energy}%</span>
                </div>
                <Progress value={currentMood.energy} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Positivity</span>
                  <span>{currentMood.positivity}%</span>
                </div>
                <Progress value={currentMood.positivity} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Engagement</span>
                  <span>{currentMood.engagement}%</span>
                </div>
                <Progress value={currentMood.engagement} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Continue chatting to receive personalized recommendations
              </p>
            ) : (
              <div className="space-y-3">
                {recommendations.map(rec => {
                  const IconComponent = rec.icon;
                  return (
                    <div key={rec.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <IconComponent size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {rec.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {rec.confidence}% match
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mood History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Mood History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {moodHistory.map((entry, index) => (
              <div key={index} className="flex items-center gap-4 p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2">
                  {getMoodIcon(entry.mood)}
                  <Badge className={`text-xs ${getMoodColor(entry.mood)}`}>
                    {entry.mood}
                  </Badge>
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium">{entry.context}</p>
                  {entry.trigger && (
                    <p className="text-xs text-muted-foreground">Triggered by: {entry.trigger}</p>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <Clock size={12} className="inline mr-1" />
                  {entry.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodDetection;
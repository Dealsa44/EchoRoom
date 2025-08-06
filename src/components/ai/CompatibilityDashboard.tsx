import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Brain, 
  Users, 
  TrendingUp, 
  Clock,
  Sparkles,
  Target,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { 
  ConversationMetrics, 
  CompatibilityInsight, 
  simulateConversationAnalysis,
  getConversationSuggestions
} from '@/lib/conversationAnalysis';

interface CompatibilityDashboardProps {
  partnerId: string;
  partnerName: string;
  isOpen: boolean;
  onClose: () => void;
}

const CompatibilityDashboard = ({ partnerId, partnerName, isOpen, onClose }: CompatibilityDashboardProps) => {
  const [metrics, setMetrics] = useState<ConversationMetrics | null>(null);
  const [insights, setInsights] = useState<CompatibilityInsight[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate loading delay
      const timer = setTimeout(() => {
        const analysis = simulateConversationAnalysis(partnerId);
        setMetrics(analysis.metrics);
        setInsights(analysis.insights);
        
        const mockSuggestions = getConversationSuggestions(
          ["I'm fascinated by Eastern philosophy too - Buddhism, Taoism. The concept of mindful living"],
          { interests: ['philosophy', 'mindfulness', 'books'] }
        );
        setSuggestions(mockSuggestions);
        setLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, partnerId]);

  if (!isOpen || !metrics) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getCommunicationIcon = (style: string) => {
    switch (style) {
      case 'deep': return <Brain className="h-4 w-4" />;
      case 'playful': return <Sparkles className="h-4 w-4" />;
      case 'formal': return <Target className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getEmotionalToneEmoji = (tone: string) => {
    switch (tone) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      case 'mixed': return '🤔';
      default: return '😐';
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm mx-auto rounded-xl">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <h3 className="font-semibold mb-2">Analyzing Compatibility</h3>
            <p className="text-sm text-muted-foreground">
              Processing your conversation patterns and shared interests...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm mx-auto max-h-[85vh] overflow-hidden rounded-xl">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Compatibility Analysis
          </DialogTitle>
          <DialogDescription>
            AI-powered insights about your connection with {partnerName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] space-y-4">
          {/* Compatibility Score */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBg(metrics.compatibilityScore)} mb-2`}>
              <span className={`text-2xl font-bold ${getScoreColor(metrics.compatibilityScore)}`}>
                {metrics.compatibilityScore}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Overall Compatibility</p>
          </div>

          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-semibold">{metrics.messageCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold">{metrics.sharedInterests.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Shared Interests</p>
              </div>
            </div>

            {/* Communication Style */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCommunicationIcon(metrics.communicationStyle)}
                    <span className="font-medium">Communication Style</span>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {metrics.communicationStyle}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Emotional Tone</span>
                    <div className="flex items-center gap-1">
                      <span>{getEmotionalToneEmoji(metrics.emotionalTone)}</span>
                      <span className="capitalize">{metrics.emotionalTone}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Engagement Level</span>
                    <div className="flex items-center gap-2">
                      <Progress value={metrics.engagementLevel * 100} className="w-16 h-2" />
                      <span>{Math.round(metrics.engagementLevel * 100)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Topic Diversity</span>
                    <div className="flex items-center gap-2">
                      <Progress value={metrics.topicDiversity * 100} className="w-16 h-2" />
                      <span>{Math.round(metrics.topicDiversity * 100)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shared Interests */}
            {metrics.sharedInterests.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Shared Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {metrics.sharedInterests.map((interest) => (
                      <Badge key={interest} variant="outline" className="capitalize">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compatibility Insights */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Detailed Compatibility Analysis
              </h4>
              
              {insights.map((insight, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{insight.category}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={insight.score} className="w-20 h-2" />
                        <span className={`font-semibold ${getScoreColor(insight.score)}`}>
                          {insight.score}%
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    
                    {insight.evidence.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Evidence:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {insight.evidence.map((evidence, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                              {evidence}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {insight.suggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Suggestions:</p>
                        <ul className="text-xs space-y-1">
                          {insight.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Conversation Suggestions */}
            {suggestions.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Conversation Suggestions
                  </h4>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                        <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Response Time */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Average Response Time</span>
                  </div>
                  <span className="text-sm">
                    {metrics.averageResponseTime < 60 
                      ? `${Math.round(metrics.averageResponseTime)}s`
                      : metrics.averageResponseTime < 3600
                      ? `${Math.round(metrics.averageResponseTime / 60)}m`
                      : `${Math.round(metrics.averageResponseTime / 3600)}h`
                    }
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.averageResponseTime < 300 
                    ? "Very responsive conversation flow!" 
                    : metrics.averageResponseTime < 1800
                    ? "Good conversation pace"
                    : "Take your time - quality over speed!"
                  }
                </p>
              </CardContent>
            </Card>

            <Separator />

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-3">
                This analysis is based on your conversation patterns and is updated in real-time.
              </p>
              <Button onClick={onClose} className="w-full">
                Continue Conversation
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompatibilityDashboard;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BookOpen, CheckCircle, Target, Award, Mic, Headphones, PenTool, Eye, Brain, Zap, Lightbulb, MessageCircle, Star } from 'lucide-react';
import { useLanguageAI } from '@/hooks/useLanguageAI';

interface LanguageProgressCardProps {
  language: string;
  level: string;
  progressPercentage: number;
  correctionsReceived: number;
  wordsLearned: number;
  conversationsInLanguage: number;
  currentStreak: number;
  commonMistakes: string[];
  recentAchievements: string[];
}

const LanguageProgressCard = ({
  language,
  level,
  progressPercentage,
  correctionsReceived,
  wordsLearned,
  conversationsInLanguage,
  currentStreak,
  commonMistakes,
  recentAchievements
}: LanguageProgressCardProps) => {
  const {
    speakingConfidence,
    listeningComprehension,
    writingAccuracy,
    readingSpeed,
    getVocabularyProgress,
    getGrammarProgress,
    getLearningInsights,
    simulateVocabularySuggestion,
    simulateConversationStarter
  } = useLanguageAI();

  const getLevelColor = (level: string) => {
    const colors = {
      'a1': 'bg-red-100 text-red-800',
      'a2': 'bg-orange-100 text-orange-800',
      'b1': 'bg-yellow-100 text-yellow-800',
      'b2': 'bg-green-100 text-green-800',
      'c1': 'bg-blue-100 text-blue-800',
      'c2': 'bg-purple-100 text-purple-800'
    };
    return colors[level.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const vocabProgress = getVocabularyProgress();
  const grammarProgress = getGrammarProgress();
  const insights = getLearningInsights();

  const handleGetVocabularySuggestions = () => {
    const topics = ['greeting', 'emotions', 'food', 'travel', 'work', 'family', 'weather', 'technology'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const suggestions = simulateVocabularySuggestion(randomTopic);
    
    // In a real app, this would show suggestions in the UI
    console.log(`Vocabulary suggestions for ${randomTopic}:`, suggestions);
  };

  const handleGetConversationStarters = () => {
    const topics = ['hobbies', 'food', 'travel', 'work', 'family'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    // Map level to CEFR format
    const getCEFRLevel = (level: string): 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' => {
      const levelLower = level.toLowerCase();
      if (levelLower === 'a1' || levelLower === 'a2') return levelLower as 'a1' | 'a2';
      if (levelLower === 'b1' || levelLower === 'b2') return levelLower as 'b1' | 'b2';
      if (levelLower === 'c1' || levelLower === 'c2') return levelLower as 'c1' | 'c2';
      // Default mapping for non-CEFR levels
      if (levelLower.includes('beginner')) return 'a1';
      if (levelLower.includes('intermediate')) return 'b1';
      if (levelLower.includes('advanced')) return 'c1';
      return 'a1'; // fallback
    };
    
    const starters = simulateConversationStarter(randomTopic, getCEFRLevel(level));
    
    // In a real app, this would show conversation starters in the UI
    console.log(`Conversation starters for ${randomTopic}:`, starters);
  };

  const handleQuickPractice = (skill: 'speaking' | 'listening' | 'writing' | 'reading') => {
    const practiceMessages = {
      speaking: "Try speaking out loud for 2 minutes about your day.",
      listening: "Listen to a short podcast or video in your target language.",
      writing: "Write 3 sentences about your favorite hobby.",
      reading: "Read a short article or story in your target language."
    };
    
    console.log(`${skill.charAt(0).toUpperCase() + skill.slice(1)} practice:`, practiceMessages[skill]);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌍</span>
            <span className="text-lg font-semibold">{language}</span>
          </div>
          <Badge className={getLevelColor(level)}>
            {level.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Level Progress</span>
                <span className="text-muted-foreground">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-lg font-semibold">{correctionsReceived}</div>
                <div className="text-xs text-muted-foreground">Corrections</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-lg font-semibold">{vocabProgress.total}</div>
                <div className="text-xs text-muted-foreground">Words Learned</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Target className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-lg font-semibold">{conversationsInLanguage}</div>
                <div className="text-xs text-muted-foreground">Conversations</div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-lg font-semibold">{currentStreak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handleGetVocabularySuggestions}
              >
                <BookOpen className="w-3 h-3 mr-1" />
                Get Words
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handleGetConversationStarters}
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Start Chat
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {/* Skill Progress */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Speaking</span>
                <Badge variant="secondary" className="ml-auto text-xs">{speakingConfidence}%</Badge>
              </div>
              <Progress value={speakingConfidence} className="h-2" />
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs w-full"
                onClick={() => handleQuickPractice('speaking')}
              >
                <Mic className="w-3 h-3 mr-1" />
                Practice Speaking
              </Button>

              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Listening</span>
                <Badge variant="secondary" className="ml-auto text-xs">{listeningComprehension}%</Badge>
              </div>
              <Progress value={listeningComprehension} className="h-2" />
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs w-full"
                onClick={() => handleQuickPractice('listening')}
              >
                <Headphones className="w-3 h-3 mr-1" />
                Practice Listening
              </Button>

              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Writing</span>
                <Badge variant="secondary" className="ml-auto text-xs">{writingAccuracy}%</Badge>
              </div>
              <Progress value={writingAccuracy} className="h-2" />
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs w-full"
                onClick={() => handleQuickPractice('writing')}
              >
                <PenTool className="w-3 h-3 mr-1" />
                Practice Writing
              </Button>

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Reading</span>
                <Badge variant="secondary" className="ml-auto text-xs">{readingSpeed}%</Badge>
              </div>
              <Progress value={readingSpeed} className="h-2" />
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs w-full"
                onClick={() => handleQuickPractice('reading')}
              >
                <Eye className="w-3 h-3 mr-1" />
                Practice Reading
              </Button>
            </div>

            {/* Vocabulary Progress */}
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Vocabulary Progress</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold">{vocabProgress.total}</div>
                  <div className="text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{vocabProgress.mastered}</div>
                  <div className="text-muted-foreground">Mastered</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{vocabProgress.learning}</div>
                  <div className="text-muted-foreground">Learning</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{vocabProgress.new}</div>
                  <div className="text-muted-foreground">New</div>
                </div>
              </div>
            </div>

            {/* Grammar Progress */}
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Grammar Progress</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Rules Mastered</span>
                  <span>{grammarProgress.masteredRules}/{grammarProgress.totalRules}</span>
                </div>
                <Progress value={(grammarProgress.masteredRules / grammarProgress.totalRules) * 100} className="h-2" />
              </div>
            </div>

            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Award className="w-4 h-4 text-yellow-500" />
                  Recent Achievements
                </div>
                <div className="space-y-1">
                  {recentAchievements.slice(0, 3).map((achievement, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Common Mistakes */}
            {commonMistakes.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Areas to Practice</div>
                <div className="space-y-1">
                  {commonMistakes.slice(0, 3).map((mistake, index) => (
                    <div key={index} className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
                      {mistake}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Insights */}
            {insights.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Your Strengths
                </h4>
                <ul className="space-y-1">
                  {insights.strengths.slice(0, 2).map((strength, index) => (
                    <li key={index} className="text-xs text-green-700 flex items-center gap-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-600 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {insights.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index} className="text-xs text-blue-700 flex items-center gap-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LanguageProgressCard;
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Languages, BookOpen, Target, TrendingUp, Award, Mic, Headphones, PenTool, Eye, Brain, Zap, Lightbulb, MessageCircle } from 'lucide-react';
import { useLanguageAI } from '@/contexts/LanguageAIContext';
import { toast } from '@/hooks/use-toast';

interface LanguagePracticePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguagePracticePanel = ({ isOpen, onClose }: LanguagePracticePanelProps) => {
  const {
    learningLanguage,
    setLearningLanguage,
    languageLevel,
    setLanguageLevel,
    practiceMode,
    setPracticeMode,
    getLanguageDisplayName,
    getLevelDisplayName,
    isLearningModeActive,
    autoCorrect,
    setAutoCorrect,
    grammarCheckEnabled,
    setGrammarCheckEnabled,
    translationEnabled,
    setTranslationEnabled,
    speakingConfidence,
    listeningComprehension,
    writingAccuracy,
    readingSpeed,
    startLearningSession,
    endLearningSession,
    simulateVocabularySuggestion,
    simulateConversationStarter,
    getLearningInsights,
    getVocabularyProgress,
    getGrammarProgress,
    currentSession
  } = useLanguageAI();

  const [activeTab, setActiveTab] = useState('overview');
  const [testText, setTestText] = useState('');

  const insights = getLearningInsights();
  const vocabProgress = getVocabularyProgress();
  const grammarProgress = getGrammarProgress();

  const handleStartSession = () => {
    startLearningSession();
    toast({
      title: "Learning Session Started",
      description: "AI is now tracking your progress and providing assistance",
    });
  };

  const handleEndSession = () => {
    endLearningSession();
    toast({
      title: "Session Complete",
      description: "Great work! Your progress has been saved.",
    });
  };

  const handleTestGrammar = () => {
    if (testText.trim()) {
      // Simulate grammar check
      const corrections = [
        {
          originalText: testText,
          correctedText: testText.replace(/i am/gi, 'I am'),
          explanation: "The pronoun 'I' should always be capitalized",
          rule: "Capitalize the first person singular pronoun 'I'",
          example: "I am learning English. (not: i am learning English)",
          severity: 'minor' as const
        }
      ];

      corrections.forEach(correction => {
        toast({
          title: "Grammar Correction",
          description: correction.explanation,
        });
      });
    }
  };

  const handleGetVocabularySuggestions = () => {
    const topics = ['greeting', 'emotions', 'food', 'travel', 'work', 'family', 'weather', 'technology'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const suggestions = simulateVocabularySuggestion(randomTopic);
    
    toast({
      title: `Vocabulary - ${randomTopic.charAt(0).toUpperCase() + randomTopic.slice(1)}`,
      description: `Try these words: ${suggestions.slice(0, 3).join(', ')}`,
    });
  };

  const handleGetConversationStarters = () => {
    const topics = ['hobbies', 'food', 'travel', 'work', 'family'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const starters = simulateConversationStarter(randomTopic, languageLevel);
    
    toast({
      title: `Conversation Starters - ${randomTopic.charAt(0).toUpperCase() + randomTopic.slice(1)}`,
      description: starters[0] || "Tell me about yourself",
    });
  };

  const handleQuickPractice = (skill: 'speaking' | 'listening' | 'writing' | 'reading') => {
    const practiceMessages = {
      speaking: "Great! Try speaking out loud for 2 minutes about your day.",
      listening: "Perfect! Listen to a short podcast or video in your target language.",
      writing: "Excellent! Write 3 sentences about your favorite hobby.",
      reading: "Awesome! Read a short article or story in your target language."
    };

    toast({
      title: `${skill.charAt(0).toUpperCase() + skill.slice(1)} Practice`,
      description: practiceMessages[skill],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm mx-auto max-h-[85vh] overflow-hidden rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Languages className="w-5 h-5 text-primary" />
            Language Practice
          </DialogTitle>
          <DialogDescription>
            Enhance your language learning with AI-powered tools and practice sessions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Learning Language</Label>
                <Select name="learningLanguage" value={learningLanguage} onValueChange={setLearningLanguage}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder={getLanguageDisplayName(learningLanguage)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">🇺🇸 English</SelectItem>
                    <SelectItem value="georgian">🇬🇪 Georgian</SelectItem>
                    <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                    <SelectItem value="french">🇫🇷 French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Your Level</Label>
                <Select name="languageLevel" value={languageLevel} onValueChange={setLanguageLevel}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder={getLevelDisplayName(languageLevel)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a1">A1 Beginner</SelectItem>
                    <SelectItem value="a2">A2 Elementary</SelectItem>
                    <SelectItem value="b1">B1 Intermediate</SelectItem>
                    <SelectItem value="b2">B2 Upper-Intermediate</SelectItem>
                    <SelectItem value="c1">C1 Advanced</SelectItem>
                    <SelectItem value="c2">C2 Proficient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Target Language for Translation</Label>
                <Select defaultValue="georgian">
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="georgian">🇬🇪 Georgian</SelectItem>
                    <SelectItem value="english">🇺🇸 English</SelectItem>
                    <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                    <SelectItem value="french">🇫🇷 French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="practice-mode" className="text-sm">
                Practice Mode
                <span className="block text-xs text-muted-foreground">
                  AI will actively correct your messages
                </span>
              </Label>
              <Switch
                id="practice-mode"
                checked={practiceMode}
                onCheckedChange={setPracticeMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-translate" className="text-sm">
                Auto-Translate
                <span className="block text-xs text-muted-foreground">
                  Automatically show translations for messages
                </span>
              </Label>
              <Switch
                id="auto-translate"
                checked={translationEnabled}
                onCheckedChange={setTranslationEnabled}
              />
            </div>

            {isLearningModeActive() && (
              <div className="bg-primary/5 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {practiceMode ? 'Practice Mode Active' : 'Learning Features Active'}
                  </span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {autoCorrect && <li>• Auto-correct enabled</li>}
                  {grammarCheckEnabled && <li>• Grammar checking active</li>}
                  {translationEnabled && <li>• Translation available</li>}
                  <li>• Suggestions match your {languageLevel.toUpperCase()} level</li>
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handleStartSession}
                disabled={!!currentSession}
              >
                <Zap className="w-3 h-3 mr-1" />
                Start Session
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handleEndSession}
                disabled={!currentSession}
              >
                <Award className="w-3 h-3 mr-1" />
                End Session
              </Button>
            </div>

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

          <TabsContent value="skills" className="space-y-4">
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

            {insights.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-600">Your Strengths</h4>
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
                <h4 className="text-sm font-medium text-blue-600">Recommendations</h4>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguagePracticePanel;
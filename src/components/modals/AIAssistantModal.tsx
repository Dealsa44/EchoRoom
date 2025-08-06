import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bot, MessageCircle, BookOpen, Target, Zap, Lightbulb, Mic, Headphones, PenTool, Eye, Brain, Star, TrendingUp, Award } from 'lucide-react';
import { useLanguageAI } from '@/contexts/LanguageAIContext';
import { toast } from '@/hooks/use-toast';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistantModal = ({ isOpen, onClose }: AIAssistantModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  const {
    learningLanguage,
    languageLevel,
    aiPersonality,
    setAIPersonality,
    practiceMode,
    setPracticeMode,
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
    simulateGrammarCheck,
    simulateTranslation,
    simulatePronunciationFeedback,
    simulateVocabularySuggestion,
    simulateConversationStarter,
    getLearningInsights,
    updateSkillProgress,
    startLearningSession,
    endLearningSession,
    currentSession,
    getPersonalityDescription,
    getLanguageDisplayName,
    getLevelDisplayName
  } = useLanguageAI();

  const [activeTab, setActiveTab] = useState('assistant');
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('grammar');

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    // Simulate AI response based on selected feature
    let response = '';
    let skillToUpdate: 'speaking' | 'listening' | 'writing' | 'reading' = 'writing';
    
    switch (selectedFeature) {
      case 'grammar':
        const corrections = simulateGrammarCheck(userInput);
        if (corrections.length > 0) {
          response = `I found ${corrections.length} grammar issue(s):\n\n${corrections.map((c, index) => 
            `${index + 1}. **${c.rule}**\n   ${c.explanation}\n   Example: ${c.example}\n`
          ).join('\n')}\nKeep practicing - grammar takes time to master!`;
        } else {
          response = "✅ Excellent! Your grammar looks correct. You're making great progress!";
        }
        skillToUpdate = 'writing';
        break;
      
      case 'translation':
        const translation = simulateTranslation(userInput, learningLanguage);
        response = `**Translation to ${getLanguageDisplayName(learningLanguage)}:**\n\n"${userInput}" → "${translation}"\n\n💡 Tip: Try to think in your target language rather than translating word by word.`;
        skillToUpdate = 'reading';
        break;
      
      case 'pronunciation':
        const pronunciation = simulatePronunciationFeedback(userInput);
        const emoji = pronunciation.score > 85 ? '🎉' : pronunciation.score > 70 ? '👍' : '💪';
        response = `${emoji} **Pronunciation Score: ${pronunciation.score}/100**\n\n**Feedback:** ${pronunciation.feedback}\n\n🎯 **Tip:** Practice saying this word 3 times daily for better results.`;
        skillToUpdate = 'speaking';
        break;
      
      case 'vocabulary':
        const suggestions = simulateVocabularySuggestion(userInput);
        response = `📚 **Vocabulary Suggestions for "${userInput}":**\n\n${suggestions.slice(0, 5).map((word, index) => 
          `${index + 1}. **${word}** - Related to your topic\n`
        ).join('')}\n💡 **Learning Tip:** Try using these words in sentences to remember them better.`;
        skillToUpdate = 'reading';
        break;
      
      case 'conversation':
        const starters = simulateConversationStarter(userInput, languageLevel);
        response = `💬 **Conversation Starters for "${userInput}":**\n\n${starters.slice(0, 3).map((starter, index) => 
          `${index + 1}. "${starter}"\n`
        ).join('')}\n🎯 **Level:** ${getLevelDisplayName(languageLevel)}\n💡 **Tip:** These questions are perfect for your current level.`;
        skillToUpdate = 'speaking';
        break;
      
      default:
        response = `Hello! I'm your ${getLanguageDisplayName(learningLanguage)} learning assistant. I can help you with:\n\n• Grammar checking\n• Translation\n• Pronunciation feedback\n• Vocabulary suggestions\n• Conversation starters\n\nWhat would you like to practice today?`;
    }

    setAiResponse(response);
    
    // Update skill progress based on interaction
    updateSkillProgress(skillToUpdate, 2);
    
    // Clear input for next interaction
    setUserInput('');
  };

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

  const handleQuickVocabulary = () => {
    const topics = ['greeting', 'emotions', 'food', 'travel', 'work', 'family', 'weather', 'technology'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const suggestions = simulateVocabularySuggestion(randomTopic);
    
    setAiResponse(`📚 **Quick Vocabulary - ${randomTopic.charAt(0).toUpperCase() + randomTopic.slice(1)}:**\n\n${suggestions.slice(0, 5).map((word, index) => 
      `${index + 1}. **${word}**\n`
    ).join('')}\n💡 **Challenge:** Try using these words in a sentence!`);
  };

  const handleQuickConversation = () => {
    const topics = ['hobbies', 'food', 'travel', 'work', 'family'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const starters = simulateConversationStarter(randomTopic, languageLevel);
    
    setAiResponse(`💬 **Quick Conversation - ${randomTopic.charAt(0).toUpperCase() + randomTopic.slice(1)}:**\n\n${starters.slice(0, 3).map((starter, index) => 
      `${index + 1}. "${starter}"\n`
    ).join('')}\n🎯 **Perfect for your ${getLevelDisplayName(languageLevel)} level!**`);
  };

  const handleQuickPronunciation = () => {
    const words = ['beautiful', 'pronunciation', 'language', 'practice', 'confidence', 'learning', 'vocabulary', 'grammar'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const pronunciation = simulatePronunciationFeedback(randomWord);
    
    setAiResponse(`🎤 **Pronunciation Practice - "${randomWord}":**\n\n**Score:** ${pronunciation.score}/100\n\n**Feedback:** ${pronunciation.feedback}\n\n💡 **Try saying it:** ${randomWord}`);
  };

  const insights = getLearningInsights();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm mx-auto max-h-[90vh] overflow-hidden" ref={modalRef}>
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Bot className="w-5 h-5 text-primary" />
            AI Language Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assistant" className="text-xs">Assistant</TabsTrigger>
              <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="assistant" className="space-y-3 p-4">
              {/* AI Chat Interface */}
              <Card>
                <CardContent className="p-3 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Select AI Feature</Label>
                    <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grammar">Grammar Check</SelectItem>
                        <SelectItem value="translation">Translation</SelectItem>
                        <SelectItem value="pronunciation">Pronunciation</SelectItem>
                        <SelectItem value="vocabulary">Vocabulary Help</SelectItem>
                        <SelectItem value="conversation">Conversation Starters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Your Message</Label>
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your message here..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="h-8"
                    />
                  </div>

                  <Button onClick={handleSendMessage} className="w-full" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send to AI
                  </Button>

                  {aiResponse && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium">AI Response</span>
                      </div>
                      <p className="text-xs whitespace-pre-line">{aiResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Learning Session Control */}
              <Card>
                <CardContent className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Session Status</span>
                    <Badge variant={currentSession ? "default" : "secondary"} className="text-xs">
                      {currentSession ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={handleStartSession} 
                      disabled={!!currentSession}
                      className="w-full"
                      size="sm"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Start Learning Session
                    </Button>
                    <Button 
                      onClick={handleEndSession} 
                      disabled={!currentSession}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      End Session
                    </Button>
                  </div>

                  <div className="bg-primary/5 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium">AI Personality</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{getPersonalityDescription()}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="space-y-3 p-4">
              {/* Quick Tools */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                    onClick={handleQuickVocabulary}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Get Vocabulary Suggestions
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                    onClick={handleQuickConversation}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Get Conversation Starters
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
                    onClick={handleQuickPronunciation}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Test Pronunciation
                  </Button>
                </CardContent>
              </Card>

              {/* Learning Insights */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  {insights.strengths.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium">Strengths</span>
                      </div>
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
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-medium">Recommendations</span>
                      </div>
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
                </CardContent>
              </Card>

              {/* Skill Progress */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-blue-500" />
                      <span className="text-xs">Speaking</span>
                      <Badge variant="secondary" className="ml-auto text-xs">{speakingConfidence}%</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-green-500" />
                      <span className="text-xs">Listening</span>
                      <Badge variant="secondary" className="ml-auto text-xs">{listeningComprehension}%</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-purple-500" />
                      <span className="text-xs">Writing</span>
                      <Badge variant="secondary" className="ml-auto text-xs">{writingAccuracy}%</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-orange-500" />
                      <span className="text-xs">Reading</span>
                      <Badge variant="secondary" className="ml-auto text-xs">{readingSpeed}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Settings */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <div className="space-y-2">
                    <Label className="text-xs">AI Personality</Label>
                    <Select value={aiPersonality} onValueChange={setAIPersonality}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="encouraging">Encouraging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="practice-mode" className="text-xs">Practice Mode</Label>
                      <Switch
                        id="practice-mode"
                        checked={practiceMode}
                        onCheckedChange={setPracticeMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-correct" className="text-xs">Auto-Correct</Label>
                      <Switch
                        id="auto-correct"
                        checked={autoCorrect}
                        onCheckedChange={setAutoCorrect}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="grammar-check" className="text-xs">Grammar Check</Label>
                      <Switch
                        id="grammar-check"
                        checked={grammarCheckEnabled}
                        onCheckedChange={setGrammarCheckEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="translation" className="text-xs">Translation</Label>
                      <Switch
                        id="translation"
                        checked={translationEnabled}
                        onCheckedChange={setTranslationEnabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantModal;
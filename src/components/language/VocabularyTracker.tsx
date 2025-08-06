import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  TrendingUp, 
  Star, 
  Clock, 
  Target, 
  Award, 
  Zap, 
  Brain,
  Volume2,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  X,
  Search,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  definition: string;
  pronunciation: string;
  partOfSpeech: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  examples: string[];
  dateAdded: Date;
  lastReviewed: Date;
  reviewCount: number;
  masteryLevel: number; // 0-100
  isStarred: boolean;
  sourceContext: string; // Where the word was encountered
  relatedWords: string[];
  memoryTechnique?: string;
}

interface StudySession {
  id: string;
  date: Date;
  wordsStudied: number;
  correctAnswers: number;
  timeSpent: number; // minutes
  sessionType: 'review' | 'new_words' | 'practice';
}

interface VocabularyStats {
  totalWords: number;
  masteredWords: number;
  reviewingWords: number;
  newWords: number;
  weeklyProgress: number;
  streakDays: number;
  averageAccuracy: number;
}

const VocabularyTracker = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Mock data - in real app this would come from context/API
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([
    {
      id: '1',
      word: 'serendipity',
      translation: 'სერენდიპიტეტი',
      definition: 'The occurrence of events by chance in a happy way',
      pronunciation: '/ˌserənˈdipədē/',
      partOfSpeech: 'noun',
      difficulty: 'advanced',
      category: 'Philosophy',
      examples: [
        'Meeting my best friend was pure serendipity.',
        'The discovery happened by serendipity during our conversation.'
      ],
      dateAdded: new Date(2024, 0, 15),
      lastReviewed: new Date(2024, 0, 20),
      reviewCount: 5,
      masteryLevel: 85,
      isStarred: true,
      sourceContext: 'Chat with Luna about meaningful connections',
      relatedWords: ['coincidence', 'fortune', 'destiny'],
      memoryTechnique: 'Think of "serene dip" - a peaceful discovery'
    },
    {
      id: '2',
      word: 'eloquent',
      translation: 'ელოკვენტური',
      definition: 'Fluent or persuasive in speaking or writing',
      pronunciation: '/ˈeləkwənt/',
      partOfSpeech: 'adjective',
      difficulty: 'intermediate',
      category: 'Communication',
      examples: [
        'She gave an eloquent speech about language learning.',
        'His eloquent writing style captivated readers.'
      ],
      dateAdded: new Date(2024, 0, 18),
      lastReviewed: new Date(2024, 0, 22),
      reviewCount: 3,
      masteryLevel: 65,
      isStarred: false,
      sourceContext: 'Philosophy Corner discussion',
      relatedWords: ['articulate', 'persuasive', 'fluent'],
    },
    {
      id: '3',
      word: 'wanderlust',
      translation: 'მოგზაურობის სურვილი',
      definition: 'A strong desire to travel',
      pronunciation: '/ˈwändərˌləst/',
      partOfSpeech: 'noun',
      difficulty: 'intermediate',
      category: 'Travel',
      examples: [
        'Her wanderlust led her to explore 30 countries.',
        'The travel photos awakened my wanderlust.'
      ],
      dateAdded: new Date(2024, 0, 10),
      lastReviewed: new Date(2024, 0, 25),
      reviewCount: 8,
      masteryLevel: 90,
      isStarred: true,
      sourceContext: 'Chat with Alex about travel dreams',
      relatedWords: ['adventure', 'exploration', 'journey'],
      memoryTechnique: 'Wander + lust = desire to wander'
    }
  ]);

  const [studySessions, setStudySessions] = useState<StudySession[]>([
    {
      id: '1',
      date: new Date(2024, 0, 25),
      wordsStudied: 15,
      correctAnswers: 12,
      timeSpent: 25,
      sessionType: 'review'
    },
    {
      id: '2',
      date: new Date(2024, 0, 24),
      wordsStudied: 8,
      correctAnswers: 7,
      timeSpent: 18,
      sessionType: 'new_words'
    }
  ]);

  const stats: VocabularyStats = {
    totalWords: vocabulary.length,
    masteredWords: vocabulary.filter(w => w.masteryLevel >= 80).length,
    reviewingWords: vocabulary.filter(w => w.masteryLevel >= 40 && w.masteryLevel < 80).length,
    newWords: vocabulary.filter(w => w.masteryLevel < 40).length,
    weeklyProgress: 23,
    streakDays: 7,
    averageAccuracy: 82
  };

  const categories = Array.from(new Set(vocabulary.map(w => w.category)));
  
  const filteredVocabulary = vocabulary.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || word.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAnswer = (wordId: string) => {
    setShowAnswers(prev => ({ ...prev, [wordId]: !prev[wordId] }));
  };

  const updateMastery = (wordId: string, correct: boolean) => {
    setVocabulary(prev => prev.map(word => {
      if (word.id === wordId) {
        const adjustment = correct ? 10 : -5;
        const newMastery = Math.max(0, Math.min(100, word.masteryLevel + adjustment));
        return {
          ...word,
          masteryLevel: newMastery,
          lastReviewed: new Date(),
          reviewCount: word.reviewCount + 1
        };
      }
      return word;
    }));
  };

  const toggleStar = (wordId: string) => {
    setVocabulary(prev => prev.map(word => 
      word.id === wordId ? { ...word, isStarred: !word.isStarred } : word
    ));
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'text-green-600 bg-green-100';
    if (level >= 60) return 'text-blue-600 bg-blue-100';
    if (level >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vocabulary Tracker</h2>
          <p className="text-muted-foreground">Master new words through spaced repetition</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            <Zap size={12} className="mr-1" />
            {stats.streakDays} day streak
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalWords}</p>
                    <p className="text-sm text-muted-foreground">Total Words</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.masteredWords}</p>
                    <p className="text-sm text-muted-foreground">Mastered</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.averageAccuracy}%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Mastered ({stats.masteredWords})</span>
                  <span>{Math.round((stats.masteredWords / stats.totalWords) * 100)}%</span>
                </div>
                <Progress value={(stats.masteredWords / stats.totalWords) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Reviewing ({stats.reviewingWords})</span>
                  <span>{Math.round((stats.reviewingWords / stats.totalWords) * 100)}%</span>
                </div>
                <Progress value={(stats.reviewingWords / stats.totalWords) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Learning ({stats.newWords})</span>
                  <span>{Math.round((stats.newWords / stats.totalWords) * 100)}%</span>
                </div>
                <Progress value={(stats.newWords / stats.totalWords) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vocabulary Tab */}
        <TabsContent value="vocabulary" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search vocabulary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredVocabulary.map(word => (
              <Card key={word.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{word.word}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakWord(word.word)}
                          className="h-8 w-8 p-0"
                        >
                          <Volume2 size={14} />
                        </Button>
                        <span className="text-sm text-muted-foreground">{word.pronunciation}</span>
                        <Badge variant="secondary" className="text-xs">
                          {word.partOfSpeech}
                        </Badge>
                        <Badge className={`text-xs ${getDifficultyColor(word.difficulty)}`}>
                          {word.difficulty}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">{word.translation}</p>
                      
                      <div className="mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAnswer(word.id)}
                          className="h-auto p-0 text-left"
                        >
                          {showAnswers[word.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span className="ml-2">
                            {showAnswers[word.id] ? 'Hide' : 'Show'} Definition
                          </span>
                        </Button>
                        
                        {showAnswers[word.id] && (
                          <div className="mt-2 space-y-2">
                            <p className="text-sm">{word.definition}</p>
                            {word.examples.map((example, index) => (
                              <p key={index} className="text-xs text-muted-foreground italic">
                                "{example}"
                              </p>
                            ))}
                            {word.memoryTechnique && (
                              <div className="p-2 bg-yellow-50 rounded text-xs">
                                <Brain size={12} className="inline mr-1" />
                                <strong>Memory tip:</strong> {word.memoryTechnique}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getMasteryColor(word.masteryLevel)}`}>
                            {word.masteryLevel}% mastered
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Reviewed {word.reviewCount} times
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateMastery(word.id, false)}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <X size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateMastery(word.id, true)}
                            className="h-8 w-8 p-0 text-green-600"
                          >
                            <Check size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStar(word.id)}
                            className={`h-8 w-8 p-0 ${word.isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
                          >
                            <Star size={14} fill={word.isStarred ? 'currentColor' : 'none'} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Practice Modes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose how you want to practice your vocabulary
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-6 flex-col">
                <RotateCcw size={24} className="mb-2" />
                <span className="font-medium">Spaced Repetition</span>
                <span className="text-xs text-muted-foreground">Review words based on difficulty</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-6 flex-col">
                <Target size={24} className="mb-2" />
                <span className="font-medium">Quick Quiz</span>
                <span className="text-xs text-muted-foreground">Test your knowledge</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-6 flex-col">
                <Star size={24} className="mb-2" />
                <span className="font-medium">Starred Words</span>
                <span className="text-xs text-muted-foreground">Focus on favorites</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-6 flex-col">
                <Clock size={24} className="mb-2" />
                <span className="font-medium">Timed Challenge</span>
                <span className="text-xs text-muted-foreground">Race against time</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {studySessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">{session.sessionType.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.date.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{session.correctAnswers}/{session.wordsStudied}</p>
                      <p className="text-sm text-muted-foreground">{session.timeSpent}min</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={20} />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map(category => {
                  const categoryWords = vocabulary.filter(w => w.category === category);
                  const masteredInCategory = categoryWords.filter(w => w.masteryLevel >= 80).length;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category}</span>
                        <span>{masteredInCategory}/{categoryWords.length}</span>
                      </div>
                      <Progress 
                        value={(masteredInCategory / categoryWords.length) * 100} 
                        className="h-2" 
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VocabularyTracker;
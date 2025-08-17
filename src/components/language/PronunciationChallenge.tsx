import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Award,
  Target,
  TrendingUp,
  Star,
  CheckCircle,
  XCircle,
  Zap,
  Users,
  Share
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PronunciationWord {
  id: string;
  word: string;
  pronunciation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  audioUrl?: string;
  phonetics: string[];
  tips: string[];
}

interface PronunciationResult {
  accuracy: number;
  feedback: string;
  commonMistakes: string[];
  improvementTips: string[];
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  words: PronunciationWord[];
  timeLimit: number; // seconds
  targetAccuracy: number;
  reward: {
    points: number;
    badge?: string;
  };
}

const PronunciationChallenge = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [results, setResults] = useState<PronunciationResult[]>([]);
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock challenges data
  const challenges: Challenge[] = [
    {
      id: '1',
      name: 'Beginner Basics',
      description: 'Master fundamental English sounds',
      words: [
        {
          id: '1',
          word: 'hello',
          pronunciation: '/həˈloʊ/',
          difficulty: 'easy',
          category: 'Greetings',
          phonetics: ['h', 'ə', 'ˈl', 'oʊ'],
          tips: ['Stress the second syllable', 'The "o" sound is like "oh"']
        },
        {
          id: '2',
          word: 'beautiful',
          pronunciation: '/ˈbjuːtɪfəl/',
          difficulty: 'medium',
          category: 'Adjectives',
          phonetics: ['ˈb', 'j', 'uː', 't', 'ɪ', 'f', 'ə', 'l'],
          tips: ['Start with "beau" like "bow"', 'Three syllables: beau-ti-ful']
        },
        {
          id: '3',
          word: 'through',
          pronunciation: '/θruː/',
          difficulty: 'hard',
          category: 'Common Words',
          phonetics: ['θ', 'r', 'uː'],
          tips: ['Start with "th" sound (tongue between teeth)', 'Ends with long "oo" sound']
        }
      ],
      timeLimit: 180, // 3 minutes
      targetAccuracy: 70,
      reward: {
        points: 100,
        badge: 'Pronunciation Novice'
      }
    },
    {
      id: '2',
      name: 'Tricky Consonants',
      description: 'Conquer challenging consonant sounds',
      words: [
        {
          id: '4',
          word: 'rhythm',
          pronunciation: '/ˈrɪðəm/',
          difficulty: 'hard',
          category: 'Music',
          phonetics: ['ˈr', 'ɪ', 'ð', 'ə', 'm'],
          tips: ['No vowel between "r" and "th"', 'Soft "th" sound in middle']
        },
        {
          id: '5',
          word: 'strength',
          pronunciation: '/streŋθ/',
          difficulty: 'hard',
          category: 'Abstract',
          phonetics: ['s', 't', 'r', 'e', 'ŋ', 'θ'],
          tips: ['Consonant cluster "str"', 'Ends with hard "th"']
        }
      ],
      timeLimit: 120,
      targetAccuracy: 80,
      reward: {
        points: 200,
        badge: 'Consonant Crusher'
      }
    }
  ];

  const currentChallenge = selectedChallenge;
  const currentWord = currentChallenge?.words[currentWordIndex];

  const handleChallengeComplete = useCallback(() => {
    setChallengeStarted(false);
    const averageScore = results.reduce((sum, result) => sum + result.accuracy, 0) / results.length || 0;
    setOverallScore(averageScore);
    
    if (currentChallenge && averageScore >= currentChallenge.targetAccuracy) {
      // Challenge completed - toast removed per user request
    } else {
      // Challenge complete - toast removed per user request
    }
  }, [results, currentChallenge]);

  useEffect(() => {
    if (challengeStarted && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (challengeStarted && timeRemaining === 0) {
      handleChallengeComplete();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [challengeStarted, timeRemaining, handleChallengeComplete]);

  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setChallengeStarted(true);
    setTimeRemaining(challenge.timeLimit);
    setCurrentWordIndex(0);
    setResults([]);
    setOverallScore(0);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        
        // Simulate pronunciation analysis
        simulatePronunciationAnalysis();
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, 5000);

    } catch (error) {
      // Microphone error - toast removed per user request
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const simulatePronunciationAnalysis = () => {
    // Simulate AI pronunciation analysis
    const accuracy = Math.floor(Math.random() * 40) + 60; // 60-100%
    const result: PronunciationResult = {
      accuracy,
      feedback: accuracy >= 80 
        ? "Excellent pronunciation! Your accent is clear and natural."
        : accuracy >= 70
        ? "Good pronunciation! Work on stress and intonation."
        : "Keep practicing! Focus on individual sounds.",
      commonMistakes: accuracy < 80 ? [
        "Vowel sound could be clearer",
        "Stress pattern needs adjustment"
      ] : [],
      improvementTips: [
        "Listen to native speakers",
        "Practice with tongue twisters",
        "Record yourself regularly"
      ]
    };

    setResults(prev => [...prev, result]);
    
    // Accuracy result - toast removed per user request
  };

  const playExample = () => {
    if (currentWord && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.rate = 0.7;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
      
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  const nextWord = () => {
    if (currentChallenge && currentWordIndex < currentChallenge.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setRecordedAudio(null);
    } else {
      handleChallengeComplete();
    }
  };

  const shareProgress = () => {
    const message = `Just completed the "${currentChallenge?.name}" pronunciation challenge with ${overallScore.toFixed(1)}% accuracy! 🎯 #LanguageLearning #EchoRoom`;
    
    if (navigator.share) {
      navigator.share({
        title: 'EchoRoom Pronunciation Challenge',
        text: message,
      });
    } else {
      navigator.clipboard.writeText(message);
      // Copied to clipboard - toast removed per user request
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-blue-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!challengeStarted) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Pronunciation Challenges</h2>
          <p className="text-muted-foreground">Improve your pronunciation with AI-powered feedback</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map(challenge => (
            <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{challenge.name}</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">
                    {challenge.reward.points} pts
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Target size={16} />
                    <span>{challenge.targetAccuracy}% target</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={16} />
                    <span>{challenge.words.length} words</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Preview words:</p>
                  <div className="flex flex-wrap gap-2">
                    {challenge.words.slice(0, 3).map(word => (
                      <Badge 
                        key={word.id} 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(word.difficulty)}`}
                      >
                        {word.word}
                      </Badge>
                    ))}
                    {challenge.words.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{challenge.words.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={() => startChallenge(challenge)}
                  className="w-full"
                >
                  Start Challenge
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Previous Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                Recent Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold mb-2">{overallScore.toFixed(1)}%</p>
                <p className="text-muted-foreground mb-4">Overall Accuracy</p>
                <Button onClick={shareProgress} variant="outline" className="gap-2">
                  <Share size={16} />
                  Share Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Challenge Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentChallenge?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Word {currentWordIndex + 1} of {currentChallenge?.words.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
              <p className="text-sm text-muted-foreground">Time left</p>
            </div>
          </div>
          <Progress value={((currentWordIndex + 1) / (currentChallenge?.words.length || 1)) * 100} />
        </CardHeader>
      </Card>

      {/* Current Word */}
      {currentWord && (
        <Card>
          <CardHeader>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">{currentWord.word}</h2>
              <p className="text-lg text-muted-foreground">{currentWord.pronunciation}</p>
              <div className="flex items-center justify-center gap-2">
                <Badge className={getDifficultyColor(currentWord.difficulty)}>
                  {currentWord.difficulty}
                </Badge>
                <Badge variant="outline">{currentWord.category}</Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Pronunciation Tips */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">💡 Pronunciation Tips:</h4>
              <ul className="text-sm space-y-1">
                {currentWord.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={playExample}
                disabled={isPlaying}
                className="gap-2"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                Listen
              </Button>

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`gap-2 ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                {isRecording ? 'Stop' : 'Record'}
              </Button>

              <Button variant="outline" onClick={() => setRecordedAudio(null)}>
                <RotateCcw size={20} />
              </Button>
            </div>

            {/* Recording Feedback */}
            {isRecording && (
              <div className="text-center">
                <div className="animate-pulse text-red-600 mb-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full mx-auto"></div>
                </div>
                <p className="text-sm text-muted-foreground">Recording... Say the word clearly</p>
              </div>
            )}

            {/* Results */}
            {results[currentWordIndex] && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getAccuracyColor(results[currentWordIndex].accuracy)}`}>
                    {results[currentWordIndex].accuracy}%
                  </div>
                  <p className="text-sm text-muted-foreground">Accuracy Score</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">{results[currentWordIndex].feedback}</p>
                </div>

                {results[currentWordIndex].commonMistakes.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Areas to improve:</h5>
                    <ul className="text-sm space-y-1">
                      {results[currentWordIndex].commonMistakes.map((mistake, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <XCircle size={14} className="text-yellow-600 mt-0.5" />
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={nextWord} className="w-full">
                  {currentWordIndex < (currentChallenge?.words.length || 0) - 1 ? 'Next Word' : 'Finish Challenge'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PronunciationChallenge;
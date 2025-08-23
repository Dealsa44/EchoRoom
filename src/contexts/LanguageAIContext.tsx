import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

import { LanguageCode, LanguageLevel, AIPersonality } from '@/types/languageAI';

interface LanguageCorrection {
  id: string;
  originalText: string;
  correctedText: string;
  explanation: string;
  rule: string;
  example: string;
  timestamp: Date;
  severity: 'minor' | 'moderate' | 'major';
}

interface VocabularyWord {
  word: string;
  translation: string;
  difficulty: LanguageLevel;
  context: string;
  learnedAt: Date;
  reviewCount: number;
  nextReview: Date;
}

interface LearningSession {
  id: string;
  duration: number;
  correctionsReceived: number;
  wordsLearned: string[];
  topicsDiscussed: string[];
  confidenceRating: number;
  timestamp: Date;
}

interface LanguageAISettings {
  // Language Learning Settings
  learningLanguage: LanguageCode;
  languageLevel: LanguageLevel;
  nativeLanguage: LanguageCode;
  
  // AI Assistant Settings
  aiPersonality: AIPersonality;
  autoCorrect: boolean;
  practiceMode: boolean;
  translationEnabled: boolean;
  grammarCheckEnabled: boolean;
  
  // Learning Progress
  correctionsReceived: number;
  wordsLearned: VocabularyWord[];
  commonMistakes: string[];
  learningStreak: number;
  sessionsCompleted: number;
  
  // New Unified Features
  corrections: LanguageCorrection[];
  learningSessions: LearningSession[];
  currentSession: LearningSession | null;
  vocabularyProgress: Map<string, number>;
  grammarRules: Map<string, number>;
  speakingConfidence: number;
  listeningComprehension: number;
  writingAccuracy: number;
  readingSpeed: number;
}

export interface LanguageAIContextType extends LanguageAISettings {
  // Setters
  setLearningLanguage: (language: LanguageCode) => void;
  setLanguageLevel: (level: LanguageLevel) => void;
  setNativeLanguage: (language: LanguageCode) => void;
  setAIPersonality: (personality: AIPersonality) => void;
  setAutoCorrect: (enabled: boolean) => void;
  setPracticeMode: (enabled: boolean) => void;
  setTranslationEnabled: (enabled: boolean) => void;
  setGrammarCheckEnabled: (enabled: boolean) => void;
  
  // Actions
  addCorrection: (mistake: string, correction: string, explanation: string, rule: string, example: string, severity: 'minor' | 'moderate' | 'major') => void;
  addWordLearned: (word: string, translation: string, context: string) => void;
  incrementStreak: () => void;
  completeSession: () => void;
  
  // New Unified Actions
  startLearningSession: () => void;
  endLearningSession: () => void;
  simulateGrammarCheck: (text: string) => LanguageCorrection[];
  simulateTranslation: (text: string, targetLanguage: LanguageCode) => string;
  simulatePronunciationFeedback: (word: string) => { score: number; feedback: string };
  simulateVocabularySuggestion: (context: string) => string[];
  simulateConversationStarter: (topic: string, level: LanguageLevel) => string[];
  updateSkillProgress: (skill: 'speaking' | 'listening' | 'writing' | 'reading', improvement: number) => void;
  getLearningInsights: () => { strengths: string[]; weaknesses: string[]; recommendations: string[] };
  
  // Helpers
  getPersonalityDescription: () => string;
  getLanguageDisplayName: (code: LanguageCode) => string;
  getLevelDisplayName: (level: LanguageLevel) => string;
  isLearningModeActive: () => boolean;
  getVocabularyProgress: () => { total: number; mastered: number; learning: number; new: number };
  getGrammarProgress: () => { totalRules: number; masteredRules: number; commonMistakes: string[] };
}

const defaultSettings: LanguageAISettings = {
  learningLanguage: 'english',
  languageLevel: 'b1',
  nativeLanguage: 'georgian',
  aiPersonality: 'friendly',
  autoCorrect: false,
  practiceMode: false,
  translationEnabled: true,
  grammarCheckEnabled: true,
  correctionsReceived: 12,
  wordsLearned: [
    {
      word: "beautiful",
      translation: "შესანიშნავი",
      difficulty: 'a2',
      context: "The weather is beautiful today",
      learnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      reviewCount: 3,
      nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      word: "confidence",
      translation: "თავდაჯერებულობა",
      difficulty: 'b1',
      context: "I need to build my confidence",
      learnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      reviewCount: 2,
      nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    },
    {
      word: "practice",
      translation: "ვარჯიში",
      difficulty: 'a1',
      context: "Practice makes perfect",
      learnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      reviewCount: 5,
      nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      word: "vocabulary",
      translation: "ლექსიკა",
      difficulty: 'b1',
      context: "I'm expanding my vocabulary",
      learnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reviewCount: 1,
      nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      word: "pronunciation",
      translation: "გამოთქმა",
      difficulty: 'b2',
      context: "My pronunciation is improving",
      learnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reviewCount: 0,
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  ],
  commonMistakes: ["i am", "its", "they is", "a apple"],
  learningStreak: 5,
  sessionsCompleted: 8,
  corrections: [
    {
      id: "1",
      originalText: "i am learning english",
      correctedText: "I am learning English",
      explanation: "The pronoun 'I' should always be capitalized",
      rule: "Capitalize the first person singular pronoun 'I'",
      example: "I am learning English. (not: i am learning English)",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      severity: 'minor'
    },
    {
      id: "2",
      originalText: "its raining today",
      correctedText: "It's raining today",
      explanation: "'It's' is the contraction of 'it is'",
      rule: "Use 'it's' for contractions, 'its' for possession",
      example: "It's raining. The dog wagged its tail.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      severity: 'moderate'
    },
    {
      id: "3",
      originalText: "they is happy",
      correctedText: "They are happy",
      explanation: "Subject and verb must agree in number",
      rule: "Singular subjects take singular verbs, plural subjects take plural verbs",
      example: "They are happy. He is tall. She is smart.",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      severity: 'major'
    }
  ],
  learningSessions: [
    {
      id: "session1",
      duration: 25 * 60 * 1000, // 25 minutes
      correctionsReceived: 2,
      wordsLearned: ["beautiful", "confidence"],
      topicsDiscussed: ["daily routine", "hobbies"],
      confidenceRating: 7,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: "session2",
      duration: 30 * 60 * 1000, // 30 minutes
      correctionsReceived: 1,
      wordsLearned: ["vocabulary"],
      topicsDiscussed: ["food", "travel"],
      confidenceRating: 8,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: "session3",
      duration: 20 * 60 * 1000, // 20 minutes
      correctionsReceived: 3,
      wordsLearned: ["pronunciation"],
      topicsDiscussed: ["work", "family"],
      confidenceRating: 6,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ],
  currentSession: null,
  vocabularyProgress: new Map([
    ["beautiful", 75],
    ["confidence", 60],
    ["practice", 90],
    ["vocabulary", 40],
    ["pronunciation", 20]
  ]),
  grammarRules: new Map([
    ["capitalization", 80],
    ["subject_verb_agreement", 70],
    ["articles", 85],
    ["contractions", 60],
    ["irregular_verbs", 50]
  ]),
  speakingConfidence: 65,
  listeningComprehension: 70,
  writingAccuracy: 60,
  readingSpeed: 75,
};

export const LanguageAIContext = createContext<LanguageAIContextType | undefined>(undefined);

export const LanguageAIProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<LanguageAISettings>(defaultSettings);

  // Language setters
  const setLearningLanguage = (language: LanguageCode) => {
    setSettings(prev => ({ ...prev, learningLanguage: language }));
    // Learning language updated - toast removed per user request
  };

  const setLanguageLevel = (level: LanguageLevel) => {
    setSettings(prev => ({ ...prev, languageLevel: level }));
    // Level updated - toast removed per user request
  };

  const setNativeLanguage = (language: LanguageCode) => {
    setSettings(prev => ({ ...prev, nativeLanguage: language }));
  };

  // AI setters
  const setAIPersonality = (personality: AIPersonality) => {
    setSettings(prev => ({ ...prev, aiPersonality: personality }));
    // AI personality updated - toast removed per user request
  };

  const setAutoCorrect = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, autoCorrect: enabled }));
    if (enabled) {
      // Auto-correct enabled - toast removed per user request
    }
  };

  const setPracticeMode = (enabled: boolean) => {
    setSettings(prev => ({ 
      ...prev, 
      practiceMode: enabled,
      autoCorrect: enabled ? true : prev.autoCorrect,
      grammarCheckEnabled: enabled ? true : prev.grammarCheckEnabled
    }));
    
    if (enabled) {
      // Practice mode active - toast removed per user request
    } else {
      // Practice mode disabled - toast removed per user request
    }
  };

  const setTranslationEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, translationEnabled: enabled }));
  };

  const setGrammarCheckEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, grammarCheckEnabled: enabled }));
  };

  // Progress tracking actions
  const addCorrection = (mistake: string, correction: string, explanation: string, rule: string, example: string, severity: 'minor' | 'moderate' | 'major') => {
    const newCorrection: LanguageCorrection = {
      id: Date.now().toString(),
      originalText: mistake,
      correctedText: correction,
      explanation,
      rule,
      example,
      timestamp: new Date(),
      severity
    };

    setSettings(prev => ({
      ...prev,
      correctionsReceived: prev.correctionsReceived + 1,
      commonMistakes: [...prev.commonMistakes.slice(-9), mistake],
      corrections: [...prev.corrections, newCorrection]
    }));
  };

  const addWordLearned = (word: string, translation: string, context: string) => {
    const newWord: VocabularyWord = {
      word,
      translation,
      difficulty: settings.languageLevel,
      context,
      learnedAt: new Date(),
      reviewCount: 0,
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    setSettings(prev => ({
      ...prev,
      wordsLearned: [...prev.wordsLearned, newWord],
      vocabularyProgress: new Map(prev.vocabularyProgress.set(word, 0))
    }));
  };

  const incrementStreak = () => {
    setSettings(prev => ({ ...prev, learningStreak: prev.learningStreak + 1 }));
  };

  const completeSession = () => {
    setSettings(prev => ({ 
      ...prev, 
      sessionsCompleted: prev.sessionsCompleted + 1,
      learningStreak: prev.learningStreak + 1
    }));
  };

  // New Unified Actions
  const startLearningSession = () => {
    const session: LearningSession = {
      id: Date.now().toString(),
      duration: 0,
      correctionsReceived: 0,
      wordsLearned: [],
      topicsDiscussed: [],
      confidenceRating: 0,
      timestamp: new Date()
    };

    setSettings(prev => ({ ...prev, currentSession: session }));
    // Learning session started - toast removed per user request
  };

  const endLearningSession = () => {
    if (settings.currentSession) {
      const session = {
        ...settings.currentSession,
        duration: Date.now() - settings.currentSession.timestamp.getTime()
      };

      setSettings(prev => ({
        ...prev,
        learningSessions: [...prev.learningSessions, session],
        currentSession: null
      }));
      
      // Session complete - toast removed per user request
    }
  };

  const simulateGrammarCheck = (text: string): LanguageCorrection[] => {
    // Enhanced simulated grammar checking with more realistic patterns
    const corrections: LanguageCorrection[] = [];
    
    // Capitalization rules
    if (text.toLowerCase().includes('i am') && !text.includes('I am')) {
      corrections.push({
        id: Date.now().toString(),
        originalText: text,
        correctedText: text.replace(/i am/gi, 'I am'),
        explanation: "The pronoun 'I' should always be capitalized",
        rule: "Capitalize the first person singular pronoun 'I'",
        example: "I am learning English. (not: i am learning English)",
        timestamp: new Date(),
        severity: 'minor'
      });
    }

    // Contractions vs possessives
    if (text.includes('its') && !text.includes('it\'s')) {
      corrections.push({
        id: Date.now().toString(),
        originalText: text,
        correctedText: text.replace(/its\b/g, "it's"),
        explanation: "'It's' is the contraction of 'it is' or 'it has'",
        rule: "Use 'it's' for contractions, 'its' for possession",
        example: "It's raining. The dog wagged its tail.",
        timestamp: new Date(),
        severity: 'moderate'
      });
    }

    // Subject-verb agreement
    if (text.includes('they is') || text.includes('he are') || text.includes('she are')) {
      corrections.push({
        id: Date.now().toString(),
        originalText: text,
        correctedText: text.replace(/they is/g, 'they are').replace(/he are/g, 'he is').replace(/she are/g, 'she is'),
        explanation: "Subject and verb must agree in number",
        rule: "Singular subjects take singular verbs, plural subjects take plural verbs",
        example: "They are happy. He is tall. She is smart.",
        timestamp: new Date(),
        severity: 'major'
      });
    }

    // Article usage
    if (text.includes('a apple') || text.includes('a elephant') || text.includes('a umbrella')) {
      corrections.push({
        id: Date.now().toString(),
        originalText: text,
        correctedText: text.replace(/a apple/g, 'an apple').replace(/a elephant/g, 'an elephant').replace(/a umbrella/g, 'an umbrella'),
        explanation: "Use 'an' before words that begin with vowel sounds",
        rule: "Use 'a' before consonant sounds, 'an' before vowel sounds",
        example: "an apple, an elephant, an umbrella (but: a university, a European)",
        timestamp: new Date(),
        severity: 'moderate'
      });
    }

    // Past tense irregular verbs
    if (text.includes('goed') || text.includes('eated') || text.includes('runned')) {
      corrections.push({
        id: Date.now().toString(),
        originalText: text,
        correctedText: text.replace(/goed/g, 'went').replace(/eated/g, 'ate').replace(/runned/g, 'ran'),
        explanation: "These are irregular verbs with special past tense forms",
        rule: "Learn irregular verb forms - they don't follow the regular -ed pattern",
        example: "go → went, eat → ate, run → ran",
        timestamp: new Date(),
        severity: 'moderate'
      });
    }

    // Double negatives
    if (text.includes('don\'t have no') || text.includes('can\'t see nothing')) {
      corrections.push({
        id: Date.now().toString(),
        originalText: text,
        correctedText: text.replace(/don't have no/g, "don't have any").replace(/can't see nothing/g, "can't see anything"),
        explanation: "Avoid double negatives in English",
        rule: "Use only one negative word per clause",
        example: "I don't have any money. I can't see anything.",
        timestamp: new Date(),
        severity: 'major'
      });
    }

    return corrections;
  };

  const simulateTranslation = (text: string, targetLanguage: LanguageCode): string => {
    // Enhanced simulated translations with more realistic content
    const translations: Record<string, Record<LanguageCode, string>> = {
      "Hello, how are you?": {
        english: "Hello, how are you?",
        georgian: "გამარჯობა, როგორ ხარ?",
        spanish: "Hola, ¿cómo estás?",
        french: "Bonjour, comment allez-vous?"
      },
      "I am learning": {
        english: "I am learning",
        georgian: "მე ვსწავლობ",
        spanish: "Estoy aprendiendo",
        french: "J'apprends"
      },
      "What is your name?": {
        english: "What is your name?",
        georgian: "რა გქვია?",
        spanish: "¿Cómo te llamas?",
        french: "Comment vous appelez-vous?"
      },
      "I like this": {
        english: "I like this",
        georgian: "მე მომწონს ეს",
        spanish: "Me gusta esto",
        french: "J'aime ça"
      },
      "Can you help me?": {
        english: "Can you help me?",
        georgian: "შეგიძლიათ დამეხმაროთ?",
        spanish: "¿Puedes ayudarme?",
        french: "Pouvez-vous m'aider?"
      },
      "Thank you very much": {
        english: "Thank you very much",
        georgian: "ძალიან მადლობა",
        spanish: "Muchas gracias",
        french: "Merci beaucoup"
      },
      "Where is the bathroom?": {
        english: "Where is the bathroom?",
        georgian: "სად არის ტუალეტი?",
        spanish: "¿Dónde está el baño?",
        french: "Où sont les toilettes?"
      },
      "I don't understand": {
        english: "I don't understand",
        georgian: "არ მესმის",
        spanish: "No entiendo",
        french: "Je ne comprends pas"
      },
      "Speak slowly, please": {
        english: "Speak slowly, please",
        georgian: "გთხოვთ, ნელა ილაპარაკეთ",
        spanish: "Habla despacio, por favor",
        french: "Parlez lentement, s'il vous plaît"
      },
      "What time is it?": {
        english: "What time is it?",
        georgian: "რა საათია?",
        spanish: "¿Qué hora es?",
        french: "Quelle heure est-il?"
      }
    };

    return translations[text]?.[targetLanguage] || `[${targetLanguage.toUpperCase()}] ${text}`;
  };

  const simulatePronunciationFeedback = (word: string) => {
    // Enhanced pronunciation feedback with more realistic scoring
    const wordLower = word.toLowerCase();
    let score = 70; // Base score
    let feedback = "";

    // Simulate different pronunciation challenges based on word characteristics
    if (wordLower.includes('th')) {
      score = Math.floor(Math.random() * 20) + 60; // 60-80 for 'th' sounds
      feedback = score > 70 ? "Good 'th' sound! Keep your tongue between your teeth." : 
                 "Practice the 'th' sound - place your tongue between your teeth and blow air.";
    } else if (wordLower.includes('r')) {
      score = Math.floor(Math.random() * 25) + 65; // 65-90 for 'r' sounds
      feedback = score > 75 ? "Excellent 'r' pronunciation!" : 
                 "Try rolling your 'r' more naturally - practice with 'red', 'run'.";
    } else if (wordLower.length > 8) {
      score = Math.floor(Math.random() * 15) + 75; // 75-90 for long words
      feedback = score > 80 ? "Great pronunciation of this long word!" : 
                 "Break it down into syllables: " + word.match(/.{1,3}/g)?.join('-') || word;
    } else {
      score = Math.floor(Math.random() * 30) + 70; // 70-100 for regular words
      feedback = score > 85 ? "Perfect pronunciation!" : 
                 score > 75 ? "Good pronunciation, just a bit more confidence!" :
                 "Practice saying it a few more times to build confidence.";
    }

    return { score, feedback };
  };

  const simulateVocabularySuggestion = (context: string): string[] => {
    // Enhanced vocabulary suggestions with more contextual relevance
    const contextLower = context.toLowerCase();
    const suggestions: Record<string, string[]> = {
      "greeting": ["Hello", "Hi", "Good morning", "Good afternoon", "Good evening", "Hey there", "Greetings"],
      "emotions": ["Happy", "Sad", "Excited", "Nervous", "Confident", "Anxious", "Relaxed", "Frustrated", "Proud", "Embarrassed"],
      "food": ["Delicious", "Tasty", "Spicy", "Sweet", "Sour", "Fresh", "Bitter", "Savory", "Crunchy", "Smooth"],
      "travel": ["Journey", "Adventure", "Destination", "Explore", "Discover", "Experience", "Wander", "Roam", "Venture", "Expedition"],
      "work": ["Professional", "Efficient", "Productive", "Collaborative", "Innovative", "Strategic", "Organized", "Reliable", "Ambitious", "Dedicated"],
      "family": ["Loving", "Supportive", "Caring", "Close-knit", "Warm", "Understanding", "Protective", "Nurturing", "Devoted", "Affectionate"],
      "weather": ["Sunny", "Cloudy", "Rainy", "Windy", "Stormy", "Foggy", "Clear", "Mild", "Chilly", "Humid"],
      "technology": ["Innovative", "Advanced", "Efficient", "User-friendly", "Cutting-edge", "Digital", "Automated", "Smart", "Connected", "Intuitive"],
      "education": ["Knowledgeable", "Curious", "Studious", "Intellectual", "Academic", "Scholarly", "Inquisitive", "Learned", "Educated", "Well-read"],
      "sports": ["Athletic", "Energetic", "Competitive", "Skilled", "Agile", "Strong", "Fast", "Flexible", "Enduring", "Determined"]
    };

    // Find the most relevant category
    for (const [category, words] of Object.entries(suggestions)) {
      if (contextLower.includes(category)) {
        return words.slice(0, 5); // Return 5 most relevant words
      }
    }

    // Default suggestions based on common contexts
    if (contextLower.includes('good') || contextLower.includes('great') || contextLower.includes('nice')) {
      return ["Excellent", "Wonderful", "Fantastic", "Amazing", "Outstanding"];
    } else if (contextLower.includes('bad') || contextLower.includes('terrible') || contextLower.includes('awful')) {
      return ["Disappointing", "Frustrating", "Concerning", "Troubling", "Unfortunate"];
    } else if (contextLower.includes('big') || contextLower.includes('large') || contextLower.includes('huge')) {
      return ["Enormous", "Massive", "Gigantic", "Immense", "Colossal"];
    } else if (contextLower.includes('small') || contextLower.includes('tiny') || contextLower.includes('little')) {
      return ["Minute", "Petite", "Compact", "Miniature", "Diminutive"];
    }

    return ["Interesting", "Amazing", "Wonderful", "Fantastic", "Great"];
  };

  const simulateConversationStarter = (topic: string, level: LanguageLevel): string[] => {
    // Enhanced conversation starters with more realistic and engaging questions
    const starters: Partial<Record<LanguageLevel, Record<string, string[]>>> = {
      a1: {
        "hobbies": [
          "What do you like to do for fun?",
          "Do you like music? What kind?",
          "What is your favorite color?",
          "Do you like sports?",
          "What do you do on weekends?"
        ],
        "food": [
          "Do you like pizza?",
          "What food do you like?",
          "Do you cook?",
          "What is your favorite drink?",
          "Do you like coffee or tea?"
        ],
        "family": [
          "Do you have brothers or sisters?",
          "Where does your family live?",
          "Do you live with your family?",
          "What does your family do?",
          "Do you have pets?"
        ],
        "work": [
          "What do you do for work?",
          "Do you like your job?",
          "Where do you work?",
          "What time do you start work?",
          "Do you work on weekends?"
        ]
      },
      b1: {
        "hobbies": [
          "What hobbies do you enjoy in your free time?",
          "Have you tried any new activities recently?",
          "What would you like to learn?",
          "How did you get interested in your hobbies?",
          "What's the most challenging hobby you've tried?"
        ],
        "food": [
          "What's your favorite cuisine and why?",
          "Do you enjoy cooking or prefer eating out?",
          "What's the most interesting dish you've tried?",
          "How important is food in your culture?",
          "What's your comfort food?"
        ],
        "travel": [
          "What's the most interesting place you've visited?",
          "Where would you like to travel next?",
          "What do you look for when choosing a destination?",
          "How do you plan your trips?",
          "What's your travel style - adventurous or relaxed?"
        ],
        "technology": [
          "How has technology changed your daily life?",
          "What's your relationship with social media?",
          "What technology are you most excited about?",
          "How do you stay organized digitally?",
          "What's your favorite app and why?"
        ]
      },
      c1: {
        "hobbies": [
          "How do your hobbies contribute to your personal growth?",
          "What challenges have you faced while pursuing your interests?",
          "How do you balance hobbies with other responsibilities?",
          "What skills have you developed through your hobbies?",
          "How have your interests evolved over time?"
        ],
        "food": [
          "How does food culture reflect societal values?",
          "What role does food play in your cultural identity?",
          "How has your relationship with food evolved over time?",
          "What ethical considerations do you have about food choices?",
          "How do you think food connects people across cultures?"
        ],
        "philosophy": [
          "What do you think is the meaning of life?",
          "How do you define success?",
          "What values are most important to you?",
          "How do you approach difficult decisions?",
          "What do you think about the balance between tradition and progress?"
        ],
        "society": [
          "How do you think society has changed in the last decade?",
          "What social issues are most important to you?",
          "How do you think technology is affecting human relationships?",
          "What role should education play in society?",
          "How do you think we can build better communities?"
        ]
      }
    };

    return starters[level]?.[topic] || [
      "Tell me about yourself",
      "What's on your mind?",
      "How was your day?",
      "What's new in your life?",
      "What are you looking forward to?"
    ];
  };

  const updateSkillProgress = (skill: 'speaking' | 'listening' | 'writing' | 'reading', improvement: number) => {
    setSettings(prev => ({
      ...prev,
      speakingConfidence: skill === 'speaking' ? Math.min(100, prev.speakingConfidence + improvement) : prev.speakingConfidence,
      listeningComprehension: skill === 'listening' ? Math.min(100, prev.listeningComprehension + improvement) : prev.listeningComprehension,
      writingAccuracy: skill === 'writing' ? Math.min(100, prev.writingAccuracy + improvement) : prev.writingAccuracy,
      readingSpeed: skill === 'reading' ? Math.min(100, prev.readingSpeed + improvement) : prev.readingSpeed,
    }));
  };

  const getLearningInsights = () => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze speaking confidence
    if (settings.speakingConfidence > 80) {
      strengths.push("Excellent speaking confidence - you communicate clearly");
    } else if (settings.speakingConfidence > 65) {
      strengths.push("Good speaking confidence - you're comfortable in conversations");
    } else {
      weaknesses.push("Speaking confidence needs improvement");
      recommendations.push("Practice speaking more frequently - try recording yourself");
    }

    // Analyze listening comprehension
    if (settings.listeningComprehension > 80) {
      strengths.push("Strong listening skills - you understand native speakers well");
    } else if (settings.listeningComprehension > 65) {
      strengths.push("Good listening comprehension - you follow conversations well");
    } else {
      weaknesses.push("Listening comprehension could be better");
      recommendations.push("Listen to podcasts, music, and watch videos in your target language");
    }

    // Analyze writing accuracy
    if (settings.writingAccuracy > 75) {
      strengths.push("Strong writing skills - your grammar is quite accurate");
    } else if (settings.writingAccuracy > 60) {
      strengths.push("Good writing foundation - you express yourself clearly");
    } else {
      weaknesses.push("Writing accuracy needs work");
      recommendations.push("Focus on grammar corrections and practice writing daily");
    }

    // Analyze reading speed
    if (settings.readingSpeed > 80) {
      strengths.push("Fast reading speed - you process text efficiently");
    } else if (settings.readingSpeed > 65) {
      strengths.push("Good reading pace - you understand written content well");
    } else {
      weaknesses.push("Reading speed could be improved");
      recommendations.push("Read more frequently - start with simple texts and gradually increase difficulty");
    }

    // Analyze vocabulary progress
    const vocabProgress = getVocabularyProgress();
    if (vocabProgress.total > 100) {
      strengths.push("Extensive vocabulary - you have a wide range of words");
    } else if (vocabProgress.total > 50) {
      strengths.push("Good vocabulary range - you're building a solid foundation");
    } else {
      weaknesses.push("Vocabulary could be expanded");
      recommendations.push("Learn 5-10 new words daily and review them regularly");
    }

    // Analyze learning consistency
    if (settings.learningStreak > 7) {
      strengths.push("Excellent learning consistency - you practice regularly");
    } else if (settings.learningStreak > 3) {
      strengths.push("Good learning habits - you're building momentum");
    } else {
      weaknesses.push("Learning consistency needs improvement");
      recommendations.push("Set a daily learning goal and stick to it - even 10 minutes helps");
    }

    // Analyze session completion
    if (settings.sessionsCompleted > 20) {
      strengths.push("Dedicated learner - you complete many practice sessions");
    } else if (settings.sessionsCompleted > 10) {
      strengths.push("Active learner - you engage in regular practice");
    } else {
      weaknesses.push("Session completion could be higher");
      recommendations.push("Complete at least one learning session per day");
    }

    // Analyze corrections received
    if (settings.correctionsReceived > 50) {
      strengths.push("You actively seek feedback and learn from mistakes");
    } else if (settings.correctionsReceived > 20) {
      strengths.push("You're open to learning and improving");
    } else {
      weaknesses.push("You might benefit from more active feedback");
      recommendations.push("Enable grammar checking and practice mode to get more feedback");
    }

    // Add personalized recommendations based on level
    if (settings.languageLevel === 'a1' || settings.languageLevel === 'a2') {
      recommendations.push("Focus on basic vocabulary and simple sentence structures");
      recommendations.push("Practice with native speakers when possible");
    } else if (settings.languageLevel === 'b1' || settings.languageLevel === 'b2') {
      recommendations.push("Work on more complex grammar structures and idiomatic expressions");
      recommendations.push("Try to think in your target language rather than translating");
    } else {
      recommendations.push("Focus on nuanced expressions and cultural understanding");
      recommendations.push("Challenge yourself with advanced materials and discussions");
    }

    // Add recommendations based on common mistakes
    if (settings.commonMistakes.length > 0) {
      const recentMistakes = settings.commonMistakes.slice(-3);
      recommendations.push(`Review these common mistakes: ${recentMistakes.join(', ')}`);
    }

    return { strengths, weaknesses, recommendations };
  };

  // Helper functions
  const getPersonalityDescription = (personality?: AIPersonality) => {
    const p = personality || settings.aiPersonality;
    const descriptions = {
      friendly: 'Warm, encouraging, and patient with mistakes',
      academic: 'Precise explanations with proper grammar rules',
      casual: 'Relaxed tone with humor and everyday examples',
      encouraging: 'Perfect for shy learners, very patient and positive'
    };
    return descriptions[p];
  };

  const getLanguageDisplayName = (code: LanguageCode) => {
    const names = {
      english: '🇺🇸 English',
      georgian: '🇬🇪 Georgian (ქართული)',
      spanish: '🇪🇸 Spanish (Español)',
      french: '🇫🇷 French (Français)'
    };
    return names[code];
  };

  const getLevelDisplayName = (level: LanguageLevel) => {
    const names = {
      a1: 'A1 Beginner',
      a2: 'A2 Elementary',
      b1: 'B1 Intermediate',
      b2: 'B2 Upper-Intermediate',
      c1: 'C1 Advanced',
      c2: 'C2 Proficient'
    };
    return names[level];
  };

  const isLearningModeActive = () => {
    return settings.practiceMode || settings.autoCorrect || settings.grammarCheckEnabled;
  };

  const getVocabularyProgress = () => {
    const total = settings.wordsLearned.length;
    const mastered = settings.wordsLearned.filter(w => w.reviewCount > 5).length;
    const learning = settings.wordsLearned.filter(w => w.reviewCount > 0 && w.reviewCount <= 5).length;
    const newWords = settings.wordsLearned.filter(w => w.reviewCount === 0).length;

    return { total, mastered, learning, new: newWords };
  };

  const getGrammarProgress = () => {
    const totalRules = 20; // Simulated total grammar rules
    const masteredRules = Math.floor(settings.correctionsReceived / 3); // Simulated mastery
    const commonMistakes = settings.commonMistakes.slice(-5);

    return { totalRules, masteredRules, commonMistakes };
  };

  // Sync practice mode with safe mode
  useEffect(() => {
    if (settings.practiceMode && settings.autoCorrect) {
      console.log('Language learning mode is now active with AI corrections');
    }
  }, [settings.practiceMode, settings.autoCorrect]);

  const contextValue: LanguageAIContextType = {
    ...settings,
    setLearningLanguage,
    setLanguageLevel,
    setNativeLanguage,
    setAIPersonality,
    setAutoCorrect,
    setPracticeMode,
    setTranslationEnabled,
    setGrammarCheckEnabled,
    addCorrection,
    addWordLearned,
    incrementStreak,
    completeSession,
    startLearningSession,
    endLearningSession,
    simulateGrammarCheck,
    simulateTranslation,
    simulatePronunciationFeedback,
    simulateVocabularySuggestion,
    simulateConversationStarter,
    updateSkillProgress,
    getLearningInsights,
    getPersonalityDescription,
    getLanguageDisplayName,
    getLevelDisplayName,
    isLearningModeActive,
    getVocabularyProgress,
    getGrammarProgress,
  };

  return (
    <LanguageAIContext.Provider value={contextValue}>
      {children}
    </LanguageAIContext.Provider>
  );
};
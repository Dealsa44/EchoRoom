import { toast } from '@/hooks/use-toast';

export interface ConversationMetrics {
  messageCount: number;
  averageResponseTime: number;
  emotionalTone: 'positive' | 'neutral' | 'negative' | 'mixed';
  topicDiversity: number;
  engagementLevel: number;
  communicationStyle: 'formal' | 'casual' | 'playful' | 'deep';
  sharedInterests: string[];
  compatibilityScore: number;
}

export interface MessageAnalysis {
  sentiment: number; // -1 to 1
  topics: string[];
  complexity: number; // 0 to 1
  engagement: number; // 0 to 1
  responseTime?: number; // in seconds
  emotionalIndicators: string[];
}

export interface CompatibilityInsight {
  category: 'communication' | 'interests' | 'values' | 'personality' | 'lifestyle';
  score: number; // 0 to 100
  description: string;
  evidence: string[];
  suggestions: string[];
}

// Mock conversation topics and their weights
const TOPIC_WEIGHTS = {
  'philosophy': 0.9,
  'books': 0.8,
  'travel': 0.7,
  'music': 0.7,
  'art': 0.8,
  'science': 0.9,
  'movies': 0.6,
  'food': 0.5,
  'sports': 0.4,
  'technology': 0.7,
  'nature': 0.8,
  'mindfulness': 0.9,
  'career': 0.6,
  'family': 0.8,
  'dreams': 0.9,
  'values': 0.95,
  'goals': 0.85,
  'humor': 0.7,
  'creativity': 0.8,
  'learning': 0.9
};

// Sentiment analysis keywords
const POSITIVE_WORDS = [
  'love', 'amazing', 'wonderful', 'great', 'excellent', 'fantastic', 'awesome',
  'beautiful', 'perfect', 'happy', 'excited', 'thrilled', 'delighted', 'joy',
  'brilliant', 'incredible', 'outstanding', 'magnificent', 'superb', 'lovely',
  'adorable', 'charming', 'inspiring', 'uplifting', 'positive', 'optimistic'
];

const NEGATIVE_WORDS = [
  'hate', 'terrible', 'awful', 'bad', 'horrible', 'disgusting', 'annoying',
  'frustrated', 'angry', 'sad', 'depressed', 'worried', 'anxious', 'stressed',
  'disappointing', 'boring', 'dull', 'uninteresting', 'problematic', 'difficult'
];

const DEEP_CONVERSATION_INDICATORS = [
  'what do you think about', 'philosophy', 'meaning of', 'purpose', 'values',
  'believe in', 'important to me', 'deep conversation', 'soul', 'spirituality',
  'life goals', 'dreams', 'aspirations', 'personal growth', 'self-reflection',
  'consciousness', 'existence', 'authentic', 'genuine', 'vulnerability'
];

const PLAYFUL_INDICATORS = [
  'haha', 'lol', 'funny', 'joke', 'silly', 'playful', 'teasing', 'witty',
  '😂', '😄', '😊', '😉', '😜', 'humor', 'sarcastic', 'amusing', 'entertaining'
];

// Analyze individual message
export const analyzeMessage = (message: string, timestamp?: Date): MessageAnalysis => {
  const words = message.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  // Sentiment analysis
  const positiveCount = words.filter(word => POSITIVE_WORDS.includes(word)).length;
  const negativeCount = words.filter(word => NEGATIVE_WORDS.includes(word)).length;
  const sentiment = positiveCount > 0 || negativeCount > 0 
    ? (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1)
    : 0;

  // Topic detection
  const topics: string[] = [];
  Object.keys(TOPIC_WEIGHTS).forEach(topic => {
    if (message.toLowerCase().includes(topic) || 
        words.some(word => word.includes(topic.slice(0, 4)))) {
      topics.push(topic);
    }
  });

  // Complexity based on sentence structure and vocabulary
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
  const sentenceCount = message.split(/[.!?]+/).length - 1;
  const complexity = Math.min((avgWordLength / 6 + sentenceCount / wordCount * 2) / 2, 1);

  // Engagement level
  const questionMarks = (message.match(/\?/g) || []).length;
  const exclamationMarks = (message.match(/!/g) || []).length;
  const engagement = Math.min((questionMarks * 0.3 + exclamationMarks * 0.2 + wordCount / 50) / 2, 1);

  // Emotional indicators
  const emotionalIndicators: string[] = [];
  if (DEEP_CONVERSATION_INDICATORS.some(indicator => message.toLowerCase().includes(indicator))) {
    emotionalIndicators.push('deep');
  }
  if (PLAYFUL_INDICATORS.some(indicator => message.toLowerCase().includes(indicator))) {
    emotionalIndicators.push('playful');
  }
  if (sentiment > 0.3) emotionalIndicators.push('positive');
  if (sentiment < -0.3) emotionalIndicators.push('negative');

  return {
    sentiment,
    topics,
    complexity,
    engagement,
    emotionalIndicators
  };
};

// Analyze entire conversation
export const analyzeConversation = (messages: Array<{
  content: string;
  timestamp: Date;
  senderId: string;
  userId: string;
}>): ConversationMetrics => {
  if (messages.length === 0) {
    return {
      messageCount: 0,
      averageResponseTime: 0,
      emotionalTone: 'neutral',
      topicDiversity: 0,
      engagementLevel: 0,
      communicationStyle: 'casual',
      sharedInterests: [],
      compatibilityScore: 50
    };
  }

  const userMessages = messages.filter(m => m.senderId === m.userId);
  const partnerMessages = messages.filter(m => m.senderId !== m.userId);
  
  // Analyze all messages
  const allAnalyses = messages.map(msg => analyzeMessage(msg.content, msg.timestamp));
  
  // Calculate response times
  const responseTimes: number[] = [];
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].senderId !== messages[i-1].senderId) {
      const timeDiff = messages[i].timestamp.getTime() - messages[i-1].timestamp.getTime();
      responseTimes.push(timeDiff / 1000); // Convert to seconds
    }
  }

  const averageResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
    : 0;

  // Emotional tone analysis
  const avgSentiment = allAnalyses.reduce((sum, analysis) => sum + analysis.sentiment, 0) / allAnalyses.length;
  let emotionalTone: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
  if (avgSentiment > 0.2) emotionalTone = 'positive';
  else if (avgSentiment < -0.2) emotionalTone = 'negative';
  else if (Math.abs(avgSentiment) < 0.1) emotionalTone = 'neutral';
  else emotionalTone = 'mixed';

  // Topic diversity
  const allTopics = new Set(allAnalyses.flatMap(analysis => analysis.topics));
  const topicDiversity = Math.min(allTopics.size / 10, 1); // Normalize to 0-1

  // Engagement level
  const avgEngagement = allAnalyses.reduce((sum, analysis) => sum + analysis.engagement, 0) / allAnalyses.length;

  // Communication style
  const avgComplexity = allAnalyses.reduce((sum, analysis) => sum + analysis.complexity, 0) / allAnalyses.length;
  const deepIndicators = allAnalyses.filter(analysis => analysis.emotionalIndicators.includes('deep')).length;
  const playfulIndicators = allAnalyses.filter(analysis => analysis.emotionalIndicators.includes('playful')).length;
  
  let communicationStyle: 'formal' | 'casual' | 'playful' | 'deep' = 'casual';
  if (deepIndicators > messages.length * 0.3) communicationStyle = 'deep';
  else if (playfulIndicators > messages.length * 0.2) communicationStyle = 'playful';
  else if (avgComplexity > 0.7) communicationStyle = 'formal';

  // Shared interests (topics mentioned by both users)
  const userTopics = new Set(userMessages.flatMap(msg => analyzeMessage(msg.content).topics));
  const partnerTopics = new Set(partnerMessages.flatMap(msg => analyzeMessage(msg.content).topics));
  const sharedInterests = Array.from(userTopics).filter(topic => partnerTopics.has(topic));

  // Compatibility score calculation
  const topicCompatibility = sharedInterests.length * 10;
  const toneCompatibility = emotionalTone === 'positive' ? 20 : emotionalTone === 'mixed' ? 15 : 10;
  const engagementCompatibility = avgEngagement * 20;
  const responseTimeCompatibility = Math.max(0, 20 - (averageResponseTime / 3600)); // Penalty for very slow responses
  const diversityBonus = topicDiversity * 15;
  
  const compatibilityScore = Math.min(100, Math.max(0,
    topicCompatibility + toneCompatibility + engagementCompatibility + responseTimeCompatibility + diversityBonus
  ));

  return {
    messageCount: messages.length,
    averageResponseTime,
    emotionalTone,
    topicDiversity,
    engagementLevel: avgEngagement,
    communicationStyle,
    sharedInterests,
    compatibilityScore: Math.round(compatibilityScore)
  };
};

// Generate compatibility insights
export const generateCompatibilityInsights = (metrics: ConversationMetrics): CompatibilityInsight[] => {
  const insights: CompatibilityInsight[] = [];

  // Communication compatibility
  insights.push({
    category: 'communication',
    score: Math.round(Math.min(100, metrics.engagementLevel * 50 + (metrics.averageResponseTime < 3600 ? 30 : 10) + 20)),
    description: `Your communication styles ${metrics.engagementLevel > 0.7 ? 'align very well' : metrics.engagementLevel > 0.4 ? 'complement each other' : 'have room for growth'}`,
    evidence: [
      `${metrics.communicationStyle} communication style`,
      `${metrics.emotionalTone} emotional tone`,
      `Average response time: ${Math.round(metrics.averageResponseTime / 60)} minutes`
    ],
    suggestions: metrics.engagementLevel < 0.5 ? [
      'Try asking more open-ended questions',
      'Share personal stories to deepen the connection',
      'Use emojis to express emotions more clearly'
    ] : [
      'Your conversation flow is excellent!',
      'Keep exploring new topics together',
      'Consider voice or video calls for deeper connection'
    ]
  });

  // Interest compatibility
  const interestScore = Math.round(Math.min(100, metrics.sharedInterests.length * 15 + metrics.topicDiversity * 40));
  insights.push({
    category: 'interests',
    score: interestScore,
    description: `You share ${metrics.sharedInterests.length} common interests and explore diverse topics together`,
    evidence: [
      `Shared interests: ${metrics.sharedInterests.join(', ') || 'Still discovering'}`,
      `Topic diversity: ${Math.round(metrics.topicDiversity * 100)}%`,
      `${metrics.messageCount} messages exchanged`
    ],
    suggestions: interestScore < 60 ? [
      'Try discussing your hobbies and passions',
      'Ask about their favorite books, movies, or activities',
      'Share something you\'re learning or curious about'
    ] : [
      'Great topic variety in your conversations!',
      'Consider planning activities around shared interests',
      'Explore deeper aspects of topics you both enjoy'
    ]
  });

  // Personality compatibility
  const personalityScore = metrics.emotionalTone === 'positive' ? 85 : 
                          metrics.emotionalTone === 'mixed' ? 75 : 
                          metrics.emotionalTone === 'neutral' ? 65 : 45;
  insights.push({
    category: 'personality',
    score: personalityScore,
    description: `Your personalities ${personalityScore > 80 ? 'complement each other beautifully' : personalityScore > 60 ? 'work well together' : 'are still getting to know each other'}`,
    evidence: [
      `Overall tone: ${metrics.emotionalTone}`,
      `Communication style: ${metrics.communicationStyle}`,
      `Engagement level: ${Math.round(metrics.engagementLevel * 100)}%`
    ],
    suggestions: personalityScore < 70 ? [
      'Share more about your values and beliefs',
      'Discuss what makes you happy or excited',
      'Be open about your communication preferences'
    ] : [
      'Your personalities mesh really well!',
      'Consider deeper conversations about life goals',
      'Share your dreams and aspirations'
    ]
  });

  return insights;
};

// Real-time conversation coaching
export const getConversationSuggestions = (
  recentMessages: string[],
  userProfile: { interests: string[]; communicationStyle?: string }
): string[] => {
  if (recentMessages.length === 0) {
    return [
      "Start with a warm greeting and ask about their day",
      "Share something interesting that happened to you recently",
      "Ask an open-ended question about their interests"
    ];
  }

  const lastMessage = recentMessages[recentMessages.length - 1];
  const lastAnalysis = analyzeMessage(lastMessage);
  const suggestions: string[] = [];

  // If conversation is getting shallow
  if (lastAnalysis.complexity < 0.3 && lastAnalysis.topics.length === 0) {
    suggestions.push(
      "Try asking about their passions or dreams",
      "Share a personal story or experience",
      "Ask about their thoughts on something meaningful"
    );
  }

  // If they seem disengaged
  if (lastAnalysis.engagement < 0.3) {
    suggestions.push(
      "Ask an interesting question to re-engage",
      "Share something exciting from your day",
      "Suggest a fun topic or game to play"
    );
  }

  // If conversation is going well
  if (lastAnalysis.engagement > 0.7 && lastAnalysis.sentiment > 0.3) {
    suggestions.push(
      "The conversation is flowing great! Keep it up",
      "Consider sharing something more personal",
      "Ask about their future goals or dreams"
    );
  }

  // Topic-specific suggestions
  if (lastAnalysis.topics.length > 0) {
    const topic = lastAnalysis.topics[0];
    if (userProfile.interests.includes(topic)) {
      suggestions.push(`Great! You both seem interested in ${topic}. Share your perspective!`);
    } else {
      suggestions.push(`They mentioned ${topic}. Ask them to tell you more about it!`);
    }
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
};

// Simulate real-time analysis for demo
export const simulateConversationAnalysis = (partnerId: string) => {
  // Mock conversation data
  const mockMessages = [
    { content: "Hi! I love your profile, especially the philosophy books mention", senderId: partnerId, userId: "current", timestamp: new Date(Date.now() - 3600000) },
    { content: "Thank you! I see you're into mindfulness too. What drew you to it?", senderId: "current", userId: "current", timestamp: new Date(Date.now() - 3500000) },
    { content: "I started meditating after reading about Stoicism. It changed my perspective on life", senderId: partnerId, userId: "current", timestamp: new Date(Date.now() - 3000000) },
    { content: "That's amazing! I've been exploring Stoicism too. Marcus Aurelius is incredible", senderId: "current", userId: "current", timestamp: new Date(Date.now() - 2800000) },
    { content: "Yes! His Meditations is life-changing. Do you have other philosophical interests?", senderId: partnerId, userId: "current", timestamp: new Date(Date.now() - 2400000) },
    { content: "I'm fascinated by Eastern philosophy too - Buddhism, Taoism. The concept of mindful living", senderId: "current", userId: "current", timestamp: new Date(Date.now() - 2000000) }
  ];

  const metrics = analyzeConversation(mockMessages);
  const insights = generateCompatibilityInsights(metrics);

  return { metrics, insights };
};

// Export for use in components
export const showCompatibilityInsights = (partnerId: string, partnerName: string) => {
  const { metrics, insights } = simulateConversationAnalysis(partnerId);
  
  toast({
    title: `💚 Compatibility with ${partnerName}`,
    description: `${metrics.compatibilityScore}% compatibility • ${metrics.sharedInterests.length} shared interests • ${metrics.communicationStyle} communication`,
  });

  return { metrics, insights };
};
import { Profile } from '@/types';

export const mockProfiles: Profile[] = [
  {
    id: 1,
    name: 'Luna',
    avatar: '🌙',
    age: 24,
    location: 'Tbilisi, Georgia',
    distance: 2.3,
    bio: 'Philosophy student who loves deep conversations and poetry. Looking for meaningful connections.',
    about: 'I\'m a philosophy student passionate about deep conversations, poetry, and exploring life\'s big questions. I enjoy reading in cozy cafes and discussing ideas that challenge my perspective.',
    interests: ['Philosophy', 'Poetry', 'Mindfulness', 'Reading'],
    languageProficiency: 'B2',
    languageLevel: 'B2',
    chatStyle: 'introvert',
    lastActive: '2 hours ago',
    isOnline: false,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'bisexual',
    lookingForRelationship: true,
    lookingForFriendship: true,
    smoking: 'never',
    drinking: 'socially',
    hasChildren: 'no',
    education: 'bachelor',
    occupation: 'Student',
    religion: 'atheist',
    politicalViews: 'liberal',
    photos: [
      'https://picsum.photos/400/400?random=1',
      'https://picsum.photos/400/400?random=2',
      'https://picsum.photos/400/400?random=3'
    ],
    isVerified: true,
    profileCompletion: 95,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Reading philosophy books in a cozy café with good coffee",
      "If you could travel anywhere right now, where would you go?": "Greece to explore ancient philosophy sites",
      "What's the best book you've read recently?": "The Republic by Plato - it changed my perspective on everything"
    },
    profileQuestions: [
      {
        id: 'deep-1',
        question: "What's your biggest fear and how do you cope with it?",
        category: 'deep',
        answer: "My biggest fear is not living up to my potential. I cope by constantly learning and challenging myself to grow."
      },
      {
        id: 'flirty-1',
        question: "What's your idea of a perfect first date?",
        category: 'flirty',
        answer: "A long walk in a beautiful park, followed by coffee and deep conversation about life and dreams."
      },
      {
        id: 'casual-3',
        question: "What's the best book you've read recently?",
        category: 'casual',
        answer: "The Republic by Plato - it completely changed my perspective on justice and society."
      },
      {
        id: 'funny-2',
        question: "If you could have any superpower, what would it be and why?",
        category: 'funny',
        answer: "The ability to read minds, but only when I want to. It would help me understand people better."
      },
      {
        id: 'creative-5',
        question: "If you could have dinner with anyone from history, who would it be?",
        category: 'creative',
        answer: "Socrates. I'd love to discuss philosophy and challenge my own beliefs with the father of Western philosophy."
      }
    ]
  },
  {
    id: 2,
    name: 'Alex',
    avatar: '📚',
    age: 28,
    location: 'London, UK',
    distance: 5.1,
    bio: 'Book enthusiast and language learner. Seeking someone to explore ideas and practice languages with.',
    about: 'I\'m a passionate book lover and language enthusiast. I work in publishing and love exploring different cultures through literature and language learning. Always up for deep discussions about books and ideas.',
    interests: ['Books', 'Languages', 'Culture', 'Travel'],
    languageProficiency: 'C1',
    languageLevel: 'C1',
    chatStyle: 'ambievert',
    lastActive: '1 hour ago',
    isOnline: true,
    sharedInterests: 3,
    genderIdentity: 'non-binary',
    orientation: 'pansexual',
    lookingForRelationship: false,
    lookingForFriendship: true,
    smoking: 'never',
    drinking: 'casually',
    hasChildren: 'no',
    education: 'master',
    occupation: 'Publishing Editor',
    religion: 'agnostic',
    politicalViews: 'moderate',
    photos: [
      'https://picsum.photos/400/400?random=4',
      'https://picsum.photos/400/400?random=5',
      'https://picsum.photos/400/400?random=6'
    ],
    isVerified: true,
    profileCompletion: 88,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Exploring bookstores and trying new cuisines",
      "If you could travel anywhere right now, where would you go?": "Japan to practice Japanese and explore culture",
      "What's the best book you've read recently?": "The Midnight Library - it made me think about life choices"
    },
    profileQuestions: [
      {
        id: 'casual-1',
        question: "What's your favorite way to spend a lazy Sunday?",
        category: 'casual',
        answer: "Curled up with a good book and a cup of tea, preferably in a cozy corner of a café."
      },
      {
        id: 'flirty-2',
        question: "What's the most attractive quality in a person?",
        category: 'flirty',
        answer: "Intellectual curiosity and the ability to have deep, meaningful conversations."
      },
      {
        id: 'creative-3',
        question: "If you could live in any fictional world, which would you choose?",
        category: 'creative',
        answer: "Hogwarts from Harry Potter - the magic, the books, and the sense of adventure!"
      },
      {
        id: 'deep-2',
        question: "What's the most important lesson life has taught you?",
        category: 'deep',
        answer: "That everyone has a story worth listening to, and understanding comes from truly hearing others."
      },
      {
        id: 'funny-4',
        question: "If you were a vegetable, which one would you be?",
        category: 'funny',
        answer: "A potato - versatile, comforting, and always there when you need something reliable!"
      }
    ]
  },
  // Continue with remaining profiles - I'll add a few more key ones
  {
    id: 3,
    name: 'Sage',
    avatar: '🌱',
    age: 22,
    location: 'San Francisco, USA',
    distance: 8.7,
    bio: 'Mindfulness practitioner and nature lover. Looking for gentle souls to share wisdom with.',
    about: 'I\'m a mindfulness practitioner and yoga instructor who finds peace in nature. I believe in the power of presence and helping others find their inner calm. I love hiking, meditation, and sharing wisdom with kind souls.',
    interests: ['Mindfulness', 'Nature', 'Art', 'Meditation'],
    languageProficiency: 'A2',
    languageLevel: 'A2',
    chatStyle: 'introvert',
    lastActive: '30 min ago',
    isOnline: true,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    lookingForRelationship: true,
    lookingForFriendship: false,
    smoking: 'never',
    drinking: 'never',
    hasChildren: 'no',
    education: 'bachelor',
    occupation: 'Yoga Instructor',
    religion: 'buddhism',
    politicalViews: 'liberal',
    photos: [
      'https://picsum.photos/400/400?random=7',
      'https://picsum.photos/400/400?random=8',
      'https://picsum.photos/400/400?random=9'
    ],
    isVerified: false,
    profileCompletion: 72,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Hiking in nature and practicing meditation",
      "If you could travel anywhere right now, where would you go?": "Bali for spiritual retreat and yoga",
      "What's something you're passionate about?": "Helping others find inner peace and mindfulness"
    },
    profileQuestions: [
      {
        id: 'deep-3',
        question: "What's your biggest dream and what's stopping you from achieving it?",
        category: 'deep',
        answer: "My dream is to open a wellness retreat center. What's stopping me is the fear of financial failure, but I'm working on it step by step."
      },
      {
        id: 'casual-2',
        question: "What's your go-to comfort food?",
        category: 'casual',
        answer: "A warm bowl of vegetable soup with fresh herbs from my garden."
      },
      {
        id: 'flirty-3',
        question: "What's your love language?",
        category: 'flirty',
        answer: "Quality time and acts of service. I love being present with someone and doing thoughtful things for them."
      },
      {
        id: 'creative-2',
        question: "What's your creative outlet?",
        category: 'creative',
        answer: "Painting mandalas and creating nature-inspired art. It helps me find inner peace."
      },
      {
        id: 'funny-5',
        question: "What's the most ridiculous thing you've ever done to avoid social interaction?",
        category: 'funny',
        answer: "Once I pretended to be on a phone call for 20 minutes to avoid talking to someone at a party!"
      }
    ]
  },
  // Adding remaining profiles with complete data
  {
    id: 4,
    name: 'Maya',
    avatar: '🎨',
    age: 26,
    location: 'Paris, France',
    distance: 12.3,
    bio: 'Artist and coffee enthusiast. Love discussing art, culture, and life over a good cup of coffee.',
    about: 'I\'m a passionate artist who finds inspiration in everyday moments. I love creating art that tells stories and connects people. When I\'m not painting, you\'ll find me in cozy cafes discussing life and culture.',
    interests: ['Art', 'Coffee', 'Travel', 'Photography'],
    languageProficiency: 'B1',
    languageLevel: 'B1',
    chatStyle: 'extrovert',
    lastActive: '15 min ago',
    isOnline: true,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'lesbian',
    lookingForRelationship: true,
    lookingForFriendship: false,
    smoking: 'never',
    drinking: 'socially',
    hasChildren: 'no',
    education: 'bachelor',
    occupation: 'Artist',
    religion: 'agnostic',
    politicalViews: 'liberal',
    photos: [
      'https://picsum.photos/400/400?random=10',
      'https://picsum.photos/400/400?random=11',
      'https://picsum.photos/400/400?random=12'
    ],
    isVerified: true,
    profileCompletion: 91,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Painting in my studio and exploring art galleries",
      "If you could travel anywhere right now, where would you go?": "Italy to see the Renaissance art in person",
      "What's something you're passionate about?": "Creating art that tells stories and connects people"
    },
    profileQuestions: [
      {
        id: 'creative-1',
        question: "If you could create any invention, what would it be?",
        category: 'creative',
        answer: "A device that can capture and replay emotions through art - like a mood translator for paintings."
      },
      {
        id: 'flirty-4',
        question: "What's the most romantic thing someone has ever done for you?",
        category: 'flirty',
        answer: "Someone once surprised me with a private art gallery tour and then painted a portrait of me."
      },
      {
        id: 'casual-4',
        question: "What's your favorite season and why?",
        category: 'casual',
        answer: "Autumn - the colors are so inspiring for my art, and the cozy atmosphere is perfect for creativity."
      },
      {
        id: 'deep-4',
        question: "What's something you believe that most people disagree with?",
        category: 'deep',
        answer: "That art should be accessible to everyone, not just those who can afford it."
      },
      {
        id: 'funny-1',
        question: "What's the weirdest thing you've ever eaten?",
        category: 'funny',
        answer: "I once tried painting with edible colors and accidentally ate my art supplies!"
      }
    ]
  },
  {
    id: 5,
    name: 'Kai',
    avatar: '🏃',
    age: 30,
    location: 'Tokyo, Japan',
    distance: 15.8,
    bio: 'Fitness trainer and language exchange partner. Looking for friends to practice English and share workout tips.',
    about: 'I\'m a fitness trainer passionate about helping people achieve their health goals. I love martial arts, cooking healthy meals, and learning new languages. Always looking for workout buddies and language exchange partners.',
    interests: ['Fitness', 'Languages', 'Travel', 'Cooking'],
    languageProficiency: 'A2',
    languageLevel: 'A2',
    chatStyle: 'extrovert',
    lastActive: '45 min ago',
    isOnline: false,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    lookingForRelationship: false,
    lookingForFriendship: true,
    smoking: 'never',
    drinking: 'casually',
    hasChildren: 'no',
    education: 'bachelor',
    occupation: 'Fitness Trainer',
    religion: 'buddhism',
    politicalViews: 'moderate',
    photos: [
      'https://picsum.photos/400/400?random=13',
      'https://picsum.photos/400/400?random=14',
      'https://picsum.photos/400/400?random=15'
    ],
    isVerified: true,
    profileCompletion: 85,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Working out and trying new healthy recipes",
      "If you could travel anywhere right now, where would you go?": "Thailand for Muay Thai training",
      "What's something you're passionate about?": "Helping people achieve their fitness goals"
    },
    profileQuestions: [
      {
        id: 'flirty-5',
        question: "What's your biggest turn-on?",
        category: 'flirty',
        answer: "Confidence and someone who takes care of their health and body."
      },
      {
        id: 'casual-5',
        question: "What's something that always makes you laugh?",
        category: 'casual',
        answer: "Watching people try to do yoga poses for the first time - it's adorable!"
      },
      {
        id: 'deep-5',
        question: "What's the most meaningful conversation you've ever had?",
        category: 'deep',
        answer: "Talking with a client who overcame depression through fitness - it showed me the real impact of what I do."
      },
      {
        id: 'creative-4',
        question: "What's the most creative thing you've ever done?",
        category: 'creative',
        answer: "Created a workout routine that combines martial arts with dance moves."
      },
      {
        id: 'funny-3',
        question: "What's your most embarrassing childhood memory?",
        category: 'funny',
        answer: "I once tried to show off my karate moves and accidentally kicked my own face!"
      }
    ]
  }
];

export const getProfilesByIds = (ids: number[]): Profile[] => {
  return mockProfiles.filter(profile => ids.includes(profile.id));
};

export const getProfileById = (id: number): Profile | undefined => {
  return mockProfiles.find(profile => profile.id === id);
};

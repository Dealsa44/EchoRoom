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
    interests: ['Philosophy', 'Poetry', 'Mindfulness', 'Reading'],
    languageLevel: 'B2',
    chatStyle: 'introverted',
    lastActive: '2 hours ago',
    isOnline: false,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'bisexual',
    lookingForRelationship: true,

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
    }
  },
  {
    id: 2,
    name: 'Alex',
    avatar: '📚',
    age: 28,
    location: 'London, UK',
    distance: 5.1,
    bio: 'Book enthusiast and language learner. Seeking someone to explore ideas and practice languages with.',
    interests: ['Books', 'Languages', 'Culture', 'Travel'],
    languageLevel: 'C1',
    chatStyle: 'balanced',
    lastActive: '1 hour ago',
    isOnline: true,
    sharedInterests: 3,
    genderIdentity: 'non-binary',
    orientation: 'pansexual',
    lookingForRelationship: false,

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
    }
  },
  {
    id: 3,
    name: 'Sage',
    avatar: '🌱',
    age: 22,
    location: 'San Francisco, USA',
    distance: 8.7,
    bio: 'Mindfulness practitioner and nature lover. Looking for gentle souls to share wisdom with.',
    interests: ['Mindfulness', 'Nature', 'Art', 'Meditation'],
    languageLevel: 'A2',
    chatStyle: 'introverted',
    lastActive: '30 min ago',
    isOnline: true,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    lookingForRelationship: true,

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
    }
  },
  {
    id: 4,
    name: 'Maya',
    avatar: '🎨',
    age: 26,
    location: 'Paris, France',
    distance: 12.3,
    bio: 'Artist and coffee enthusiast. Love discussing art, culture, and life over a good cup of coffee.',
    interests: ['Art', 'Coffee', 'Travel', 'Photography'],
    languageLevel: 'B1',
    chatStyle: 'outgoing',
    lastActive: '15 min ago',
    isOnline: true,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'lesbian',
    lookingForRelationship: true,

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
    }
  },
  {
    id: 5,
    name: 'Kai',
    avatar: '🏃',
    age: 30,
    location: 'Tokyo, Japan',
    distance: 15.8,
    bio: 'Fitness trainer and language exchange partner. Looking for friends to practice English and share workout tips.',
    interests: ['Fitness', 'Languages', 'Travel', 'Cooking'],
    languageLevel: 'A2',
    chatStyle: 'outgoing',
    lastActive: '45 min ago',
    isOnline: false,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    lookingForRelationship: false,

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
    }
  }
];

export const getProfilesByIds = (ids: number[]): Profile[] => {
  return mockProfiles.filter(profile => ids.includes(profile.id));
};

export const getProfileById = (id: number): Profile | undefined => {
  return mockProfiles.find(profile => profile.id === id);
};
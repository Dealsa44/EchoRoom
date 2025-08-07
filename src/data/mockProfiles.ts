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
    chatStyle: 'introvert',
    lastActive: '2 hours ago',
    isOnline: false,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'bisexual',
    lookingForRelationship: true,
    lookingForFriendship: true,

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
    chatStyle: 'ambievert',
    lastActive: '1 hour ago',
    isOnline: true,
    sharedInterests: 3,
    genderIdentity: 'non-binary',
    orientation: 'pansexual',
    lookingForRelationship: false,
    lookingForFriendship: true,

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
    chatStyle: 'introvert',
    lastActive: '30 min ago',
    isOnline: true,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    lookingForRelationship: true,
    lookingForFriendship: false,

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
    chatStyle: 'extrovert',
    lastActive: '15 min ago',
    isOnline: true,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'lesbian',
    lookingForRelationship: true,
    lookingForFriendship: false,

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
    chatStyle: 'extrovert',
    lastActive: '45 min ago',
    isOnline: false,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    lookingForRelationship: false,
    lookingForFriendship: true,

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
  },
  {
    id: 6,
    name: 'Zara',
    avatar: '🎵',
    age: 23,
    location: 'Berlin, Germany',
    distance: 3.2,
    bio: 'Music producer and vinyl collector. Love discovering new sounds and sharing musical discoveries.',
    interests: ['Music', 'Vinyl', 'Concerts', 'Technology'],
    languageLevel: 'B2',
    chatStyle: 'ambievert',
    lastActive: '20 min ago',
    isOnline: true,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'bisexual',
    lookingForRelationship: true,
    lookingForFriendship: true,

    photos: [
      'https://picsum.photos/400/400?random=16',
      'https://picsum.photos/400/400?random=17',
      'https://picsum.photos/400/400?random=18'
    ],
    isVerified: true,
    profileCompletion: 89,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Digging through record stores and attending live shows",
      "If you could travel anywhere right now, where would you go?": "Nashville to explore the music scene",
      "What's something you're passionate about?": "Creating music that moves people emotionally"
    }
  },
  {
    id: 7,
    name: 'Finn',
    avatar: '🏄',
    age: 27,
    location: 'Sydney, Australia',
    distance: 18.5,
    bio: 'Surfer and environmental activist. Passionate about ocean conservation and sustainable living.',
    interests: ['Surfing', 'Environment', 'Ocean', 'Sustainability'],
    languageLevel: 'C1',
    chatStyle: 'extrovert',
    lastActive: '1 hour ago',
    isOnline: false,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    lookingForRelationship: false,
    lookingForFriendship: true,

    photos: [
      'https://picsum.photos/400/400?random=19',
      'https://picsum.photos/400/400?random=20',
      'https://picsum.photos/400/400?random=21'
    ],
    isVerified: true,
    profileCompletion: 94,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Catching waves and beach cleanups",
      "If you could travel anywhere right now, where would you go?": "Hawaii for the perfect waves",
      "What's something you're passionate about?": "Protecting our oceans for future generations"
    }
  },
  {
    id: 8,
    name: 'Nova',
    avatar: '✨',
    age: 25,
    location: 'Amsterdam, Netherlands',
    distance: 7.8,
    bio: 'Astronomy enthusiast and stargazer. Love sharing knowledge about the cosmos and deep conversations.',
    interests: ['Astronomy', 'Science', 'Stargazing', 'Philosophy'],
    languageLevel: 'B1',
    chatStyle: 'introvert',
    lastActive: '3 hours ago',
    isOnline: false,
    sharedInterests: 3,
    genderIdentity: 'non-binary',
    orientation: 'pansexual',
    lookingForRelationship: true,
    lookingForFriendship: false,

    photos: [
      'https://picsum.photos/400/400?random=22',
      'https://picsum.photos/400/400?random=23',
      'https://picsum.photos/400/400?random=24'
    ],
    isVerified: false,
    profileCompletion: 78,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Stargazing and reading about space discoveries",
      "If you could travel anywhere right now, where would you go?": "Chile to visit the largest telescopes",
      "What's something you're passionate about?": "Understanding the mysteries of the universe"
    }
  },
  {
    id: 9,
    name: 'Iris',
    avatar: '🌸',
    age: 29,
    location: 'Seoul, South Korea',
    distance: 22.1,
    bio: 'Fashion designer and K-beauty enthusiast. Love creating beautiful things and sharing style tips.',
    interests: ['Fashion', 'Beauty', 'Design', 'Photography'],
    languageLevel: 'A2',
    chatStyle: 'extrovert',
    lastActive: '45 min ago',
    isOnline: true,
    sharedInterests: 1,
    genderIdentity: 'female',
    orientation: 'heterosexual',
    lookingForRelationship: true,
    lookingForFriendship: true,

    photos: [
      'https://picsum.photos/400/400?random=25',
      'https://picsum.photos/400/400?random=26',
      'https://picsum.photos/400/400?random=27'
    ],
    isVerified: true,
    profileCompletion: 92,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Designing new pieces and exploring fashion districts",
      "If you could travel anywhere right now, where would you go?": "Paris for fashion week",
      "What's something you're passionate about?": "Creating fashion that makes people feel confident"
    }
  },
  {
    id: 10,
    name: 'Leo',
    avatar: '🎭',
    age: 31,
    location: 'New York, USA',
    distance: 25.3,
    bio: 'Actor and theater director. Love storytelling and bringing characters to life on stage.',
    interests: ['Theater', 'Acting', 'Storytelling', 'Literature'],
    languageLevel: 'C2',
    chatStyle: 'extrovert',
    lastActive: '10 min ago',
    isOnline: true,
    sharedInterests: 2,
    genderIdentity: 'male',
    orientation: 'gay',
    lookingForRelationship: true,
    lookingForFriendship: false,

    photos: [
      'https://picsum.photos/400/400?random=28',
      'https://picsum.photos/400/400?random=29',
      'https://picsum.photos/400/400?random=30'
    ],
    isVerified: true,
    profileCompletion: 96,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Rehearsing plays and watching Broadway shows",
      "If you could travel anywhere right now, where would you go?": "London for the West End theater scene",
      "What's something you're passionate about?": "Telling stories that change people's perspectives"
    }
  },
  {
    id: 11,
    name: 'Aria',
    avatar: '🎪',
    age: 24,
    location: 'Barcelona, Spain',
    distance: 9.7,
    bio: 'Circus performer and acrobat. Love pushing physical limits and creating magical moments.',
    interests: ['Acrobatics', 'Circus', 'Performance', 'Fitness'],
    languageLevel: 'B1',
    chatStyle: 'ambievert',
    lastActive: '2 hours ago',
    isOnline: false,
    sharedInterests: 1,
    genderIdentity: 'female',
    orientation: 'bisexual',
    lookingForRelationship: false,
    lookingForFriendship: true,

    photos: [
      'https://picsum.photos/400/400?random=31',
      'https://picsum.photos/400/400?random=32',
      'https://picsum.photos/400/400?random=33'
    ],
    isVerified: true,
    profileCompletion: 87,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Practicing new acrobatic moves and performing",
      "If you could travel anywhere right now, where would you go?": "Montreal for the circus festival",
      "What's something you're passionate about?": "Creating wonder and amazement through performance"
    }
  },
  {
    id: 12,
    name: 'River',
    avatar: '🌊',
    age: 26,
    location: 'Vancouver, Canada',
    distance: 14.2,
    bio: 'Marine biologist and scuba diver. Fascinated by ocean life and underwater photography.',
    interests: ['Marine Biology', 'Scuba Diving', 'Photography', 'Conservation'],
    languageLevel: 'C1',
    chatStyle: 'introvert',
    lastActive: '1 hour ago',
    isOnline: true,
    sharedInterests: 2,
    genderIdentity: 'non-binary',
    orientation: 'asexual',
    lookingForRelationship: false,
    lookingForFriendship: true,

    photos: [
      'https://picsum.photos/400/400?random=34',
      'https://picsum.photos/400/400?random=35',
      'https://picsum.photos/400/400?random=36'
    ],
    isVerified: true,
    profileCompletion: 90,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Diving and documenting marine life",
      "If you could travel anywhere right now, where would you go?": "Great Barrier Reef for research",
      "What's something you're passionate about?": "Protecting marine ecosystems and their inhabitants"
    }
  },
  {
    id: 13,
    name: 'Echo',
    avatar: '🎧',
    age: 28,
    location: 'Stockholm, Sweden',
    distance: 11.8,
    bio: 'Podcast host and audio engineer. Love sharing stories and creating meaningful conversations.',
    interests: ['Podcasting', 'Audio', 'Storytelling', 'Technology'],
    languageLevel: 'B2',
    chatStyle: 'extrovert',
    lastActive: '30 min ago',
    isOnline: true,
    sharedInterests: 3,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    lookingForRelationship: true,
    lookingForFriendship: true,

    photos: [
      'https://picsum.photos/400/400?random=37',
      'https://picsum.photos/400/400?random=38',
      'https://picsum.photos/400/400?random=39'
    ],
    isVerified: true,
    profileCompletion: 93,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Recording podcast episodes and editing audio",
      "If you could travel anywhere right now, where would you go?": "Iceland for the unique soundscapes",
      "What's something you're passionate about?": "Amplifying voices that need to be heard"
    }
  },
  {
    id: 14,
    name: 'Phoenix',
    avatar: '🔥',
    age: 30,
    location: 'Melbourne, Australia',
    distance: 19.6,
    bio: 'Fire dancer and yoga instructor. Passionate about movement, mindfulness, and creative expression.',
    interests: ['Fire Dancing', 'Yoga', 'Movement', 'Meditation'],
    languageLevel: 'A2',
    chatStyle: 'ambievert',
    lastActive: '4 hours ago',
    isOnline: false,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'pansexual',
    lookingForRelationship: true,
    lookingForFriendship: false,

    photos: [
      'https://picsum.photos/400/400?random=40',
      'https://picsum.photos/400/400?random=41',
      'https://picsum.photos/400/400?random=42'
    ],
    isVerified: false,
    profileCompletion: 81,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Fire dancing performances and yoga workshops",
      "If you could travel anywhere right now, where would you go?": "Bali for spiritual retreats",
      "What's something you're passionate about?": "Helping people find their inner fire and strength"
    }
  },
  {
    id: 15,
    name: 'Atlas',
    avatar: '🗺️',
    age: 32,
    location: 'Cape Town, South Africa',
    distance: 28.4,
    bio: 'Travel writer and adventure photographer. Always seeking new experiences and cultural connections.',
    interests: ['Travel', 'Photography', 'Adventure', 'Culture'],
    languageLevel: 'C2',
    chatStyle: 'extrovert',
    lastActive: '15 min ago',
    isOnline: true,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    lookingForRelationship: false,
    lookingForFriendship: true,

    photos: [
      'https://picsum.photos/400/400?random=43',
      'https://picsum.photos/400/400?random=44',
      'https://picsum.photos/400/400?random=45'
    ],
    isVerified: true,
    profileCompletion: 97,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Exploring new cities and capturing local life",
      "If you could travel anywhere right now, where would you go?": "Patagonia for epic landscapes",
      "What's something you're passionate about?": "Sharing the beauty and diversity of our world"
    }
  }
];

export const getProfilesByIds = (ids: number[]): Profile[] => {
  return mockProfiles.filter(profile => ids.includes(profile.id));
};

export const getProfileById = (id: number): Profile | undefined => {
  return mockProfiles.find(profile => profile.id === id);
};
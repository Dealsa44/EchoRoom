import { Profile } from '@/types';

export const mockProfiles: Profile[] = [
  {
    id: 1,
    name: 'Luna',
    avatar: '🌙',
    age: 24,
    location: 'Tbilisi, Georgia',
    hometown: 'Batumi, Georgia',
    relationshipStatus: 'single',
    distance: 2.3,
    bio: 'Philosophy student who loves deep conversations and poetry. Looking for meaningful connections.',
    about: 'I\'m a philosophy student passionate about deep conversations, poetry, and exploring life\'s big questions. I enjoy reading in cozy cafes and discussing ideas that challenge my perspective.',
    interests: ['Philosophy', 'Poetry', 'Mindfulness', 'Reading'],
    languages: [{ language: 'english', level: 'fluent' }, { language: 'georgian', level: 'native' }],
    languageLevel: 'advanced',
    chatStyle: 'introvert',
    lastActive: '2 hours ago',
    isOnline: false,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'bisexual',
    ethnicity: 'white',
    lookingForRelationship: true,
    lookingForFriendship: true,
    relationshipType: 'serious-relationship',
    smoking: 'never',
    drinking: 'socially',
    hasChildren: 'want-someday',
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
    hometown: 'Manchester, UK',
    relationshipStatus: 'in-a-relationship',
    distance: 5.1,
    bio: 'Book enthusiast and language learner. Seeking someone to explore ideas and practice languages with.',
    about: 'I\'m a passionate book lover and language enthusiast. I work in publishing and love exploring different cultures through literature and language learning. Always up for deep discussions about books and ideas.',
    interests: ['Books', 'Languages', 'Culture', 'Travel'],
    languages: [{ language: 'english', level: 'native' }, { language: 'spanish', level: 'intermediate' }],
    languageLevel: 'native',
    chatStyle: 'ambievert',
    lastActive: '1 hour ago',
    isOnline: true,
    sharedInterests: 3,
    genderIdentity: 'non-binary',
    orientation: 'pansexual',
    ethnicity: 'mixed-race',
    lookingForRelationship: false,
    lookingForFriendship: true,
    smoking: 'never',
    drinking: 'casually',
    hasChildren: 'not-sure-yet',
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
    hometown: 'Portland, Oregon',
    relationshipStatus: 'single',
    distance: 8.7,
    bio: 'Mindfulness practitioner and nature lover. Looking for gentle souls to share wisdom with.',
    about: 'I\'m a mindfulness practitioner and yoga instructor who finds peace in nature. I believe in the power of presence and helping others find their inner calm. I love hiking, meditation, and sharing wisdom with kind souls.',
    interests: ['Mindfulness', 'Nature', 'Art', 'Meditation'],
    languages: [{ language: 'english', level: 'intermediate' }],
    languageLevel: 'intermediate',
    chatStyle: 'introvert',
    lastActive: '30 min ago',
    isOnline: true,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    ethnicity: 'asian',
    lookingForRelationship: true,
    lookingForFriendship: false,
    relationshipType: 'marriage',
    smoking: 'never',
    drinking: 'never',
    hasChildren: 'have-and-want-more',
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
    hometown: 'Lyon, France',
    relationshipStatus: 'complicated',
    distance: 12.3,
    bio: 'Artist and coffee enthusiast. Love discussing art, culture, and life over a good cup of coffee.',
    about: 'I\'m a passionate artist who finds inspiration in everyday moments. I love creating art that tells stories and connects people. When I\'m not painting, you\'ll find me in cozy cafes discussing life and culture.',
    interests: ['Art', 'Coffee', 'Travel', 'Photography'],
    languages: [{ language: 'english', level: 'advanced' }, { language: 'french', level: 'beginner' }],
    languageLevel: 'advanced',
    chatStyle: 'extrovert',
    lastActive: '15 min ago',
    isOnline: true,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'lesbian',
    ethnicity: 'hispanic-latino',
    lookingForRelationship: true,
    lookingForFriendship: false,
    relationshipType: 'casual-dating',
    smoking: 'never',
    drinking: 'socially',
    hasChildren: 'have-and-dont-want-more',
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
    hometown: 'Osaka, Japan',
    relationshipStatus: 'married',
    distance: 15.8,
    bio: 'Fitness trainer and language exchange partner. Looking for friends to practice English and share workout tips.',
    about: 'I\'m a fitness trainer passionate about helping people achieve their health goals. I love martial arts, cooking healthy meals, and learning new languages. Always looking for workout buddies and language exchange partners.',
    interests: ['Fitness', 'Languages', 'Travel', 'Cooking'],
    languages: [{ language: 'english', level: 'beginner' }, { language: 'japanese', level: 'learning' }],
    languageLevel: 'beginner',
    chatStyle: 'extrovert',
    lastActive: '45 min ago',
    isOnline: false,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    ethnicity: 'asian',
    lookingForRelationship: false,
    lookingForFriendship: true,
    smoking: 'never',
    drinking: 'casually',
    hasChildren: 'yes',
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
  },
  {
    id: 6,
    name: 'Zara',
    avatar: '🌟',
    age: 25,
    location: 'Dubai, UAE',
    distance: 3.2,
    bio: 'Tech entrepreneur and coffee addict. Love discussing startups, innovation, and exploring new cultures.',
    about: 'I\'m a tech entrepreneur who loves building things that make people\'s lives better. When I\'m not coding or pitching ideas, you\'ll find me exploring new coffee shops and discussing the future of technology.',
    interests: ['Technology', 'Entrepreneurship', 'Coffee', 'Travel'],
    languages: [{ language: 'english', level: 'native' }, { language: 'arabic', level: 'fluent' }],
    languageLevel: 'native',
    chatStyle: 'extrovert',
    lastActive: '5 min ago',
    isOnline: true,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'bisexual',
    ethnicity: 'middle-eastern',
    lookingForRelationship: true,
    lookingForFriendship: true,
    relationshipType: 'serious-relationship',
    smoking: 'never',
    drinking: 'socially',
    hasChildren: 'want-someday',
    education: 'master',
    occupation: 'Tech Entrepreneur',
    religion: 'islam',
    politicalViews: 'moderate',
    photos: [
      'https://picsum.photos/400/400?random=16',
      'https://picsum.photos/400/400?random=17',
      'https://picsum.photos/400/400?random=18'
    ],
    isVerified: true,
    profileCompletion: 94,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Working on my startup and exploring new coffee shops",
      "If you could travel anywhere right now, where would you go?": "Silicon Valley to network with other entrepreneurs",
      "What's something you're passionate about?": "Building technology that solves real problems"
    },
    profileQuestions: [
      {
        id: 'deep-6',
        question: "What's your biggest professional achievement?",
        category: 'deep',
        answer: "Launching my first startup and seeing it help thousands of people solve their problems."
      },
      {
        id: 'flirty-6',
        question: "What's your idea of a perfect date?",
        category: 'flirty',
        answer: "A coffee shop date where we can discuss ideas and dreams, followed by a walk in the city."
      },
      {
        id: 'casual-6',
        question: "What's your favorite coffee order?",
        category: 'casual',
        answer: "A flat white with oat milk - the perfect balance of strong and smooth."
      },
      {
        id: 'creative-6',
        question: "What's the most innovative idea you've had recently?",
        category: 'creative',
        answer: "An app that connects local coffee shops with remote workers for community building."
      },
      {
        id: 'funny-6',
        question: "What's the most embarrassing thing that happened at work?",
        category: 'funny',
        answer: "I once accidentally sent a love letter to my entire team instead of a project update!"
      }
    ]
  },
  {
    id: 7,
    name: 'River',
    avatar: '🌊',
    age: 27,
    location: 'Vancouver, Canada',
    distance: 7.4,
    bio: 'Environmental scientist and outdoor enthusiast. Passionate about sustainability and adventure.',
    about: 'I\'m an environmental scientist who spends my days studying climate change and my free time exploring the great outdoors. I believe in living sustainably and connecting with nature. Always up for hiking, camping, or discussing environmental solutions.',
    interests: ['Environment', 'Hiking', 'Sustainability', 'Photography'],
    languages: [{ language: 'english', level: 'native' }, { language: 'french', level: 'intermediate' }],
    languageLevel: 'native',
    chatStyle: 'ambievert',
    lastActive: '1 hour ago',
    isOnline: false,
    sharedInterests: 1,
    genderIdentity: 'non-binary',
    orientation: 'queer',
    ethnicity: 'white',
    lookingForRelationship: true,
    lookingForFriendship: false,
    relationshipType: 'serious-relationship',
    smoking: 'never',
    drinking: 'casually',
    hasChildren: 'not-sure-yet',
    education: 'phd',
    occupation: 'Environmental Scientist',
    religion: 'atheist',
    politicalViews: 'liberal',
    photos: [
      'https://picsum.photos/400/400?random=19',
      'https://picsum.photos/400/400?random=20',
      'https://picsum.photos/400/400?random=21'
    ],
    isVerified: true,
    profileCompletion: 89,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Hiking in the mountains and taking nature photography",
      "If you could travel anywhere right now, where would you go?": "Iceland to see the glaciers before they disappear",
      "What's something you're passionate about?": "Protecting our planet and finding sustainable solutions"
    },
    profileQuestions: [
      {
        id: 'deep-7',
        question: "What's the most important issue facing our world today?",
        category: 'deep',
        answer: "Climate change - we need to act now to protect our planet for future generations."
      },
      {
        id: 'flirty-7',
        question: "What's your love language?",
        category: 'flirty',
        answer: "Quality time and acts of service. I love sharing adventures and doing thoughtful things for others."
      },
      {
        id: 'casual-7',
        question: "What's your favorite outdoor activity?",
        category: 'casual',
        answer: "Hiking in the mountains - there's nothing like reaching a summit and taking in the view."
      },
      {
        id: 'creative-7',
        question: "What's your creative outlet?",
        category: 'creative',
        answer: "Nature photography - I love capturing the beauty of our planet and sharing it with others."
      },
      {
        id: 'funny-7',
        question: "What's the most adventurous thing you've ever done?",
        category: 'funny',
        answer: "I once got lost in the woods for 6 hours but found the most beautiful hidden lake!"
      }
    ]
  },
  {
    id: 8,
    name: 'Leo',
    avatar: '🎭',
    age: 29,
    location: 'New York, USA',
    distance: 4.8,
    bio: 'Actor and theater enthusiast. Love discussing films, performing arts, and creative expression.',
    about: 'I\'m a passionate actor who believes in the power of storytelling to connect people. When I\'m not on stage or in front of the camera, I love discussing films, theater, and the human experience through art.',
    interests: ['Acting', 'Theater', 'Film', 'Music'],
    languages: [{ language: 'english', level: 'native' }, { language: 'italian', level: 'beginner' }],
    languageLevel: 'native',
    chatStyle: 'extrovert',
    lastActive: '20 min ago',
    isOnline: true,
    sharedInterests: 3,
    genderIdentity: 'male',
    orientation: 'gay',
    ethnicity: 'hispanic-latino',
    lookingForRelationship: true,
    lookingForFriendship: true,
    relationshipType: 'casual-dating',
    smoking: 'socially',
    drinking: 'socially',
    hasChildren: 'no',
    education: 'bachelor',
    occupation: 'Actor',
    religion: 'agnostic',
    politicalViews: 'liberal',
    photos: [
      'https://picsum.photos/400/400?random=22',
      'https://picsum.photos/400/400?random=23',
      'https://picsum.photos/400/400?random=24'
    ],
    isVerified: true,
    profileCompletion: 87,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Watching films and discussing them with friends",
      "If you could travel anywhere right now, where would you go?": "Italy to study classical theater and opera",
      "What's something you're passionate about?": "Using storytelling to create empathy and understanding"
    },
    profileQuestions: [
      {
        id: 'creative-8',
        question: "What's your favorite role you've ever played?",
        category: 'creative',
        answer: "Hamlet - it was challenging but taught me so much about human nature and grief."
      },
      {
        id: 'flirty-8',
        question: "What's the most romantic thing you've ever done?",
        category: 'flirty',
        answer: "I once performed a Shakespeare sonnet for someone on a rooftop at sunset."
      },
      {
        id: 'casual-8',
        question: "What's your favorite film genre?",
        category: 'casual',
        answer: "Psychological thrillers - I love films that make you think and question reality."
      },
      {
        id: 'deep-8',
        question: "What's the most meaningful performance you've given?",
        category: 'deep',
        answer: "Playing a character with mental illness - it helped me understand and empathize with real struggles."
      },
      {
        id: 'funny-8',
        question: "What's the most embarrassing thing that happened on stage?",
        category: 'funny',
        answer: "I once forgot my lines and improvised for 5 minutes - the audience thought it was intentional!"
      }
    ]
  },
  {
    id: 9,
    name: 'Aisha',
    avatar: '🌺',
    age: 23,
    location: 'Cairo, Egypt',
    distance: 9.1,
    bio: 'Medical student and poetry lover. Seeking meaningful conversations about life, health, and literature.',
    about: 'I\'m a medical student passionate about helping others and understanding the human body. I also love poetry and find beauty in the intersection of science and art. Always eager to learn and share knowledge.',
    interests: ['Medicine', 'Poetry', 'Literature', 'Science'],
    languages: [{ language: 'english', level: 'fluent' }, { language: 'arabic', level: 'native' }],
    languageLevel: 'fluent',
    chatStyle: 'introvert',
    lastActive: '3 hours ago',
    isOnline: false,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'heterosexual',
    ethnicity: 'middle-eastern',
    lookingForRelationship: false,
    lookingForFriendship: true,
    smoking: 'never',
    drinking: 'never',
    hasChildren: 'want-someday',
    education: 'bachelor',
    occupation: 'Medical Student',
    religion: 'islam',
    politicalViews: 'moderate',
    photos: [
      'https://picsum.photos/400/400?random=25',
      'https://picsum.photos/400/400?random=26',
      'https://picsum.photos/400/400?random=27'
    ],
    isVerified: false,
    profileCompletion: 76,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Reading medical journals and writing poetry",
      "If you could travel anywhere right now, where would you go?": "Oxford to study medical history and literature",
      "What's something you're passionate about?": "Understanding the human body and helping people heal"
    },
    profileQuestions: [
      {
        id: 'deep-9',
        question: "What's the most important lesson you've learned in medical school?",
        category: 'deep',
        answer: "That every patient has a story, and understanding their humanity is as important as treating their symptoms."
      },
      {
        id: 'flirty-9',
        question: "What's your idea of intellectual attraction?",
        category: 'flirty',
        answer: "Someone who can discuss both science and art with equal passion and curiosity."
      },
      {
        id: 'casual-9',
        question: "What's your favorite book genre?",
        category: 'casual',
        answer: "Medical memoirs and classic literature - I love stories that teach me about human nature."
      },
      {
        id: 'creative-9',
        question: "What's your creative outlet?",
        category: 'creative',
        answer: "Writing poetry about the human body and the emotions we carry within us."
      },
      {
        id: 'funny-9',
        question: "What's the funniest thing that happened during your studies?",
        category: 'funny',
        answer: "I once accidentally memorized the wrong bone names and confidently recited them to my professor!"
      }
    ]
  },
  {
    id: 10,
    name: 'River',
    avatar: '🌊',
    age: 26,
    location: 'Portland, Oregon',
    distance: 11.2,
    bio: 'Environmental scientist and nature photographer. Passionate about conservation and capturing Earth\'s beauty.',
    about: 'I\'m an environmental scientist who spends my free time photographing wildlife and landscapes. I believe in the power of nature to heal and inspire. When I\'m not in the field collecting data, I\'m hiking with my camera, documenting the beauty of our planet.',
    interests: ['Nature', 'Photography', 'Conservation', 'Hiking', 'Wildlife'],
    languages: [{ language: 'english', level: 'native' }, { language: 'french', level: 'intermediate' }],
    languageLevel: 'native',
    chatStyle: 'introvert',
    lastActive: '2 hours ago',
    isOnline: false,
    sharedInterests: 2,
    genderIdentity: 'non-binary',
    orientation: 'pansexual',
    ethnicity: 'white',
    lookingForRelationship: true,
    lookingForFriendship: true,
    relationshipType: 'serious-relationship',
    smoking: 'never',
    drinking: 'never',
    hasChildren: 'want-someday',
    education: 'master',
    occupation: 'Environmental Scientist',
    religion: 'atheist',
    politicalViews: 'liberal',
    photos: [
      'https://picsum.photos/400/400?random=28',
      'https://picsum.photos/400/400?random=29',
      'https://picsum.photos/400/400?random=30'
    ],
    isVerified: true,
    profileCompletion: 92,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Hiking in the mountains with my camera, capturing the sunrise",
      "If you could travel anywhere right now, where would you go?": "Patagonia to photograph the glaciers before they disappear",
      "What's something you're passionate about?": "Protecting our planet and showing others its incredible beauty through photography"
    },
    profileQuestions: [
      {
        id: 'creative-10',
        question: "What's your favorite subject to photograph?",
        category: 'creative',
        answer: "Wildlife in their natural habitat - there's something magical about capturing a moment of pure, untamed life."
      },
      {
        id: 'flirty-10',
        question: "What's your idea of a perfect date?",
        category: 'flirty',
        answer: "A sunrise hike to a beautiful viewpoint, followed by coffee and sharing our favorite nature stories."
      },
      {
        id: 'casual-10',
        question: "What's your favorite hiking trail?",
        category: 'casual',
        answer: "The Pacific Crest Trail - it's challenging but the views and wildlife encounters are absolutely worth it."
      },
      {
        id: 'deep-10',
        question: "What's the most important lesson life has taught you?",
        category: 'deep',
        answer: "That we're all connected to nature and each other. Every action we take affects the world around us."
      },
      {
        id: 'funny-10',
        question: "What's the most embarrassing thing that happened while photographing?",
        category: 'funny',
        answer: "I once spent 30 minutes photographing what I thought was a rare bird, only to realize it was a very realistic garden decoration!"
      }
    ]
  },
  {
    id: 11,
    name: 'Zara',
    avatar: '🎭',
    age: 27,
    location: 'Montreal, Canada',
    distance: 6.7,
    bio: 'Theater director and creative writer. Passionate about storytelling, community building, and the power of art to transform lives.',
    about: 'I\'m a theater director who believes in the transformative power of storytelling. I create immersive experiences that bring communities together and explore the human condition through art. When I\'m not directing, I\'m writing plays and organizing community workshops.',
    interests: ['Theater', 'Writing', 'Community', 'Art', 'Storytelling'],
    languages: [{ language: 'english', level: 'fluent' }, { language: 'french', level: 'native' }],
    languageLevel: 'fluent',
    chatStyle: 'extrovert',
    lastActive: '4 hours ago',
    isOnline: true,
    sharedInterests: 3,
    genderIdentity: 'female',
    orientation: 'bisexual',
    ethnicity: 'mixed-race',
    lookingForRelationship: true,
    lookingForFriendship: true,
    smoking: 'never',
    drinking: 'socially',
    hasChildren: 'want-someday',
    education: 'master',
    occupation: 'Theater Director',
    religion: 'atheist',
    politicalViews: 'liberal',
    photos: [
      'https://picsum.photos/400/400?random=31',
      'https://picsum.photos/400/400?random=32',
      'https://picsum.photos/400/400?random=33'
    ],
    isVerified: true,
    profileCompletion: 88,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Rehearsing with my theater troupe and exploring new neighborhoods for inspiration",
      "If you could travel anywhere right now, where would you go?": "London to see West End shows and immerse myself in the theater scene",
      "What's something you're passionate about?": "Using theater to build bridges between communities and tell stories that matter"
    },
    profileQuestions: [
      {
        id: 'deep-11',
        question: "What's your biggest dream for humanity?",
        category: 'deep',
        answer: "To create a world where everyone feels seen, heard, and valued through the power of storytelling and community."
      },
      {
        id: 'flirty-11',
        question: "What's the most attractive quality in a person?",
        category: 'flirty',
        answer: "Authenticity and the courage to be vulnerable. There's nothing more beautiful than someone who's unafraid to be themselves."
      },
      {
        id: 'casual-11',
        question: "What's your favorite type of theater?",
        category: 'casual',
        answer: "Immersive theater - I love breaking the fourth wall and creating experiences that blur the line between performer and audience."
      },
      {
        id: 'creative-11',
        question: "What's the most creative project you've worked on?",
        category: 'creative',
        answer: "A community theater piece where the audience became part of the story - it was magical to see strangers connect through shared experience."
      },
      {
        id: 'funny-11',
        question: "What's the most embarrassing thing that happened during a performance?",
        category: 'funny',
        answer: "I once forgot my lines completely and had to improvise an entire monologue - the audience loved it more than the original!"
      }
    ]
  },
  {
    id: 12,
    name: 'Sakura',
    avatar: '🌸',
    age: 22,
    location: 'Kyoto, Japan',
    distance: 8.9,
    bio: 'Traditional artist and tea ceremony practitioner. Seeking connections through art and cultural exchange.',
    about: 'I\'m a traditional Japanese artist who practices calligraphy and tea ceremony. I love sharing Japanese culture and finding beauty in everyday moments. Always eager to learn about other cultures while sharing my own.',
    interests: ['Calligraphy', 'Tea Ceremony', 'Traditional Arts', 'Culture'],
    languages: [{ language: 'english', level: 'beginner' }, { language: 'japanese', level: 'native' }],
    languageLevel: 'beginner',
    chatStyle: 'introvert',
    lastActive: '1 hour ago',
    isOnline: true,
    sharedInterests: 0,
    genderIdentity: 'female',
    orientation: 'heterosexual',
    ethnicity: 'asian',
    lookingForRelationship: true,
    lookingForFriendship: true,
    relationshipType: 'serious-relationship',
    smoking: 'never',
    drinking: 'never',
    hasChildren: 'no',
    education: 'bachelor',
    occupation: 'Traditional Artist',
    religion: 'buddhism',
    politicalViews: 'moderate',
    photos: [
      'https://picsum.photos/400/400?random=34',
      'https://picsum.photos/400/400?random=35',
      'https://picsum.photos/400/400?random=36'
    ],
    isVerified: false,
    profileCompletion: 78,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Practicing calligraphy and hosting tea ceremonies",
      "If you could travel anywhere right now, where would you go?": "Paris to see how other cultures approach art",
      "What's something you're passionate about?": "Preserving traditional Japanese arts and sharing them with the world"
    },
    profileQuestions: [
      {
        id: 'deep-12',
        question: "What's the most important lesson your culture has taught you?",
        category: 'deep',
        answer: "The beauty of impermanence and finding peace in the present moment."
      },
      {
        id: 'flirty-12',
        question: "What's your idea of a perfect date?",
        category: 'flirty',
        answer: "A quiet tea ceremony followed by a walk through a traditional garden."
      },
      {
        id: 'casual-12',
        question: "What's your favorite season in Japan?",
        category: 'casual',
        answer: "Spring - the cherry blossoms create such a magical atmosphere for art and reflection."
      },
      {
        id: 'creative-12',
        question: "What's your favorite traditional art form?",
        category: 'creative',
        answer: "Calligraphy - each stroke carries meaning and emotion, like a dance of ink on paper."
      },
      {
        id: 'funny-12',
        question: "What's the most embarrassing thing that happened during a tea ceremony?",
        category: 'funny',
        answer: "I once spilled tea on my kimono and had to improvise the rest of the ceremony!"
      }
    ]
  },
  {
    id: 13,
    name: 'Atlas',
    avatar: '🗺️',
    age: 26,
    location: 'Cape Town, South Africa',
    distance: 13.5,
    bio: 'Adventure guide and wildlife photographer. Passionate about conservation and sharing the beauty of nature.',
    about: 'I\'m an adventure guide who leads safaris and wildlife photography tours. I believe in the power of nature to transform lives and am passionate about conservation. Love sharing stories from the wild and inspiring others to protect our planet.',
    interests: ['Wildlife', 'Photography', 'Conservation', 'Adventure'],
    languages: [{ language: 'english', level: 'native' }, { language: 'afrikaans', level: 'fluent' }],
    languageLevel: 'native',
    chatStyle: 'extrovert',
    lastActive: '30 min ago',
    isOnline: true,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'heterosexual',
    ethnicity: 'white',
    lookingForRelationship: true,
    lookingForFriendship: false,
    relationshipType: 'casual-dating',
    smoking: 'never',
    drinking: 'socially',
    hasChildren: 'no',
    education: 'bachelor',
    occupation: 'Adventure Guide',
    religion: 'agnostic',
    politicalViews: 'liberal',
    photos: [
      'https://picsum.photos/400/400?random=37',
      'https://picsum.photos/400/400?random=38',
      'https://picsum.photos/400/400?random=39'
    ],
    isVerified: true,
    profileCompletion: 91,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Leading wildlife photography tours in the bush",
      "If you could travel anywhere right now, where would you go?": "The Serengeti to witness the great migration",
      "What's something you're passionate about?": "Conservation and protecting wildlife for future generations"
    },
    profileQuestions: [
      {
        id: 'deep-13',
        question: "What's the most profound experience you've had in nature?",
        category: 'deep',
        answer: "Witnessing a lioness teaching her cubs to hunt - it showed me the circle of life in its purest form."
      },
      {
        id: 'flirty-13',
        question: "What's your idea of adventure?",
        category: 'flirty',
        answer: "Exploring unknown territories together and discovering hidden gems in nature."
      },
      {
        id: 'casual-13',
        question: "What's your favorite animal to photograph?",
        category: 'casual',
        answer: "Elephants - they're so intelligent and have such strong family bonds."
      },
      {
        id: 'creative-13',
        question: "What's the most creative way you've captured wildlife?",
        category: 'creative',
        answer: "Using a drone to capture aerial shots of migrating herds - the perspective was incredible."
      },
      {
        id: 'funny-13',
        question: "What's the most embarrassing thing that happened on a safari?",
        category: 'funny',
        answer: "I once got so excited about seeing a rare bird that I fell out of the jeep!"
      }
    ]
  },
  {
    id: 14,
    name: 'Phoenix',
    avatar: '🔥',
    age: 29,
    location: 'Barcelona, Spain',
    distance: 4.2,
    bio: 'Chef and food blogger. Love creating culinary experiences and sharing the joy of cooking.',
    about: 'I\'m a passionate chef who believes food is the universal language of love. I run a popular food blog and love creating memorable dining experiences. When I\'m not in the kitchen, I\'m exploring local markets and discovering new flavors.',
    interests: ['Cooking', 'Food', 'Travel', 'Photography'],
    languages: [{ language: 'english', level: 'fluent' }, { language: 'spanish', level: 'native' }, { language: 'catalan', level: 'fluent' }],
    languageLevel: 'fluent',
    chatStyle: 'extrovert',
    lastActive: '15 min ago',
    isOnline: true,
    sharedInterests: 2,
    genderIdentity: 'female',
    orientation: 'lesbian',
    ethnicity: 'hispanic-latino',
    lookingForRelationship: true,
    lookingForFriendship: true,
    relationshipType: 'serious-relationship',
    smoking: 'never',
    drinking: 'socially',
    hasChildren: 'no',
    education: 'bachelor',
    occupation: 'Chef & Food Blogger',
    religion: 'agnostic',
    politicalViews: 'liberal',
    photos: [
      'https://picsum.photos/400/400?random=40',
      'https://picsum.photos/400/400?random=41',
      'https://picsum.photos/400/400?random=42'
    ],
    isVerified: true,
    profileCompletion: 93,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Cooking elaborate meals and hosting dinner parties",
      "If you could travel anywhere right now, where would you go?": "Italy to learn authentic pasta-making techniques",
      "What's something you're passionate about?": "Creating dishes that tell stories and bring people together"
    },
    profileQuestions: [
      {
        id: 'creative-14',
        question: "What's your signature dish?",
        category: 'creative',
        answer: "Paella with a modern twist - I add saffron and seafood but with contemporary plating techniques."
      },
      {
        id: 'flirty-14',
        question: "What's your idea of a romantic dinner?",
        category: 'flirty',
        answer: "Cooking together in the kitchen, sharing wine, and creating something beautiful from scratch."
      },
      {
        id: 'casual-14',
        question: "What's your favorite cuisine to cook?",
        category: 'casual',
        answer: "Mediterranean - the fresh ingredients and bold flavors are always inspiring."
      },
      {
        id: 'deep-14',
        question: "What's the most meaningful meal you've ever prepared?",
        category: 'deep',
        answer: "A traditional family recipe for my grandmother's 90th birthday - it connected generations through food."
      },
      {
        id: 'funny-14',
        question: "What's the biggest kitchen disaster you've ever had?",
        category: 'funny',
        answer: "I once set off the fire alarm while trying to flambé a dessert - the whole restaurant had to evacuate!"
      }
    ]
  },
  {
    id: 15,
    name: 'Echo',
    avatar: '🎵',
    age: 25,
    location: 'Seoul, South Korea',
    distance: 9.8,
    bio: 'Music producer and sound engineer. Love creating beats, mixing tracks, and discovering new sounds.',
    about: 'I\'m a music producer who loves creating unique soundscapes and helping artists bring their vision to life. I spend my days in the studio crafting beats and my nights exploring Seoul\'s vibrant music scene. Always on the lookout for new sounds and collaborations.',
    interests: ['Music Production', 'Sound Engineering', 'Hip Hop', 'Technology'],
    languages: [{ language: 'english', level: 'fluent' }, { language: 'korean', level: 'native' }],
    languageLevel: 'fluent',
    chatStyle: 'ambievert',
    lastActive: '45 min ago',
    isOnline: false,
    sharedInterests: 1,
    genderIdentity: 'male',
    orientation: 'gay',
    ethnicity: 'asian',
    lookingForRelationship: false,
    lookingForFriendship: true,
    smoking: 'never',
    drinking: 'socially',
    hasChildren: 'no',
    education: 'bachelor',
    occupation: 'Music Producer',
    religion: 'atheist',
    politicalViews: 'liberal',
    photos: [
      'https://picsum.photos/400/400?random=43',
      'https://picsum.photos/400/400?random=44',
      'https://picsum.photos/400/400?random=45'
    ],
    isVerified: true,
    profileCompletion: 86,
    iceBreakerAnswers: {
      "What's your favorite way to spend a weekend?": "Producing music and exploring Seoul's underground music scene",
      "If you could travel anywhere right now, where would you go?": "Los Angeles to collaborate with other producers",
      "What's something you're passionate about?": "Creating music that moves people and tells stories"
    },
    profileQuestions: [
      {
        id: 'creative-15',
        question: "What's your favorite genre to produce?",
        category: 'creative',
        answer: "Hip hop with electronic elements - I love blending traditional beats with modern sound design."
      },
      {
        id: 'flirty-15',
        question: "What's your idea of a perfect collaboration?",
        category: 'flirty',
        answer: "Working with someone who brings different musical influences and we create something completely unique."
      },
      {
        id: 'casual-15',
        question: "What's your favorite piece of studio equipment?",
        category: 'casual',
        answer: "My vintage synthesizer - it has a warmth that digital plugins just can't replicate."
      },
      {
        id: 'deep-15',
        question: "What's the most meaningful project you've worked on?",
        category: 'deep',
        answer: "A track that helped someone through depression - knowing my music made a difference was incredible."
      },
      {
        id: 'funny-15',
        question: "What's the most embarrassing thing that happened in the studio?",
        category: 'funny',
        answer: "I once accidentally played a demo track at full volume during a client meeting - it was supposed to be background music!"
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

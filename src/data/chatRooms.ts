export interface ChatRoom {
  id: string;
  title: string;
  category: string;
  members: number;
  description: string;
  isPrivate: boolean;
  activeNow: number;
  tags: string[];
  icon: string;
}

export const chatRooms: ChatRoom[] = [
  {
    id: '1',
    title: 'Philosophy Corner',
    category: 'philosophy',
    members: 127,
    description: 'Deep discussions about life, existence, and meaning',
    isPrivate: false,
    activeNow: 8,
    tags: ['Deep', 'Thoughtful'],
    icon: '🤔'
  },
  {
    id: '2',
    title: 'Book Lovers United',
    category: 'books',
    members: 243,
    description: 'Share your latest reads and discover new stories',
    isPrivate: false,
    activeNow: 15,
    tags: ['Fiction', 'Reviews'],
    icon: '📚'
  },
  {
    id: '3',
    title: 'Mindful Meditation',
    category: 'wellness',
    members: 89,
    description: 'Guided meditation sessions and mindfulness tips',
    isPrivate: false,
    activeNow: 5,
    tags: ['Calm', 'Healing'],
    icon: '🧘'
  },
  {
    id: '4',
    title: 'Creative Writing Circle',
    category: 'art',
    members: 156,
    description: 'Share your stories, poems, and get gentle feedback',
    isPrivate: false,
    activeNow: 12,
    tags: ['Creative', 'Supportive'],
    icon: '✍️'
  },
  {
    id: '5',
    title: 'Language Exchange',
    category: 'languages',
    members: 201,
    description: 'Practice English, Georgian, and other languages',
    isPrivate: false,
    activeNow: 23,
    tags: ['Learning', 'Practice'],
    icon: '🌍'
  },
  {
    id: '6',
    title: 'Safe Space Support',
    category: 'wellness',
    members: 67,
    description: 'Mental health support and understanding',
    isPrivate: true,
    activeNow: 3,
    tags: ['Support', 'Private'],
    icon: '💜'
  }
];
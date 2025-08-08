import { ProfileQuestion } from '@/types';

export const profileQuestions: ProfileQuestion[] = [
  // Funny questions
  {
    id: 'funny-1',
    question: "What's the weirdest thing you've ever eaten?",
    category: 'funny'
  },
  {
    id: 'funny-2',
    question: "If you could have any superpower, what would it be and why?",
    category: 'funny'
  },
  {
    id: 'funny-3',
    question: "What's your most embarrassing childhood memory?",
    category: 'funny'
  },
  {
    id: 'funny-4',
    question: "If you were a vegetable, which one would you be?",
    category: 'funny'
  },
  {
    id: 'funny-5',
    question: "What's the most ridiculous thing you've ever done to avoid social interaction?",
    category: 'funny'
  },

  // Flirty questions
  {
    id: 'flirty-1',
    question: "What's your idea of a perfect first date?",
    category: 'flirty'
  },
  {
    id: 'flirty-2',
    question: "What's the most attractive quality in a person?",
    category: 'flirty'
  },
  {
    id: 'flirty-3',
    question: "What's your love language?",
    category: 'flirty'
  },
  {
    id: 'flirty-4',
    question: "What's the most romantic thing someone has ever done for you?",
    category: 'flirty'
  },
  {
    id: 'flirty-5',
    question: "What's your biggest turn-on?",
    category: 'flirty'
  },

  // Deep questions
  {
    id: 'deep-1',
    question: "What's your biggest fear and how do you cope with it?",
    category: 'deep'
  },
  {
    id: 'deep-2',
    question: "What's the most important lesson life has taught you?",
    category: 'deep'
  },
  {
    id: 'deep-3',
    question: "What's your biggest dream and what's stopping you from achieving it?",
    category: 'deep'
  },
  {
    id: 'deep-4',
    question: "What's something you believe that most people disagree with?",
    category: 'deep'
  },
  {
    id: 'deep-5',
    question: "What's the most meaningful conversation you've ever had?",
    category: 'deep'
  },

  // Casual questions
  {
    id: 'casual-1',
    question: "What's your favorite way to spend a lazy Sunday?",
    category: 'casual'
  },
  {
    id: 'casual-2',
    question: "What's your go-to comfort food?",
    category: 'casual'
  },
  {
    id: 'casual-3',
    question: "What's the best book you've read recently?",
    category: 'casual'
  },
  {
    id: 'casual-4',
    question: "What's your favorite season and why?",
    category: 'casual'
  },
  {
    id: 'casual-5',
    question: "What's something that always makes you laugh?",
    category: 'casual'
  },

  // Creative questions
  {
    id: 'creative-1',
    question: "If you could create any invention, what would it be?",
    category: 'creative'
  },
  {
    id: 'creative-2',
    question: "What's your creative outlet?",
    category: 'creative'
  },
  {
    id: 'creative-3',
    question: "If you could live in any fictional world, which would you choose?",
    category: 'creative'
  },
  {
    id: 'creative-4',
    question: "What's the most creative thing you've ever done?",
    category: 'creative'
  },
  {
    id: 'creative-5',
    question: "If you could have dinner with anyone from history, who would it be?",
    category: 'creative'
  }
];

// Function to get random questions for a user
export const getRandomProfileQuestions = (count: number = 5): ProfileQuestion[] => {
  const shuffled = [...profileQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to get questions by category
export const getQuestionsByCategory = (category: ProfileQuestion['category']): ProfileQuestion[] => {
  return profileQuestions.filter(q => q.category === category);
};
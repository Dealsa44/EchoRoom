import { toast } from '@/hooks/use-toast';

export interface MoodTheme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  gradients: {
    header: string;
    message: string;
    button: string;
  };
  effects: {
    particles: boolean;
    animations: 'subtle' | 'medium' | 'vibrant';
    soundEffects: boolean;
  };
  triggers: string[]; // Keywords that might trigger this mood
}

export const moodThemes: Record<string, MoodTheme> = {
  romantic: {
    id: 'romantic',
    name: 'Romantic',
    emoji: '💕',
    description: 'Soft pinks and warm tones for intimate conversations',
    colors: {
      primary: '#ec4899',
      secondary: '#f97316', 
      accent: '#fbbf24',
      background: '#fef7f7',
      surface: '#fdf2f8',
      text: '#7c2d12',
      muted: '#d1d5db'
    },
    gradients: {
      header: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
      message: 'linear-gradient(135deg, #fdf2f8 0%, #fef7f7 100%)',
      button: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
    },
    effects: {
      particles: true,
      animations: 'subtle',
      soundEffects: true
    },
    triggers: ['love', 'heart', 'romantic', 'date', 'beautiful', 'gorgeous', 'amazing', 'wonderful']
  },

  playful: {
    id: 'playful',
    name: 'Playful',
    emoji: '🎉',
    description: 'Bright and vibrant colors for fun conversations',
    colors: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      accent: '#10b981',
      background: '#fafafa',
      surface: '#f3f4f6',
      text: '#374151',
      muted: '#9ca3af'
    },
    gradients: {
      header: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #10b981 100%)',
      message: 'linear-gradient(135deg, #f3f4f6 0%, #fafafa 100%)',
      button: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    effects: {
      particles: true,
      animations: 'vibrant',
      soundEffects: true
    },
    triggers: ['haha', 'lol', 'funny', 'joke', '😂', '😄', '🎉', 'party', 'celebrate', 'awesome']
  },

  deep: {
    id: 'deep',
    name: 'Deep Thoughts',
    emoji: '🧠',
    description: 'Calm purples and blues for philosophical discussions',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#f8fafc',
      surface: '#f1f5f9',
      text: '#334155',
      muted: '#64748b'
    },
    gradients: {
      header: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      message: 'linear-gradient(135deg, #f1f5f9 0%, #f8fafc 100%)',
      button: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
    },
    effects: {
      particles: false,
      animations: 'subtle',
      soundEffects: false
    },
    triggers: ['philosophy', 'meaning', 'purpose', 'think', 'believe', 'wisdom', 'deep', 'soul', 'mind']
  },

  nature: {
    id: 'nature',
    name: 'Nature Vibes',
    emoji: '🌿',
    description: 'Earthy greens and browns for outdoor enthusiasts',
    colors: {
      primary: '#059669',
      secondary: '#d97706',
      accent: '#84cc16',
      background: '#f7fdf7',
      surface: '#f0fdf4',
      text: '#14532d',
      muted: '#6b7280'
    },
    gradients: {
      header: 'linear-gradient(135deg, #059669 0%, #84cc16 100%)',
      message: 'linear-gradient(135deg, #f0fdf4 0%, #f7fdf7 100%)',
      button: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
    },
    effects: {
      particles: true,
      animations: 'medium',
      soundEffects: true
    },
    triggers: ['nature', 'forest', 'mountain', 'hiking', 'trees', 'outdoors', 'adventure', 'peaceful']
  },

  cozy: {
    id: 'cozy',
    name: 'Cozy Evening',
    emoji: '🕯️',
    description: 'Warm oranges and browns for intimate chats',
    colors: {
      primary: '#ea580c',
      secondary: '#d97706',
      accent: '#f59e0b',
      background: '#fefbf3',
      surface: '#fef3e2',
      text: '#9a3412',
      muted: '#78716c'
    },
    gradients: {
      header: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)',
      message: 'linear-gradient(135deg, #fef3e2 0%, #fefbf3 100%)',
      button: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)'
    },
    effects: {
      particles: false,
      animations: 'subtle',
      soundEffects: true
    },
    triggers: ['cozy', 'warm', 'comfort', 'evening', 'candlelight', 'peaceful', 'relaxing', 'intimate']
  },

  energetic: {
    id: 'energetic',
    name: 'High Energy',
    emoji: '⚡',
    description: 'Electric blues and yellows for active conversations',
    colors: {
      primary: '#0ea5e9',
      secondary: '#eab308',
      accent: '#f59e0b',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      muted: '#64748b'
    },
    gradients: {
      header: 'linear-gradient(135deg, #0ea5e9 0%, #eab308 100%)',
      message: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
      button: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
    },
    effects: {
      particles: true,
      animations: 'vibrant',
      soundEffects: true
    },
    triggers: ['energy', 'excited', 'amazing', 'incredible', 'wow', 'fantastic', 'awesome', 'electric']
  },

  default: {
    id: 'default',
    name: 'Default',
    emoji: '💬',
    description: 'Clean and modern for everyday conversations',
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      muted: '#6b7280'
    },
    gradients: {
      header: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      message: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
      button: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    effects: {
      particles: false,
      animations: 'subtle',
      soundEffects: false
    },
    triggers: []
  }
};

// Analyze message content and suggest mood theme
export const analyzeMoodFromMessage = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Check each theme's triggers
  for (const [themeId, theme] of Object.entries(moodThemes)) {
    if (theme.triggers.some(trigger => lowerMessage.includes(trigger))) {
      return themeId;
    }
  }
  
  // Sentiment-based analysis
  const positiveWords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic'];
  const romanticWords = ['love', 'heart', 'kiss', 'romantic', 'date', 'beautiful'];
  const deepWords = ['think', 'philosophy', 'meaning', 'purpose', 'soul', 'mind', 'wisdom'];
  
  if (romanticWords.some(word => lowerMessage.includes(word))) {
    return 'romantic';
  }
  
  if (deepWords.some(word => lowerMessage.includes(word))) {
    return 'deep';
  }
  
  if (positiveWords.some(word => lowerMessage.includes(word))) {
    return 'playful';
  }
  
  return 'default';
};

// Analyze conversation context for theme suggestion
export const analyzeConversationMood = (messages: Array<{ content: string; timestamp: Date }>): string => {
  if (messages.length === 0) return 'default';
  
  // Get recent messages (last 10 or messages from last hour)
  const oneHourAgo = new Date(Date.now() - 3600000);
  const recentMessages = messages
    .filter(msg => msg.timestamp > oneHourAgo)
    .slice(-10);
  
  const combinedContent = recentMessages.map(msg => msg.content).join(' ').toLowerCase();
  
  // Score each theme based on trigger words
  const themeScores: Record<string, number> = {};
  
  for (const [themeId, theme] of Object.entries(moodThemes)) {
    let score = 0;
    theme.triggers.forEach(trigger => {
      const regex = new RegExp(`\\b${trigger}\\b`, 'gi');
      const matches = combinedContent.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    themeScores[themeId] = score;
  }
  
  // Find theme with highest score
  const bestTheme = Object.entries(themeScores)
    .sort(([,a], [,b]) => b - a)
    .find(([,score]) => score > 0);
  
  return bestTheme ? bestTheme[0] : 'default';
};

// Apply theme to chat interface
export const applyMoodTheme = (themeId: string, element?: HTMLElement) => {
  const theme = moodThemes[themeId] || moodThemes.default;
  const root = element || document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--mood-primary', theme.colors.primary);
  root.style.setProperty('--mood-secondary', theme.colors.secondary);
  root.style.setProperty('--mood-accent', theme.colors.accent);
  root.style.setProperty('--mood-background', theme.colors.background);
  root.style.setProperty('--mood-surface', theme.colors.surface);
  root.style.setProperty('--mood-text', theme.colors.text);
  root.style.setProperty('--mood-muted', theme.colors.muted);
  
  root.style.setProperty('--mood-header-gradient', theme.gradients.header);
  root.style.setProperty('--mood-message-gradient', theme.gradients.message);
  root.style.setProperty('--mood-button-gradient', theme.gradients.button);
  
  // Add theme class for specific styling
  root.classList.remove(...Object.keys(moodThemes).map(id => `mood-${id}`));
  root.classList.add(`mood-${themeId}`);
  
  return theme;
};

// Get theme suggestions based on conversation
export const getThemeSuggestions = (
  messages: Array<{ content: string; timestamp: Date }>,
  currentTheme: string
): Array<{ theme: MoodTheme; confidence: number; reason: string }> => {
  const suggestions: Array<{ theme: MoodTheme; confidence: number; reason: string }> = [];
  
  if (messages.length === 0) {
    return [{
      theme: moodThemes.default,
      confidence: 100,
      reason: 'Perfect for starting new conversations'
    }];
  }
  
  const recentContent = messages.slice(-5).map(m => m.content).join(' ').toLowerCase();
  
  // Analyze content for each theme
  Object.values(moodThemes).forEach(theme => {
    if (theme.id === currentTheme) return; // Skip current theme
    
    let confidence = 0;
    let reasons: string[] = [];
    
    // Check trigger words
    const triggerMatches = theme.triggers.filter(trigger => 
      recentContent.includes(trigger)
    );
    
    if (triggerMatches.length > 0) {
      confidence += triggerMatches.length * 20;
      reasons.push(`Detected keywords: ${triggerMatches.slice(0, 3).join(', ')}`);
    }
    
    // Time-based suggestions
    const hour = new Date().getHours();
    if (theme.id === 'cozy' && (hour >= 19 || hour <= 7)) {
      confidence += 15;
      reasons.push('Perfect for evening conversations');
    }
    
    if (theme.id === 'energetic' && hour >= 6 && hour <= 12) {
      confidence += 10;
      reasons.push('Great energy for morning chats');
    }
    
    // Conversation length based
    if (messages.length > 20 && theme.id === 'romantic') {
      confidence += 10;
      reasons.push('Long conversations often turn romantic');
    }
    
    if (messages.length > 50 && theme.id === 'deep') {
      confidence += 15;
      reasons.push('Deep conversations deserve a thoughtful theme');
    }
    
    if (confidence > 20) {
      suggestions.push({
        theme,
        confidence: Math.min(confidence, 100),
        reason: reasons.join(' • ')
      });
    }
  });
  
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
};

// Show mood theme notification
export const suggestMoodTheme = (
  suggestedTheme: string, 
  reason: string,
  onAccept: (themeId: string) => void
) => {
  const theme = moodThemes[suggestedTheme];
  if (!theme) return;
  
  toast({
    title: `${theme.emoji} Switch to ${theme.name} theme?`,
    description: reason,

  });
};

// Create particle effects for themes
export const createParticleEffect = (themeId: string, container: HTMLElement) => {
  if (!moodThemes[themeId]?.effects.particles) return;
  
  const theme = moodThemes[themeId];
  
  // Create particle container
  const particleContainer = document.createElement('div');
  particleContainer.className = 'mood-particles';
  particleContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    z-index: 1;
  `;
  
  container.style.position = 'relative';
  container.appendChild(particleContainer);
  
  // Create particles based on theme
  const particleCount = theme.effects.animations === 'vibrant' ? 20 : 
                       theme.effects.animations === 'medium' ? 10 : 5;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: ${theme.colors.accent};
      border-radius: 50%;
      opacity: 0.3;
      animation: float-${themeId} ${3 + Math.random() * 4}s infinite linear;
      left: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 2}s;
    `;
    
    particleContainer.appendChild(particle);
  }
  
  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float-${themeId} {
      0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
      10% { opacity: 0.3; }
      90% { opacity: 0.3; }
      100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Clean up after 30 seconds
  setTimeout(() => {
    if (particleContainer.parentNode) {
      particleContainer.parentNode.removeChild(particleContainer);
    }
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }, 30000);
};
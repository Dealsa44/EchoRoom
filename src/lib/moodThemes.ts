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
  /** Optional design class for the chat messages area (e.g. floating shapes, patterns) */
  designClass?: string;
}

// Default first, then 5 unique themes with distinct palettes and designs
export const moodThemes: Record<string, MoodTheme> = {
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
      muted: '#6b7280',
    },
    gradients: {
      header: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      message: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
      button: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
  },

  aurora: {
    id: 'aurora',
    name: 'Aurora',
    emoji: '🌌',
    description: 'Northern lights–inspired greens and purples with a soft glow',
    colors: {
      primary: '#06b6d4',
      secondary: '#8b5cf6',
      accent: '#22d3ee',
      background: '#ecfeff',
      surface: '#cffafe',
      text: '#0e7490',
      muted: '#67e8f9',
    },
    gradients: {
      header: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
      message: 'linear-gradient(180deg, #ecfeff 0%, #e0f2fe 50%, #f5f3ff 100%)',
      button: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    },
    designClass: 'mood-aurora-bg',
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    emoji: '🌊',
    description: 'Deep blues and teals with subtle wave-like layers',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0d9488',
      accent: '#38bdf8',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      muted: '#7dd3fc',
    },
    gradients: {
      header: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%)',
      message: 'linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 100%)',
      button: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    },
    designClass: 'mood-ocean-bg',
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    description: 'Warm oranges, corals and soft pinks like evening sky',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#fb923c',
      background: '#fff7ed',
      surface: '#ffedd5',
      text: '#9a3412',
      muted: '#fdba74',
    },
    gradients: {
      header: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
      message: 'linear-gradient(180deg, #ffedd5 0%, #fff7ed 100%)',
      button: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    },
    designClass: 'mood-sunset-bg',
  },

  forest: {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    description: 'Earthy greens and browns with a calm, natural feel',
    colors: {
      primary: '#059669',
      secondary: '#78716c',
      accent: '#34d399',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#14532d',
      muted: '#6ee7b7',
    },
    gradients: {
      header: 'linear-gradient(135deg, #059669 0%, #78716c 100%)',
      message: 'linear-gradient(180deg, #dcfce7 0%, #f0fdf4 100%)',
      button: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    },
    designClass: 'mood-forest-bg',
  },

  midnight: {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    description: 'Dark indigo and violet for a cozy night vibe',
    colors: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#818cf8',
      background: '#eef2ff',
      surface: '#e0e7ff',
      text: '#312e81',
      muted: '#a5b4fc',
    },
    gradients: {
      header: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      message: 'linear-gradient(180deg, #e0e7ff 0%, #eef2ff 100%)',
      button: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    },
    designClass: 'mood-midnight-bg',
  },
};

/** Ordered list: default first, then the rest */
export const moodThemesOrdered: MoodTheme[] = [
  moodThemes.default,
  moodThemes.aurora,
  moodThemes.ocean,
  moodThemes.sunset,
  moodThemes.forest,
  moodThemes.midnight,
];

export function applyMoodTheme(themeId: string, element?: HTMLElement) {
  const theme = moodThemes[themeId] || moodThemes.default;
  const root = element || document.documentElement;

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

  root.classList.remove(...Object.keys(moodThemes).map((id) => `mood-${id}`));
  root.classList.add(`mood-${themeId}`);

  return theme;
}

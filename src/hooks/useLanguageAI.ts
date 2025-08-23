import { useContext } from 'react';
import { LanguageAIContext, LanguageAIContextType } from '@/contexts/LanguageAIContext';

export const useLanguageAI = (): LanguageAIContextType => {
  const context = useContext(LanguageAIContext);
  if (!context) {
    throw new Error('useLanguageAI must be used within a LanguageAIProvider');
  }
  return context;
};

import { useContext } from 'react';
import { CallContext, CallContextType } from '@/contexts/CallContext';

export const useCall = (): CallContextType => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

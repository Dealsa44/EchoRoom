import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CallRecord, CallSettings, CallState, CallType, CallStatus, CallDirection } from '@/types';
import { toast } from '@/hooks/use-toast';

interface CallContextType {
  // Call History
  callHistory: CallRecord[];
  addCallRecord: (call: Omit<CallRecord, 'id'>) => void;
  deleteCallRecord: (callId: string) => void;
  clearCallHistory: (timeframe?: 'day' | 'week' | 'month' | 'all') => void;
  
  // Current Call State
  callState: CallState;
  startCall: (participantId: string, participantName: string, participantAvatar: string, type: CallType) => void;
  endCall: () => void;
  answerCall: (callId: string) => void;
  declineCall: (callId: string) => void;
  
  // Call Controls
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;
  
  // Call Settings
  callSettings: CallSettings;
  updateCallSettings: (settings: Partial<CallSettings>) => void;
  
  // Utility Functions
  getCallHistoryByParticipant: (participantId: string) => CallRecord[];
  getCallStats: () => { total: number; voice: number; video: number; missed: number };
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

const CALL_HISTORY_STORAGE_KEY = 'echoroom_call_history';
const CALL_SETTINGS_STORAGE_KEY = 'echoroom_call_settings';

const defaultCallSettings: CallSettings = {
  videoQuality: 'medium',
  audioQuality: 'medium',
  autoAnswer: false,
  autoMute: false,
  speakerDefault: false,
  bandwidthLimit: 'medium'
};

const defaultCallState: CallState = {
  isInCall: false,
  currentCall: undefined,
  isMuted: false,
  isVideoEnabled: true,
  isSpeakerOn: false,
  callDuration: 0,
  isConnecting: false,
  connectionQuality: 'good'
};

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [callState, setCallState] = useState<CallState>(defaultCallState);
  const [callSettings, setCallSettings] = useState<CallSettings>(defaultCallSettings);
  const [callDurationTimer, setCallDurationTimer] = useState<NodeJS.Timeout | null>(null);

  // Load call history from localStorage on mount
  useEffect(() => {
    const loadCallHistory = () => {
      try {
        const stored = localStorage.getItem(CALL_HISTORY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const history = parsed.map((call: any) => ({
            ...call,
            startTime: new Date(call.startTime),
            endTime: call.endTime ? new Date(call.endTime) : undefined
          }));
          setCallHistory(history);
        }
      } catch (error) {
        console.error('Failed to load call history:', error);
      }
    };

    const loadCallSettings = () => {
      try {
        const stored = localStorage.getItem(CALL_SETTINGS_STORAGE_KEY);
        if (stored) {
          const settings = JSON.parse(stored);
          setCallSettings({ ...defaultCallSettings, ...settings });
        }
      } catch (error) {
        console.error('Failed to load call settings:', error);
      }
    };

    loadCallHistory();
    loadCallSettings();
  }, []);

  // Save call history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CALL_HISTORY_STORAGE_KEY, JSON.stringify(callHistory));
    } catch (error) {
      console.error('Failed to save call history:', error);
    }
  }, [callHistory]);

  // Save call settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(CALL_SETTINGS_STORAGE_KEY, JSON.stringify(callSettings));
    } catch (error) {
      console.error('Failed to save call settings:', error);
    }
  }, [callSettings]);

  // Call duration timer
  useEffect(() => {
    if (callState.isInCall && callState.currentCall) {
      const timer = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          callDuration: prev.callDuration + 1
        }));
      }, 1000);
      setCallDurationTimer(timer);

      return () => {
        clearInterval(timer);
        setCallDurationTimer(null);
      };
    } else {
      if (callDurationTimer) {
        clearInterval(callDurationTimer);
        setCallDurationTimer(null);
      }
    }
  }, [callState.isInCall, callState.currentCall]);

  const addCallRecord = (call: Omit<CallRecord, 'id'>) => {
    const newCall: CallRecord = {
      ...call,
      id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setCallHistory(prev => [newCall, ...prev]);
  };

  const deleteCallRecord = (callId: string) => {
    setCallHistory(prev => prev.filter(call => call.id !== callId));
  };

  const clearCallHistory = (timeframe: 'day' | 'week' | 'month' | 'all' = 'all') => {
    if (timeframe === 'all') {
      setCallHistory([]);
      return;
    }

    const now = new Date();
    const cutoff = new Date();

    switch (timeframe) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
    }

    setCallHistory(prev => prev.filter(call => call.startTime > cutoff));
  };



  const startCall = (participantId: string, participantName: string, participantAvatar: string, type: CallType) => {
    const newCall: CallRecord = {
      id: `call-${Date.now()}`,
      participantId,
      participantName,
      participantAvatar,
      type,
      status: 'outgoing',
      direction: 'outgoing',
      startTime: new Date(),
      duration: 0,
      isMuted: callSettings.autoMute,
      isVideoEnabled: type === 'video',
      isSpeakerOn: callSettings.speakerDefault,
      callQuality: 'good'
    };

    setCallState({
      isInCall: true,
      currentCall: newCall,
      isMuted: callSettings.autoMute,
      isVideoEnabled: type === 'video',
      isSpeakerOn: callSettings.speakerDefault,
      callDuration: 0,
      isConnecting: true,
      connectionQuality: 'good'
    });

    // Simulate call connection
    setTimeout(() => {
      setCallState(prev => ({
        ...prev,
        isConnecting: false,
        connectionQuality: 'excellent'
      }));
    }, 2000);
  };

  const endCall = () => {
    if (callState.currentCall) {
      const endedCall: CallRecord = {
        ...callState.currentCall,
        status: 'completed',
        endTime: new Date(),
        duration: callState.callDuration,
        isMuted: callState.isMuted,
        isVideoEnabled: callState.isVideoEnabled,
        isSpeakerOn: callState.isSpeakerOn
      };

      addCallRecord(endedCall);
    }

    setCallState(defaultCallState);
  };

  const answerCall = (callId: string) => {
    // In a real app, this would answer an incoming call
    // For now, we'll just simulate it
    setCallState(prev => ({
      ...prev,
      isInCall: true,
      isConnecting: false
    }));
  };

  const declineCall = (callId: string) => {
    // In a real app, this would decline an incoming call
    // For now, we'll just simulate it
    setCallState(prev => ({
      ...prev,
      isInCall: false,
      currentCall: undefined
    }));
  };

  const toggleMute = () => {
    setCallState(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
  };

  const toggleVideo = () => {
    setCallState(prev => ({
      ...prev,
      isVideoEnabled: !prev.isVideoEnabled
    }));
  };

  const toggleSpeaker = () => {
    setCallState(prev => ({
      ...prev,
      isSpeakerOn: !prev.isSpeakerOn
    }));
  };

  const updateCallSettings = (settings: Partial<CallSettings>) => {
    setCallSettings(prev => ({ ...prev, ...settings }));
  };

  const getCallHistoryByParticipant = (participantId: string) => {
    return callHistory.filter(call => call.participantId === participantId);
  };

  const getCallStats = () => {
    const total = callHistory.length;
    const voice = callHistory.filter(call => call.type === 'voice').length;
    const video = callHistory.filter(call => call.type === 'video').length;
    const missed = callHistory.filter(call => call.status === 'missed').length;

    return { total, voice, video, missed };
  };

  const value: CallContextType = {
    callHistory,
    addCallRecord,
    deleteCallRecord,
    clearCallHistory,
    callState,
    startCall,
    endCall,
    answerCall,
    declineCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    callSettings,
    updateCallSettings,
    getCallHistoryByParticipant,
    getCallStats
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};

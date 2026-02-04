import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '@/services/api';
import { useApp } from '@/hooks/useApp';

const AUTH_TOKEN_KEY = 'driftzo_token';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  emitTypingStart: (conversationId: string) => void;
  emitTypingStop: (conversationId: string) => void;
  joinChatRoom: (roomId: string) => void;
  leaveChatRoom: (roomId: string) => void;
  emitTypingStartRoom: (roomId: string) => void;
  emitTypingStopRoom: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useApp();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token) return;

    const url = getSocketUrl();
    const s = io(url, {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));
    s.on('connect_error', () => setIsConnected(false));

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?.id]);

  const joinConversation = (conversationId: string) => {
    socketRef.current?.emit('join_conversation', conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socketRef.current?.emit('leave_conversation', conversationId);
  };

  const emitTypingStart = (conversationId: string) => {
    socketRef.current?.emit('typing:start', conversationId);
  };

  const emitTypingStop = (conversationId: string) => {
    socketRef.current?.emit('typing:stop', conversationId);
  };

  const joinChatRoom = (roomId: string) => {
    socketRef.current?.emit('join_chat_room', roomId);
  };

  const leaveChatRoom = (roomId: string) => {
    socketRef.current?.emit('leave_chat_room', roomId);
  };

  const emitTypingStartRoom = (roomId: string) => {
    socketRef.current?.emit('typing:start_room', roomId);
  };

  const emitTypingStopRoom = (roomId: string) => {
    socketRef.current?.emit('typing:stop_room', roomId);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
        emitTypingStart,
        emitTypingStop,
        joinChatRoom,
        leaveChatRoom,
        emitTypingStartRoom,
        emitTypingStopRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (ctx === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return ctx;
}

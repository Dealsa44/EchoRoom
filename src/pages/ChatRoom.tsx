import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, Settings, Moon, Sun } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { useSocket } from '@/contexts/SocketContext';
import { chatApi } from '@/services/api';
import { moodThemes } from '@/lib/moodThemes';

type RoomMessage = {
  id: string;
  userId: string;
  content: string;
  type: string;
  reactions: Array<{ userId: string; emoji: string }>;
  createdAt: string;
  user?: { id: string; username: string; avatar: string | null };
};

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDarkMode, toggleDarkMode } = useApp();
  const { socket, joinChatRoom, leaveChatRoom, emitTypingStartRoom, emitTypingStopRoom } = useSocket();

  const [room, setRoom] = useState<{
    id: string;
    title: string;
    chatTheme: string | null;
    isCreator: boolean;
  } | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUserIds, setTypingUserIds] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const themeId = (room?.chatTheme || 'default') as keyof typeof moodThemes;
  const theme = moodThemes[themeId] || moodThemes.default;

  const loadRoom = useCallback(() => {
    if (!id) return;
    chatApi.getChatRoom(id).then((res) => {
      if (res.success && res.room) {
        setRoom({
          id: res.room.id,
          title: res.room.title,
          chatTheme: res.room.chatTheme ?? 'default',
          isCreator: res.room.isCreator ?? false,
        });
      } else {
        setRoom(null);
      }
    });
  }, [id]);

  const loadMessages = useCallback(() => {
    if (!id) return;
    chatApi.getRoomMessages(id).then((res) => {
      if (res.success && res.messages) {
        setMessages(
          res.messages.map((m: any) => ({
            id: m.id,
            userId: m.userId,
            content: m.content,
            type: m.type || 'text',
            reactions: m.reactions || [],
            createdAt: m.createdAt,
            user: m.user,
          }))
        );
      }
    });
  }, [id]);

  useEffect(() => {
    if (!id || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadRoom();
    loadMessages();
    setLoading(false);
  }, [id, user?.id, loadRoom, loadMessages]);

  useEffect(() => {
    if (!id || !socket) return;
    joinChatRoom(id);
    return () => {
      leaveChatRoom(id);
    };
  }, [id, socket, joinChatRoom, leaveChatRoom]);

  useEffect(() => {
    if (!socket || !id) return;
    const onNewMessage = (payload: RoomMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [
          ...prev,
          {
            id: payload.id,
            userId: payload.userId,
            content: payload.content,
            type: payload.type || 'text',
            reactions: (payload as any).reactions || [],
            createdAt: (payload as any).createdAt || new Date().toISOString(),
            user: (payload as any).user,
          },
        ];
      });
    };
    const onTypingStart = (payload: { userId: string; roomId: string }) => {
      if (payload.roomId !== id || payload.userId === user?.id) return;
      setTypingUserIds((prev) => new Set(prev).add(payload.userId));
    };
    const onTypingStop = (payload: { userId: string; roomId: string }) => {
      if (payload.roomId !== id) return;
      setTypingUserIds((prev) => {
        const next = new Set(prev);
        next.delete(payload.userId);
        return next;
      });
    };
    const onThemeChanged = () => loadRoom();
    const onRoomUpdated = (payload: { roomId?: string }) => {
      if (payload?.roomId === id) loadRoom();
    };
    const onRoomDeleted = (payload: { roomId: string }) => {
      if (payload.roomId === id) navigate('/chat-rooms');
    };
    const onMemberLeft = () => loadRoom();
    const onAdminChanged = () => loadRoom();

    socket.on('message:new_room', onNewMessage);
    socket.on('typing:start_room', onTypingStart);
    socket.on('typing:stop_room', onTypingStop);
    socket.on('theme:changed_room', onThemeChanged);
    socket.on('room:updated', onRoomUpdated);
    socket.on('room:deleted', onRoomDeleted);
    socket.on('member:left_room', onMemberLeft);
    socket.on('admin:changed_room', onAdminChanged);

    return () => {
      socket.off('message:new_room', onNewMessage);
      socket.off('typing:start_room', onTypingStart);
      socket.off('typing:stop_room', onTypingStop);
      socket.off('theme:changed_room', onThemeChanged);
      socket.off('room:updated', onRoomUpdated);
      socket.off('room:deleted', onRoomDeleted);
      socket.off('member:left_room', onMemberLeft);
      socket.off('admin:changed_room', onAdminChanged);
    };
  }, [socket, id, user?.id, loadRoom, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setMessage(v);
    if (!id) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (v.trim()) {
      emitTypingStartRoom(id);
      typingTimeoutRef.current = setTimeout(() => emitTypingStopRoom(id), 2000);
    } else {
      emitTypingStopRoom(id);
    }
  };

  const handleSend = async () => {
    const content = message.trim();
    if (!content || !id || sending) return;
    setSending(true);
    emitTypingStopRoom(id);
    try {
      const res = await chatApi.sendMessage(id, content);
      if (res.success && res.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === (res.message as any).id)) return prev;
          return [
            ...prev,
            {
              id: (res.message as any).id,
              userId: (res.message as any).userId,
              content: (res.message as any).content,
              type: (res.message as any).type || 'text',
              reactions: (res.message as any).reactions || [],
              createdAt: (res.message as any).createdAt,
              user: (res.message as any).user,
            },
          ];
        });
        setMessage('');
      }
    } finally {
      setSending(false);
    }
  };

  if (loading && !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <Button onClick={() => navigate('/chat-rooms')}>Back to Chat Rooms</Button>
        </div>
      </div>
    );
  }

  const state = location.state as { from?: string } | null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header
        className="sticky top-0 z-20 border-b safe-top flex items-center justify-between gap-2 px-4 py-3 max-w-md mx-auto w-full"
        style={{
          background: theme?.gradients?.header || 'var(--background)',
          color: theme?.colors?.text ? undefined : 'var(--foreground)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (state?.from === 'chat-inbox') navigate('/chat-inbox');
              else navigate('/chat-rooms');
            }}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="font-semibold truncate">{room.title}</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/room-actions/${id}`, { state: { originalFrom: state?.from } })}>
            <Settings size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </header>

      <div
        className={`flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full pb-24 ${theme?.designClass ?? ''}`}
        style={{
          background: theme?.colors?.background || undefined,
        }}
      >
        <div className="space-y-3">
          {messages.map((msg) => {
            const isMe = msg.userId === user?.id;
            const isSystem = msg.type === 'system';
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                    {msg.content}
                  </p>
                </div>
              );
            }
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <Card
                  className={`max-w-[85%] ${
                    isMe ? 'bg-primary text-primary-foreground' : 'bg-card'
                  }`}
                >
                  <CardContent className="p-3">
                    {!isMe && msg.user && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{msg.user.avatar || '👤'}</span>
                        <span className="text-xs font-medium opacity-90">{msg.user.username}</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
          {typingUserIds.size > 0 && (
            <div className="flex justify-start">
              <p className="text-xs text-muted-foreground italic">Someone is typing…</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-3 max-w-md mx-auto bg-background border-t safe-bottom">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            autoComplete="off"
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={sending || !message.trim()} size="icon">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

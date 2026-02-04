import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, Moon, Sun, Paperclip, Mic } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { useSocket } from '@/contexts/SocketContext';
import { chatApi } from '@/services/api';
import { moodThemes } from '@/lib/moodThemes';
import CallButtons from '@/components/calls/CallButtons';

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
    let done = 0;
    const maybeDone = () => {
      done++;
      if (done >= 2) setLoading(false);
    };
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
      maybeDone();
    }).catch(() => {
      setRoom(null);
      maybeDone();
    });
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
      maybeDone();
    }).catch(maybeDone);
  }, [id, user?.id]);

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
  const handleBack = () => {
    if (state?.from === 'chat-inbox') navigate('/chat-inbox');
    else navigate('/chat-rooms');
  };

  const isDefault = themeId === 'default';
  const themeStyle = isDefault ? {} : {
    ['--mood-primary' as string]: theme.colors.primary,
    ['--mood-secondary' as string]: theme.colors.secondary,
    ['--mood-accent' as string]: theme.colors.accent,
    ['--mood-background' as string]: theme.colors.background,
    ['--mood-surface' as string]: theme.colors.surface,
    ['--mood-text' as string]: theme.colors.text,
    ['--mood-muted' as string]: theme.colors.muted,
    backgroundColor: theme.colors.background,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header: same as PrivateChat - same class and layout, name clickable -> room-actions */}
              <div className="fixed top-0 left-0 right-0 z-40 chat-room-header border-b border-border shadow-soft safe-top">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto w-full min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleBack}
              className="h-10 w-10 bg-transparent hover:bg-transparent active:bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 m-0 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 min-w-0 flex-1 p-2 h-auto bg-transparent hover:bg-transparent active:bg-transparent border-none outline-none focus:outline-none focus:ring-0 m-0 rounded-lg transition-colors text-left"
              onClick={() => navigate(`/room-actions/${id}`, { state: { originalFrom: state?.from } })}
            >
              <div className="text-2xl flex-shrink-0">💬</div>
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold truncate">{room.title}</h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground truncate">Group</span>
                </div>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="opacity-50 pointer-events-none" title="Coming soon" aria-hidden>
            <CallButtons
                participantId={id ?? ''}
                participantName={room.title}
                participantAvatar="💬"
              variant="full"
                callType="private"
              />
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="h-10 w-10 bg-transparent hover:bg-transparent active:bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 m-0 flex items-center justify-center rounded-lg transition-all hover:scale-110"
            >
              {isDarkMode ? <Sun size={20} className="text-warning hover:text-warning transition-smooth" /> : <Moon size={20} className="text-secondary hover:text-secondary transition-smooth" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto px-4 max-w-md mx-auto w-full chat-content-below-header chat-messages-area content-safe-top ${isDefault ? 'bg-background' : ''} ${isDefault ? '' : `mood-${themeId} ${theme.designClass || ''}`} pb-36`}
        style={themeStyle}
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

      {/* Message input: same as PrivateChat - Paperclip (disabled), Input, Send/Mic (Mic disabled) */}
      <div className="fixed bottom-0 left-0 right-0 bg-card p-4 max-w-md mx-auto w-full border-t border-border safe-bottom">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled
            aria-disabled="true"
            title="Attachments coming soon"
            className="p-2 opacity-50 cursor-not-allowed"
          >
            <Paperclip size={16} />
          </Button>
          <Input
            id="chatRoomMessage"
            name="chatRoomMessage"
            placeholder="Type a thoughtful message..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            autoComplete="off"
            className="flex-1"
          />
          {message.trim() ? (
            <Button
              onClick={handleSend}
              variant="cozy"
              className="px-3"
              disabled={sending}
            >
              <Send size={16} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              disabled
              aria-disabled="true"
              title="Voice messages coming soon"
              className="px-3 opacity-50 cursor-not-allowed"
            >
              <Mic size={16} />
            </Button>
          )}
        </div>
            </div>
    </div>
  );
};

export default ChatRoom;

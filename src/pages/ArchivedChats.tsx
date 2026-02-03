import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MessageCircle, 
  Users, 
  Archive, 
  Trash2,
  AlertTriangle,
  User,
  UserX,
  MoreVertical,
  Pin,
  VolumeX,
  LogOut,
  Heart,
  Palette,
  Mic,
  Image,
  File
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/hooks/useApp';
import { chatRooms } from '@/data/chatRooms';
import { 
  getConversationState, 
  updateConversationState,
  deleteConversationState,
} from '@/lib/conversationStorage';
import { conversationApi, getPersistedConversations, type ConversationListItem } from '@/services/api';
import { markArchivedChatsAsRead } from '@/lib/notificationStorage';
import { formatDistanceToNow } from 'date-fns';

interface ArchivedConversation {
  id: string;
  type: 'private' | 'group';
  participant: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  lastMessage: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    type: 'text' | 'image' | 'voice' | 'file' | 'system';
    isRead: boolean;
  };
  lastActivityType?: string | null;
  lastActivitySummary?: string | null;
  lastActivityUserId?: string | null;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  roomInfo?: {
    title: string;
    memberCount: number;
    category: string;
  };
}

const ArchivedChats = () => {
  const navigate = useNavigate();
  const { user, joinedRooms } = useApp();
  const [archivedConversations, setArchivedConversations] = useState<ArchivedConversation[]>([]);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const mapToArchived = (list: ConversationListItem[]) =>
    list.map((c: ConversationListItem) => {
      const state = getConversationState(c.id);
      return {
        id: c.id,
        type: 'private' as const,
        participant: {
          id: c.otherUser.id,
          name: c.otherUser.name,
          avatar: c.otherUser.avatar || '🌟',
          isOnline: false,
        },
        lastMessage: c.lastMessage
          ? {
              id: c.lastMessage.id,
              content: c.lastMessage.content,
              sender: c.lastMessage.senderId === user?.id ? 'you' : c.lastMessage.senderName,
              timestamp: c.lastMessage.createdAt,
              type: c.lastMessage.type as 'text' | 'image' | 'voice' | 'file' | 'system',
              isRead: true,
            }
          : {
              id: '',
              content: 'No messages yet',
              sender: '',
              timestamp: c.lastMessageAt || new Date().toISOString(),
              type: 'text' as const,
              isRead: true,
            },
        lastActivityType: c.lastActivityType ?? null,
        lastActivitySummary: c.lastActivitySummary ?? null,
        lastActivityUserId: c.lastActivityUserId ?? null,
        unreadCount: 0,
        isPinned: state.isPinned,
        isArchived: true,
        isMuted: state.isMuted,
      };
    });

  const loadArchived = () => {
    const cached = getPersistedConversations(true);
    if (cached?.length) {
      setArchivedConversations((prev) => {
        const privateArchived = mapToArchived(cached);
        const allConversationStates = JSON.parse(localStorage.getItem('conversationStates') || '{}');
        const groupArchived: ArchivedConversation[] = (joinedRooms || []).map((roomId: string) => {
          const room = chatRooms.find(r => r.id === roomId);
          if (!room) return null;
          const conversationId = `joined-${roomId}`;
          const state = allConversationStates[conversationId] || {};
          if (!state.isArchived) return null;
          return {
            id: conversationId,
            type: 'group' as const,
            participant: { id: room.id, name: room.title, avatar: room.icon ?? room.avatar ?? '💬', isOnline: false },
            lastMessage: { id: '', content: '', sender: '', timestamp: '', type: 'text' as const, isRead: true },
            unreadCount: 0,
            isPinned: false,
            isArchived: true,
            isMuted: false,
            roomInfo: { title: room.title, memberCount: room.members ?? 0, category: room.category },
          };
        }).filter(Boolean) as ArchivedConversation[];
        return [...privateArchived, ...groupArchived];
      });
      setLoading(false);
    } else {
      setLoading(true);
    }
    conversationApi
      .list(true)
      .then((res) => {
        if (res.success && res.conversations) {
          const privateArchived: ArchivedConversation[] = res.conversations.map((c: ConversationListItem) => {
            const state = getConversationState(c.id);
            return {
              id: c.id,
              type: 'private' as const,
              participant: {
                id: c.otherUser.id,
                name: c.otherUser.name,
                avatar: c.otherUser.avatar || '🌟',
                isOnline: false,
              },
              lastMessage: c.lastMessage
                ? {
                    id: c.lastMessage.id,
                    content: c.lastMessage.content,
                    sender: c.lastMessage.senderId === user?.id ? 'you' : c.lastMessage.senderName,
                    timestamp: c.lastMessage.createdAt,
                    type: c.lastMessage.type as 'text' | 'image' | 'voice' | 'file',
                    isRead: true,
                  }
                : {
                    id: '',
                    content: 'No messages yet',
                    sender: '',
                    timestamp: c.lastMessageAt || new Date().toISOString(),
                    type: 'text' as const,
                    isRead: true,
                  },
              unreadCount: 0,
              isPinned: state.isPinned,
              isArchived: true,
              isMuted: state.isMuted,
            };
          });
          const allConversationStates = JSON.parse(localStorage.getItem('conversationStates') || '{}');
          const groupArchived: ArchivedConversation[] = (joinedRooms || []).map((roomId: string) => {
            const room = chatRooms.find(r => r.id === roomId);
            if (!room) return null;
            const conversationId = `joined-${roomId}`;
            const state = allConversationStates[conversationId] || {};
            if (!state.isArchived) return null;
            return {
              id: conversationId,
              type: 'group' as const,
              participant: { id: roomId, name: room.title, avatar: room.icon, isOnline: false },
              lastMessage: {
                id: `msg-${roomId}`,
                content: `Welcome to ${room.title}!`,
                sender: 'System',
                timestamp: new Date().toISOString(),
                type: 'text' as const,
                isRead: true,
              },
              unreadCount: 0,
              isPinned: state.isPinned || false,
              isArchived: true,
              isMuted: state.isMuted || false,
              roomInfo: { title: room.title, memberCount: room.members, category: room.category },
            };
          }).filter(Boolean) as ArchivedConversation[];
          setArchivedConversations([...privateArchived, ...groupArchived]);
        } else if (!cached?.length) {
          setArchivedConversations([]);
        }
      })
      .catch(() => {
        if (!cached?.length) setArchivedConversations([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) loadArchived();
    else setArchivedConversations([]);
    setLoading(!user);
  }, [user?.id, joinedRooms?.length]);

  useEffect(() => {
    markArchivedChatsAsRead();
  }, []);

  const handleUnarchiveConversation = (conversationId: string) => {
    const conv = archivedConversations.find(c => c.id === conversationId);
    if (conv?.type === 'private' && !conversationId.startsWith('joined-')) {
      conversationApi.setArchived(conversationId, false).then((res) => {
        if (res.success) setArchivedConversations(prev => prev.filter(c => c.id !== conversationId));
      });
      return;
    }
    updateConversationState(conversationId, { isArchived: false });
    setArchivedConversations(prev => prev.filter(c => c.id !== conversationId));
  };

  const handlePinConversation = (conversationId: string) => {
    const conv = archivedConversations.find(c => c.id === conversationId);
    if (!conv) return;

    const newPinnedState = !conv.isPinned;
    updateConversationState(conversationId, { isPinned: newPinnedState });
    
    setArchivedConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isPinned: newPinnedState }
        : conv
    ));
  };

  const handleMuteConversation = (conversationId: string) => {
    const conv = archivedConversations.find(c => c.id === conversationId);
    if (!conv) return;

    const newMutedState = !conv.isMuted;
    updateConversationState(conversationId, { isMuted: newMutedState });
    
    setArchivedConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isMuted: newMutedState }
        : conv
    ));
  };

  const handleDeleteConversation = (conversationId: string) => {
    setDeletingConversationId(conversationId);
  };

  const confirmDeleteConversation = () => {
    if (!deletingConversationId) return;
    const conv = archivedConversations.find(c => c.id === deletingConversationId);
    if (conv?.type === 'private' && !deletingConversationId.startsWith('joined-')) {
      conversationApi.deleteConversation(deletingConversationId).then((res) => {
        if (res.success) setArchivedConversations(prev => prev.filter(c => c.id !== deletingConversationId));
        setDeletingConversationId(null);
      });
      return;
    }
    deleteConversationState(deletingConversationId);
    setArchivedConversations(prev => prev.filter(c => c.id !== deletingConversationId));
    setDeletingConversationId(null);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const d = new Date(timestamp);
      if (!Number.isNaN(d.getTime())) return formatDistanceToNow(d, { addSuffix: true });
    } catch (_) {}
    return timestamp;
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'voice': return <Mic size={12} />;
      case 'image': return <Image size={12} />;
      case 'file': return <File size={12} />;
      default: return <MessageCircle size={12} />;
    }
  };

  const getLastActivityPreview = (conv: ArchivedConversation) => {
    if (conv.type !== 'private' || !conv.lastActivityType || !conv.lastActivitySummary) {
      return {
        icon: getMessageTypeIcon(conv.lastMessage.type),
        text: (conv.lastMessage.sender === 'you' ? 'You: ' : '') + conv.lastMessage.content,
      };
    }
    const otherName = conv.participant.name;
    const isYou = conv.lastActivityUserId === user?.id;
    switch (conv.lastActivityType) {
      case 'reaction':
        return {
          icon: <Heart size={12} className="text-muted-foreground" />,
          text: (isYou ? 'You ' : otherName + ' ') + conv.lastActivitySummary,
        };
      case 'theme':
        return {
          icon: <Palette size={12} className="text-muted-foreground" />,
          text: conv.lastActivitySummary,
        };
      default:
        return {
          icon: getMessageTypeIcon(conv.lastMessage.type),
          text: (conv.lastMessage.sender === 'you' ? 'You: ' : '') + (conv.lastActivitySummary || conv.lastMessage.content),
        };
    }
  };

  return (
    <div className="min-h-screen app-gradient-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-24 right-10 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-28 left-6 w-20 h-20 bg-gradient-secondary rounded-full blur-xl animate-float" style={{ animationDelay: '1.4s' }} />
      </div>

             <TopBar 
         title="Archived Chats" 
         showBack 
         onBack={() => navigate('/messages-settings')}
         showNotifications={false}
         showDarkModeToggle={false}
         showAIAssistant={false}
       />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10 content-safe-top pb-24">
        {/* Archived Conversations List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading archived…</div>
          ) : archivedConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-muted-foreground mb-2">No archived conversations</p>
              <p className="text-xs text-muted-foreground">
                Archived conversations will appear here
              </p>
            </div>
          ) : (
                         archivedConversations.map((conversation, index) => (
               <Card 
                 key={conversation.id}
                 className="cursor-pointer transform-gpu will-change-transform transition-all active:scale-[0.98] hover:shadow-large animate-fade-in animate-slide-up"
                 style={{ animationDelay: `${0.05 + index * 0.05}s` }}
               >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-primary/10 grid place-items-center shadow-inner-soft animate-float-ambient">
                      <div className="text-2xl select-none" aria-hidden>
                        {conversation.participant.avatar}
                      </div>
                      {conversation.participant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse-soft" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                                                 <div className="flex items-center gap-2 min-w-0">
                           <h3 className="font-medium truncate">{conversation.participant.name}</h3>
                           {conversation.isPinned && (
                             <Pin size={12} className="text-primary" />
                           )}
                           <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                             Archived
                           </Badge>
                         </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTimestamp(conversation.lastMessage.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {(() => {
                            const { icon, text } = getLastActivityPreview(conversation);
                            return (
                              <>
                                {icon}
                                <p className="text-sm text-muted-foreground truncate">{text}</p>
                              </>
                            );
                          })()}
                        </div>
                        
                                                 <div className="flex items-center gap-2 ml-2">
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-6 w-6">
                                 <MoreVertical size={12} />
                               </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end">
                               <DropdownMenuItem onClick={(e) => {
                                 e.stopPropagation();
                                 handleUnarchiveConversation(conversation.id);
                               }}>
                                 <Archive size={14} className="mr-2" />
                                 Unarchive
                               </DropdownMenuItem>
                               
                               <DropdownMenuItem onClick={(e) => {
                                 e.stopPropagation();
                                 handlePinConversation(conversation.id);
                               }}>
                                 <Pin size={14} className="mr-2" />
                                 {conversation.isPinned ? 'Unpin' : 'Pin'}
                               </DropdownMenuItem>
                               
                               <DropdownMenuItem onClick={(e) => {
                                 e.stopPropagation();
                                 handleMuteConversation(conversation.id);
                               }}>
                                 <VolumeX size={14} className="mr-2" />
                                 {conversation.isMuted ? 'Unmute' : 'Mute'}
                               </DropdownMenuItem>
                               
                               {conversation.type === 'group' ? (
                                 <DropdownMenuItem 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleDeleteConversation(conversation.id);
                                   }}
                                   className="text-destructive"
                                 >
                                   <LogOut size={14} className="mr-2" />
                                   Leave
                                 </DropdownMenuItem>
                               ) : (
                                 <DropdownMenuItem 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleDeleteConversation(conversation.id);
                                   }}
                                   className="text-destructive"
                                 >
                                   <UserX size={14} className="mr-2" />
                                   Unmatch
                                 </DropdownMenuItem>
                               )}
                             </DropdownMenuContent>
                           </DropdownMenu>
                         </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
                 </div>
       </div>

      {/* Delete Conversation Dialog */}
      <AlertDialog open={!!deletingConversationId} onOpenChange={() => setDeletingConversationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-destructive" />
              Delete Conversation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteConversation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArchivedChats;

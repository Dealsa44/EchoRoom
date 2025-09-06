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
  LogOut
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
  deleteConversationState 
} from '@/lib/conversationStorage';
import { markArchivedChatsAsRead } from '@/lib/notificationStorage';

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
    type: 'text' | 'image' | 'voice' | 'file';
    isRead: boolean;
  };
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
  const { user, joinedRooms, leaveRoom } = useApp();
  const [archivedConversations, setArchivedConversations] = useState<ArchivedConversation[]>([]);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);

  // Load archived conversations from localStorage
  useEffect(() => {
    const loadArchivedConversations = () => {
             // Get all conversation states from localStorage
       const allConversationStates = JSON.parse(localStorage.getItem('conversationStates') || '{}');
      
      // Filter only archived conversations
      const archivedConversations: ArchivedConversation[] = [];
      
      // Check private conversations (from ChatInbox)
      const privateConversations = [
        {
          id: 'private-1',
          type: 'private' as const,
          participant: {
            id: '1',
            name: 'Luna',
            avatar: '🌙',
            isOnline: true,
          },
          lastMessage: {
            id: 'msg-1',
            content: 'That\'s such a beautiful perspective on philosophy!',
            sender: 'Luna',
            timestamp: '2 min ago',
            type: 'text' as const,
            isRead: false,
          },
          unreadCount: 3,
          isPinned: false,
          isArchived: false,
          isMuted: false,
          isTyping: false,
        },
        {
          id: 'private-2',
          type: 'private' as const,
          participant: {
            id: '2',
            name: 'Alex',
            avatar: '📚',
            isOnline: false,
            lastSeen: '1 hour ago',
          },
          lastMessage: {
            id: 'msg-2',
            content: '🎵 Voice message (0:45)',
            sender: 'Alex',
            timestamp: '1 hour ago',
            type: 'voice' as const,
            isRead: true,
          },
          unreadCount: 0,
          isPinned: false,
          isArchived: false,
          isMuted: false,
          isTyping: false,
        },
        {
          id: 'private-3',
          type: 'private' as const,
          participant: {
            id: '3',
            name: 'Sage',
            avatar: '🌱',
            isOnline: true,
          },
          lastMessage: {
            id: 'msg-3',
            content: '📷 Photo',
            sender: 'you',
            timestamp: '3 hours ago',
            type: 'image' as const,
            isRead: true,
          },
          unreadCount: 0,
          isPinned: false,
          isArchived: false,
          isMuted: false,
          isTyping: true,
        }
      ];

             // Check joined rooms (groups)
       const joinedRooms = JSON.parse(localStorage.getItem('joinedRooms') || '[]');
      const groupConversations = joinedRooms.map((roomId: string) => {
        const room = chatRooms.find(r => r.id === roomId);
        if (!room) return null;

        return {
          id: `joined-${roomId}`,
          type: 'group' as const,
          participant: {
            id: roomId,
            name: room.title,
            avatar: room.icon,
            isOnline: false,
          },
          lastMessage: {
            id: `msg-${roomId}`,
            content: `Welcome to ${room.title}!`,
            sender: 'System',
            timestamp: '1 day ago',
            type: 'text' as const,
            isRead: true,
          },
          unreadCount: 0,
          isPinned: false,
          isArchived: false,
          isMuted: false,
          isTyping: false,
          roomInfo: {
            title: room.title,
            memberCount: room.members,
            category: room.category
          }
        };
      }).filter(Boolean);

      // Combine all conversations and filter archived ones
      const allConversations = [...privateConversations, ...groupConversations];
      
      allConversations.forEach(conv => {
        const state = allConversationStates[conv.id] || {};
        if (state.isArchived) {
          archivedConversations.push({
            ...conv,
            isPinned: state.isPinned || false,
            isArchived: true,
            isMuted: state.isMuted || false
          });
        }
      });

      setArchivedConversations(archivedConversations);
    };

    loadArchivedConversations();
    
    // Mark archived chats as read when user visits this page
    markArchivedChatsAsRead();
  }, []); // Empty dependency array to run only once

  const handleUnarchiveConversation = (conversationId: string) => {
    // Update persistent storage
    updateConversationState(conversationId, { isArchived: false });
    
    // Update local state
    setArchivedConversations(prev => prev.filter(conv => conv.id !== conversationId));
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
    if (deletingConversationId) {
      // Remove from persistent storage
      deleteConversationState(deletingConversationId);
      
      // Update local state
      setArchivedConversations(prev => prev.filter(conv => conv.id !== deletingConversationId));
      
      setDeletingConversationId(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return timestamp;
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'voice': return <MessageCircle size={12} />;
      case 'image': return <MessageCircle size={12} />;
      case 'file': return <MessageCircle size={12} />;
      default: return <MessageCircle size={12} />;
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
          {archivedConversations.length === 0 ? (
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
                          {getMessageTypeIcon(conversation.lastMessage.type)}
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.sender === 'you' ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
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

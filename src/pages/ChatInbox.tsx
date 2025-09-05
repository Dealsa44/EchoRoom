import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MessageCircle, 
  MoreVertical, 
  Pin, 
  Archive, 
  LogOut,
  Circle,
  CheckCircle2,
  Clock,
  Video,
  Phone,
  Image,
  Mic,
  File,
  Heart,
  Users,
  User,
  VolumeX,
  UserX,
  History,
  Calendar,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/hooks/useApp';
import { toast } from '@/hooks/use-toast';
import { chatRooms } from '@/data/chatRooms';
import { 
  getConversationState, 
  updateConversationState, 
  markConversationAsLeft,
  deleteConversationState 
} from '@/lib/conversationStorage';

interface ChatConversation {
  id: string;
  type: 'private' | 'group' | 'match';
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
  isTyping: boolean;
  roomInfo?: {
    title: string;
    memberCount: number;
    category: string;
  };
}

const ChatInbox = () => {
  const navigate = useNavigate();
  const { user, joinedRooms, leaveRoom } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  // Initialize conversations with persistent state
  useEffect(() => {
    const initializeConversations = () => {
      const baseConversations: ChatConversation[] = [
        // Private chats from matches
        {
          id: 'private-1',
          type: 'private',
          participant: {
            id: '1',
            name: 'Luna',
            avatar: '🌙',
            isOnline: true,
          },
          lastMessage: {
            id: 'msg-1',
            content: 'That\'s such a beautiful perspective on philosophy! I\'d love to hear more about your thoughts on...',
            sender: 'Luna',
            timestamp: '2 min ago',
            type: 'text',
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
          type: 'private',
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
            type: 'voice',
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
          type: 'private',
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
            type: 'image',
            isRead: true,
          },
          unreadCount: 0,
          isPinned: false,
          isArchived: false,
          isMuted: false,
          isTyping: true,
        },
      ];

      // Apply persistent states to conversations
      const conversationsWithState = baseConversations.map(conv => {
        const state = getConversationState(conv.id);
        return {
          ...conv,
          isPinned: state.isPinned,
          isArchived: state.isArchived,
          isMuted: state.isMuted
        };
      });

      setConversations(conversationsWithState);
    };

    initializeConversations();
  }, []);

  // Refresh conversations when joined rooms change
  useEffect(() => {
    // This will trigger a re-render when joinedRooms changes,
    // which will update the joinedRoomConversations
  }, [joinedRooms]);

  // Simulate typing in conversations to make them feel alive
  useEffect(() => {
    const typingInterval = setInterval(() => {
      // 20% chance to show someone typing
      if (Math.random() < 0.2) {
        setConversations(prev => prev.map(conv => {
          // Only show typing for online users and not for the current user
          if (conv.participant.isOnline && conv.participant.name !== 'You') {
            return { ...conv, isTyping: true };
          }
          return conv;
        }));

        // Stop typing after 2-4 seconds
        setTimeout(() => {
          setConversations(prev => prev.map(conv => ({ ...conv, isTyping: false })));
        }, 2000 + Math.random() * 2000);
      }
    }, 20000); // Every 20 seconds
    
    return () => clearInterval(typingInterval);
  }, []);

  // Add joined rooms to conversations (exclude left rooms)
  const joinedRoomConversations: ChatConversation[] = (joinedRooms || []).map(roomId => {
    const room = chatRooms.find(r => r.id === roomId);
    if (!room) return null;

    const conversationId = `joined-${roomId}`;
    const state = getConversationState(conversationId);
    
    // Skip if this room has been left
    if (state.isLeft) return null;

    // Generate some sample last messages based on room type
    const getLastMessage = () => {
      const messages = {
        'philosophy': 'LanguageHelper: The discussion about existentialism was fascinating today!',
        'books': 'BookWorm: Just finished reading "The Midnight Library" - amazing!',
        'wellness': 'ZenMaster: Today\'s meditation session was incredibly peaceful',
        'art': 'PoetSoul: New poem shared in the group!',
        'languages': 'PracticeBot: Great pronunciation practice session everyone! 🎉',
        'science': 'ScienceBot: New breakthrough in quantum computing discussed!'
      }[room.category] || 'Welcome to the group!';
      
      return messages;
    };

    return {
      id: conversationId,
      type: 'group',
      participant: {
        id: `room-${roomId}`,
        name: room.title,
        avatar: room.icon,
        isOnline: true,
      },
      roomInfo: {
        title: room.title,
        memberCount: room.members,
        category: room.category,
      },
      lastMessage: {
        id: `msg-joined-${roomId}`,
        content: getLastMessage(),
        sender: 'System',
        timestamp: '1 hour ago',
        type: 'text',
        isRead: true,
      },
      unreadCount: 0,
      isPinned: state.isPinned,
      isArchived: state.isArchived,
      isMuted: state.isMuted,
      isTyping: false,
    };
  }).filter(Boolean) as ChatConversation[];

  // Combine existing conversations with joined room conversations
  const allConversations = [...conversations, ...joinedRoomConversations];

  const filteredConversations = allConversations.filter(conv => {
    const matchesSearch = conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch && !conv.isArchived;
    if (activeTab === 'private') return matchesSearch && conv.type === 'private' && !conv.isArchived;
    if (activeTab === 'groups') return matchesSearch && conv.type === 'group' && !conv.isArchived;
    if (activeTab === 'archived') return matchesSearch && conv.isArchived;
    
    return matchesSearch;
  }).sort((a, b) => {
    // Pinned conversations first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then by timestamp (most recent first)
    const timeA = new Date(a.lastMessage.timestamp).getTime();
    const timeB = new Date(b.lastMessage.timestamp).getTime();
    return timeB - timeA;
  });

  const totalUnread = allConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleOpenChat = (conversation: ChatConversation) => {
    if (conversation.type === 'private') {
      navigate(`/private-chat/${conversation.participant.id}`, { state: { from: 'chat-inbox' } });
    } else if (conversation.type === 'group') {
      navigate(`/chat-room/${conversation.participant.id.replace('room-', '')}`, { state: { from: 'chat-inbox' } });
    }
    
    // Mark as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
        : conv
    ));
  };

  const handlePinConversation = (conversationId: string) => {
    const conv = allConversations.find(c => c.id === conversationId);
    const newPinnedState = !conv?.isPinned;
    
    // Update persistent storage
    updateConversationState(conversationId, { isPinned: newPinnedState });
    
    // Update local state
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isPinned: newPinnedState }
        : conv
    ));
    
    // Pinned/unpinned conversation - toast removed per user request
  };

  const handleArchiveConversation = (conversationId: string) => {
    const conv = allConversations.find(c => c.id === conversationId);
    const newArchivedState = !conv?.isArchived;
    
    // Update persistent storage
    updateConversationState(conversationId, { isArchived: newArchivedState });
    
    // Update local state
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isArchived: newArchivedState }
        : conv
    ));
    
    // Archived/unarchived conversation - toast removed per user request
  };

  const handleLeaveConversation = (conversationId: string) => {
    const conv = allConversations.find(c => c.id === conversationId);
    
    if (conv?.type === 'group' && conversationId.startsWith('joined-')) {
      // Extract room ID from conversation ID
      const roomId = conversationId.replace('joined-', '');
      
      // Mark as left in persistent storage
      markConversationAsLeft(conversationId);
      
      // Leave room in app context (this will make it available in chat rooms again)
      leaveRoom(roomId);
    } else if (conv?.type === 'private') {
      // For private chats, remove them from persistent storage and local state
      deleteConversationState(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Deleted conversation - toast removed per user request
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'voice': return <Mic size={12} />;
      case 'image': return <Image size={12} />;
      case 'file': return <File size={12} />;
      default: return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    // Simple formatting - in real app would use proper date library
    return timestamp;
  };

  return (
    <div className="min-h-screen app-gradient-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-24 right-10 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-28 left-6 w-20 h-20 bg-gradient-secondary rounded-full blur-xl animate-float" style={{ animationDelay: '1.4s' }} />
        <div className="absolute top-1/2 right-4 w-16 h-16 bg-gradient-accent rounded-full blur-lg animate-float" style={{ animationDelay: '2.8s' }} />
      </div>

      <TopBar title="Messages" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10 content-safe-top pb-24">
        {/* Search with Menu */}
        <div className="relative glass rounded-2xl p-1 shadow-medium animate-breathe-slow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
          <Input
            id="conversationSearch"
            name="conversationSearch"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            className="pl-12 pr-12 border-0 bg-transparent shadow-none focus:ring-0 h-12"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-white/10"
              >
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/call-history')}>
                <History size={16} className="mr-2" />
                Call History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/archived-chats')}>
                <Archive size={16} className="mr-2" />
                Archived Chats
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-10 text-xs font-medium"
              onClick={() => setActiveTab('all')}
            >
              All ({allConversations.filter(c => !c.isArchived).length})
            </Button>
            <Button
              variant={activeTab === 'private' ? 'default' : 'outline'}
              size="sm"
              className="h-10 text-xs font-medium"
              onClick={() => setActiveTab('private')}
            >
              Private ({allConversations.filter(c => c.type === 'private' && !c.isArchived).length})
            </Button>
            <Button
              variant={activeTab === 'groups' ? 'default' : 'outline'}
              size="sm"
              className="h-10 text-xs font-medium"
              onClick={() => setActiveTab('groups')}
            >
              Groups ({allConversations.filter(c => c.type === 'group' && !c.isArchived).length})
            </Button>
          </div>
        </div>

        {/* Discover Rooms Button (revert to dashed outline style) */}
        <Button
          variant="outline"
          className="w-full border-dashed border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
          onClick={() => navigate('/chat-rooms')}
        >
          <Users size={16} className="mr-2" />
          Discover New Chat Rooms
        </Button>

        {/* Conversations List */}
        <div className="space-y-3">
          {filteredConversations.map((conversation, index) => (
            <Card 
              key={conversation.id}
              className={`cursor-pointer transform-gpu will-change-transform transition-all active:scale-[0.98] hover:shadow-large animate-fade-in animate-slide-up ${conversation.unreadCount > 0 ? 'border-primary/20 shadow-glow-primary/40' : ''}`}
              style={{ animationDelay: `${0.05 + index * 0.05}s` }}
              onClick={() => handleOpenChat(conversation)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-primary/10 grid place-items-center shadow-inner-soft animate-float-ambient">
                    <div className="text-2xl select-none" aria-hidden>{conversation.participant.avatar}</div>
                    {conversation.participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse-soft" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-medium truncate">{conversation.participant.name}</h3>
                        {conversation.isPinned && <Pin size={12} className="text-primary" />}
                        {conversation.isMuted && <VolumeX size={12} className="text-muted-foreground" />}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTimestamp(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getMessageTypeIcon(conversation.lastMessage.type)}
                        {conversation.isTyping ? (
                          <p className="text-sm text-primary/80 truncate animate-pulse-soft">typing…</p>
                        ) : (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.sender === 'you' ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-2">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0.5 shadow-glow-destructive/30">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical size={12} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {conversation.type === 'private' && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${conversation.participant.id}`);
                              }}>
                                <User size={14} className="mr-2" />
                                View Profile
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handlePinConversation(conversation.id);
                            }}>
                              <Pin size={14} className="mr-2" />
                              {conversation.isPinned ? 'Unpin' : 'Pin'}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveConversation(conversation.id);
                            }}>
                              <Archive size={14} className="mr-2" />
                              {conversation.isArchived ? 'Unarchive' : 'Archive'}
                            </DropdownMenuItem>
                            
                            {conversation.type === 'group' ? (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLeaveConversation(conversation.id);
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
                                  handleLeaveConversation(conversation.id);
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
          ))}
        </div>

        {filteredConversations.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-muted-foreground">
              {activeTab === 'all' ? 'No conversations yet' : `No ${activeTab} conversations`}
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ChatInbox;
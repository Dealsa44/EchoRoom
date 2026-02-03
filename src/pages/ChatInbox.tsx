import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MessageCircle, 
  Settings, 
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
  Shield,
  UserPlus,
  Check,
  X,
  MessageSquare,
  Eye,
  Trash2,
  Bell,
  BellOff
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/hooks/useApp';
import { toast } from '@/hooks/use-toast';
import { chatRooms } from '@/data/chatRooms';
import { 
  getConversationState, 
  updateConversationState, 
  markConversationAsLeft,
} from '@/lib/conversationStorage';
import { conversationApi, type ConversationListItem } from '@/services/api';
import { mockProfiles } from '@/data/mockProfiles';
import { formatDistanceToNow } from 'date-fns';

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

interface ContactRequest {
  id: string;
  from: {
    id: string;
    name: string;
    avatar: string;
    age: number;
    location: string;
    isOnline: boolean;
  };
  context: {
    type: 'forum' | 'chatroom';
    source: string;
    topic?: string;
  };
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

const ChatInbox = () => {
  const navigate = useNavigate();
  const { user, joinedRooms, leaveRoom } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('chatInboxActiveTab') || 'chats';
  });
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  // Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chatInboxActiveTab', activeTab);
  }, [activeTab]);

  // Load real private conversations from API
  const loadConversations = () => {
    setConversationsLoading(true);
    conversationApi
      .list(false)
      .then((res) => {
        if (res.success && res.conversations) {
          const withPinState = res.conversations.map((c: ConversationListItem) => {
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
              isArchived: c.isArchived,
              isMuted: state.isMuted,
              isTyping: false,
            };
          });
          setConversations(withPinState);
        } else {
          setConversations([]);
        }
      })
      .catch(() => setConversations([]))
      .finally(() => setConversationsLoading(false));
  };

  useEffect(() => {
    if (user) loadConversations();
    else {
      setConversations([]);
      setConversationsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const initializeContactRequests = () => {
      // Get profiles with IDs 6, 7, 8 (unused profiles for contact requests)
      const zaraProfile = mockProfiles.find(p => p.id === 6);
      const riverProfile = mockProfiles.find(p => p.id === 7);
      const leoProfile = mockProfiles.find(p => p.id === 8);

      const mockRequests: ContactRequest[] = [
        {
          id: 'req-1',
          from: {
            id: '6',
            name: zaraProfile?.name || 'Zara',
            avatar: zaraProfile?.avatar || '🎭',
            age: zaraProfile?.age || 27,
            location: zaraProfile?.location || 'Montreal, Canada',
            isOnline: zaraProfile?.isOnline || true,
          },
          context: {
            type: 'forum',
            source: 'Philosophy Forum',
            topic: 'The paradox of choice in modern life'
          },
          message: 'Hi! I loved your thoughtful response about decision-making. I\'d love to discuss this further with you.',
          timestamp: '1 hour ago',
          status: 'pending'
        },
        {
          id: 'req-2',
          from: {
            id: '7',
            name: riverProfile?.name || 'River',
            avatar: riverProfile?.avatar || '🌊',
            age: riverProfile?.age || 26,
            location: riverProfile?.location || 'Portland, Oregon',
            isOnline: riverProfile?.isOnline || false,
          },
          context: {
            type: 'chatroom',
            source: 'Wellness Chat',
            topic: 'Mindfulness practices'
          },
          message: 'Your insights on meditation were really helpful! Would love to connect and share more experiences.',
          timestamp: '3 hours ago',
          status: 'pending'
        },
        {
          id: 'req-3',
          from: {
            id: '8',
            name: leoProfile?.name || 'Leo',
            avatar: leoProfile?.avatar || '🎵',
            age: leoProfile?.age || 29,
            location: leoProfile?.location || 'Austin, Texas',
            isOnline: leoProfile?.isOnline || true,
          },
          context: {
            type: 'forum',
            source: 'Education Forum',
            topic: 'Learning languages as an adult'
          },
          message: 'I\'m also learning Georgian! It would be great to practice together and share tips.',
          timestamp: '5 hours ago',
          status: 'pending'
        }
      ];
      setContactRequests(mockRequests);
    };
    initializeContactRequests();
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
    
    if (activeTab === 'chats') return matchesSearch && !conv.isArchived;
    if (activeTab === 'requests') return false; // Requests are handled separately
    
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

  const filteredRequests = contactRequests.filter(req => {
    const matchesSearch = req.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && req.status === 'pending';
  }).sort((a, b) => {
    // Most recent requests first
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
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

    if (conv?.type === 'private' && !conversationId.startsWith('joined-')) {
      conversationApi.setArchived(conversationId, newArchivedState).then((res) => {
        if (res.success) loadConversations();
        else toast({ title: 'Error', description: 'Failed to update archive state', variant: 'destructive' });
      });
      return;
    }

    updateConversationState(conversationId, { isArchived: newArchivedState });
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, isArchived: newArchivedState } : c
    ));
  };

  const handleMuteConversation = (conversationId: string) => {
    const conv = allConversations.find(c => c.id === conversationId);
    const newMutedState = !conv?.isMuted;
    
    // Update persistent storage
    updateConversationState(conversationId, { isMuted: newMutedState });
    
    // Update local state
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isMuted: newMutedState }
        : conv
    ));
  };

  const handleLeaveConversation = (conversationId: string) => {
    const conv = allConversations.find(c => c.id === conversationId);

    if (conv?.type === 'group' && conversationId.startsWith('joined-')) {
      const roomId = conversationId.replace('joined-', '');
      markConversationAsLeft(conversationId);
      leaveRoom(roomId);
      return;
    }

    if (conv?.type === 'private') {
      conversationApi.deleteConversation(conversationId).then((res) => {
        if (res.success) setConversations(prev => prev.filter(c => c.id !== conversationId));
        else toast({ title: 'Error', description: 'Failed to delete conversation', variant: 'destructive' });
      });
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    // Simply remove the request from the list (temporary, will reappear on refresh)
    setContactRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleDeclineRequest = (requestId: string) => {
    // Simply remove the request from the list (temporary, will reappear on refresh)
    setContactRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
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
    try {
      const d = new Date(timestamp);
      if (!Number.isNaN(d.getTime())) return formatDistanceToNow(d, { addSuffix: true });
    } catch (_) {}
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
        {/* Search with Settings */}
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
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/messages-settings')}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-white/10"
          >
            <Settings size={16} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={activeTab === 'chats' ? 'default' : 'outline'}
            size="sm"
            className="h-10 text-xs font-medium"
            onClick={() => setActiveTab('chats')}
          >
            <MessageCircle size={12} className="mr-2" />
            Chats ({allConversations.filter(c => !c.isArchived).length})
          </Button>
          
          <div className="relative">
            <Button
              variant={activeTab === 'requests' ? 'default' : 'outline'}
              size="sm"
              className="w-full h-10 text-xs font-medium"
              onClick={() => setActiveTab('requests')}
            >
              <UserPlus size={12} className="mr-2" />
              Requests ({contactRequests.filter(req => req.status === 'pending').length})
            </Button>
            {contactRequests.filter(req => req.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="absolute -top-2.5 -right-2.5 h-5 w-5 text-xs p-0 flex items-center justify-center min-w-[20px] z-10">
                {contactRequests.filter(req => req.status === 'pending').length}
              </Badge>
            )}
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

        {/* Content based on active tab */}
        {activeTab === 'requests' ? (
          /* Contact Requests List */
          <div className="space-y-3">
            {filteredRequests.map((request, index) => (
              <Card 
                key={request.id}
                className="transform-gpu will-change-transform transition-all hover:shadow-large animate-fade-in animate-slide-up border-primary/20"
                style={{ animationDelay: `${0.05 + index * 0.05}s` }}
              >
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Request Header */}
                    <div className="flex items-start gap-3">
                      <div 
                        className="relative w-12 h-12 rounded-2xl bg-gradient-primary/10 grid place-items-center shadow-inner-soft cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => handleViewProfile(request.from.id)}
                      >
                        <div className="text-2xl select-none" aria-hidden>{request.from.avatar}</div>
                        {request.from.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse-soft" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 
                              className="font-medium truncate cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleViewProfile(request.from.id)}
                            >
                              {request.from.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {request.from.age}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatTimestamp(request.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {request.from.location}
                        </p>
                      </div>
                    </div>

                    {/* Context */}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-primary" />
                        <span className="text-sm font-medium text-primary">
                          From {request.context.source}
                        </span>
                      </div>
                      {request.context.topic && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Topic: {request.context.topic}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed">
                        "{request.message}"
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1"
                      >
                        <Check size={14} className="mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeclineRequest(request.id)}
                        className="flex-1"
                      >
                        <X size={14} className="mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Conversations List */
        <div className="space-y-3">
          {conversationsLoading ? (
            <div className="py-8 text-center text-muted-foreground text-sm">Loading conversations…</div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              <p className="mb-2">No conversations yet</p>
              <p className="text-xs">Chat with someone from their profile to start.</p>
            </div>
          ) : null}
          {!conversationsLoading && filteredConversations.map((conversation, index) => (
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
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 hover:bg-primary/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={12} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {conversation.type === 'private' ? (
                              <>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/profile/${conversation.participant.id}`);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Eye size={14} className="mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMuteConversation(conversation.id);
                                  }}
                                  className="cursor-pointer"
                                >
                                  {conversation.isMuted ? (
                                    <>
                                      <Bell size={14} className="mr-2" />
                                      Unmute
                                    </>
                                  ) : (
                                    <>
                                      <BellOff size={14} className="mr-2" />
                                      Mute
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePinConversation(conversation.id);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Pin size={14} className="mr-2" />
                                  {conversation.isPinned ? 'Unpin' : 'Pin'} Chat
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchiveConversation(conversation.id);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Archive size={14} className="mr-2" />
                                  {conversation.isArchived ? 'Unarchive' : 'Archive'} Chat
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLeaveConversation(conversation.id);
                                  }}
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Trash2 size={14} className="mr-2" />
                                  Delete Chat
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMuteConversation(conversation.id);
                                  }}
                                  className="cursor-pointer"
                                >
                                  {conversation.isMuted ? (
                                    <>
                                      <Bell size={14} className="mr-2" />
                                      Unmute
                                    </>
                                  ) : (
                                    <>
                                      <BellOff size={14} className="mr-2" />
                                      Mute
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePinConversation(conversation.id);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Pin size={14} className="mr-2" />
                                  {conversation.isPinned ? 'Unpin' : 'Pin'} Chat
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchiveConversation(conversation.id);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Archive size={14} className="mr-2" />
                                  {conversation.isArchived ? 'Unarchive' : 'Archive'} Chat
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLeaveConversation(conversation.id);
                                  }}
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <LogOut size={14} className="mr-2" />
                                  Leave Group
                                </DropdownMenuItem>
                              </>
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
        )}

        {/* Empty State */}
        {((activeTab === 'requests' && filteredRequests.length === 0) || 
          (activeTab !== 'requests' && filteredConversations.length === 0)) && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">
              {activeTab === 'requests' ? '📨' : '💬'}
            </div>
            <p className="text-muted-foreground">
              {activeTab === 'requests' 
                ? 'No contact requests yet' 
                : 'No conversations yet'
              }
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ChatInbox;
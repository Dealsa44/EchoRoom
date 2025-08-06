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
  VolumeX
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
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { chatRooms } from '@/data/chatRooms';

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
  const [conversations, setConversations] = useState<ChatConversation[]>([
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
      isPinned: true,
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
  ]);

  // Add joined rooms to conversations
  const joinedRoomConversations: ChatConversation[] = (joinedRooms || []).map(roomId => {
    const room = chatRooms.find(r => r.id === roomId);
    if (!room) return null;

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
      id: `joined-${roomId}`,
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
      isPinned: false,
      isArchived: false,
      isMuted: false,
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
      navigate(`/private-chat/${conversation.participant.id}`);
    } else if (conversation.type === 'group') {
      navigate(`/chat-room/${conversation.participant.id.replace('room-', '')}`);
    }
    
    // Mark as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
        : conv
    ));
  };

  const handlePinConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isPinned: !conv.isPinned }
        : conv
    ));
    
    const conv = allConversations.find(c => c.id === conversationId);
    toast({
      title: conv?.isPinned ? "Unpinned conversation" : "Pinned conversation",
      description: `${conv?.participant.name} ${conv?.isPinned ? 'removed from' : 'added to'} pinned conversations`,
    });
  };

  const handleArchiveConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isArchived: !conv.isArchived }
        : conv
    ));
    
    const conv = allConversations.find(c => c.id === conversationId);
    toast({
      title: conv?.isArchived ? "Unarchived conversation" : "Archived conversation",
      description: `${conv?.participant.name} ${conv?.isArchived ? 'removed from' : 'moved to'} archives`,
    });
  };

  const handleLeaveConversation = (conversationId: string) => {
    const conv = allConversations.find(c => c.id === conversationId);
    
    if (conv?.type === 'group' && conversationId.startsWith('joined-')) {
      // Extract room ID from conversation ID
      const roomId = conversationId.replace('joined-', '');
      leaveRoom(roomId);
      
      toast({
        title: "Left chat room",
        description: `You've left ${conv.participant.name}`,
      });
    } else if (conv?.type === 'private') {
      // For private chats, remove them from the list
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      toast({
        title: "Deleted conversation",
        description: `Removed ${conv.participant.name} from your conversations`,
      });
    } else {
      // For other types, archive them
      handleArchiveConversation(conversationId);
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
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Messages" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
              id="conversationSearch"
              name="conversationSearch"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              All ({allConversations.filter(c => !c.isArchived).length})
            </TabsTrigger>
            <TabsTrigger value="private" className="text-xs">
              Private ({allConversations.filter(c => c.type === 'private' && !c.isArchived).length})
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-xs">
              Groups ({allConversations.filter(c => c.type === 'group' && !c.isArchived).length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-xs">
              Archived ({allConversations.filter(c => c.isArchived).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Conversations List */}
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="cursor-pointer transition-all hover:shadow-medium hover:scale-[1.02]"
              onClick={() => handleOpenChat(conversation)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="text-2xl">{conversation.participant.avatar}</div>
                    {conversation.participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{conversation.participant.name}</h3>
                        {conversation.isPinned && <Pin size={12} className="text-primary" />}
                        {conversation.isMuted && <VolumeX size={12} className="text-muted-foreground" />}
                      </div>
                      <span className="text-xs text-muted-foreground">
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
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
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
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handlePinConversation(conversation.id);
                            }}>
                              <Pin size={14} className="mr-2" />
                              {conversation.isPinned ? 'Unpin' : 'Pin'}
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
                                Leave Chat
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveConversation(conversation.id);
                                }}>
                                  <Archive size={14} className="mr-2" />
                                  {conversation.isArchived ? 'Unarchive' : 'Archive'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLeaveConversation(conversation.id);
                                  }}
                                  className="text-destructive"
                                >
                                  <LogOut size={14} className="mr-2" />
                                  Delete
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
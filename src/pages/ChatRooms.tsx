import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Users, Lock, Globe, LogIn } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import CreateRoomModal from '@/components/modals/CreateRoomModal';
import { ChatRoomSkeleton } from '@/components/ui/SkeletonLoader';

import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { chatRooms } from '@/data/chatRooms';
import { markConversationAsRejoined } from '@/lib/conversationStorage';

const ChatRooms = () => {
  const navigate = useNavigate();
  const { joinedRooms, joinRoom, leaveRoom } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { value: 'all', label: 'All Rooms' },
    { value: 'philosophy', label: 'Philosophy' },
    { value: 'books', label: 'Books & Literature' },
    { value: 'science', label: 'Science & Tech' },
    { value: 'art', label: 'Arts & Culture' },
    { value: 'wellness', label: 'Wellness & Mind' },
    { value: 'languages', label: 'Language Learning' }
  ];



  // Filter out rooms that user has already joined
  const availableRooms = chatRooms.filter(room => !joinedRooms.includes(room.id));

  const filteredRooms = availableRooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || room.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinRoom = async (roomId: string) => {
    setJoiningRoom(roomId);
    
    // Simulate join delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Join room in app context
    joinRoom(roomId);
    
    // Mark conversation as rejoined (clears left state)
    const conversationId = `joined-${roomId}`;
    markConversationAsRejoined(conversationId);
    
    setJoiningRoom(null);
    
    // Joined room - toast removed per user request
    
    // Navigate directly to the chat room with source parameter
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from') || 'community';
    navigate(`/chat-room/${roomId}?from=chat-rooms`);
  };



  return (
    <div className="min-h-screen app-gradient-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-24 right-12 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-32 left-8 w-20 h-20 bg-gradient-secondary rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-6 w-16 h-16 bg-gradient-accent rounded-full blur-lg animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <TopBar 
        title="Chat Rooms" 
        showBack={true}
        onBack={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const from = urlParams.get('from');
          if (from === 'community') {
            navigate('/community');
          } else {
            navigate(-1);
          }
        }}
      />
      
              <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10 content-safe-top pb-24">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <h1 className="text-display-2 font-bold gradient-text-hero mb-2">Discover Conversations</h1>
          <p className="text-body-small text-muted-foreground">Join meaningful discussions with like-minded people</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative glass rounded-2xl p-1 shadow-medium animate-breathe-slow">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
            <Input
              id="roomSearch"
              name="roomSearch"
              placeholder="Search rooms by topic, interest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              className="pl-12 border-0 bg-transparent shadow-none focus:ring-0 h-12"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1 glass border-border-soft transition-smooth h-12 rounded-xl shadow-soft animate-breathe-slow">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-border-soft shadow-large">
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value} className="hover:bg-primary/10 transition-smooth">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="gradient"
              size="icon-lg"
              onClick={() => setShowCreateModal(true)}
              className="shadow-glow-primary animate-breathe-slow active:scale-[0.98]"
            >
              <Plus size={22} />
            </Button>
          </div>
        </div>

        {/* Joined Rooms - Hidden as they should appear in ChatInbox instead */}

        {/* Available Room List */}
        <div className="space-y-4">
          {loading ? (
            <>
              <h3 className="text-heading-2 font-semibold gradient-text-primary animate-fade-in">Available Rooms</h3>
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card className="shadow-medium">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-2xl"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-muted rounded-lg w-3/4"></div>
                          <div className="h-3 bg-muted rounded-lg w-full"></div>
                          <div className="flex gap-2">
                            <div className="h-6 bg-muted rounded-full w-16"></div>
                            <div className="h-6 bg-muted rounded-full w-20"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </>
          ) : (
            <>
              {filteredRooms.length > 0 && (
                <h3 className="text-heading-2 font-semibold gradient-text-primary animate-fade-in">Available Rooms</h3>
              )}
              {filteredRooms.map((room, index) => (
            <Card 
              key={room.id} 
              className="shadow-large animate-breathe-slow animate-slide-up animate-fade-in active:scale-[0.98] overflow-hidden"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-primary/10 grid place-items-center shadow-inner-soft animate-float-ambient">
                    <span className="text-2xl">{room.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-heading-2 font-semibold break-words">{room.title}</h3>
                      {room.isPrivate ? (
                        <Lock size={16} className="text-muted-foreground" />
                      ) : (
                        <Globe size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    
                    <p className="text-body-small text-muted-foreground mb-4 leading-relaxed">
                      {room.description}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex items-center gap-4 text-caption text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Users size={14} />
                          <span className="font-medium">{room.members}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-success rounded-full animate-pulse-soft"></div>
                          <span className="font-medium">{room.activeNow} active</span>
                        </span>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        {room.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="glass" size="sm" className="w-fit">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Join Button */}
                <div className="pt-4 border-t border-border-soft">
                  <Button 
                    onClick={() => handleJoinRoom(room.id)}
                    className="w-full shadow-glow-primary/40 shadow-medium active:scale-[0.98]"
                    size="lg"
                    variant="gradient"
                    disabled={joiningRoom === room.id}
                  >
                    <LogIn size={18} className="mr-2" />
                    {joiningRoom === room.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Joining...
                      </>
                    ) : (
                      'Join Conversation'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
            </>
          )}
        </div>

        {filteredRooms.length === 0 && availableRooms.length > 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-muted-foreground">
              No rooms found matching your search
            </p>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(true)}
              className="mt-3"
            >
              Create a new room
            </Button>
          </div>
        )}

        {availableRooms.length === 0 && joinedRooms.length > 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-muted-foreground">
              You've joined all available rooms!
            </p>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(true)}
              className="mt-3"
            >
              Create a new room
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
      
      <CreateRoomModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default ChatRooms;
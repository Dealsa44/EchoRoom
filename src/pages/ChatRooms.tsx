import { useState } from 'react';
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

import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { chatRooms } from '@/data/chatRooms';

const ChatRooms = () => {
  const navigate = useNavigate();
  const { joinedRooms, joinRoom, leaveRoom } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId);
    
    toast({
      title: "Joined room!",
      description: "You can now access this room from your messages.",
    });
    
    // Auto-navigate to the joined room
    navigate(`/chat-room/${roomId}`);
  };



  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Chat Rooms" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="roomSearch"
              name="roomSearch"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="cozy"
              onClick={() => setShowCreateModal(true)}
              className="px-3"
            >
              <Plus size={20} />
            </Button>
          </div>
        </div>

        {/* Joined Rooms - Hidden as they should appear in ChatInbox instead */}

        {/* Available Room List */}
        <div className="space-y-3">
          {filteredRooms.length > 0 && (
            <h3 className="text-sm font-medium text-muted-foreground">Available Rooms</h3>
          )}
          {filteredRooms.map((room) => (
            <Card 
              key={room.id} 
              className="transition-all hover:shadow-medium hover:scale-[1.02]"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{room.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{room.title}</h3>
                      {room.isPrivate ? (
                        <Lock size={14} className="text-muted-foreground" />
                      ) : (
                        <Globe size={14} className="text-muted-foreground" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {room.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {room.members}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {room.activeNow} active
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        {room.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Join Button */}
                <div className="mt-3 pt-3 border-t border-border">
                  <Button 
                    onClick={() => handleJoinRoom(room.id)}
                    className="w-full"
                    size="sm"
                  >
                    <LogIn size={16} className="mr-2" />
                    Join Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
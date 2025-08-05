import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Users, Lock, Globe } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import CreateRoomModal from '@/components/modals/CreateRoomModal';

const ChatRooms = () => {
  const navigate = useNavigate();
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

  const chatRooms = [
    {
      id: 1,
      title: 'Philosophy Corner',
      category: 'philosophy',
      members: 127,
      description: 'Deep discussions about life, existence, and meaning',
      isPrivate: false,
      activeNow: 8,
      tags: ['Deep', 'Thoughtful'],
      icon: '🤔'
    },
    {
      id: 2,
      title: 'Book Lovers United',
      category: 'books',
      members: 243,
      description: 'Share your latest reads and discover new stories',
      isPrivate: false,
      activeNow: 15,
      tags: ['Fiction', 'Reviews'],
      icon: '📚'
    },
    {
      id: 3,
      title: 'Mindful Meditation',
      category: 'wellness',
      members: 89,
      description: 'Guided meditation sessions and mindfulness tips',
      isPrivate: false,
      activeNow: 5,
      tags: ['Calm', 'Healing'],
      icon: '🧘'
    },
    {
      id: 4,
      title: 'Creative Writing Circle',
      category: 'art',
      members: 156,
      description: 'Share your stories, poems, and get gentle feedback',
      isPrivate: false,
      activeNow: 12,
      tags: ['Creative', 'Supportive'],
      icon: '✍️'
    },
    {
      id: 5,
      title: 'Language Exchange',
      category: 'languages',
      members: 201,
      description: 'Practice English, Georgian, and other languages',
      isPrivate: false,
      activeNow: 23,
      tags: ['Learning', 'Practice'],
      icon: '🌍'
    },
    {
      id: 6,
      title: 'Safe Space Support',
      category: 'wellness',
      members: 67,
      description: 'Mental health support and understanding',
      isPrivate: true,
      activeNow: 3,
      tags: ['Support', 'Private'],
      icon: '💜'
    }
  ];

  const filteredRooms = chatRooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || room.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Chat Rooms" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
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

        {/* Room List */}
        <div className="space-y-3">
          {filteredRooms.map((room) => (
            <Card 
              key={room.id} 
              className="cursor-pointer transition-all hover:shadow-medium hover:scale-[1.02]"
              onClick={() => navigate(`/chat-room/${room.id}`)}
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
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-muted-foreground">No rooms found matching your search</p>
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
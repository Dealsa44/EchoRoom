import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Compass, Bot, Users, MessageCircle } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/contexts/AppContext';
import AIAssistantModal from '@/components/modals/AIAssistantModal';

const Home = () => {
  const navigate = useNavigate();
  const { user, safeMode } = useApp();
  const [showAIModal, setShowAIModal] = useState(false);

  const featuredRooms = [
    {
      id: 1,
      title: 'Philosophy Corner',
      icon: Brain,
      members: 127,
      description: 'Deep discussions about life, existence, and meaning',
      color: 'bg-safe-deep'
    },
    {
      id: 2,
      title: 'Book Lovers',
      icon: BookOpen,
      members: 243,
      description: 'Share your latest reads and discover new stories',
      color: 'bg-safe-light'
    },
    {
      id: 3,
      title: 'Mindful Moments',
      icon: Compass,
      members: 89,
      description: 'Meditation, mindfulness, and inner peace',
      color: 'bg-safe-learning'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getSafeModeColor = () => {
    switch (safeMode) {
      case 'light': return 'bg-safe-light';
      case 'deep': return 'bg-safe-deep';
      case 'learning': return 'bg-safe-learning';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="EchoRoom" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Welcome Section */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {getGreeting()}, {user?.username || 'Explorer'}! 
                </h2>
                <p className="text-muted-foreground text-sm">
                  Ready for some meaningful conversations?
                </p>
              </div>
              <div className="text-3xl">{user?.avatar || '🌟'}</div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getSafeModeColor()}>
                {safeMode} mode
              </Badge>
              {user?.interests.slice(0, 2).map(interest => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="hero"
            className="h-20 flex-col gap-2"
            onClick={() => navigate('/chat-rooms')}
          >
            <MessageCircle size={24} />
            <span className="text-sm">Join Rooms</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => setShowAIModal(true)}
          >
            <Bot size={24} />
            <span className="text-sm">AI Assistant</span>
          </Button>
        </div>

        {/* Featured Chat Rooms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Featured Rooms</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/chat-rooms')}
            >
              See all
            </Button>
          </div>
          
          <div className="space-y-3">
            {featuredRooms.map((room) => (
              <Card 
                key={room.id} 
                className="cursor-pointer transition-all hover:shadow-medium hover:scale-[1.02]"
                onClick={() => navigate(`/chat-room/${room.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${room.color}`}>
                      <room.icon size={20} className="text-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{room.title}</h4>
                      <p className="text-sm text-muted-foreground">{room.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Users size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{room.members} members</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Daily Inspiration */}
        <Card className="shadow-soft bg-gradient-primary text-primary-foreground">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Daily Reflection</h3>
            <p className="text-sm opacity-90">
              "In the depth of winter, I finally learned that within me there lay an invincible summer." - Albert Camus
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
      
      <AIAssistantModal 
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </div>
  );
};

export default Home;
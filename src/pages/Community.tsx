import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Brain, MessageCircle, Globe, Lock, Star, BookOpen, Lightbulb } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/contexts/AppContext';
import { chatRooms } from '@/data/chatRooms';

const Community = () => {
  const navigate = useNavigate();
  const { user, joinedRooms } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const communityStats = {
    activeRooms: chatRooms.length,
    activeUsers: 1247,
    totalDiscussions: 89,
    newToday: 12
  };

  const joinedRoomsCount = joinedRooms.length;

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 right-8 w-20 h-20 bg-gradient-primary rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-40 left-6 w-16 h-16 bg-gradient-secondary rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      <TopBar title="Community" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10">
        {/* Welcome Section */}
        <Card className={`shadow-medium hover:shadow-large transition-smooth interactive-scale ${
          isLoaded ? 'opacity-100 translate-y-0 animate-scale-in' : 'opacity-0 translate-y-4'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`transition-smooth delay-200 ${
                isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}>
                <h2 className="text-heading-2 font-semibold gradient-text-primary">
                  {getGreeting()}, {user?.username || 'Explorer'}! 
                </h2>
                <p className="text-body-small text-muted-foreground leading-relaxed mt-1">
                  Discover meaningful conversations and connect with like-minded people
                </p>
              </div>
              <div className={`text-4xl transition-spring delay-300 animate-pulse-soft hover:scale-110 cursor-pointer ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}>
                🌟
              </div>
            </div>
            
            <div className={`flex items-center gap-2 flex-wrap transition-smooth delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              <Badge variant="gradient" size="lg" className="bg-primary/20 hover:scale-110 transition-spring shadow-glow-primary/30">
                {joinedRoomsCount} rooms joined
              </Badge>
              <Badge variant="glass" size="default" className="hover:scale-105 transition-spring">
                {communityStats.activeUsers} active
              </Badge>
              <Badge variant="glass" size="default" className="hover:scale-105 transition-spring">
                {communityStats.newToday} new today
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Navigation Cards */}
        <div className={`space-y-4 transition-smooth delay-300 ${
          isLoaded ? 'opacity-100 translate-y-0 animate-slide-up' : 'opacity-0 translate-y-6'
        }`}>
          
          {/* Chat Rooms Card */}
          <Card className="group cursor-pointer shadow-medium hover:shadow-large transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-primary/20 overflow-hidden"
                onClick={() => navigate('/chat-rooms?from=community')}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-smooth"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl group-hover:scale-110 transition-spring">
                    <MessageCircle size={28} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-heading-2 font-semibold group-hover:text-primary transition-smooth">Chat Rooms</h3>
                      <Badge variant="glass" size="sm" className="bg-blue-500/20 text-blue-700">
                        {communityStats.activeRooms} active
                      </Badge>
                    </div>
                    <p className="text-body-small text-muted-foreground mb-3 leading-relaxed">
                      Join topic-based conversations, practice languages, and connect with people who share your interests. 
                      Real-time discussions in a safe, moderated environment.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe size={12} />
                      <span>Live conversations</span>
                      <span>•</span>
                      <Lock size={12} />
                      <span>Safe & moderated</span>
                      <span>•</span>
                      <Users size={12} />
                      <span>Community-driven</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forum Card */}
          <Card className="group cursor-pointer shadow-medium hover:shadow-large transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-green-500/20 overflow-hidden"
                onClick={() => navigate('/forum?from=community')}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-smooth"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl group-hover:scale-110 transition-spring">
                    <Brain size={28} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-heading-2 font-semibold group-hover:text-primary transition-smooth">Forum</h3>
                      <Badge variant="glass" size="sm" className="bg-green-500/20 text-green-700">
                        {communityStats.totalDiscussions} discussions
                      </Badge>
                    </div>
                    <p className="text-body-small text-muted-foreground mb-3 leading-relaxed">
                      Explore deep discussions, share knowledge, and engage in thoughtful conversations. 
                      From philosophy to technology, find your intellectual community.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen size={12} />
                      <span>Deep discussions</span>
                      <span>•</span>
                      <Lightbulb size={12} />
                      <span>Knowledge sharing</span>
                      <span>•</span>
                      <Star size={12} />
                      <span>Quality content</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Community; 
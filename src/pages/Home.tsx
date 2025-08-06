import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Sparkles, Heart, Users2, TrendingUp, Star, Zap } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/contexts/AppContext';


const Home = () => {
  const navigate = useNavigate();
  const { user, safeMode } = useApp();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 right-8 w-20 h-20 bg-gradient-primary rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-40 left-6 w-16 h-16 bg-gradient-secondary rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      <TopBar title="EchoRoom" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10">
        {/* Welcome Section */}
        <Card className={`shadow-medium hover:shadow-large transition-smooth interactive-scale ${
          isLoaded ? 'opacity-100 translate-y-0 animate-scale-in' : 'opacity-0 translate-y-4'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className={`transition-smooth delay-200 ${
                isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}>
                <h2 className="text-heading-2 font-semibold gradient-text-primary">
                  {getGreeting()}, {user?.username || 'Explorer'}! 
                </h2>
                <p className="text-body-small text-muted-foreground leading-relaxed mt-1">
                  Ready for some meaningful conversations?
                </p>
              </div>
              <div className={`text-4xl transition-spring delay-300 animate-pulse-soft hover:scale-110 cursor-pointer ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}>
                {user?.avatar || '🌟'}
              </div>
            </div>
            
            <div className={`flex items-center gap-2 flex-wrap transition-smooth delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              <Badge 
                variant="gradient" 
                size="lg"
                className={`${getSafeModeColor()} hover:scale-110 transition-spring shadow-glow-primary/30`}
              >
                {safeMode} mode
              </Badge>
              {user?.interests.slice(0, 2).map((interest, index) => (
                <Badge 
                  key={interest} 
                  variant="glass" 
                  size="default"
                  className={`hover:scale-105 transition-spring ${
                    isLoaded ? 'opacity-100 animate-slide-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className={`grid grid-cols-3 gap-4 transition-smooth delay-300 ${
          isLoaded ? 'opacity-100 translate-y-0 animate-slide-up' : 'opacity-0 translate-y-6'
        }`}>
          <Button
            variant="glass"
            className="h-24 flex-col gap-3 interactive-scale shadow-medium hover:shadow-glow-secondary/20 group relative overflow-hidden border-border-soft"
            onClick={() => navigate('/chat-rooms')}
          >
            <div className="absolute inset-0 bg-gradient-secondary/10 opacity-0 group-hover:opacity-100 transition-smooth"></div>
            <MessageCircle size={22} className="group-hover:rotate-12 group-hover:text-secondary transition-spring relative z-10" />
            <span className="text-caption relative z-10 group-hover:text-secondary transition-smooth font-medium">Join Rooms</span>
          </Button>
          
          <Button
            variant="glass"
            className="h-24 flex-col gap-3 interactive-scale shadow-medium hover:shadow-glow-accent/20 group relative overflow-hidden border-border-soft"
            onClick={() => navigate('/matches')}
          >
            <div className="absolute inset-0 bg-gradient-accent/10 opacity-0 group-hover:opacity-100 transition-smooth"></div>
            <Heart size={22} className="group-hover:animate-pulse group-hover:text-accent transition-spring relative z-10" />
            <span className="text-caption relative z-10 group-hover:text-accent transition-smooth font-medium">Find Match</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth">
              <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-accent/60 rounded-full animate-ping"></div>
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-accent/40 rounded-full animate-ping delay-200"></div>
            </div>
          </Button>

          <Button
            variant="glass"
            className="h-24 flex-col gap-3 interactive-scale shadow-medium hover:shadow-glow-tertiary/20 group relative overflow-hidden border-border-soft"
            onClick={() => navigate('/forum')}
          >
            <div className="absolute inset-0 bg-gradient-tertiary/10 opacity-0 group-hover:opacity-100 transition-smooth"></div>
            <Users2 size={22} className="group-hover:animate-bounce group-hover:text-tertiary transition-spring relative z-10" />
            <span className="text-caption relative z-10 group-hover:text-tertiary transition-smooth font-medium">Forum</span>
            <Sparkles size={12} className="absolute top-3 right-3 text-tertiary/60 opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-spring" />
          </Button>
        </div>

        {/* Daily Inspiration */}
        <Card className={`shadow-glow bg-gradient-hero text-foreground relative overflow-hidden group hover:shadow-large transition-spring interactive-scale ${
          isLoaded ? 'opacity-100 translate-y-0 animate-scale-in' : 'opacity-0 translate-y-8'
        }`} style={{ animationDelay: '0.5s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
          <div className="absolute bottom-4 right-4 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping delay-500"></div>
          <CardContent className="p-8 text-center relative z-10">
            <div className={`transition-spring delay-700 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <h3 className="text-heading-2 font-semibold mb-4 flex items-center justify-center gap-3">
                <Sparkles size={18} className="animate-pulse text-primary-glow" />
                <span className="gradient-text-primary">Daily Reflection</span>
                <Sparkles size={18} className="animate-pulse text-primary-glow" />
              </h3>
              <p className="text-body leading-relaxed opacity-90 italic">
                "In the depth of winter, I finally learned that within me there lay an invincible summer." 
              </p>
              <p className="text-body-small mt-2 opacity-70 font-medium">
                — Albert Camus
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-600 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <Card className="shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp size={20} className="text-green-500" />
                <span className="font-semibold">Active Now</span>
              </div>
              <p className="text-2xl font-bold text-primary">1,247</p>
              <p className="text-xs text-muted-foreground">Users online</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star size={20} className="text-yellow-500" />
                <span className="font-semibold">Your Streak</span>
              </div>
              <p className="text-2xl font-bold text-primary">7</p>
              <p className="text-xs text-muted-foreground">Days active</p>
            </CardContent>
          </Card>
        </div>



        {/* Energy Boost */}
        <Card className={`shadow-soft bg-gradient-to-r from-orange-400/10 to-yellow-400/10 border-orange-200 transition-all duration-700 delay-800 hover:shadow-lg hover:scale-[1.02] ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <CardContent className="p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap size={20} className="text-orange-500 animate-pulse" />
              <h3 className="font-semibold text-orange-700">Daily Challenge</h3>
            </div>
            <p className="text-sm text-orange-600 mb-3">
              Start a meaningful conversation in a new chat room today!
            </p>
            <Button 
              size="sm" 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate('/chat-rooms')}
            >
              Accept Challenge
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;
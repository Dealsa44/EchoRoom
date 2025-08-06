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
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="EchoRoom" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Welcome Section */}
        <Card className={`shadow-soft transition-all duration-700 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`transition-all duration-500 delay-200 ${
                isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}>
                <h2 className="text-lg font-semibold">
                  {getGreeting()}, {user?.username || 'Explorer'}! 
                </h2>
                <p className="text-muted-foreground text-sm">
                  Ready for some meaningful conversations?
                </p>
              </div>
              <div className={`text-3xl transition-all duration-500 delay-300 ${
                isLoaded ? 'opacity-100 scale-100 animate-pulse' : 'opacity-0 scale-75'
              }`}>
                {user?.avatar || '🌟'}
              </div>
            </div>
            
            <div className={`flex items-center gap-2 transition-all duration-500 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              <Badge className={`${getSafeModeColor()} hover:scale-105 transition-transform duration-200`}>
                {safeMode} mode
              </Badge>
              {user?.interests.slice(0, 2).map((interest, index) => (
                <Badge 
                  key={interest} 
                  variant="outline" 
                  className={`text-xs hover:scale-105 transition-all duration-200 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className={`grid grid-cols-3 gap-3 transition-all duration-700 delay-300 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:scale-105 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
            onClick={() => navigate('/chat-rooms')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <MessageCircle size={20} className="group-hover:rotate-12 group-hover:text-blue-600 transition-all duration-300 relative z-10" />
            <span className="text-xs relative z-10 group-hover:text-blue-600 transition-colors duration-300">Join Rooms</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:scale-105 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
            onClick={() => navigate('/matches')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/15 to-pink-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Heart size={20} className="group-hover:animate-pulse group-hover:text-rose-600 transition-all duration-300 relative z-10" />
            <span className="text-xs relative z-10 group-hover:text-rose-600 transition-colors duration-300">Find Match</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-2 left-2 w-1 h-1 bg-rose-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-3 right-3 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-200"></div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2 hover:scale-105 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
            onClick={() => navigate('/forum')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/15 to-green-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Users2 size={20} className="group-hover:animate-bounce group-hover:text-emerald-600 transition-all duration-300 relative z-10" />
            <span className="text-xs relative z-10 group-hover:text-emerald-600 transition-colors duration-300">Forum</span>
            <Sparkles size={10} className="absolute top-2 right-2 text-emerald-600 opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-all duration-300" />
          </Button>
        </div>

        {/* Daily Inspiration */}
        <Card className={`shadow-soft bg-gradient-primary text-primary-foreground relative overflow-hidden group hover:shadow-xl transition-all duration-700 delay-500 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardContent className="p-6 text-center relative z-10">
            <div className={`transition-all duration-500 delay-700 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
                <Sparkles size={16} className="animate-pulse" />
                Daily Reflection
                <Sparkles size={16} className="animate-pulse" />
              </h3>
              <p className="text-sm opacity-90">
                "In the depth of winter, I finally learned that within me there lay an invincible summer." - Albert Camus
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
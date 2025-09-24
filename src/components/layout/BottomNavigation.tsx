import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Heart, Brain, User, Mail, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Mail, label: 'Messages', path: '/chat-inbox' },
    { icon: Heart, label: 'Match', path: '/match' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/chat-inbox') {
      // Messages is active for chat-inbox, messages-settings, and related message pages
      return location.pathname === '/chat-inbox' || 
             location.pathname === '/messages-settings' ||
             location.pathname === '/archived-chats' ||
             location.pathname === '/call-history' ||
             location.pathname.startsWith('/private-chat/') ||
             location.pathname.startsWith('/chat-room/');
    }
    if (path === '/community') {
      // Community is active for community, chat-rooms, forum, events, and their sub-pages
      return location.pathname === '/community' || 
             location.pathname === '/chat-rooms' || 
             location.pathname === '/forum' ||
             location.pathname === '/events' ||
             location.pathname === '/create-event' ||
             location.pathname === '/my-events' ||
             location.pathname.startsWith('/forum/thread/') ||
             location.pathname.startsWith('/event/');
    }
    if (path === '/profile') {
      // Profile is active for own profile, profile-related settings, and all settings sub-pages, but not for other people's profiles
      return location.pathname === '/profile' || 
             location.pathname === '/profile/stats' ||
             location.pathname === '/profile/edit' ||
             location.pathname === '/settings' ||
             location.pathname === '/appearance-experience' ||
             location.pathname === '/safety-center' ||
             location.pathname === '/notifications-communication' ||
             location.pathname === '/device-data';
    }
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-border-soft/50 shadow-large z-30 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-3 max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-spring min-h-[64px] flex-1 group relative overflow-hidden",
              isActive(path) 
                ? "text-primary scale-105 bg-primary/15 shadow-glow-primary/20" 
                : "text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 hover:bg-muted/30"
            )}
          >
            {isActive(path) && (
              <div className="absolute inset-0 bg-gradient-primary/10 rounded-2xl animate-pulse-soft" />
            )}
            <Icon 
              size={22} 
              className={cn(
                "transition-spring relative z-10",
                isActive(path) 
                  ? "drop-shadow-sm" 
                  : "group-hover:scale-110"
              )} 
            />
            <span className={cn(
              "text-caption font-medium relative z-10 transition-smooth",
              isActive(path) ? "text-primary" : ""
            )}>
              {label}
            </span>
            {isActive(path) && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-ping" />
            )}
          </button>
        ))}
      </div>

    </div>
  );
};

export default BottomNavigation;
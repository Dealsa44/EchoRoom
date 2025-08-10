import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, Users, Bell, Check, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: number;
  type: 'match' | 'message' | 'forum' | 'system' | 'like';
  title: string;
  message: string;
  time: string;
  unread: boolean;
  actionUrl?: string;
  avatar?: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal = ({ isOpen, onClose }: NotificationModalProps) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'match',
      title: 'New Match! 💚',
      message: 'Luna liked your profile and you matched!',
      time: '2 min ago',
      unread: true,
      actionUrl: '/matches',
      avatar: '🌙'
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'Alex sent you a message about philosophy',
      time: '15 min ago',
      unread: true,
      actionUrl: '/private-chat/2',
      avatar: '📚'
    },
    {
      id: 3,
      type: 'like',
      title: 'Profile Like',
      message: 'Sage liked your profile',
      time: '45 min ago',
      unread: true,
      actionUrl: '/profile/3',
      avatar: '🌱'
    },
    {
      id: 4,
      type: 'forum',
      title: 'Forum Reply',
      message: 'Your post about mindfulness got a thoughtful reply',
      time: '1 hour ago',
      unread: false,
      actionUrl: '/forum/thread/1',
      avatar: '🧘'
    },
    {
      id: 5,
      type: 'system',
      title: 'Welcome to EchoRoom!',
      message: 'Complete your profile to get better matches',
      time: '2 days ago',
      unread: false,
      actionUrl: '/profile/edit',
      avatar: '🌟'
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match': return <Heart className="h-4 w-4 text-red-500" />;
      case 'message': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'like': return <Heart className="h-4 w-4 text-pink-500" />;
      case 'forum': return <Users className="h-4 w-4 text-green-500" />;
      case 'system': return <Bell className="h-4 w-4 text-orange-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, unread: false } : n
    ));

    // Navigate to action URL
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    // All notifications marked as read - toast removed per user request
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Notification deleted - toast removed per user request
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm mx-auto rounded-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Stay updated with your latest activity
              </DialogDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto scrollbar-hide">
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                    notification.unread ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center">
                        {notification.avatar && (
                          <span className="text-lg mr-2">{notification.avatar}</span>
                        )}
                        {getTypeIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-sm truncate pr-2">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {notification.unread && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                    
                    {/* Action buttons - show on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {notification.unread && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
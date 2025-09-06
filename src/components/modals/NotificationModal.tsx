import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, Users, Bell, Check, X, Trash2, Calendar, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: number;
  type: 'message' | 'event' | 'language' | 'community' | 'system' | 'forum';
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
  onUnreadCountChange?: (count: number) => void;
}

const NotificationModal = ({ isOpen, onClose, onUnreadCountChange }: NotificationModalProps) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'message',
      title: 'New Message in Philosophy Corner',
      message: 'Alex replied to your question about existentialism',
      time: '2 min ago',
      unread: true,
      actionUrl: '/chat-room/1',
      avatar: '🤔'
    },
    {
      id: 2,
      type: 'event',
      title: 'Event Reminder',
      message: 'Language Exchange Meetup starts in 30 minutes',
      time: '15 min ago',
      unread: true,
      actionUrl: '/event/3',
      avatar: '🌍'
    },
    {
      id: 3,
      type: 'language',
      title: 'Language Learning Progress',
      message: 'You completed 5 new vocabulary words in Georgian!',
      time: '1 hour ago',
      unread: true,
      actionUrl: '/profile/stats',
      avatar: '📚'
    },
    {
      id: 4,
      type: 'community',
      title: 'Community Update',
      message: 'New member joined the Book Lovers United room',
      time: '2 hours ago',
      unread: false,
      actionUrl: '/chat-room/2',
      avatar: '📖'
    },
    {
      id: 5,
      type: 'system',
      title: 'Welcome to EchoRoom!',
      message: 'Join your first chat room to start meaningful conversations',
      time: '1 day ago',
      unread: false,
      actionUrl: '/chat-rooms',
      avatar: '🌟'
    },
    {
      id: 6,
      type: 'event',
      title: 'Event Invitation',
      message: 'You\'re invited to the Creative Writing Workshop',
      time: '3 hours ago',
      unread: false,
      actionUrl: '/event/5',
      avatar: '✍️'
    },
  ]);

  // Update unread count when notifications change
  useEffect(() => {
    const unreadCount = notifications.filter(n => n.unread).length;
    onUnreadCountChange?.(unreadCount);
  }, [notifications, onUnreadCountChange]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'event': return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'language': return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'community': return <Users className="h-4 w-4 text-orange-500" />;
      case 'forum': return <Users className="h-4 w-4 text-green-500" />;
      case 'system': return <Bell className="h-4 w-4 text-yellow-500" />;
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
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
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
          </div>
          {unreadCount > 0 && (
            <div className="flex justify-start mt-2 -ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs px-2 hover:bg-primary/5 hover:text-primary bg-primary/5 text-primary border border-primary/20"
              >
                Mark all read
              </Button>
            </div>
          )}
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
                    <div className="flex-shrink-0 mt-1 relative">
                      <div className="flex items-center justify-center">
                        {notification.avatar && (
                          <span className="text-lg mr-2">{notification.avatar}</span>
                        )}
                        {getTypeIcon(notification.type)}
                      </div>
                      {notification.unread && (
                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1 pr-16">
                        <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                    
                    {/* Action buttons - always visible */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {notification.unread && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-primary/10 bg-transparent"
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
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationModal = ({ isOpen, onClose }: NotificationModalProps) => {
  const notifications = [
    {
      id: 1,
      type: 'match',
      title: 'New Match!',
      message: 'Alex shares your interest in Philosophy',
      time: '2 min ago',
      unread: true,
    },
    {
      id: 2,
      type: 'chat',
      title: 'Message in Books Room',
      message: 'Someone mentioned your favorite author',
      time: '15 min ago',
      unread: true,
    },
    {
      id: 3,
      type: 'forum',
      title: 'Forum Reply',
      message: 'Your post about mindfulness got a thoughtful reply',
      time: '1 hour ago',
      unread: false,
    },
  ];

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-safe-deep';
      case 'chat': return 'bg-safe-light';
      case 'forum': return 'bg-safe-learning';
      default: return 'bg-muted';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Notifications</DialogTitle>
          <DialogDescription>
            Stay updated with your latest matches, messages, and community activity.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                  notification.unread ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeBadgeColor(notification.type)} variant="secondary">
                      {notification.type}
                    </Badge>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
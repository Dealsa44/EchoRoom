import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { 
  getArchivedChatsCount, 
  getCallHistoryCount 
} from '@/lib/notificationStorage';
import { 
  Archive, 
  Phone, 
  Trash2, 
  MessageSquare,
  CheckCircle,
  Shield,
  Eye,
  Lock,
  Share
} from 'lucide-react';

const MessagesSettings: React.FC = () => {
  const navigate = useNavigate();
  const [archivedChatsCount, setArchivedChatsCount] = useState(0);
  const [callHistoryCount, setCallHistoryCount] = useState(0);

  // Load notification counts on component mount and when component becomes visible
  useEffect(() => {
    const updateCounts = () => {
      setArchivedChatsCount(getArchivedChatsCount());
      setCallHistoryCount(getCallHistoryCount());
    };
    
    updateCounts();
    
    // Listen for storage changes to update counts in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'driftzo_notification_counts') {
        updateCounts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Mock data for demonstration
  const archivedChats = [
    { id: 1, name: 'Sarah Johnson', lastMessage: 'Thanks for the great conversation!', timestamp: '2 days ago', unreadCount: 0 },
    { id: 2, name: 'Mike Chen', lastMessage: 'Let me know when you\'re free', timestamp: '1 week ago', unreadCount: 0 },
    { id: 3, name: 'Emma Wilson', lastMessage: 'Talk to you later!', timestamp: '2 weeks ago', unreadCount: 0 }
  ];

  const callHistory = [
    { id: 1, name: 'Alex Thompson', type: 'voice', duration: '5:32', timestamp: '1 hour ago', status: 'completed' },
    { id: 2, name: 'Lisa Park', type: 'video', duration: '12:45', timestamp: '3 hours ago', status: 'completed' },
    { id: 3, name: 'David Kim', type: 'voice', duration: '2:18', timestamp: '1 day ago', status: 'missed' }
  ];

  const handleBack = () => {
    navigate('/chat-inbox');
  };

  const handleArchivedChats = () => {
    navigate('/archived-chats');
  };

  const handleCallHistory = () => {
    navigate('/call-history');
  };



  const handleDeletedConversations = () => {
    // Mock functionality - would show deleted conversations
    console.log('Show deleted conversations');
  };

  const handleReadReceipts = () => {
    // Mock functionality - would open read receipts settings
    console.log('Open read receipts settings');
  };

  const handleTypingIndicators = () => {
    // Mock functionality - would open typing indicators settings
    console.log('Open typing indicators settings');
  };

  const handleMessageEncryption = () => {
    // Mock functionality - would open encryption settings
    console.log('Open message encryption settings');
  };

  const handleMessageForwarding = () => {
    // Mock functionality - would open forwarding settings
    console.log('Open message forwarding settings');
  };

  const handleMessageDeletion = () => {
    // Mock functionality - would open auto-deletion settings
    console.log('Open message deletion settings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <TopBar 
        title="Messages Settings" 
        showBack 
        onBack={handleBack}
        showNotifications={true}
        showDarkModeToggle={true}
        showAIAssistant={true}
      />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6 content-safe-top pb-24">

        {/* Conversation Management */}
        <Card className="border-border/50 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Conversation Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleArchivedChats}
              variant="outline" 
              className="w-full justify-start h-12"
            >
              <Archive size={18} className="mr-3 text-primary" />
              <div className="flex-1 text-left">
                <div className="font-medium">Archived Chats</div>
                <div className="text-sm text-muted-foreground">View archived conversations</div>
              </div>
              {archivedChatsCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {archivedChatsCount}
                </Badge>
              )}
            </Button>

            <Button 
              onClick={handleCallHistory}
              variant="outline" 
              className="w-full justify-start h-12"
            >
              <Phone size={18} className="mr-3 text-primary" />
              <div className="flex-1 text-left">
                <div className="font-medium">Call History</div>
                <div className="text-sm text-muted-foreground">View voice and video calls</div>
              </div>
              {callHistoryCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {callHistoryCount}
                </Badge>
              )}
            </Button>

            <Button 
              onClick={handleDeletedConversations}
              variant="outline" 
              className="w-full justify-start h-12"
            >
              <Trash2 size={18} className="mr-3 text-muted-foreground" />
              <div className="flex-1 text-left">
                <div className="font-medium">Deleted Conversations</div>
                <div className="text-sm text-muted-foreground">Recover deleted chats</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Message Privacy & Control */}
        <Card className="border-border/50 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Message Privacy & Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleReadReceipts}
              variant="outline" 
              className="w-full justify-start h-12"
            >
              <Eye size={18} className="mr-3 text-primary" />
              <div className="flex-1 text-left">
                <div className="font-medium">Read Receipts</div>
                <div className="text-sm text-muted-foreground">Control who can see when you've read messages</div>
              </div>
            </Button>

            <Button 
              onClick={handleTypingIndicators}
              variant="outline" 
              className="w-full justify-start h-12"
            >
              <MessageSquare size={18} className="mr-3 text-primary" />
              <div className="flex-1 text-left">
                <div className="font-medium">Typing Indicators</div>
                <div className="text-sm text-muted-foreground">Show/hide typing status</div>
              </div>
            </Button>

            <Button 
              onClick={handleMessageEncryption}
              variant="outline" 
              className="w-full justify-start h-12"
            >
              <Lock size={18} className="mr-3 text-primary" />
              <div className="flex-1 text-left">
                <div className="font-medium">Message Encryption</div>
                <div className="text-sm text-muted-foreground">End-to-end encryption settings</div>
              </div>
            </Button>

            <Button 
              onClick={handleMessageForwarding}
              variant="outline" 
              className="w-full justify-start h-12"
            >
              <Share size={18} className="mr-3 text-primary" />
              <div className="flex-1 text-left">
                <div className="font-medium">Message Forwarding</div>
                <div className="text-sm text-muted-foreground">Control who can forward your messages</div>
              </div>
            </Button>

            <Button 
              onClick={handleMessageDeletion}
              variant="outline" 
              className="w-full justify-start h-12"
            >
              <Trash2 size={18} className="mr-3 text-primary" />
              <div className="flex-1 text-left">
                <div className="font-medium">Message Deletion</div>
                <div className="text-sm text-muted-foreground">Auto-delete messages after X time</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-border/50 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle size={20} className="text-primary" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-primary/5 rounded-xl">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Active Chats</div>
              </div>
              <div className="text-center p-3 bg-primary/5 rounded-xl">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Archived</div>
              </div>
              <div className="text-center p-3 bg-primary/5 rounded-xl">
                <div className="text-2xl font-bold text-primary">8</div>
                <div className="text-sm text-muted-foreground">Calls Today</div>
              </div>
              <div className="text-center p-3 bg-primary/5 rounded-xl">
                <div className="text-2xl font-bold text-primary">24</div>
                <div className="text-sm text-muted-foreground">Total Calls</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default MessagesSettings;

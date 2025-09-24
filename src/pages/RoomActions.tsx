import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Shield, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  Pin, 
  Star, 
  Flag, 
  Crown, 
  Hash, 
  MessageCircle, 
  Eye, 
  EyeOff,
  Lock,
  Globe,
  UserPlus,
  UserMinus,
  BarChart3,
  Calendar,
  Clock,
  MapPin,
  Languages,
  Zap,
  Award,
  BookOpen,
  Target,
  HelpCircle,
  Heart,
  Smile,
  ThumbsUp,
  Edit3,
  Trash2,
  Reply,
  Image,
  Mic,
  File,
  Camera,
  Paperclip,
  CheckCircle,
  CheckCheck,
  Download,
  Play,
  Pause,
  Square,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { chatRooms } from '@/data/chatRooms';

const RoomActions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode, leaveRoom } = useApp();
  
  // Find the room data
  const roomData = chatRooms.find(room => room.id === id);
  
  if (!roomData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <Button onClick={() => navigate('/chat-rooms')}>
            Back to Chat Rooms
          </Button>
        </div>
      </div>
    );
  }

  const [isMuted, setIsMuted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  const handleLeaveRoom = () => {
    if (id) {
      leaveRoom(id);
    }
    navigate('/chat-rooms');
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handlePinToggle = () => {
    setIsPinned(!isPinned);
  };

  const handleStarToggle = () => {
    setIsStarred(!isStarred);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border shadow-soft safe-top">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto w-full min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const state = location.state as { originalFrom?: string } | null;
                navigate(`/chat-room/${id}`, { replace: true, state: { from: state?.originalFrom || 'chat-rooms' } });
              }}
              className="flex-shrink-0 bg-transparent hover:bg-transparent active:bg-transparent"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold truncate">Room Actions</h1>
              <p className="text-xs text-muted-foreground truncate">{roomData.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="bg-transparent hover:scale-110 transition-spring hover:bg-transparent active:bg-transparent"
            >
              {isDarkMode ? 
                <Sun size={20} className="text-warning hover:text-warning transition-smooth" /> : 
                <Moon size={20} className="text-secondary hover:text-secondary transition-smooth" />
              }
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 content-safe-top overflow-y-auto h-full">
        
        {/* Room Info Header */}
        <Card className="relative overflow-hidden animate-breathe">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/12 blur-2xl animate-float-ambient" aria-hidden />
          <CardContent className="p-6 text-center">
            <div className="relative flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-card-hover border-2 border-border flex items-center justify-center shadow-inner-soft">
                <div className="text-3xl">{roomData.icon}</div>
              </div>
              {roomData.isActive && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </div>
            <h2 className="text-xl font-bold mb-1">{roomData.title}</h2>
            <p className="text-sm text-muted-foreground mb-2">{roomData.description}</p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>{roomData.memberCount} members</span>
              <span>•</span>
              <span className={roomData.isActive ? "text-green-500" : "text-muted-foreground"}>
                {roomData.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex-col h-auto py-4"
                onClick={handleMuteToggle}
              >
                {isMuted ? <VolumeX size={20} className="mb-2" /> : <Volume2 size={20} className="mb-2" />}
                <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-col h-auto py-4"
                onClick={handlePinToggle}
              >
                <Pin size={20} className="mb-2" />
                <span className="text-sm">{isPinned ? 'Unpin' : 'Pin'}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-col h-auto py-4"
                onClick={handleStarToggle}
              >
                <Star size={20} className="mb-2" />
                <span className="text-sm">{isStarred ? 'Unstar' : 'Star'}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-col h-auto py-4"
                onClick={() => navigate(`/chat-room/${id}/members`)}
              >
                <Users size={20} className="mb-2" />
                <span className="text-sm">Members</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Room Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications from this room</p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mute">Mute Room</Label>
                <p className="text-sm text-muted-foreground">Hide notifications from this room</p>
              </div>
              <Switch
                id="mute"
                checked={isMuted}
                onCheckedChange={setIsMuted}
              />
            </div>
          </CardContent>
        </Card>

        {/* Room Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{roomData.memberCount}</div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{roomData.messageCount || 0}</div>
                <div className="text-sm text-muted-foreground">Messages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate(`/chat-room/${id}/settings`)}
            >
              <Settings size={16} className="mr-2" />
              Room Settings
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate(`/chat-room/${id}/members`)}
            >
              <Users size={16} className="mr-2" />
              Manage Members
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate(`/chat-room/${id}/moderation`)}
            >
              <Shield size={16} className="mr-2" />
              Moderation Tools
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLeaveRoom}
            >
              <ArrowLeft size={16} className="mr-2" />
              Leave Room
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoomActions;

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Video, 
  MessageCircle, 
  Heart, 
  Star, 
  Share2, 
  Flag, 
  UserX, 
  Volume2, 
  VolumeX, 
  Pin, 
  Archive, 
  MoreVertical,
  Settings,
  Camera,
  Mic,
  File,
  Download,
  Edit3,
  Trash2,
  Shield,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  HelpCircle,
  Info,
  Zap,
  Bot,
  BarChart3,
  Palette
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/hooks/useApp';
import CompatibilityDashboard from '@/components/ai/CompatibilityDashboard';
import MoodThemeSelector from '@/components/ai/MoodThemeSelector';

const UserProfileActions = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useApp();
  
  // Mock user data - in real app this would come from API
  const getUserById = (id: string) => {
    const users = {
      '1': { 
        name: 'Luna', 
        avatar: '🌙', 
        status: 'online', 
        languageLearning: 'English',
        isOnline: true,
        lastSeen: 'Online now',
        bio: 'Philosophy enthusiast and language learner',
        location: 'New York, NY',
        age: 25
      },
      '2': { 
        name: 'Alex', 
        avatar: '📚', 
        status: 'online', 
        languageLearning: 'Japanese',
        isOnline: true,
        lastSeen: 'Online now',
        bio: 'Book lover and creative writer',
        location: 'Tokyo, Japan',
        age: 28
      },
      '3': { 
        name: 'Sage', 
        avatar: '🌱', 
        status: 'online', 
        languageLearning: 'Spanish',
        isOnline: true,
        lastSeen: 'Online now',
        bio: 'Mindfulness practitioner and nature lover',
        location: 'Barcelona, Spain',
        age: 26
      },
      '4': { 
        name: 'Maya', 
        avatar: '🎨', 
        status: 'away', 
        languageLearning: 'Italian',
        isOnline: false,
        lastSeen: '1 hour ago',
        bio: 'Artist and cultural explorer',
        location: 'Florence, Italy',
        age: 24
      },
      '5': { 
        name: 'Kai', 
        avatar: '🏃', 
        status: 'away', 
        languageLearning: 'English',
        isOnline: false,
        lastSeen: '2 hours ago',
        bio: 'Fitness enthusiast and adventure seeker',
        location: 'Vancouver, Canada',
        age: 29
      }
    };
    return users[id as keyof typeof users] || users['1'];
  };

  const userInfo = getUserById(userId || '1');
  
  
  // State for various settings
  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true);
  const [typingIndicatorsEnabled, setTypingIndicatorsEnabled] = useState(true);
  
  // State for toggle functionality
  const [showReportForm, setShowReportForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  
  // State for modals
  const [showCompatibilityDashboard, setShowCompatibilityDashboard] = useState(false);
  const [showMoodThemeSelector, setShowMoodThemeSelector] = useState(false);
  const [currentMoodTheme, setCurrentMoodTheme] = useState('default');

  const handleCall = (type: 'audio' | 'video') => {
    if (type === 'audio') {
      // Navigate to audio call
      navigate(`/call/audio/${userId}`);
    } else {
      // Navigate to video call
      navigate(`/call/video/${userId}`);
    }
  };

  const handleMessage = () => {
    // Navigate back to private chat
    navigate(`/private-chat/${userId}`);
  };

  const handleViewProfile = () => {
    navigate(`/profile/${userId}`);
  };

  const handleLike = () => {
    // Profile liked - no notification
  };

  const handleSuperLike = () => {
    // Super like sent - no notification
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${userInfo.name}'s Profile`,
        text: `Check out ${userInfo.name}'s profile on EchoRoom`,
        url: window.location.origin + `/profile/${userId}`
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.origin + `/profile/${userId}`);
    }
  };

  const handleReport = () => {
    setShowReportForm(!showReportForm);
    setShowBlockForm(false); // Close block form if open
  };

  const handleBlock = () => {
    setShowBlockForm(!showBlockForm);
    setShowReportForm(false); // Close report form if open
  };

  const handleSubmitReport = () => {
    if (!reportReason) {
      return;
    }
    
    // Simulate API call
    console.log('Reporting user:', { userId, reason: reportReason, details: reportDetails });
    
    setShowReportForm(false);
    setReportReason('');
    setReportDetails('');
  };

  const handleSubmitBlock = () => {
    if (!blockReason) {
      return;
    }
    
    // Simulate API call
    console.log('Blocking user:', { userId, reason: blockReason });
    
    setIsBlocked(true);
    setShowBlockForm(false);
    setBlockReason('');
  };

  const handleUnblock = () => {
    setIsBlocked(false);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handlePin = () => {
    setIsPinned(!isPinned);
  };

  const handleArchive = () => {
    setIsArchived(!isArchived);
  };

  const handleUnmatch = () => {
    // Navigate back to messages
    navigate('/chat-inbox');
  };

  const handleCompatibilityDashboard = () => {
    setShowCompatibilityDashboard(true);
  };

  const handleMoodThemeSelector = () => {
    setShowMoodThemeSelector(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar 
        title="User Actions" 
        showBack={true}
        onBack={() => navigate(`/private-chat/${userId}`)}
      />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 content-safe-top content-safe-bottom overflow-y-auto h-full">
        
        {/* User Info Header */}
        <Card className="relative overflow-hidden animate-breathe">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/12 blur-2xl animate-float-ambient" aria-hidden />
          <CardContent className="p-6 text-center">
            <div className="relative flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-card-hover border-2 border-border flex items-center justify-center shadow-inner-soft">
                <div className="text-3xl">{userInfo.avatar}</div>
              </div>
              {userInfo.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </div>
            <h2 className="text-xl font-bold mb-1">{userInfo.name}</h2>
            <p className="text-sm text-muted-foreground mb-2">{userInfo.bio}</p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>{userInfo.location}</span>
              <span>•</span>
              <span>{userInfo.age} years old</span>
              <span>•</span>
              <span className={userInfo.isOnline ? "text-green-500" : "text-muted-foreground"}>
                {userInfo.lastSeen}
              </span>
            </div>
          </CardContent>
        </Card>


        {/* AI & Analysis Tools */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-500" />
              AI & Analysis Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleCompatibilityDashboard}
              className="w-full h-12 flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Compatibility Analysis</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleMoodThemeSelector}
              className="w-full h-12 flex items-center gap-2 text-pink-600 border-pink-200 hover:bg-pink-50"
            >
              <Palette className="w-5 h-5" />
              <span>Mood Themes</span>
            </Button>
          </CardContent>
        </Card>

        {/* Dating Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Dating Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleLike}
                className="h-12 flex-col gap-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                <Heart className="w-5 h-5" />
                <span className="text-xs">Like</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSuperLike}
                className="h-12 flex-col gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Star className="w-5 h-5" />
                <span className="text-xs">Super Like</span>
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleShare}
              className="w-full h-12 flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Profile</span>
            </Button>
          </CardContent>
        </Card>

        {/* Conversation Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Conversation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMuted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-primary" />}
                <div>
                  <Label className="text-sm font-medium">Mute Notifications</Label>
                  <p className="text-xs text-muted-foreground">Stop receiving notifications</p>
                </div>
              </div>
              <Switch 
                checked={isMuted} 
                onCheckedChange={handleMute}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Pin className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Pin Conversation</Label>
                  <p className="text-xs text-muted-foreground">Keep at top of messages</p>
                </div>
              </div>
              <Switch 
                checked={isPinned} 
                onCheckedChange={handlePin}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Archive className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Archive Conversation</Label>
                  <p className="text-xs text-muted-foreground">Hide from main messages</p>
                </div>
              </div>
              <Switch 
                checked={isArchived} 
                onCheckedChange={handleArchive}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Safety */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              Privacy & Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleReport}
              className="w-full h-12 flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Flag className="w-5 h-5" />
              <span>Report User</span>
            </Button>
            
            {/* Report Form */}
            {showReportForm && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="report-reason" className="text-sm font-medium">Reason for reporting</Label>
                    <Select value={reportReason} onValueChange={setReportReason}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inappropriate-behavior">Inappropriate behavior</SelectItem>
                        <SelectItem value="harassment">Harassment or bullying</SelectItem>
                        <SelectItem value="spam">Spam or fake profile</SelectItem>
                        <SelectItem value="inappropriate-content">Inappropriate content</SelectItem>
                        <SelectItem value="safety-concerns">Safety concerns</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-details" className="text-sm font-medium">Additional details (optional)</Label>
                    <Textarea
                      id="report-details"
                      placeholder="Please provide more details about your report..."
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitReport}
                      className="flex-1"
                      disabled={!reportReason}
                    >
                      Submit Report
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowReportForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Button 
              variant="outline" 
              onClick={isBlocked ? handleUnblock : handleBlock}
              className="w-full h-12 flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              {isBlocked ? <Unlock className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
              <span>{isBlocked ? 'Unblock User' : 'Block User'}</span>
            </Button>
            
            {/* Block Form */}
            {showBlockForm && !isBlocked && (
              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="block-reason" className="text-sm font-medium">Reason for blocking</Label>
                    <Select value={blockReason} onValueChange={setBlockReason}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inappropriate-behavior">Inappropriate behavior</SelectItem>
                        <SelectItem value="harassment">Harassment or bullying</SelectItem>
                        <SelectItem value="spam">Spam or fake profile</SelectItem>
                        <SelectItem value="inappropriate-content">Inappropriate content</SelectItem>
                        <SelectItem value="safety-concerns">Safety concerns</SelectItem>
                        <SelectItem value="not-interested">Not interested</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitBlock}
                      variant="destructive"
                      className="flex-1"
                      disabled={!blockReason}
                    >
                      Block User
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowBlockForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <Trash2 className="w-4 h-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleUnmatch}
              className="w-full h-12 flex items-center gap-2"
            >
              <UserX className="w-5 h-5" />
              <span>Unmatch</span>
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This will remove the match and conversation
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Compatibility Dashboard Modal */}
      <CompatibilityDashboard
        partnerId={userId || '1'}
        partnerName={userInfo.name}
        isOpen={showCompatibilityDashboard}
        onClose={() => setShowCompatibilityDashboard(false)}
      />

      {/* Mood Theme Selector Modal */}
      <MoodThemeSelector
        currentTheme={currentMoodTheme}
        messages={[]} // Empty array for now, could be populated with actual messages if needed
        onThemeChange={setCurrentMoodTheme}
        isOpen={showMoodThemeSelector}
        onClose={() => setShowMoodThemeSelector(false)}
      />
    </div>
  );
};

export default UserProfileActions;

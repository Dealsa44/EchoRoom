import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, BarChart3, Bot, Languages, BookOpen, LogOut, Mail, User } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/contexts/AppContext';
import AITooltip from '@/components/ai/AITooltip';

const Profile = () => {
  const navigate = useNavigate();
  const { user, safeMode, setSafeMode, logout } = useApp();

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Profile" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">{user?.avatar || '🌟'}</div>
            <h2 className="text-xl font-bold">{user?.username || 'Guest'}</h2>
            <p className="text-muted-foreground">{user?.bio || 'Welcome to EchoRoom'}</p>
            
            {/* User Info */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail size={14} />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <User size={14} />
                <span>ID: {user?.id}</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                <Edit size={16} />
                <span className="ml-2">Edit</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/profile/stats')}>
                <BarChart3 size={16} />
                <span className="ml-2">Stats</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Safe Mode Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Light Mode</span>
                <Switch checked={safeMode === 'light'} onCheckedChange={() => setSafeMode('light')} />
              </div>
              <div className="flex items-center justify-between">
                <span>Deep Mode</span>
                <Switch checked={safeMode === 'deep'} onCheckedChange={() => setSafeMode('deep')} />
              </div>
              <div className="flex items-center justify-between">
                <span>Learning Mode</span>
                <Switch checked={safeMode === 'learning'} onCheckedChange={() => setSafeMode('learning')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI & Language Quick Access */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              AI & Language Tools
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <AITooltip 
                title="Language Progress"
                description="View your detailed language learning statistics and achievements"
              >
                <Button 
                  variant="outline" 
                  className="h-auto p-3 flex-col gap-1"
                  onClick={() => navigate('/profile/stats')}
                >
                  <Languages className="w-4 h-4 text-primary" />
                  <span className="text-xs">Language Stats</span>
                </Button>
              </AITooltip>
              
              <AITooltip 
                title="Learning Preferences"
                description="Set your AI assistant personality and language learning preferences"
              >
                <Button 
                  variant="outline" 
                  className="h-auto p-3 flex-col gap-1"
                  onClick={() => navigate('/profile/edit')}
                >
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-xs">AI Settings</span>
                </Button>
              </AITooltip>
            </div>
            
            <div className="bg-primary/5 p-3 rounded-lg">
              <div className="text-sm font-medium mb-1">Quick Stats</div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>23 corrections</div>
                <div>127 words learned</div>
                <div>7-day streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card>
          <CardContent className="p-4">
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={logout}
            >
              <LogOut size={16} />
              <span className="ml-2">Logout</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
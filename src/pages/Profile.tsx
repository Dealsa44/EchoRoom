import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, BarChart3, LogOut, Mail, User, Users } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/contexts/AppContext';

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
                <span className="ml-2">Journey</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Identity & Relationship Information */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Identity & Preferences
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Gender Identity</span>
                <Badge variant="outline">
                  {user?.genderIdentity === 'other' && user?.customGender 
                    ? user.customGender 
                    : user?.genderIdentity === 'prefer-not-to-say' 
                    ? 'Prefer not to say' 
                    : user?.genderIdentity?.charAt(0).toUpperCase() + user?.genderIdentity?.slice(1) || 'Not set'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Orientation</span>
                <Badge variant="outline">
                  {user?.orientation === 'other' && user?.customOrientation 
                    ? user.customOrientation 
                    : user?.orientation?.charAt(0).toUpperCase() + user?.orientation?.slice(1) || 'Not set'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Attracted to</span>
                <div className="flex gap-1">
                  {user?.attractionPreferences?.map(pref => (
                    <Badge key={pref} variant="secondary" className="text-xs">
                      {pref === 'women' ? 'Women' : 
                       pref === 'men' ? 'Men' : 
                       pref === 'non-binary' ? 'Non-binary' : 'All'}
                    </Badge>
                  )) || <span className="text-muted-foreground text-xs">Not set</span>}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Looking for relationship</span>
                <Switch 
                  checked={user?.lookingForRelationship || false} 
                  disabled 
                />
              </div>
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
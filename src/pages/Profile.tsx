import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, BarChart3, LogOut, Mail, User, Users, MessageCircle, Heart, ArrowLeft, Shield, Settings } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp, getAttractionPreferences } from '@/contexts/AppContext';
import { Profile as ProfileType } from '@/types';
import { getProfileById } from '@/data/mockProfiles';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user, safeMode, setSafeMode, logout } = useApp();
  const [profileData, setProfileData] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Determine if this is own profile or viewing another user's profile
  const isOwnProfile = !userId || userId === user?.id;
  const displayUser = isOwnProfile ? user : profileData;

  // Load other user's profile if viewing someone else
  useEffect(() => {
    if (!isOwnProfile && userId) {
      setLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        const profile = getProfileById(parseInt(userId));
        if (profile) {
          // Convert Profile type to User-like structure for display
          setProfileData({
            ...profile,
            username: profile.name,
            email: `${profile.name.toLowerCase()}@example.com`, // Mock email
            password: '', // Not needed for display
            languages: ['English', 'Georgian'], // Mock languages
            safeMode: 'light' as const,
            anonymousMode: false,
            aiAssistant: true,
            customGender: undefined,
            customOrientation: undefined
          } as any);
        } else {
          toast({
            title: "Profile not found",
            description: "The user profile you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate('/match');
        }
        setLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [userId, isOwnProfile, navigate]);

  const handleSendMessage = () => {
    if (profileData) {
      navigate(`/private-chat/${profileData.id}`);
    }
  };

  const handleLikeProfile = () => {
    toast({
      title: "Liked! 💚",
      description: `You liked ${displayUser?.username || displayUser?.name}'s profile!`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBar title="Profile" />
        <LoadingState message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title={isOwnProfile ? "Profile" : (displayUser?.username || displayUser?.name || "Profile")}
        showBack={!isOwnProfile}
      />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="relative">
              <div className="text-4xl mb-3">{displayUser?.avatar || '🌟'}</div>
              {!isOwnProfile && profileData?.isVerified && (
                <Shield className="absolute -top-1 -right-1 h-5 w-5 text-blue-500" />
              )}
            </div>
            <h2 className="text-xl font-bold">{displayUser?.username || displayUser?.name || 'Guest'}</h2>
            <p className="text-muted-foreground">{displayUser?.bio || 'Welcome to EchoRoom'}</p>
            
            {/* User Info */}
            <div className="mt-4 space-y-2 text-sm">
              {isOwnProfile && (
                <>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Mail size={14} />
                    <span>{displayUser?.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <User size={14} />
                    <span>ID: {displayUser?.id}</span>
                  </div>
                </>
              )}
              
              {!isOwnProfile && profileData && (
                <>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <span>{profileData.age} years old</span>
                    <span>•</span>
                    <span>{profileData.location.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <span>{profileData.distance}km away</span>
                    {profileData.isOnline && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">Online now</span>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              {isOwnProfile ? (
                <>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                      <Edit size={16} />
                      <span className="ml-2">Edit</span>
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/profile/stats')}>
                      <BarChart3 size={16} />
                      <span className="ml-2">Journey</span>
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={() => navigate('/settings')} className="w-32">
                      <Settings size={16} />
                      <span className="ml-2">Settings</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex justify-center gap-2">
                  <Button onClick={handleSendMessage}>
                    <MessageCircle size={16} />
                    <span className="ml-2">Message</span>
                  </Button>
                  <Button variant="outline" onClick={handleLikeProfile}>
                    <Heart size={16} />
                    <span className="ml-2">Like</span>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photo Gallery - For other users */}
        {!isOwnProfile && profileData && profileData.photos && profileData.photos.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <User size={16} />
                Photos
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {profileData.photos.slice(0, 4).map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={photo} 
                      alt={`${profileData.name} photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://picsum.photos/200/200?random=' + (index + 100);
                      }}
                    />
                  </div>
                ))}
              </div>
              {profileData.photos.length > 4 && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  +{profileData.photos.length - 4} more photos
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Identity & Basic Info - For other users */}
        {!isOwnProfile && profileData && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users size={16} />
                Identity & Basic Info
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <Badge variant="outline" className="mt-1">
                    {profileData.genderIdentity?.charAt(0).toUpperCase() + profileData.genderIdentity?.slice(1) || 'Not specified'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Orientation</p>
                  <Badge variant="outline" className="mt-1">
                    {profileData.orientation?.charAt(0).toUpperCase() + profileData.orientation?.slice(1) || 'Not specified'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">{profileData.age} years old</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{profileData.location}</p>
                </div>
              </div>

              {profileData.bio && (
                <div>
                  <p className="text-muted-foreground text-sm mb-2">About</p>
                  <p className="text-sm leading-relaxed">{profileData.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Interests & Information */}
        {!isOwnProfile && profileData && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Heart size={16} />
                Interests & Preferences
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Language Level</p>
                    <p className="font-medium">{profileData.languageLevel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Chat Style</p>
                    <p className="font-medium capitalize">{profileData.chatStyle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Looking for</p>
                    <p className="font-medium">
                      {profileData.lookingForRelationship && profileData.lookingForFriendship 
                        ? 'Relationship, Friendship' 
                        : profileData.lookingForRelationship 
                        ? 'Relationship' 
                        : profileData.lookingForFriendship 
                        ? 'Friendship' 
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Profile</p>
                    <p className="font-medium">{profileData.profileCompletion}% complete</p>
                  </div>
                </div>
                
                {profileData.iceBreakerAnswers && Object.keys(profileData.iceBreakerAnswers).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Get to know me</p>
                    <div className="space-y-2">
                      {Object.entries(profileData.iceBreakerAnswers).slice(0, 2).map(([question, answer]) => (
                        <div key={question} className="text-sm">
                          <p className="font-medium text-muted-foreground">{question}</p>
                          <p className="mt-1">{answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Identity & Relationship Information - Only for own profile */}
        {isOwnProfile && (
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
                <span className="text-sm">Looking for relationship</span>
                <Switch 
                  checked={user?.lookingForRelationship || false} 
                  disabled 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Looking for friendship</span>
                <Switch 
                  checked={user?.lookingForFriendship || false} 
                  disabled 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Settings - Only for own profile */}
        {isOwnProfile && (
          <>
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
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
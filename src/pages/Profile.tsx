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
import { calculateAge } from '@/lib/auth';

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
                     {profileData.isOnline && (
                       <>
                         <span>•</span>
                         <span className="text-green-600">Online now</span>
                       </>
                     )}
                   </div>
                   <div className="flex items-center justify-center gap-2 text-muted-foreground">
                     <span>{profileData.location.split(',')[0]}</span>
                     <span>•</span>
                     <span>{profileData.distance}km away</span>
                   </div>
                 </>
               )}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              {isOwnProfile && (
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photo Gallery */}
        {((isOwnProfile && user?.photos && user.photos.length > 0) || 
          (!isOwnProfile && profileData?.photos && profileData.photos.length > 0)) && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <User size={16} />
                Photos
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(isOwnProfile ? user?.photos : profileData?.photos)?.slice(0, 4).map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={photo} 
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://picsum.photos/200/200?random=' + (index + 100);
                      }}
                    />
                  </div>
                ))}
              </div>
              {((isOwnProfile ? user?.photos?.length : profileData?.photos?.length) || 0) > 4 && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  +{((isOwnProfile ? user?.photos?.length : profileData?.photos?.length) || 0) - 4} more photos
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Identity & Basic Info */}
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
                  {isOwnProfile 
                    ? (user?.genderIdentity === 'other' && user?.customGender 
                        ? user.customGender 
                        : user?.genderIdentity === 'prefer-not-to-say' 
                        ? 'Prefer not to say' 
                        : user?.genderIdentity?.charAt(0).toUpperCase() + user?.genderIdentity?.slice(1) || 'Not set')
                    : (profileData?.genderIdentity?.charAt(0).toUpperCase() + profileData?.genderIdentity?.slice(1) || 'Not specified')
                  }
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Orientation</p>
                <Badge variant="outline" className="mt-1">
                  {isOwnProfile 
                    ? (user?.orientation === 'other' && user?.customOrientation 
                        ? user.customOrientation 
                        : user?.orientation?.charAt(0).toUpperCase() + user?.orientation?.slice(1) || 'Not set')
                    : (profileData?.orientation?.charAt(0).toUpperCase() + profileData?.orientation?.slice(1) || 'Not specified')
                  }
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Age</p>
                <p className="font-medium">
                  {isOwnProfile 
                    ? (user?.dateOfBirth ? calculateAge(user.dateOfBirth) : 'Not set')
                    : profileData?.age
                  } years old
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">
                  {isOwnProfile 
                    ? (user?.location || 'Not set')
                    : (profileData?.location || 'Not specified')
                  }
                </p>
              </div>
            </div>

            {(isOwnProfile ? user?.about : profileData?.about) && (
              <div>
                <p className="text-muted-foreground text-sm mb-2">About</p>
                <p className="text-sm leading-relaxed">{isOwnProfile ? user?.about : profileData?.about}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings & Preferences - Only for own profile */}
        {isOwnProfile && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Settings & Preferences
              </h3>
              
              <div className="space-y-3">
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

        {/* Interests & Preferences */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Heart size={16} />
              Interests & Preferences
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Interests</p>
                {(isOwnProfile ? user?.interests : profileData?.interests) && (isOwnProfile ? user?.interests : profileData?.interests)?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(isOwnProfile ? user?.interests : profileData?.interests)?.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No interests selected yet</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Language Level</p>
                  <p className="font-medium">
                    {isOwnProfile 
                      ? (user?.languageProficiency || 'Not set')
                      : (profileData?.languageProficiency || 'Not specified')
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Personality</p>
                  <p className="font-medium capitalize">
                    {isOwnProfile 
                      ? (user?.chatStyle || 'Not set')
                      : (profileData?.chatStyle || 'Not specified')
                    }
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Looking for</p>
                  <p className="font-medium">
                    {isOwnProfile 
                      ? (user?.lookingForRelationship && user?.lookingForFriendship 
                          ? 'Relationship, Friendship' 
                          : user?.lookingForRelationship 
                          ? 'Relationship' 
                          : user?.lookingForFriendship 
                          ? 'Friendship' 
                          : 'Not specified')
                      : (profileData?.lookingForRelationship && profileData?.lookingForFriendship 
                          ? 'Relationship, Friendship' 
                          : profileData?.lookingForRelationship 
                          ? 'Relationship' 
                          : profileData?.lookingForFriendship 
                          ? 'Friendship' 
                          : 'Not specified')
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle & Background */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User size={16} />
              Lifestyle & Background
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Smoking</p>
                  <p className="font-medium capitalize">
                    {isOwnProfile 
                      ? (user?.smoking && user.smoking !== 'prefer-not-to-say' 
                          ? user.smoking.replace('-', ' ') 
                          : 'Not specified')
                      : (profileData?.smoking && profileData.smoking !== 'prefer-not-to-say' 
                          ? profileData.smoking.replace('-', ' ') 
                          : 'Not specified')
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Drinking</p>
                  <p className="font-medium capitalize">
                    {isOwnProfile 
                      ? (user?.drinking && user.drinking !== 'prefer-not-to-say' 
                          ? user.drinking.replace('-', ' ') 
                          : 'Not specified')
                      : (profileData?.drinking && profileData.drinking !== 'prefer-not-to-say' 
                          ? profileData.drinking.replace('-', ' ') 
                          : 'Not specified')
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Children</p>
                  <p className="font-medium capitalize">
                    {isOwnProfile 
                      ? (user?.hasChildren && user.hasChildren !== 'prefer-not-to-say' 
                          ? user.hasChildren.replace('-', ' ') 
                          : 'Not specified')
                      : (profileData?.hasChildren && profileData.hasChildren !== 'prefer-not-to-say' 
                          ? profileData.hasChildren.replace('-', ' ') 
                          : 'Not specified')
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Education</p>
                  <p className="font-medium capitalize">
                    {isOwnProfile 
                      ? (user?.education && user.education !== 'prefer-not-to-say' 
                          ? user.education.replace('-', ' ') 
                          : 'Not specified')
                      : (profileData?.education && profileData.education !== 'prefer-not-to-say' 
                          ? profileData.education.replace('-', ' ') 
                          : 'Not specified')
                    }
                  </p>
                </div>
                {(isOwnProfile ? user?.occupation : profileData?.occupation) && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Occupation</p>
                    <p className="font-medium">{isOwnProfile ? user?.occupation : profileData?.occupation}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Religion</p>
                  <p className="font-medium capitalize">
                    {isOwnProfile 
                      ? (user?.religion && user.religion !== 'prefer-not-to-say' 
                          ? user.religion.replace('-', ' ') 
                          : 'Not specified')
                      : (profileData?.religion && profileData.religion !== 'prefer-not-to-say' 
                          ? profileData.religion.replace('-', ' ') 
                          : 'Not specified')
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Political Views</p>
                  <p className="font-medium capitalize">
                    {isOwnProfile 
                      ? (user?.politicalViews && user.politicalViews !== 'prefer-not-to-say' 
                          ? user.politicalViews.replace('-', ' ') 
                          : 'Not specified')
                      : (profileData?.politicalViews && profileData.politicalViews !== 'prefer-not-to-say' 
                          ? profileData.politicalViews.replace('-', ' ') 
                          : 'Not specified')
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Profile Questions Section */}
        {(isOwnProfile || (!isOwnProfile && profileData?.profileQuestions && profileData.profileQuestions.some(q => q.answer))) && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                {isOwnProfile ? "Get to Know Me" : "Get to Know Them"}
              </h3>
              
              <div className="space-y-4">
                {(isOwnProfile ? user?.profileQuestions : profileData?.profileQuestions)?.map((question, index) => (
                  <div key={question.id} className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{question.question}</p>
                    {question.answer ? (
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {question.answer}
                      </p>
                    ) : isOwnProfile ? (
                      <p className="text-sm text-muted-foreground italic">
                        Not answered yet
                      </p>
                    ) : null}
                  </div>
                ))}
                
                {isOwnProfile && (!user?.profileQuestions || user.profileQuestions.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No profile questions yet. Edit your profile to add some!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logout Section - Only for own profile */}
        {isOwnProfile && (
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
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
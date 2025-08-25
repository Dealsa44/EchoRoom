import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, BarChart3, LogOut, Mail, User, Users, MessageCircle, Heart, ArrowLeft, Shield, Settings, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/hooks/useApp';
import { GenderIdentity, Orientation } from '@/contexts/app-utils';
import CallButtons from '@/components/calls/CallButtons';

// Helper function to format children display
const formatChildrenDisplay = (hasChildren: string): string => {
  switch (hasChildren) {
    case 'no':
      return 'No';
    case 'yes':
      return 'Yes';
    case 'want-someday':
      return 'Want someday';
    case 'have-and-want-more':
      return 'Have and want more';
    case 'have-and-dont-want-more':
      return 'Have and don\'t want more';
    case 'not-sure-yet':
      return 'Not sure yet';
    default:
      return hasChildren.replace('-', ' ');
  }
};

// Helper function to format relationship status display
const formatRelationshipStatus = (status: string): string => {
  switch (status) {
    case 'single':
      return 'Single';
    case 'in-a-relationship':
      return 'In a relationship';
    case 'engaged':
      return 'Engaged';
    case 'married':
      return 'Married';
    case 'divorced':
      return 'Divorced';
    case 'widowed':
      return 'Widowed';
    case 'separated':
      return 'Separated';
    case 'complicated':
      return 'It\'s complicated';
    default:
      return status.replace('-', ' ');
  }
};

// Define User interface locally to match AppContext
interface UserType {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  about: string;
  interests: string[];
  languages: Array<{ language: string; level: string }>;
  chatStyle: 'introvert' | 'ambievert' | 'extrovert';
  safeMode: 'light' | 'deep' | 'learning';
  anonymousMode: boolean;
  aiAssistant: boolean;
  dateOfBirth: string;
  age: number;
  genderIdentity: GenderIdentity;
  orientation: Orientation;
  lookingForRelationship: boolean;
  lookingForFriendship: boolean;
  customGender?: string;
  customOrientation?: string;
  ethnicity?: string;
  smoking: 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say';
  drinking: 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say';
  hasChildren: 'no' | 'yes' | 'want-someday' | 'have-and-want-more' | 'have-and-dont-want-more' | 'not-sure-yet' | 'prefer-not-to-say';
  relationshipStatus?: string;
  education: 'high-school' | 'bachelor' | 'master' | 'phd' | 'other' | 'prefer-not-to-say';
  occupation: string;
  religion: 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'atheist' | 'agnostic' | 'other' | 'prefer-not-to-say';
  politicalViews: 'liberal' | 'conservative' | 'moderate' | 'apolitical' | 'other' | 'prefer-not-to-say';
  languageProficiency: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'native'>;
  photos?: string[];
  profileQuestions: ProfileQuestion[];
  location?: string;
  relationshipType?: string;
}
import { getAttractionPreferences } from '@/contexts/app-utils';
import { Profile as ProfileType, ProfileQuestion } from '@/types';
import { getProfileById } from '@/data/mockProfiles';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { calculateAge } from '@/lib/auth';
import { photoStorage } from '@/lib/photoStorage';

// Type for display user that can be either User or Profile
type DisplayUser = UserType | (ProfileType & {
  username: string;
  email: string;
  password: string;
  languages: Array<{ language: string; level: string }>;
  safeMode: 'light' | 'medium' | 'strict';
  anonymousMode: boolean;
  aiAssistant: boolean;
  customGender?: string;
  customOrientation?: string;
  ethnicity: string;
  relationshipType?: string;
  about?: string;
  location?: string;
  smoking?: string;
  drinking?: string;
  hasChildren?: string;
  education?: string;
  occupation?: string;
  religion?: string;
  politicalViews?: string;
});

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user, safeMode, setSafeMode, logout } = useApp();
  const [profileData, setProfileData] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(false);
  const [userPhotos, setUserPhotos] = useState<Array<{ id: string; url: string; uploadDate: Date; [key: string]: unknown }>>([]);
  
  // Add error state
  const [error, setError] = useState<string | null>(null);
  
  // Determine if this is own profile or viewing another user's profile
  const isOwnProfile = !userId || userId === user?.id;
  
  // Defensive check for user data with safe fallbacks
  const displayUser: DisplayUser | null = isOwnProfile 
    ? (user && user.id ? {
        ...user,
        // Ensure languages array is safe
        languages: Array.isArray(user.languages) 
          ? user.languages.filter(lang => lang && typeof lang === 'object' && lang.language)
          : []
      } as unknown as DisplayUser : null)
    : (profileData ? {
        ...profileData,
        // Ensure languages array is safe
        languages: Array.isArray(profileData.languages) 
          ? profileData.languages.filter(lang => lang && typeof lang === 'object' && lang.language)
          : []
      } as unknown as DisplayUser : null);

  // Load other user's profile if viewing someone else
  useEffect(() => {
    if (!isOwnProfile && userId) {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call delay
        const timer = setTimeout(() => {
          try {
            const profile = getProfileById(parseInt(userId));
            if (profile) {
              // Convert Profile type to User-like structure for display
              setProfileData({
                ...profile,
                username: profile.name,
                email: `${profile.name.toLowerCase()}@example.com`, // Mock email
                password: '', // Not needed for display
                languages: profile.languages || [{ language: 'english', level: 'intermediate' }], // Use actual languages or default
                safeMode: 'light' as const,
                anonymousMode: false,
                aiAssistant: true,
                customGender: undefined,
                customOrientation: undefined,
                ethnicity: profile.ethnicity || 'prefer-not-to-say', // Add ethnicity
                relationshipType: profile.relationshipType || undefined // Add relationship type
              } as ProfileType & {
                username: string;
                email: string;
                password: string;
                languages: Array<{ language: string; level: string }>;
                safeMode: 'light' | 'medium' | 'strict';
                anonymousMode: boolean;
                aiAssistant: boolean;
                customGender?: string;
                customOrientation?: string;
                ethnicity: string;
                relationshipType?: string;
              });
            } else {
              // Profile not found - toast removed per user request
              navigate('/match');
            }
          } catch (profileError) {
            console.error('Error loading profile:', profileError);
            setError('Failed to load profile data');
          } finally {
            setLoading(false);
          }
        }, 800);
        
        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error in profile loading effect:', error);
        setError('Failed to initialize profile loading');
        setLoading(false);
      }
    }
  }, [userId, isOwnProfile, navigate]);

  // Load user photos from localStorage for own profile
  useEffect(() => {
    if (isOwnProfile && user?.id) {
      try {
        const photos = photoStorage.loadPhotos(user.id);
        setUserPhotos(photos as any);
      } catch (photoError) {
        console.error('Error loading photos:', photoError);
        // Don't fail the entire component if photos fail to load
        setUserPhotos([]);
        
        // Try to clear corrupted photo data
        try {
          localStorage.removeItem(`photos_${user.id}`);
        } catch (cleanupError) {
          console.warn('Failed to clean up corrupted photo data:', cleanupError);
        }
      }
    }
  }, [isOwnProfile, user?.id]);

  // Early return if no user data and this is own profile
  if (isOwnProfile && !user) {
    // Check if this might be a PWA storage issue
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                   (window.navigator as any).standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    return (
      <div className="min-h-screen bg-background">
        <TopBar title="Profile" />
        <div className="px-4 py-6 max-w-md mx-auto space-y-6 content-safe-top pb-24">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Please log in to view your profile.</p>
                
                {isPWA && isIOS && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-amber-800 mb-2">
                      <strong>iOS PWA Issue Detected</strong>
                    </p>
                    <p className="text-amber-700 text-xs">
                      If you're experiencing login problems, try opening the app in Safari browser instead of from the home screen.
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Button onClick={() => navigate('/login')} className="w-full">
                    Go to Login
                  </Button>
                  
                  {isPWA && (
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="w-full"
                    >
                      Open in Browser
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar title="Profile" />
        <div className="px-4 py-6 max-w-md mx-auto space-y-6 content-safe-top pb-24">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const handleSendMessage = () => {
    if (profileData) {
      navigate(`/private-chat/${profileData.id}`);
    }
  };

  const handleLikeProfile = () => {
    // Profile liked - toast removed per user request
  };

  // Lightweight photo lightbox state for mobile-first dialog
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar title="Profile" />
        <div className="px-4 py-6 max-w-md mx-auto space-y-6 content-safe-top pb-24">
          {/* Profile Card Skeleton */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="relative flex justify-center mb-4">
                <div className="h-14 w-14 bg-muted rounded-full animate-pulse"></div>
              </div>
              <div className="h-6 bg-muted rounded w-32 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-24 mx-auto animate-pulse"></div>
            </CardContent>
          </Card>

          {/* Bio Section Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="h-5 bg-muted rounded w-24 mb-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="h-5 bg-muted rounded w-32 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-28 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-18 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interests Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="h-5 bg-muted rounded w-24 mb-4 animate-pulse"></div>
              <div className="flex flex-wrap gap-2">
                <div className="h-8 bg-muted rounded-full w-20 animate-pulse"></div>
                <div className="h-8 bg-muted rounded-full w-24 animate-pulse"></div>
                <div className="h-8 bg-muted rounded-full w-28 animate-pulse"></div>
                <div className="h-8 bg-muted rounded-full w-20 animate-pulse"></div>
                <div className="h-8 bg-muted rounded-full w-24 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-3">
            <div className="h-12 bg-muted rounded-full flex-1 animate-pulse"></div>
            <div className="h-12 bg-muted rounded-full flex-1 animate-pulse"></div>
          </div>
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar 
        title={isOwnProfile ? "Profile" : (displayUser?.username || "Profile")}
        showBack={!isOwnProfile}
      />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 content-safe-top pb-24">
        <Card className="relative overflow-hidden animate-breathe">
          {/* Floating background accents */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary/12 blur-2xl animate-float-ambient" aria-hidden />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-secondary/10 blur-2xl animate-float-slow" aria-hidden />
          <CardContent className="p-6 text-center">
            <div className="relative flex justify-center">
              <div className="h-14 w-14 rounded-full bg-card-hover border-2 border-border flex items-center justify-center shadow-inner-soft">
                <div className="text-3xl">{displayUser?.avatar || '🌟'}</div>
              </div>
              {!isOwnProfile && profileData?.isVerified && (
                <Shield className="absolute -top-1 right-[calc(50%-28px)] h-5 w-5 text-blue-500" />
              )}
            </div>
            <h2 className="mt-2 text-xl font-bold">{displayUser?.username || 'Guest'}</h2>
            <div className="mt-2 h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-80" />
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{displayUser?.bio || 'Welcome to EchoRoom'}</p>

            {/* User Info */}
            <div className="mt-4 text-sm">
              {isOwnProfile ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card/60 px-3 py-1">
                    <Mail size={14} />
                    <span>{displayUser?.email}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card/60 px-3 py-1">
                    <User size={14} />
                    <span>ID: {displayUser?.id}</span>
                  </span>
                </div>
              ) : profileData ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card/60 px-3 py-1">
                    <span>{profileData.age} years old</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card/60 px-3 py-1">
                    <span>{profileData.location.split(',')[0]}</span>
                    <span className="opacity-60">•</span>
                    <span>{profileData.distance}km away</span>
                  </span>
                  {profileData.isOnline && (
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card/60 px-3 py-1 text-green-600">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                      <span>Online now</span>
                    </span>
                  )}
                </div>
              ) : null}
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
                  <CallButtons
                    participantId={profileData?.id?.toString() || '1'}
                    participantName={profileData?.name || 'User'}
                    participantAvatar={profileData?.avatar || '🌟'}
                    variant="full"
                  />
                  <Button variant="outline" onClick={handleSendMessage}>
                    <MessageCircle size={16} />
                    <span className="ml-2">Message</span>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photo Gallery */}
        <Card className="relative overflow-hidden animate-breathe">
          {/* Floating background accents */}
          <div className="pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-tertiary/12 blur-2xl animate-float-ambient" aria-hidden />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-secondary/10 blur-2xl animate-float-slow" aria-hidden />
          <CardHeader className="pb-0">
            <div className="flex items-center gap-3 animate-float-ambient">
              <div className="h-9 w-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <CardTitle className="text-base">Photos</CardTitle>
                              {/* Verification status */}
                {isOwnProfile && userPhotos.length > 0 && (
                  <Badge className="bg-green-100 text-green-800 text-xs ml-auto">
                    ✓ {userPhotos.filter(photo => photo.isVerified).length} verified
                  </Badge>
                )}
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-gradient-to-r from-secondary via-primary to-accent shadow-[0_0_12px_hsl(var(--secondary)_/_0.35)] dark:shadow-[0_0_12px_hsl(var(--secondary)_/_0.45)]" />
          </CardHeader>
          <CardContent className="p-4 pt-4">
            {((isOwnProfile && userPhotos.length > 0) || 
              (!isOwnProfile && profileData?.photos && profileData.photos.length > 0)) ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {(isOwnProfile ? userPhotos : profileData?.photos)?.slice(0, 4).map((photo, index) => (
                    <PhotoLightboxThumb 
                      key={index} 
                      src={isOwnProfile ? photo.url : photo} 
                      index={index} 
                      delayMs={index * 120}
                      isVerified={isOwnProfile ? photo.isVerified : (index === 0)} // Use actual verification status for own profile
                    />
                  ))}
                </div>
                {((isOwnProfile ? userPhotos.length : profileData?.photos?.length) || 0) > 4 && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    +{((isOwnProfile ? userPhotos.length : profileData?.photos?.length) || 0) - 4} more photos
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📸</div>
                <p className="text-sm text-muted-foreground mb-4">
                  {isOwnProfile ? "No photos uploaded yet" : "No photos available"}
                </p>
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/profile/edit')}
                  >
                    Add Photos
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Identity & Basic Info */}
        <Card className="relative overflow-hidden animate-breathe">
          {/* Floating background accents */}
          <div className="pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-primary/12 blur-2xl animate-float-ambient" aria-hidden />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-secondary/10 blur-2xl animate-float-slow" aria-hidden />
          <CardHeader className="pb-0">
            <div className="flex items-center gap-3 animate-float-ambient">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <CardTitle className="text-base">Identity & Basic Info</CardTitle>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent shadow-[0_0_12px_hsl(var(--primary)_/_0.35)] dark:shadow-[0_0_12px_hsl(var(--primary)_/_0.45)]" />
          </CardHeader>
          <CardContent className="p-4 pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '0ms' }}>
                <p className="text-muted-foreground">Gender</p>
                <div className="mt-1">
                  <Badge variant="outline">
                    {isOwnProfile
                      ? (user?.genderIdentity === 'other' && user?.customGender
                          ? user.customGender
                          : user?.genderIdentity?.charAt(0).toUpperCase() + user?.genderIdentity?.slice(1) || 'Not set')
                      : (profileData?.genderIdentity?.charAt(0).toUpperCase() + profileData?.genderIdentity?.slice(1) || 'Not specified')}
                  </Badge>
                </div>
              </div>
              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '150ms' }}>
                <p className="text-muted-foreground">Orientation</p>
                <div className="mt-1">
                  <Badge variant="outline">
                    {isOwnProfile
                      ? (user?.orientation === 'other' && user?.customOrientation
                          ? user.customOrientation
                          : user?.orientation?.charAt(0).toUpperCase() + user?.orientation?.slice(1) || 'Not set')
                      : (profileData?.orientation?.charAt(0).toUpperCase() + profileData?.orientation?.slice(1) || 'Not specified')}
                  </Badge>
                </div>
              </div>
              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '300ms' }}>
                <p className="text-muted-foreground">Ethnicity</p>
                <div className="mt-1">
                  <Badge variant="outline">
                    {isOwnProfile
                      ? ((user as any)?.ethnicity && (user as any).ethnicity !== 'prefer-not-to-say'
                        ? (user as any).ethnicity.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                          : 'Not specified')
                      : (profileData?.ethnicity && profileData.ethnicity !== 'prefer-not-to-say'
                          ? profileData.ethnicity.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                          : 'Not specified')}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '450ms' }}>
                <p className="text-muted-foreground">Age</p>
                <p className="mt-1 font-medium">
                  {isOwnProfile ? (user?.dateOfBirth ? calculateAge(user.dateOfBirth) : 'Not set') : profileData?.age} years old
                </p>
              </div>
              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '600ms' }}>
                <p className="text-muted-foreground">Location</p>
                                  <p className="mt-1 font-medium">
                    {isOwnProfile ? (user?.location || 'Not set') : (profileData?.location || 'Not specified')}
                  </p>
              </div>
              {(isOwnProfile ? user?.hometown : profileData?.hometown) && (
                <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '750ms' }}>
                  <p className="text-muted-foreground">Hometown</p>
                  <p className="mt-1 font-medium">
                    {isOwnProfile ? user?.hometown : profileData?.hometown}
                  </p>
                </div>
              )}
            </div>
            {(isOwnProfile ? user?.about : profileData?.about) && (
              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '750ms' }}>
                <p className="text-muted-foreground text-sm mb-1">About</p>
                <p className="text-sm leading-relaxed">{isOwnProfile ? user?.about : profileData?.about}</p>
              </div>
            )}
          </CardContent>
        </Card>



        {/* Interests & Preferences */}
        <Card className="relative overflow-hidden animate-breathe">
          {/* Floating background accents */}
          <div className="pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-secondary/15 blur-2xl animate-float-ambient" aria-hidden />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl animate-float-slow" aria-hidden />
          <CardHeader className="pb-0">
            <div className="flex items-center gap-3 animate-float-ambient">
              <div className="h-9 w-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <CardTitle className="text-base">Interests & Preferences</CardTitle>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-gradient-to-r from-secondary via-primary to-accent shadow-[0_0_12px_hsl(var(--secondary)_/_0.35)] dark:shadow-[0_0_12px_hsl(var(--secondary)_/_0.45)]" />
          </CardHeader>
          <CardContent className="p-4 pt-4 space-y-4">
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '0ms' }}>
                <p className="text-sm text-muted-foreground mb-2">Interests</p>
                {(isOwnProfile ? user?.interests : profileData?.interests) && (isOwnProfile ? user?.interests : profileData?.interests)?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(isOwnProfile ? user?.interests : profileData?.interests)?.map((interest, idx) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="text-xs rounded-full px-3 py-1 bg-secondary/15 text-foreground border-2 border-border hover:border-secondary/40 transition-smooth animate-breathe"
                        style={{ animationDelay: `${(idx % 6) * 120}ms` }}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No interests selected yet</span>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '0ms' }}>
                  <p className="text-muted-foreground">Languages</p>
                  <div className="mt-1 space-y-1">
                    {isOwnProfile ? (
                      user?.languages && user.languages.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.languages.map((lang, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {lang && (lang as any).language && typeof (lang as any).language === 'string'
                                ? (lang as any).language.charAt(0).toUpperCase() + (lang as any).language.slice(1)
                                : 'Unknown'} ({(lang as any).level || 'Unknown'})
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not set</span>
                      )
                    ) : (
                      profileData?.languages && profileData.languages.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {profileData.languages.map((lang, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {lang && lang.language && typeof lang.language === 'string' 
                                ? lang.language.charAt(0).toUpperCase() + lang.language.slice(1)
                                : 'Unknown'} ({lang && lang.level ? lang.level : 'Unknown'})
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not specified</span>
                      )
                    )}
                  </div>
                </div>
                <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '150ms' }}>
                  <p className="text-muted-foreground">Personality</p>
                  <p className="mt-1 font-medium capitalize">
                    {isOwnProfile ? (user?.chatStyle || 'Not set') : (profileData?.chatStyle || 'Not specified')}
                  </p>
                </div>
                <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '225ms' }}>
                  <p className="text-muted-foreground">Relationship Status</p>
                  <p className="mt-1 font-medium">
                    {isOwnProfile
                      ? (user?.relationshipStatus && user.relationshipStatus !== 'prefer-not-to-say' ? formatRelationshipStatus(user.relationshipStatus) : 'Not specified')
                      : (profileData?.relationshipStatus && profileData.relationshipStatus !== 'prefer-not-to-say' ? formatRelationshipStatus(profileData.relationshipStatus) : 'Not specified')}
                  </p>
                </div>
              </div>
              
              {/* Looking for section with improved styling */}
              <div className="rounded-xl border-2 border-border bg-card/60 p-4 animate-float-ambient" style={{ animationDelay: '300ms' }}>
                <p className="text-muted-foreground mb-3">Looking for</p>
                <div className="space-y-3">
                  {isOwnProfile ? (
                    <>
                      {user?.lookingForRelationship && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-primary" />
                            <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                              Relationship
                            </Badge>
                          </div>
                          {(user as any)?.relationshipType && (user as any).relationshipType !== 'prefer-not-to-say' && (
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              {(user as any).relationshipType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Badge>
                          )}
                        </div>
                      )}
                      {user?.lookingForFriendship && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-secondary" />
                            <Badge variant="default" className="text-xs bg-secondary text-secondary-foreground">
                              Friendship
                            </Badge>
                          </div>
                        </div>
                      )}
                      {!user?.lookingForRelationship && !user?.lookingForFriendship && (
                        <div className="text-center py-4">
                          <span className="text-sm text-muted-foreground">Not specified</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {profileData?.lookingForRelationship && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-primary" />
                            <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                              Relationship
                            </Badge>
                          </div>
                          {profileData?.relationshipType && profileData.relationshipType !== 'prefer-not-to-say' && (
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              {profileData.relationshipType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </Badge>
                          )}
                        </div>
                      )}
                      {profileData?.lookingForFriendship && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-secondary" />
                            <Badge variant="default" className="text-xs bg-secondary text-secondary-foreground">
                              Friendship
                            </Badge>
                          </div>
                        </div>
                      )}
                      {!profileData?.lookingForRelationship && !profileData?.lookingForFriendship && (
                        <div className="text-center py-4">
                          <span className="text-sm text-muted-foreground">Not specified</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle & Background */}
        <Card className="relative overflow-hidden animate-float-ambient">
          {/* Floating background accents */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/12 blur-2xl animate-float-ambient" aria-hidden />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-tertiary/10 blur-2xl animate-float-slow" aria-hidden />
          <CardHeader className="pb-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <CardTitle className="text-base">Lifestyle & Background</CardTitle>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-gradient-to-r from-primary via-tertiary to-secondary shadow-[0_0_12px_hsl(var(--primary)_/_0.35)] dark:shadow-[0_0_12px_hsl(var(--primary)_/_0.45)]" />
          </CardHeader>
          <CardContent className="p-4 pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient">
                <p className="text-muted-foreground">Smoking</p>
                <p className="mt-1 font-medium capitalize">
                  {isOwnProfile
                    ? (user?.smoking && user.smoking !== 'prefer-not-to-say' ? user.smoking.replace('-', ' ') : 'Not specified')
                    : (profileData?.smoking && profileData.smoking !== 'prefer-not-to-say' ? profileData.smoking.replace('-', ' ') : 'Not specified')}
                </p>
              </div>
              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '150ms' }}>
                <p className="text-muted-foreground">Drinking</p>
                <p className="mt-1 font-medium capitalize">
                  {isOwnProfile
                    ? (user?.drinking && user.drinking !== 'prefer-not-to-say' ? user.drinking.replace('-', ' ') : 'Not specified')
                    : (profileData?.drinking && profileData.drinking !== 'prefer-not-to-say' ? profileData.drinking.replace('-', ' ') : 'Not specified')}
                </p>
              </div>
              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '300ms' }}>
                <p className="text-muted-foreground">Children</p>
                <p className="mt-1 font-medium capitalize">
                  {isOwnProfile
                    ? (user?.hasChildren && user.hasChildren !== 'prefer-not-to-say' ? formatChildrenDisplay(user.hasChildren) : 'Not specified')
                    : (profileData?.hasChildren && profileData.hasChildren !== 'prefer-not-to-say' ? formatChildrenDisplay(profileData.hasChildren) : 'Not specified')}
                </p>
              </div>

              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '450ms' }}>
                <p className="text-muted-foreground">Education</p>
                <p className="mt-1 font-medium capitalize">
                  {isOwnProfile
                    ? (user?.education && user.education !== 'prefer-not-to-say' ? user.education.replace('-', ' ') : 'Not specified')
                    : (profileData?.education && profileData.education !== 'prefer-not-to-say' ? profileData.education.replace('-', ' ') : 'Not specified')}
                </p>
              </div>
              {(isOwnProfile ? user?.occupation : profileData?.occupation) && (
                <div className="col-span-2 rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '600ms' }}>
                  <p className="text-muted-foreground">Occupation</p>
                  <p className="mt-1 font-medium">{isOwnProfile ? user?.occupation : profileData?.occupation}</p>
                </div>
              )}
              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '750ms' }}>
                <p className="text-muted-foreground">Religion</p>
                <p className="mt-1 font-medium capitalize">
                  {isOwnProfile
                    ? (user?.religion && user.religion !== 'prefer-not-to-say' ? user.religion.replace('-', ' ') : 'Not specified')
                    : (profileData?.religion && profileData.religion !== 'prefer-not-to-say' ? profileData.religion.replace('-', ' ') : 'Not specified')}
                </p>
              </div>
              <div className="rounded-xl border-2 border-border bg-card/60 p-3 animate-float-ambient" style={{ animationDelay: '900ms' }}>
                <p className="text-muted-foreground">Political Views</p>
                <p className="mt-1 font-medium capitalize">
                  {isOwnProfile
                    ? (user?.politicalViews && user.politicalViews !== 'prefer-not-to-say' ? user.politicalViews.replace('-', ' ') : 'Not specified')
                    : (profileData?.politicalViews && profileData.politicalViews !== 'prefer-not-to-say' ? profileData.politicalViews.replace('-', ' ') : 'Not specified')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Profile Questions Section */}
        {(isOwnProfile || (!isOwnProfile && profileData?.profileQuestions && profileData.profileQuestions.some(q => q.answer))) && (
          <Card className="relative overflow-hidden animate-float-ambient">
            {/* Floating background accents */}
            <div
              className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl animate-float-ambient"
              style={{ animationDelay: '250ms' }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl animate-float-slow"
              style={{ animationDelay: '900ms' }}
              aria-hidden
            />
            <CardHeader className="pb-0">
              <div className="group flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Get to Know Me</CardTitle>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent shadow-[0_0_12px_hsl(var(--primary)_/_0.35)] dark:shadow-[0_0_12px_hsl(var(--primary)_/_0.45)]" />
            </CardHeader>
            <CardContent className="p-4 pt-4 space-y-3">
              <div className="space-y-3">
                {(isOwnProfile ? user?.profileQuestions : profileData?.profileQuestions)?.map((question, index) => (
                  <div
                    key={question.id}
                    className={`relative group/item rounded-xl border-2 border-border bg-card/60 hover:bg-card-hover hover:border-primary/40 transition-smooth p-4 shadow-none hover:shadow-large hover:shadow-glow-purple`}
                  >
                    <div className="animate-in fade-in-50 slide-in-from-bottom-1" style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}>
                      {/* Decorative floating spark */}
                      <span className="pointer-events-none absolute -top-1 -right-1 h-8 w-8 rounded-full bg-primary/10 blur-lg opacity-60 transition-smooth" aria-hidden />
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-primary/10 text-primary text-xs font-semibold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{question.question}</p>
                          {question.answer ? (
                            <p className="mt-2 text-sm text-muted-foreground bg-muted/70 p-3 rounded-lg leading-relaxed border-l-2 border-primary/30">
                              {question.answer}
                            </p>
                          ) : isOwnProfile ? (
                            <p className="mt-2 text-sm text-muted-foreground italic">Not answered yet</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isOwnProfile && (!user?.profileQuestions || user.profileQuestions.length === 0) && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No profile questions yet. Edit your profile to add some!
                </div>
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

// Photo thumbnail with mobile-first lightbox
function PhotoLightboxThumb({ 
  src, 
  index, 
  delayMs = 0, 
  isVerified = false 
}: { 
  src: string; 
  index: number; 
  delayMs?: number;
  isVerified?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="aspect-square rounded-lg overflow-hidden relative group focus:outline-none focus:ring-2 focus:ring-primary border-2 border-border bg-card/60 animate-float-ambient"
        style={{ animationDelay: `${delayMs}ms` }}
        onClick={() => setOpen(true)}
      >
        <img
          src={src}
          alt={`Photo ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-200 group-active:scale-[0.99]"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://picsum.photos/200/200?random=' + (index + 100);
          }}
        />
        <span className="pointer-events-none absolute inset-0 bg-black/0 group-active:bg-black/10 transition-smooth" />
        
        {/* Verification badge */}
        {isVerified && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-100 text-green-800 text-xs">
              ✓ Verified
            </Badge>
          </div>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm w-[calc(100vw-3rem)] p-2 border-border-soft mx-auto">
          <DialogTitle className="sr-only">Photo {index + 1}</DialogTitle>
          <DialogDescription className="sr-only">Full-size photo preview</DialogDescription>
          <div className="relative w-full overflow-hidden rounded-lg bg-muted/30">
            <img
              src={src}
              alt={`Photo ${index + 1}`}
              className="w-full h-auto max-h-[75vh] object-contain"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://picsum.photos/600/800?random=' + (index + 200);
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/70 to-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Portal } from '@radix-ui/react-portal';
import SwipeableCard from '@/components/ui/SwipeableCard';
import { Heart, MessageCircle, X, Filter, MapPin, Info, ChevronDown, ChevronUp, Star, Shield, Users, Lightbulb, Sparkles, RotateCcw, Zap, UserCheck } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import SmartConversationStarters from '@/components/chat/SmartConversationStarters';
import { useApp, getAttractionPreferences } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Profile } from '@/types';
import { mockProfiles } from '@/data/mockProfiles';

interface Filters {
  interests: string[];
  languageLevel: string;
  chatStyle: string;
  relationshipIntent: string;
  ageRange: [number, number]; // [min, max] for age range slider
  anyAge: boolean; // toggle for "any age" option
  distance: number; // single value for distance slider (0 = any distance)
  anyDistance: boolean; // toggle for "any distance" option
  onlineOnly: boolean;
}

const Match = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const iceBreakerModalRef = useRef<HTMLDivElement>(null);
  const conversationStartersModalRef = useRef<HTMLDivElement>(null);
  const filtersModalRef = useRef<HTMLDivElement>(null);

  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showIceBreakers, setShowIceBreakers] = useState(false);
  const [selectedIceBreaker, setSelectedIceBreaker] = useState('');
  const [showConversationStarters, setShowConversationStarters] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [matches, setMatches] = useState<Profile[]>([]);
  const [isCardAnimating, setIsCardAnimating] = useState(false);
  const [matchAnimation, setMatchAnimation] = useState(false);
  const [cardStack, setCardStack] = useState<Profile[]>([]);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // Performance optimization: Memoize expensive calculations
  const swipeProgressRef = useRef(0);
  const swipeDirectionRef = useRef<'left' | 'right' | null>(null);
  const [filters, setFilters] = useState<Filters>({
    interests: [],
    languageLevel: 'all',
    chatStyle: 'all',
    relationshipIntent: 'all',
    ageRange: [18, 100], // default to full age range
    anyAge: true, // default to any age
    distance: 50, // default distance in km
    anyDistance: true, // default to any distance
    onlineOnly: false
  });

  // Track which select dropdowns are open to prevent modal from closing
  const [openSelects, setOpenSelects] = useState({
    languageLevel: false,
    chatStyle: false,
    relationshipIntent: false,
    interests: false
  });

  // Check if any select is currently open
  const anySelectOpen = Object.values(openSelects).some(isOpen => isOpen);

  // Handle click outside to close modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showIceBreakers && iceBreakerModalRef.current && !iceBreakerModalRef.current.contains(event.target as Node)) {
        setShowIceBreakers(false);
        setSelectedIceBreaker('');
        setCustomMessage('');
      }
      if (showConversationStarters && conversationStartersModalRef.current && !conversationStartersModalRef.current.contains(event.target as Node)) {
        setShowConversationStarters(false);
      }
      // Filters modal will be handled by its own backdrop click handler
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIceBreakers, showConversationStarters, filtersExpanded, anySelectOpen]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showIceBreakers || showConversationStarters || filtersExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showIceBreakers, showConversationStarters, filtersExpanded]);

  const iceBreakers = [
    "What's your favorite way to spend a weekend?",
    "If you could travel anywhere right now, where would you go?",
    "What's the best book you've read recently?",
    "What's your go-to comfort food?",
    "What's something you're passionate about?",
    "What's the most interesting place you've visited?",
    "What's your favorite way to practice languages?",
    "What's something that always makes you laugh?",
    "What's your dream job or career goal?",
    "What's your favorite season and why?"
  ];

  // Use centralized mock profiles
  const profiles = mockProfiles;

  // Filter profiles based on current filters (memoized to prevent infinite re-renders)
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Check relationship intent compatibility
      // Priority: Filter setting > User profile setting
      if (filters.relationshipIntent !== 'all') {
        // User explicitly selected a filter - use that
        if (filters.relationshipIntent === 'relationship') {
          if (!profile.lookingForRelationship) {
            return false;
          }
        } else if (filters.relationshipIntent === 'friendship') {
          if (!profile.lookingForFriendship) {
            return false;
          }
        } else if (filters.relationshipIntent === 'both') {
          // Show all profiles regardless of their relationship preference
        }
              } else {
          // No filter selected - use user's profile settings as default
          const userWantsRelationship = user?.lookingForRelationship || false;
          const userWantsFriendship = user?.lookingForFriendship || false;
          
          if (userWantsRelationship && !userWantsFriendship) {
            // User only wants relationships - show only people looking for relationships
            if (!profile.lookingForRelationship) {
              return false;
            }
          } else if (userWantsFriendship && !userWantsRelationship) {
            // User only wants friendship - show only people looking for friendship
            if (!profile.lookingForFriendship) {
              return false;
            }
          } else if (userWantsRelationship && userWantsFriendship) {
            // User wants both - show people looking for either
            if (!profile.lookingForRelationship && !profile.lookingForFriendship) {
              return false;
            }
          } else {
            // User wants neither - show no one
            return false;
          }
        }

      // Check mutual attraction based on gender identity and orientation
      // Only apply attraction filter if both parties are looking for relationships
      const userWantsRelationship = user?.lookingForRelationship || false;
      const profileWantsRelationship = profile.lookingForRelationship || false;
      
      if (userWantsRelationship && profileWantsRelationship && user?.genderIdentity && user?.orientation && profile.genderIdentity && profile.orientation) {
        const userAttractionPrefs = getAttractionPreferences(user.genderIdentity, user.orientation);
        const profileAttractionPrefs = getAttractionPreferences(profile.genderIdentity, profile.orientation);
        
        // Check if user is attracted to this profile's gender
        const isUserAttractedToProfile = userAttractionPrefs.includes('all-genders') || 
          (profile.genderIdentity === 'female' && userAttractionPrefs.includes('women')) ||
          (profile.genderIdentity === 'male' && userAttractionPrefs.includes('men')) ||
          (profile.genderIdentity === 'non-binary' && userAttractionPrefs.includes('non-binary'));

        // Check if profile is attracted to user's gender
        const isProfileAttractedToUser = profileAttractionPrefs.includes('all-genders') || 
          (user.genderIdentity === 'female' && profileAttractionPrefs.includes('women')) ||
          (user.genderIdentity === 'male' && profileAttractionPrefs.includes('men')) ||
          (user.genderIdentity === 'non-binary' && profileAttractionPrefs.includes('non-binary'));

        // Both sides must be attracted to each other (or have empty preferences for asexual users)
        if (userAttractionPrefs.length > 0 && profileAttractionPrefs.length > 0) {
          if (!isUserAttractedToProfile || !isProfileAttractedToUser) {
            return false;
          }
        }
      }

      // Check age filter
      if (!filters.anyAge) {
        const age = profile.age;
        const [minAge, maxAge] = filters.ageRange;
        if (age < minAge || age > maxAge) {
          return false;
        }
      }

      // Check distance filter
      if (!filters.anyDistance) {
        if (profile.distance > filters.distance) {
          return false;
        }
      }

      // Check online only filter
      if (filters.onlineOnly && !profile.isOnline) {
        return false;
      }

      // Check interests filter (multiple selection)
      if (filters.interests.length > 0) {
        const hasMatchingInterest = filters.interests.some(filterInterest =>
          profile.interests.some(profileInterest => 
            profileInterest.toLowerCase().includes(filterInterest.toLowerCase())
          )
        );
        if (!hasMatchingInterest) {
          return false;
        }
      }

      // Check other filters
      if (filters.languageLevel !== 'all') {
        const profileLevel = profile.languageLevel;
        if (filters.languageLevel === 'beginner' && !['A1', 'A2'].includes(profileLevel)) {
          return false;
        }
        if (filters.languageLevel === 'intermediate' && !['B1', 'B2'].includes(profileLevel)) {
          return false;
        }
        if (filters.languageLevel === 'advanced' && !['C1', 'C2'].includes(profileLevel)) {
          return false;
        }
      }

      if (filters.chatStyle !== 'all' && profile.chatStyle !== filters.chatStyle) {
        return false;
      }

      return true;
    });
  }, [profiles, filters, user?.lookingForRelationship]);

  const currentProfile = filteredProfiles[currentProfileIndex];

  // Update card stack when filtered profiles change - Optimized
  useEffect(() => {
    if (currentProfileIndex >= filteredProfiles.length) {
      // We're beyond the available profiles - show empty stack
      setCardStack([]);
    } else {
      // Only load 2 cards at a time for better performance
      const nextProfiles = filteredProfiles.slice(currentProfileIndex, currentProfileIndex + 2);
      setCardStack(nextProfiles);
    }
  }, [currentProfileIndex, filteredProfiles]);

  const handleLike = () => {
    if (!currentProfile || isCardAnimating) return;
    
    setIsCardAnimating(true);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
    
    // Add haptic feedback class for visual feedback
    const button = document.querySelector('.like-button');
    if (button) {
      button.classList.add('haptic-feedback');
      setTimeout(() => button.classList.remove('haptic-feedback'), 100);
    }
    
    // Add to matches automatically
    setMatches(prev => [...prev, currentProfile]);
    
    // Show match animation
    setMatchAnimation(true);
    
    setTimeout(() => {
      toast({
        title: "It's a match! 💚",
        description: `You and ${currentProfile.name} liked each other!`,
        duration: 3000,
      });
      setMatchAnimation(false);
      handleNextProfile();
      setIsCardAnimating(false);
    }, 1500);
  };

  const handleSwipeProgress = useCallback((progress: number, direction: 'left' | 'right') => {
    // Use refs to avoid unnecessary re-renders during swipe
    swipeProgressRef.current = progress;
    swipeDirectionRef.current = direction;
    
    // Only update state if there's a significant change to reduce re-renders
    if (Math.abs(progress - swipeProgress) > 0.05 || swipeDirection !== direction) {
      setSwipeProgress(progress);
      setSwipeDirection(direction);
    }
  }, [swipeProgress, swipeDirection]);

  const handleSwipeEnd = useCallback(() => {
    // Reset progress when swipe ends
    setSwipeProgress(0);
    setSwipeDirection(null);
    swipeProgressRef.current = 0;
    swipeDirectionRef.current = null;
  }, []);

  const handleDislike = () => {
    if (!currentProfile || isCardAnimating) return;
    
    setIsCardAnimating(true);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    // Add haptic feedback class for visual feedback
    const button = document.querySelector('.dislike-button');
    if (button) {
      button.classList.add('haptic-feedback');
      setTimeout(() => button.classList.remove('haptic-feedback'), 100);
    }
    
    setTimeout(() => {
      handleNextProfile();
      setIsCardAnimating(false);
    }, 300);
  };

  const handleSuperLike = () => {
    if (!currentProfile || isCardAnimating) return;
    
    setIsCardAnimating(true);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    
    toast({
      title: "Super Liked! ⭐",
      description: `${currentProfile.name} will be notified of your super like!`,
      duration: 2000,
    });
    
    setTimeout(() => {
      handleNextProfile();
      setIsCardAnimating(false);
    }, 300);
  };

  const handleSayHi = () => {
    if (!currentProfile) return;
    
    if (selectedIceBreaker || customMessage) {
      toast({
        title: "Message sent! 💬",
        description: `Your message has been sent to ${currentProfile.name}`,
      });
      navigate(`/private-chat/${currentProfile.id}`);
    } else {
      setShowIceBreakers(true);
    }
  };

  const handleNextProfile = () => {
    if (currentProfileIndex < filteredProfiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
      setCurrentPhotoIndex(0);
      setShowIceBreakers(false);
      setSelectedIceBreaker('');
      setCustomMessage('');
          } else {
        // We're at the last profile - set index beyond the array to trigger "no profiles" state
        setCurrentProfileIndex(filteredProfiles.length);
        setCurrentPhotoIndex(0);
        setShowIceBreakers(false);
        setSelectedIceBreaker('');
        setCustomMessage('');
      }
  };

  const handleRelationshipFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, relationshipIntent: value }));
    setCurrentProfileIndex(0);
  };

  const getChatStyleColor = (style: string) => {
    switch (style) {
      case 'introvert': return 'bg-blue-100 text-blue-800';
      case 'ambievert': return 'bg-green-100 text-green-800';
      case 'extrovert': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetFilters = () => {
    setFilters({
      interests: [],
      languageLevel: 'all',
      chatStyle: 'all',
      relationshipIntent: 'all',
      ageRange: [18, 100],
      anyAge: true,
      distance: 50,
      anyDistance: true,
      onlineOnly: false
    });
    setCurrentProfileIndex(0);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'ageRange') {
      // Age range is active if anyAge is false
      return !filters.anyAge;
    }
    if (key === 'anyAge') {
      // Don't count anyAge itself as a filter
      return false;
    }
    if (key === 'distance') {
      // Distance is active if anyDistance is false
      return !filters.anyDistance;
    }
    if (key === 'anyDistance') {
      // Don't count anyDistance itself as a filter
      return false;
    }
    // Standard logic for other filters
    return value !== 'all' && value !== false && (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  const handlePhotoChange = (direction: 'next' | 'prev') => {
    if (!currentProfile) return;
    
    // Haptic feedback for photo navigation
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
    
    if (direction === 'next') {
      setCurrentPhotoIndex(prev => 
        prev < currentProfile.photos.length - 1 ? prev + 1 : 0
      );
    } else {
      setCurrentPhotoIndex(prev => 
        prev > 0 ? prev - 1 : currentProfile.photos.length - 1
      );
    }
  };

  const handlePhotoTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentProfile || currentProfile.photos.length <= 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const width = rect.width;
    
    // Tap on right side = next photo, left side = previous photo
    if (tapX > width / 2) {
      handlePhotoChange('next');
    } else {
      handlePhotoChange('prev');
    }
  };

  const handlePhotoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://picsum.photos/400/400?random=999';
  };

  // Profile Card Content Component
  const ProfileCardContent = ({ 
    profile, 
    currentPhotoIndex, 
    onPhotoTap, 
    onPhotoChange, 
    onPhotoError,
    getChatStyleColor,
    navigate,
    isPreview = false 
  }: {
    profile: Profile;
    currentPhotoIndex: number;
    onPhotoTap: (e: React.MouseEvent<HTMLDivElement>) => void;
    onPhotoChange: (direction: 'next' | 'prev') => void;
    onPhotoError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    getChatStyleColor: (style: string) => string;
    navigate: (path: string) => void;
    isPreview?: boolean;
  }) => (
    <>
      {/* Photo Gallery */}
      <div 
        className="relative h-80 bg-gradient-to-br from-muted/50 to-muted cursor-pointer overflow-hidden"
        onClick={onPhotoTap}
      >
        <img 
          src={profile.photos[currentPhotoIndex]} 
          alt={profile.name}
          className="w-full h-full object-cover transition-opacity duration-300 ease-out"
          onError={onPhotoError}
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Photo Navigation Dots - Optimized */}
        {profile.photos.length > 1 && !isPreview && (
          <div className="absolute top-4 left-4 flex gap-2 z-30">
            {profile.photos.map((_, index) => (
              <div
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${
                  index === currentPhotoIndex 
                    ? 'bg-white shadow-lg scale-110' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Profile Info Button */}
        {!isPreview && (
          <Button
            variant="glass"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              navigate(`/profile/${profile.id}`);
            }}
            className="absolute top-4 right-4 h-9 px-3 text-white hover:scale-110 transition-spring backdrop-blur-md z-30 border-white/20"
          >
            <UserCheck size={16} className="mr-1.5" />
            <span className="text-sm font-medium">Info</span>
          </Button>
        )}

        {/* Tap zones for photo navigation */}
        {profile.photos.length > 1 && !isPreview && (
          <>
            <div className="absolute left-0 top-0 w-1/2 h-full z-10" />
            <div className="absolute right-0 top-0 w-1/2 h-full z-20" />
          </>
        )}

        {/* Enhanced Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold drop-shadow-lg">{profile.name}</h2>
              <span className="text-lg font-semibold text-white/90">{profile.age}</span>
              {profile.isVerified && (
                <div className="flex items-center justify-center w-6 h-6 bg-blue-500/80 backdrop-blur-sm rounded-full">
                  <Shield size={14} className="text-white" />
                </div>
              )}
            </div>
            {profile.isOnline && (
              <div className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur-sm px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold">Online</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 text-sm mb-3 text-white/90">
            <MapPin size={16} className="text-white/80" />
            <span className="font-medium">{profile.location.split(',')[0]}</span>
            <span className="text-white/60">•</span>
            <span className="text-white/80">{profile.distance}km away</span>
          </div>

          {/* Enhanced badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge className="bg-white/25 backdrop-blur-md text-white text-sm border-white/30 h-7 px-3 font-medium">
              {profile.languageLevel}
            </Badge>
            <Badge className="bg-white/25 backdrop-blur-md text-white text-sm border-white/30 h-7 px-3 font-medium">
              {profile.sharedInterests} shared
            </Badge>
            {profile.lookingForRelationship && (
              <Badge className="bg-white/25 backdrop-blur-md text-white text-sm border-white/30 h-7 px-3 font-medium">
                💕 Relationship
              </Badge>
            )}
            {profile.lookingForFriendship && (
              <Badge className="bg-white/25 backdrop-blur-md text-white text-sm border-white/30 h-7 px-3 font-medium">
                🤝 Friendship
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced bottom content - only for main card */}
      {!isPreview && (
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 font-medium">
            {profile.bio}
          </p>
          
          {/* Enhanced interests display */}
          <div className="flex items-center gap-2">
            {profile.interests.slice(0, 3).map(interest => (
              <Badge key={interest} variant="secondary" className="text-xs h-7 px-3 rounded-full font-medium bg-muted/50">
                {interest}
              </Badge>
            ))}
            {profile.interests.length > 3 && (
              <span className="text-xs text-muted-foreground font-medium">
                +{profile.interests.length - 3} more
              </span>
            )}
          </div>
        </CardContent>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Background Elements - Optimized for mobile performance */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-8 w-24 h-24 bg-gradient-accent rounded-full blur-2xl" />
        <div className="absolute bottom-40 right-10 w-16 h-16 bg-gradient-secondary rounded-full blur-xl" />
        <div className="absolute top-1/3 right-16 w-12 h-12 bg-gradient-primary rounded-full blur-lg" />
      </div>

      <TopBar 
        title="Discover" 
        rightAction={
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFiltersExpanded(true)}
              className="hover:scale-110 transition-spring hover:bg-primary/10 relative"
            >
              <Filter size={20} className="hover:text-primary transition-smooth" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-accent rounded-full animate-pulse shadow-glow-accent/30 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">{activeFiltersCount}</span>
                </span>
              )}
            </Button>
          </div>
        }
      />
      
      {/* Header Section */}
      <div className="py-5 relative z-10">
        <div className="max-w-md mx-auto px-5">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold gradient-text-hero mb-1">Discover</h1>
              <p className="text-sm text-muted-foreground font-medium">Find your perfect conversation partner</p>
            </div>
            <Button
              variant="glass"
              size="lg"
              onClick={() => navigate('/matches')}
              className="shadow-glow-accent/20 hover:scale-110 transition-spring animate-slide-up h-11 px-4"
              style={{ animationDelay: '0.2s' }}
            >
              <Users size={18} className="mr-2" />
              <span className="font-semibold text-sm">Matches</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3 max-w-md mx-auto space-y-4 relative z-10 pb-32">
        {/* No Matches Message - With Filters Active */}
        {(filteredProfiles.length === 0 || currentProfileIndex >= filteredProfiles.length) && activeFiltersCount > 0 && (
          <Card className="shadow-medium rounded-2xl bg-gradient-to-br from-muted/50 to-muted">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-6 animate-pulse">🔍</div>
              <h3 className="font-bold mb-3 text-lg gradient-text-hero">No matches found</h3>
              <p className="text-sm text-muted-foreground mb-6 font-medium">
                Try adjusting your filters or check back later for new profiles.
              </p>
              <Button 
                variant="gradient" 
                onClick={() => setFiltersExpanded(true)}
                className="shadow-glow-primary"
              >
                Modify Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* All Caught Up Message - No Filters Active */}
        {(filteredProfiles.length === 0 || currentProfileIndex >= filteredProfiles.length) && activeFiltersCount === 0 && (
          <Card className="shadow-medium rounded-2xl bg-gradient-to-br from-muted/50 to-muted">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-6 animate-bounce">🎉</div>
              <h3 className="text-xl font-bold mb-3 gradient-text-hero">You're all caught up!</h3>
              <p className="text-muted-foreground mb-6 text-sm">Check back later for new profiles</p>
              <Button 
                onClick={() => setCurrentProfileIndex(0)} 
                variant="gradient"
                className="shadow-glow-primary"
              >
                <RotateCcw size={16} className="mr-2" />
                Start Over
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Card Stack - Optimized for mobile performance */}
        <div className="relative h-[520px] max-w-sm mx-auto mb-6">
          {cardStack.slice(0, 2).map((profile, stackIndex) => {
            const isCurrentCard = stackIndex === 0;
            const zIndex = 2 - stackIndex;
            const scale = 1 - (stackIndex * 0.05);
            const translateY = stackIndex * 8;
            const opacity = 1 - (stackIndex * 0.3);
            
            return (
              <div
                key={`${profile.id}-${stackIndex}`}
                className="absolute inset-0 transition-transform duration-300 ease-out"
                style={{
                  zIndex,
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  opacity: opacity > 0.2 ? opacity : 0.2
                }}
              >
                {isCurrentCard ? (
                  <SwipeableCard
                    leftAction={{
                      icon: X,
                      color: '#dc2626',
                      action: handleDislike
                    }}
                    rightAction={{
                      icon: Heart,
                      color: '#16a34a',
                      action: handleLike
                    }}
                    className="h-full border-0 overflow-hidden rounded-2xl [&>div]:border-0"
                    disabled={isCardAnimating}
                    onSwipeProgress={handleSwipeProgress}
                    onSwipeEnd={handleSwipeEnd}
                  >
                    <ProfileCardContent 
                      profile={profile} 
                      currentPhotoIndex={currentPhotoIndex}
                      onPhotoTap={handlePhotoTap}
                      onPhotoChange={handlePhotoChange}
                      onPhotoError={handlePhotoError}
                      getChatStyleColor={getChatStyleColor}
                      navigate={navigate}
                    />
                  </SwipeableCard>
                ) : (
                  <Card className="h-full shadow-lg border-0 overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40 rounded-2xl">
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-muted/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <Users size={20} className="text-muted-foreground/50" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-3 bg-muted/30 rounded w-20 mx-auto"></div>
                          <div className="h-2.5 bg-muted/20 rounded w-24 mx-auto"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Action Buttons - Optimized for performance */}
        {currentProfile && (
          <div className="fixed bottom-28 left-0 right-0 z-20 pt-2 pb-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent pointer-events-none"></div>
            <div className="relative flex justify-center items-center gap-3 px-6">
              {/* Pass Button */}
              <div className="relative">
                <Button
                  variant="glass"
                  size="icon-lg"
                  onClick={handleDislike}
                  disabled={isCardAnimating}
                  className="h-14 w-14 border-2 border-red-500/30 text-red-500 hover:border-red-500 hover:shadow-glow-destructive/30 interactive-scale disabled:opacity-50 disabled:scale-100 relative overflow-hidden dislike-button"
                >
                  <X size={20} className="relative z-10" />
                  {/* Fill animation for dislike - optimized */}
                  <div 
                    className="absolute inset-0 bg-red-500 transition-transform duration-200 ease-out"
                    style={{
                      transform: swipeDirection === 'left' && swipeProgress > 0.1 ? `scaleX(${swipeProgress})` : 'scaleX(0)',
                      transformOrigin: 'left center'
                    }}
                  />
                </Button>
              </div>
              
              {/* Super Like Button */}
              <Button
                variant="glass"
                size="icon-lg"
                onClick={handleSuperLike}
                disabled={isCardAnimating}
                className="h-12 w-12 border-2 border-blue-400/30 text-blue-400 hover:border-blue-400 hover:shadow-glow-blue/30 interactive-scale disabled:opacity-50 disabled:scale-100 relative overflow-hidden"
              >
                <Star size={18} className="relative z-10" />
              </Button>
              
              {/* Message Button */}
              <Button
                variant="gradient"
                size="icon-lg"
                onClick={handleSayHi}
                disabled={isCardAnimating}
                className="h-16 w-16 shadow-glow-primary hover:scale-110 transition-spring relative overflow-hidden group disabled:opacity-50 disabled:scale-100"
              >
                <MessageCircle size={22} className="group-hover:scale-110 transition-spring relative z-10" />
              </Button>
              
              {/* AI Assist Button */}
              <Button
                variant="glass"
                size="icon-lg"
                onClick={() => setShowConversationStarters(true)}
                disabled={isCardAnimating}
                className="h-12 w-12 border-2 border-purple-400/30 text-purple-400 hover:border-purple-400 hover:shadow-glow-purple/30 interactive-scale disabled:opacity-50 disabled:scale-100 relative overflow-hidden"
              >
                <Zap size={18} className="relative z-10" />
              </Button>
              
              {/* Like Button */}
              <div className="relative">
                <Button
                  variant="glass"
                  size="icon-lg"
                  onClick={handleLike}
                  disabled={isCardAnimating}
                  className="h-14 w-14 border-2 border-green-500/30 text-green-500 hover:border-green-500 hover:shadow-glow-green/30 interactive-scale disabled:opacity-50 disabled:scale-100 relative overflow-hidden like-button"
                >
                  <Heart size={20} className="relative z-10" />
                  {/* Fill animation for like - optimized */}
                  <div 
                    className="absolute inset-0 bg-green-500 transition-transform duration-200 ease-out"
                    style={{
                      transform: swipeDirection === 'right' && swipeProgress > 0.1 ? `scaleX(${swipeProgress})` : 'scaleX(0)',
                      transformOrigin: 'right center'
                    }}
                  />
                </Button>
              </div>
            </div>
          </div>
        )}


      </div>

      {/* Match Celebration Animation */}
      {matchAnimation && (
        <div className="fixed inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in">
          <div className="text-center animate-scale-in">
            <div className="text-8xl mb-6 animate-bounce">💚</div>
            <h2 className="text-4xl font-bold gradient-text-hero mb-4">It's a Match!</h2>
            <p className="text-lg text-muted-foreground mb-6">You and {currentProfile?.name} liked each other</p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => setMatchAnimation(false)}
                className="bg-background/80 backdrop-blur-sm"
              >
                Keep Swiping
              </Button>
              <Button
                variant="gradient"
                onClick={() => {
                  setMatchAnimation(false);
                  if (currentProfile) {
                    navigate(`/private-chat/${currentProfile.id}`);
                  }
                }}
                className="shadow-glow-primary"
              >
                Send Message
              </Button>
            </div>
          </div>
          
          {/* Floating Hearts Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float text-2xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                {['💕', '💖', '💗', '💓', '💝'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ice Breakers Modal */}
      {showIceBreakers && currentProfile && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9998]" 
          onClick={(e) => {
            // Close modal if clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowIceBreakers(false);
              setSelectedIceBreaker('');
              setCustomMessage('');
            }
          }}
        >
          <Card 
            ref={iceBreakerModalRef}
            className="w-[calc(100vw-2rem)] max-w-sm mx-auto max-h-[85vh] overflow-hidden rounded-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Choose an Ice Breaker</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowIceBreakers(false);
                    setSelectedIceBreaker('');
                    setCustomMessage('');
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>
            <div className="max-h-[calc(85vh-120px)] overflow-y-auto">
              <CardContent className="p-4 pb-6">
                <div className="space-y-3">
                  {iceBreakers.map((iceBreaker, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-3 whitespace-normal break-words hover:bg-primary/5 active:bg-primary/10 transition-colors"
                      onClick={() => {
                        setSelectedIceBreaker(iceBreaker);
                        setCustomMessage(iceBreaker);
                      }}
                    >
                      {iceBreaker}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-destructive/5 active:bg-destructive/10"
                    onClick={() => {
                      setShowIceBreakers(false);
                      setSelectedIceBreaker('');
                      setCustomMessage('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 hover:bg-primary/90 active:bg-primary"
                    onClick={() => {
                      if (selectedIceBreaker) {
                        handleSayHi();
                        setShowIceBreakers(false);
                        setSelectedIceBreaker('');
                        setCustomMessage('');
                      }
                    }}
                    disabled={!selectedIceBreaker}
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      )}

      {/* Smart Conversation Starters Modal */}
      {showConversationStarters && currentProfile && (
        <div 
          className="fixed inset-0 bg-black/80 z-[9998] flex items-center justify-center p-4" 
          onClick={(e) => {
            // Close modal if clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowConversationStarters(false);
            }
          }}
        >
          <div 
            ref={conversationStartersModalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-[calc(100vw-2rem)] max-w-sm max-h-[90vh] overflow-y-auto">
              <SmartConversationStarters
                profile={currentProfile}
                onSelectStarter={(starter) => {
                  setCustomMessage(starter);
                  setShowConversationStarters(false);
                  handleSayHi();
                }}
                onClose={() => setShowConversationStarters(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {filtersExpanded && (
        <div 
          className="fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center p-4"
          onClick={(e) => {
            // Close modal if clicking on backdrop, but not if any select is open
            if (e.target === e.currentTarget && !anySelectOpen) {
              setFiltersExpanded(false);
            }
          }}
        >
          <Card 
            ref={filtersModalRef}
            className="w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary/10 flex items-center justify-center">
                    <Filter size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Smart Filters</h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFiltersExpanded(false)}
                  className="hover:scale-110 transition-spring"
                >
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
            
            <div className="max-h-[calc(85vh-120px)] overflow-y-auto">
              <CardContent className="p-6 space-y-6">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant={filters.onlineOnly ? 'gradient' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, onlineOnly: !prev.onlineOnly }));
                      setCurrentProfileIndex(0);
                    }}
                    className="flex-1 h-10 rounded-full"
                  >
                    🟢 {filters.onlineOnly ? 'Online Only' : 'All Users'}
                  </Button>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="px-4 h-10 rounded-full"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Age and Distance */}
                <div className="space-y-6">
                  {/* Age Range Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-foreground">
                        Age Range: {filters.anyAge ? 'Any age' : `${filters.ageRange[0]} - ${filters.ageRange[1]} years`}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Any age</span>
                        <Switch
                          checked={filters.anyAge}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({ ...prev, anyAge: checked }));
                            setCurrentProfileIndex(0);
                          }}
                        />
                      </div>
                    </div>
                    {!filters.anyAge && (
                      <div className="px-2">
                        <Slider
                          value={filters.ageRange}
                          onValueChange={(value) => {
                            setFilters(prev => ({ ...prev, ageRange: value as [number, number] }));
                            setCurrentProfileIndex(0);
                          }}
                          min={18}
                          max={100}
                          step={1}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>18</span>
                          <span>100</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Distance Filter */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-foreground">
                        Distance: {filters.anyDistance ? 'Any distance' : `Within ${filters.distance} km`}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Any distance</span>
                        <Switch
                          checked={filters.anyDistance}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({ ...prev, anyDistance: checked }));
                            setCurrentProfileIndex(0);
                          }}
                        />
                      </div>
                    </div>
                    {!filters.anyDistance && (
                      <div className="px-2">
                        <Slider
                          value={[filters.distance]}
                          onValueChange={(value) => {
                            setFilters(prev => ({ ...prev, distance: value[0] }));
                            setCurrentProfileIndex(0);
                          }}
                          min={1}
                          max={300}
                          step={1}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1 km</span>
                          <span>300 km</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Language and Personality */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Language Level</label>
                    <Select 
                      value={filters.languageLevel} 
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, languageLevel: value }));
                        setCurrentProfileIndex(0);
                      }}
                      onOpenChange={(open) => setOpenSelects(prev => ({ ...prev, languageLevel: open }))}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <Portal>
                        <SelectContent className="z-[999999]">
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="beginner">Beginner (A1-A2)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (B1-B2)</SelectItem>
                          <SelectItem value="advanced">Advanced (C1-C2)</SelectItem>
                        </SelectContent>
                      </Portal>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Personality</label>
                    <Select 
                      value={filters.chatStyle} 
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, chatStyle: value }));
                        setCurrentProfileIndex(0);
                      }}
                      onOpenChange={(open) => setOpenSelects(prev => ({ ...prev, chatStyle: open }))}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <Portal>
                        <SelectContent className="z-[999999]">
                          <SelectItem value="all">All Styles</SelectItem>
                          <SelectItem value="introvert">Introvert</SelectItem>
                          <SelectItem value="ambievert">Ambievert</SelectItem>
                          <SelectItem value="extrovert">Extrovert</SelectItem>
                        </SelectContent>
                      </Portal>
                    </Select>
                  </div>
                </div>

                {/* Relationship Intent */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
                    Looking for
                    <Info size={14} className="text-muted-foreground" />
                  </label>
                  <Select 
                    value={filters.relationshipIntent} 
                    onValueChange={handleRelationshipFilterChange}
                    onOpenChange={(open) => setOpenSelects(prev => ({ ...prev, relationshipIntent: open }))}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <Portal>
                      <SelectContent className="z-[999999]">
                        <SelectItem value="all">Both</SelectItem>
                        <SelectItem value="friendship">Friendship</SelectItem>
                        <SelectItem value="relationship">Relationship</SelectItem>
                      </SelectContent>
                    </Portal>
                  </Select>
                </div>

                {/* Interests */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Interests</label>
                  <Select 
                    name="interestFilter"
                    value={filters.interests[0] || 'all'} 
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setFilters(prev => ({ ...prev, interests: [] }));
                      } else {
                        setFilters(prev => ({ 
                          ...prev, 
                          interests: prev.interests.includes(value) 
                            ? prev.interests.filter(i => i !== value)
                            : [...prev.interests, value]
                        }));
                      }
                      setCurrentProfileIndex(0);
                    }}
                    onOpenChange={(open) => setOpenSelects(prev => ({ ...prev, interests: open }))}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Add interests" />
                    </SelectTrigger>
                    <Portal>
                      <SelectContent className="z-[999999]">
                        <SelectItem value="all">All Interests</SelectItem>
                        <SelectItem value="Philosophy">Philosophy</SelectItem>
                        <SelectItem value="Books">Books</SelectItem>
                        <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Fitness">Fitness</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Gaming">Gaming</SelectItem>
                        <SelectItem value="Cooking">Cooking</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                      </SelectContent>
                    </Portal>
                  </Select>
                  {filters.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {filters.interests.map(interest => (
                        <Badge key={interest} variant="secondary" className="text-sm h-8 px-3 rounded-full">
                          {interest}
                          <button
                            onClick={() => {
                              setFilters(prev => ({
                                ...prev,
                                interests: prev.interests.filter(i => i !== interest)
                              }));
                              setCurrentProfileIndex(0);
                            }}
                            className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Match;
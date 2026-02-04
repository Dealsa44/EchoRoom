import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
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
import { Heart, MessageCircle, X, Filter, MapPin, Info, ChevronDown, ChevronUp, Star, Shield, Lightbulb, Sparkles, RotateCcw, Zap, UserCheck, User, Check } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import SmartConversationStarters from '@/components/chat/SmartConversationStarters';
import { useApp } from '@/hooks/useApp';
import { getAttractionPreferences } from '@/contexts/app-utils';
import { toast } from '@/hooks/use-toast';
import { Profile, MatchProfile } from '@/types';
import { userApi } from '@/services/api';

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

  const [realUsers, setRealUsers] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch discover feed (real users) using current relationship filter
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const intent = filters.relationshipIntent;
        const res = await userApi.getDiscover(intent);
        if (cancelled) return;
        if (res.success && res.users && res.users.length > 0) {
          const withPlaceholderPhotos = res.users.map((u) => ({
            ...u,
            id: u.id as string,
            photos: Array.isArray(u.photos) && u.photos.length > 0 ? u.photos : ['https://picsum.photos/400/400?random=user'],
            lookingForRelationship: u.lookingForRelationship ?? false,
            lookingForFriendship: u.lookingForFriendship ?? false,
          })) as MatchProfile[];
          setRealUsers(withPlaceholderPhotos);
        } else {
          setRealUsers([]);
        }
      } catch (_) {
        setRealUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [filters.relationshipIntent]);

  const profiles: MatchProfile[] = useMemo(() => realUsers, [realUsers]);

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
        const profileAttractionPrefs = getAttractionPreferences(profile.genderIdentity as any, profile.orientation as any);
        
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
  }, [profiles, filters, user?.lookingForRelationship, user?.genderIdentity, user?.lookingForFriendship, user?.orientation]);

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

  // Preload next profile images for smoother swipes
  useEffect(() => {
    const nextProfile = filteredProfiles[currentProfileIndex + 1];
    if (nextProfile && Array.isArray(nextProfile.photos)) {
      nextProfile.photos.slice(0, 2).forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [filteredProfiles, currentProfileIndex]);

  const handleLike = () => {
    if (!currentProfile || isCardAnimating) return;
    
    setIsCardAnimating(true);
    
    // Simple haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Add to matches automatically
    setMatches(prev => [...prev, currentProfile]);
    
    // Show match animation
    setMatchAnimation(true);
    
    // Reset card animation state after a short delay
    setTimeout(() => {
      setIsCardAnimating(false);
    }, 300);
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
    
    // Super liked - toast removed per user request
    
    setTimeout(() => {
      handleNextProfile();
      setIsCardAnimating(false);
    }, 300);
  };

  const handleSayHi = () => {
    if (!currentProfile) return;
    
    if (selectedIceBreaker || customMessage) {
      // Message sent - toast removed per user request
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

  
  // moved outside component scope and memoized below for fewer re-renders
  // see bottom of file for implementation

  return (
    <div className="h-screen bg-background relative overflow-hidden">
      {/* Simplified background for performance (mobile-first) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[480px] h-[240px] rounded-full bg-gradient-hero opacity-[0.08] blur-3xl" />
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
      
      {/* Empty States - Full screen with fixed header */}
      {(filteredProfiles.length === 0 || currentProfileIndex >= filteredProfiles.length) && activeFiltersCount > 0 && (
        <>
          <div className="flex flex-col items-center justify-center px-4 h-screen content-safe-top">
            <Card className="shadow-medium rounded-2xl bg-gradient-to-br from-muted/50 to-muted w-full max-w-sm">
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
          </div>
        </>
      )}

      {(filteredProfiles.length === 0 || currentProfileIndex >= filteredProfiles.length) && activeFiltersCount === 0 && (
        <>
          <div className="flex flex-col items-center justify-center px-4 h-screen content-safe-top">
            <Card className="shadow-medium rounded-2xl bg-gradient-to-br from-muted/50 to-muted w-full max-w-sm">
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
          </div>
        </>
      )}

      {/* Loading State */}
      {loading && (
        <div className="px-4 sm:px-5 w-full max-w-sm mx-auto relative z-10 match-page-container overflow-hidden content-safe-top pb-32">
          <div className="space-y-4 pb-20">
            {/* Loading skeleton for profile card */}
            <div className="relative h-[480px] w-full max-w-sm mx-auto mb-6">
              <div className="w-full h-full bg-muted/50 rounded-2xl animate-pulse overflow-hidden">
                {/* Photo skeleton */}
                <div className="w-full h-full bg-gradient-to-br from-muted/70 to-muted/50"></div>
                
                {/* Gradient overlay skeleton */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                {/* Photo indicators skeleton */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                  <div className="h-1.5 w-8 bg-white/90 rounded-full"></div>
                  <div className="h-1.5 w-8 bg-white/40 rounded-full"></div>
                  <div className="h-1.5 w-8 bg-white/40 rounded-full"></div>
                </div>
                
                {/* Info button skeleton */}
                <div className="absolute top-4 right-4 h-9 w-20 bg-white/20 rounded-lg"></div>
                
                {/* Profile info skeleton at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white z-20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-6 bg-white/20 rounded w-24"></div>
                      <div className="h-5 bg-white/20 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-white/20 rounded w-20"></div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="h-5 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="h-8 bg-white/20 rounded-full w-20"></div>
                    <div className="h-8 bg-white/20 rounded-full w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Normal Content - Header scrollable inside */}
      {!loading && !(filteredProfiles.length === 0 || currentProfileIndex >= filteredProfiles.length) && (
        <div className="px-4 sm:px-5 w-full max-w-sm mx-auto relative z-10 match-page-container overflow-hidden content-safe-top pb-32">

          <div className="space-y-4 pb-20">

        {/* Card Stack - optimized to render only top + preview */}
        <div className="relative h-[480px] w-full max-w-sm mx-auto mb-6 will-change-transform match-card-stack">
          {cardStack.slice(0, 2).map((profile, stackIndex) => {
            const isCurrentCard = stackIndex === 0;
            const zIndex = 2 - stackIndex;
            const scale = 1 - (stackIndex * 0.05);
            const translateY = stackIndex * 8;
            const opacity = 1 - (stackIndex * 0.3);
            
            return (
              <div
                key={`${profile.id}-${stackIndex}`}
                className="absolute inset-0 transition-transform duration-300 ease-out card-stack-item"
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
                    {/* Swipe labels removed per user request */}
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
                  <Card className="h-full shadow-lg border-0 overflow-hidden bg-card/60 rounded-2xl">
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-muted/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <User size={20} className="text-muted-foreground/50" />
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
          <div className="fixed bottom-0 left-0 right-0 z-20 pt-6 pb-28">
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent pointer-events-none"></div>
            <div className="relative flex justify-center items-center gap-3 sm:gap-4 px-4 sm:px-6 action-buttons-container">
              {/* Pass Button */}
              <div className="relative">
                <Button
                  variant="glass"
                  size="icon-lg"
                  onClick={handleDislike}
                  disabled={isCardAnimating}
                  className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-red-500/30 text-red-500 hover:border-red-500 hover:shadow-glow-destructive/30 interactive-scale disabled:opacity-50 disabled:scale-100 relative overflow-hidden dislike-button"
                >
                  <X size={20} className="relative z-10" />
                  {/* Fill animation for dislike - optimized */}
                  <div 
                    className="absolute inset-0 bg-red-500 action-button-fill"
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
                className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-blue-400/30 text-blue-400 hover:border-blue-400 hover:shadow-glow-blue/30 interactive-scale disabled:opacity-50 disabled:scale-100 relative overflow-hidden"
              >
                <Star size={18} className="relative z-10" />
              </Button>
              
              {/* Message Button */}
              <Button
                variant="gradient"
                size="icon-lg"
                onClick={handleSayHi}
                disabled={isCardAnimating}
                className="h-16 w-16 sm:h-20 sm:w-20 shadow-glow-primary hover:scale-110 transition-spring relative overflow-hidden group disabled:opacity-50 disabled:scale-100"
              >
                <MessageCircle size={22} className="group-hover:scale-110 transition-spring relative z-10" />
              </Button>
              
              {/* AI Assist Button */}
              <Button
                variant="glass"
                size="icon-lg"
                onClick={() => setShowConversationStarters(true)}
                disabled={isCardAnimating}
                className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-purple-400/30 text-purple-400 hover:border-purple-400 hover:shadow-glow-purple/30 interactive-scale disabled:opacity-50 disabled:scale-100 relative overflow-hidden"
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
                  className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-green-500/30 text-green-500 hover:border-green-500 hover:shadow-glow-green/30 interactive-scale disabled:opacity-50 disabled:scale-100 relative overflow-hidden like-button"
                >
                  <Heart size={20} className="relative z-10" />
                  {/* Fill animation for like - optimized */}
                  <div 
                    className="absolute inset-0 bg-green-500 action-button-fill"
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
        </div>
      )}

      {/* Match Celebration Animation */}
      {matchAnimation && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in p-4"
          onClick={(e) => {
            // Close modal if clicking on backdrop
            if (e.target === e.currentTarget) {
              setMatchAnimation(false);
            }
          }}
        >
          <div className="bg-background rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <div className="text-4xl mb-4">💚</div>
            <h2 className="text-2xl font-bold mb-2">It's a Match!</h2>
            <p className="text-muted-foreground mb-6">You and {currentProfile?.name} liked each other</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setMatchAnimation(false);
                  handleNextProfile();
                }}
                className="flex-1"
              >
                Keep Swiping
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setMatchAnimation(false);
                  if (currentProfile) {
                    navigate(`/private-chat/${currentProfile.id}`);
                  }
                }}
                className="flex-1"
              >
                Send Message
              </Button>
            </div>
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

// Memoized Profile Card Content to avoid unnecessary re-renders
const ProfileCardContent = memo(({
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
}) => {
  return (
    <>
      <div
        className="relative h-80 bg-gradient-to-br from-muted/50 to-muted cursor-pointer overflow-hidden"
        onClick={(e) => {
          // Check if click is in Info button area
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;
          const rightEdge = rect.width - 100; // Info button area
          const topEdge = 50; // Info button area
          
          // If clicking in Info button area, don't handle photo tap
          if (clickX > rightEdge && clickY < topEdge) {
            return;
          }
          
          // Handle photo navigation directly here
          if (!profile || profile.photos.length <= 1) return;
          
          // Haptic feedback for photo navigation
          if ('vibrate' in navigator) {
            navigator.vibrate(20);
          }
          
          const width = rect.width;
          const tapX = clickX;
          
          // Tap on right side = next photo, left side = previous photo
          if (tapX > width / 2) {
            onPhotoChange('next');
          } else {
            onPhotoChange('prev');
          }
        }}
      >
        <img
          src={profile.photos[currentPhotoIndex]}
          alt={profile.name}
          className="w-full h-full object-cover transition-opacity duration-300 ease-out"
          onError={onPhotoError}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 100vw, 768px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {profile.photos.length > 1 && !isPreview && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
            {profile.photos.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 rounded-full transition-all duration-200 ${
                  index === currentPhotoIndex ? 'bg-white/90' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {!isPreview && (
          <Button
            variant="glass"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              navigate(`/profile/${profile.id}`);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
              navigate(`/profile/${profile.id}`);
            }}
            className="absolute top-4 right-4 h-9 px-3 hover:scale-110 transition-spring backdrop-blur-md z-[100] border-white/20 text-foreground dark:text-white touch-manipulation"
            style={{ 
              touchAction: 'manipulation',
              pointerEvents: 'auto',
              isolation: 'isolate'
            }}
          >
            <UserCheck size={16} className="mr-1.5" />
            <span className="text-sm font-medium">Info</span>
          </Button>
        )}

        {profile.photos.length > 1 && !isPreview && (
          <>
            <div className="absolute left-0 top-0 w-1/2 h-full z-10" />
            <div className="absolute right-0 top-0 w-1/2 h-full z-20" />
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white z-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold drop-shadow-lg">{profile.name}</h2>
              <span className="text-lg font-semibold text-white/90">{profile.age}</span>
              {profile.isVerified && (
                <div className="flex items-center justify-center w-6 h-6 bg-blue-500/80 backdrop-blur-sm rounded-full">
                  <Shield size={14} className="text-white" />
                </div>
              )}
              {/* Photo verification badge */}
              {profile.photos && profile.photos.length > 0 && (
                <div className="flex items-center justify-center w-6 h-6 bg-green-500/80 backdrop-blur-sm rounded-full">
                  <Check size={12} className="text-white" />
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

          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge className="bg-white/30 backdrop-blur-md text-white text-sm border-white/40 h-7 px-3 font-semibold shadow-soft">
              {profile.sharedInterests} shared
            </Badge>
            {profile.lookingForRelationship && (
              <Badge className="bg-white/30 backdrop-blur-md text-white text-sm border-white/40 h-7 px-3 font-semibold shadow-soft">
                💕 Relationship
              </Badge>
            )}
            {profile.lookingForFriendship && (
              <Badge className="bg-white/30 backdrop-blur-md text-white text-sm border-white/40 h-7 px-3 font-semibold shadow-soft">
                🤝 Friendship
              </Badge>
            )}
          </div>
        </div>
      </div>

      {!isPreview && (
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-medium">
            {profile.bio}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {profile.interests.slice(0, 3).map((interest, index) => {
              // Handle both string arrays (from mock data) and object arrays (from backend)
              const interestText = typeof interest === 'string' ? interest : interest.interest;
              const interestKey = typeof interest === 'string' ? interest : interest.id || index;
              
              return (
                <Badge
                  key={interestKey}
                  variant="outline"
                  className="text-xs h-7 px-3 rounded-full font-semibold bg-background/70 text-foreground border-border-soft"
                >
                  {interestText}
                </Badge>
              );
            })}
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
});
ProfileCardContent.displayName = 'ProfileCardContent';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ageRange: string;
  distance: string;
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
  const [filters, setFilters] = useState<Filters>({
    interests: [],
    languageLevel: 'all',
    chatStyle: 'all',
    relationshipIntent: 'all',
    ageRange: 'all',
    distance: 'all',
    onlineOnly: false
  });

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
      if (filtersExpanded && filtersModalRef.current && !filtersModalRef.current.contains(event.target as Node)) {
        setFiltersExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIceBreakers, showConversationStarters, filtersExpanded]);

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
          if (profile.lookingForRelationship) {
            return false;
          }
        } else if (filters.relationshipIntent === 'both') {
          // Show all profiles regardless of their relationship preference
        }
      } else {
        // No filter selected - use user's profile setting as default
        if (user?.lookingForRelationship) {
          // User wants relationships - show only people looking for relationships
          if (!profile.lookingForRelationship) {
            return false;
          }
        } else {
          // User wants friendship - show only people looking for friendship
          if (profile.lookingForRelationship) {
            return false;
          }
        }
      }

      // Check mutual attraction based on gender identity and orientation
      if (user?.genderIdentity && user?.orientation && profile.genderIdentity && profile.orientation) {
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
      if (filters.ageRange !== 'all') {
        const age = profile.age;
        if (filters.ageRange === '18-25' && (age < 18 || age > 25)) {
          return false;
        }
        if (filters.ageRange === '26-35' && (age < 26 || age > 35)) {
          return false;
        }
        if (filters.ageRange === '36-45' && (age < 36 || age > 45)) {
          return false;
        }
        if (filters.ageRange === '45+' && age < 45) {
          return false;
        }
      }

      // Check distance filter
      if (filters.distance !== 'all') {
        const maxDistance = parseInt(filters.distance);
        if (profile.distance > maxDistance) {
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

  // Update card stack when filtered profiles change
  useEffect(() => {
    const nextProfiles = filteredProfiles.slice(currentProfileIndex, currentProfileIndex + 3);
    setCardStack(nextProfiles);
  }, [currentProfileIndex, filteredProfiles]);

  const handleLike = () => {
    if (!currentProfile || isCardAnimating) return;
    
    setIsCardAnimating(true);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
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

  const handleDislike = () => {
    if (!currentProfile || isCardAnimating) return;
    
    setIsCardAnimating(true);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
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
      toast({
        title: "That's everyone for now!",
        description: "Check back later for new matches.",
      });
      setCurrentProfileIndex(0);
      setCurrentPhotoIndex(0);
    }
  };

  const handleRelationshipFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, relationshipIntent: value }));
    setCurrentProfileIndex(0);
  };

  const getChatStyleColor = (style: string) => {
    switch (style) {
      case 'introverted': return 'bg-blue-100 text-blue-800';
      case 'balanced': return 'bg-green-100 text-green-800';
      case 'outgoing': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetFilters = () => {
    setFilters({
      interests: [],
      languageLevel: 'all',
      chatStyle: 'all',
      relationshipIntent: 'all',
      ageRange: 'all',
      distance: 'all',
      onlineOnly: false
    });
    setCurrentProfileIndex(0);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== false && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

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
        className="relative h-80 bg-gradient-to-br from-muted/50 to-muted cursor-pointer"
        onClick={onPhotoTap}
      >
        <img 
          src={profile.photos[currentPhotoIndex]} 
          alt={profile.name}
          className="w-full h-full object-cover transition-smooth"
          onError={onPhotoError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Photo Navigation Dots */}
        {profile.photos.length > 1 && !isPreview && (
          <div className="absolute top-4 left-4 flex gap-1.5">
            {profile.photos.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-smooth ${
                  index === currentPhotoIndex ? 'bg-white shadow-glow' : 'bg-white/40'
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
            className="absolute top-4 right-4 h-8 px-3 text-white hover:scale-110 transition-spring backdrop-blur-md z-30"
          >
            <UserCheck size={14} className="mr-1" />
            <span className="text-xs font-medium">Info</span>
          </Button>
        )}

        {/* Tap zones for photo navigation */}
        {profile.photos.length > 1 && !isPreview && (
          <>
            <div className="absolute left-0 top-0 w-1/2 h-full z-10" />
            <div className="absolute right-0 top-0 w-1/2 h-full z-20" />
          </>
        )}

        {/* Simplified Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <span className="text-lg font-medium">{profile.age}</span>
              {profile.isVerified && (
                <Shield size={18} className="text-blue-400" />
              )}
            </div>
            {profile.isOnline && (
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Online</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-sm mb-3">
            <MapPin size={14} />
            <span>{profile.location.split(',')[0]} • {profile.distance}km away</span>
          </div>

          {/* Essential info only */}
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 backdrop-blur-sm text-white text-sm border-white/30 h-6 px-3">
              {profile.languageLevel}
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm text-white text-sm border-white/30 h-6 px-3">
              {profile.sharedInterests} shared
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Minimal bottom content - only for main card */}
      {!isPreview && (
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {profile.bio}
          </p>
          
          {/* Top 3 interests only */}
          <div className="flex items-center gap-1.5">
            {profile.interests.slice(0, 3).map(interest => (
              <Badge key={interest} variant="secondary" className="text-xs h-6 px-2 rounded-full">
                {interest}
              </Badge>
            ))}
            {profile.interests.length > 3 && (
              <span className="text-xs text-muted-foreground">
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
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-8 w-32 h-32 bg-gradient-accent rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-gradient-secondary rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-16 w-20 h-20 bg-gradient-primary rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
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
      <div className="px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="animate-fade-in">
            <h1 className="text-display-2 font-bold gradient-text-hero">Discover</h1>
            <p className="text-body-small text-muted-foreground">Find your perfect conversation partner</p>
          </div>
          <Button
            variant="glass"
            size="lg"
            onClick={() => navigate('/matches')}
            className="shadow-glow-accent/20 hover:scale-110 transition-spring animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Users size={18} className="mr-2" />
            <span className="font-medium">Matches</span>
          </Button>
        </div>
      </div>
      
      <div className="px-4 py-3 max-w-md mx-auto space-y-4 relative z-10 pb-32">
        {/* Quick Stats */}
        <div className="text-center animate-fade-in">
          <p className="text-sm text-muted-foreground">
            {filteredProfiles.length} profile{filteredProfiles.length !== 1 ? 's' : ''} found
            {activeFiltersCount > 0 && (
              <span className="ml-2">
                • <span className="text-primary font-medium">{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active</span>
              </span>
            )}
          </p>
        </div>

        {/* No Matches Message */}
        {filteredProfiles.length === 0 && (
          <Card className="shadow-medium">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-semibold mb-2">No matches found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters or check back later for new profiles.
              </p>
              <Button 
                variant="outline" 
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Card Stack */}
        <div className="relative h-[500px] max-w-sm mx-auto mb-6">
          {cardStack.map((profile, stackIndex) => {
            const isCurrentCard = stackIndex === 0;
            const zIndex = cardStack.length - stackIndex;
            const scale = 1 - (stackIndex * 0.05);
            const translateY = stackIndex * 8;
            const opacity = 1 - (stackIndex * 0.3);
            
            return (
              <div
                key={`${profile.id}-${stackIndex}`}
                className="absolute inset-0 transition-all duration-300 ease-out"
                style={{
                  zIndex,
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  opacity: opacity > 0.1 ? opacity : 0.1
                }}
              >
                {isCurrentCard ? (
                  <SwipeableCard
                    leftAction={{
                      icon: X,
                      color: '#ef4444',
                      action: handleDislike
                    }}
                    rightAction={{
                      icon: Heart,
                      color: '#10b981',
                      action: handleLike
                    }}
                    className="h-full shadow-2xl border-0 overflow-hidden"
                    disabled={isCardAnimating}
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
                  <Card className="h-full shadow-xl border-0 overflow-hidden bg-card/80 backdrop-blur-sm">
                    <ProfileCardContent 
                      profile={profile} 
                      currentPhotoIndex={0}
                      onPhotoTap={() => {}}
                      onPhotoChange={() => {}}
                      onPhotoError={handlePhotoError}
                      getChatStyleColor={getChatStyleColor}
                      navigate={navigate}
                      isPreview={true}
                    />
                  </Card>
                )}
              </div>
            );
          })}
          
          {cardStack.length === 0 && (
            <Card className="h-full shadow-xl flex items-center justify-center">
              <CardContent className="text-center p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold mb-2">You're all caught up!</h3>
                <p className="text-muted-foreground mb-4">Check back later for new profiles</p>
                <Button onClick={() => setCurrentProfileIndex(0)} variant="outline">
                  <RotateCcw size={16} className="mr-2" />
                  Start Over
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mobile Action Buttons */}
        {currentProfile && (
          <div className="fixed bottom-20 left-0 right-0 z-20 bg-gradient-to-t from-background via-background/90 to-transparent pt-4">
            <div className="flex justify-center items-center gap-4 px-6">
              {/* Pass Button */}
              <Button
                variant="glass"
                size="icon-lg"
                onClick={handleDislike}
                disabled={isCardAnimating}
                className="h-14 w-14 border-2 border-destructive/30 text-destructive hover:border-destructive hover:shadow-glow-destructive/30 interactive-scale disabled:opacity-50 disabled:scale-100"
              >
                <X size={20} />
              </Button>
              
              {/* Super Like Button */}
              <Button
                variant="glass"
                size="icon-lg"
                onClick={handleSuperLike}
                disabled={isCardAnimating}
                className="h-12 w-12 border-2 border-blue-400/30 text-blue-400 hover:border-blue-400 hover:shadow-glow-blue/30 interactive-scale disabled:opacity-50 disabled:scale-100"
              >
                <Star size={18} />
              </Button>
              
              {/* Message Button */}
              <Button
                variant="gradient"
                size="icon-lg"
                onClick={handleSayHi}
                disabled={isCardAnimating}
                className="h-16 w-16 shadow-glow-primary hover:scale-110 transition-spring relative overflow-hidden group disabled:opacity-50 disabled:scale-100"
              >
                <MessageCircle size={22} className="group-hover:scale-110 transition-spring" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Button>
              
              {/* AI Assist Button */}
              <Button
                variant="glass"
                size="icon-lg"
                onClick={() => setShowConversationStarters(true)}
                disabled={isCardAnimating}
                className="h-12 w-12 border-2 border-purple-400/30 text-purple-400 hover:border-purple-400 hover:shadow-glow-purple/30 interactive-scale disabled:opacity-50 disabled:scale-100"
              >
                <Zap size={18} />
              </Button>
              
              {/* Like Button */}
              <Button
                variant="glass"
                size="icon-lg"
                onClick={handleLike}
                disabled={isCardAnimating}
                className="h-14 w-14 border-2 border-green-400/30 text-green-400 hover:border-green-400 hover:shadow-glow-green/30 interactive-scale disabled:opacity-50 disabled:scale-100"
              >
                <Heart size={20} />
              </Button>
            </div>
            
            {/* Action Labels */}
            <div className="flex justify-center items-center gap-4 px-6 mt-2">
              <span className="text-xs text-muted-foreground w-14 text-center">Pass</span>
              <span className="text-xs text-muted-foreground w-12 text-center">Super</span>
              <span className="text-xs text-muted-foreground w-16 text-center">Message</span>
              <span className="text-xs text-muted-foreground w-12 text-center">AI</span>
              <span className="text-xs text-muted-foreground w-14 text-center">Like</span>
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9998]" ref={iceBreakerModalRef}>
          <Card className="w-[calc(100vw-2rem)] max-w-sm mx-auto max-h-[85vh] overflow-hidden rounded-xl shadow-xl">
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
        <div className="fixed inset-0 bg-black/80 z-[9998] flex items-center justify-center p-4" ref={conversationStartersModalRef}>
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
      )}

      {/* Filters Modal */}
      {filtersExpanded && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
          <Card 
            ref={filtersModalRef}
            className="w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl animate-scale-in"
          >
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary/10 flex items-center justify-center">
                    <Filter size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Smart Filters</h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredProfiles.length} profiles found
                    </p>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Age Range</label>
                    <Select value={filters.ageRange} onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, ageRange: value }));
                      setCurrentProfileIndex(0);
                    }}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ages</SelectItem>
                        <SelectItem value="18-25">18-25</SelectItem>
                        <SelectItem value="26-35">26-35</SelectItem>
                        <SelectItem value="36-45">36-45</SelectItem>
                        <SelectItem value="45+">45+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Distance</label>
                    <Select value={filters.distance} onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, distance: value }));
                      setCurrentProfileIndex(0);
                    }}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Distance</SelectItem>
                        <SelectItem value="5">Within 5km</SelectItem>
                        <SelectItem value="10">Within 10km</SelectItem>
                        <SelectItem value="25">Within 25km</SelectItem>
                        <SelectItem value="50">Within 50km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Language and Chat Style */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Language Level</label>
                    <Select value={filters.languageLevel} onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, languageLevel: value }));
                      setCurrentProfileIndex(0);
                    }}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner (A1-A2)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (B1-B2)</SelectItem>
                        <SelectItem value="advanced">Advanced (C1-C2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Chat Style</label>
                    <Select value={filters.chatStyle} onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, chatStyle: value }));
                      setCurrentProfileIndex(0);
                    }}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Styles</SelectItem>
                        <SelectItem value="introverted">Introverted</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="outgoing">Outgoing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Relationship Intent */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
                    Looking for
                    <Info size={14} className="text-muted-foreground" />
                  </label>
                  <Select value={filters.relationshipIntent} onValueChange={handleRelationshipFilterChange}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Default Setting</SelectItem>
                      <SelectItem value="friendship">Friendship</SelectItem>
                      <SelectItem value="relationship">Relationship</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
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
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Add interests" />
                    </SelectTrigger>
                    <SelectContent>
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
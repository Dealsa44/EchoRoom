import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, MessageCircle, X, Filter, MapPin, Info, ChevronDown, ChevronUp, Star, Shield, Users, Lightbulb, Sparkles } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import SmartConversationStarters from '@/components/chat/SmartConversationStarters';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: number;
  name: string;
  avatar: string;
  age: number;
  location: string;
  distance: number;
  bio: string;
  interests: string[];
  languageLevel: string;
  chatStyle: string;
  lastActive: string;
  isOnline: boolean;
  sharedInterests: number;
  genderIdentity: string;
  orientation: string;
  lookingForRelationship: boolean;
  attractionPreferences: string[];
  photos: string[];
  isVerified: boolean;
  profileCompletion: number;
  iceBreakerAnswers: Record<string, string>;
}

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

  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showIceBreakers, setShowIceBreakers] = useState(false);
  const [selectedIceBreaker, setSelectedIceBreaker] = useState('');
  const [showConversationStarters, setShowConversationStarters] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [matches, setMatches] = useState<Profile[]>([]);
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIceBreakers, showConversationStarters]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showIceBreakers || showConversationStarters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showIceBreakers, showConversationStarters]);

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

  const profiles: Profile[] = [
    {
      id: 1,
      name: 'Luna',
      avatar: '🌙',
      age: 24,
      location: 'Tbilisi, Georgia',
      distance: 2.3,
      bio: 'Philosophy student who loves deep conversations and poetry. Looking for meaningful connections.',
      interests: ['Philosophy', 'Poetry', 'Mindfulness', 'Reading'],
      languageLevel: 'B2',
      chatStyle: 'introverted',
      lastActive: '2 hours ago',
      isOnline: false,
      sharedInterests: 2,
      genderIdentity: 'female',
      orientation: 'bisexual',
      lookingForRelationship: true,
      attractionPreferences: ['women', 'men'],
      photos: [
        'https://picsum.photos/400/400?random=1',
        'https://picsum.photos/400/400?random=2',
        'https://picsum.photos/400/400?random=3'
      ],
      isVerified: true,
      profileCompletion: 95,
      iceBreakerAnswers: {
        "What's your favorite way to spend a weekend?": "Reading philosophy books in a cozy café with good coffee",
        "If you could travel anywhere right now, where would you go?": "Greece to explore ancient philosophy sites",
        "What's the best book you've read recently?": "The Republic by Plato - it changed my perspective on everything"
      }
    },
    {
      id: 2,
      name: 'Alex',
      avatar: '📚',
      age: 28,
      location: 'London, UK',
      distance: 5.1,
      bio: 'Book enthusiast and language learner. Seeking someone to explore ideas and practice languages with.',
      interests: ['Books', 'Languages', 'Culture', 'Travel'],
      languageLevel: 'C1',
      chatStyle: 'balanced',
      lastActive: '1 hour ago',
      isOnline: true,
      sharedInterests: 3,
      genderIdentity: 'non-binary',
      orientation: 'pansexual',
      lookingForRelationship: false,
      attractionPreferences: ['all-genders'],
      photos: [
        'https://picsum.photos/400/400?random=4',
        'https://picsum.photos/400/400?random=5',
        'https://picsum.photos/400/400?random=6'
      ],
      isVerified: true,
      profileCompletion: 88,
      iceBreakerAnswers: {
        "What's your favorite way to spend a weekend?": "Exploring bookstores and trying new cuisines",
        "If you could travel anywhere right now, where would you go?": "Japan to practice Japanese and explore culture",
        "What's the best book you've read recently?": "The Midnight Library - it made me think about life choices"
      }
    },
    {
      id: 3,
      name: 'Sage',
      avatar: '🌱',
      age: 22,
      location: 'San Francisco, USA',
      distance: 8.7,
      bio: 'Mindfulness practitioner and nature lover. Looking for gentle souls to share wisdom with.',
      interests: ['Mindfulness', 'Nature', 'Art', 'Meditation'],
      languageLevel: 'A2',
      chatStyle: 'introverted',
      lastActive: '30 min ago',
      isOnline: true,
      sharedInterests: 1,
      genderIdentity: 'male',
      orientation: 'heterosexual',
      lookingForRelationship: true,
      attractionPreferences: ['women'],
      photos: [
        'https://picsum.photos/400/400?random=7',
        'https://picsum.photos/400/400?random=8',
        'https://picsum.photos/400/400?random=9'
      ],
      isVerified: false,
      profileCompletion: 72,
      iceBreakerAnswers: {
        "What's your favorite way to spend a weekend?": "Hiking in nature and practicing meditation",
        "If you could travel anywhere right now, where would you go?": "Bali for spiritual retreat and yoga",
        "What's something you're passionate about?": "Helping others find inner peace and mindfulness"
      }
    },
    {
      id: 4,
      name: 'Maya',
      avatar: '🎨',
      age: 26,
      location: 'Paris, France',
      distance: 12.3,
      bio: 'Artist and coffee enthusiast. Love discussing art, culture, and life over a good cup of coffee.',
      interests: ['Art', 'Coffee', 'Travel', 'Photography'],
      languageLevel: 'B1',
      chatStyle: 'outgoing',
      lastActive: '15 min ago',
      isOnline: true,
      sharedInterests: 2,
      genderIdentity: 'female',
      orientation: 'lesbian',
      lookingForRelationship: true,
      attractionPreferences: ['women'],
      photos: [
        'https://picsum.photos/400/400?random=10',
        'https://picsum.photos/400/400?random=11',
        'https://picsum.photos/400/400?random=12'
      ],
      isVerified: true,
      profileCompletion: 91,
      iceBreakerAnswers: {
        "What's your favorite way to spend a weekend?": "Painting in my studio and exploring art galleries",
        "If you could travel anywhere right now, where would you go?": "Italy to see the Renaissance art in person",
        "What's something you're passionate about?": "Creating art that tells stories and connects people"
      }
    },
    {
      id: 5,
      name: 'Kai',
      avatar: '🏃',
      age: 30,
      location: 'Tokyo, Japan',
      distance: 15.8,
      bio: 'Fitness trainer and language exchange partner. Looking for friends to practice English and share workout tips.',
      interests: ['Fitness', 'Languages', 'Travel', 'Cooking'],
      languageLevel: 'A2',
      chatStyle: 'outgoing',
      lastActive: '45 min ago',
      isOnline: false,
      sharedInterests: 1,
      genderIdentity: 'male',
      orientation: 'heterosexual',
      lookingForRelationship: false,
      attractionPreferences: ['women'],
      photos: [
        'https://picsum.photos/400/400?random=13',
        'https://picsum.photos/400/400?random=14',
        'https://picsum.photos/400/400?random=15'
      ],
      isVerified: true,
      profileCompletion: 85,
      iceBreakerAnswers: {
        "What's your favorite way to spend a weekend?": "Working out and trying new healthy recipes",
        "If you could travel anywhere right now, where would you go?": "Thailand for Muay Thai training",
        "What's something you're passionate about?": "Helping people achieve their fitness goals"
      }
    }
  ];

  // Filter profiles based on current filters
  const filteredProfiles = profiles.filter(profile => {
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

    // Temporarily disable strict attraction filtering for testing
    // const userPrefs = user?.attractionPreferences || [];
    // const profileGender = profile.genderIdentity;
    // const userGender = user?.genderIdentity;
    // const profilePrefs = profile.attractionPreferences || [];
    
    // Check if user is attracted to this profile's gender
    // const isUserAttractedToProfile = userPrefs.includes('all-genders') || 
    //   (profileGender === 'female' && userPrefs.includes('women')) ||
    //   (profileGender === 'male' && userPrefs.includes('men')) ||
    //   (profileGender === 'non-binary' && userPrefs.includes('non-binary'));

    // Check if profile is attracted to user's gender
    // const isProfileAttractedToUser = profilePrefs.includes('all-genders') || 
    //   (userGender === 'female' && profilePrefs.includes('women')) ||
    //   (userGender === 'male' && profilePrefs.includes('men')) ||
    //   (userGender === 'non-binary' && profilePrefs.includes('non-binary'));

    // Both sides must be attracted to each other
    // if (!isUserAttractedToProfile || !isProfileAttractedToUser) {
    //   return false;
    // }

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

  const currentProfile = filteredProfiles[currentProfileIndex];

  const handleLike = () => {
    if (!currentProfile) return;
    
    // Add to matches automatically
    setMatches(prev => [...prev, currentProfile]);
    
    toast({
      title: "It's a match! 💚",
      description: `You and ${currentProfile.name} liked each other!`,
    });
    handleNextProfile();
  };

  const handleDislike = () => {
    if (!currentProfile) return;
    
    toast({
      title: "Passed",
      description: `You passed on ${currentProfile.name}`,
    });
    handleNextProfile();
  };

  const handleSuperLike = () => {
    if (!currentProfile) return;
    
    toast({
      title: "Super Liked! ⭐",
      description: `${currentProfile.name} will be notified of your super like!`,
    });
    handleNextProfile();
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

  const handlePhotoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://picsum.photos/400/400?random=999';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Find Your Match" />
      
      {/* Matches Button */}
      <div className="flex justify-end px-4 py-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/matches')}
          className="text-muted-foreground hover:text-foreground h-7 px-2"
        >
          <Users size={14} className="mr-1" />
          <span className="text-xs">Matches</span>
        </Button>
      </div>
      
      <div className="px-4 py-3 max-w-md mx-auto space-y-3">
        {/* Compact Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Filter size={14} className="text-muted-foreground" />
                <h3 className="text-sm font-medium">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="h-5 px-2 text-xs"
                  >
                    Clear
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className="h-5 w-5 p-0"
                >
                  {filtersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </Button>
              </div>
            </div>
            
            {/* Quick Filter Pills */}
            <div className="flex gap-2 mb-2">
              <Button
                variant={filters.ageRange !== 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltersExpanded(true)}
                className="flex-1 h-6 px-3 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105"
              >
                🎂 {filters.ageRange === 'all' ? 'Any Age' : filters.ageRange}
              </Button>
              <Button
                variant={filters.relationshipIntent !== 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltersExpanded(true)}
                className="flex-1 h-6 px-3 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105"
              >
                💝 {filters.relationshipIntent === 'all' ? 'Default' : 
                    filters.relationshipIntent === 'friendship' ? 'Friends' :
                    filters.relationshipIntent === 'relationship' ? 'Love' :
                    'Both'}
              </Button>
            </div>

            {/* Expanded Filters */}
            {filtersExpanded && (
              <div className="space-y-2 pt-2 border-t">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Age</label>
                    <Select value={filters.ageRange} onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, ageRange: value }));
                      setCurrentProfileIndex(0);
                    }}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="18-25">18-25</SelectItem>
                        <SelectItem value="26-35">26-35</SelectItem>
                        <SelectItem value="36-45">36-45</SelectItem>
                        <SelectItem value="45+">45+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Distance</label>
                    <Select value={filters.distance} onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, distance: value }));
                      setCurrentProfileIndex(0);
                    }}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="5">5km</SelectItem>
                        <SelectItem value="10">10km</SelectItem>
                        <SelectItem value="25">25km</SelectItem>
                        <SelectItem value="50">50km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Language</label>
                    <Select value={filters.languageLevel} onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, languageLevel: value }));
                      setCurrentProfileIndex(0);
                    }}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="beginner">A1-A2</SelectItem>
                        <SelectItem value="intermediate">B1-B2</SelectItem>
                        <SelectItem value="advanced">C1-C2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Style</label>
                    <Select value={filters.chatStyle} onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, chatStyle: value }));
                      setCurrentProfileIndex(0);
                    }}>
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="introverted">Introverted</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="outgoing">Outgoing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                      Looking for
                      <Info size={12} className="text-muted-foreground" />
                    </label>
                    <Select value={filters.relationshipIntent} onValueChange={handleRelationshipFilterChange}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                                             <SelectContent>
                         <SelectItem value="all">Default</SelectItem>
                         <SelectItem value="friendship">Friendship</SelectItem>
                         <SelectItem value="relationship">Relationship</SelectItem>
                         <SelectItem value="both">Both</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Online Only</label>
                    <Select value={filters.onlineOnly ? 'online' : 'all'} onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, onlineOnly: value === 'online' }));
                      setCurrentProfileIndex(0);
                    }}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="online">Online Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Interests</label>
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
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select interests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Interests</SelectItem>
                      <SelectItem value="Philosophy">Philosophy</SelectItem>
                      <SelectItem value="Books">Books</SelectItem>
                      <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                      <SelectItem value="Art">Art</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Yoga">Yoga</SelectItem>
                      <SelectItem value="Cooking">Cooking</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Astronomy">Astronomy</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                  {filters.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filters.interests.map(interest => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                          <button
                            onClick={() => {
                              setFilters(prev => ({
                                ...prev,
                                interests: prev.interests.filter(i => i !== interest)
                              }));
                              setCurrentProfileIndex(0);
                            }}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Profile Card */}
        {currentProfile && (
          <Card className="shadow-md overflow-hidden max-w-md mx-auto">
            {/* Photo Gallery */}
            <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
              <img 
                src={currentProfile.photos[currentPhotoIndex]} 
                alt={currentProfile.name}
                className="w-full h-full object-cover"
                onError={handlePhotoError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              
              {/* Photo Navigation */}
              {currentProfile.photos.length > 1 && (
                <div className="absolute top-4 left-4 flex gap-1">
                  {currentProfile.photos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Photo Controls */}
              {currentProfile.photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePhotoChange('prev')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  >
                    ‹
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePhotoChange('next')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  >
                    ›
                  </Button>
                </>
              )}

              {/* Profile Info Overlay */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{currentProfile.name}</h2>
                  <span className="text-base font-medium">{currentProfile.age}</span>
                  {currentProfile.isVerified && (
                    <Shield size={16} className="text-blue-400" />
                  )}
                  {currentProfile.isOnline && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs mb-2">
                  <MapPin size={12} />
                  {currentProfile.location.split(',')[0]} • {currentProfile.distance}km
                </div>
                <div className="flex items-center gap-1">
                  <Badge className="bg-white/25 backdrop-blur-sm text-white text-xs border-white/30 h-4 px-1">
                    {currentProfile.sharedInterests} shared
                  </Badge>
                  <Badge className="bg-white/25 backdrop-blur-sm text-white text-xs border-white/30 h-4 px-1">
                    {currentProfile.languageLevel}
                  </Badge>
                </div>
              </div>
            </div>
            
            <CardContent className="p-3">
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-2 leading-relaxed line-clamp-2">{currentProfile.bio}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <div className={`w-1 h-1 rounded-full ${currentProfile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  {currentProfile.isOnline ? 'Online now' : `Active ${currentProfile.lastActive}`}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex flex-wrap gap-1">
                    {currentProfile.interests.slice(0, 4).map(interest => (
                      <Badge key={interest} variant="secondary" className="text-xs h-4 px-1">
                        {interest}
                      </Badge>
                    ))}
                    {currentProfile.interests.length > 4 && (
                      <Badge variant="secondary" className="text-xs h-4 px-1">
                        +{currentProfile.interests.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-1">
                    <Badge className={`${getChatStyleColor(currentProfile.chatStyle)} h-4 px-1`}>
                      {currentProfile.chatStyle}
                    </Badge>
                    <Badge variant="outline" className="h-4 px-1">
                      {currentProfile.lookingForRelationship ? 'Relationship' : 'Friendship'}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    {currentProfile.profileCompletion}% complete
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {currentProfile && (
          <div className="flex items-center justify-center gap-3 px-4 py-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDislike}
              className="h-14 w-14 p-0 border-2 border-red-300 text-red-600 active:bg-red-50 rounded-full"
            >
              <X size={20} />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleSuperLike}
              className="h-14 w-14 p-0 border-2 border-yellow-300 text-yellow-600 active:bg-yellow-50 rounded-full"
            >
              <Star size={20} />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowConversationStarters(true)}
              className="h-14 w-14 p-0 border-2 border-purple-300 text-purple-600 active:bg-purple-50 rounded-full"
            >
              <Sparkles size={20} />
            </Button>
            
            <Button
              variant="default"
              size="lg"
              onClick={handleSayHi}
              className="h-14 w-14 p-0 bg-blue-600 active:bg-blue-700 rounded-full"
            >
              <MessageCircle size={20} />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleLike}
              className="h-14 w-14 p-0 border-2 border-green-300 text-green-600 active:bg-green-50 rounded-full"
            >
              <Heart size={20} />
            </Button>
          </div>
        )}


      </div>

      {/* Ice Breakers Modal */}
      {showIceBreakers && currentProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" ref={iceBreakerModalRef}>
          <Card className="w-full max-w-sm mx-auto max-h-[85vh] overflow-hidden">
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
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" ref={conversationStartersModalRef}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

      <BottomNavigation />
    </div>
  );
};

export default Match;
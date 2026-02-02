import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, MapPin, Calendar, Clock, Users, Star, Filter, Heart, Share2, MoreVertical, Globe, Lock, Music, BookOpen, Languages, Coffee, Camera, Gamepad2, Palette, Dumbbell, Utensils } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/hooks/useApp';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  location: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  date: string;
  time: string;
  duration: number; // in minutes
  maxParticipants: number;
  currentParticipants: number;
  price: number; // 0 for free
  currency: string;
  organizer: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  tags: string[];
  isPrivate: boolean;
  isFeatured: boolean;
  image?: string;
  language?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  ageRestriction?: '18+' | '21+' | 'all-ages';
  dressCode?: string;
  requirements?: string[];
  highlights: string[];
  isBookmarked: boolean;
  isJoined: boolean;
  createdAt: string;
  lastUpdated: string;
}

const Events = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [sortBy, setSortBy] = useState('upcoming');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [eventToLeave, setEventToLeave] = useState<Event | null>(null);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { value: 'all', label: 'All Events', icon: '🎯' },
    { value: 'social', label: 'Social & Parties', icon: '🎉' },
    { value: 'language', label: 'Language Exchange', icon: '🌍' },
    { value: 'culture', label: 'Culture & Arts', icon: '🎨' },
    { value: 'music', label: 'Music & Concerts', icon: '🎵' },
    { value: 'sports', label: 'Sports & Fitness', icon: '🏃' },
    { value: 'food', label: 'Food & Dining', icon: '🍽️' },
    { value: 'education', label: 'Learning & Workshops', icon: '📚' },
    { value: 'outdoor', label: 'Outdoor & Adventure', icon: '🏕️' },
    { value: 'business', label: 'Networking & Business', icon: '💼' }
  ];

  const eventTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'in-person', label: 'In-Person' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const dateFilters = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' }
  ];

  const priceFilters = [
    { value: 'all', label: 'All Prices' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
    { value: 'under-50', label: 'Under $50' },
    { value: 'under-100', label: 'Under $100' }
  ];

  const sortOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'distance', label: 'Nearest First' }
  ];

  // Load events from localStorage only (hosted + joined; no mock events)
  const [events, setEvents] = useState<Event[]>([]);

  // Normalize organizer so card never shows "unknown" (events from CreateEvent have hostName/organizer; legacy may have only hostName)
  const normalizeEventOrganizer = (e: any): Event => {
    const rawName = (e.organizer?.name ?? e.hostName ?? '').trim();
    const displayName = !rawName || /^unknown$/i.test(rawName) ? 'Event host' : rawName;
    const organizer = e.organizer && (e.organizer.id != null || e.organizer.name)
      ? {
          id: e.organizer.id ?? e.hostId ?? '',
          name: displayName,
          avatar: e.organizer.avatar ?? '👤',
          isVerified: !!e.organizer.isVerified
        }
      : {
          id: e.hostId ?? '',
          name: displayName,
          avatar: '👤',
          isVerified: false
        };
    return { ...e, organizer } as Event;
  };

  useEffect(() => {
    let hosted: any[] = [];
    let joined: any[] = [];
    try {
      hosted = JSON.parse(localStorage.getItem('hostedEvents') || '[]');
    } catch {
      localStorage.removeItem('hostedEvents');
    }
    try {
      joined = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
    } catch {
      localStorage.removeItem('joinedEvents');
    }
    const joinedIds = new Set(joined.map((x: any) => x.id));
    const byId = new Map<string, any>();
    hosted.forEach((e: any) => byId.set(e.id, { ...e, isJoined: joinedIds.has(e.id) }));
    joined.forEach((e: any) => {
      if (!byId.has(e.id)) byId.set(e.id, { ...e, isJoined: true });
    });
    const merged = Array.from(byId.values()).map(normalizeEventOrganizer);
    setEvents(merged);
    setLoading(false);
  }, []);




  // Filter events based on selected criteria (show all: hosted + joined)
  const filteredEvents = events.filter(event => {
    // Search filter - check title, description, tags, and organizer name
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
                         event.title.toLowerCase().includes(searchLower) ||
                         event.description.toLowerCase().includes(searchLower) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                         (event.organizer?.name ?? '').toLowerCase().includes(searchLower) ||
                         event.location.toLowerCase().includes(searchLower);
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    // Type filter
    const matchesType = selectedType === 'all' || event.type === selectedType;
    
    // Date filter
    let matchesDate = true;
    if (selectedDate !== 'all') {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      switch (selectedDate) {
        case 'today':
          matchesDate = eventDate.toDateString() === today.toDateString();
          break;
        case 'tomorrow':
          matchesDate = eventDate.toDateString() === tomorrow.toDateString();
          break;
        case 'this-week':
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          matchesDate = eventDate >= today && eventDate <= weekFromNow;
          break;
        case 'this-month':
          matchesDate = eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
          break;
      }
    }
    
    // Price filter
    let matchesPrice = true;
    if (selectedPrice !== 'all') {
      switch (selectedPrice) {
        case 'free':
          matchesPrice = event.price === 0;
          break;
        case 'paid':
          matchesPrice = event.price > 0;
          break;
        case 'under-50':
          matchesPrice = event.price < 50;
          break;
        case 'under-100':
          matchesPrice = event.price < 100;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesType && matchesDate && matchesPrice;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'upcoming':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'popular':
        // Sort by popularity (participants) then by date
        const popularityDiff = b.currentParticipants - a.currentParticipants;
        if (popularityDiff !== 0) return popularityDiff;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'price-low':
        // Sort by price low to high, then by date
        const priceDiff = a.price - b.price;
        if (priceDiff !== 0) return priceDiff;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'price-high':
        // Sort by price high to low, then by date
        const priceDiffHigh = b.price - a.price;
        if (priceDiffHigh !== 0) return priceDiffHigh;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'distance':
        // For now, sort by date since we don't have real distance calculation
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      default:
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });

     const handleJoinEvent = (eventId: string) => {
       // Update the event's isJoined status
       setEvents(prevEvents => 
         prevEvents.map(event => 
           event.id === eventId 
             ? { ...event, isJoined: true }
             : event
         )
       );
       
       // Add to joinedEvents in localStorage with safe fallback
       try {
         const joinedEvents = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
         const eventToJoin = events.find(event => event.id === eventId);
         if (eventToJoin && !joinedEvents.some((e: any) => e.id === eventId)) {
           joinedEvents.push(eventToJoin);
           localStorage.setItem('joinedEvents', JSON.stringify(joinedEvents));
         }
       } catch (error) {
         console.warn('Failed to update joinedEvents localStorage:', error);
         // Clear corrupted data and start fresh
         localStorage.removeItem('joinedEvents');
         const eventToJoin = events.find(event => event.id === eventId);
         if (eventToJoin) {
           localStorage.setItem('joinedEvents', JSON.stringify([eventToJoin]));
         }
       }
     };

     const handleLeaveEvent = (eventId: string) => {
       // Find the event to leave
       const event = events.find(e => e.id === eventId);
       if (event) {
         setEventToLeave(event);
         setShowLeaveConfirmation(true);
       }
     };

     const confirmLeaveEvent = () => {
       if (!eventToLeave) return;
       
       // Update the event's isJoined status
       setEvents(prevEvents => 
         prevEvents.map(event => 
           event.id === eventToLeave.id 
             ? { ...event, isJoined: false }
             : event
         )
       );
       
       // Remove from joinedEvents in localStorage
       const joinedEvents = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
       const updatedJoinedEvents = joinedEvents.filter((e: any) => e.id !== eventToLeave.id);
       localStorage.setItem('joinedEvents', JSON.stringify(updatedJoinedEvents));
       
       // Close modal and reset state
       setShowLeaveConfirmation(false);
       setEventToLeave(null);
     };

     const handleBookmarkEvent = (eventId: string) => {
     // Simulate bookmarking event
   };

     const handleShareEvent = (event: Event) => {
     // Simulate sharing event
     if (navigator.share) {
       navigator.share({
         title: event.title,
         text: event.description,
         url: window.location.href,
       });
     } else {
       // Fallback for browsers that don't support Web Share API
       navigator.clipboard.writeText(`${event.title} - ${event.description}`);
     }
   };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData?.icon || '🎯';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'in-person': return '📍';
      case 'virtual': return '💻';
      case 'hybrid': return '🔀';
      default: return '🎯';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return `${price} ${currency}`;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedType !== 'all') count++;
    if (selectedDate !== 'all') count++;
    if (selectedPrice !== 'all') count++;
    return count;
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedDate('all');
    setSelectedPrice('all');
    setSortBy('upcoming');
  };

  return (
    <div className="min-h-screen app-gradient-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-24 right-12 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-32 left-8 w-20 h-20 bg-gradient-secondary rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-6 w-16 h-16 bg-gradient-accent rounded-full blur-lg animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <TopBar 
        title="Events" 
        showBack={true}
        onBack={() => navigate('/community')}
        rightAction={
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="hover:scale-110 transition-spring hover:bg-primary/10 relative"
            >
              <Filter size={20} className="hover:text-primary transition-smooth" />
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-accent rounded-full animate-pulse shadow-glow-accent/30 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">{getActiveFiltersCount()}</span>
                </span>
              )}
            </Button>
          </div>
        }
      />
      
      <div className="px-4 py-5 max-w-md mx-auto space-y-5 relative z-10 content-safe-top pb-24">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <h1 className="text-display-2 font-bold gradient-text-hero mb-2">Discover Events</h1>
          <p className="text-body-small text-muted-foreground">Find meaningful experiences and connect with your community</p>
        </div>

        {/* Search and Quick Actions */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search events, locations, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl border-border-soft bg-background/50 backdrop-blur-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="gradient"
              size="sm"
              onClick={() => navigate('/create-event')}
              className="flex-1 h-10 rounded-full shadow-glow-primary"
            >
              <Plus size={18} className="mr-2" />
              Create Event
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/my-events')}
              className="h-10 px-4 rounded-full"
            >
              My Events
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <Card className="shadow-medium border-border-soft">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Filters</h3>
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs h-8 px-2"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          <span className="mr-2">{category.icon}</span>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Date</label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFilters.map(date => (
                        <SelectItem key={date.value} value={date.value}>
                          {date.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Price</label>
                  <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceFilters.map(price => (
                        <SelectItem key={price.value} value={price.value}>
                          {price.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {/* Results Counter */}
          {!loading && sortedEvents.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{sortedEvents.length} available event{sortedEvents.length !== 1 ? 's' : ''} found</span>
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-primary h-auto p-0"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
          
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="shadow-medium border-border-soft">
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : sortedEvents.length === 0 ? (
            // Empty state
            <Card className="shadow-medium border-border-soft">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-semibold mb-2">No events found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {getActiveFiltersCount() > 0 
                    ? `No events match your current filters. Try adjusting them or clear all filters to see all events.`
                    : 'All events have been joined! Check back later for new events or try creating one yourself!'
                  }
                </p>
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="rounded-full"
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            // Events list
            sortedEvents.map((event) => (
              <Card 
                key={event.id} 
                className="cursor-pointer shadow-medium border-border-soft hover:shadow-large transition-all duration-300 active:scale-[0.98] overflow-hidden"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                <CardContent className="p-0">
                  {/* Event Image */}
                  {event.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Event Type Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge variant="glass" className="bg-black/30 text-white border-white/20 dark:bg-black/30 dark:text-white dark:border-white/20 bg-white/90 text-black border-black/20">
                          {getEventTypeIcon(event.type)} {event.type}
                        </Badge>
                      </div>
                      
                      {/* Featured Badge */}
                      {event.isFeatured && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="gradient" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                            ⭐ Featured
                          </Badge>
                        </div>
                      )}
                      
                      {/* Price Badge */}
                      <div className="absolute bottom-3 right-3">
                        <Badge variant="glass" className="bg-white/90 text-black font-semibold">
                          {formatPrice(event.price, event.currency)}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  {/* Event Content */}
                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs h-6 px-2">
                            {getCategoryIcon(event.category)} {categories.find(cat => cat.value === event.category)?.label}
                          </Badge>
                          {event.isPrivate && (
                            <Badge variant="outline" className="text-xs h-6 px-2 bg-red-50 text-red-700 border-red-200">
                              <Lock size={12} className="mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg leading-tight mb-1">{event.title}</h3>
                      </div>
                      
                      {/* Action Menu */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkEvent(event.id);
                          }}
                          className="h-8 w-8 hover:bg-primary/10"
                        >
                          <Heart 
                            size={16} 
                            className={event.isBookmarked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} 
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareEvent(event);
                          }}
                          className="h-8 w-8 hover:bg-primary/10"
                        >
                          <Share2 size={16} className="text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {event.description}
                    </p>
                    
                    {/* Event Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={16} />
                        <span>{formatTime(event.time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={16} />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users size={16} />
                        <span>{event.currentParticipants ?? 0}/{event.maxParticipants ?? 0}</span>
                      </div>
                      {event.language && (
                        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                          <Globe size={16} />
                          <span>Primary Language: <span className="font-medium">{event.language}</span></span>
                        </div>
                      )}
                    </div>
                    


                    {/* Tags */}
                    {(event.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(event.tags ?? []).slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs h-6 px-2">
                          {tag}
                        </Badge>
                      ))}
                      {event.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{(event.tags ?? []).length - 3} more
                        </span>
                      )}
                    </div>
                    )}
                    
                    {/* Highlights */}
                    {(event.highlights?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(event.highlights ?? []).slice(0, 2).map((highlight, index) => (
                          <Badge key={index} variant="outline" className="text-xs h-6 px-2 bg-green-50 text-green-700 border-green-200">
                            ✨ {highlight}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Organizer and Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-border-soft">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl flex-shrink-0">{event.organizer?.avatar ?? '👤'}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium break-words min-w-0" title={event.organizer?.name ?? 'Event host'}>{event.organizer?.name ?? 'Event host'}</p>
                          {event.organizer?.isVerified && (
                            <Badge variant="outline" className="text-xs h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant={event.isJoined ? "outline" : "default"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                                                     if (event.isJoined) {
                             handleLeaveEvent(event.id);
                           } else {
                             handleJoinEvent(event.id);
                           }
                        }}
                        className="rounded-full h-8 px-4"
                      >
                        {event.isJoined ? 'Leave' : 'Join'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Leave Event Confirmation Modal */}
      <Dialog open={showLeaveConfirmation} onOpenChange={setShowLeaveConfirmation}>
        <DialogContent className="max-w-[320px] w-[calc(100vw-2rem)]">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-center">Leave Event?</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to leave "{eventToLeave?.title}"? You can always join again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowLeaveConfirmation(false);
                setEventToLeave(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmLeaveEvent}
              className="flex-1"
            >
              Yes, Leave Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default Events;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, MapPin, Calendar, Clock, Users, Star, Filter, Globe, Lock } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/hooks/useApp';
import { eventsApi } from '@/services/api';

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

  const [events, setEvents] = useState<Event[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const fetchEvents = () => {
    setLoading(true);
    eventsApi
      .list({
        category: selectedCategory,
        type: selectedType,
        date: selectedDate,
        price: selectedPrice,
        search: searchQuery.trim() || undefined,
        sort: sortBy
      })
      .then((res) => {
        if (res.success && res.events) setEvents(res.events as Event[]);
        else setEvents([]);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, selectedType, selectedDate, selectedPrice, sortBy, searchQuery]);

  const handleJoinEvent = async (eventId: string) => {
    setJoiningId(eventId);
    try {
      await eventsApi.join(eventId);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isJoined: true, currentParticipants: e.currentParticipants + 1 } : e));
    } catch (e) {
      console.error('Failed to join', e);
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeaveEvent = (eventId: string) => {
    const ev = events.find(e => e.id === eventId);
    if (ev) setEventToLeave(ev);
    setShowLeaveConfirmation(true);
  };

  const confirmLeaveEvent = async () => {
    if (!eventToLeave) return;
    setLeavingId(eventToLeave.id);
    try {
      await eventsApi.leave(eventToLeave.id);
      setEvents(prev => prev.filter(e => e.id !== eventToLeave.id));
      setShowLeaveConfirmation(false);
      setEventToLeave(null);
    } catch (e) {
      console.error('Failed to leave', e);
    } finally {
      setLeavingId(null);
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
          {!loading && events.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{events.length} available event{events.length !== 1 ? 's' : ''} found</span>
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
          ) : events.length === 0 ? (
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
            // Events list: click card -> event info; only Join/Leave button (no three-dot, no participant/edit)
            events.map((event) => (
              <Card 
                key={event.id} 
                className="cursor-pointer shadow-medium border-border-soft hover:shadow-large transition-all duration-300 active:scale-[0.98] overflow-hidden"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                <CardContent className="p-0">
                  {/* Event Image */}
                  {event.image && (
                    <div className="relative h-48 overflow-hidden" onClick={() => navigate(`/event/${event.id}`)}>
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      <div className="absolute top-3 left-3">
                        <Badge variant="glass" className="bg-black/30 text-white border-white/20 dark:bg-black/30 dark:text-white dark:border-white/20 bg-white/90 text-black border-black/20">
                          {getEventTypeIcon(event.type)} {event.type}
                        </Badge>
                      </div>
                      
                      {event.isFeatured && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="gradient" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                            ⭐ Featured
                          </Badge>
                        </div>
                      )}
                      
                      <div className="absolute bottom-3 right-3">
                        <Badge variant="glass" className="bg-white/90 text-black font-semibold">
                          {formatPrice(event.price, event.currency)}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1" onClick={() => navigate(`/event/${event.id}`)}>
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
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {event.description}
                    </p>
                    
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
                    
                    {(event.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(event.tags ?? []).slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs h-6 px-2">
                          {tag}
                        </Badge>
                      ))}
                      {(event.tags?.length ?? 0) > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{(event.tags ?? []).length - 3} more
                        </span>
                      )}
                    </div>
                    )}
                    
                    {(event.highlights?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(event.highlights ?? []).slice(0, 2).map((highlight, index) => (
                          <Badge key={index} variant="outline" className="text-xs h-6 px-2 bg-green-50 text-green-700 border-green-200">
                            ✨ {highlight}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Organizer and Join/Leave only */}
                    <div className="flex items-center justify-between pt-2 border-t border-border-soft">
                      <div className="flex items-center gap-2 min-w-0" onClick={() => navigate(`/event/${event.id}`)}>
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
                        disabled={joiningId === event.id || leavingId === event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (event.isJoined) handleLeaveEvent(event.id);
                          else handleJoinEvent(event.id);
                        }}
                        className="rounded-full h-8 px-4"
                      >
                        {joiningId === event.id ? 'Joining...' : leavingId === event.id ? 'Leaving...' : event.isJoined ? 'Leave' : 'Join'}
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

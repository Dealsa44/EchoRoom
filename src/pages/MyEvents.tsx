import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Users, Calendar, Clock, MapPin, Star, Search, Eye, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  date: string;
  time: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
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
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

const MyEvents = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('hosting');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [eventToLeave, setEventToLeave] = useState<Event | null>(null);

  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);

  const refreshEvents = () => {
    setLoading(true);
    eventsApi
      .getMy()
      .then((res) => {
        if (res.success) {
          setHostedEvents((res.hosted ?? []) as Event[]);
          setJoinedEvents((res.joined ?? []) as Event[]);
        }
      })
      .catch(() => {
        setHostedEvents([]);
        setJoinedEvents([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshEvents();
  }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshEvents();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      'social': '🎉',
      'language': '🌍',
      'culture': '🎨',
      'music': '🎵',
      'sports': '🏃',
      'food': '🍽️',
      'education': '📚',
      'outdoor': '🏕️',
      'business': '💼'
    };
    return categoryIcons[category] || '🎯';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'in-person': return '📍';
      case 'virtual': return '💻';
      case 'hybrid': return '🔀';
      default: return '🎯';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">📅 Upcoming</Badge>;
      case 'ongoing':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">🟢 Ongoing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">✅ Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">❌ Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
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

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return `${price} ${currency}`;
  };

  const handleEditEvent = (eventId: string) => {
    // Navigate to edit event page (to be implemented)
    navigate(`/edit-event/${eventId}`, { state: { from: 'my-events' } });
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      await eventsApi.delete(eventId);
      setHostedEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (e) {
      console.error('Failed to delete event', e);
    }
  };

  const handleTabChange = (value: string) => setActiveTab(value);

  const handleLeaveEvent = (eventId: string) => {
    // Find the event to leave
    const event = joinedEvents.find(e => e.id === eventId);
    if (event) {
      setEventToLeave(event);
      setShowLeaveConfirmation(true);
    }
  };

  const confirmLeaveEvent = async () => {
    if (!eventToLeave) return;
    try {
      await eventsApi.leave(eventToLeave.id);
      setJoinedEvents(prev => prev.filter(e => e.id !== eventToLeave.id));
      setShowLeaveConfirmation(false);
      setEventToLeave(null);
    } catch (e) {
      console.error('Failed to leave event', e);
    }
  };

  const filteredHostedEvents = hostedEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJoinedEvents = joinedEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="min-h-screen app-gradient-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-24 right-12 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-32 left-8 w-20 h-20 bg-gradient-secondary rounded-xl blur-xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-6 w-16 h-16 bg-gradient-accent rounded-full blur-lg animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <TopBar 
        title="My Events" 
        showBack={true}
        onBack={() => navigate('/events')}
      />
      
      <div className="px-4 py-5 max-w-md mx-auto space-y-5 relative z-10 content-safe-top pb-24">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <h1 className="text-display-2 font-bold gradient-text-hero mb-2">My Events</h1>
          <p className="text-body-small text-muted-foreground">Manage your events and track your participation</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search your events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-soft bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hosting" className="text-sm">
              <Star className="w-4 h-4 mr-2" />
              Hosting ({filteredHostedEvents.length})
            </TabsTrigger>
            <TabsTrigger value="joined" className="text-sm">
              <Users className="w-4 h-4 mr-2" />
              Joined ({filteredJoinedEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hosting" className="space-y-4 mt-4">
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
            ) : filteredHostedEvents.length === 0 ? (
              <Card className="shadow-medium border-border-soft">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="font-semibold mb-2">No events hosted yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first event and start building your community!
                  </p>
                  <Button onClick={() => navigate('/create-event')} className="rounded-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredHostedEvents.map((event) => (
                <Card key={event.id} className="shadow-medium border-border-soft cursor-pointer" onClick={() => navigate(`/event/${event.id}`, { state: { from: 'my-events' } })}>
                  <CardContent className="p-0">
                    {event.image && (
                      <div className="relative h-48 overflow-hidden">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute top-3 left-3">
                          <Badge variant="glass" className="bg-white/90 text-black border-black/20">
                            {getEventTypeIcon(event.type)} {event.type}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(event.status ?? 'upcoming')}
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <Badge variant="glass" className="bg-white/90 text-black font-semibold">
                            {formatPrice(event.price, event.currency)}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs h-6 px-2">
                          {getCategoryIcon(event.category)} {event.category}
                        </Badge>
                        {event.isPrivate && (
                          <Badge variant="outline" className="text-xs h-6 px-2 bg-red-50 text-red-700 border-red-200">
                            Private
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg leading-tight mb-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{event.description}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={16} />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={16} />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin size={16} />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users size={16} />
                          <span>{event.currentParticipants}/{event.maxParticipants}</span>
                        </div>
                        {event.language && (
                          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                            <Globe size={16} />
                            <span>Primary Language: <span className="font-medium">{event.language}</span></span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-border-soft" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => handleEditEvent(event.id)} className="flex-1">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)} className="flex-1">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="joined" className="space-y-4 mt-4">
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
            ) : filteredJoinedEvents.length === 0 ? (
              <Card className="shadow-medium border-border-soft">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="font-semibold mb-2">No events joined yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover and join events to start building connections!
                  </p>
                  <Button onClick={() => navigate('/events')} className="rounded-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Browse Events
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredJoinedEvents.map((event) => (
                <Card key={event.id} className="shadow-medium border-border-soft cursor-pointer" onClick={() => navigate(`/event/${event.id}`, { state: { from: 'my-events' } })}>
                  <CardContent className="p-0">
                    {event.image && (
                      <div className="relative h-48 overflow-hidden">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute top-3 left-3">
                          <Badge variant="glass" className="bg-white/90 text-black border-black/20">
                            {getEventTypeIcon(event.type)} {event.type}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge variant="glass" className="bg-white/90 text-black border-black/20">
                            {event.organizer?.avatar ?? '👤'} {event.organizer?.name ?? 'Host'}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <Badge variant="glass" className="bg-white/90 text-black font-semibold">
                            {formatPrice(event.price, event.currency)}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs h-6 px-2">
                          {getCategoryIcon(event.category)} {event.category}
                        </Badge>
                        {event.isPrivate && (
                          <Badge variant="outline" className="text-xs h-6 px-2 bg-red-50 text-red-700 border-red-200">
                            Private
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg leading-tight mb-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{event.description}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={16} />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={16} />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin size={16} />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users size={16} />
                          <span>{event.currentParticipants}/{event.maxParticipants}</span>
                        </div>
                        {event.language && (
                          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                            <Globe size={16} />
                            <span>Primary Language: <span className="font-medium">{event.language}</span></span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-border-soft" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/event/${event.id}`, { state: { from: 'my-events' } })} className="flex-1">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleLeaveEvent(event.id)} className="flex-1">
                          Leave Event
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
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

export default MyEvents;

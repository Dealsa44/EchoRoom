import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Star,
  Settings,
  MessageCircle,
  Share2,
  MoreVertical,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

  // Mock data for events the user is hosting
  const hostedEvents: Event[] = [
    {
      id: '1',
      title: 'Georgian Language Exchange Meetup',
      description: 'Practice Georgian with native speakers and fellow learners. All levels welcome!',
      category: 'language',
      type: 'in-person',
      location: 'Tbilisi, Georgia',
      address: 'Rustaveli Avenue 15, Tbilisi',
      date: '2024-01-15',
      time: '18:00',
      duration: 120,
      maxParticipants: 25,
      currentParticipants: 18,
      price: 0,
      currency: 'GEL',
      organizer: {
        id: user?.id || 'user1',
        name: user?.name || 'You',
        avatar: user?.avatar || '👤',
        isVerified: true
      },
      tags: ['Georgian', 'Language Learning', 'Cultural Exchange'],
      isPrivate: false,
      isFeatured: true,
      image: 'https://picsum.photos/400/300?random=1',
      language: 'Georgian',
      skillLevel: 'all-levels',
      ageRestriction: '18+',
      highlights: ['Native speakers', 'Cultural activities', 'Free coffee'],
      isBookmarked: false,
      isJoined: true,
      createdAt: '2024-01-10T10:00:00Z',
      lastUpdated: '2024-01-10T10:00:00Z',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Weekend Photography Workshop',
      description: 'Learn photography basics and advanced techniques from professional photographers.',
      category: 'education',
      type: 'in-person',
      location: 'Tbilisi, Georgia',
      address: 'Photography Studio, Vake District',
      date: '2024-01-22',
      time: '10:00',
      duration: 240,
      maxParticipants: 12,
      currentParticipants: 8,
      price: 120,
      currency: 'GEL',
      organizer: {
        id: user?.id || 'user2',
        name: user?.name || 'You',
        avatar: user?.avatar || '👤',
        isVerified: true
      },
      tags: ['Photography', 'Workshop', 'Creative'],
      isPrivate: false,
      isFeatured: false,
      image: 'https://picsum.photos/400/300?random=6',
      skillLevel: 'beginner',
      ageRestriction: '16+',
      requirements: ['Camera (any type)', 'Comfortable walking shoes'],
      highlights: ['Professional instructors', 'Hands-on practice'],
      isBookmarked: false,
      isJoined: true,
      createdAt: '2024-01-02T11:00:00Z',
      lastUpdated: '2024-01-02T11:00:00Z',
      status: 'upcoming'
    }
  ];

  // Mock data for events the user has joined
  const joinedEvents: Event[] = [
    {
      id: '3',
      title: 'Philosophy & Coffee Discussion Group',
      description: 'Deep philosophical discussions over coffee. This week\'s topic: "The Meaning of Happiness in Modern Society".',
      category: 'education',
      type: 'hybrid',
      location: 'Tbilisi, Georgia',
      address: 'Coffee Lab, Old Town, Tbilisi',
      date: '2024-01-14',
      time: '14:00',
      duration: 90,
      maxParticipants: 15,
      currentParticipants: 8,
      price: 15,
      currency: 'GEL',
      organizer: {
        id: 'user3',
        name: 'Philosophy Circle',
        avatar: '🤔',
        isVerified: false
      },
      tags: ['Philosophy', 'Discussion', 'Coffee'],
      isPrivate: false,
      isFeatured: false,
      image: 'https://picsum.photos/400/300?random=3',
      skillLevel: 'all-levels',
      ageRestriction: '18+',
      highlights: ['Intellectual discussion', 'Coffee included'],
      isBookmarked: false,
      isJoined: true,
      createdAt: '2024-01-05T12:00:00Z',
      lastUpdated: '2024-01-05T12:00:00Z',
      status: 'upcoming'
    },
    {
      id: '4',
      title: 'Tech Startup Networking Mixer',
      description: 'Connect with fellow entrepreneurs, investors, and tech professionals.',
      category: 'business',
      type: 'hybrid',
      location: 'Tbilisi, Georgia',
      address: 'Innovation Hub, Saburtalo',
      date: '2024-01-19',
      time: '18:30',
      duration: 150,
      maxParticipants: 100,
      currentParticipants: 67,
      price: 25,
      currency: 'GEL',
      organizer: {
        id: 'user8',
        name: 'Tbilisi Tech Community',
        avatar: '💻',
        isVerified: true
      },
      tags: ['Networking', 'Startups', 'Technology'],
      isPrivate: false,
      isFeatured: false,
      image: 'https://picsum.photos/400/300?random=8',
      skillLevel: 'all-levels',
      ageRestriction: '21+',
      dressCode: 'Business casual',
      highlights: ['Pitch competition', 'Free drinks'],
      isBookmarked: false,
      isJoined: true,
      createdAt: '2024-01-04T16:00:00Z',
      lastUpdated: '2024-01-04T16:00:00Z',
      status: 'upcoming'
    }
  ];

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
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
    navigate(`/edit-event/${eventId}`);
  };

  const handleDeleteEvent = (eventId: string) => {
    // Show confirmation dialog and delete event
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      // Delete event logic here
      console.log('Deleting event:', eventId);
    }
  };

  const handleManageParticipants = (eventId: string) => {
    // Navigate to participant management page (to be implemented)
    navigate(`/event/${eventId}/participants`);
  };

  const handleSendAnnouncement = (eventId: string) => {
    // Open announcement modal (to be implemented)
    console.log('Send announcement for event:', eventId);
  };

  const handleLeaveEvent = (eventId: string) => {
    // Leave event logic here
    if (confirm('Are you sure you want to leave this event?')) {
      console.log('Leaving event:', eventId);
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <Card key={event.id} className="shadow-medium border-border-soft">
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
                          <Badge variant="glass" className="bg-white/90 text-black border-black/20">
                            {getEventTypeIcon(event.type)} {event.type}
                          </Badge>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(event.status)}
                        </div>
                        
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
                              {getCategoryIcon(event.category)} {event.category}
                            </Badge>
                            {event.isPrivate && (
                              <Badge variant="outline" className="text-xs h-6 px-2 bg-red-50 text-red-700 border-red-200">
                                Private
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg leading-tight mb-1">{event.title}</h3>
                        </div>
                        
                        {/* Action Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/event/${event.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Event
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEvent(event.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageParticipants(event.id)}>
                              <Users className="mr-2 h-4 w-4" />
                              Manage Participants
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendAnnouncement(event.id)}>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Send Announcement
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-border-soft">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageParticipants(event.id)}
                          className="flex-1"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Participants
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEvent(event.id)}
                          className="flex-1"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
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
                <Card key={event.id} className="shadow-medium border-border-soft">
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
                          <Badge variant="glass" className="bg-white/90 text-black border-black/20">
                            {getEventTypeIcon(event.type)} {event.type}
                          </Badge>
                        </div>
                        
                        {/* Organizer Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge variant="glass" className="bg-white/90 text-black border-black/20">
                            {event.organizer.avatar} {event.organizer.name}
                          </Badge>
                        </div>
                        
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
                              {getCategoryIcon(event.category)} {event.category}
                            </Badge>
                            {event.isPrivate && (
                              <Badge variant="outline" className="text-xs h-6 px-2 bg-red-50 text-red-700 border-red-200">
                                Private
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg leading-tight mb-1">{event.title}</h3>
                        </div>
                        
                        {/* Action Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/event/${event.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Event
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendAnnouncement(event.id)}>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Contact Organizer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleLeaveEvent(event.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Leave Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-border-soft">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/event/${event.id}`)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLeaveEvent(event.id)}
                          className="flex-1"
                        >
                          <Users className="mr-2 h-4 w-4" />
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

      <BottomNavigation />
    </div>
  );
};

export default MyEvents;

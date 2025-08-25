import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Heart, 
  Share2, 
  MoreVertical, 
  Star, 
  MessageCircle, 
  Phone, 
  Mail, 
  Globe, 
  Lock, 
  Shield, 
  Flag, 
  Camera,
  Video,
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock3,
  Map,
  Navigation,
  Car,
  Bus,
  Train,
  Plane
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/hooks/useApp';

interface EventParticipant {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  joinedAt: string;
  status: 'confirmed' | 'pending' | 'maybe';
  isOrganizer: boolean;
}

interface EventMessage {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

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
    bio?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
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
  // Additional fields for detailed view
  longDescription?: string;
  agenda?: string[];
  rules?: string[];
  cancellationPolicy?: string;
  refundPolicy?: string;
  transportation?: string[];
  parking?: string;
  accessibility?: string[];
  photos?: string[];
  documents?: Array<{
    name: string;
    url: string;
    type: 'pdf' | 'doc' | 'image';
    size: string;
  }>;
}

const Event = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showParticipantList, setShowParticipantList] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock event data - in real app this would come from API
  useEffect(() => {
    if (id) {
      // Simulate fetching event data
      const mockEvent: Event = {
        id: id,
        title: 'Georgian Language Exchange Meetup',
        description: 'Practice Georgian with native speakers and fellow learners. All levels welcome! We\'ll have conversation tables, games, and cultural activities.',
        longDescription: `Join us for an immersive Georgian language experience! This meetup is designed for both beginners and advanced learners who want to practice Georgian in a supportive, friendly environment.

What to expect:
• Conversation tables organized by skill level (Beginner, Intermediate, Advanced)
• Cultural activities and traditional Georgian games
• Free coffee and traditional Georgian snacks
• Networking opportunities with fellow language enthusiasts
• Optional cultural presentation about Georgian history and traditions

The event will be held in a cozy café in the heart of Tbilisi, providing the perfect atmosphere for learning and cultural exchange. Whether you're just starting your Georgian journey or you're already fluent, there's something for everyone!

Please bring your enthusiasm and willingness to learn. All materials will be provided, and native Georgian speakers will be available to help with pronunciation and grammar questions.`,
        category: 'language',
        type: 'in-person',
        location: 'Tbilisi, Georgia',
        address: 'Rustaveli Avenue 15, Tbilisi, Georgia',
        coordinates: { lat: 41.7151, lng: 44.8271 },
        date: '2024-01-15',
        time: '18:00',
        duration: 120,
        maxParticipants: 25,
        currentParticipants: 18,
        price: 0,
        currency: 'GEL',
        organizer: {
          id: 'user1',
          name: 'Tbilisi Language Club',
          avatar: '🌍',
          isVerified: true,
          bio: 'Dedicated to promoting Georgian language and culture through interactive learning experiences.',
          contactEmail: 'info@tbilisilanguageclub.ge',
          website: 'https://tbilisilanguageclub.ge'
        },
        tags: ['Georgian', 'Language Learning', 'Cultural Exchange', 'Networking', 'Free'],
        isPrivate: false,
        isFeatured: true,
        image: 'https://picsum.photos/400/300?random=1',
        photos: [
          'https://picsum.photos/400/300?random=1',
          'https://picsum.photos/400/300?random=2',
          'https://picsum.photos/400/300?random=3',
          'https://picsum.photos/400/300?random=4'
        ],
        language: 'Georgian',
        skillLevel: 'all-levels',
        ageRestriction: '18+',
        highlights: ['Native speakers', 'Cultural activities', 'Free coffee', 'Interactive learning'],
        requirements: ['Enthusiasm for learning', 'Basic English (for international participants)'],
        agenda: [
          '18:00 - Welcome and introductions',
          '18:15 - Language level assessment',
          '18:30 - Conversation tables by skill level',
          '19:30 - Cultural activities and games',
          '20:00 - Networking and cultural presentation',
          '20:30 - Q&A and feedback session'
        ],
        rules: [
          'Be respectful of all participants',
          'Use Georgian as much as possible',
          'Help others learn and grow',
          'No discrimination or harassment',
          'Follow the venue\'s rules and regulations'
        ],
        cancellationPolicy: 'Free cancellation up to 24 hours before the event. No-shows may affect future event registrations.',
        refundPolicy: 'This is a free event, so no refunds apply.',
        transportation: [
          'Metro: Rustaveli Station (Red Line)',
          'Bus: Routes 4, 10, 14, 37, 59',
          'Marshrutka: Routes 31, 33, 37, 59',
          'Taxi: Available throughout the city'
        ],
        parking: 'Limited street parking available. Recommended to use public transportation.',
        accessibility: [
          'Wheelchair accessible entrance',
          'Elevator available',
          'Accessible restrooms',
          'Sign language interpreter available upon request (48h notice)'
        ],
        documents: [
          {
            name: 'Event Guidelines.pdf',
            url: '#',
            type: 'pdf',
            size: '2.3 MB'
          },
          {
            name: 'Georgian Basics.pdf',
            url: '#',
            type: 'pdf',
            size: '1.8 MB'
          }
        ],
        isBookmarked: false,
        isJoined: false,
        createdAt: '2024-01-10T10:00:00Z',
        lastUpdated: '2024-01-10T10:00:00Z'
      };

      setEvent(mockEvent);

      // Mock participants
      const mockParticipants: EventParticipant[] = [
        {
          id: 'user1',
          name: 'Tbilisi Language Club',
          avatar: '🌍',
          isVerified: true,
          joinedAt: '2024-01-10T10:00:00Z',
          status: 'confirmed',
          isOrganizer: true
        },
        {
          id: 'user2',
          name: 'Maria K.',
          avatar: '👩',
          isVerified: true,
          joinedAt: '2024-01-11T14:30:00Z',
          status: 'confirmed',
          isOrganizer: false
        },
        {
          id: 'user3',
          name: 'David M.',
          avatar: '👨',
          isVerified: false,
          joinedAt: '2024-01-12T09:15:00Z',
          status: 'confirmed',
          isOrganizer: false
        },
        {
          id: 'user4',
          name: 'Anna S.',
          avatar: '👩‍🦰',
          isVerified: true,
          joinedAt: '2024-01-12T16:45:00Z',
          status: 'maybe',
          isOrganizer: false
        }
      ];

      setParticipants(mockParticipants);

      // Mock messages
      const mockMessages: EventMessage[] = [
        {
          id: '1',
          user: {
            id: 'user1',
            name: 'Tbilisi Language Club',
            avatar: '🌍'
          },
          content: 'Welcome everyone! We\'re excited to see so many people interested in learning Georgian. Don\'t forget to bring your enthusiasm! 🇬🇪',
          timestamp: '2 hours ago',
          type: 'text'
        },
        {
          id: '2',
          user: {
            id: 'user2',
            name: 'Maria K.',
            avatar: '👩'
          },
          content: 'I\'m so excited! This will be my first time practicing Georgian with native speakers. Any tips for beginners?',
          timestamp: '1 hour ago',
          type: 'text'
        },
        {
          id: '3',
          user: {
            id: 'user1',
            name: 'Tbilisi Language Club',
            avatar: '🌍'
          },
          content: 'Great question Maria! Just come with an open mind and don\'t worry about making mistakes. We\'re all here to learn and help each other! 😊',
          timestamp: '45 minutes ago',
          type: 'text'
        }
      ];

      setMessages(mockMessages);
    }
  }, [id]);

  const handleJoinEvent = async () => {
    if (!event) return;
    
    setIsJoining(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setEvent(prev => prev ? { ...prev, isJoined: true } : null);
    setParticipants(prev => [
      ...prev,
      {
        id: user?.id || 'current-user',
        name: user?.username || 'You',
        avatar: user?.avatar || '👤',
        isVerified: false, // Default to false since User type doesn't have isVerified
        joinedAt: new Date().toISOString(),
        status: 'confirmed',
        isOrganizer: false
      }
    ]);
    
    setIsJoining(false);
    
    
  };

  const handleLeaveEvent = async () => {
    if (!event) return;
    
    setIsLeaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setEvent(prev => prev ? { ...prev, isJoined: false } : null);
    setParticipants(prev => prev.filter(p => p.id !== user?.id));
    
    setIsLeaving(false);
    
    
  };

  const handleBookmarkEvent = () => {
    if (!event) return;
    
    setEvent(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    
    
  };

  const handleShareEvent = () => {
    if (!event) return;
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      setShowShareModal(true);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    const message: EventMessage = {
      id: Date.now().toString(),
      user: {
        id: user.id,
        name: user.username,
        avatar: user.avatar
      },
      content: newMessage,
      timestamp: 'just now',
      type: 'text'
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return `${price} ${currency}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maybe': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'pending': return <Clock3 size={16} />;
      case 'maybe': return <AlertCircle size={16} />;
      default: return <Info size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen app-gradient-bg">
        <TopBar title="Event" showBack={true} onBack={() => navigate(-1)} />
        <div className="px-4 py-5 max-w-md mx-auto space-y-5 content-safe-top pb-24">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-2xl"></div>
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen app-gradient-bg">
        <TopBar title="Event" showBack={true} onBack={() => navigate(-1)} />
        <div className="px-4 py-5 max-w-md mx-auto content-safe-top pb-24">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="font-semibold mb-2">Event not found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/events')} variant="default">
                Browse Events
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen app-gradient-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-24 right-12 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-32 left-8 w-20 h-20 bg-gradient-secondary rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

             <TopBar 
         title="Event" 
         showBack={true}
         onBack={() => navigate(-1)}
       />
      
      <div className="px-4 py-5 max-w-md mx-auto space-y-5 relative z-10 content-safe-top pb-24">
        {/* Event Header Image */}
        <div className="relative h-64 rounded-2xl overflow-hidden">
          <img
            src={event.image || event.photos?.[0]}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Event Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="glass" className="bg-black/30 text-white border-white/20 dark:bg-black/30 dark:text-white dark:border-white/20 bg-white/90 text-black border-black/20">
              {event.type === 'in-person' ? '📍 In-Person' : 
               event.type === 'virtual' ? '💻 Virtual' : '🔀 Hybrid'}
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

        {/* Event Title and Basic Info */}
        <div className="space-y-3">
                     <div className="flex items-start justify-between">
             <div className="flex-1">
               <h1 className="text-2xl font-bold leading-tight mb-2">{event.title}</h1>
               <div className="flex items-center gap-2 mb-2">
                 <Badge variant="outline" className="text-sm">
                   {event.category === 'language' ? '🌍 Language Exchange' :
                    event.category === 'music' ? '🎵 Music & Concerts' :
                    event.category === 'education' ? '📚 Learning & Workshops' :
                    event.category === 'outdoor' ? '🏕️ Outdoor & Adventure' :
                    event.category === 'social' ? '🎉 Social & Parties' :
                    event.category === 'culture' ? '🎨 Culture & Arts' :
                    event.category === 'sports' ? '🏃 Sports & Fitness' :
                    event.category === 'food' ? '🍽️ Food & Dining' :
                    event.category === 'business' ? '💼 Networking & Business' : '🎯 Other'}
                 </Badge>
                 {event.isPrivate && (
                   <Badge variant="outline" className="text-sm bg-red-50 text-red-700 border-red-200">
                     <Lock size={12} className="mr-1" />
                     Private
                   </Badge>
                 )}
               </div>
             </div>
             
             {/* Action Buttons */}
             <div className="flex items-center gap-1">
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={handleBookmarkEvent}
                 className="hover:scale-110 transition-spring hover:bg-primary/10"
               >
                 <Heart 
                   size={20} 
                   className={event.isBookmarked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} 
                 />
               </Button>
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={handleShareEvent}
                 className="hover:scale-110 transition-spring hover:bg-primary/10"
               >
                 <Share2 size={20} className="text-muted-foreground" />
               </Button>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="hover:scale-110 transition-spring hover:bg-primary/10"
                   >
                     <MoreVertical size={20} className="text-muted-foreground" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48">
                   <DropdownMenuItem onClick={() => setShowReportModal(true)}>
                     <Flag size={16} className="mr-2" />
                     Report Event
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => navigate(`/profile/${event.organizer.id}`)}>
                     <Globe size={16} className="mr-2" />
                     View Organizer Profile
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => window.open(event.organizer.website, '_blank')}>
                     <ExternalLink size={16} className="mr-2" />
                     Visit Website
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
           </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={16} />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} />
              <span>{formatTime(event.time)} ({formatDuration(event.duration)})</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={16} />
              <span>{event.currentParticipants}/{event.maxParticipants}</span>
            </div>
          </div>

          {/* Primary Language */}
          {event.language && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe size={16} />
              <span>Primary Language: <span className="font-medium">{event.language}</span></span>
            </div>
          )}

          {/* Action Buttons */}
           <div className="flex gap-2">
             {event.isJoined ? (
               <Button
                 variant="outline"
                 onClick={handleLeaveEvent}
                 disabled={isLeaving}
                 className="flex-1"
               >
                 {isLeaving ? 'Leaving...' : 'Leave Event'}
               </Button>
             ) : (
               <Button
                 variant="default"
                 onClick={handleJoinEvent}
                 disabled={isJoining || event.currentParticipants >= event.maxParticipants}
                 className="flex-1"
               >
                 {isJoining ? 'Joining...' : 
                  event.currentParticipants >= event.maxParticipants ? 'Event Full' : 'Join Event'}
               </Button>
             )}
           </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="participants">People</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Description */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  About this event
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {showFullDescription ? event.longDescription : event.description}
                  </p>
                  {event.longDescription && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-primary p-0 h-auto"
                    >
                      {showFullDescription ? 'Show less' : 'Read more'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Primary Language */}
            {event.language && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Globe size={18} className="text-primary" />
                    Primary Language
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      🌍 {event.language}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star size={18} className="text-primary" />
                    Highlights
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.highlights.map((highlight, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        ✨ {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photos */}
            {event.photos && event.photos.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Camera size={18} className="text-primary" />
                    Photos
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {event.photos.slice(0, 3).map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`Event photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {event.photos.length > 3 && (
                      <div 
                        className="aspect-square rounded-lg bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => setShowAllPhotos(true)}
                      >
                        <span className="text-sm font-medium text-muted-foreground">
                          +{event.photos.length - 3} more
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organizer */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  Organized by
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg">{event.organizer.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{event.organizer.name}</p>
                      {event.organizer.isVerified && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    {event.organizer.bio && (
                      <p className="text-sm text-muted-foreground">{event.organizer.bio}</p>
                    )}
                  </div>
                </div>
                {event.organizer.contactEmail && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Mail size={16} />
                    <span>{event.organizer.contactEmail}</span>
                  </div>
                )}
                {event.organizer.contactPhone && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Phone size={16} />
                    <span>{event.organizer.contactPhone}</span>
                  </div>
                )}
                {event.organizer.website && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Globe size={16} />
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-muted-foreground hover:text-foreground"
                      onClick={() => window.open(event.organizer.website, '_blank')}
                    >
                      Visit website
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    Event Agenda
                  </h3>
                  <div className="space-y-2">
                    {event.agenda.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-primary" />
                    What to bring
                  </h3>
                  <div className="space-y-2">
                    {event.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-sm text-muted-foreground">{req}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transportation */}
            {event.transportation && event.transportation.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Navigation size={18} className="text-primary" />
                    Getting there
                  </h3>
                  <div className="space-y-2">
                    {event.transportation.map((transport, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Navigation size={16} className="text-blue-600" />
                        <span className="text-sm text-muted-foreground">{transport}</span>
                      </div>
                    ))}
                  </div>
                  {event.parking && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Car size={16} className="text-gray-600" />
                        <span className="text-sm text-muted-foreground">{event.parking}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Rules */}
            {event.rules && event.rules.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield size={18} className="text-primary" />
                    Event Rules
                  </h3>
                  <div className="space-y-2">
                    {event.rules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Shield size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{rule}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {event.documents && event.documents.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    Documents
                  </h3>
                  <div className="space-y-2">
                    {event.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-600" />
                          <span className="text-sm font-medium">{doc.name}</span>
                          <span className="text-xs text-muted-foreground">({doc.size})</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Policies */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Info size={18} className="text-primary" />
                  Policies
                </h3>
                <div className="space-y-3">
                  {event.cancellationPolicy && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Cancellation Policy</h4>
                      <p className="text-sm text-muted-foreground">{event.cancellationPolicy}</p>
                    </div>
                  )}
                  {event.refundPolicy && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Refund Policy</h4>
                      <p className="text-sm text-muted-foreground">{event.refundPolicy}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    Participants ({participants.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowParticipantList(true)}
                    className="text-primary"
                  >
                    View all
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {participants.slice(0, 5).map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{participant.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{participant.name}</p>
                            {participant.isVerified && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                ✓
                              </Badge>
                            )}
                            {participant.isOrganizer && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                Organizer
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(participant.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(participant.status)}>
                        {getStatusIcon(participant.status)}
                        <span className="ml-1 capitalize">{participant.status}</span>
                      </Badge>
                    </div>
                  ))}
                  
                  {participants.length > 5 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowParticipantList(true)}
                        className="text-primary"
                      >
                        Show {participants.length - 5} more participants
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4 mt-4">
            <Card className="h-96">
              <CardContent className="p-4 h-full flex flex-col">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle size={18} className="text-primary" />
                  Event Chat
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Chat with other participants about this event. Only visible to event participants.
                </p>
                
                {!event.isJoined ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle size={48} className="text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium mb-2">Join the event to participate in chat</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Once you join, you can chat with other participants and ask questions about the event.
                      </p>
                      <Button
                        onClick={handleJoinEvent}
                        disabled={isJoining || event.currentParticipants >= event.maxParticipants}
                        className="rounded-full"
                      >
                        {isJoining ? 'Joining...' : 'Join Event to Chat'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle size={32} className="text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No messages yet</p>
                          <p className="text-xs text-muted-foreground">Be the first to start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="flex gap-3">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="text-sm">{message.user.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium">{message.user.name}</p>
                                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                              </div>
                              <p className="text-sm text-muted-foreground bg-muted p-2 rounded-lg">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Message Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask a question or share something about the event..."
                        className="flex-1 px-3 py-2 border border-border-soft rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                        className="px-4"
                      >
                        Send
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Event;

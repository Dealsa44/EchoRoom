import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { eventsApi } from '@/services/api';

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
    bio?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    socialMedia?: Record<string, string>;
  };
  tags: string[];
  isPrivate: boolean;
  isFeatured: boolean;
  image?: string;
  language?: string;
  skillLevel?: string;
  ageRestriction?: string;
  dressCode?: string;
  requirements?: string[];
  highlights: string[];
  isBookmarked: boolean;
  isJoined: boolean;
  isOrganizer?: boolean;
  reactionCount?: number;
  userReacted?: boolean;
  createdAt: string;
  lastUpdated: string;
  longDescription?: string;
  aboutEvent?: string;
  virtualMeetingLink?: string;
  additionalInfo?: string;
  agenda?: string[];
  rules?: string[];
  cancellationPolicy?: string;
  refundPolicy?: string;
  transportation?: string[];
  parking?: string;
  accessibility?: string[];
  photos?: string[];
  documents?: Array<{ name: string; url: string; type: string; size: string }>;
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
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [eventToLeave, setEventToLeave] = useState<Event | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch event, participants, and messages from API
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await eventsApi.get(id);
        if (cancelled) return;
        if (!res.success || !res.event) {
          setEvent(null);
          setParticipants([]);
          setMessages([]);
          setLoading(false);
          return;
        }
        setEvent(res.event as Event);
        const partRes = await eventsApi.getParticipants(id);
        if (cancelled) return;
        if (partRes.success && partRes.participants) {
          setParticipants(partRes.participants as EventParticipant[]);
        } else {
          setParticipants([]);
        }
        if (res.event.isJoined || res.event.isOrganizer) {
          const msgRes = await eventsApi.getMessages(id);
          if (cancelled) return;
          if (msgRes.success && msgRes.messages) {
            setMessages(msgRes.messages.map((m: any) => ({
              ...m,
              timestamp: typeof m.timestamp === 'string' ? m.timestamp : new Date(m.timestamp).toISOString()
            })));
          }
        } else {
          setMessages([]);
        }
      } catch (e) {
        if (!cancelled) {
          setEvent(null);
          setParticipants([]);
          setMessages([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleJoinEvent = async () => {
    if (!event || !user) return;
    setIsJoining(true);
    try {
      await eventsApi.join(event.id);
      setEvent(prev => prev ? { ...prev, isJoined: true, currentParticipants: prev.currentParticipants + 1 } : null);
      const partRes = await eventsApi.getParticipants(event.id);
      if (partRes.success && partRes.participants) setParticipants(partRes.participants as EventParticipant[]);
    } catch (e) {
      console.error('Failed to join event', e);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveEvent = () => {
    if (!event) return;
    setEventToLeave(event);
    setShowLeaveConfirmation(true);
  };

  const confirmLeaveEvent = async () => {
    if (!eventToLeave) return;
    setIsLeaving(true);
    try {
      await eventsApi.leave(eventToLeave.id);
      setShowLeaveConfirmation(false);
      setEventToLeave(null);
      navigate('/my-events');
    } catch (e) {
      console.error('Failed to leave event', e);
    } finally {
      setIsLeaving(false);
    }
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !event) return;
    const content = newMessage.trim();
    setNewMessage('');
    try {
      const res = await eventsApi.sendMessage(event.id, content);
      if (res.success && res.message) {
        const m = res.message as any;
        setMessages(prev => [...prev, {
          id: m.id,
          user: m.user,
          content: m.content,
          timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
          type: m.type || 'text'
        }]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const handleReactEvent = async () => {
    if (!event || !user) return;
    try {
      const res = await eventsApi.react(event.id);
      if (res.success && res.count !== undefined) {
        setEvent(prev => prev ? { ...prev, userReacted: res.reacted ?? false, reactionCount: res.count } : null);
      }
    } catch (e) {
      console.error('Failed to react', e);
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    if (!event || event.organizer.id !== user?.id) return;
    try {
      await eventsApi.removeParticipant(event.id, userId);
      const partRes = await eventsApi.getParticipants(event.id);
      if (partRes.success && partRes.participants) setParticipants(partRes.participants as EventParticipant[]);
    } catch (e) {
      console.error('Failed to remove participant', e);
    }
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

  // Ensure event object has all required properties
  if (!event.organizer) {
    return (
      <div className="min-h-screen app-gradient-bg">
        <TopBar title="Event" showBack={true} onBack={() => navigate(-1)} />
        <div className="px-4 py-5 max-w-md mx-auto content-safe-top pb-24">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="font-semibold mb-2">Invalid Event Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This event has incomplete or invalid data. Please try again later.
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
    <div className="min-h-screen app-gradient-bg relative flex flex-col">
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
      
      <div className="flex-1 px-4 py-5 max-w-md mx-auto space-y-5 relative z-10 content-safe-top pb-24 flex flex-col overflow-x-hidden">
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
             
             {/* Action Buttons: heart with count, share, three-dot (only View organizer profile when not me, Visit website) */}
             <div className="flex items-center gap-1">
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={handleReactEvent}
                 className="hover:scale-110 transition-spring hover:bg-primary/10"
               >
                 <Heart 
                   size={20} 
                   className={event.userReacted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} 
                 />
               </Button>
               {(event.reactionCount ?? 0) > 0 && (
                 <span className="text-sm text-muted-foreground">{event.reactionCount}</span>
               )}
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
                   {!event.isOrganizer && (
                     <DropdownMenuItem onClick={() => navigate(`/profile/${event.organizer.id}`)}>
                       <Globe size={16} className="mr-2" />
                       View Organizer Profile
                     </DropdownMenuItem>
                   )}
                   {event.organizer.website && (
                     <DropdownMenuItem onClick={() => window.open(event.organizer.website!, '_blank')}>
                       <ExternalLink size={16} className="mr-2" />
                       Visit Website
                     </DropdownMenuItem>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
           </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              <Calendar size={16} className="flex-shrink-0" />
              <span className="break-words">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              <Clock size={16} className="flex-shrink-0" />
              <span className="break-words">{formatTime(event.time)} ({formatDuration(event.duration)})</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0 col-span-2">
              <MapPin size={16} className="flex-shrink-0" />
              <span className="break-words">{event.location}</span>
            </div>
            {event.address && event.address !== event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0 col-span-2">
                <MapPin size={16} className="flex-shrink-0" />
                <span className="break-words">{event.address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              <Users size={16} className="flex-shrink-0" />
              <span className="break-words">{event.currentParticipants}/{event.maxParticipants} participants</span>
            </div>
          </div>

          {/* Virtual meeting link – only when creator added it */}
          {event.virtualMeetingLink && (event.type === 'virtual' || event.type === 'hybrid') && (
            <div className="flex items-center gap-2 text-sm">
              <Video size={16} className="flex-shrink-0 text-primary" />
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-primary font-medium"
                onClick={() => window.open(event.virtualMeetingLink!, '_blank')}
              >
                Join online meeting
              </Button>
            </div>
          )}

          {/* Primary Language */}
          {event.language && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              <Globe size={16} className="flex-shrink-0" />
              <span className="break-words">Primary Language: <span className="font-medium">{event.language}</span></span>
            </div>
          )}

          {/* Age restriction & Dress code – from Add Event */}
          {(event.ageRestriction || event.dressCode) && (
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {event.ageRestriction && (
                <span className="break-words">Age: {event.ageRestriction}</span>
              )}
              {event.dressCode && (
                <span className="break-words">Dress: {event.dressCode}</span>
              )}
            </div>
          )}

          {/* Join / Leave: only show when not organizer */}
           {!event.isOrganizer && (
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
           )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-muted/30 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="text-xs px-2 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="text-xs px-2 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="participants" 
              className="text-xs px-2 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              People
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="text-xs px-2 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Chat
            </TabsTrigger>
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
                  <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                    {showFullDescription ? (event.longDescription || event.description) : event.description}
                  </p>
                  {event.longDescription && event.longDescription !== event.description && (
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

            {/* Additional info – from Add Event */}
            {event.additionalInfo && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Info size={18} className="text-primary" />
                    Additional information
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">{event.additionalInfo}</p>
                </CardContent>
              </Card>
            )}

            {/* Tags – from Add Event */}
            {event.tags && event.tags.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star size={18} className="text-primary" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm break-all">
                        {tag}
                      </Badge>
                    ))}
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

            {/* Organizer: avatar click goes to profile; social as "Name: url" */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  Organized by
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(user?.id === event.organizer.id ? '/profile' : `/profile/${event.organizer.id}`)}
                    className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">{event.organizer.avatar}</AvatarFallback>
                    </Avatar>
                  </button>
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
                      onClick={() => window.open(event.organizer.website!, '_blank')}
                    >
                      Visit website
                    </Button>
                  </div>
                )}
                {/* Social: name and value (e.g. Facebook: https://...) */}
                {event.organizer.socialMedia && Object.keys(event.organizer.socialMedia).length > 0 && (
                  <div className="flex flex-col gap-1 mt-2">
                    {Object.entries(event.organizer.socialMedia).map(([name, url]) =>
                      url ? (
                        <div key={name} className="text-sm">
                          <span className="text-muted-foreground capitalize">{name}: </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-primary font-normal"
                            onClick={() => window.open(url, '_blank')}
                          >
                            {url}
                          </Button>
                        </div>
                      ) : null
                    )}
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

            {/* Transportation – only when creator added it */}
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
                        <Navigation size={16} className="text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground break-words">{transport}</span>
                      </div>
                    ))}
                  </div>
                  {event.parking && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Car size={16} className="text-gray-600 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground break-words">{event.parking}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Parking only – when creator added parking but no transportation */}
            {event.parking && (!event.transportation || event.transportation.length === 0) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Car size={18} className="text-primary" />
                    Parking
                  </h3>
                  <p className="text-sm text-muted-foreground break-words">{event.parking}</p>
                </CardContent>
              </Card>
            )}

            {/* Accessibility – only when creator added it */}
            {event.accessibility && event.accessibility.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Info size={18} className="text-primary" />
                    Accessibility
                  </h3>
                  <ul className="space-y-2">
                    {event.accessibility.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground break-words">
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
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

            {/* Policies – only when creator added them */}
            {(event.cancellationPolicy || event.refundPolicy) && (
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
                        <p className="text-sm text-muted-foreground break-words">{event.cancellationPolicy}</p>
                      </div>
                    )}
                    {event.refundPolicy && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Refund Policy</h4>
                        <p className="text-sm text-muted-foreground break-words">{event.refundPolicy}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* People Tab: real participants; organizer badge; avatar -> profile; X to remove (organizer only, not on self) */}
          <TabsContent value="participants" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold flex items-center gap-2 text-base mb-4">
                  <Users size={18} className="text-primary flex-shrink-0" />
                  People ({participants.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <button
                        type="button"
                        onClick={() => navigate(participant.id === user?.id ? '/profile' : `/profile/${participant.id}`)}
                        className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 flex-shrink-0"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-sm font-medium">{participant.avatar}</AvatarFallback>
                        </Avatar>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-sm break-words min-w-0">{participant.name}</p>
                          {participant.isVerified && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
                              ✓
                            </Badge>
                          )}
                          {participant.isOrganizer && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 flex-shrink-0">
                              Organizer
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {participant.isOrganizer ? 'Host' : `Joined ${new Date(participant.joinedAt).toLocaleDateString()}`}
                        </p>
                        {!participant.isOrganizer && (
                          <Badge variant="outline" className={`text-xs ${getStatusColor(participant.status)} flex-shrink-0`}>
                            {getStatusIcon(participant.status)}
                            <span className="ml-1 capitalize">{participant.status}</span>
                          </Badge>
                        )}
                      </div>
                      {event.isOrganizer && !participant.isOrganizer && participant.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveParticipant(participant.id)}
                        >
                          <XCircle size={18} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4 mt-4">
            <Card className="min-h-96 max-h-96">
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
                            <button
                              type="button"
                              onClick={() => navigate(message.user.id === user?.id ? '/profile' : `/profile/${message.user.id}`)}
                              className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 flex-shrink-0"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-sm">{message.user.avatar}</AvatarFallback>
                              </Avatar>
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium">{message.user.name}</p>
                                <span className="text-xs text-muted-foreground">
                                  {message.timestamp ? new Date(message.timestamp).toLocaleString() : ''}
                                </span>
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
                    <div className="flex gap-2 mt-auto">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask a question or share something about the event..."
                        className="flex-1 px-3 py-2 border border-border-soft rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-0"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                        className="px-4 flex-shrink-0"
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

export default Event;

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
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
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
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [eventToLeave, setEventToLeave] = useState<Event | null>(null);
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

  // Fetch event data based on ID
  useEffect(() => {
    if (id) {
              // First try to get from localStorage (joined events)
        let joinedEvents = [];
        let hostedEvents = [];
        
        try {
          joinedEvents = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
        } catch (error) {
          console.warn('Failed to parse joinedEvents from localStorage:', error);
          localStorage.removeItem('joinedEvents');
          joinedEvents = [];
        }
        
        try {
          hostedEvents = JSON.parse(localStorage.getItem('hostedEvents') || '[]');
        } catch (error) {
          console.warn('Failed to parse hostedEvents from localStorage:', error);
          localStorage.removeItem('hostedEvents');
          hostedEvents = [];
        }
      
      // Find the event in either joined or hosted events
      let foundEvent = joinedEvents.find((e: any) => e.id === id) || 
                      hostedEvents.find((e: any) => e.id === id);
      
      // If not found in joined/hosted events, check if it's a public event from Events page
      if (!foundEvent) {
        // This would typically come from an API, but for now we'll create a mock event
        // based on the ID to simulate different events
        const mockEvents = {
          '1': {
            id: '1',
            title: 'Georgian Language Exchange Meetup',
            description: 'Practice Georgian with native speakers and fellow learners. All levels welcome! We\'ll have conversation tables, games, and cultural activities.',
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
              id: 'user1',
              name: 'Tbilisi Language Club',
              avatar: '🌍',
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
            isJoined: false,
            createdAt: '2024-01-10T10:00:00Z',
            lastUpdated: '2024-01-10T10:00:00Z'
          },
          '2': {
            id: '2',
            title: 'Electronic Music Night at Bass Club',
            description: 'Join us for an electrifying night of electronic music, featuring local DJs and international artists. Dress to impress!',
            category: 'music',
            type: 'in-person',
            location: 'Tbilisi, Georgia',
            address: 'Vake District, Tbilisi',
            date: '2024-01-16',
            time: '22:00',
            duration: 300,
            maxParticipants: 200,
            currentParticipants: 156,
            price: 50,
            currency: 'GEL',
            organizer: {
              id: 'user2',
              name: 'Bass Club Tbilisi',
              avatar: '🎵',
              isVerified: true
            },
            tags: ['Electronic Music', 'Nightlife', 'DJs'],
            isPrivate: false,
            isFeatured: false,
            image: 'https://picsum.photos/400/300?random=2',
            language: 'English',
            ageRestriction: '21+',
            dressCode: 'Smart casual to formal',
            highlights: ['Live DJs', 'Premium sound system', 'VIP areas'],
            isBookmarked: false,
            isJoined: false,
            createdAt: '2024-01-08T15:00:00Z',
            lastUpdated: '2024-01-08T15:00:00Z'
          },
          '3': {
            id: '3',
            title: 'Philosophy & Coffee Discussion Group',
            description: 'Deep philosophical discussions over coffee. This week\'s topic: "The Meaning of Happiness in Modern Society". All perspectives welcome.',
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
            language: 'English',
            skillLevel: 'all-levels',
            ageRestriction: '18+',
            highlights: ['Intellectual discussion', 'Coffee included', 'Small group'],
            isBookmarked: false,
            isJoined: false,
            createdAt: '2024-01-12T09:00:00Z',
            lastUpdated: '2024-01-12T09:00:00Z'
          },
          '4': {
            id: '4',
            title: 'Weekend Hiking Adventure',
            description: 'Explore the beautiful trails around Tbilisi with experienced guides. Suitable for all fitness levels.',
            category: 'outdoor',
            type: 'in-person',
            location: 'Tbilisi, Georgia',
            address: 'Meeting point: Liberty Square',
            date: '2024-01-20',
            time: '08:00',
            duration: 360,
            maxParticipants: 20,
            currentParticipants: 12,
            price: 25,
            currency: 'GEL',
            organizer: {
              id: 'user4',
              name: 'Tbilisi Hiking Club',
              avatar: '🏔️',
              isVerified: true
            },
            tags: ['Hiking', 'Nature', 'Adventure'],
            isPrivate: false,
            isFeatured: true,
            image: 'https://picsum.photos/400/300?random=4',
            language: 'English',
            ageRestriction: '18+',
            requirements: ['Comfortable shoes', 'Water bottle', 'Weather-appropriate clothing'],
            highlights: ['Professional guides', 'Beautiful scenery', 'Group bonding'],
            isBookmarked: false,
            isJoined: false,
            createdAt: '2024-01-04T16:00:00Z',
            lastUpdated: '2024-01-05T10:00:00Z'
          },
          '5': {
            id: '5',
            title: 'Cooking Masterclass: Georgian Cuisine',
            description: 'Learn to cook traditional Georgian dishes from a master chef. All ingredients and equipment provided.',
            category: 'food',
            type: 'in-person',
            location: 'Tbilisi, Georgia',
            address: 'Culinary Institute, Old Town',
            date: '2024-01-18',
            time: '16:00',
            duration: 180,
            maxParticipants: 15,
            currentParticipants: 10,
            price: 80,
            currency: 'GEL',
            organizer: {
              id: 'user5',
              name: 'Georgian Culinary Arts',
              avatar: '👨‍🍳',
              isVerified: true
            },
            tags: ['Cooking', 'Georgian Cuisine', 'Workshop'],
            isPrivate: false,
            isFeatured: false,
            image: 'https://picsum.photos/400/300?random=5',
            language: 'Georgian',
            skillLevel: 'beginner',
            ageRestriction: '18+',
            requirements: ['No experience needed', 'Comfortable clothing'],
            highlights: ['Master chef instruction', 'All materials included', 'Take home your creations'],
            isBookmarked: false,
            isJoined: false,
            createdAt: '2024-01-03T14:00:00Z',
            lastUpdated: '2024-01-03T14:00:00Z'
          },
          '6': {
            id: '6',
            title: 'Virtual Book Club: Modern Literature',
            description: 'Join our online book club discussing contemporary literature. This month: "The Midnight Library" by Matt Haig. Connect with readers worldwide!',
            category: 'education',
            type: 'virtual',
            location: 'Online',
            date: '2024-01-18',
            time: '19:00',
            duration: 60,
            maxParticipants: 50,
            currentParticipants: 23,
            price: 0,
            currency: 'USD',
            organizer: {
              id: 'user5',
              name: 'Global Book Club',
              avatar: '📚',
              isVerified: true
            },
            tags: ['Book Club', 'Literature', 'Online Discussion'],
            isPrivate: false,
            isFeatured: false,
            image: 'https://picsum.photos/400/300?random=6',
            language: 'English',
            skillLevel: 'all-levels',
            ageRestriction: '18+',
            highlights: ['International community', 'Expert moderators', 'Reading materials provided'],
            isBookmarked: false,
            isJoined: false,
            createdAt: '2024-01-03T14:00:00Z',
            lastUpdated: '2024-01-03T14:00:00Z'
          },
          '7': {
            id: '7',
            title: 'Weekend Photography Workshop',
            description: 'Learn photography basics and advanced techniques from professional photographers. Bring your camera and enthusiasm!',
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
              id: 'user6',
              name: 'Tbilisi Photography School',
              avatar: '📸',
              isVerified: true
            },
            tags: ['Photography', 'Workshop', 'Creative'],
            isPrivate: false,
            isFeatured: false,
            image: 'https://picsum.photos/400/300?random=7',
            language: 'English',
            skillLevel: 'beginner',
            ageRestriction: '18+',
            requirements: ['Camera (any type)', 'Comfortable walking shoes', 'Creative spirit'],
            highlights: ['Professional instructors', 'Hands-on practice', 'Equipment provided'],
            isBookmarked: false,
            isJoined: false,
            createdAt: '2024-01-02T11:00:00Z',
            lastUpdated: '2024-01-02T11:00:00Z'
          },
          '8': {
            id: '8',
            title: 'Tech Startup Networking Mixer',
            description: 'Connect with fellow entrepreneurs, investors, and tech professionals. Share ideas and build meaningful connections.',
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
            language: 'English',
            skillLevel: 'all-levels',
            ageRestriction: '21+',
            dressCode: 'Business casual',
            highlights: ['Pitch competition', 'Free drinks', 'Investor meet & greet'],
            isBookmarked: false,
            isJoined: false,
            createdAt: '2024-01-04T16:00:00Z',
            lastUpdated: '2024-01-04T16:00:00Z'
          },
          'hosted-1': {
            id: 'hosted-1',
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
              id: 'user1',
              name: 'You',
              avatar: '👤',
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
            lastUpdated: '2024-01-10T10:00:00Z'
          },
          'hosted-2': {
            id: 'hosted-2',
            title: 'Art & Wine Evening',
            description: 'Unleash your creativity while enjoying fine wines. Professional artists will guide you through painting techniques in a relaxed atmosphere.',
            category: 'culture',
            type: 'in-person',
            location: 'Tbilisi, Georgia',
            address: 'Art Gallery, Old Town, Tbilisi',
            date: '2024-01-25',
            time: '19:00',
            duration: 180,
            maxParticipants: 20,
            currentParticipants: 15,
            price: 75,
            currency: 'GEL',
            organizer: {
              id: 'user2',
              name: 'You',
              avatar: '👤',
              isVerified: true
            },
            tags: ['Art', 'Wine', 'Creative', 'Social'],
            isPrivate: false,
            isFeatured: true,
            image: 'https://picsum.photos/400/300?random=10',
            language: 'English',
            skillLevel: 'all-levels',
            ageRestriction: '21+',
            requirements: ['No experience needed', 'Comfortable clothing'],
            highlights: ['Professional art instruction', 'Wine tasting included', 'Take home your artwork'],
            isBookmarked: false,
            isJoined: true,
            createdAt: '2024-01-02T11:00:00Z',
            lastUpdated: '2024-01-02T11:00:00Z'
          },
          'hosted-3': {
            id: 'hosted-3',
            title: 'Yoga & Meditation Retreat',
            description: 'A peaceful weekend retreat combining yoga, meditation, and mindfulness practices in the beautiful Georgian countryside.',
            category: 'wellness',
            type: 'in-person',
            location: 'Kakheti Region, Georgia',
            address: 'Mountain Retreat Center, Kakheti',
            date: '2024-01-28',
            time: '09:00',
            duration: 1440,
            maxParticipants: 15,
            currentParticipants: 12,
            price: 200,
            currency: 'GEL',
            organizer: {
              id: 'user3',
              name: 'You',
              avatar: '👤',
              isVerified: true
            },
            tags: ['Yoga', 'Meditation', 'Wellness', 'Retreat'],
            isPrivate: false,
            isFeatured: false,
            image: 'https://picsum.photos/400/300?random=11',
            language: 'English',
            skillLevel: 'all-levels',
            ageRestriction: '18+',
            requirements: ['Yoga mat (provided)', 'Comfortable clothing', 'Open mind'],
            highlights: ['Certified instructors', 'Accommodation included', 'Organic meals', 'Scenic location'],
            isBookmarked: false,
            isJoined: true,
            createdAt: '2024-01-01T08:00:00Z',
            lastUpdated: '2024-01-01T08:00:00Z'
          }
        };
        
        foundEvent = mockEvents[id as keyof typeof mockEvents];
      }
      
      if (foundEvent) {
        // Convert the basic event to full event format
        const fullEvent: Event = {
          ...foundEvent,
          longDescription: foundEvent.description + `\n\nThis is a detailed description of the ${foundEvent.title} event. Join us for an amazing experience!`,
          address: foundEvent.address || foundEvent.location,
          coordinates: { lat: 41.7151, lng: 44.8271 }, // Default Tbilisi coordinates
          organizer: {
            ...foundEvent.organizer,
            bio: foundEvent.organizer?.bio || 'Event organizer with a passion for creating amazing experiences.',
            contactEmail: foundEvent.organizer?.contactEmail || 'organizer@example.com',
            website: foundEvent.organizer?.website || 'https://example.com',
            socialMedia: foundEvent.organizer?.socialMedia || foundEvent.socialMedia
          },
          photos: foundEvent.image ? [foundEvent.image] : [],
          // Use actual agenda from created event, or fallback to default
          agenda: foundEvent.agenda && foundEvent.agenda.length > 0 ? 
            foundEvent.agenda.map(item => `${item.time} - ${item.activity}${item.description ? `: ${item.description}` : ''}`) :
            [
              '18:00 - Welcome and introductions',
              '18:15 - Event begins',
              '19:00 - Main activities',
              '20:00 - Networking and socializing',
              '21:00 - Event concludes'
            ],
          // Use actual rules from created event, or fallback to default
          rules: foundEvent.rules && foundEvent.rules.length > 0 ? foundEvent.rules : [
            'Be respectful of all participants',
            'Follow the venue\'s rules and regulations',
            'No discrimination or harassment',
            'Have fun and make connections!'
          ],
          // Use actual policies from created event, or fallback to default
          cancellationPolicy: foundEvent.cancellationPolicy || 'Free cancellation up to 24 hours before the event.',
          refundPolicy: foundEvent.refundPolicy || (foundEvent.price === 0 ? 'This is a free event, so no refunds apply.' : 'Standard refund policy applies.'),
          // Use actual transportation from created event, or fallback to default
          transportation: foundEvent.transportation && foundEvent.transportation.length > 0 ? foundEvent.transportation : [
            'Metro: Various stations throughout the city',
            'Bus: Multiple routes available',
            'Taxi: Available throughout the city'
          ],
          // Use actual parking info from created event, or fallback to default
          parking: foundEvent.parking || 'Limited street parking available. Recommended to use public transportation.',
          // Use actual accessibility from created event, or fallback to default
          accessibility: foundEvent.accessibility && foundEvent.accessibility.length > 0 ? foundEvent.accessibility : [
            'Wheelchair accessible entrance',
            'Elevator available',
            'Accessible restrooms'
          ],
          // Use actual documents from created event, or fallback to default
          documents: foundEvent.documents && foundEvent.documents.length > 0 ? foundEvent.documents : [
            {
              name: 'Event Guidelines.pdf',
              url: '#',
              type: 'pdf',
              size: '2.3 MB'
            }
          ]
        };
        
        setEvent(fullEvent);
        
        // Set isJoined status based on whether user is in joinedEvents
        const isUserJoined = joinedEvents.some((e: any) => e.id === id);
        setEvent(prev => prev ? { ...prev, isJoined: isUserJoined } : null);
      } else {
        // If event not found, show error
        setEvent(null);
      }

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
    
    // Update local state
    setEvent(prev => prev ? { ...prev, isJoined: true } : null);
    
    // Add to joinedEvents in localStorage with safe fallback
    try {
      const joinedEvents = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
      if (!joinedEvents.some((e: any) => e.id === event.id)) {
        joinedEvents.push(event);
        localStorage.setItem('joinedEvents', JSON.stringify(joinedEvents));
      }
    } catch (error) {
      console.warn('Failed to update joinedEvents localStorage:', error);
      // Clear corrupted data and start fresh
      localStorage.removeItem('joinedEvents');
      localStorage.setItem('joinedEvents', JSON.stringify([event]));
    }
    
    // Add user to participants
    setParticipants(prev => [
      ...prev,
      {
        id: user?.id || 'current-user',
        name: user?.username || 'You',
        avatar: user?.avatar || '👤',
        isVerified: false,
        joinedAt: new Date().toISOString(),
        status: 'confirmed',
        isOrganizer: false
      }
    ]);
    
    setIsJoining(false);
  };

  const handleLeaveEvent = () => {
    if (!event) return;
    setEventToLeave(event);
    setShowLeaveConfirmation(true);
  };

  const confirmLeaveEvent = async () => {
    if (!eventToLeave) return;
    
    setIsLeaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update local state
    setEvent(prev => prev ? { ...prev, isJoined: false } : null);
    
    // Remove from joinedEvents in localStorage with safe fallback
    try {
      const joinedEvents = JSON.parse(localStorage.getItem('joinedEvents') || '[]');
      const updatedJoinedEvents = joinedEvents.filter((e: any) => e.id !== eventToLeave.id);
      localStorage.setItem('joinedEvents', JSON.stringify(updatedJoinedEvents));
    } catch (error) {
      console.warn('Failed to update joinedEvents localStorage:', error);
      // Clear corrupted data and start fresh
      localStorage.removeItem('joinedEvents');
      localStorage.setItem('joinedEvents', JSON.stringify([]));
    }
    
    // Remove user from participants
    setParticipants(prev => prev.filter(p => p.id !== user?.id));
    
    setIsLeaving(false);
    
    // Close modal and reset state
    setShowLeaveConfirmation(false);
    setEventToLeave(null);
    
    // Navigate back to MyEvents page
    navigate('/my-events');
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
        <div className="px-4 py-5 max-w-md mx-auto space-y-5 content-safe-top content-safe-bottom">
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
        <div className="px-4 py-5 max-w-md mx-auto content-safe-top content-safe-bottom">
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
        <div className="px-4 py-5 max-w-md mx-auto content-safe-top content-safe-bottom">
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
      
      <div className="flex-1 px-4 py-5 max-w-md mx-auto space-y-5 relative z-10 content-safe-top content-safe-bottom flex flex-col overflow-x-hidden">
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
                   {event.organizer.website && (
                     <DropdownMenuItem onClick={() => window.open(event.organizer.website, '_blank')}>
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={16} className="flex-shrink-0" />
              <span className="truncate">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} className="flex-shrink-0" />
              <span className="truncate">{formatTime(event.time)} ({formatDuration(event.duration)})</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} className="flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={16} className="flex-shrink-0" />
              <span className="truncate">{event.currentParticipants}/{event.maxParticipants}</span>
            </div>
          </div>

          {/* Primary Language */}
          {event.language && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe size={16} className="flex-shrink-0" />
              <span className="truncate">Primary Language: <span className="font-medium">{event.language}</span></span>
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
                {/* Social Media Links */}
                {event.organizer.socialMedia && (
                  <div className="flex items-center gap-2 mt-2">
                    {event.organizer.socialMedia.facebook && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(event.organizer.socialMedia.facebook, '_blank')}
                      >
                        <span className="text-blue-600">📘</span>
                      </Button>
                    )}
                    {event.organizer.socialMedia.instagram && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(event.organizer.socialMedia.instagram, '_blank')}
                      >
                        <span className="text-pink-600">📷</span>
                      </Button>
                    )}
                    {event.organizer.socialMedia.twitter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(event.organizer.socialMedia.twitter, '_blank')}
                      >
                        <span className="text-blue-400">🐦</span>
                      </Button>
                    )}
                    {event.organizer.socialMedia.linkedin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(event.organizer.socialMedia.linkedin, '_blank')}
                      >
                        <span className="text-blue-700">💼</span>
                      </Button>
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
                  <h3 className="font-semibold flex items-center gap-2 text-base">
                    <Users size={18} className="text-primary flex-shrink-0" />
                    <span className="truncate">Participants ({participants.length})</span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowParticipantList(true)}
                    className="text-primary flex-shrink-0 ml-2"
                  >
                    View all
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {participants.slice(0, 5).map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="text-sm font-medium">{participant.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-sm truncate">{participant.name}</p>
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
                          Joined {new Date(participant.joinedAt).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(participant.status)} flex-shrink-0`}>
                          {getStatusIcon(participant.status)}
                          <span className="ml-1 capitalize">{participant.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {participants.length > 5 && (
                    <div className="text-center pt-3 border-t border-border-soft">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowParticipantList(true)}
                        className="text-primary w-full"
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

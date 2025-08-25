import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EventDatePicker from '@/components/ui/event-date-picker';
import TimePicker from '@/components/ui/time-picker';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Globe, 
  Lock, 
  Camera,
  Upload,
  Eye,
  EyeOff,
  Save,
  Send,
  Loader2,
  Check,
  Mail,
  Phone
} from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/hooks/useApp';

interface EventFormData {
  title: string;
  description: string;
  aboutEvent: string;
  category: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  location: string;
  address: string;
  virtualMeetingLink: string;
  date: string;
  time: string;
  duration: number;
  maxParticipants: number;
  price: number;
  currency: string;
  isPrivate: boolean;
  language: string;
  ageRestriction: '18+' | '21+' | 'all-ages';
  dressCode: string;
  requirements: string[];
  highlights: string[];
  tags: string[];
  image: string;
  agenda: {
    time: string;
    activity: string;
    description: string;
  }[];
  additionalInfo: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  cancellationPolicy: string;
  refundPolicy: string;
  transportation: string[];
  parking: 'yes' | 'no' | 'limited' | 'paid';
  accessibility: string[];
  photos: string[];
  documents: Array<{
    name: string;
    url: string;
    type: 'pdf' | 'doc' | 'image';
    size: string;
  }>;
}

const EditEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    aboutEvent: '',
    category: '',
    type: 'in-person',
    location: '',
    address: '',
    virtualMeetingLink: '',
    date: '',
    time: '',
    duration: 60,
    maxParticipants: 20,
    price: 0,
    currency: 'GEL',
    isPrivate: false,
    language: '',
    ageRestriction: '18+',
    dressCode: '',
    requirements: [],
    highlights: [],
    tags: [],
    image: '',
    agenda: [],
    additionalInfo: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    socialMedia: {},
    cancellationPolicy: '',
    refundPolicy: '',
    transportation: [],
    parking: 'no',
    accessibility: [],
    photos: [],
    documents: []
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newAgendaTime, setNewAgendaTime] = useState('');
  const [newAgendaActivity, setNewAgendaActivity] = useState('');
  const [newAgendaDescription, setNewAgendaDescription] = useState('');
  const [newTransportation, setNewTransportation] = useState('');
  const [newAccessibility, setNewAccessibility] = useState('');

  const categories = [
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
    { value: 'in-person', label: 'In-Person', icon: '📍' },
    { value: 'virtual', label: 'Virtual', icon: '💻' },
    { value: 'hybrid', label: 'Hybrid', icon: '🔀' }
  ];

  const currencies = [
    { value: 'GEL', label: 'Georgian Lari (₾)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' }
  ];

  const ageRestrictions = [
    { value: '18+', label: '18+' },
    { value: '21+', label: '21+' },
    { value: 'all-ages', label: 'All Ages' }
  ];

  const steps: Array<{
    number: number;
    title: string;
    description: string;
    icon: string;
  }> = [
    { number: 1, title: 'Basic Info', description: 'Title, description, category', icon: '📝' },
    { number: 2, title: 'Details', description: 'Date, time, location', icon: '📅' },
    { number: 3, title: 'Settings', description: 'Participants, pricing, privacy', icon: '⚙️' },
    { number: 4, title: 'Content', description: 'About, highlights, requirements', icon: '📋' },
    { number: 5, title: 'Agenda', description: 'Event schedule and activities', icon: '⏰' },
    { number: 6, title: 'Policies', description: 'Contact, cancellation, refund', icon: '📋' },
    { number: 7, title: 'Review', description: 'Preview and save changes', icon: '👁️' }
  ];

  // Load existing event data immediately
  useEffect(() => {
    if (eventId) {
      // TODO: Replace with actual API call
      // For now, use mock data immediately
      const mockEventData: EventFormData = {
        title: 'Sample Event Title',
        description: 'This is a sample event description',
        aboutEvent: 'This is a detailed description of the sample event',
        category: 'language',
        type: 'in-person',
        location: 'Tbilisi, Georgia',
        address: 'Sample Address 123',
        virtualMeetingLink: '',
        date: '2024-02-15',
        time: '18:00',
        duration: 120,
        maxParticipants: 25,
        price: 0,
        currency: 'GEL',
        isPrivate: false,
        language: 'English',
        ageRestriction: '18+',
        dressCode: 'Casual',
        requirements: ['Bring enthusiasm', 'Basic knowledge'],
        highlights: ['Great networking', 'Free coffee'],
        tags: ['networking', 'learning'],
        image: '',
        agenda: [
          { time: '18:00', activity: 'Welcome', description: 'Introduction and welcome' },
          { time: '18:30', activity: 'Main Activity', description: 'Main event activities' }
        ],
        additionalInfo: 'Additional information about the event',
        contactEmail: 'organizer@example.com',
        contactPhone: '+995 123 456 789',
        website: 'https://example.com',
        socialMedia: {
          facebook: 'https://facebook.com/example',
          instagram: 'https://instagram.com/example'
        },
        cancellationPolicy: 'Free cancellation up to 24 hours before',
        refundPolicy: 'Full refund available',
        transportation: ['Metro line 1', 'Bus 37'],
        parking: 'limited',
        accessibility: ['Wheelchair accessible'],
        photos: [],
        documents: []
      };

      setFormData(mockEventData);
    }
  }, [eventId]);

  // Get minimum time (current time + 1 hour)
  const getMinTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toTimeString().slice(0, 5);
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addHighlight = () => {
    if (newHighlight.trim() && !formData.highlights.includes(newHighlight.trim())) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()]
      }));
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addAgendaItem = () => {
    if (newAgendaTime.trim() && newAgendaActivity.trim()) {
      setFormData(prev => ({
        ...prev,
        agenda: [...prev.agenda, {
          time: newAgendaTime.trim(),
          activity: newAgendaActivity.trim(),
          description: newAgendaDescription.trim()
        }]
      }));
      setNewAgendaTime('');
      setNewAgendaActivity('');
      setNewAgendaDescription('');
    }
  };

  const removeAgendaItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const addTransportation = () => {
    if (newTransportation.trim() && !formData.transportation.includes(newTransportation.trim())) {
      setFormData(prev => ({
        ...prev,
        transportation: [...prev.transportation, newTransportation.trim()]
      }));
      setNewTransportation('');
    }
  };

  const removeTransportation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      transportation: prev.transportation.filter((_, i) => i !== index)
    }));
  };

  const addAccessibility = () => {
    if (newAccessibility.trim() && !formData.accessibility.includes(newAccessibility.trim())) {
      setFormData(prev => ({
        ...prev,
        accessibility: [...prev.accessibility, newAccessibility.trim()]
      }));
      setNewAccessibility('');
    }
  };

  const removeAccessibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      accessibility: prev.accessibility.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
              // Update event in localStorage with safe fallback
        try {
          const existingEvents = JSON.parse(localStorage.getItem('hostedEvents') || '[]');
          const updatedEvents = existingEvents.map((event: any) =>
            event.id === eventId ? { ...event, ...formData } : event
          );
          localStorage.setItem('hostedEvents', JSON.stringify(updatedEvents));
        } catch (error) {
          console.warn('Failed to update hostedEvents localStorage:', error);
          // Fallback: create new array with updated event
          localStorage.setItem('hostedEvents', JSON.stringify([{ id: eventId, ...formData }]));
        }
      
      // Navigate back to my events page
      navigate('/my-events');
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.description.trim() && formData.category;
      case 2:
        return formData.date && formData.time && formData.location.trim();
      case 3:
        return formData.maxParticipants > 0;
      case 4:
        return formData.aboutEvent.trim();
      case 5:
        return true; // Agenda is optional
      case 6:
        // At least one contact method must be provided
        return (formData.contactEmail.trim() || formData.contactPhone.trim()) && 
               formData.cancellationPolicy.trim() && 
               formData.refundPolicy.trim();
      case 7:
        return true; // Preview step
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Event Title *</Label>
              <Input
                id="title"
                placeholder="Enter event title..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-2 hover:border-primary/50 focus:border-primary transition-colors duration-200"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Short Description *</Label>
              <Textarea
                id="description"
                placeholder="Brief overview of your event (will appear in event cards)..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-2 min-h-[80px] resize-none"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/200 characters
              </p>
            </div>

            <div>
              <Label htmlFor="aboutEvent" className="text-sm font-medium">About This Event *</Label>
              <Textarea
                id="aboutEvent"
                placeholder="Detailed description of your event, what participants can expect, and why they should join..."
                value={formData.aboutEvent}
                onChange={(e) => handleInputChange('aboutEvent', e.target.value)}
                className="mt-2 min-h-[120px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-2 hover:border-primary/50 focus:border-primary transition-colors duration-200">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value} className="hover:bg-primary/10">
                      <span className="mr-2 text-lg">{category.icon}</span>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type" className="text-sm font-medium">Event Type *</Label>
              <Select value={formData.type} onValueChange={(value: 'in-person' | 'virtual' | 'hybrid') => handleInputChange('type', value)}>
                <SelectTrigger className="mt-2 hover:border-primary/50 focus:border-primary transition-colors duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="hover:bg-primary/10">
                      <span className="mr-2 text-lg">{type.icon}</span>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language" className="text-sm font-medium">Primary Language</Label>
              <Input
                id="language"
                placeholder="e.g., English, Georgian, etc."
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="mt-2 hover:border-primary/50 focus:border-primary transition-colors duration-200"
              />
            </div>

            <div>
              <Label htmlFor="ageRestriction" className="text-sm font-medium">Age Restriction</Label>
              <Select value={formData.ageRestriction} onValueChange={(value: '18+' | '21+' | 'all-ages') => handleInputChange('ageRestriction', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  {ageRestrictions.map(age => (
                    <SelectItem key={age.value} value={age.value}>
                      {age.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
                <EventDatePicker
                  id="date"
                  value={formData.date}
                  onChange={(date) => handleInputChange('date', date)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-sm font-medium">Time *</Label>
                <TimePicker
                  id="time"
                  value={formData.time}
                  onChange={(time) => handleInputChange('time', time)}
                  min={getMinTime()}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes) *</Label>
              <Select value={formData.duration.toString()} onValueChange={(value) => handleInputChange('duration', parseInt(value))}>
                <SelectTrigger className="mt-2 hover:border-primary/50 focus:border-primary transition-colors duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  <SelectItem value="30" className="hover:bg-primary/10">30 minutes</SelectItem>
                  <SelectItem value="60" className="hover:bg-primary/10">1 hour</SelectItem>
                  <SelectItem value="90" className="hover:bg-primary/10">1.5 hours</SelectItem>
                  <SelectItem value="120" className="hover:bg-primary/10">2 hours</SelectItem>
                  <SelectItem value="180" className="hover:bg-primary/10">3 hours</SelectItem>
                  <SelectItem value="240" className="hover:bg-primary/10">4 hours</SelectItem>
                  <SelectItem value="300" className="hover:bg-primary/10">5 hours</SelectItem>
                  <SelectItem value="360" className="hover:bg-primary/10">6 hours</SelectItem>
                  <SelectItem value="480" className="hover:bg-primary/10">8 hours</SelectItem>
                  <SelectItem value="720" className="hover:bg-primary/10">12 hours</SelectItem>
                  <SelectItem value="1440" className="hover:bg-primary/10">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="mt-2 hover:border-primary/50 focus:border-primary transition-colors duration-200"
              />
            </div>

            {formData.type === 'in-person' && (
              <div>
                <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                <Input
                  id="address"
                  placeholder="Full address or meeting point"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-2 hover:border-primary/50 focus:border-primary transition-colors duration-200"
                />
              </div>
            )}

            {(formData.type === 'virtual' || formData.type === 'hybrid') && (
              <div>
                <Label htmlFor="virtualMeetingLink" className="text-sm font-medium">Virtual Meeting Link</Label>
                <Input
                  id="virtualMeetingLink"
                  placeholder="Zoom, Google Meet, or other platform link"
                  value={formData.virtualMeetingLink}
                  onChange={(e) => handleInputChange('virtualMeetingLink', e.target.value)}
                  className="mt-2 hover:border-primary/50 focus:border-primary transition-colors duration-200"
                />
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="maxParticipants" className="text-sm font-medium">Maximum Participants *</Label>
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                max="1000"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm font-medium">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-40">
                    {currencies.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dressCode" className="text-sm font-medium">Dress Code</Label>
              <Input
                id="dressCode"
                placeholder="e.g., Casual, Business casual, Formal"
                value={formData.dressCode}
                onChange={(e) => handleInputChange('dressCode', e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Private Event</Label>
                <p className="text-xs text-muted-foreground">Only invited participants can join</p>
              </div>
              <Switch
                checked={formData.isPrivate}
                onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Requirements</Label>
              <p className="text-xs text-muted-foreground mb-2">What participants need to bring or prepare</p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a requirement..."
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  className="flex-1"
                />
                <Button type="button" onClick={addRequirement} size="sm" className="shrink-0">
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {formData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="gap-1 max-w-full">
                    <span className="truncate">{req}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent shrink-0"
                      onClick={() => removeRequirement(index)}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Highlights</Label>
              <p className="text-xs text-muted-foreground mb-2">Special features or benefits of your event</p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a highlight..."
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
                  className="flex-1"
                />
                <Button type="button" onClick={addHighlight} size="sm" className="shrink-0">
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {formData.highlights.map((highlight, index) => (
                  <Badge key={index} variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200 max-w-full">
                    <span className="truncate">✨ {highlight}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent text-green-700 shrink-0"
                      onClick={() => removeHighlight(index)}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <p className="text-xs text-muted-foreground mb-2">Help people discover your event</p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} size="sm" className="shrink-0">
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="gap-1 max-w-full">
                    <span className="truncate">{tag}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent shrink-0"
                      onClick={() => removeTag(index)}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Event Image</Label>
              <p className="text-xs text-muted-foreground mb-2">Upload a cover image for your event</p>
              <div className="border-2 border-dashed border-border-soft rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Event Agenda</Label>
              <p className="text-xs text-muted-foreground mb-2">Create a detailed schedule for your event</p>
              
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-3 gap-2">
                  <TimePicker
                    placeholder="Time"
                    value={newAgendaTime}
                    onChange={(time) => setNewAgendaTime(time)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Activity"
                    value={newAgendaActivity}
                    onChange={(e) => setNewAgendaActivity(e.target.value)}
                    className="text-sm col-span-2"
                  />
                </div>
                <Input
                  placeholder="Description (optional)"
                  value={newAgendaDescription}
                  onChange={(e) => setNewAgendaDescription(e.target.value)}
                  className="text-sm"
                />
                <Button type="button" onClick={addAgendaItem} size="sm" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Agenda Item
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.agenda.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {item.time}
                        </Badge>
                        <span className="font-medium text-sm">{item.activity}</span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAgendaItem(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="contactEmail" className="text-sm font-medium">Contact Email</Label>
              <Input
                id="contactEmail"
                placeholder="Your email address"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="contactPhone" className="text-sm font-medium">Contact Phone</Label>
              <Input
                id="contactPhone"
                placeholder="Your phone number"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="website" className="text-sm font-medium">Your Website</Label>
              <Input
                id="website"
                placeholder="Your personal or organization website URL"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="socialMedia" className="text-sm font-medium">Social Media</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="facebook" className="text-xs">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/your-event"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleInputChange('socialMedia', { ...formData.socialMedia, facebook: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram" className="text-xs">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/your-event"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleInputChange('socialMedia', { ...formData.socialMedia, instagram: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter" className="text-xs">Twitter</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/your-event"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => handleInputChange('socialMedia', { ...formData.socialMedia, twitter: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin" className="text-xs">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/your-event"
                    value={formData.socialMedia.linkedin}
                    onChange={(e) => handleInputChange('socialMedia', { ...formData.socialMedia, linkedin: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="cancellationPolicy" className="text-sm font-medium">Cancellation Policy</Label>
              <Textarea
                id="cancellationPolicy"
                placeholder="What happens if participants need to cancel?"
                value={formData.cancellationPolicy}
                onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                className="mt-2 min-h-[80px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="refundPolicy" className="text-sm font-medium">Refund Policy</Label>
              <Textarea
                id="refundPolicy"
                placeholder="What is your refund policy for paid events?"
                value={formData.refundPolicy}
                onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
                className="mt-2 min-h-[80px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="additionalInfo" className="text-sm font-medium">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any other important information participants should know?"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                className="mt-2 min-h-[80px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="transportation" className="text-sm font-medium">Getting There</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add transportation option (e.g., Metro line 1, Bus 37)"
                    value={newTransportation}
                    onChange={(e) => setNewTransportation(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTransportation} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.transportation.map((transport, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {transport}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent shrink-0 ml-2"
                        onClick={() => removeTransportation(index)}
                      >
                        <X size={12} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="parking" className="text-sm font-medium">Parking Available</Label>
              <Select value={formData.parking} onValueChange={(value: 'yes' | 'no' | 'limited' | 'paid') => handleInputChange('parking', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  <SelectItem value="yes">Yes, free parking</SelectItem>
                  <SelectItem value="paid">Yes, paid parking</SelectItem>
                  <SelectItem value="limited">Limited parking</SelectItem>
                  <SelectItem value="no">No parking available</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accessibility" className="text-sm font-medium">Accessibility</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add accessibility feature (e.g., Wheelchair accessible, Sign language interpreter)"
                    value={newAccessibility}
                    onChange={(e) => setNewAccessibility(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addAccessibility} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.accessibility.map((access, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {access}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent shrink-0 ml-2"
                        onClick={() => removeAccessibility(index)}
                      >
                        <X size={12} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Preview Your Event</h3>
              <p className="text-sm text-muted-foreground">Review all details before saving changes</p>
            </div>

            {/* Contact Information */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {formData.contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail size={16} />
                      <span>{formData.contactEmail}</span>
                    </div>
                  )}
                  {formData.contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={16} />
                      <span>{formData.contactPhone}</span>
                    </div>
                  )}
                  {formData.website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe size={16} />
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-muted-foreground hover:text-foreground"
                        onClick={() => window.open(formData.website, '_blank')}
                      >
                        Visit website
                      </Button>
                    </div>
                  )}
                  {Object.values(formData.socialMedia).some(social => social) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Social Media:</span>
                      <div className="flex gap-2">
                        {formData.socialMedia.facebook && (
                          <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                            Facebook
                          </Button>
                        )}
                        {formData.socialMedia.instagram && (
                          <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                            Instagram
                          </Button>
                        )}
                        {formData.socialMedia.twitter && (
                          <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                            Twitter
                          </Button>
                        )}
                        {formData.socialMedia.linkedin && (
                          <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                            LinkedIn
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border-soft">
              <CardContent className="p-0">
                {formData.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={formData.image}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <div className="absolute top-3 left-3">
                      <Badge variant="glass" className="bg-white/90 text-black border-black/20">
                        {eventTypes.find(t => t.value === formData.type)?.icon} {formData.type}
                      </Badge>
                    </div>
                    
                    <div className="absolute bottom-3 right-3">
                      <Badge variant="glass" className="bg-white/90 text-black font-semibold">
                        {formData.price === 0 ? 'Free' : `${formData.price} ${formData.currency}`}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs h-6 px-2">
                      {categories.find(cat => cat.value === formData.category)?.icon} {categories.find(cat => cat.value === formData.category)?.label}
                    </Badge>
                    {formData.isPrivate && (
                      <Badge variant="outline" className="text-xs h-6 px-2 bg-red-50 text-red-700 border-red-200">
                        <Lock size={12} className="mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg leading-tight mb-1">{formData.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{formData.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={16} />
                      <span>{formData.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={16} />
                      <span>{formData.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin size={16} />
                      <span className="truncate">{formData.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users size={16} />
                      <span>0/{formData.maxParticipants}</span>
                    </div>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs h-6 px-2">
                          {tag}
                        </Badge>
                      ))}
                      {formData.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{formData.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {formData.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.highlights.slice(0, 2).map((highlight, index) => (
                        <Badge key={index} variant="outline" className="text-xs h-6 px-2 bg-green-50 text-green-700 border-green-200">
                          ✨ {highlight}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };



  return (
    <div className="min-h-screen app-gradient-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-24 right-12 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-32 left-8 w-20 w-20 bg-gradient-secondary rounded-xl blur-xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-6 w-16 h-16 bg-gradient-accent rounded-full blur-lg animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <TopBar 
        title="Edit Event" 
        showBack={true}
        onBack={() => navigate(-1)}
      />
      
      <div className="px-4 py-5 max-w-md mx-auto space-y-5 relative z-10 content-safe-top pb-24">
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Step {currentStep} of {steps.length}</h2>
            <span className="text-sm text-muted-foreground font-medium">
              {Math.round((currentStep / steps.length) * 100)}%
            </span>
          </div>
          
          {/* Steps Line */}
          <div className="relative">
            <div className="h-1 bg-muted rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
            
            {/* Step Icons */}
            <div className="flex justify-between -mt-2">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                    step.number === currentStep
                      ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30'
                      : step.number < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.number < currentStep ? '✓' : step.icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-medium border-border-soft hover:shadow-large transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className="text-2xl">{steps[currentStep - 1]?.icon}</span>
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {steps[currentStep - 1]?.title}
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground ml-11">
              {steps[currentStep - 1]?.description}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="animate-fade-in">
              {renderStepContent()}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex-1 hover:scale-105 transition-transform duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={nextStep}
            disabled={currentStep === steps.length}
            className="flex-1 hover:scale-105 transition-transform duration-200"
          >
            Next
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>

        {/* Save Button - Always Visible */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isStepValid()}
          className="w-full hover:scale-105 transition-transform duration-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default EditEvent;

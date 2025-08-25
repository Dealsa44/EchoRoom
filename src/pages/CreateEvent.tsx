import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Send
} from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { useApp } from '@/hooks/useApp';

interface EventFormData {
  title: string;
  description: string;
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
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  ageRestriction: '18+' | '21+' | 'all-ages';
  dressCode: string;
  requirements: string[];
  highlights: string[];
  tags: string[];
  image: string;
}

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
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
    skillLevel: 'all-levels',
    ageRestriction: '18+',
    dressCode: '',
    requirements: [],
    highlights: [],
    tags: [],
    image: ''
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [newTag, setNewTag] = useState('');

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

  const skillLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all-levels', label: 'All Levels' }
  ];

  const ageRestrictions = [
    { value: '18+', label: '18+' },
    { value: '21+', label: '21+' },
    { value: 'all-ages', label: 'All Ages' }
  ];

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Title, description, category' },
    { number: 2, title: 'Details', description: 'Date, time, location' },
    { number: 3, title: 'Settings', description: 'Participants, pricing, privacy' },
    { number: 4, title: 'Extras', description: 'Requirements, highlights, tags' },
    { number: 5, title: 'Review', description: 'Preview and publish' }
  ];

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For now, just navigate back to events
    navigate('/events');
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
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your event in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a category" />
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
              <Label htmlFor="type" className="text-sm font-medium">Event Type *</Label>
              <Select value={formData.type} onValueChange={(value: 'in-person' | 'virtual' | 'hybrid') => handleInputChange('type', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="mr-2">{type.icon}</span>
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
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="skillLevel" className="text-sm font-medium">Skill Level</Label>
              <Select value={formData.skillLevel} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | 'all-levels') => handleInputChange('skillLevel', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
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
                <Input
                  id="date"
                  type="date"
                  min={getMinDate()}
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-sm font-medium">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  min={getMinTime()}
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes) *</Label>
              <Select value={formData.duration.toString()} onValueChange={(value) => handleInputChange('duration', parseInt(value))}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                  <SelectItem value="300">5 hours</SelectItem>
                  <SelectItem value="360">6 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                  <SelectItem value="720">12 hours</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
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
                className="mt-2"
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
                  className="mt-2"
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
                  className="mt-2"
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
                  <SelectContent>
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
              <Label htmlFor="ageRestriction" className="text-sm font-medium">Age Restriction</Label>
              <Select value={formData.ageRestriction} onValueChange={(value: '18+' | '21+' | 'all-ages') => handleInputChange('ageRestriction', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ageRestrictions.map(age => (
                    <SelectItem key={age.value} value={age.value}>
                      {age.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                />
                <Button type="button" onClick={addRequirement} size="sm">
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {req}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
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
                />
                <Button type="button" onClick={addHighlight} size="sm">
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.highlights.map((highlight, index) => (
                  <Badge key={index} variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                    ✨ {highlight}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent text-green-700"
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
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
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
              <div className="border-2 border-dashed border-border-soft rounded-lg p-6 text-center">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <Button variant="outline" size="sm">
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
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Preview Your Event</h3>
              <p className="text-sm text-muted-foreground">Review all details before publishing</p>
            </div>

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

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex-1"
              >
                {isPreviewMode ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {isPreviewMode ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Create Event
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.description.trim() && formData.category;
      case 2:
        return formData.date && formData.time && formData.location;
      case 3:
        return formData.maxParticipants > 0;
      case 4:
        return true; // Optional step
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen app-gradient-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-24 right-12 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-32 left-8 w-20 h-20 bg-gradient-secondary rounded-xl blur-xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-6 w-16 h-16 bg-gradient-accent rounded-full blur-lg animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <TopBar 
        title="Create Event" 
        showBack={true}
        onBack={() => navigate('/events')}
      />
      
      <div className="px-4 py-5 max-w-md mx-auto space-y-5 relative z-10 content-safe-top pb-24">
        {/* Progress Steps */}
        <Card className="shadow-medium border-border-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Step {currentStep} of {steps.length}</h2>
              <span className="text-sm text-muted-foreground">{Math.round((currentStep / steps.length) * 100)}%</span>
            </div>
            
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    step.number === currentStep
                      ? 'bg-primary/10 border border-primary/20'
                      : step.number < currentStep
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.number === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.number < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.number < currentStep ? '✓' : step.number}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      step.number === currentStep ? 'text-primary' : 'text-foreground'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="shadow-medium border-border-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep - 1]?.icon}
              {steps[currentStep - 1]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < 5 && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="flex-1"
            >
              Next
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}

        {/* Save Draft Button */}
        {currentStep < 5 && (
          <Button variant="ghost" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CreateEvent;

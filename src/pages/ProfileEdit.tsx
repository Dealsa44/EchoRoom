import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff, Save, User, Mail, Lock, Heart, Users, MessageCircle, ChevronDown, ChevronRight, Camera, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { updateUserProfile } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import { GenderIdentity, Orientation } from '@/contexts/app-utils';
import { getRandomProfileQuestions } from '@/data/profileQuestions';

// Define missing types
type Ethnicity = 'white' | 'black-african-american' | 'hispanic-latino' | 'asian' | 'native-american' | 'pacific-islander' | 'middle-eastern' | 'mixed-race' | 'other' | 'prefer-not-to-say';
type RelationshipType = 'casual-dating' | 'serious-relationship' | 'marriage' | 'open-relationship' | 'friends-with-benefits' | 'not-sure-yet' | 'prefer-not-to-say';
type Language = string;
type LanguageLevel = 'native' | 'c2' | 'c1' | 'b2' | 'b1' | 'a2' | 'a1' | '';

interface UserLanguage {
  language: Language;
  level: LanguageLevel;
}
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import PhotoUpload from '@/components/ui/PhotoUpload';
import { Photo, photoStorage } from '@/lib/photoStorage';

// CollapsibleSection Component
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ title, icon, children, defaultOpen = false }: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

const ProfileEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [languageErrors, setLanguageErrors] = useState<{[key: number]: string}>({});
  const [languageSearch, setLanguageSearch] = useState<{[key: number]: string}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // Load photos from localStorage on component mount
  const [photos, setPhotos] = useState<Photo[]>([]);
  
  useEffect(() => {
    if (user?.id) {
      const savedPhotos = photoStorage.loadPhotos(user.id);
      if (savedPhotos.length > 0) {
        setPhotos(savedPhotos);
      } else {
        // Convert existing photos to new format if no localStorage data
        const existingPhotos = user.photos || [];
        const convertedPhotos = existingPhotos.map((url, index) => ({
          id: `photo-${index}`,
          url,
          isVerified: index === 0,
          isPrimary: index === 0,
          uploadDate: new Date(),
          verificationStatus: index === 0 ? 'approved' as const : 'not_submitted' as const
        }));
        setPhotos(convertedPhotos);
      }
    }
  }, [user?.id, user?.photos]);

  // Store initial form data for comparison
  const initialFormData = useRef({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    interests: user?.interests || [] as string[],
    // New fields for identity and preferences
    genderIdentity: user?.genderIdentity || 'prefer-not-to-say' as GenderIdentity,
    orientation: user?.orientation || 'other' as Orientation,
    ethnicity: (user as any)?.ethnicity || 'prefer-not-to-say' as Ethnicity,
    lookingForRelationship: user?.lookingForRelationship || false,
    lookingForFriendship: user?.lookingForFriendship || false,
    relationshipType: (user as any)?.relationshipType || 'not-sure-yet' as RelationshipType,
    customGender: user?.customGender || '',
    customOrientation: user?.customOrientation || '',
    // Language and lifestyle fields
    languages: (user?.languages || []).map((lang: any) => {
      if (typeof lang === 'string') {
        return { language: lang, level: 'beginner' as LanguageLevel };
      } else if (lang && typeof lang === 'object') {
        // Handle the auth.ts format: { code, name, proficiency }
        if ('code' in lang && 'proficiency' in lang) {
          return { language: lang.code, level: lang.proficiency as LanguageLevel };
        }
        // Handle the Register.tsx format: { language, level }
        if ('language' in lang && 'level' in lang) {
          return { language: lang.language, level: lang.level as LanguageLevel };
        }
      }
      return { language: '', level: '' as LanguageLevel };
    }),
    chatStyle: user?.chatStyle || '',
    location: (user as any)?.location || '',
    smoking: user?.smoking || 'prefer-not-to-say',
    drinking: user?.drinking || 'prefer-not-to-say',
    hasChildren: user?.hasChildren || 'prefer-not-to-say',
    education: user?.education || 'prefer-not-to-say',
    occupation: user?.occupation || '',
    religion: user?.religion || 'prefer-not-to-say',
    politicalViews: user?.politicalViews || 'prefer-not-to-say',
    about: user?.about || ''
  });

  const [formData, setFormData] = useState(initialFormData.current);

  // Track changes and update hasUnsavedChanges
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData.current) ||
                      JSON.stringify(photos) !== JSON.stringify(user?.photos || []);
    setHasUnsavedChanges(hasChanges);
  }, [formData, photos, user?.photos]);

  // Handle navigation attempts
  const handleNavigation = (to: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(to);
      setShowUnsavedDialog(true);
    } else {
      navigate(to);
    }
  };

  const confirmNavigation = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const cancelNavigation = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate languages
    const newLanguageErrors: {[key: number]: string} = {};
    formData.languages.forEach((lang, index) => {
      if (!lang.language || !lang.level) {
        newLanguageErrors[index] = 'Please select both language and level';
      }
    });

    if (Object.keys(newLanguageErrors).length > 0) {
      setLanguageErrors(newLanguageErrors);
      // Scroll to the first error
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.border-red-500');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100); // Small delay to ensure the error state is rendered
      return; // Don't submit if there are validation errors
    }

    setLoading(true);

    try {
      // Save photos to localStorage
      const saveResult = photoStorage.savePhotos(user.id, photos);
      if (!saveResult.success) {
        // Handle storage quota exceeded
        console.error('Failed to save photos:', saveResult.error);
        // Continue with profile update even if photos fail to save
      }

      // Convert photos back to URL array for storage
      const photoUrls = photos.map(photo => photo.url);

      const updates: Record<string, unknown> = {
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        interests: formData.interests,
        photos: photoUrls, // Add photos to updates
        // New fields for identity and preferences
        genderIdentity: formData.genderIdentity,
        orientation: formData.orientation,
        ethnicity: formData.ethnicity,
        lookingForRelationship: formData.lookingForRelationship,
        lookingForFriendship: formData.lookingForFriendship,
        relationshipType: formData.lookingForRelationship ? formData.relationshipType : undefined,
        customGender: formData.customGender,
        customOrientation: formData.customOrientation,
        // Language and lifestyle fields
        languages: formData.languages.filter(lang => lang.language && lang.level),
        chatStyle: formData.chatStyle,
        location: formData.location,
        smoking: formData.smoking,
        drinking: formData.drinking,
        hasChildren: formData.hasChildren,
        education: formData.education,
        occupation: formData.occupation,
        religion: formData.religion,
        politicalViews: formData.politicalViews,
        about: formData.about,
      };

      // Include profile questions if they exist
      if (user.profileQuestions) {
        updates.profileQuestions = user.profileQuestions;
      }



      const result = await updateUserProfile(user.id, updates);

      if (result.success && result.user) {
        setUser(result.user as any);
        // Update initial form data to reflect saved state
        initialFormData.current = { ...formData };
        setHasUnsavedChanges(false);
        // Profile updated - toast removed per user request
        navigate('/profile');
      } else {
        // Update failed - toast removed per user request
      }
    } catch (error) {
      // Update error - toast removed per user request
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Edit Profile" showBack onBack={() => handleNavigation('/profile')} />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos Section */}
          <CollapsibleSection title="Profile Photos" icon={<Camera className="w-4 h-4" />} defaultOpen={false}>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Add up to 6 photos to your profile. Your first photo will be your primary photo.</p>
                <p className="mt-1">Verified photos increase your chances of getting matches!</p>
              </div>
              
              <PhotoUpload 
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={6}
              />
            </div>
          </CollapsibleSection>

          {/* Basic Information Section */}
          <CollapsibleSection title="Basic Information" icon={<User className="w-4 h-4" />} defaultOpen={false}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                autoComplete="off"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Languages</legend>
              <p className="text-xs text-muted-foreground mb-3">
                Add the languages you speak and your proficiency level for each
              </p>
              
              {/* Scrollable language container with max 3 visible */}
              <div className="max-h-[calc(3*4rem+2rem)] overflow-y-auto space-y-2 pr-2">
                {formData.languages.map((lang, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor={`language-${index}`} className="text-xs">Language</Label>
                      <Select 
                        name={`language-${index}`}
                        value={lang.language || ''} 
                        onValueChange={(value) => {
                          const newLanguages = [...formData.languages];
                          newLanguages[index] = { ...lang, language: value as Language };
                          setFormData(prev => ({ ...prev, languages: newLanguages }));
                          // Clear error when user selects a language
                          if (value && languageErrors[index]) {
                            setLanguageErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors[index];
                              return newErrors;
                            });
                          }
                        }}
                        onOpenChange={(open) => {
                          if (!open) {
                            // Clear search when dropdown closes
                            setLanguageSearch(prev => {
                              const newSearch = { ...prev };
                              delete newSearch[index];
                              return newSearch;
                            });
                          }
                        }}
                      >
                                              <SelectTrigger id={`language-${index}`} className={`h-9 ${languageErrors[index] ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder={lang.language ? undefined : "Select"}>
                          {lang.language === 'english' ? '🇺🇸 English' : 
                           lang.language === 'spanish' ? '🇪🇸 Spanish' :
                           lang.language === 'french' ? '🇫🇷 French' :
                           lang.language === 'german' ? '🇩🇪 German' :
                           lang.language === 'italian' ? '🇮🇹 Italian' :
                           lang.language === 'portuguese' ? '🇵🇹 Portuguese' :
                           lang.language === 'russian' ? '🇷🇺 Russian' :
                           lang.language === 'chinese' ? '🇨🇳 Chinese' :
                           lang.language === 'japanese' ? '🇯🇵 Japanese' :
                           lang.language === 'korean' ? '🇰🇷 Korean' :
                           lang.language === 'arabic' ? '🇸🇦 Arabic' :
                           lang.language === 'hindi' ? '🇮🇳 Hindi' :
                           lang.language === 'bengali' ? '🇧🇩 Bengali' :
                           lang.language === 'urdu' ? '🇵🇰 Urdu' :
                           lang.language === 'indonesian' ? '🇮🇩 Indonesian' :
                           lang.language === 'malay' ? '🇲🇾 Malay' :
                           lang.language === 'thai' ? '🇹🇭 Thai' :
                           lang.language === 'vietnamese' ? '🇻🇳 Vietnamese' :
                           lang.language === 'turkish' ? '🇹🇷 Turkish' :
                           lang.language === 'persian' ? '🇮🇷 Persian' :
                           lang.language === 'hebrew' ? '🇮🇱 Hebrew' :
                           lang.language === 'greek' ? '🇬🇷 Greek' :
                           lang.language === 'polish' ? '🇵🇱 Polish' :
                           lang.language === 'czech' ? '🇨🇿 Czech' :
                           lang.language === 'slovak' ? '🇸🇰 Slovak' :
                           lang.language === 'hungarian' ? '🇭🇺 Hungarian' :
                           lang.language === 'romanian' ? '🇷🇴 Romanian' :
                           lang.language === 'bulgarian' ? '🇧🇬 Bulgarian' :
                           lang.language === 'croatian' ? '🇭🇷 Croatian' :
                           lang.language === 'serbian' ? '🇷🇸 Serbian' :
                           lang.language === 'slovenian' ? '🇸🇮 Slovenian' :
                           lang.language === 'dutch' ? '🇳🇱 Dutch' :
                           lang.language === 'swedish' ? '🇸🇪 Swedish' :
                           lang.language === 'norwegian' ? '🇳🇴 Norwegian' :
                           lang.language === 'danish' ? '🇩🇰 Danish' :
                           lang.language === 'finnish' ? '🇫🇮 Finnish' :
                           lang.language === 'icelandic' ? '🇮🇸 Icelandic' :
                           lang.language === 'latvian' ? '🇱🇻 Latvian' :
                           lang.language === 'lithuanian' ? '🇱🇹 Lithuanian' :
                           lang.language === 'estonian' ? '🇪🇪 Estonian' :
                           lang.language === 'ukrainian' ? '🇺🇦 Ukrainian' :
                           lang.language === 'belarusian' ? '🇧🇾 Belarusian' :
                           lang.language === 'kazakh' ? '🇰🇿 Kazakh' :
                           lang.language === 'uzbek' ? '🇺🇿 Uzbek' :
                           lang.language === 'kyrgyz' ? '🇰🇬 Kyrgyz' :
                           lang.language === 'tajik' ? '🇹🇯 Tajik' :
                           lang.language === 'turkmen' ? '🇹🇲 Turkmen' :
                           lang.language === 'azerbaijani' ? '🇦🇿 Azerbaijani' :
                           lang.language === 'armenian' ? '🇦🇲 Armenian' :
                           lang.language === 'georgian' ? '🇬🇪 Georgian' :
                           lang.language === 'mongolian' ? '🇲🇳 Mongolian' :
                           lang.language === 'nepali' ? '🇳🇵 Nepali' :
                           lang.language === 'sinhala' ? '🇱🇰 Sinhala' :
                           lang.language === 'tamil' ? '🇮🇳 Tamil' :
                           lang.language === 'telugu' ? '🇮🇳 Telugu' :
                           lang.language === 'marathi' ? '🇮🇳 Marathi' :
                           lang.language === 'gujarati' ? '🇮🇳 Gujarati' :
                           lang.language === 'punjabi' ? '🇮🇳 Punjabi' :
                           lang.language === 'kannada' ? '🇮🇳 Kannada' :
                           lang.language === 'malayalam' ? '🇮🇳 Malayalam' :
                           lang.language === 'odia' ? '🇮🇳 Odia' :
                           lang.language === 'assamese' ? '🇮🇳 Assamese' :
                           lang.language === 'maithili' ? '🇮🇳 Maithili' :
                           lang.language === 'santali' ? '🇮🇳 Santali' :
                           lang.language === 'kashmiri' ? '🇮🇳 Kashmiri' :
                           lang.language === 'dogri' ? '🇮🇳 Dogri' :
                           lang.language === 'konkani' ? '🇮🇳 Konkani' :
                           lang.language === 'manipuri' ? '🇮🇳 Manipuri' :
                           lang.language === 'bodo' ? '🇮🇳 Bodo' :
                           lang.language === 'sanskrit' ? '🇮🇳 Sanskrit' :
                           lang.language === 'khmer' ? '🇰🇭 Khmer' :
                           lang.language === 'lao' ? '🇱🇦 Lao' :
                           lang.language === 'myanmar' ? '🇲🇲 Myanmar' :
                           lang.language === 'filipino' ? '🇵🇭 Filipino' :
                           lang.language === 'swahili' ? '🇹🇿 Swahili' :
                           lang.language === 'amharic' ? '🇪🇹 Amharic' :
                           lang.language === 'yoruba' ? '🇳🇬 Yoruba' :
                           lang.language === 'igbo' ? '🇳🇬 Igbo' :
                           lang.language === 'hausa' ? '🇳🇬 Hausa' :
                           lang.language === 'zulu' ? '🇿🇦 Zulu' :
                           lang.language === 'xhosa' ? '🇿🇦 Xhosa' :
                           lang.language === 'afrikaans' ? '🇿🇦 Afrikaans' :
                           lang.language === 'somali' ? '🇸🇴 Somali' :
                           lang.language === 'oromo' ? '🇪🇹 Oromo' :
                           lang.language === 'tigrinya' ? '🇪🇷 Tigrinya' :
                           lang.language === 'albanian' ? '🇦🇱 Albanian' :
                           lang.language === 'macedonian' ? '🇲🇰 Macedonian' :
                           lang.language === 'bosnian' ? '🇧🇦 Bosnian' :
                           lang.language === 'montenegrin' ? '🇲🇪 Montenegrin' :
                           lang.language === 'maltese' ? '🇲🇹 Maltese' :
                           lang.language === 'catalan' ? '🇪🇸 Catalan' :
                           lang.language === 'basque' ? '🇪🇸 Basque' :
                           lang.language === 'galician' ? '🇪🇸 Galician' :
                           lang.language === 'welsh' ? '🇬🇧 Welsh' :
                           lang.language === 'scottish' ? '🇬🇧 Scottish Gaelic' :
                           lang.language === 'irish' ? '🇮🇪 Irish' :
                           lang.language === 'breton' ? '🇫🇷 Breton' :
                           lang.language === 'corsican' ? '🇫🇷 Corsican' :
                           lang.language === 'occitan' ? '🇫🇷 Occitan' :
                           lang.language === 'luxembourgish' ? '🇱🇺 Luxembourgish' :
                           lang.language === 'frisian' ? '🇳🇱 Frisian' :
                           lang.language === 'faroese' ? '🇫🇴 Faroese' :
                           lang.language === 'greenlandic' ? '🇬🇱 Greenlandic' :
                           lang.language === 'sami' ? '🇳🇴 Sami' :
                           lang.language === 'karelian' ? '🇫🇮 Karelian' :
                           lang.language === 'votic' ? '🇪🇪 Votic' :
                           lang.language === 'livonian' ? '🇱🇻 Livonian' :
                           lang.language === 'ingrian' ? '🇷🇺 Ingrian' :
                           lang.language === 'veps' ? '🇷🇺 Veps' :
                           lang.language === 'ludic' ? '🇷🇺 Ludic' :
                           lang.language === 'kven' ? '🇳🇴 Kven' :
                           lang.language === 'meankieli' ? '🇫🇮 Meänkieli' :
                           lang.language === 'tornedalen' ? '🇸🇪 Tornedalen Finnish' :
                           lang.language || ''}
                        </SelectValue>
                      </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                          <div className="sticky top-0 z-10 bg-background border-b p-2">
                            <Label htmlFor="language-search" className="sr-only">Search languages</Label>
                            <Input
                              id={`language-search-${index}`}
                              name={`language-search-${index}`}
                              placeholder="Search..."
                              value={languageSearch[index] || ''}
                              onChange={(e) => setLanguageSearch(prev => ({ ...prev, [index]: e.target.value }))}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            {[
                              { value: 'english', label: '🇺🇸 English' },
                              { value: 'spanish', label: '🇪🇸 Spanish' },
                              { value: 'french', label: '🇫🇷 French' },
                              { value: 'german', label: '🇩🇪 German' },
                              { value: 'italian', label: '🇮🇹 Italian' },
                              { value: 'portuguese', label: '🇵🇹 Portuguese' },
                              { value: 'russian', label: '🇷🇺 Russian' },
                              { value: 'chinese', label: '🇨🇳 Chinese' },
                              { value: 'japanese', label: '🇯🇵 Japanese' },
                              { value: 'korean', label: '🇰🇷 Korean' },
                              { value: 'arabic', label: '🇸🇦 Arabic' },
                              { value: 'hindi', label: '🇮🇳 Hindi' },
                              { value: 'bengali', label: '🇧🇩 Bengali' },
                              { value: 'urdu', label: '🇵🇰 Urdu' },
                              { value: 'indonesian', label: '🇮🇩 Indonesian' },
                              { value: 'malay', label: '🇲🇾 Malay' },
                              { value: 'thai', label: '🇹🇭 Thai' },
                              { value: 'vietnamese', label: '🇻🇳 Vietnamese' },
                              { value: 'turkish', label: '🇹🇷 Turkish' },
                              { value: 'persian', label: '🇮🇷 Persian' },
                              { value: 'hebrew', label: '🇮🇱 Hebrew' },
                              { value: 'greek', label: '🇬🇷 Greek' },
                              { value: 'polish', label: '🇵🇱 Polish' },
                              { value: 'czech', label: '🇨🇿 Czech' },
                              { value: 'slovak', label: '🇸🇰 Slovak' },
                              { value: 'hungarian', label: '🇭🇺 Hungarian' },
                              { value: 'romanian', label: '🇷🇴 Romanian' },
                              { value: 'bulgarian', label: '🇧🇬 Bulgarian' },
                              { value: 'croatian', label: '🇭🇷 Croatian' },
                              { value: 'serbian', label: '🇷🇸 Serbian' },
                              { value: 'slovenian', label: '🇸🇮 Slovenian' },
                              { value: 'dutch', label: '🇳🇱 Dutch' },
                              { value: 'swedish', label: '🇸🇪 Swedish' },
                              { value: 'norwegian', label: '🇳🇴 Norwegian' },
                              { value: 'danish', label: '🇩🇰 Danish' },
                              { value: 'finnish', label: '🇫🇮 Finnish' },
                              { value: 'icelandic', label: '🇮🇸 Icelandic' },
                              { value: 'latvian', label: '🇱🇻 Latvian' },
                              { value: 'lithuanian', label: '🇱🇹 Lithuanian' },
                              { value: 'estonian', label: '🇪🇪 Estonian' },
                              { value: 'ukrainian', label: '🇺🇦 Ukrainian' },
                              { value: 'belarusian', label: '🇧🇾 Belarusian' },
                              { value: 'kazakh', label: '🇰🇿 Kazakh' },
                              { value: 'uzbek', label: '🇺🇿 Uzbek' },
                              { value: 'kyrgyz', label: '🇰🇬 Kyrgyz' },
                              { value: 'tajik', label: '🇹🇯 Tajik' },
                              { value: 'turkmen', label: '🇹🇲 Turkmen' },
                              { value: 'azerbaijani', label: '🇦🇿 Azerbaijani' },
                              { value: 'armenian', label: '🇦🇲 Armenian' },
                              { value: 'georgian', label: '🇬🇪 Georgian' },
                              { value: 'mongolian', label: '🇲🇳 Mongolian' },
                              { value: 'nepali', label: '🇳🇵 Nepali' },
                              { value: 'sinhala', label: '🇱🇰 Sinhala' },
                              { value: 'tamil', label: '🇮🇳 Tamil' },
                              { value: 'telugu', label: '🇮🇳 Telugu' },
                              { value: 'marathi', label: '🇮🇳 Marathi' },
                              { value: 'gujarati', label: '🇮🇳 Gujarati' },
                              { value: 'punjabi', label: '🇮🇳 Punjabi' },
                              { value: 'kannada', label: '🇮🇳 Kannada' },
                              { value: 'malayalam', label: '🇮🇳 Malayalam' },
                              { value: 'odia', label: '🇮🇳 Odia' },
                              { value: 'assamese', label: '🇮🇳 Assamese' },
                              { value: 'maithili', label: '🇮🇳 Maithili' },
                              { value: 'santali', label: '🇮🇳 Santali' },
                              { value: 'kashmiri', label: '🇮🇳 Kashmiri' },
                              { value: 'dogri', label: '🇮🇳 Dogri' },
                              { value: 'konkani', label: '🇮🇳 Konkani' },
                              { value: 'manipuri', label: '🇮🇳 Manipuri' },
                              { value: 'bodo', label: '🇮🇳 Bodo' },
                              { value: 'sanskrit', label: '🇮🇳 Sanskrit' },
                              { value: 'khmer', label: '🇰🇭 Khmer' },
                              { value: 'lao', label: '🇱🇦 Lao' },
                              { value: 'myanmar', label: '🇲🇲 Myanmar' },
                              { value: 'filipino', label: '🇵🇭 Filipino' },
                              { value: 'swahili', label: '🇹🇿 Swahili' },
                              { value: 'amharic', label: '🇪🇹 Amharic' },
                              { value: 'yoruba', label: '🇳🇬 Yoruba' },
                              { value: 'igbo', label: '🇳🇬 Igbo' },
                              { value: 'hausa', label: '🇳🇬 Hausa' },
                              { value: 'zulu', label: '🇿🇦 Zulu' },
                              { value: 'xhosa', label: '🇿🇦 Xhosa' },
                              { value: 'afrikaans', label: '🇿🇦 Afrikaans' },
                              { value: 'somali', label: '🇸🇴 Somali' },
                              { value: 'oromo', label: '🇪🇹 Oromo' },
                              { value: 'tigrinya', label: '🇪🇷 Tigrinya' },
                              { value: 'albanian', label: '🇦🇱 Albanian' },
                              { value: 'macedonian', label: '🇲🇰 Macedonian' },
                              { value: 'bosnian', label: '🇧🇦 Bosnian' },
                              { value: 'montenegrin', label: '🇲🇪 Montenegrin' },
                              { value: 'maltese', label: '🇲🇹 Maltese' },
                              { value: 'catalan', label: '🇪🇸 Catalan' },
                              { value: 'basque', label: '🇪🇸 Basque' },
                              { value: 'galician', label: '🇪🇸 Galician' },
                              { value: 'welsh', label: '🇬🇧 Welsh' },
                              { value: 'scottish', label: '🇬🇧 Scottish Gaelic' },
                              { value: 'irish', label: '🇮🇪 Irish' },
                              { value: 'breton', label: '🇫🇷 Breton' },
                              { value: 'corsican', label: '🇫🇷 Corsican' },
                              { value: 'occitan', label: '🇫🇷 Occitan' },
                              { value: 'luxembourgish', label: '🇱🇺 Luxembourgish' },
                              { value: 'frisian', label: '🇳🇱 Frisian' },
                              { value: 'faroese', label: '🇫🇴 Faroese' },
                              { value: 'greenlandic', label: '🇬🇱 Greenlandic' },
                              { value: 'sami', label: '🇳🇴 Sami' },
                              { value: 'karelian', label: '🇫🇮 Karelian' },
                              { value: 'votic', label: '🇪🇪 Votic' },
                              { value: 'livonian', label: '🇱🇻 Livonian' },
                              { value: 'ingrian', label: '🇷🇺 Ingrian' },
                              { value: 'veps', label: '🇷🇺 Veps' },
                              { value: 'ludic', label: '🇷🇺 Ludic' },
                              { value: 'kven', label: '🇳🇴 Kven' },
                              { value: 'meankieli', label: '🇫🇮 Meänkieli' },
                              { value: 'tornedalen', label: '🇸🇪 Tornedalen Finnish' }
                            ]
                              .filter(lang => 
                                lang.label.toLowerCase().includes((languageSearch[index] || '').toLowerCase()) ||
                                lang.value.toLowerCase().includes((languageSearch[index] || '').toLowerCase())
                              )
                              .filter(lang => 
                                // Filter out already selected languages (excluding the current language being edited)
                                !formData.languages.some((selectedLang, selectedIndex) => 
                                  selectedLang.language === lang.value && selectedIndex !== index
                                )
                              )
                              .map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`level-${index}`} className="text-xs">Level</Label>
                      <Select 
                        name={`level-${index}`}
                        value={lang.level || ''} 
                        onValueChange={(value) => {
                          const newLanguages = [...formData.languages];
                          newLanguages[index] = { ...lang, level: value as LanguageLevel };
                          setFormData(prev => ({ ...prev, languages: newLanguages }));
                          // Clear error when user selects a level
                          if (value && languageErrors[index]) {
                            setLanguageErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors[index];
                              return newErrors;
                            });
                          }
                        }}
                      >
                                              <SelectTrigger id={`level-${index}`} className={`h-9 ${languageErrors[index] ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select">
                          {lang.level === 'native' ? 'NS' : lang.level?.toUpperCase()}
                        </SelectValue>
                      </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="native">Native Speaker</SelectItem>
                          <SelectItem value="c2">C2</SelectItem>
                          <SelectItem value="c1">C1</SelectItem>
                          <SelectItem value="b2">B2</SelectItem>
                          <SelectItem value="b1">B1</SelectItem>
                          <SelectItem value="a2">A2</SelectItem>
                          <SelectItem value="a1">A1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 px-2"
                      onClick={() => {
                        const newLanguages = formData.languages.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, languages: newLanguages }));
                        // Clear error when removing language
                        setLanguageErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors[index];
                          return newErrors;
                        });
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  {languageErrors[index] && (
                    <p className="text-xs text-red-500 mt-1">{languageErrors[index]}</p>
                  )}
                </div>
              ))}
              </div>
              
              {/* Fixed Add Language button */}
              <div className="pt-2 border-t">
                <Label htmlFor="add-language-btn" className="sr-only">Add Language</Label>
                <Button
                  id="add-language-btn"
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      languages: [...prev.languages, { language: '', level: '' }]
                    }));
                    // Clear any existing errors when adding a new language
                    setLanguageErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors[formData.languages.length];
                      return newErrors;
                    });
                  }}
                >
                  + Add Language
                </Button>
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
                autoComplete="address-level2"
              />
            </div>



            {/* Interests Section */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Interests</legend>
              <p className="text-xs text-muted-foreground">
                Select at least 3 interests ({formData.interests.length}/3 minimum)
              </p>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {['Philosophy', 'Books', 'Art', 'Science', 'Technology', 'Music', 
                    'Travel', 'Mindfulness', 'Languages', 'Psychology', 'Nature', 'Culture'].map((interest) => (
                    <Button
                      key={interest}
                      type="button"
                      variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFormData(prev => {
                          const isSelected = prev.interests.includes(interest);
                          // Prevent deselecting if only 3 interests are selected
                          if (isSelected && prev.interests.length <= 3) {
                            return prev; // Don't change anything
                          }
                          return {
                            ...prev,
                            interests: isSelected
                              ? prev.interests.filter(i => i !== interest)
                              : [...prev.interests, interest]
                          };
                        });
                      }}
                      className={`text-xs ${
                        formData.interests.includes(interest) && formData.interests.length <= 3 
                          ? 'cursor-not-allowed opacity-80' 
                          : ''
                      }`}
                      disabled={formData.interests.includes(interest) && formData.interests.length <= 3}
                      aria-label={`Select ${interest} as an interest`}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>
            </fieldset>
          </CollapsibleSection>

          {/* Identity & Preferences Section */}
          <CollapsibleSection title="Identity & Preferences" icon={<Users className="w-4 h-4" />}>
            <div className="space-y-2">
              <Label htmlFor="genderIdentity">Gender Identity</Label>
              <Select 
                name="genderIdentity"
                value={formData.genderIdentity} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, genderIdentity: value as GenderIdentity }))}
              >
                <SelectTrigger id="genderIdentity">
                  <SelectValue placeholder="Select your gender identity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="transgender">Transgender</SelectItem>
                  <SelectItem value="agender">Agender</SelectItem>
                  <SelectItem value="genderfluid">Genderfluid</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {formData.genderIdentity === 'other' && (
                <Input
                  id="customGender"
                  name="customGender"
                  placeholder="Please specify your gender identity"
                  value={formData.customGender}
                  onChange={(e) => setFormData(prev => ({ ...prev, customGender: e.target.value }))}
                  autoComplete="off"
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select 
                name="orientation"
                value={formData.orientation} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, orientation: value as Orientation }))}
              >
                <SelectTrigger id="orientation">
                  <SelectValue placeholder="Select your orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heterosexual">Heterosexual</SelectItem>
                  <SelectItem value="homosexual">Homosexual</SelectItem>
                  <SelectItem value="bisexual">Bisexual</SelectItem>
                  <SelectItem value="asexual">Asexual</SelectItem>
                  <SelectItem value="pansexual">Pansexual</SelectItem>
                  <SelectItem value="queer">Queer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formData.orientation === 'other' && (
                <Input
                  id="customOrientation"
                  name="customOrientation"
                  placeholder="Please specify your orientation"
                  value={formData.customOrientation}
                  onChange={(e) => setFormData(prev => ({ ...prev, customOrientation: e.target.value }))}
                  autoComplete="off"
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ethnicity">Ethnicity</Label>
              <Select 
                name="ethnicity"
                value={formData.ethnicity} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, ethnicity: value as Ethnicity }))}
              >
                <SelectTrigger id="ethnicity">
                  <SelectValue placeholder="Select your ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="black-african-american">Black/African American</SelectItem>
                  <SelectItem value="hispanic-latino">Hispanic/Latino</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="native-american">Native American</SelectItem>
                  <SelectItem value="pacific-islander">Pacific Islander</SelectItem>
                  <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
                  <SelectItem value="mixed-race">Mixed Race</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chatStyle">Personality</Label>
              <Select 
                name="chatStyle"
                value={formData.chatStyle} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, chatStyle: value }))}
              >
                <SelectTrigger id="chatStyle">
                  <SelectValue placeholder="How do you prefer to communicate?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="introvert">Introvert - Thoughtful & Deep</SelectItem>
                  <SelectItem value="ambievert">Ambievert - Mix of Both</SelectItem>
                  <SelectItem value="extrovert">Extrovert - Social & Fun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lookingForRelationship" className="flex items-center gap-2">
                <span>Looking for a relationship?</span>
                <Switch
                  id="lookingForRelationship"
                  name="lookingForRelationship"
                  checked={formData.lookingForRelationship}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lookingForRelationship: checked }))}
                />
              </Label>
              <p className="text-xs text-muted-foreground">
                This will help others understand your intentions and improve your matches.
              </p>
            </div>

            {formData.lookingForRelationship && (
                          <div className="space-y-2">
              <Label htmlFor="relationshipType">What type of relationship?</Label>
              <Select 
                name="relationshipType"
                value={formData.relationshipType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, relationshipType: value as RelationshipType }))}
              >
                <SelectTrigger id="relationshipType">
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual-dating">Casual Dating</SelectItem>
                    <SelectItem value="serious-relationship">Serious Relationship</SelectItem>
                    <SelectItem value="marriage">Marriage</SelectItem>
                    <SelectItem value="open-relationship">Open Relationship</SelectItem>
                    <SelectItem value="friends-with-benefits">Friends with Benefits</SelectItem>
                    <SelectItem value="not-sure-yet">Not Sure Yet</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="lookingForFriendship" className="flex items-center gap-2">
                <span>Looking for friendship?</span>
                <Switch
                  id="lookingForFriendship"
                  name="lookingForFriendship"
                  checked={formData.lookingForFriendship}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lookingForFriendship: checked }))}
                />
              </Label>
              <p className="text-xs text-muted-foreground">
                Connect with people for meaningful friendships and language practice.
              </p>
            </div>
          </CollapsibleSection>

          {/* Lifestyle & Background Section */}
          <CollapsibleSection title="Lifestyle & Background" icon={<User className="w-4 h-4" />}>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="about">About</Label>
                    <Textarea
                      id="about"
                      name="about"
                      placeholder="Tell others about yourself, your interests, and what you're looking for..."
                      value={formData.about}
                      onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smoking">Smoking</Label>
                      <Select 
                        name="smoking"
                        value={formData.smoking} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, smoking: value as 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say' }))}
                      >
                        <SelectTrigger id="smoking">
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="casually">Casually</SelectItem>
                          <SelectItem value="socially">Socially</SelectItem>
                          <SelectItem value="regularly">Regularly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="drinking">Drinking</Label>
                      <Select 
                        name="drinking"
                        value={formData.drinking} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, drinking: value as 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say' }))}
                      >
                        <SelectTrigger id="drinking">
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="casually">Casually</SelectItem>
                          <SelectItem value="socially">Socially</SelectItem>
                          <SelectItem value="regularly">Regularly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hasChildren">Children</Label>
                      <Select 
                        name="hasChildren"
                        value={formData.hasChildren} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, hasChildren: value as 'no' | 'yes' | 'planning' | 'prefer-not-to-say' }))}
                      >
                        <SelectTrigger id="hasChildren">
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="planning">Planning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      <Select 
                        name="education"
                        value={formData.education} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, education: value as 'high-school' | 'bachelor' | 'master' | 'phd' | 'other' | 'prefer-not-to-say' }))}
                      >
                        <SelectTrigger id="education">
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="high-school">High School</SelectItem>
                          <SelectItem value="bachelor">Bachelor's</SelectItem>
                          <SelectItem value="master">Master's</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      placeholder="What do you do for work?"
                      value={formData.occupation}
                      onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Select 
                      name="religion"
                      value={formData.religion} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, religion: value as 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'atheist' | 'agnostic' | 'other' | 'prefer-not-to-say' }))}
                    >
                      <SelectTrigger id="religion">
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="christianity">Christianity</SelectItem>
                          <SelectItem value="islam">Islam</SelectItem>
                          <SelectItem value="judaism">Judaism</SelectItem>
                          <SelectItem value="hinduism">Hinduism</SelectItem>
                          <SelectItem value="buddhism">Buddhism</SelectItem>
                          <SelectItem value="atheist">Atheist</SelectItem>
                          <SelectItem value="agnostic">Agnostic</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="politicalViews">Political Views</Label>
                      <Select 
                        name="politicalViews"
                        value={formData.politicalViews} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, politicalViews: value as 'liberal' | 'conservative' | 'moderate' | 'apolitical' | 'other' | 'prefer-not-to-say' }))}
                      >
                        <SelectTrigger id="politicalViews">
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="liberal">Liberal</SelectItem>
                          <SelectItem value="conservative">Conservative</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="apolitical">Apolitical</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
          </CollapsibleSection>

          {/* Profile Questions Section */}
          <CollapsibleSection title="Tell Your Story" icon={<MessageCircle className="w-4 h-4" />}>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Answer some fun questions to help others get to know you better!
              </p>
              {user?.profileQuestions?.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <Label htmlFor={`profile-question-${index}`} className="text-sm font-medium">
                    {question.question}
                  </Label>
                  <Textarea
                    id={`profile-question-${index}`}
                    name={`profile-question-${index}`}
                    value={question.answer || ''}
                    onChange={(e) => {
                      const updatedQuestions = [...(user.profileQuestions || [])];
                      updatedQuestions[index] = { ...updatedQuestions[index], answer: e.target.value };
                      setUser({ ...user, profileQuestions: updatedQuestions });
                    }}
                    placeholder="Share your answer..."
                    className="min-h-[80px]"
                  />
                </div>
              ))}
              {(!user?.profileQuestions || user.profileQuestions.length === 0) && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    No profile questions yet
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const randomQuestions = getRandomProfileQuestions(5);
                      setUser({ ...user!, profileQuestions: randomQuestions });
                    }}
                  >
                    Add Profile Questions
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleSection>



          <Button
            type="submit"
            variant="cozy"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Unsaved Changes Dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelNavigation}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmNavigation}>
              Leave Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default ProfileEdit;
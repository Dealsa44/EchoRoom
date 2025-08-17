import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ArrowLeft, Eye, EyeOff, ArrowRight, ArrowLeft as ArrowLeftIcon, Check, User, Mail, Lock, Heart, Languages, MessageCircle, Camera, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { registerUser, RegisterData, validateAge, calculateAge } from '@/lib/auth';
import { GenderIdentity, Orientation } from '@/contexts/app-utils';

// Define missing types
type Ethnicity = 'white' | 'black-african-american' | 'hispanic-latino' | 'asian' | 'native-american' | 'pacific-islander' | 'middle-eastern' | 'mixed-race' | 'other' | 'prefer-not-to-say';
type RelationshipType = 'casual-dating' | 'serious-relationship' | 'marriage' | 'open-relationship' | 'friends-with-benefits' | 'not-sure-yet' | 'prefer-not-to-say';
type Language = string;
type LanguageLevel = 'native' | 'c2' | 'c1' | 'b2' | 'b1' | 'a2' | 'a1' | '';

interface UserLanguage {
  language: Language;
  level: LanguageLevel;
}
import RegistrationPhotoUpload from '@/components/ui/RegistrationPhotoUpload';
import { Photo, photoStorage } from '@/lib/photoStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type RegistrationStage = 'account' | 'profile' | 'interests' | 'identity' | 'lifestyle' | 'photos' | 'preferences';

const Register = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useApp();
  const [currentStage, setCurrentStage] = useState<RegistrationStage>('account');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    dateOfBirth: '',
    location: '',
    languages: [] as UserLanguage[],
    chatStyle: '',
    interests: [] as string[],
    // Fields for gender and orientation
    genderIdentity: 'prefer-not-to-say' as GenderIdentity,
    orientation: 'other' as Orientation,
    ethnicity: 'prefer-not-to-say' as Ethnicity,
    lookingForRelationship: false,
    lookingForFriendship: false,
    relationshipType: 'not-sure-yet' as RelationshipType,
    customGender: '',
    customOrientation: '',
    // Lifestyle fields
    smoking: 'prefer-not-to-say' as 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say',
    drinking: 'prefer-not-to-say' as 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say',
    hasChildren: 'prefer-not-to-say' as 'no' | 'yes' | 'planning' | 'prefer-not-to-say',
    education: 'prefer-not-to-say' as 'high-school' | 'bachelor' | 'master' | 'phd' | 'other' | 'prefer-not-to-say',
    occupation: '',
    religion: 'prefer-not-to-say' as 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'atheist' | 'agnostic' | 'other' | 'prefer-not-to-say',
    politicalViews: 'prefer-not-to-say' as 'liberal' | 'conservative' | 'moderate' | 'apolitical' | 'other' | 'prefer-not-to-say',
    about: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [languageErrors, setLanguageErrors] = useState<{[key: number]: string}>({});
  const [languageSearch, setLanguageSearch] = useState<{[key: number]: string}>({});

  const availableInterests = [
    'Philosophy', 'Books', 'Art', 'Science', 'Technology', 'Music', 
    'Travel', 'Mindfulness', 'Languages', 'Psychology', 'Nature', 'Culture'
  ];

  const stages: { key: RegistrationStage; title: string; description: string; icon: React.ReactNode }[] = [
    {
      key: 'account',
      title: 'Create Account',
      description: 'Set up your basic account information',
      icon: <User className="w-5 h-5" />
    },
    {
      key: 'profile',
      title: 'Language Profile',
      description: 'Tell us about your language skills',
      icon: <Languages className="w-5 h-5" />
    },
    {
      key: 'interests',
      title: 'Your Interests',
      description: 'Select topics that interest you',
      icon: <Heart className="w-5 h-5" />
    },
    {
      key: 'identity',
      title: 'Identity & Preferences',
      description: 'Tell us about yourself and who you\'re looking for',
      icon: <Heart className="w-5 h-5" />
    },
    {
      key: 'lifestyle',
      title: 'Lifestyle & Background',
      description: 'Tell us about your lifestyle and background',
      icon: <User className="w-5 h-5" />
    },
    {
      key: 'photos',
      title: 'Profile Photos',
      description: 'Add photos to boost your match potential',
      icon: <Camera className="w-5 h-5" />
    },
    {
      key: 'preferences',
      title: 'Personality',
      description: 'Choose how you prefer to communicate',
      icon: <MessageCircle className="w-5 h-5" />
    }
  ];

  const currentStageIndex = stages.findIndex(stage => stage.key === currentStage);

  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    setFormData(prev => ({
      ...prev,
      interests: newInterests
    }));
    
    validateField('interests', newInterests);
  };

  const nextStage = () => {
    // Special handling for photos stage
    if (currentStage === 'photos' && photos.length === 0) {
      setShowSkipConfirm(true);
      return;
    }
    
    // Validate languages if we're on the profile stage (language stage)
    if (currentStage === 'profile') {
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
        }, 100);
        return; // Don't proceed to next stage
      }
    }
    
    if (validateCurrentStage()) {
      const currentIndex = stages.findIndex(stage => stage.key === currentStage);
      if (currentIndex < stages.length - 1) {
        setCurrentStage(stages[currentIndex + 1].key);
        setErrors({}); // Clear errors when moving to next stage
        setLanguageErrors({}); // Clear language errors when moving to next stage
      }
    }
  };

  const skipPhotosStage = () => {
    setShowSkipConfirm(false);
    const currentIndex = stages.findIndex(stage => stage.key === currentStage);
    if (currentIndex < stages.length - 1) {
      setCurrentStage(stages[currentIndex + 1].key);
      setErrors({});
    }
  };

  const prevStage = () => {
    const currentIndex = stages.findIndex(stage => stage.key === currentStage);
    if (currentIndex > 0) {
      setCurrentStage(stages[currentIndex - 1].key);
      setErrors({}); // Clear errors when going back
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate languages before submitting
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
      }, 100);
      return;
    }
    
    // Validate the final stage before submitting
    if (!validateCurrentStage()) {
      return;
    }
    
    setLoading(true);

    try {
      // Save photos to localStorage before registration
      const tempUserId = `temp-${Date.now()}`;
      if (photos.length > 0) {
        const saveResult = photoStorage.savePhotos(tempUserId, photos);
        if (!saveResult.success) {
          setErrors({ photos: saveResult.error || 'Failed to save photos' });
          setLoading(false);
          return;
        }
      }

      const registerData: RegisterData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        location: formData.location,
        languages: formData.languages.filter(lang => lang.language && lang.level) as any,
        chatStyle: formData.chatStyle as 'introvert' | 'ambievert' | 'extrovert',
        interests: formData.interests,
        // Fields for gender and orientation
        genderIdentity: formData.genderIdentity,
        orientation: formData.orientation,
        ethnicity: formData.ethnicity as any,
        lookingForRelationship: formData.lookingForRelationship,
        lookingForFriendship: formData.lookingForFriendship,
        relationshipType: formData.lookingForRelationship ? formData.relationshipType as any : undefined,
        customGender: formData.customGender,
        customOrientation: formData.customOrientation,
        // Lifestyle fields
        smoking: formData.smoking,
        drinking: formData.drinking,
        hasChildren: formData.hasChildren,
        education: formData.education,
        occupation: formData.occupation,
        religion: formData.religion,
        politicalViews: formData.politicalViews,
        about: formData.about,
        // Include photos
        photos: photos.map(photo => photo.url),
      };

      const result = await registerUser(registerData);

      if (result.success && result.user) {
        // Transfer photos from temp storage to actual user storage
        if (photos.length > 0) {
          const finalSaveResult = photoStorage.savePhotos(result.user.id, photos);
          if (finalSaveResult.success) {
            photoStorage.clearPhotos(tempUserId); // Clean up temp storage
          } else {
            console.warn('Failed to save photos to final user storage:', finalSaveResult.error);
          }
        }
        
        setUser(result.user as any);
        setIsAuthenticated(true);
        // Welcome to EchoRoom - toast removed per user request
        navigate('/match');
      } else {
        // Handle server-side validation errors
        if (result.errors) {
          const newErrors: { [key: string]: string } = {};
          result.errors.forEach(error => {
            if (error.includes('username')) newErrors.username = error;
            else if (error.includes('email')) newErrors.email = error;
            else if (error.includes('password')) newErrors.password = error;
            else if (error.includes('interests')) newErrors.interests = error;
          });
          setErrors(newErrors);
        }
        
        // Registration failed - toast removed per user request
      }
    } catch (error) {
      // Registration error - toast removed per user request
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: string, value: unknown) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'username':
        if (!value) {
          newErrors.username = 'Username is required';
        } else if ((value as string).length < 3) {
          newErrors.username = 'Username must be at least 3 characters long';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value as string)) {
          newErrors.username = 'Username can only contain letters, numbers, and underscores';
        } else {
          delete newErrors.username;
        }
        break;
        
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if ((value as string).length < 8) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/[A-Z]/.test(value as string)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(value as string)) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/\d/.test(value as string)) {
          newErrors.password = 'Password must contain at least one number';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'dateOfBirth':
        if (!value) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else if (!validateAge(value as string)) {
          const age = calculateAge(value as string);
          newErrors.dateOfBirth = `You must be at least 18 years old to register (you are ${age} years old)`;
        } else {
          delete newErrors.dateOfBirth;
        }
        break;
        
      case 'languages':
        if (!value || (value as any[]).length === 0) {
          newErrors.languages = 'Please add at least one language';
        } else {
          // Check if all languages have both language and level selected
          const incompleteLanguages = (value as any[]).filter((lang: { language?: string; level?: string; [key: string]: unknown }) => !lang.language || !lang.level);
          if (incompleteLanguages.length > 0) {
            newErrors.languages = 'Please complete all language selections';
            // Set specific errors for incomplete languages
            const newLanguageErrors: {[key: number]: string} = {};
            (value as any[]).forEach((lang: { language?: string; level?: string; [key: string]: unknown }, index: number) => {
              if (!lang.language || !lang.level) {
                newLanguageErrors[index] = 'Please select both language and level';
              }
            });
            setLanguageErrors(newLanguageErrors);
          } else {
            delete newErrors.languages;
            setLanguageErrors({});
          }
        }
        break;
        
      case 'interests':
        if ((value as string[]).length < 3) {
          newErrors.interests = 'Please select at least 3 interests';
        } else {
          delete newErrors.interests;
        }
        break;
        
      case 'chatStyle':
        if (!value) {
          newErrors.chatStyle = 'Please select your personality type';
        } else {
          delete newErrors.chatStyle;
        }
        break;

      case 'ethnicity':
        if (!value) {
          newErrors.ethnicity = 'Please select your ethnicity';
        } else {
          delete newErrors.ethnicity;
        }
        break;

      case 'relationshipType':
        if (!value) {
          newErrors.relationshipType = 'Please select your relationship type';
        } else {
          delete newErrors.relationshipType;
        }
        break;

      case 'location':
        if (!value) {
          newErrors.location = 'Location is required';
        } else if ((value as string).length < 2) {
          newErrors.location = 'Please enter a valid location';
        } else {
          delete newErrors.location;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const validateCurrentStage = () => {
    const newErrors: { [key: string]: string } = {};
    
    switch (currentStage) {
      case 'account':
        if (!formData.username) {
          newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
          newErrors.username = 'Username must be at least 3 characters long';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
          newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }
        
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/[A-Z]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/\d/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one number';
        }
        
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else if (!validateAge(formData.dateOfBirth)) {
          const age = calculateAge(formData.dateOfBirth);
          newErrors.dateOfBirth = `You must be at least 18 years old to register (you are ${age} years old)`;
        }

        if (!formData.location) {
          newErrors.location = 'Location is required';
        } else if (formData.location.length < 2) {
          newErrors.location = 'Please enter a valid location';
        }
        break;
        
      case 'profile':
        if (!formData.languages || formData.languages.length === 0) {
          newErrors.languages = 'Please add at least one language';
        } else {
          // Check if all languages have both language and level selected
          const incompleteLanguages = (formData.languages as any).filter((lang: { language?: string; level?: string; [key: string]: unknown }) => !lang.language || !lang.level);
          if (incompleteLanguages.length > 0) {
            newErrors.languages = 'Please complete all language selections';
          }
        }
        break;
        
      case 'interests':
        if (formData.interests.length < 3) {
          newErrors.interests = 'Please select at least 3 interests';
        }
        break;
        
      case 'identity':
        if (!formData.genderIdentity) {
          newErrors.genderIdentity = 'Please select your gender identity';
        }
        if (!formData.orientation) {
          newErrors.orientation = 'Please select your orientation';
        }
        if (!formData.ethnicity) {
          newErrors.ethnicity = 'Please select your ethnicity';
        }
        if (formData.lookingForRelationship && !formData.relationshipType) {
          newErrors.relationshipType = 'Please select your relationship type';
        }
        break;
      case 'lifestyle':
        if (!formData.about.trim()) {
          newErrors.about = 'Please tell us a bit about yourself';
        }
        break;
      case 'photos':
        // Photos are optional, no validation required
        break;
      case 'preferences':
        if (!formData.chatStyle) {
          newErrors.chatStyle = 'Please select your personality type';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceed = () => {
    switch (currentStage) {
      case 'account':
        return formData.username && formData.email && formData.password && formData.dateOfBirth && formData.location &&
               formData.username.length >= 3 && 
               /^[a-zA-Z0-9_]+$/.test(formData.username) &&
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
               formData.password.length >= 8 &&
               validateAge(formData.dateOfBirth) &&
               formData.location.length >= 2 &&
               /[A-Z]/.test(formData.password) &&
               /[a-z]/.test(formData.password) &&
               /\d/.test(formData.password);
      case 'profile':
        return formData.languages && formData.languages.length > 0;
      case 'interests':
        return formData.interests.length >= 3;
      case 'identity':
        return formData.genderIdentity && formData.orientation && formData.ethnicity && 
               (!formData.lookingForRelationship || formData.relationshipType);
      case 'lifestyle':
        return formData.about.trim().length > 0;
      case 'photos':
        return true; // Photos are optional
      case 'preferences':
        return formData.chatStyle;
      default:
        return false;
    }
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 'account':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
                             <Input
                 id="username"
                 name="username"
                 placeholder="thoughtful_soul"
                 value={formData.username}
                 onChange={(e) => {
                   const value = e.target.value;
                   setFormData(prev => ({ ...prev, username: value }));
                   if (touched.username) {
                     validateField('username', value);
                   }
                 }}
                 onBlur={() => {
                   setTouched(prev => ({ ...prev, username: true }));
                   validateField('username', formData.username);
                 }}
                 autoComplete="username"
                 required
                 className={errors.username ? 'border-red-500' : ''}
               />
               {errors.username && touched.username && (
                 <p className="text-sm text-red-500">{errors.username}</p>
               )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
                             <Input
                 id="email"
                 name="email"
                 type="email"
                 placeholder="your@email.com"
                 value={formData.email}
                 onChange={(e) => {
                   const value = e.target.value;
                   setFormData(prev => ({ ...prev, email: value }));
                   if (touched.email) {
                     validateField('email', value);
                   }
                 }}
                 onBlur={() => {
                   setTouched(prev => ({ ...prev, email: true }));
                   validateField('email', formData.email);
                 }}
                 autoComplete="email"
                 required
                 className={errors.email ? 'border-red-500' : ''}
               />
               {errors.email && touched.email && (
                 <p className="text-sm text-red-500">{errors.email}</p>
               )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                                 <Input
                   id="password"
                   name="password"
                   type={showPassword ? 'text' : 'password'}
                   placeholder="Choose a secure password"
                   value={formData.password}
                   onChange={(e) => {
                     const value = e.target.value;
                     setFormData(prev => ({ ...prev, password: value }));
                     if (touched.password) {
                       validateField('password', value);
                     }
                   }}
                   onBlur={() => {
                     setTouched(prev => ({ ...prev, password: true }));
                     validateField('password', formData.password);
                   }}
                   autoComplete="new-password"
                   required
                   className={errors.password ? 'border-red-500' : ''}
                 />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
                             {errors.password && touched.password && (
                 <p className="text-sm text-red-500">{errors.password}</p>
               )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <DatePicker
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, dateOfBirth: value }));
                  if (touched.dateOfBirth) {
                    validateField('dateOfBirth', value);
                  }
                }}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, dateOfBirth: true }));
                  validateField('dateOfBirth', formData.dateOfBirth);
                }}
                placeholder="Select your date of birth"
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                error={!!errors.dateOfBirth && touched.dateOfBirth}
                className="w-full"
              />
              {errors.dateOfBirth && touched.dateOfBirth && (
                <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
              )}
              {formData.dateOfBirth && validateAge(formData.dateOfBirth) && (
                <p className="text-sm text-green-600">
                  Age: {calculateAge(formData.dateOfBirth)} years old
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, location: value }));
                  if (touched.location) {
                    validateField('location', value);
                  }
                }}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, location: true }));
                  validateField('location', formData.location);
                }}
                autoComplete="address-level2"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && touched.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          </div>
        );

             case 'profile':
         return (
           <div className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="languages-section">Languages</Label>
               <p className="text-xs text-muted-foreground mb-3">
                 Add the languages you speak and your proficiency level for each
               </p>
               
               {/* Scrollable language container with max 3 visible */}
               <div id="languages-section" className="max-h-[calc(3*4rem+2rem)] overflow-y-auto space-y-2 pr-2">
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
                                lang.language === 'yoruba' ? 'YO' :
                                lang.language === 'igbo' ? 'IG' :
                                lang.language === 'hausa' ? 'HA' :
                                lang.language === 'zulu' ? 'ZU' :
                                lang.language === 'xhosa' ? 'XH' :
                                lang.language === 'afrikaans' ? 'AF' :
                                lang.language === 'somali' ? 'SO' :
                                lang.language === 'oromo' ? 'OM' :
                                lang.language === 'tigrinya' ? 'TI' :
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
                 <Button
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
               
               {errors.languages && (
                 <p className="text-sm text-red-500">{errors.languages}</p>
               )}
             </div>
           </div>
         );

             case 'interests':
         return (
           <div className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="interests-section">Interests (Select 3-5)</Label>
               <div id="interests-section" className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
                 {availableInterests.map((interest) => (
                   <Badge
                     key={interest}
                     variant={formData.interests.includes(interest) ? "default" : "outline"}
                     className="cursor-pointer hover:scale-105 transition-transform duration-200 select-none text-xs sm:text-sm justify-center"
                     onClick={() => toggleInterest(interest)}
                   >
                     {interest}
                   </Badge>
                 ))}
               </div>
               <p className="text-xs text-muted-foreground">
                 Selected: {formData.interests.length}
               </p>
               {errors.interests && (
                 <p className="text-sm text-red-500">{errors.interests}</p>
               )}
             </div>
           </div>
         );

             case 'identity':
         return (
           <div className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="genderIdentity">Gender Identity</Label>
               <Select 
                 name="genderIdentity"
                 value={formData.genderIdentity} 
                 onValueChange={(value) => {
                   setFormData(prev => ({ ...prev, genderIdentity: value as GenderIdentity }));
                   validateField('genderIdentity', value);
                 }}
               >
                 <SelectTrigger id="genderIdentity" className={errors.genderIdentity ? 'border-red-500' : ''}>
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
               {errors.genderIdentity && (
                 <p className="text-sm text-red-500">{errors.genderIdentity}</p>
               )}
             </div>

             <div className="space-y-2">
               <Label htmlFor="orientation">Orientation</Label>
               <Select 
                 name="orientation"
                 value={formData.orientation} 
                 onValueChange={(value) => {
                   setFormData(prev => ({ ...prev, orientation: value as Orientation }));
                   validateField('orientation', value);
                 }}
               >
                 <SelectTrigger id="orientation" className={errors.orientation ? 'border-red-500' : ''}>
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
               {errors.orientation && (
                 <p className="text-sm text-red-500">{errors.orientation}</p>
               )}
                         </div>

            <div className="space-y-2">
              <Label htmlFor="ethnicity">Ethnicity</Label>
              <Select 
                name="ethnicity"
                value={formData.ethnicity} 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, ethnicity: value as Ethnicity }));
                  validateField('ethnicity', value);
                }}
              >
                <SelectTrigger id="ethnicity" className={errors.ethnicity ? 'border-red-500' : ''}>
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
              {errors.ethnicity && (
                <p className="text-sm text-red-500">{errors.ethnicity}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="lookingForRelationship" className="text-sm sm:text-base">Looking for a relationship?</Label>
                <Switch
                  id="lookingForRelationship"
                  checked={formData.lookingForRelationship}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lookingForRelationship: checked }))}
                />
              </div>
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
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, relationshipType: value as RelationshipType }));
                    validateField('relationshipType', value);
                  }}
                >
                  <SelectTrigger id="relationshipType" className={errors.relationshipType ? 'border-red-500' : ''}>
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
                {errors.relationshipType && (
                  <p className="text-sm text-red-500">{errors.relationshipType}</p>
                )}
              </div>
            )}

             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <Label htmlFor="lookingForFriendship" className="text-sm sm:text-base">Looking for friendship?</Label>
                 <Switch
                   id="lookingForFriendship"
                   checked={formData.lookingForFriendship}
                   onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lookingForFriendship: checked }))}
                 />
               </div>
               <p className="text-xs text-muted-foreground">
                 Connect with people for meaningful friendships and language practice.
               </p>
             </div>
           </div>
         );

             case 'preferences':
         return (
           <div className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="chatStyle">Personality</Label>
                               <Select 
                  name="chatStyle"
                  value={formData.chatStyle} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, chatStyle: value }));
                    validateField('chatStyle', value);
                  }}
                >
                  <SelectTrigger id="chatStyle" className={errors.chatStyle ? 'border-red-500' : ''}>
                    <SelectValue placeholder="How do you prefer to chat?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="introvert">Introvert - Thoughtful & Deep</SelectItem>
                    <SelectItem value="ambievert">Ambievert - Mix of Both</SelectItem>
                    <SelectItem value="extrovert">Extrovert - Social & Fun</SelectItem>
                  </SelectContent>
                </Select>
                {errors.chatStyle && (
                  <p className="text-sm text-red-500">{errors.chatStyle}</p>
                )}
             </div>
           </div>
         );

      case 'lifestyle':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="about">Tell us about yourself</Label>
              <Textarea
                id="about"
                name="about"
                placeholder="Share a bit about yourself, your interests, and what you're looking for..."
                value={formData.about}
                onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smoking">Smoking</Label>
              <Select 
                name="smoking"
                value={formData.smoking} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, smoking: value as 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say' }))}
              >
                <SelectTrigger id="smoking">
                  <SelectValue placeholder="Select your smoking preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="casually">Casually</SelectItem>
                  <SelectItem value="socially">Socially</SelectItem>
                  <SelectItem value="regularly">Regularly</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
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
                  <SelectValue placeholder="Select your drinking preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="casually">Casually</SelectItem>
                  <SelectItem value="socially">Socially</SelectItem>
                  <SelectItem value="regularly">Regularly</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasChildren">Do you have children?</Label>
              <Select 
                name="hasChildren"
                value={formData.hasChildren} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, hasChildren: value as 'no' | 'yes' | 'planning' | 'prefer-not-to-say' }))}
              >
                <SelectTrigger id="hasChildren">
                  <SelectValue placeholder="Select your answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="planning">Planning to have</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education Level</Label>
              <Select 
                name="education"
                value={formData.education} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, education: value as 'high-school' | 'bachelor' | 'master' | 'phd' | 'other' | 'prefer-not-to-say' }))}
              >
                <SelectTrigger id="education">
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD/Doctorate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <Label htmlFor="religion">Religion</Label>
              <Select 
                name="religion"
                value={formData.religion} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, religion: value as 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'atheist' | 'agnostic' | 'other' | 'prefer-not-to-say' }))}
              >
                <SelectTrigger id="religion">
                  <SelectValue placeholder="Select your religion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="christianity">Christianity</SelectItem>
                  <SelectItem value="islam">Islam</SelectItem>
                  <SelectItem value="judaism">Judaism</SelectItem>
                  <SelectItem value="hinduism">Hinduism</SelectItem>
                  <SelectItem value="buddhism">Buddhism</SelectItem>
                  <SelectItem value="atheist">Atheist</SelectItem>
                  <SelectItem value="agnostic">Agnostic</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
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
                  <SelectValue placeholder="Select your political views" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liberal">Liberal</SelectItem>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="apolitical">Apolitical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-4">
              <div className="text-lg font-semibold">📸 Add Your Photos</div>
              <div className="text-sm text-muted-foreground">
                Photos help others get to know you better and significantly increase your match potential
              </div>
            </div>
            
            <RegistrationPhotoUpload 
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={6}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen app-gradient-bg flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-24 right-10 w-28 h-28 bg-gradient-tertiary rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 left-12 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-8 w-20 h-20 bg-gradient-secondary rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 px-2 sm:px-0">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 p-2"
        >
          <ArrowLeft size={20} />
          <span className="ml-2">Back</span>
        </Button>

        <Card className="shadow-medium">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join EchoRoom</CardTitle>
            <p className="text-muted-foreground">Create your safe space account</p>
          </CardHeader>
          
          {/* Progress Indicator */}
          <div className="px-4 sm:px-6 pb-2">
            <div className="flex items-center justify-center mb-3 gap-0.5 sm:gap-1">
              {stages.map((stage, index) => (
                <div key={stage.key} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full border-2 transition-all duration-300 ${
                    index < currentStageIndex 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : index === currentStageIndex
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {index < currentStageIndex ? (
                      <Check size={10} className="sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
                    ) : (
                      <div className="flex items-center justify-center w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5">{stage.icon}</div>
                    )}
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`w-2 sm:w-4 md:w-6 h-0.5 mx-0.5 transition-all duration-300 ${
                      index < currentStageIndex ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit}>
              <div className={`${
                currentStage === 'photos' 
                  ? 'min-h-[300px] sm:min-h-[400px]' 
                  : 'min-h-[150px] sm:min-h-[180px]'
              } flex items-start justify-center py-2`}>
                <div className="w-full animate-in fade-in duration-300 overflow-hidden">
                  {renderStageContent()}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStage}
                  disabled={currentStageIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftIcon size={16} />
                  Previous
                </Button>

                {currentStageIndex === stages.length - 1 ? (
                  <Button
                    type="submit"
                    variant="cozy"
                    disabled={loading || !canProceed()}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Create Account
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="cozy"
                    onClick={nextStage}
                    disabled={!canProceed()}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight size={16} />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors"
            >
              Login
            </button>
          </p>
        </div>
      </div>

      {/* Skip Photos Confirmation Modal */}
      <Dialog open={showSkipConfirm} onOpenChange={setShowSkipConfirm}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-center">Skip Adding Photos?</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to continue without adding any photos?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">⚠️</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-orange-800">
                    Consider the impact:
                  </div>
                  <ul className="space-y-1 text-orange-700">
                    <li>• Profiles with photos get 5x more matches</li>
                    <li>• Photos help build trust and connections</li>
                    <li>• Your current match potential is only 35%</li>
                    <li>• Adding just one photo boosts it to 42.5%</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setShowSkipConfirm(false)}
                className="w-full"
              >
                Add Photos Now
              </Button>
              <Button
                variant="outline"
                onClick={skipPhotosStage}
                className="w-full"
              >
                Continue Without Photos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
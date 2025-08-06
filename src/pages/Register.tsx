import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Eye, EyeOff, ArrowRight, ArrowLeft as ArrowLeftIcon, Check, User, Mail, Lock, Heart, Languages, MessageCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { registerUser, RegisterData } from '@/lib/auth';
import { GenderIdentity, Orientation, AttractionPreference } from '@/contexts/AppContext';

type RegistrationStage = 'account' | 'profile' | 'interests' | 'identity' | 'preferences';

const Register = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useApp();
  const [currentStage, setCurrentStage] = useState<RegistrationStage>('account');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    languageProficiency: '',
    chatStyle: '',
    interests: [] as string[],
    // New fields for gender and orientation
    genderIdentity: 'prefer-not-to-say' as GenderIdentity,
    orientation: 'other' as Orientation,
    attractionPreferences: [] as AttractionPreference[],
    lookingForRelationship: false,
    customGender: '',
    customOrientation: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

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
      key: 'preferences',
      title: 'Chat Style',
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
    if (validateCurrentStage()) {
      const currentIndex = stages.findIndex(stage => stage.key === currentStage);
      if (currentIndex < stages.length - 1) {
        setCurrentStage(stages[currentIndex + 1].key);
        setErrors({}); // Clear errors when moving to next stage
      }
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
    
    // Validate the final stage before submitting
    if (!validateCurrentStage()) {
      return;
    }
    
    setLoading(true);

    try {
      const registerData: RegisterData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        languageProficiency: formData.languageProficiency,
        chatStyle: formData.chatStyle as 'introverted' | 'balanced' | 'outgoing',
        interests: formData.interests,
        // New fields for gender and orientation
        genderIdentity: formData.genderIdentity,
        orientation: formData.orientation,
        attractionPreferences: formData.attractionPreferences,
        lookingForRelationship: formData.lookingForRelationship,
        customGender: formData.customGender,
        customOrientation: formData.customOrientation,
      };

      const result = await registerUser(registerData);

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        toast({
          title: "Welcome to EchoRoom!",
          description: "Your account has been created successfully.",
        });
        navigate('/home');
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
        
        toast({
          title: "Registration Failed",
          description: result.errors?.join(', ') || "Please check your information and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'username':
        if (!value) {
          newErrors.username = 'Username is required';
        } else if (value.length < 3) {
          newErrors.username = 'Username must be at least 3 characters long';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = 'Username can only contain letters, numbers, and underscores';
        } else {
          delete newErrors.username;
        }
        break;
        
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/[A-Z]/.test(value)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(value)) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/\d/.test(value)) {
          newErrors.password = 'Password must contain at least one number';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'languageProficiency':
        if (!value) {
          newErrors.languageProficiency = 'Please select your language proficiency level';
        } else {
          delete newErrors.languageProficiency;
        }
        break;
        
      case 'interests':
        if (value.length < 3) {
          newErrors.interests = 'Please select at least 3 interests';
        } else {
          delete newErrors.interests;
        }
        break;
        
      case 'chatStyle':
        if (!value) {
          newErrors.chatStyle = 'Please select your preferred chat style';
        } else {
          delete newErrors.chatStyle;
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
        break;
        
      case 'profile':
        if (!formData.languageProficiency) {
          newErrors.languageProficiency = 'Please select your language proficiency level';
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
        if (formData.attractionPreferences.length === 0) {
          newErrors.attractionPreferences = 'Please select who you\'re attracted to';
        }
        break;
      case 'preferences':
        if (!formData.chatStyle) {
          newErrors.chatStyle = 'Please select your preferred chat style';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceed = () => {
    switch (currentStage) {
      case 'account':
        return formData.username && formData.email && formData.password && 
               formData.username.length >= 3 && 
               /^[a-zA-Z0-9_]+$/.test(formData.username) &&
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
               formData.password.length >= 8 &&
               /[A-Z]/.test(formData.password) &&
               /[a-z]/.test(formData.password) &&
               /\d/.test(formData.password);
      case 'profile':
        return formData.languageProficiency;
      case 'interests':
        return formData.interests.length >= 3;
      case 'identity':
        return formData.genderIdentity && formData.orientation && formData.attractionPreferences.length > 0;
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
          </div>
        );

             case 'profile':
         return (
           <div className="space-y-4">
             <div className="space-y-2">
               <Label>Language Proficiency</Label>
                               <Select 
                  value={formData.languageProficiency} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, languageProficiency: value }));
                    validateField('languageProficiency', value);
                  }}
                >
                  <SelectTrigger className={errors.languageProficiency ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">A1 - Beginner</SelectItem>
                    <SelectItem value="A2">A2 - Elementary</SelectItem>
                    <SelectItem value="B1">B1 - Intermediate</SelectItem>
                    <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                    <SelectItem value="C1">C1 - Advanced</SelectItem>
                    <SelectItem value="C2">C2 - Proficient</SelectItem>
                  </SelectContent>
                </Select>
                {errors.languageProficiency && (
                  <p className="text-sm text-red-500">{errors.languageProficiency}</p>
                )}
             </div>
           </div>
         );

             case 'interests':
         return (
           <div className="space-y-4">
             <div className="space-y-2">
               <Label>Interests (Select 3-5)</Label>
               <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
                 {availableInterests.map((interest) => (
                   <Badge
                     key={interest}
                     variant={formData.interests.includes(interest) ? "default" : "outline"}
                     className="cursor-pointer hover:scale-105 transition-transform duration-200 select-none"
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
               <Label>Gender Identity</Label>
               <Select 
                 value={formData.genderIdentity} 
                 onValueChange={(value) => {
                   setFormData(prev => ({ ...prev, genderIdentity: value as GenderIdentity }));
                   validateField('genderIdentity', value);
                 }}
               >
                 <SelectTrigger className={errors.genderIdentity ? 'border-red-500' : ''}>
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
                   placeholder="Please specify your gender identity"
                   value={formData.customGender}
                   onChange={(e) => setFormData(prev => ({ ...prev, customGender: e.target.value }))}
                   className="mt-2"
                 />
               )}
               {errors.genderIdentity && (
                 <p className="text-sm text-red-500">{errors.genderIdentity}</p>
               )}
             </div>

             <div className="space-y-2">
               <Label>Orientation</Label>
               <Select 
                 value={formData.orientation} 
                 onValueChange={(value) => {
                   setFormData(prev => ({ ...prev, orientation: value as Orientation }));
                   validateField('orientation', value);
                 }}
               >
                 <SelectTrigger className={errors.orientation ? 'border-red-500' : ''}>
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
                   placeholder="Please specify your orientation"
                   value={formData.customOrientation}
                   onChange={(e) => setFormData(prev => ({ ...prev, customOrientation: e.target.value }))}
                   className="mt-2"
                 />
               )}
               {errors.orientation && (
                 <p className="text-sm text-red-500">{errors.orientation}</p>
               )}
             </div>

             <div className="space-y-2">
               <Label>Who are you attracted to?</Label>
               <div className="flex flex-wrap gap-2">
                 {(['women', 'men', 'non-binary', 'all-genders'] as AttractionPreference[]).map((pref) => (
                   <Badge
                     key={pref}
                     variant={formData.attractionPreferences.includes(pref) ? "default" : "outline"}
                     className="cursor-pointer hover:scale-105 transition-transform duration-200 select-none"
                     onClick={() => {
                       const newPrefs = formData.attractionPreferences.includes(pref)
                         ? formData.attractionPreferences.filter(p => p !== pref)
                         : [...formData.attractionPreferences, pref];
                       setFormData(prev => ({ ...prev, attractionPreferences: newPrefs }));
                       validateField('attractionPreferences', newPrefs);
                     }}
                   >
                     {pref === 'women' ? 'Women' : 
                      pref === 'men' ? 'Men' : 
                      pref === 'non-binary' ? 'Non-binary' : 'All genders'}
                   </Badge>
                 ))}
               </div>
               {errors.attractionPreferences && (
                 <p className="text-sm text-red-500">{errors.attractionPreferences}</p>
               )}
             </div>

             <div className="space-y-2">
               <Label className="flex items-center gap-2">
                 <span>Looking for a relationship?</span>
                 <Switch
                   checked={formData.lookingForRelationship}
                   onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lookingForRelationship: checked }))}
                 />
               </Label>
               <p className="text-xs text-muted-foreground">
                 This will help others understand your intentions and improve your matches.
               </p>
             </div>
           </div>
         );

             case 'preferences':
         return (
           <div className="space-y-4">
             <div className="space-y-2">
               <Label>Chat Style</Label>
                               <Select 
                  value={formData.chatStyle} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, chatStyle: value }));
                    validateField('chatStyle', value);
                  }}
                >
                  <SelectTrigger className={errors.chatStyle ? 'border-red-500' : ''}>
                    <SelectValue placeholder="How do you prefer to chat?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="introverted">Introverted - Thoughtful & Deep</SelectItem>
                    <SelectItem value="balanced">Balanced - Mix of Both</SelectItem>
                    <SelectItem value="outgoing">Outgoing - Social & Fun</SelectItem>
                  </SelectContent>
                </Select>
                {errors.chatStyle && (
                  <p className="text-sm text-red-500">{errors.chatStyle}</p>
                )}
             </div>
           </div>
         );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-accent flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
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
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              {stages.map((stage, index) => (
                <div key={stage.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                    index < currentStageIndex 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : index === currentStageIndex
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {index < currentStageIndex ? (
                      <Check size={16} />
                    ) : (
                      stage.icon
                    )}
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                      index < currentStageIndex ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Stage Title */}
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg">{stages[currentStageIndex].title}</h3>
              <p className="text-sm text-muted-foreground">{stages[currentStageIndex].description}</p>
            </div>
          </div>
          
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="w-full animate-in fade-in duration-300">
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
      </div>
    </div>
  );
};

export default Register;
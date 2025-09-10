import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ArrowLeft, Eye, EyeOff, ArrowRight, Check, User, Mail, Lock, Heart, Languages, MessageCircle, Camera, X, RefreshCw, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/hooks/useApp';
import { toast } from '@/hooks/use-toast';
import { registerUser, RegisterData, loginUser } from '@/lib/authApi';
import { sendVerificationCode, verifyEmailCode } from '@/lib/authApi';
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

// Registration steps
type RegistrationStep = 'basic' | 'profile' | 'preferences' | 'email-verification';

// Helper functions
const validateAge = (dateOfBirth: string): boolean => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
};

const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1;
  }
  
  return age;
};

const RegisterWithVerification = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useApp();
  
  // Current step
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('basic');
  
  // Basic info state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    location: '',
    hometown: '',
    relationshipStatus: '',
    about: '',
    chatStyle: 'ambievert' as 'introvert' | 'ambievert' | 'extrovert',
    safeMode: 'light' as 'light' | 'deep' | 'learning',
    anonymousMode: false,
    aiAssistant: false,
    genderIdentity: 'prefer-not-to-say' as GenderIdentity,
    orientation: 'other' as Orientation,
    customGender: '',
    customOrientation: '',
    ethnicity: 'prefer-not-to-say' as Ethnicity,
    lookingForRelationship: false,
    lookingForFriendship: false,
    relationshipType: 'not-sure-yet' as RelationshipType,
    smoking: 'prefer-not-to-say' as 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say',
    drinking: 'prefer-not-to-say' as 'never' | 'casually' | 'socially' | 'regularly' | 'prefer-not-to-say',
    hasChildren: 'prefer-not-to-say' as 'no' | 'yes' | 'want-someday' | 'have-and-want-more' | 'have-and-dont-want-more' | 'not-sure-yet' | 'prefer-not-to-say',
    education: 'prefer-not-to-say' as 'high-school' | 'bachelor' | 'master' | 'phd' | 'other' | 'prefer-not-to-say',
    occupation: '',
    religion: 'prefer-not-to-say' as 'christianity' | 'islam' | 'judaism' | 'hinduism' | 'buddhism' | 'atheist' | 'agnostic' | 'other' | 'prefer-not-to-say',
    politicalViews: 'prefer-not-to-say' as 'liberal' | 'conservative' | 'moderate' | 'apolitical' | 'other' | 'prefer-not-to-say',
    languages: [] as UserLanguage[],
    interests: [] as string[],
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Email verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Validation functions
  const validateBasicInfo = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!validateAge(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'You must be at least 18 years old';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfileInfo = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.about.trim()) {
      newErrors.about = 'About section is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleVerifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError('Please enter a valid 6-digit code');
      return;
    }

    setVerificationLoading(true);
    setVerificationError('');

    try {
      const result = await verifyEmailCode(formData.email, verificationCode);
      
      if (result.success) {
        setVerificationSuccess('Email verified successfully!');
        
        // Log the user in after successful verification
        try {
          const loginResult = await loginUser({
            email: formData.email,
            password: formData.password,
          });
          
          if (loginResult.success && loginResult.user) {
            setUser(loginResult.user);
            setIsAuthenticated(true);
            
            toast({
              title: "Welcome to EchoRoom!",
              description: "Your account has been created and verified successfully.",
            });
            
            navigate('/community');
          } else {
            toast({
              title: "Email Verified",
              description: "Please log in with your credentials.",
            });
            navigate('/login');
          }
        } catch (loginError: any) {
          toast({
            title: "Email Verified",
            description: "Please log in with your credentials.",
          });
          navigate('/login');
        }
      } else {
        setVerificationError(result.errors?.[0] || 'Invalid verification code');
      }
    } catch (error: any) {
      setVerificationError(error.message || 'Invalid verification code');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setVerificationError('');

    try {
      const result = await sendVerificationCode(formData.email);
      
      if (result.success) {
        setVerificationSuccess('Verification code sent!');
        setCountdown(60); // 1 minute cooldown
        setTimeout(() => setVerificationSuccess(''), 3000);
      } else {
        setVerificationError(result.errors?.[0] || 'Failed to resend code');
      }
    } catch (error: any) {
      setVerificationError(error.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  // Handle stage navigation
  const handleNextStage = () => {
    switch (currentStep) {
      case 'basic':
        if (validateBasicInfo()) {
          setCurrentStep('profile');
        }
        break;
      case 'profile':
        if (validateProfileInfo()) {
          setCurrentStep('preferences');
        }
        break;
      case 'preferences':
        setCurrentStep('email-verification');
        break;
    }
  };

  const handlePreviousStage = () => {
    switch (currentStep) {
      case 'profile':
        setCurrentStep('basic');
        break;
      case 'preferences':
        setCurrentStep('profile');
        break;
      case 'email-verification':
        setCurrentStep('preferences');
        break;
    }
  };

  // Handle final registration - create account and send verification
  const handleCreateAccount = async () => {
    setLoading(true);

    try {
      const registerData: RegisterData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        location: formData.location,
        hometown: formData.hometown,
        relationshipStatus: formData.relationshipStatus,
        languages: formData.languages.map(lang => ({
          code: lang.language,
          name: lang.language,
          proficiency: lang.level,
        })),
        interests: formData.interests,
        genderIdentity: formData.genderIdentity,
        orientation: formData.orientation,
        customGender: formData.customGender,
        customOrientation: formData.customOrientation,
        ethnicity: formData.ethnicity,
        lookingForRelationship: formData.lookingForRelationship,
        lookingForFriendship: formData.lookingForFriendship,
        relationshipType: formData.relationshipType,
        smoking: formData.smoking,
        drinking: formData.drinking,
        hasChildren: formData.hasChildren,
        education: formData.education,
        occupation: formData.occupation,
        religion: formData.religion,
        politicalViews: formData.politicalViews,
        about: formData.about,
        chatStyle: formData.chatStyle,
      };

      const result = await registerUser(registerData);
      
      if (result.success) {
        // Account created successfully, now send verification email
        const verificationResult = await sendVerificationCode(formData.email);
        
        if (verificationResult.success) {
          toast({
            title: "Account Created!",
            description: "Please check your email for verification code.",
          });
          
          setCountdown(60); // 1 minute cooldown
        } else {
          toast({
            title: "Account Created",
            description: "But failed to send verification email. Please try logging in.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Registration Failed",
          description: result.errors?.[0] || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render basic info step
  const renderBasicStep = () => (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="glass-strong border-border-soft/50">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text-hero">
            Create Your Account
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Let's start with the basics
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a secure password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <DatePicker
              value={formData.dateOfBirth}
              onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
              placeholder="Select your birth date"
              className={errors.dateOfBirth ? 'border-red-500' : ''}
            />
            {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              placeholder="City, Country"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleNextStage}
            className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Continue
          </Button>

          {/* Back to Login */}
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Render profile step
  const renderProfileStep = () => (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="glass-strong border-border-soft/50">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text-hero">
            Tell Us About Yourself
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Help others get to know you
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* About */}
          <div className="space-y-2">
            <Label htmlFor="about">About You *</Label>
            <Textarea
              id="about"
              placeholder="Tell us about yourself..."
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              rows={3}
              className={errors.about ? 'border-red-500' : ''}
            />
            {errors.about && <p className="text-red-500 text-sm">{errors.about}</p>}
          </div>

          {/* Hometown */}
          <div className="space-y-2">
            <Label htmlFor="hometown">Hometown (Optional)</Label>
            <Input
              id="hometown"
              type="text"
              placeholder="Where are you from?"
              value={formData.hometown}
              onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
            />
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation (Optional)</Label>
            <Input
              id="occupation"
              type="text"
              placeholder="What do you do?"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            />
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleNextStage}
            className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Continue
          </Button>

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handlePreviousStage}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Render preferences step
  const renderPreferencesStep = () => (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="glass-strong border-border-soft/50">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text-hero">
            Your Preferences
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Set your chat preferences
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Chat Style */}
          <div className="space-y-2">
            <Label htmlFor="chatStyle">Chat Style</Label>
            <Select value={formData.chatStyle} onValueChange={(value: 'introvert' | 'ambievert' | 'extrovert') => setFormData({ ...formData, chatStyle: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your chat style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="introvert">Introvert</SelectItem>
                <SelectItem value="ambievert">Ambievert</SelectItem>
                <SelectItem value="extrovert">Extrovert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Safe Mode */}
          <div className="space-y-2">
            <Label htmlFor="safeMode">Safe Mode</Label>
            <Select value={formData.safeMode} onValueChange={(value: 'light' | 'deep' | 'learning') => setFormData({ ...formData, safeMode: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select safe mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="deep">Deep</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create Account Button */}
          <Button
            onClick={handleCreateAccount}
            disabled={loading}
            className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </Button>

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handlePreviousStage}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Render email verification step
  const renderEmailVerificationStep = () => (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="glass-strong border-border-soft/50">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text-hero">
            Verify Your Email
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-medium text-foreground">{formData.email}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Verification Code Input */}
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
                setVerificationError('');
              }}
              className="text-center text-2xl font-mono tracking-widest"
              maxLength={6}
            />
          </div>

          {/* Error Message */}
          {verificationError && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {verificationError}
            </div>
          )}

          {/* Success Message */}
          {verificationSuccess && (
            <div className="text-green-500 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              {verificationSuccess}
            </div>
          )}

          {/* Complete Registration Button */}
          <Button
            onClick={handleVerifyEmail}
            disabled={verificationLoading || verificationCode.length !== 6}
            className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
          >
            {verificationLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Completing Registration...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Complete Registration
              </>
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={resendLoading || countdown > 0}
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Resend in {countdown}s
                </>
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setCurrentStep('basic')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic':
        return renderBasicStep();
      case 'profile':
        return renderProfileStep();
      case 'preferences':
        return renderPreferencesStep();
      case 'email-verification':
        return renderEmailVerificationStep();
      default:
        return renderBasicStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default RegisterWithVerification;

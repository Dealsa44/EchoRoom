import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff, Save, User, Mail, Lock, Heart, Users, MessageCircle, ChevronDown, ChevronRight, Camera } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { updateUserProfile } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import { GenderIdentity, Orientation } from '@/contexts/AppContext';
import { getRandomProfileQuestions } from '@/data/profileQuestions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  const { user, setUser } = useApp();
  const [loading, setLoading] = useState(false);
  
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
          verificationStatus: index === 0 ? 'approved' : 'not_submitted'
        }));
        setPhotos(convertedPhotos);
      }
    }
  }, [user?.id, user?.photos]);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    interests: user?.interests || [] as string[],
    // New fields for identity and preferences
    genderIdentity: user?.genderIdentity || 'prefer-not-to-say' as GenderIdentity,
    orientation: user?.orientation || 'other' as Orientation,
    lookingForRelationship: user?.lookingForRelationship || false,
    lookingForFriendship: user?.lookingForFriendship || false,
    customGender: user?.customGender || '',
    customOrientation: user?.customOrientation || '',
    // Language and lifestyle fields
    languageProficiency: (user as any)?.languageProficiency || '',
    chatStyle: (user as any)?.chatStyle || '',
    location: (user as any)?.location || '',
    smoking: (user as any)?.smoking || 'prefer-not-to-say',
    drinking: (user as any)?.drinking || 'prefer-not-to-say',
    hasChildren: (user as any)?.hasChildren || 'prefer-not-to-say',
    education: (user as any)?.education || 'prefer-not-to-say',
    occupation: (user as any)?.occupation || '',
    religion: (user as any)?.religion || 'prefer-not-to-say',
    politicalViews: (user as any)?.politicalViews || 'prefer-not-to-say',
    about: (user as any)?.about || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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

      const updates: any = {
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        interests: formData.interests,
        photos: photoUrls, // Add photos to updates
        // New fields for identity and preferences
        genderIdentity: formData.genderIdentity,
        orientation: formData.orientation,
        lookingForRelationship: formData.lookingForRelationship,
        lookingForFriendship: formData.lookingForFriendship,
        customGender: formData.customGender,
        customOrientation: formData.customOrientation,
        // Language and lifestyle fields
        languageProficiency: formData.languageProficiency,
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
        setUser(result.user);
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
      <TopBar title="Edit Profile" showBack onBack={() => navigate('/profile')} />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos Section */}
          <CollapsibleSection title="Profile Photos" icon={<Camera className="w-4 h-4" />} defaultOpen={true}>
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

            <div className="space-y-2">
              <Label htmlFor="languageProficiency">Language Proficiency</Label>
              <Select 
                value={formData.languageProficiency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, languageProficiency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your language level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1 - Beginner</SelectItem>
                  <SelectItem value="A2">A2 - Elementary</SelectItem>
                  <SelectItem value="B1">B1 - Intermediate</SelectItem>
                  <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                  <SelectItem value="C1">C1 - Advanced</SelectItem>
                  <SelectItem value="C2">C2 - Proficient</SelectItem>
                  <SelectItem value="Native">Native Speaker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chatStyle">Personality</Label>
              <Select 
                value={formData.chatStyle} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, chatStyle: value }))}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>Interests</Label>
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
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Identity & Preferences Section */}
          <CollapsibleSection title="Identity & Preferences" icon={<Users className="w-4 h-4" />}>
            <div className="space-y-2">
              <Label>Gender Identity</Label>
              <Select 
                name="genderIdentity"
                value={formData.genderIdentity} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, genderIdentity: value as GenderIdentity }))}
              >
                <SelectTrigger>
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
              <Label>Orientation</Label>
              <Select 
                name="orientation"
                value={formData.orientation} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, orientation: value as Orientation }))}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span>Looking for friendship?</span>
                <Switch
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
                    <Label>About</Label>
                    <Textarea
                      placeholder="Tell others about yourself, your interests, and what you're looking for..."
                      value={formData.about}
                      onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Smoking</Label>
                      <Select 
                        value={formData.smoking} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, smoking: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="casually">Casually</SelectItem>
                          <SelectItem value="socially">Socially</SelectItem>
                          <SelectItem value="regularly">Regularly</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Drinking</Label>
                      <Select 
                        value={formData.drinking} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, drinking: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="casually">Casually</SelectItem>
                          <SelectItem value="socially">Socially</SelectItem>
                          <SelectItem value="regularly">Regularly</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Children</Label>
                      <Select 
                        value={formData.hasChildren} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, hasChildren: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Education</Label>
                      <Select 
                        value={formData.education} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, education: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="high-school">High School</SelectItem>
                          <SelectItem value="bachelor">Bachelor's</SelectItem>
                          <SelectItem value="master">Master's</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Occupation</Label>
                    <Input
                      placeholder="What do you do for work?"
                      value={formData.occupation}
                      onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Religion</Label>
                      <Select 
                        value={formData.religion} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, religion: value as any }))}
                      >
                        <SelectTrigger>
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
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Political Views</Label>
                      <Select 
                        value={formData.politicalViews} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, politicalViews: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
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
                  <Label className="text-sm font-medium">
                    {question.question}
                  </Label>
                  <Textarea
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

      <BottomNavigation />
    </div>
  );
};

export default ProfileEdit;
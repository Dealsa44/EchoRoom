import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff, Save, User, Mail, Lock, Heart, Users } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { updateUserProfile } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import { GenderIdentity, Orientation } from '@/contexts/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, setUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    // New fields for identity and preferences
    genderIdentity: user?.genderIdentity || 'prefer-not-to-say' as GenderIdentity,
    orientation: user?.orientation || 'other' as Orientation,

    lookingForRelationship: user?.lookingForRelationship || false,
    lookingForFriendship: user?.lookingForFriendship || false,
    customGender: user?.customGender || '',
    customOrientation: user?.customOrientation || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const updates: any = {
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        // New fields for identity and preferences
        genderIdentity: formData.genderIdentity,
        orientation: formData.orientation,

        lookingForRelationship: formData.lookingForRelationship,
        lookingForFriendship: formData.lookingForFriendship,
        customGender: formData.customGender,
        customOrientation: formData.customOrientation,
      };

      // Only include password update if new password is provided
      if (formData.newPassword) {
        if (formData.currentPassword !== user.password) {
          toast({
            title: "Current Password Incorrect",
            description: "Please enter your current password correctly.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        updates.password = formData.newPassword;
      }

      const result = await updateUserProfile(user.id, updates);

      if (result.success && result.user) {
        setUser(result.user);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        navigate('/profile');
      } else {
        toast({
          title: "Update Failed",
          description: result.errors?.join(', ') || "Please check your information and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Update Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <Button variant="ghost" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
          <span className="ml-2">Back</span>
        </Button>
      </div>
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Identity & Preferences Section */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Identity & Preferences
                </h3>
                
                <div className="space-y-4">
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
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Change Password
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                        autoComplete="current-password"
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password (optional)"
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEdit;
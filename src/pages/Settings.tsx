import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Shield,
  Lock,
  Globe,
  Smartphone,
  MessageCircle,
  Heart,
  Eye,
  EyeOff,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useApp } from '@/hooks/useApp';
import { toast } from '@/hooks/use-toast';
import { UpdateBanner } from '@/components/UpdateBanner';
import { serviceWorkerManager } from '@/lib/serviceWorkerManager';

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

const Settings = () => {
  const navigate = useNavigate();
  const { user, setUser } = useApp();
  
  // Password change state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const handlePasswordChange = async () => {
    if (!user) return;

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      // Missing information validation - toast removed per user request
      return;
    }

    if (passwordData.currentPassword !== user.password) {
      // Password validation - toast removed per user request
      return;
    }

    if (passwordData.newPassword.length < 8) {
      // Password length validation - toast removed per user request
      return;
    }

    // Update the user's password
    const updatedUser = { ...user, password: passwordData.newPassword };
    setUser(updatedUser);
    
    // Clear the form
    setPasswordData({ currentPassword: '', newPassword: '' });
    
    // Password changed successfully - toast removed per user request
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar 
        title="Settings" 
        showBack 
        onBack={() => navigate('/profile')}
      />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 content-safe-top pb-24">
        
        {/* App Updates */}
        <UpdateBanner />
        
        {/* Safety Center */}
        <div className="border rounded-lg">
          <button
            type="button"
            onClick={() => navigate('/safety-center')}
            className="w-full px-4 py-3 flex items-center hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-semibold">Safety Center</span>
            </div>
          </button>
        </div>
        
        {/* Notifications & Communication */}
        <div className="border rounded-lg">
          <button
            type="button"
            onClick={() => navigate('/notifications-communication')}
            className="w-full px-4 py-3 flex items-center hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="font-semibold">Notifications & Communication</span>
            </div>
          </button>
        </div>
        
        {/* Appearance & Experience */}
        <div className="border rounded-lg">
          <button
            type="button"
            onClick={() => navigate('/appearance-experience')}
            className="w-full px-4 py-3 flex items-center hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="font-semibold">Appearance & Experience</span>
            </div>
          </button>
        </div>
        
        {/* Device & Data */}
        <div className="border rounded-lg">
          <button
            type="button"
            onClick={() => navigate('/device-data')}
            className="w-full px-4 py-3 flex items-center hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="font-semibold">Device & Data</span>
            </div>
          </button>
        </div>
        
        {/* Password & Security */}
        <CollapsibleSection title="Password & Security" icon={<Lock className="h-4 w-4" />}>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
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

          <Button 
            onClick={handlePasswordChange}
            className="w-full"
            disabled={!passwordData.currentPassword || !passwordData.newPassword}
          >
            Change Password
          </Button>
        </CollapsibleSection>

        {/* Help & Support */}
        <CollapsibleSection title="Help & Support" icon={<HelpCircle className="h-4 h-4" />}>
            <Button variant="outline" className="w-full justify-start">
              FAQ & Help Center
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-blue-600 hover:text-blue-700"
              onClick={async () => {
                try {
                  await serviceWorkerManager.forceUpdate();
                } catch (error) {
                  console.error('Force update failed:', error);
                  // Fallback: just reload
                  window.location.reload();
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Force App Update
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Policy
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Terms of Service
            </Button>
        </CollapsibleSection>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            EchoRoom v1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Made with 💚 for meaningful connections
          </p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Settings;
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
  RefreshCw,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useApp } from '@/hooks/useApp';
import { toast } from '@/hooks/use-toast';
import { UpdateBanner } from '@/components/UpdateBanner';
import { serviceWorkerManager } from '@/lib/serviceWorkerManager';
import { safeLocalStorage } from '@/lib/utils';

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

  // Helper function to clear all app-specific localStorage keys
  const clearAllAppKeys = () => {
    const appKeys = [
      'driftzo_current_user',
      'driftzo_users', 
      'driftzo_call_history',
      'driftzo_call_settings',
      'darkMode',
      'joinedRooms',
      'hostedEvents',
      'joinedEvents',
      'myEventsActiveTab',
      'sampleEventData',
      'conversationStates',
      'offlineQueue'
    ];

    // Clear known app keys
    appKeys.forEach(key => safeLocalStorage.removeItem(key));

    // Clear photo keys (they start with 'photos_')
    const photoKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('photos_')) {
        photoKeys.push(key);
      }
    }
    photoKeys.forEach(key => safeLocalStorage.removeItem(key));

    // Clear cache-related keys
    const cacheKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('cache') || key.includes('offline') || key.includes('sw_'))) {
        cacheKeys.push(key);
      }
    }
    cacheKeys.forEach(key => safeLocalStorage.removeItem(key));
  };

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

        {/* Local Storage Management */}
        <CollapsibleSection title="Local Storage Management" icon={<Database className="h-4 w-4" />} defaultOpen={false}>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Manage your app's local data. Clear specific data types without losing everything.
            </div>
            
            {/* User Data */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">User Data</h4>
                  <p className="text-xs text-muted-foreground">Profile, settings, and preferences</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      // Clear user-related data
                      safeLocalStorage.removeItem('driftzo_current_user');
                      safeLocalStorage.removeItem('driftzo_users');
                      safeLocalStorage.removeItem('darkMode');
                      safeLocalStorage.removeItem('joinedRooms');
                      
                      // Also clear from sessionStorage
                      sessionStorage.removeItem('driftzo_current_user');
                      
                      toast({
                        title: "User data cleared",
                        description: "Your profile and preferences have been reset.",
                      });
                    } catch (error) {
                      console.error('Failed to clear user data:', error);
                      toast({
                        title: "Error",
                        description: "Failed to clear user data.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Event Data */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Event Data</h4>
                  <p className="text-xs text-muted-foreground">Created and joined events</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      safeLocalStorage.removeItem('hostedEvents');
                      safeLocalStorage.removeItem('joinedEvents');
                      safeLocalStorage.removeItem('myEventsActiveTab');
                      safeLocalStorage.removeItem('sampleEventData');
                      
                      toast({
                        title: "Event data cleared",
                        description: "All event data has been removed.",
                      });
                    } catch (error) {
                      console.error('Failed to clear event data:', error);
                      toast({
                        title: "Error",
                        description: "Failed to clear event data.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Chat & Conversation Data */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Chat Data</h4>
                  <p className="text-xs text-muted-foreground">Conversations and messages</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      safeLocalStorage.removeItem('conversationStates');
                      safeLocalStorage.removeItem('offlineQueue');
                      
                      toast({
                        title: "Chat data cleared",
                        description: "All conversation data has been removed.",
                      });
                    } catch (error) {
                      console.error('Failed to clear chat data:', error);
                      toast({
                        title: "Error",
                        description: "Failed to clear chat data.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Call History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Call History</h4>
                  <p className="text-xs text-muted-foreground">Voice and video call logs</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      safeLocalStorage.removeItem('driftzo_call_history');
                      safeLocalStorage.removeItem('driftzo_call_settings');
                      
                      toast({
                        title: "Call history cleared",
                        description: "All call data has been removed.",
                      });
                    } catch (error) {
                      console.error('Failed to clear call history:', error);
                      toast({
                        title: "Error",
                        description: "Failed to clear call history.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Photos & Media */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Photos & Media</h4>
                  <p className="text-xs text-muted-foreground">Uploaded images and files</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      // Clear photo storage keys (they start with 'photos_')
                      const keysToRemove = [];
                      for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('photos_')) {
                          keysToRemove.push(key);
                        }
                      }
                      keysToRemove.forEach(key => safeLocalStorage.removeItem(key));
                      
                      toast({
                        title: "Media cleared",
                        description: "All uploaded photos and files have been removed.",
                      });
                    } catch (error) {
                      console.error('Failed to clear media data:', error);
                      toast({
                        title: "Error",
                        description: "Failed to clear media data.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Cache & Offline Data */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Cache & Offline Data</h4>
                  <p className="text-xs text-muted-foreground">App cache and offline content</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      // Clear cache-related keys
                      const keysToRemove = [];
                      for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.includes('cache') || key.includes('offline') || key.includes('sw_'))) {
                          keysToRemove.push(key);
                        }
                      }
                      keysToRemove.forEach(key => safeLocalStorage.removeItem(key));
                      
                      // Also clear service worker cache if available
                      if ('caches' in window) {
                        caches.keys().then(cacheNames => {
                          cacheNames.forEach(cacheName => {
                            caches.delete(cacheName);
                          });
                        });
                      }
                      
                      toast({
                        title: "Cache cleared",
                        description: "All cached and offline data has been removed.",
                      });
                    } catch (error) {
                      console.error('Failed to clear cache data:', error);
                      toast({
                        title: "Error",
                        description: "Failed to clear cache data.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            <Separator />

            {/* Storage Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Storage Information</h4>
                  <p className="text-xs text-muted-foreground">Current storage usage</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      const totalSize = new Blob([JSON.stringify(localStorage)]).size;
                      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
                      toast({
                        title: "Storage Usage",
                        description: `Current localStorage usage: ${sizeInMB} MB`,
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to calculate storage usage.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Database className="h-4 w-4 mr-1" />
                  Check Usage
                </Button>
              </div>
            </div>

            {/* Clear All Data (Danger Zone) */}
            <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-sm text-red-800">Danger Zone</h4>
              </div>
              <p className="text-xs text-red-700 mb-3">
                This will clear ALL data and reset the app completely. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  try {
                    // Clear all app-specific keys first
                    clearAllAppKeys();
                    
                    // Also clear sessionStorage
                    sessionStorage.clear();
                    
                    // Clear service worker cache if available
                    if ('caches' in window) {
                      caches.keys().then(cacheNames => {
                        cacheNames.forEach(cacheName => {
                          caches.delete(cacheName);
                        });
                      });
                    }
                    
                    toast({
                      title: "All data cleared",
                      description: "The app has been completely reset. Please refresh the page.",
                      variant: "destructive",
                    });
                    // Reload the page after clearing all data
                    setTimeout(() => {
                      window.location.reload();
                    }, 2000);
                  } catch (error) {
                    console.error('Failed to clear all data:', error);
                    toast({
                      title: "Error",
                      description: "Failed to clear all data. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data & Reset App
              </Button>
            </div>
          </div>
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
            Driftzo v1.0.0
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
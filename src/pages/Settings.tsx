import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Bell, 
  Palette, 
  Volume2, 
  MessageCircle, 
  Heart,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Trash2,
  Download,
  Upload,
  HelpCircle,
  Smartphone,
  Phone,
  Wifi,
  Database,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useApp } from '@/hooks/useApp';
import { useCall } from '@/hooks/useCall';
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
  const { user, setUser, language, setLanguage, toggleDarkMode, isDarkMode, safeMode, setSafeMode } = useApp();
  const { callSettings, updateCallSettings } = useCall();
  
  // Password change state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  // App-specific settings state
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });

  const [privacy, setPrivacy] = useState({
    showOnlineStatus: true,
    showLastSeen: true,
    allowDirectMessages: true,
    showInSearch: true,
    dataCollection: false,
    analyticsOptIn: false,
    locationSharing: false
  });

  const [sounds, setSounds] = useState({
    messageSound: true,
    notificationSound: true,
    typingSound: false,
    volume: 70,
    vibration: true
  });

  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReader: false
  });

  const [storage, setStorage] = useState({
    cacheSize: '125 MB',
    autoDownloadImages: true,
    autoDownloadVideos: false,
    offlineMode: false
  });

  const handleExportData = () => {
    // Export data functionality - toast removed per user request
  };

  const handleDeleteAccount = () => {
    // Account deletion functionality - toast removed per user request
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
      <TopBar title="Settings" showBack />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 content-safe-top pb-24">
        
        {/* App Updates */}
        <UpdateBanner />
        
        {/* App Language & Theme */}
        <CollapsibleSection title="Appearance & Language" icon={<Palette className="h-4 w-4" />}>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              App Language
            </Label>
            <Select value={language} onValueChange={(value: 'en' | 'ka') => setLanguage(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="ka">🇬🇪 Georgian (ქართული)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Dark Mode</Label>
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </CollapsibleSection>

        {/* Safe Mode Settings */}
        <CollapsibleSection title="Safe Mode Settings" icon={<Shield className="h-4 w-4" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Light Mode</Label>
                <p className="text-xs text-muted-foreground">Standard conversation mode</p>
              </div>
              <Switch 
                checked={safeMode === 'light'} 
                onCheckedChange={() => setSafeMode('light')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Deep Mode</Label>
                <p className="text-xs text-muted-foreground">More meaningful conversations</p>
              </div>
              <Switch 
                checked={safeMode === 'deep'} 
                onCheckedChange={() => setSafeMode('deep')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Learning Mode</Label>
                <p className="text-xs text-muted-foreground">Educational and practice conversations</p>
              </div>
              <Switch 
                checked={safeMode === 'learning'} 
                onCheckedChange={() => setSafeMode('learning')} 
              />
            </div>
          </div>
        </CollapsibleSection>

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

        {/* Device & Performance */}
        <CollapsibleSection title="Device & Performance" icon={<Smartphone className="h-4 w-4" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-download Images</Label>
                <p className="text-xs text-muted-foreground">Download images automatically</p>
              </div>
              <Switch 
                checked={storage.autoDownloadImages} 
                onCheckedChange={(checked) => setStorage(prev => ({...prev, autoDownloadImages: checked}))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-download Videos</Label>
                <p className="text-xs text-muted-foreground">Download videos on WiFi only</p>
              </div>
              <Switch 
                checked={storage.autoDownloadVideos} 
                onCheckedChange={(checked) => setStorage(prev => ({...prev, autoDownloadVideos: checked}))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Offline Mode</Label>
                <p className="text-xs text-muted-foreground">Cache content for offline use</p>
              </div>
              <Switch 
                checked={storage.offlineMode} 
                onCheckedChange={(checked) => setStorage(prev => ({...prev, offlineMode: checked}))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Cache Size</Label>
                <p className="text-xs text-muted-foreground">Current cache usage</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                setStorage(prev => ({...prev, cacheSize: '0 MB'}));
                // Cache cleared notification removed - obvious action
              }}>
                Clear ({storage.cacheSize})
              </Button>
            </div>
          </div>
        </CollapsibleSection>

        {/* Accessibility */}
        <CollapsibleSection title="Accessibility" icon={<Eye className="h-4 w-4" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">High Contrast</Label>
                <p className="text-xs text-muted-foreground">Increase contrast for better visibility</p>
              </div>
              <Switch 
                checked={accessibility.highContrast} 
                onCheckedChange={(checked) => setAccessibility(prev => ({...prev, highContrast: checked}))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Large Text</Label>
                <p className="text-xs text-muted-foreground">Increase text size</p>
              </div>
              <Switch 
                checked={accessibility.largeText} 
                onCheckedChange={(checked) => setAccessibility(prev => ({...prev, largeText: checked}))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Reduce Motion</Label>
                <p className="text-xs text-muted-foreground">Minimize animations</p>
              </div>
              <Switch 
                checked={accessibility.reduceMotion} 
                onCheckedChange={(checked) => setAccessibility(prev => ({...prev, reduceMotion: checked}))} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Screen Reader Support</Label>
                <p className="text-xs text-muted-foreground">Enhanced screen reader compatibility</p>
              </div>
              <Switch 
                checked={accessibility.screenReader} 
                onCheckedChange={(checked) => setAccessibility(prev => ({...prev, screenReader: checked}))} 
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Notifications */}
        <CollapsibleSection title="Notifications" icon={<Bell className="h-4 w-4" />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications on your device</p>
                </div>
                <Switch 
                  checked={notifications.pushNotifications} 
                  onCheckedChange={(checked) => setNotifications(prev => ({...prev, pushNotifications: checked}))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch 
                  checked={notifications.emailNotifications} 
                  onCheckedChange={(checked) => setNotifications(prev => ({...prev, emailNotifications: checked}))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Quiet Hours</Label>
                  <p className="text-xs text-muted-foreground">Silence notifications during set hours</p>
                </div>
                <Switch 
                  checked={notifications.quietHours} 
                  onCheckedChange={(checked) => setNotifications(prev => ({...prev, quietHours: checked}))} 
                />
              </div>
              {notifications.quietHours && (
                <div className="ml-4 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">From</Label>
                      <Select 
                        value={notifications.quietStart} 
                        onValueChange={(value) => setNotifications(prev => ({...prev, quietStart: value}))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20:00">8:00 PM</SelectItem>
                          <SelectItem value="21:00">9:00 PM</SelectItem>
                          <SelectItem value="22:00">10:00 PM</SelectItem>
                          <SelectItem value="23:00">11:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">To</Label>
                      <Select 
                        value={notifications.quietEnd} 
                        onValueChange={(value) => setNotifications(prev => ({...prev, quietEnd: value}))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="06:00">6:00 AM</SelectItem>
                          <SelectItem value="07:00">7:00 AM</SelectItem>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </CollapsibleSection>

        {/* Privacy & Data */}
        <CollapsibleSection title="Privacy & Data" icon={<Lock className="h-4 w-4" />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Analytics & Insights</Label>
                  <p className="text-xs text-muted-foreground">Help improve EchoRoom with usage data</p>
                </div>
                <Switch 
                  checked={privacy.analyticsOptIn} 
                  onCheckedChange={(checked) => setPrivacy(prev => ({...prev, analyticsOptIn: checked}))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Data Collection</Label>
                  <p className="text-xs text-muted-foreground">Collect data for personalized experience</p>
                </div>
                <Switch 
                  checked={privacy.dataCollection} 
                  onCheckedChange={(checked) => setPrivacy(prev => ({...prev, dataCollection: checked}))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Location Sharing</Label>
                  <p className="text-xs text-muted-foreground">Share location for better matches</p>
                </div>
                <Switch 
                  checked={privacy.locationSharing} 
                  onCheckedChange={(checked) => setPrivacy(prev => ({...prev, locationSharing: checked}))} 
                />
              </div>
            </div>
        </CollapsibleSection>

        {/* Call Settings */}
        <CollapsibleSection title="Call Settings" icon={<Phone className="h-4 w-4" />}>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Video Quality</Label>
              <Select 
                value={callSettings.videoQuality} 
                onValueChange={(value: 'low' | 'medium' | 'high') => updateCallSettings({ videoQuality: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Save Data)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (Best Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Audio Quality</Label>
              <Select 
                value={callSettings.audioQuality} 
                onValueChange={(value: 'low' | 'medium' | 'high') => updateCallSettings({ audioQuality: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Save Data)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (Best Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-Answer Calls</Label>
                <p className="text-xs text-muted-foreground">Automatically answer incoming calls</p>
              </div>
              <Switch 
                checked={callSettings.autoAnswer} 
                onCheckedChange={(checked) => updateCallSettings({ autoAnswer: checked })} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-Mute</Label>
                <p className="text-xs text-muted-foreground">Start calls with microphone muted</p>
              </div>
              <Switch 
                checked={callSettings.autoMute} 
                onCheckedChange={(checked) => updateCallSettings({ autoMute: checked })} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Speaker Default</Label>
                <p className="text-xs text-muted-foreground">Use speaker by default for calls</p>
              </div>
              <Switch 
                checked={callSettings.speakerDefault} 
                onCheckedChange={(checked) => updateCallSettings({ speakerDefault: checked })} 
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Bandwidth Limit</Label>
              <Select 
                value={callSettings.bandwidthLimit} 
                onValueChange={(value: 'low' | 'medium' | 'high' | 'unlimited') => updateCallSettings({ bandwidthLimit: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Save Data)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (Good Quality)</SelectItem>
                  <SelectItem value="unlimited">Unlimited (Best Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Sound & Vibration */}
        <CollapsibleSection title="Sound & Vibration" icon={<Volume2 className="h-4 w-4" />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Message Sounds</Label>
                  <p className="text-xs text-muted-foreground">Play sound for new messages</p>
                </div>
                <Switch 
                  checked={sounds.messageSound} 
                  onCheckedChange={(checked) => setSounds(prev => ({...prev, messageSound: checked}))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Notification Sounds</Label>
                  <p className="text-xs text-muted-foreground">Play sound for notifications</p>
                </div>
                <Switch 
                  checked={sounds.notificationSound} 
                  onCheckedChange={(checked) => setSounds(prev => ({...prev, notificationSound: checked}))} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Vibration</Label>
                  <p className="text-xs text-muted-foreground">Vibrate on notifications</p>
                </div>
                <Switch 
                  checked={sounds.vibration} 
                  onCheckedChange={(checked) => setSounds(prev => ({...prev, vibration: checked}))} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volumeSlider" className="text-sm font-medium">Volume ({sounds.volume}%)</Label>
                <input
                  id="volumeSlider"
                  name="volumeSlider"
                  type="range"
                  min="0"
                  max="100"
                  value={sounds.volume}
                  onChange={(e) => setSounds(prev => ({...prev, volume: parseInt(e.target.value)}))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
        </CollapsibleSection>

        {/* Data Management */}
        <CollapsibleSection title="Data Management" icon={<Database className="h-4 w-4" />}>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export My Data
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // Backup created - toast removed per user request
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Backup Data
              </Button>
              
              <Separator />
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive" 
                onClick={() => {
                  // Data cleared - toast removed per user request
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear App Data
              </Button>
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
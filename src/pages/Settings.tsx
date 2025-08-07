import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Bell, 
  Palette, 
  Volume2, 
  MessageCircle, 
  Heart,
  Eye,
  Lock,
  Trash2,
  Download,
  Upload,
  HelpCircle,
  Smartphone,
  Wifi,
  Database
} from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, toggleDarkMode, isDarkMode } = useApp();

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
    toast({
      title: "Data Export",
      description: "Your data export will be ready shortly. You'll receive a download link via email.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account. This action cannot be undone.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Settings" showBack />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        
        {/* App Language & Theme */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance & Language
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Device & Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Device & Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  toast({ title: "Cache cleared", description: "App cache has been cleared." });
                }}>
                  Clear ({storage.cacheSize})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Sound & Vibration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Sound & Vibration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  toast({
                    title: "Backup Created",
                    description: "Your data has been backed up to cloud storage.",
                  });
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
                  toast({
                    title: "Data Cleared",
                    description: "All local app data has been cleared.",
                  });
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear App Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Help & Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              FAQ & Help Center
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Contact Support
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Policy
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Terms of Service
            </Button>
          </CardContent>
        </Card>

        {/* App Version */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              EchoRoom v1.0.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Made with 💚 for meaningful connections
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Settings;
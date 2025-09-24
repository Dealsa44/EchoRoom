import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { 
  Bell, 
  Phone, 
  Volume2, 
  MessageSquare,
  Settings
} from 'lucide-react';
import { useCall } from '@/hooks/useCall';

const NotificationsCommunication = () => {
  const navigate = useNavigate();
  const { callSettings, updateCallSettings } = useCall();
  const [activeTab, setActiveTab] = useState('notifications');
  
  // Notifications state
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });

  // Sound & Vibration state
  const [sounds, setSounds] = useState({
    messageSound: true,
    notificationSound: true,
    typingSound: false,
    volume: 70,
    vibration: true
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-blue-600" />
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
                      <Label className="text-sm font-medium">SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive important alerts via SMS</p>
                    </div>
                    <Switch 
                      checked={notifications.smsNotifications} 
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, smsNotifications: checked}))} 
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
                    <div className="ml-4 space-y-3 p-3 bg-muted/50 rounded-lg">
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
          </div>
        );

      case 'call-settings':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="h-4 w-4 text-green-600" />
                  Call Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>
        );

      case 'sound-vibration':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Volume2 className="h-4 w-4 text-purple-600" />
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
                      <Label className="text-sm font-medium">Typing Sounds</Label>
                      <p className="text-xs text-muted-foreground">Play sound when typing</p>
                    </div>
                    <Switch 
                      checked={sounds.typingSound} 
                      onCheckedChange={(checked) => setSounds(prev => ({...prev, typingSound: checked}))} 
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <TopBar 
        title="Notifications & Communication" 
        showBack={true}
        onBack={() => navigate('/settings')}
      />

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-6 content-safe-top content-safe-bottom">
        
        {/* Tab Navigation - Mobile First */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('notifications')}
            className="flex items-center gap-2 text-xs h-12"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <Button
            variant={activeTab === 'call-settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('call-settings')}
            className="flex items-center gap-2 text-xs h-12"
          >
            <Phone className="h-4 w-4" />
            Call Settings
          </Button>
          <Button
            variant={activeTab === 'sound-vibration' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sound-vibration')}
            className="flex items-center gap-2 text-xs h-12"
          >
            <Volume2 className="h-4 w-4" />
            Sound
          </Button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default NotificationsCommunication;

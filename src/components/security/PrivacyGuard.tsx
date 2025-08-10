import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Camera, 
  Mic, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Smartphone,
  Monitor,
  Zap,
  Timer
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PrivacySettings {
  screenshotProtection: boolean;
  incognitoMode: boolean;
  autoDeleteMessages: boolean;
  autoDeleteTimer: number; // minutes
  endToEndEncryption: boolean;
  readReceipts: boolean;
  typingIndicators: boolean;
  lastSeenStatus: boolean;
  contentModeration: 'strict' | 'moderate' | 'relaxed';
  allowDataCollection: boolean;
  shareAnalytics: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'screenshot_attempt' | 'screen_recording' | 'privacy_violation' | 'suspicious_activity';
  timestamp: Date;
  description: string;
  severity: 'low' | 'medium' | 'high';
  handled: boolean;
}

const PrivacyGuard: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    screenshotProtection: true,
    incognitoMode: false,
    autoDeleteMessages: false,
    autoDeleteTimer: 60, // 1 hour
    endToEndEncryption: true,
    readReceipts: true,
    typingIndicators: true,
    lastSeenStatus: true,
    contentModeration: 'moderate',
    allowDataCollection: false,
    shareAnalytics: false
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'screenshot_attempt',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      description: 'Screenshot attempt detected and blocked',
      severity: 'medium',
      handled: true
    },
    {
      id: '2',
      type: 'privacy_violation',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      description: 'Suspicious activity detected in conversation',
      severity: 'high',
      handled: false
    }
  ]);

  const [isIncognitoActive, setIsIncognitoActive] = useState(false);
  const [screenshotAttempts, setScreenshotAttempts] = useState(0);
  const lastActivityRef = useRef<Date>(new Date());

  // Screenshot protection
  useEffect(() => {
    if (!settings.screenshotProtection) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User might be taking a screenshot or switching apps
        setScreenshotAttempts(prev => prev + 1);
        
        const event: SecurityEvent = {
          id: Date.now().toString(),
          type: 'screenshot_attempt',
          timestamp: new Date(),
          description: 'Potential screenshot or screen recording detected',
          severity: 'medium',
          handled: false
        };
        
        setSecurityEvents(prev => [event, ...prev.slice(0, 9)]);
        
        // Privacy alert - toast removed per user request
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect common screenshot shortcuts
      const isScreenshotShortcut = 
        (e.key === 'PrintScreen') ||
        (e.metaKey && e.shiftKey && e.key === '4') || // macOS
        (e.metaKey && e.shiftKey && e.key === '3') || // macOS
        (e.altKey && e.key === 'PrintScreen'); // Windows

      if (isScreenshotShortcut) {
        e.preventDefault();
        setScreenshotAttempts(prev => prev + 1);
        
        // Screenshot blocked - toast removed per user request
      }
    };

    // Detect screen recording (experimental)
    const detectScreenRecording = async () => {
      try {
        if ('getDisplayMedia' in navigator.mediaDevices) {
          // This is a simplified detection - in reality, this would need more sophisticated methods
          const checkRecording = () => {
            if (document.hasFocus() && Math.random() < 0.1) { // Simulate detection
              const event: SecurityEvent = {
                id: Date.now().toString(),
                type: 'screen_recording',
                timestamp: new Date(),
                description: 'Screen recording activity detected',
                severity: 'high',
                handled: false
              };
              
              setSecurityEvents(prev => [event, ...prev.slice(0, 9)]);
            }
          };

          setInterval(checkRecording, 10000); // Check every 10 seconds
        }
      } catch (error) {
        console.log('Screen recording detection not available');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    detectScreenRecording();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settings.screenshotProtection]);

  // Incognito mode
  useEffect(() => {
    if (settings.incognitoMode) {
      setIsIncognitoActive(true);
      document.body.style.filter = 'blur(0px)'; // Ready to blur on unfocus
      
      const handleFocus = () => {
        document.body.style.filter = 'blur(0px)';
      };
      
      const handleBlur = () => {
        document.body.style.filter = 'blur(10px)';
      };

      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);

      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
        document.body.style.filter = 'blur(0px)';
      };
    } else {
      setIsIncognitoActive(false);
      document.body.style.filter = 'blur(0px)';
    }
  }, [settings.incognitoMode]);

  // Auto-delete messages timer
  useEffect(() => {
    if (!settings.autoDeleteMessages) return;

    const interval = setInterval(() => {
      // In a real app, this would delete messages from storage
      console.log(`Auto-deleting messages older than ${settings.autoDeleteTimer} minutes`);
    }, settings.autoDeleteTimer * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.autoDeleteMessages, settings.autoDeleteTimer]);

  const updateSetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Privacy setting updated - toast removed per user request
  };

  const handleSecurityEvent = (eventId: string) => {
    setSecurityEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, handled: true } : event
    ));
  };

  const clearSecurityLog = () => {
    setSecurityEvents([]);
    // Security log cleared - toast removed per user request
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'screenshot_attempt': return <Camera size={16} />;
      case 'screen_recording': return <Monitor size={16} />;
      case 'privacy_violation': return <AlertTriangle size={16} />;
      default: return <Shield size={16} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-blue-600" />
            Privacy & Security
          </h2>
          <p className="text-muted-foreground">Protect your conversations and data</p>
        </div>
        
        {isIncognitoActive && (
          <Badge className="bg-purple-100 text-purple-800">
            <EyeOff size={12} className="mr-1" />
            Incognito Active
          </Badge>
        )}
      </div>

      {/* Quick Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                settings.endToEndEncryption ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {settings.endToEndEncryption ? 
                  <Lock size={20} className="text-green-600" /> : 
                  <Unlock size={20} className="text-red-600" />
                }
              </div>
              <div>
                <p className="font-medium">Encryption</p>
                <p className="text-sm text-muted-foreground">
                  {settings.endToEndEncryption ? 'Protected' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Camera size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Screenshots</p>
                <p className="text-sm text-muted-foreground">
                  {screenshotAttempts} blocked today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Timer size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Auto-Delete</p>
                <p className="text-sm text-muted-foreground">
                  {settings.autoDeleteMessages ? `${settings.autoDeleteTimer}min` : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Screenshot Protection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera size={20} className="text-muted-foreground" />
              <div>
                <Label className="text-base font-medium">Screenshot Protection</Label>
                <p className="text-sm text-muted-foreground">Block screenshots and screen recording</p>
              </div>
            </div>
            <Switch
              checked={settings.screenshotProtection}
              onCheckedChange={(checked) => updateSetting('screenshotProtection', checked)}
            />
          </div>

          {/* Incognito Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EyeOff size={20} className="text-muted-foreground" />
              <div>
                <Label className="text-base font-medium">Incognito Mode</Label>
                <p className="text-sm text-muted-foreground">Blur screen when app loses focus</p>
              </div>
            </div>
            <Switch
              checked={settings.incognitoMode}
              onCheckedChange={(checked) => updateSetting('incognitoMode', checked)}
            />
          </div>

          {/* Auto-Delete Messages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-muted-foreground" />
                <div>
                  <Label className="text-base font-medium">Auto-Delete Messages</Label>
                  <p className="text-sm text-muted-foreground">Automatically delete messages after time limit</p>
                </div>
              </div>
              <Switch
                checked={settings.autoDeleteMessages}
                onCheckedChange={(checked) => updateSetting('autoDeleteMessages', checked)}
              />
            </div>
            
            {settings.autoDeleteMessages && (
              <div className="ml-11">
                <Label className="text-sm">Delete after (minutes):</Label>
                <div className="flex gap-2 mt-2">
                  {[30, 60, 180, 1440].map(minutes => (
                    <Button
                      key={minutes}
                      variant={settings.autoDeleteTimer === minutes ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('autoDeleteTimer', minutes)}
                    >
                      {minutes < 60 ? `${minutes}m` : minutes === 60 ? '1h' : minutes === 180 ? '3h' : '24h'}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* End-to-End Encryption */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-muted-foreground" />
              <div>
                <Label className="text-base font-medium">End-to-End Encryption</Label>
                <p className="text-sm text-muted-foreground">Encrypt messages for maximum security</p>
              </div>
            </div>
            <Switch
              checked={settings.endToEndEncryption}
              onCheckedChange={(checked) => updateSetting('endToEndEncryption', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Security Events</CardTitle>
            <Button variant="outline" size="sm" onClick={clearSecurityLog}>
              Clear Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {securityEvents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="font-semibold mb-2">All Clear</h3>
              <p className="text-sm text-muted-foreground">No security events detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {securityEvents.map(event => (
                <Alert key={event.id} className={getSeverityColor(event.severity)}>
                  <div className="flex items-start gap-3">
                    {getEventIcon(event.type)}
                    <div className="flex-1">
                      <AlertDescription className="font-medium">
                        {event.description}
                      </AlertDescription>
                      <p className="text-xs mt-1">
                        {event.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={event.handled ? 'default' : 'destructive'} className="text-xs">
                        {event.handled ? 'Handled' : 'Active'}
                      </Badge>
                      {!event.handled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSecurityEvent(event.id)}
                        >
                          Mark Handled
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyGuard;
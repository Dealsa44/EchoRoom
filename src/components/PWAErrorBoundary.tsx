import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Smartphone, Globe, Bug, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isPWA: boolean;
  isIOS: boolean;
  debugInfo: string[];
  showDebug: boolean;
}

class PWAErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isPWA: false,
      isIOS: false,
      debugInfo: [],
      showDebug: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isPWA: window.matchMedia('(display-mode: standalone)').matches || 
             (window.navigator as any).standalone === true,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      debugInfo: [],
      showDebug: false
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PWA Error Boundary caught an error:', error, errorInfo);
    
    // Collect debug information for mobile display
    const debugInfo: string[] = [];
    
    // Basic error info
    debugInfo.push(`Error: ${error.message}`);
    debugInfo.push(`Stack: ${error.stack?.split('\n')[0] || 'No stack trace'}`);
    
    // PWA and device info
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                   (window.navigator as any).standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    debugInfo.push(`PWA Mode: ${isPWA ? 'Yes' : 'No'}`);
    debugInfo.push(`iOS Device: ${isIOS ? 'Yes' : 'No'}`);
    debugInfo.push(`User Agent: ${navigator.userAgent.substring(0, 50)}...`);
    
    // Storage availability
    debugInfo.push(`localStorage: ${typeof localStorage !== 'undefined' ? 'Available' : 'Not Available'}`);
    debugInfo.push(`sessionStorage: ${typeof sessionStorage !== 'undefined' ? 'Available' : 'Not Available'}`);
    
    // Enhanced debugging for storage issues
    try {
      localStorage.setItem('test', 'test');
      const testValue = localStorage.getItem('test');
      localStorage.removeItem('test');
      debugInfo.push(`localStorage Test: ${testValue === 'test' ? 'PASS' : 'FAIL'}`);
    } catch (storageError) {
      debugInfo.push(`localStorage Test: FAIL - ${storageError.message}`);
    }
    
    try {
      sessionStorage.setItem('test', 'test');
      const testValue = sessionStorage.getItem('test');
      sessionStorage.removeItem('test');
      debugInfo.push(`sessionStorage Test: ${testValue === 'test' ? 'PASS' : 'FAIL'}`);
    } catch (storageError) {
      debugInfo.push(`sessionStorage Test: FAIL - ${storageError.message}`);
    }
    
    // Check for specific app data
    try {
      const userData = localStorage.getItem('echoroom_current_user');
      debugInfo.push(`User Data: ${userData ? `Exists (${userData.length} chars)` : 'Not Found'}`);
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          debugInfo.push(`User Data Valid: ${parsedUser && parsedUser.id ? 'Yes' : 'No'}`);
        } catch (parseError) {
          debugInfo.push(`User Data Parse: FAIL - ${parseError.message}`);
        }
      }
    } catch (userDataError) {
      debugInfo.push(`User Data Access: FAIL - ${userDataError.message}`);
    }
    
    // Check for event-related data
    try {
      const hostedEvents = localStorage.getItem('hostedEvents');
      const joinedEvents = localStorage.getItem('joinedEvents');
      debugInfo.push(`Hosted Events: ${hostedEvents ? `Exists (${hostedEvents.length} chars)` : 'Not Found'}`);
      debugInfo.push(`Joined Events: ${joinedEvents ? `Exists (${joinedEvents.length} chars)` : 'Not Found'}`);
    } catch (eventDataError) {
      debugInfo.push(`Event Data Access: FAIL - ${eventDataError.message}`);
    }
    
    // Update state with debug info
    this.setState({ debugInfo });
    
    // Log additional PWA context
    if (isPWA) {
      console.log('Error occurred in PWA mode');
      console.log('iOS device:', isIOS);
      console.log('localStorage available:', typeof localStorage !== 'undefined');
      console.log('sessionStorage available:', typeof sessionStorage !== 'undefined');
      
      // Enhanced debugging for storage issues
      try {
        console.log('localStorage test:', localStorage.getItem('test'));
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        console.log('localStorage is working');
      } catch (storageError) {
        console.error('localStorage is broken:', storageError);
      }
      
      try {
        console.log('sessionStorage test:', sessionStorage.getItem('test'));
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        console.log('sessionStorage is working');
      } catch (storageError) {
        console.error('sessionStorage is broken:', storageError);
      }
      
      // Check for specific app data
      try {
        const userData = localStorage.getItem('echoroom_current_user');
        console.log('User data exists:', !!userData);
        if (userData) {
          console.log('User data length:', userData.length);
        }
      } catch (userDataError) {
        console.error('Cannot access user data:', userDataError);
      }
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleOpenInBrowser = () => {
    // Try to open in regular browser
    if (this.state.isPWA) {
      const currentUrl = window.location.href;
      // Remove PWA-specific parameters and open in browser
      window.open(currentUrl, '_blank');
    }
  };

  handleClearStorage = () => {
    try {
      // Clear all storage that might be corrupted
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear specific app keys
      localStorage.removeItem('echoroom_current_user');
      localStorage.removeItem('echoroom_users');
      localStorage.removeItem('joinedRooms');
      localStorage.removeItem('darkMode');
      
      // Clear new event-related keys that might be causing issues
      localStorage.removeItem('hostedEvents');
      localStorage.removeItem('joinedEvents');
      localStorage.removeItem('myEventsActiveTab');
      
      // Clear any photo storage
      const photoKeys = Object.keys(localStorage).filter(key => key.startsWith('photos_'));
      photoKeys.forEach(key => localStorage.removeItem(key));
      
      console.log('Storage cleared successfully');
      this.setState({ hasError: false, error: null });
      
      // Force a complete app reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      // If clearing fails, try to reload anyway
      window.location.reload();
    }
  };

  toggleDebug = () => {
    this.setState(prev => ({ showDebug: !prev.showDebug }));
  };

  render() {
    if (this.state.hasError) {
      const isStorageError = this.state.error?.message?.includes('localStorage') || 
                           this.state.error?.message?.includes('sessionStorage') ||
                           this.state.error?.message?.includes('storage');

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-lg">
                {this.state.isPWA ? 'PWA Error' : 'App Error'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isStorageError && this.state.isPWA && this.state.isIOS
                    ? "We're experiencing issues with data storage on your device. This is a known issue with some iOS devices when using the app from the home screen."
                    : this.state.error?.message?.includes('profile') || this.state.error?.message?.includes('user')
                    ? "There's an issue loading your profile data. This usually happens when the app's data gets corrupted."
                    : "Something went wrong while loading the app. Please try one of the solutions below."}
                </p>
                
                {this.state.isPWA && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Smartphone className="h-3 w-3" />
                    <span>Running as PWA</span>
                  </div>
                )}
                
                {this.state.isIOS && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span>📱 iOS Device</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={this.handleRefresh} 
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh App
                </Button>
                
                {this.state.isPWA && (
                  <Button 
                    onClick={this.handleOpenInBrowser} 
                    className="w-full"
                    variant="outline"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Open in Browser
                  </Button>
                )}
                
                {(isStorageError || this.state.error?.message?.includes('profile') || this.state.error?.message?.includes('user')) && (
                  <Button 
                    onClick={this.handleClearStorage} 
                    className="w-full"
                    variant="destructive"
                  >
                    {this.state.error?.message?.includes('profile') || this.state.error?.message?.includes('user')
                      ? 'Fix Profile & Clear Data'
                      : 'Clear App Data'}
                  </Button>
                )}
              </div>

                             <div className="text-xs text-muted-foreground text-center">
                 <p>If the problem persists, try:</p>
                 <ul className="list-disc list-inside mt-1 space-y-1">
                   <li>Removing the app from home screen and re-adding it</li>
                   <li>Using the app in Safari browser instead</li>
                   <li>Checking your device's privacy settings</li>
                 </ul>
               </div>

               {/* Debug Information Section */}
               <div className="border-t border-border pt-4">
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={this.toggleDebug}
                   className="w-full flex items-center justify-center gap-2 text-xs"
                 >
                   <Bug className="h-3 w-3" />
                   {this.state.showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
                   {this.state.showDebug ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                 </Button>
                 
                 {this.state.showDebug && (
                   <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs font-mono max-h-40 overflow-y-auto">
                     <div className="text-xs text-muted-foreground mb-2 font-sans">Debug Information:</div>
                     {this.state.debugInfo.map((info, index) => (
                       <div key={index} className="text-xs text-foreground mb-1">
                         {info}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PWAErrorBoundary;

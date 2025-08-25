import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Smartphone, Globe } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isPWA: boolean;
  isIOS: boolean;
}

class PWAErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isPWA: false,
      isIOS: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isPWA: window.matchMedia('(display-mode: standalone)').matches || 
             (window.navigator as any).standalone === true,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PWA Error Boundary caught an error:', error, errorInfo);
    
    // Log additional PWA context
    if (this.state.isPWA) {
      console.log('Error occurred in PWA mode');
      console.log('iOS device:', this.state.isIOS);
      console.log('localStorage available:', typeof localStorage !== 'undefined');
      console.log('sessionStorage available:', typeof sessionStorage !== 'undefined');
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
      
      console.log('Storage cleared successfully');
      this.setState({ hasError: false, error: null });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
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
                
                {isStorageError && (
                  <Button 
                    onClick={this.handleClearStorage} 
                    className="w-full"
                    variant="destructive"
                  >
                    Clear App Data
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
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PWAErrorBoundary;

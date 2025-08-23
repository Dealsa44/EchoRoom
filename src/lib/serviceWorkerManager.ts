class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private updateCallback: (() => void) | null = null;
  private isDevelopmentMode = false;

  async register(options: { developmentMode?: boolean } = {}) {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    this.isDevelopmentMode = options.developmentMode || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('gitpod') ||
      window.location.hostname.includes('vercel.app');

    if (this.isDevelopmentMode) {
      console.log('🔧 Development mode detected - using faster update checks');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', this.registration);

      // Check for updates immediately
      await this.checkForUpdates();

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
        this.handleUpdateFound();
      });

      // Listen for service worker state changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        this.handleControllerChange();
      });

      // Check for updates more frequently during development
      const updateInterval = this.isDevelopmentMode ? 30 * 1000 : 5 * 60 * 1000; // 30 seconds in dev, 5 minutes in production
      setInterval(() => {
        this.checkForUpdates();
      }, updateInterval);
      
      if (this.isDevelopmentMode) {
        console.log('🚀 Development mode: Checking for updates every 30 seconds');
      }
      
      // Check for updates when tab becomes visible (user switches back)
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          console.log('Tab became visible, checking for updates...');
          this.checkForUpdates();
        }
      });
      
      // Check for updates when user focuses the window
      window.addEventListener('focus', () => {
        console.log('Window focused, checking for updates...');
        this.checkForUpdates();
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private async checkForUpdates() {
    if (!this.registration) return;

    try {
      console.log('Checking for service worker updates...');
      await this.registration.update();
      
      // Also send message to service worker to trigger manual check
      if (this.registration.active) {
        this.registration.active.postMessage({ type: 'CHECK_FOR_UPDATE' });
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  private handleUpdateFound() {
    if (!this.registration) return;

    const newWorker = this.registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New service worker is installed and waiting
        this.updateAvailable = true;
        this.notifyUpdateAvailable();
      }
    });
  }

  private handleControllerChange() {
    // Service worker has taken control, reload the page to get the new version
    if (this.updateAvailable) {
      this.updateAvailable = false;
      window.location.reload();
    }
  }

  private notifyUpdateAvailable() {
    // Show a notification to the user
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('EchoRoom Update Available', {
        body: 'A new version is available. The app will update automatically.',
        icon: '/EchoRoom.png',
        tag: 'update-notification'
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Call the update callback if provided
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  // Method to manually apply the update
  async applyUpdate() {
    if (!this.registration || !this.updateAvailable) return;

    try {
      // Send message to service worker to skip waiting
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Failed to apply update:', error);
    }
  }

  // Set callback for when updates are available
  onUpdateAvailable(callback: () => void) {
    this.updateCallback = callback;
  }

  // Check if update is available
  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  // Get the service worker registration
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  // Force an immediate update check (for manual refresh)
  async forceUpdateCheck(): Promise<void> {
    console.log('🔄 Force checking for updates...');
    await this.checkForUpdates();
    
    // Give it a moment to detect the update, then check again
    setTimeout(async () => {
      await this.checkForUpdates();
    }, 1000);
  }

  // Get development mode status
  isDevelopment(): boolean {
    return this.isDevelopmentMode;
  }

  // Get current update check interval
  getUpdateInterval(): number {
    return this.isDevelopmentMode ? 30 * 1000 : 5 * 60 * 1000;
  }
}

// Create a singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();
export default ServiceWorkerManager;

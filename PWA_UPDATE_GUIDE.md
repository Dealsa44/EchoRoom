# Driftzo PWA Automatic Update System

## Overview

Driftzo now includes an automatic update system that allows your PWA to update automatically when you deploy new versions to Vercel, without requiring users to manually delete and reinstall the app from their home screen.

## How It Works

### 1. Service Worker Updates
- **Development Mode**: Checks for updates every 30 seconds (localhost, vercel.app, etc.)
- **Production Mode**: Checks for updates every 5 minutes
- **Tab Focus**: Checks immediately when you switch back to the tab
- **Window Focus**: Checks when you focus the browser window
- When a new version is detected, it downloads and installs in the background
- Users are notified that an update is available

### 2. Automatic Update Process
- New service worker is installed alongside the current one
- When ready, it takes control and reloads the page
- Users get the new version automatically

### 3. User Experience
- **Update Notification**: Users see a notification when updates are available
- **Settings Integration**: Update status is visible in the Settings page
- **Manual Updates**: "Check now" button for immediate updates
- **Keyboard Shortcut**: Ctrl+U (Cmd+U on Mac) to check for updates
- **Development Mode**: Shows update frequency and faster detection
- **Automatic Reload**: App restarts automatically after update

## Deployment Workflow

### Before Deploying to Vercel:

1. **Update Version Numbers**:
   ```bash
   npm run update-version
   ```
   This script will:
   - Increment the service worker cache version
   - Update package.json version
   - Update manifest.json version

2. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Update version for deployment"
   git push
   ```

3. **Deploy to Vercel**:
   - Vercel will automatically build and deploy your changes
   - **Development**: Users get updates within 30 seconds
   - **Production**: Users get updates within 5 minutes
   - **Immediate**: Use Ctrl+U or "Check now" button for instant updates

## Technical Details

### Service Worker Features
- **Cache Management**: Automatically cleans up old caches
- **Update Detection**: Checks for new versions every hour
- **Background Installation**: Installs updates without user intervention
- **iOS Compatibility**: Special handling for iOS Safari

### Update Components
- `UpdateNotification`: Floating notification for updates
- `UpdateBanner`: Settings page update status
- `useServiceWorker`: React hook for update management
- `ServiceWorkerManager`: Core update logic

## Manual Update Options

### Multiple Ways to Check for Updates
1. **Automatic**: Updates check automatically based on mode
2. **Settings Page**: "Check now" button in Settings
3. **Keyboard Shortcut**: Press Ctrl+U (Cmd+U on Mac)
4. **Tab Focus**: Automatically checks when you return to the tab
5. **Window Focus**: Checks when you focus the browser window

### Development vs Production
- **Development Mode** (localhost, vercel.app):
  - Updates check every 30 seconds
  - Shows "🔧 Development mode" indicators
  - Faster detection and installation
- **Production Mode**:
  - Updates check every 5 minutes
  - Standard update behavior

## User Notifications

### Update Available
- Users see a floating notification in the bottom-right corner
- Settings page shows an update banner
- Push notifications (if permission granted)
- Development mode shows update frequency

### Update Process
- "Update Now" button to apply immediately
- Automatic page reload after update
- Progress indicator during update

## Testing Updates

### Local Testing
1. Make changes to your code
2. Run `npm run update-version`
3. Build and test locally
4. Deploy to Vercel

### Verification
- Check browser console for service worker messages
- Verify cache version changes
- Test update notification flow

## Troubleshooting

### Common Issues
- **Updates not detected**: Check service worker registration in browser console
- **Cache not clearing**: Verify CACHE_NAME changes between versions
- **iOS issues**: Ensure proper iOS Safari handling

### Debug Commands
```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations()

// Force update check
navigator.serviceWorker.getRegistration().then(r => r.update())

// Clear all caches
caches.keys().then(names => names.forEach(name => caches.delete(name)))
```

## Best Practices

1. **Always run `npm run update-version` before deploying**
2. **Test updates locally before deploying**
3. **Monitor service worker logs in production**
4. **Keep cache versions unique for each deployment**
5. **Handle update failures gracefully**

## iOS-Specific Notes

- iOS Safari has different service worker behavior
- Updates may take longer to detect on iOS
- Home screen app updates automatically after page reload
- Consider iOS-specific testing for critical updates

## Future Enhancements

- [ ] Update progress indicators
- [ ] Rollback functionality
- [ ] Update changelog display
- [ ] Offline update queuing
- [ ] A/B testing support

---

For questions or issues, check the browser console logs and service worker status in the browser's developer tools.

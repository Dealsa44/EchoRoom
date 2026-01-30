import React from 'react';
import { useServiceWorker } from '../hooks/useServiceWorker';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { RefreshCw, Download, CheckCircle } from 'lucide-react';

export const UpdateBanner: React.FC = () => {
  const { updateAvailable, isUpdating, applyUpdate, checkForUpdates, isDevelopmentMode, updateInterval } = useServiceWorker();
  
  const formatInterval = (ms: number) => {
    if (ms < 60000) return `${ms / 1000}s`;
    return `${ms / 60000}min`;
  };

  if (!updateAvailable) {
    return (
      <Alert className="mb-4 border-green-300 bg-green-100 dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-200">App is up to date</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          <div className="space-y-2">
            <p>You're running the latest version of Pulsly.</p>
            {isDevelopmentMode && (
              <p className="text-xs text-green-600 dark:text-green-400">
                🔧 Development mode: Auto-checking every {formatInterval(updateInterval)}
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={checkForUpdates}
              className="h-6 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-200 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Check now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle>Update available</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>A new version of Pulsly is available with improvements and bug fixes.</p>
          {isDevelopmentMode && (
            <p className="text-xs text-muted-foreground">
              🚀 Development mode: Updates detected quickly!
            </p>
          )}
          <div className="flex gap-2">
          <Button
            onClick={applyUpdate}
            disabled={isUpdating}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Update Now
              </>
            )}
          </Button>
          <Button
            onClick={checkForUpdates}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Again
          </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

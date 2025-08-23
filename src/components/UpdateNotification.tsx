import React from 'react';
import { useServiceWorker } from '../hooks/useServiceWorker';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RefreshCw, Download } from 'lucide-react';

export const UpdateNotification: React.FC = () => {
  const { updateAvailable, isUpdating, applyUpdate, checkForUpdates } = useServiceWorker();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-2 border-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5 text-blue-500" />
            Update Available
          </CardTitle>
          <CardDescription>
            A new version of EchoRoom is available with improvements and bug fixes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={applyUpdate}
              disabled={isUpdating}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
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
              className="px-3"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The app will restart automatically after the update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

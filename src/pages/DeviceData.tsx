import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { 
  Smartphone, 
  Database, 
  Download,
  Upload,
  Trash2,
  Wifi,
  HardDrive,
  Settings
} from 'lucide-react';

const DeviceData = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('device');
  
  // Device & Performance state
  const [storage, setStorage] = useState({
    cacheSize: '125 MB',
    autoDownloadImages: true,
    autoDownloadVideos: false,
    offlineMode: false
  });

  const handleExportData = () => {
    // Export data functionality
    console.log('Exporting data...');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'device':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Smartphone className="h-4 w-4 text-blue-600" />
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
                    }}>
                      Clear ({storage.cacheSize})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Database className="h-4 w-4 text-green-600" />
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
                      console.log('Backing up data...');
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
                      console.log('Clearing app data...');
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear App Data
                  </Button>
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
        title="Device & Data" 
        showBack={true}
        onBack={() => navigate('/settings')}
      />

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-6 content-safe-top">
        
        {/* Tab Navigation - Mobile First */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={activeTab === 'device' ? 'default' : 'outline'}
            onClick={() => setActiveTab('device')}
            className="flex items-center gap-2 text-xs h-12"
          >
            <Smartphone className="h-4 w-4" />
            Device
          </Button>
          <Button
            variant={activeTab === 'data' ? 'default' : 'outline'}
            onClick={() => setActiveTab('data')}
            className="flex items-center gap-2 text-xs h-12"
          >
            <Database className="h-4 w-4" />
            Data
          </Button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default DeviceData;

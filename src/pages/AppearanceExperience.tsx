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
  Globe, 
  Eye, 
  Palette,
  Languages,
  Monitor,
  Accessibility
} from 'lucide-react';
import { useApp } from '@/hooks/useApp';

const AppearanceExperience = () => {
  const navigate = useNavigate();
  const { language, setLanguage, toggleDarkMode, isDarkMode } = useApp();
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Accessibility state
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReader: false
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Palette className="h-4 w-4 text-blue-600" />
                  App Language & Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Language</Label>
                    <Select 
                      value={language} 
                      onValueChange={(value: 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh') => setLanguage(value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Theme</Label>
                    <Select 
                      value={isDarkMode ? 'dark' : 'light'} 
                      onValueChange={(value: 'light' | 'dark' | 'system') => toggleDarkMode(value === 'dark')}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Accessibility className="h-4 w-4 text-green-600" />
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
        title="Appearance & Experience" 
        showBack={true}
        onBack={() => navigate('/settings')}
      />

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-6 content-safe-top pb-24">
        
        {/* Tab Navigation - Mobile First */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={activeTab === 'appearance' ? 'default' : 'outline'}
            onClick={() => setActiveTab('appearance')}
            className="flex items-center gap-2 text-xs h-12"
          >
            <Palette className="h-4 w-4" />
            Appearance
          </Button>
          <Button
            variant={activeTab === 'accessibility' ? 'default' : 'outline'}
            onClick={() => setActiveTab('accessibility')}
            className="flex items-center gap-2 text-xs h-12"
          >
            <Accessibility className="h-4 w-4" />
            Accessibility
          </Button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AppearanceExperience;

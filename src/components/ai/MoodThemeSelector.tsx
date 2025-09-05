import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Sparkles, 
  Zap, 
  RefreshCw,
  Check,
  X,
  Lightbulb
} from 'lucide-react';
import { 
  MoodTheme,
  moodThemes, 
  getThemeSuggestions, 
  applyMoodTheme,
  createParticleEffect
} from '@/lib/moodThemes';
import { toast } from '@/hooks/use-toast';

interface MoodThemeSelectorProps {
  currentTheme: string;
  messages: Array<{ content: string; timestamp: Date }>;
  onThemeChange: (themeId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MoodThemeSelector = ({
  currentTheme,
  messages,
  onThemeChange,
  isOpen,
  onClose
}: MoodThemeSelectorProps) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [suggestions, setSuggestions] = useState<Array<{ theme: MoodTheme; confidence: number; reason: string }>>([]);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const themeSuggestions = getThemeSuggestions(messages, currentTheme);
      setSuggestions(themeSuggestions);
      setSelectedTheme(currentTheme);
    }
  }, [isOpen, messages, currentTheme]);

  const handleThemePreview = (themeId: string) => {
    setPreviewTheme(themeId);
    applyMoodTheme(themeId);
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    applyMoodTheme(themeId);
    onThemeChange(themeId);
    
    const theme = moodThemes[themeId];
    // Theme applied - toast removed per user request

    // Create particle effect if enabled
    const chatContainer = document.querySelector('.chat-container') as HTMLElement;
    if (chatContainer && theme.effects.particles) {
      createParticleEffect(themeId, chatContainer);
    }
    
    onClose();
  };

  const handleClose = () => {
    // Restore original theme if we were just previewing
    if (previewTheme && previewTheme !== currentTheme) {
      applyMoodTheme(currentTheme);
    }
    setPreviewTheme(null);
    onClose();
  };

  if (!isOpen) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm mx-auto max-h-[70vh] overflow-hidden rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-purple-500" />
            Mood-Based Chat Themes
          </DialogTitle>
          <DialogDescription>
            AI-powered themes that adapt to your conversation's mood and tone
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(70vh-120px)] space-y-4">
          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                AI Recommendations
              </h3>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <Card key={suggestion.theme.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{suggestion.theme.emoji}</span>
                          <span className="font-medium">{suggestion.theme.name}</span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                          >
                            {suggestion.confidence}% match
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleThemePreview(suggestion.theme.id)}
                          >
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleThemeSelect(suggestion.theme.id)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {suggestion.theme.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lightbulb className="h-3 w-3 text-yellow-500" />
                        <span>{suggestion.reason}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* All Themes */}
          <div>
            <h3 className="font-semibold mb-3">All Available Themes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.values(moodThemes).map((theme) => (
                <Card 
                  key={theme.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTheme === theme.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleThemePreview(theme.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{theme.emoji}</span>
                        <span className="font-medium">{theme.name}</span>
                      </div>
                      {selectedTheme === theme.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      {theme.description}
                    </p>
                    
                    {/* Color Preview */}
                    <div className="flex gap-1 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>
                    
                    {/* Theme Features */}
                    <div className="flex flex-wrap gap-1">
                      {theme.effects.particles && (
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-2 w-2 mr-1" />
                          Particles
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Zap className="h-2 w-2 mr-1" />
                        {theme.effects.animations}
                      </Badge>
                      {theme.effects.soundEffects && (
                        <Badge variant="outline" className="text-xs">
                          🔊 Sound
                        </Badge>
                      )}
                    </div>
                    
                    {/* Apply Button */}
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleThemeSelect(theme.id);
                      }}
                      disabled={selectedTheme === theme.id}
                    >
                      {selectedTheme === theme.id ? 'Current Theme' : 'Apply Theme'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Theme Info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">
              Themes automatically adapt based on your conversation content and mood
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const newSuggestions = getThemeSuggestions(messages, currentTheme);
                  setSuggestions(newSuggestions);
                  // Refreshed suggestions - toast removed per user request
                }}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh Suggestions
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoodThemeSelector;
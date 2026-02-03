import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';
import { moodThemesOrdered, type MoodTheme } from '@/lib/moodThemes';
import { toast } from '@/hooks/use-toast';

interface MoodThemeSelectorProps {
  currentTheme: string;
  conversationId: string | null;
  onThemeChange: (themeId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onApplyTheme: (conversationId: string, themeId: string, themeName: string) => Promise<boolean>;
}

const MoodThemeSelector = ({
  currentTheme,
  conversationId,
  onThemeChange,
  isOpen,
  onClose,
  onApplyTheme,
}: MoodThemeSelectorProps) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(currentTheme);
    }
  }, [isOpen, currentTheme]);

  const handleApply = async (theme: MoodTheme) => {
    if (!conversationId) {
      toast({ title: 'Error', description: 'Conversation not found', variant: 'destructive' });
      return;
    }
    if (selectedTheme === theme.id) return;
    setApplying(true);
    try {
      const ok = await onApplyTheme(conversationId, theme.id, theme.name);
      if (ok) {
        setSelectedTheme(theme.id);
        onThemeChange(theme.id);
        onClose();
      }
    } finally {
      setApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm mx-auto max-h-[70vh] overflow-hidden rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-purple-500" />
            Mood Themes
          </DialogTitle>
          <DialogDescription>
            Change the chat background theme for this conversation. Both of you will see the same theme.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(70vh-120px)] space-y-4">
          {/* Default theme at the very top */}
          <div>
            <h3 className="font-semibold mb-3">Default theme</h3>
            <ThemeCard
              theme={moodThemesOrdered[0]}
              isSelected={selectedTheme === moodThemesOrdered[0].id}
              onApply={() => handleApply(moodThemesOrdered[0])}
              applying={applying}
            />
          </div>

          {/* All other themes */}
          <div>
            <h3 className="font-semibold mb-3">Available themes</h3>
            <div className="grid grid-cols-1 gap-2">
              {moodThemesOrdered.slice(1).map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={selectedTheme === theme.id}
                  onApply={() => handleApply(theme)}
                  applying={applying}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function ThemeCard({
  theme,
  isSelected,
  onApply,
  applying,
}: {
  theme: MoodTheme;
  isSelected: boolean;
  onApply: () => void;
  applying: boolean;
}) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{theme.emoji}</span>
            <span className="font-medium">{theme.name}</span>
          </div>
          {isSelected && <Check className="h-4 w-4 text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground mb-3">{theme.description}</p>
        <div className="flex gap-1.5 mb-3">
          <div
            className="w-5 h-5 rounded-full border border-border"
            style={{ backgroundColor: theme.colors.primary }}
            title="Primary"
          />
          <div
            className="w-5 h-5 rounded-full border border-border"
            style={{ backgroundColor: theme.colors.secondary }}
            title="Secondary"
          />
          <div
            className="w-5 h-5 rounded-full border border-border"
            style={{ backgroundColor: theme.colors.accent }}
            title="Accent"
          />
          <div
            className="w-5 h-5 rounded-full border border-border"
            style={{ backgroundColor: theme.colors.background }}
            title="Background"
          />
        </div>
        <Button
          size="sm"
          className="w-full"
          onClick={onApply}
          disabled={isSelected || applying}
        >
          {isSelected ? 'Current theme' : 'Apply theme'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default MoodThemeSelector;

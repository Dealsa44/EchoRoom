import { Bell, Moon, Sun, Bot, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationModal from '@/components/modals/NotificationModal';
import AIAssistantModal from '@/components/modals/AIAssistantModal';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  showDarkModeToggle?: boolean;
  showAIAssistant?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const TopBar = ({ 
  title,
  subtitle,
  showNotifications = true, 
  showDarkModeToggle = true,
  showAIAssistant = true,
  showBack = false,
  onBack,
  rightAction
}: TopBarProps) => {
  const { isDarkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border-soft/50 shadow-medium safe-top">
        <div className="flex items-center justify-between px-4 py-4 max-w-md mx-auto pt-safe">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:scale-110 transition-spring flex-shrink-0 hover:bg-primary/10"
              >
                <ArrowLeft size={20} className="text-primary" />
              </Button>
            )}
            
            {title && (
              <div className="min-w-0 flex-1">
                <h1 className="text-heading-2 font-bold text-foreground truncate">{title}</h1>
                {subtitle && (
                  <p className="text-caption text-muted-foreground truncate mt-0.5">{subtitle}</p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {rightAction && rightAction}
            
            {showAIAssistant && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAIModal(true)}
                className="group hover:scale-110 transition-spring hover:bg-primary/10"
              >
                <Bot size={20} className="group-hover:text-primary transition-smooth" />
              </Button>
            )}
            
            {showNotifications && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotificationModal(true)}
                className="relative hover:scale-110 transition-spring hover:bg-accent/10"
              >
                <Bell size={20} className="hover:text-accent transition-smooth" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white/20"></span>
              </Button>
            )}
            
            {showDarkModeToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="hover:scale-110 transition-spring hover:bg-secondary/10"
              >
                {isDarkMode ? 
                  <Sun size={20} className="text-warning hover:text-warning transition-smooth" /> : 
                  <Moon size={20} className="text-secondary hover:text-secondary transition-smooth" />
                }
              </Button>
            )}
          </div>
        </div>
      </div>

      <NotificationModal 
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
      
      <AIAssistantModal 
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </>
  );
};

export default TopBar;
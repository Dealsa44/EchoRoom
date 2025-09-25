import { Bell, Moon, Sun, Bot, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/hooks/useApp';
import { useKeyboardAwareClasses } from '@/hooks/useKeyboard';
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
  const { topBarClass } = useKeyboardAwareClasses();
  const navigate = useNavigate();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <div className={`${topBarClass} bg-background/95 backdrop-blur-lg border-b border-border-soft/50 shadow-medium safe-top`}>
        <div className="flex items-center justify-between px-4 py-4 max-w-md mx-auto">
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
                className="group hover:scale-110 transition-spring hover:bg-transparent"
              >
                <Bot size={20} className="group-hover:text-primary transition-smooth" />
              </Button>
            )}
            
            {showNotifications && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotificationModal(true)}
                  className="hover:scale-110 transition-spring hover:bg-transparent"
                >
                  <Bell size={20} className="hover:text-accent transition-smooth" />
                </Button>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] bg-red-500 text-white text-xs font-bold rounded-full border-2 border-background flex items-center justify-center px-1 z-10">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            )}
            
            {showDarkModeToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="hover:scale-110 transition-spring hover:bg-transparent"
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
        onUnreadCountChange={setUnreadCount}
      />
      
      <AIAssistantModal 
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </>
  );
};

export default TopBar;
import { Bell, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import NotificationModal from '@/components/modals/NotificationModal';

interface TopBarProps {
  title?: string;
  showNotifications?: boolean;
  showDarkModeToggle?: boolean;
}

const TopBar = ({ 
  title, 
  showNotifications = true, 
  showDarkModeToggle = true 
}: TopBarProps) => {
  const { isDarkMode, toggleDarkMode } = useApp();
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          {title && (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          )}
          
          <div className="flex items-center gap-2 ml-auto">
            {showNotifications && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotificationModal(true)}
                className="relative"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></span>
              </Button>
            )}
            
            {showDarkModeToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            )}
          </div>
        </div>
      </div>

      <NotificationModal 
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </>
  );
};

export default TopBar;
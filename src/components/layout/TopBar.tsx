import { Bell, Moon, Sun, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';
import NotificationModal from '@/components/modals/NotificationModal';
import AIAssistantModal from '@/components/modals/AIAssistantModal';

interface TopBarProps {
  title?: string;
  showNotifications?: boolean;
  showDarkModeToggle?: boolean;
  showAIAssistant?: boolean;
}

const TopBar = ({ 
  title, 
  showNotifications = true, 
  showDarkModeToggle = true,
  showAIAssistant = true
}: TopBarProps) => {
  const { isDarkMode, toggleDarkMode } = useApp();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          {title && (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          )}
          
          <div className="flex items-center gap-2 ml-auto">
            {showAIAssistant && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAIModal(true)}
                className="group hover:scale-110 transition-all duration-300"
              >
                <Bot size={20} className="group-hover:text-blue-500 transition-colors duration-300" />
              </Button>
            )}
            
            {showNotifications && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotificationModal(true)}
                className="relative hover:scale-110 transition-transform duration-300"
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
                className="hover:scale-110 transition-transform duration-300"
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
      
      <AIAssistantModal 
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </>
  );
};

export default TopBar;
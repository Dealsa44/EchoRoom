import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface FloatingAction {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  action: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FloatingAction[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  position = 'bottom-right',
  size = 'md',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
        setIsOpen(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12';
      case 'lg':
        return 'w-16 h-16';
      case 'md':
      default:
        return 'w-14 h-14';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 28;
      case 'md':
      default:
        return 24;
    }
  };

  const handleMainAction = () => {
    if (actions.length === 1) {
      actions[0].action();
    } else {
      setIsOpen(!isOpen);
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleSubAction = (action: FloatingAction) => {
    action.action();
    setIsOpen(false);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  if (actions.length === 0) return null;

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ${getPositionClasses()} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      } ${className}`}
    >
      {/* Sub-actions */}
      {actions.length > 1 && isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={action.id}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  position.includes('left') ? 'flex-row' : 'flex-row-reverse'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isOpen ? 'slideInUp 0.3s ease-out forwards' : 'none'
                }}
              >
                {/* Label */}
                <div className={`bg-black/80 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  position.includes('left') ? 'order-2' : 'order-1'
                }`}>
                  {action.label}
                </div>
                
                {/* Action button */}
                <Button
                  onClick={() => handleSubAction(action)}
                  className={`${getSizeClasses()} rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
                    position.includes('left') ? 'order-1' : 'order-2'
                  }`}
                  style={{ 
                    backgroundColor: action.color || '#3b82f6',
                    transform: isOpen ? 'scale(1)' : 'scale(0)',
                  }}
                >
                  <IconComponent size={getIconSize() * 0.8} className="text-white" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={handleMainAction}
        className={`${getSizeClasses()} rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        {actions.length === 1 ? (
          React.createElement(actions[0].icon, { size: getIconSize() })
        ) : isOpen ? (
          <X size={getIconSize()} />
        ) : (
          <Plus size={getIconSize()} />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && actions.length > 1 && (
        <div 
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingActionButton;
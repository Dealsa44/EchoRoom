import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface SwipeAction {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  action: () => void;
  threshold?: number;
}

interface SwipeableCardProps {
  children: ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  className?: string;
  disabled?: boolean;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftAction,
  rightAction,
  onSwipeStart,
  onSwipeEnd,
  className = '',
  disabled = false
}) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const threshold = 80; // Minimum swipe distance to trigger action

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleStart = (clientX: number) => {
    if (disabled || isAnimating) return;
    
    setStartX(clientX);
    setCurrentX(0);
    setIsDragging(true);
    onSwipeStart?.();
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled || isAnimating) return;
    
    const deltaX = clientX - startX;
    const maxSwipe = 120; // Maximum swipe distance
    const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    
    setCurrentX(clampedDelta);
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${clampedDelta}px)`;
      cardRef.current.style.transition = 'none';
      
      // Update background color based on swipe direction and distance
      const opacity = Math.abs(clampedDelta) / maxSwipe;
      if (clampedDelta > 0 && rightAction) {
        cardRef.current.style.backgroundColor = `${rightAction.color}${Math.floor(opacity * 0.2 * 255).toString(16).padStart(2, '0')}`;
      } else if (clampedDelta < 0 && leftAction) {
        cardRef.current.style.backgroundColor = `${leftAction.color}${Math.floor(opacity * 0.2 * 255).toString(16).padStart(2, '0')}`;
      }
    }
  };

  const handleEnd = () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    setIsAnimating(true);
    
    const shouldTriggerAction = Math.abs(currentX) >= threshold;
    let actionTriggered = false;
    
    if (shouldTriggerAction) {
      if (currentX > 0 && rightAction) {
        rightAction.action();
        actionTriggered = true;
      } else if (currentX < 0 && leftAction) {
        leftAction.action();
        actionTriggered = true;
      }
    }
    
    // Animate back to original position
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out, background-color 0.3s ease-out';
      cardRef.current.style.transform = 'translateX(0px)';
      cardRef.current.style.backgroundColor = '';
    }
    
    // Add haptic feedback if supported
    if (actionTriggered && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    setTimeout(() => {
      setIsAnimating(false);
      setCurrentX(0);
      onSwipeEnd?.();
    }, 300);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  const renderSwipeIndicator = (action: SwipeAction, direction: 'left' | 'right') => {
    const isVisible = isDragging && (
      (direction === 'right' && currentX > 20) ||
      (direction === 'left' && currentX < -20)
    );
    
    if (!isVisible) return null;
    
    const IconComponent = action.icon;
    const opacity = Math.min(Math.abs(currentX) / threshold, 1);
    
    return (
      <div 
        className={`absolute top-1/2 transform -translate-y-1/2 ${
          direction === 'left' ? 'left-4' : 'right-4'
        } transition-opacity duration-200`}
        style={{ opacity }}
      >
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: action.color }}
        >
          <IconComponent size={20} className="text-white" />
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden">
      {leftAction && renderSwipeIndicator(leftAction, 'left')}
      {rightAction && renderSwipeIndicator(rightAction, 'right')}
      
      <Card
        ref={cardRef}
        className={`relative touch-pan-y ${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ userSelect: 'none' }}
      >
        {children}
      </Card>
    </div>
  );
};

export default SwipeableCard;
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
  onSwipeProgress?: (progress: number, direction: 'left' | 'right') => void;
  className?: string;
  disabled?: boolean;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftAction,
  rightAction,
  onSwipeStart,
  onSwipeEnd,
  onSwipeProgress,
  className = '',
  disabled = false
}) => {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const threshold = 80; // Minimum swipe distance to trigger action
  const maxSwipe = 150; // Maximum swipe distance
  const maxTilt = 15; // Maximum tilt angle in degrees

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleStart = (clientX: number, clientY: number) => {
    if (disabled || isAnimating) return;
    
    setStartX(clientX);
    setStartY(clientY);
    setCurrentX(0);
    setCurrentY(0);
    setSwipeDirection(null);
    setIsDragging(true);
    onSwipeStart?.();
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || disabled || isAnimating) return;
    
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    
    // Determine swipe direction
    const direction = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
    
    if (direction === 'horizontal') {
      const clampedDeltaX = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
      setCurrentX(clampedDeltaX);
      setCurrentY(0);
      
      // Set swipe direction for visual feedback
      if (clampedDeltaX > 20) {
        setSwipeDirection('right');
      } else if (clampedDeltaX < -20) {
        setSwipeDirection('left');
      } else {
        setSwipeDirection(null);
      }
      
      // Calculate progress for button filling
      const progress = Math.min(Math.abs(clampedDeltaX) / threshold, 1);
      onSwipeProgress?.(progress, clampedDeltaX > 0 ? 'right' : 'left');
      
      if (cardRef.current) {
        // Apply transform with tilt effect
        const tiltAngle = (clampedDeltaX / maxSwipe) * maxTilt;
        const scale = 1 - Math.abs(clampedDeltaX) / (maxSwipe * 2);
        
        cardRef.current.style.transform = `
          translateX(${clampedDeltaX}px) 
          translateY(${deltaY * 0.1}px) 
          rotate(${tiltAngle}deg) 
          scale(${Math.max(0.95, scale)})
        `;
        cardRef.current.style.transition = 'none';
        
        // Update background color based on swipe direction and distance
        const opacity = Math.abs(clampedDeltaX) / maxSwipe;
        if (clampedDeltaX > 0 && rightAction) {
          // Use a more vibrant green for like action
          cardRef.current.style.backgroundColor = `rgba(34, 197, 94, ${opacity * 0.15})`;
        } else if (clampedDeltaX < 0 && leftAction) {
          // Use a more vibrant red for dislike action
          cardRef.current.style.backgroundColor = `rgba(239, 68, 68, ${opacity * 0.15})`;
        }
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
    
    // Animate back to original position with spring effect
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.3s ease-out';
      cardRef.current.style.transform = 'translateX(0px) translateY(0px) rotate(0deg) scale(1)';
      cardRef.current.style.backgroundColor = '';
    }
    
    // Add haptic feedback if supported
    if (actionTriggered && 'vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
    
    setTimeout(() => {
      setIsAnimating(false);
      setCurrentX(0);
      setCurrentY(0);
      setSwipeDirection(null);
      onSwipeEnd?.();
    }, 400);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Mouse events (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleEnd();
    }
  };



  return (
    <div className="relative overflow-hidden rounded-2xl">
      <Card
        ref={cardRef}
        className={`relative touch-pan-y select-none swipe-card ${className} ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } transition-shadow duration-200 ${
          isDragging ? 'shadow-2xl' : 'shadow-xl'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          userSelect: 'none',
          willChange: isDragging ? 'transform' : 'auto'
        }}
      >
        {children}
      </Card>
    </div>
  );
};

export default SwipeableCard;
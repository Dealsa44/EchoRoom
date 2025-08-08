import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Card } from '@/components/ui/card';

interface SwipeAction {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
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
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentTransformRef = useRef<{ x: number; y: number; rotation: number; scale: number }>({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1
  });

  const threshold = 80; // Minimum swipe distance to trigger action
  const maxSwipe = 150; // Maximum swipe distance
  const maxTilt = 15; // Maximum tilt angle in degrees

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Optimized transform update using requestAnimationFrame
  const updateTransform = useCallback((deltaX: number, deltaY: number) => {
    if (!cardRef.current) return;

    const clampedDeltaX = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    const tiltAngle = (clampedDeltaX / maxSwipe) * maxTilt;
    const scale = Math.max(0.95, 1 - Math.abs(clampedDeltaX) / (maxSwipe * 2));
    
    currentTransformRef.current = {
      x: clampedDeltaX,
      y: deltaY * 0.1,
      rotation: tiltAngle,
      scale
    };

    // Use requestAnimationFrame for smooth updates
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        const { x, y, rotation, scale } = currentTransformRef.current;
        cardRef.current.style.transform = `translateX(${x}px) translateY(${y}px) rotate(${rotation}deg) scale(${scale})`;
        
        // Update background color based on swipe direction and distance
        const opacity = Math.abs(clampedDeltaX) / maxSwipe;
        if (clampedDeltaX > 0 && rightAction) {
          cardRef.current.style.backgroundColor = `rgba(34, 197, 94, ${opacity * 0.15})`;
        } else if (clampedDeltaX < 0 && leftAction) {
          cardRef.current.style.backgroundColor = `rgba(239, 68, 68, ${opacity * 0.15})`;
        } else {
          cardRef.current.style.backgroundColor = '';
        }
      }
    });

    // Calculate progress for button filling
    const progress = Math.min(Math.abs(clampedDeltaX) / threshold, 1);
    const direction = clampedDeltaX > 0 ? 'right' : 'left';
    
    // Set swipe direction for visual feedback
    if (Math.abs(clampedDeltaX) > 20) {
      setSwipeDirection(direction);
    } else {
      setSwipeDirection(null);
    }
    
    onSwipeProgress?.(progress, direction);
  }, [maxSwipe, maxTilt, threshold, leftAction, rightAction, onSwipeProgress]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (disabled || isAnimating) return;
    
    touchStartRef.current = { x: clientX, y: clientY };
    setSwipeDirection(null);
    setIsDragging(true);
    onSwipeStart?.();
  }, [disabled, isAnimating, onSwipeStart]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || disabled || isAnimating || !touchStartRef.current) return;
    
    const deltaX = clientX - touchStartRef.current.x;
    const deltaY = clientY - touchStartRef.current.y;
    
    // Determine swipe direction
    const direction = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
    
    if (direction === 'horizontal') {
      updateTransform(deltaX, deltaY);
    }
  }, [isDragging, disabled, isAnimating, updateTransform]);

  const handleEnd = useCallback(() => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    setIsAnimating(true);
    
    const { x } = currentTransformRef.current;
    const shouldTriggerAction = Math.abs(x) >= threshold;
    let actionTriggered = false;
    
    if (shouldTriggerAction) {
      if (x > 0 && rightAction) {
        rightAction.action();
        actionTriggered = true;
      } else if (x < 0 && leftAction) {
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
    
    // Reset state after animation
    setTimeout(() => {
      setIsAnimating(false);
      setSwipeDirection(null);
      currentTransformRef.current = { x: 0, y: 0, rotation: 0, scale: 1 };
      touchStartRef.current = null;
      onSwipeEnd?.();
    }, 400);
  }, [isDragging, disabled, threshold, leftAction, rightAction, onSwipeEnd]);

  // Touch events with passive listeners for better performance
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }, [handleMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Mouse events (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX, e.clientY);
    }
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      handleEnd();
    }
  }, [isDragging, handleEnd]);

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
          willChange: isDragging ? 'transform' : 'auto',
          touchAction: 'pan-y pinch-zoom'
        }}
      >
        {children}
      </Card>
    </div>
  );
};

export default SwipeableCard;
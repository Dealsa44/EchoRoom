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
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastMoveRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const currentTransformRef = useRef<{ x: number; y: number; rotation: number; scale: number }>({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1
  });

  // Updated thresholds for better UX - need to swipe more than halfway
  const halfwayThreshold = 120; // Halfway threshold - must swipe this far to trigger action
  const maxSwipe = 240; // Maximum swipe distance (doubled for halfway logic)
  const maxTilt = 12; // Slightly reduced tilt for smoother feel

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Calculate velocity for smoother animations
  const calculateVelocity = useCallback((deltaX: number, deltaY: number, deltaTime: number) => {
    if (deltaTime === 0) return { x: 0, y: 0 };
    return {
      x: deltaX / deltaTime,
      y: deltaY / deltaTime
    };
  }, []);

  // Optimized transform update with improved mobile performance
  const updateTransform = useCallback((deltaX: number, deltaY: number, immediate = false) => {
    if (!cardRef.current) return;

    // Apply easing for smoother movement
    const clampedDeltaX = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
    const tiltAngle = (clampedDeltaX / maxSwipe) * maxTilt;
    
    // Smoother scaling with less dramatic effect
    const absX = Math.abs(clampedDeltaX);
    const scale = Math.max(0.98, 1 - absX / (maxSwipe * 4));
    
    // Reduce vertical movement for better feel
    const dampedY = deltaY * 0.05;
    
    currentTransformRef.current = {
      x: clampedDeltaX,
      y: dampedY,
      rotation: tiltAngle,
      scale
    };

    const applyTransform = () => {
      if (cardRef.current) {
        const { x, y, rotation, scale } = currentTransformRef.current;
        
        // Use transform3d for hardware acceleration
        cardRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
        
        // Smoother color transitions with halfway threshold
        const progress = absX / halfwayThreshold;
        const opacity = Math.min(progress * 0.2, 0.2); // Max 20% opacity
        
        if (clampedDeltaX > 0 && rightAction) {
          cardRef.current.style.backgroundColor = `rgba(34, 197, 94, ${opacity})`;
        } else if (clampedDeltaX < 0 && leftAction) {
          cardRef.current.style.backgroundColor = `rgba(239, 68, 68, ${opacity})`;
        } else {
          cardRef.current.style.backgroundColor = '';
        }
      }
    };

    if (immediate) {
      applyTransform();
    } else {
      // Use requestAnimationFrame for smooth updates
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(applyTransform);
    }

    // Calculate progress based on halfway threshold
    const progress = Math.min(absX / halfwayThreshold, 1);
    const direction = clampedDeltaX > 0 ? 'right' : 'left';
    
    // Set swipe direction for visual feedback
    if (absX > 15) {
      setSwipeDirection(direction);
    } else {
      setSwipeDirection(null);
    }
    
    onSwipeProgress?.(progress, direction);
  }, [maxSwipe, maxTilt, halfwayThreshold, leftAction, rightAction, onSwipeProgress]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (disabled || isAnimating) return;
    
    const now = Date.now();
    touchStartRef.current = { x: clientX, y: clientY, time: now };
    lastMoveRef.current = { x: clientX, y: clientY, time: now };
    velocityRef.current = { x: 0, y: 0 };
    setSwipeDirection(null);
    setIsDragging(true);
    onSwipeStart?.();
  }, [disabled, isAnimating, onSwipeStart]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || disabled || isAnimating || !touchStartRef.current) return;
    
    const now = Date.now();
    const deltaX = clientX - touchStartRef.current.x;
    const deltaY = clientY - touchStartRef.current.y;
    
    // Calculate velocity for smoother interactions
    if (lastMoveRef.current) {
      const timeDelta = now - lastMoveRef.current.time;
      const moveX = clientX - lastMoveRef.current.x;
      const moveY = clientY - lastMoveRef.current.y;
      velocityRef.current = calculateVelocity(moveX, moveY, timeDelta);
    }
    
    lastMoveRef.current = { x: clientX, y: clientY, time: now };
    
    // Determine swipe direction - more lenient for mobile
    const direction = Math.abs(deltaX) > Math.abs(deltaY) * 1.5 ? 'horizontal' : 'vertical';
    
    if (direction === 'horizontal') {
      updateTransform(deltaX, deltaY, true); // Use immediate updates for touch
    }
  }, [isDragging, disabled, isAnimating, updateTransform, calculateVelocity]);

  const handleEnd = useCallback(() => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    setIsAnimating(true);
    
    const { x } = currentTransformRef.current;
    const velocity = velocityRef.current;
    
    // Use halfway threshold and consider velocity for more natural feel
    const shouldTriggerAction = Math.abs(x) >= halfwayThreshold || Math.abs(velocity.x) > 0.5;
    let actionTriggered = false;
    
    if (shouldTriggerAction) {
      // Consider both position and velocity for direction
      const direction = x > 0 || (x === 0 && velocity.x > 0) ? 'right' : 'left';
      
      if (direction === 'right' && rightAction) {
        rightAction.action();
        actionTriggered = true;
      } else if (direction === 'left' && leftAction) {
        leftAction.action();
        actionTriggered = true;
      }
    }
    
    // Smooth spring animation back to original position
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.25s ease-out';
      cardRef.current.style.transform = 'translate3d(0px, 0px, 0) rotate(0deg) scale(1)';
      cardRef.current.style.backgroundColor = '';
    }
    
    // Enhanced haptic feedback for different actions
    if (actionTriggered && 'vibrate' in navigator) {
      navigator.vibrate([40, 80, 40]);
    }
    
    // Reset state after animation
    setTimeout(() => {
      setIsAnimating(false);
      setSwipeDirection(null);
      currentTransformRef.current = { x: 0, y: 0, rotation: 0, scale: 1 };
      touchStartRef.current = null;
      lastMoveRef.current = null;
      velocityRef.current = { x: 0, y: 0 };
      onSwipeEnd?.();
    }, 350);
  }, [isDragging, disabled, halfwayThreshold, leftAction, rightAction, onSwipeEnd]);

  // Optimized touch events for mobile performance
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Don't prevent default - let browser handle scrolling when needed
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      // Only prevent default during active drag to maintain smooth scrolling
      try {
        if (e.cancelable) {
          e.preventDefault();
        }
      } catch (error) {
        // Ignore passive event listener errors
      }
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleMove, isDragging]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isDragging) {
      try {
        if (e.cancelable) {
          e.preventDefault();
        }
      } catch (error) {
        // Ignore passive event listener errors
      }
      handleEnd();
    }
  }, [handleEnd, isDragging]);

  // Mouse events (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
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
        className={`relative select-none swipe-card mobile-optimized ${className} ${
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
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          willChange: isDragging ? 'transform' : 'auto',
          touchAction: 'manipulation', // Better for mobile interactions
          transform: 'translateZ(0)', // Force hardware acceleration
        }}
      >
        {children}
      </Card>
    </div>
  );
};

export default SwipeableCard;
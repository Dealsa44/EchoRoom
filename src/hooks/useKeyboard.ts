import { useState, useEffect } from 'react';

interface KeyboardState {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  viewportHeight: number;
}

/**
 * Hook to detect mobile keyboard state and viewport changes
 * Helps with positioning fixed elements when virtual keyboard appears
 */
export const useKeyboard = (): KeyboardState => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isKeyboardOpen: false,
    keyboardHeight: 0,
    viewportHeight: window.innerHeight,
  });

  useEffect(() => {
    let initialViewportHeight = window.innerHeight;
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Clear any existing timeout
      clearTimeout(timeoutId);
      
      // Debounce the resize event
      timeoutId = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const heightDifference = initialViewportHeight - currentHeight;
        
        // Consider keyboard open if viewport height decreased by more than 150px
        // This threshold helps avoid false positives from browser UI changes
        const isKeyboardOpen = heightDifference > 150;
        
        setKeyboardState({
          isKeyboardOpen,
          keyboardHeight: isKeyboardOpen ? heightDifference : 0,
          viewportHeight: currentHeight,
        });
      }, 100);
    };

    const handleOrientationChange = () => {
      // Reset initial height on orientation change
      setTimeout(() => {
        initialViewportHeight = window.innerHeight;
        setKeyboardState({
          isKeyboardOpen: false,
          keyboardHeight: 0,
          viewportHeight: window.innerHeight,
        });
      }, 500); // Delay to allow orientation change to complete
    };

    // Listen for resize events (keyboard show/hide)
    window.addEventListener('resize', handleResize);
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // For iOS Safari, also listen for visual viewport changes
    if ('visualViewport' in window) {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const handleVisualViewportChange = () => {
          const heightDifference = initialViewportHeight - visualViewport.height;
          const isKeyboardOpen = heightDifference > 150;
          
          setKeyboardState({
            isKeyboardOpen,
            keyboardHeight: isKeyboardOpen ? heightDifference : 0,
            viewportHeight: visualViewport.height,
          });
        };
        
        visualViewport.addEventListener('resize', handleVisualViewportChange);
        
        return () => {
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('orientationchange', handleOrientationChange);
          visualViewport.removeEventListener('resize', handleVisualViewportChange);
          clearTimeout(timeoutId);
        };
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(timeoutId);
    };
  }, []);

  return keyboardState;
};

/**
 * Hook to get CSS classes for keyboard-aware positioning
 */
export const useKeyboardAwareClasses = () => {
  const { isKeyboardOpen } = useKeyboard();
  
  // Always use keyboard-aware classes on mobile devices for better reliability
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return {
    topBarClass: (isKeyboardOpen || isMobile) ? 'fixed-top-keyboard-aware' : 'fixed top-0 left-0 right-0 z-30',
    bottomNavClass: (isKeyboardOpen || isMobile) ? 'fixed-bottom-keyboard-aware' : 'fixed bottom-0 left-0 right-0 z-30',
    isKeyboardOpen,
  };
};

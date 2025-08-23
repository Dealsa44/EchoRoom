/**
 * Utility functions for mobile-friendly audio handling
 */

/**
 * Check if the current device is a mobile device
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
};

/**
 * Check if the current device is iOS
 */
export const isIOS = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/i.test(userAgent);
};

/**
 * Check if the current device is Android
 */
export const isAndroid = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android/i.test(userAgent);
};

/**
 * Safely play audio with mobile-friendly error handling
 */
export const safePlayAudio = async (audio: HTMLAudioElement): Promise<boolean> => {
  try {
    // For mobile devices, ensure audio is properly loaded
    if (isMobileDevice()) {
      // Set audio properties for mobile compatibility
      audio.preload = 'metadata';
      audio.controls = false;
      audio.muted = false;
      audio.volume = 1.0;
      
      // Ensure audio is loaded before playing
      await audio.load();
    }
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      await playPromise;
      return true;
    }
    return true;
  } catch (error) {
    console.error('Error playing audio:', error);
    
    // Handle specific mobile audio errors
    if (error instanceof Error) {
      switch (error.name) {
        case 'NotAllowedError':
          console.log('Audio playback blocked - user interaction required');
          break;
        case 'NotSupportedError':
          console.log('Audio format not supported');
          break;
        case 'AbortError':
          console.log('Audio playback aborted');
          break;
        default:
          console.log('Unknown audio playback error:', error.message);
      }
    }
    
    return false;
  }
};

/**
 * Create a mobile-friendly audio element
 */
export const createMobileAudio = (): HTMLAudioElement => {
  const audio = new Audio();
  
  // Set properties for mobile compatibility
  audio.preload = 'metadata';
  audio.controls = false;
  audio.muted = false;
  audio.volume = 1.0;
  
  return audio;
};

/**
 * Get the best supported audio MIME type for the current browser
 */
export const getSupportedAudioMimeType = (): string => {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav'
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  // Fallback to webm if nothing else is supported
  return 'audio/webm';
};

/**
 * Get audio recording constraints optimized for mobile
 */
export const getMobileAudioConstraints = () => {
  const constraints: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100,
    channelCount: 1
  };
  
  // iOS-specific optimizations
  if (isIOS()) {
    constraints.sampleRate = 48000;
    constraints.channelCount = 1;
  }
  
  // Android-specific optimizations
  if (isAndroid()) {
    constraints.sampleRate = 44100;
    constraints.channelCount = 1;
  }
  
  return constraints;
};

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  X, 
  ArrowLeft,
  RotateCcw, 
  Zap, 
  PenTool, 
  Type, 
  Sticker, 
  Crop, 
  Send
} from 'lucide-react';

interface CameraScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCaptured: (imageData: string) => void;
}

const CameraScreen = ({ 
  isOpen, 
  onClose, 
  onImageCaptured 
}: CameraScreenProps) => {
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditTool, setCurrentEditTool] = useState<'draw' | 'text' | 'sticker' | 'crop' | null>(null);
  const [hasFlashlight, setHasFlashlight] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const doubleTapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(-1);
  const flashTrackRef = useRef<MediaStreamTrack | null>(null);

  // Start camera when component mounts
  useEffect(() => {
    if (isOpen) {
      resetCamera();
      startCamera();
      document.body.classList.add('camera-active');
      document.body.style.overflow = 'hidden';
    } else {
      stopCamera();
      document.body.classList.remove('camera-active');
      document.body.style.overflow = '';
    }

    return () => {
      stopCamera();
      document.body.classList.remove('camera-active');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Restart camera when going back from edit mode
  useEffect(() => {
    if (isOpen && !capturedImage && streamRef.current === null) {
      // Camera should be running but stream is null, restart it
      startCamera();
    }
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Check for flashlight capabilities
      checkFlashlightCapabilities(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays
        videoRef.current.play().catch(console.error);
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
      // Fallback to simulated camera for demo
      simulateCamera();
    }
  };

  const checkFlashlightCapabilities = (stream: MediaStream) => {
    // Check if device supports flashlight
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack && 'getCapabilities' in videoTrack) {
      try {
        const capabilities = videoTrack.getCapabilities();
        // Check if flashlight is supported
        if (capabilities.torch) {
          setHasFlashlight(true);
          flashTrackRef.current = videoTrack;
          console.log('✅ Flashlight capabilities detected for', isFrontCamera ? 'front' : 'back', 'camera');
        } else {
          setHasFlashlight(false);
          flashTrackRef.current = null;
          console.log('❌ No torch capability detected');
        }
      } catch (error) {
        console.log('Flashlight capabilities not available');
        setHasFlashlight(false);
        flashTrackRef.current = null;
      }
    } else {
      setHasFlashlight(false);
      flashTrackRef.current = null;
    }
  };

  const simulateCamera = () => {
    // Create a simulated video stream for demo purposes
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw a simulated camera view
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 640, 480);
      
      // Add some simulated content
      ctx.fillStyle = '#666';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Camera View', 320, 240);
    }
    
    const stream = canvas.captureStream();
    streamRef.current = stream;
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // Clear flashlight track reference
    flashTrackRef.current = null;
  };

  const toggleCamera = () => {
    // Turn off flash when switching cameras
    if (isFlashOn) {
      turnOffFlash();
    }
    setIsFrontCamera(!isFrontCamera);
    stopCamera();
    setTimeout(() => {
      startCamera();
      // Reset flash state after camera restart
      setIsFlashOn(false);
    }, 100);
  };

  const turnOffFlash = async () => {
    if (hasFlashlight && flashTrackRef.current && !isFrontCamera) {
      try {
        await flashTrackRef.current.applyConstraints({
          advanced: [{ torch: false }]
        });
      } catch (error) {
        console.error('Failed to turn off flashlight:', error);
      }
    }
    setIsFlashOn(false);
  };

  const toggleFlash = async () => {
    if (isFrontCamera) {
      // For front camera, just toggle the screen brightness overlay
      setIsFlashOn(!isFlashOn);
      console.log('📱 Front camera flash toggled:', !isFlashOn);
    } else if (hasFlashlight && flashTrackRef.current) {
      // For back camera, control actual device flashlight - ONLY use hardware
      try {
        const newFlashState = !isFlashOn;
        console.log('🔦 Attempting to toggle hardware flashlight to:', newFlashState);
        await flashTrackRef.current.applyConstraints({
          advanced: [{ torch: newFlashState }]
        });
        setIsFlashOn(newFlashState);
        console.log('✅ Hardware flashlight toggled successfully to:', newFlashState);
      } catch (error) {
        console.error('❌ Failed to toggle hardware flashlight:', error);
        // Don't fallback to visual overlay for back camera
        // Just keep the current state
      }
    } else {
      // For back camera without hardware flashlight - do nothing
      // No visual fallback, just ignore the tap
      console.log('⚠️ No hardware flashlight available for back camera');
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        
        // Draw the video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        setIsEditing(true);
      }
    }
  };

  const handleEditTool = (tool: 'draw' | 'text' | 'sticker' | 'crop') => {
    setCurrentEditTool(tool);
    // In a real app, this would activate the specific editing tool
  };

  const handleSave = () => {
    if (capturedImage) {
      // Create a download link
      const link = document.createElement('a');
      link.download = `photo_${Date.now()}.jpg`;
      link.href = capturedImage;
      link.click();
    }
  };

  const handleSend = () => {
    if (capturedImage) {
      onImageCaptured(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsEditing(false);
    setCurrentEditTool(null);
  };

  const handleCloseOrBack = () => {
    if (capturedImage) {
      // If we have a captured image, go back to camera
      setCapturedImage(null);
      setIsEditing(false);
      setCurrentEditTool(null);
      // Restart camera when going back
      setTimeout(() => {
        stopCamera();
        startCamera();
      }, 100);
    } else {
      // If we're in camera mode, close the camera
      onClose();
    }
  };

  const handleScreenTap = () => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    
    if (lastTapRef.current !== -1 && timeDiff < 300 && timeDiff > 0) {
      // Double tap detected
      toggleCamera();
      // Reset after successful double tap
      lastTapRef.current = -1;
    } else {
      // First tap or too slow, update timestamp
      lastTapRef.current = now;
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setIsEditing(false);
    setCurrentEditTool(null);
    setIsFrontCamera(false);
    // Turn off flash when resetting
    if (isFlashOn) {
      turnOffFlash();
    }
    // Reset flashlight detection
    setHasFlashlight(false);
    flashTrackRef.current = null;
  };

  if (!isOpen) return null;

  const cameraContent = (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Camera View */}
      <div className="absolute inset-0 z-0">
        {!capturedImage && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Flash overlay - ONLY for front camera selfie flash */}
        {isFlashOn && !capturedImage && isFrontCamera && (
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-200 bg-white opacity-80"
          />
        )}
      </div>

      {/* Camera Overlay */}
      <div className="absolute inset-0 z-10 camera-overlay">
        {/* Top Bar with Safe Space */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-white/20 safe-top z-50 pointer-events-auto camera-controls">
          {/* Left side - Close/Back button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
            onClick={handleCloseOrBack}
          >
            {capturedImage ? <ArrowLeft size={20} /> : <X size={20} />}
          </Button>

          {/* Center - Camera controls (only visible in camera mode) */}
          {!capturedImage && (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
                onClick={toggleCamera}
              >
                <RotateCcw size={20} />
              </Button>
              
                          <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 backdrop-blur-sm text-white border border-white/20 ${
                isFlashOn 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : hasFlashlight 
                    ? 'bg-white/20 hover:bg-white/30' 
                    : 'bg-gray-500/50 cursor-not-allowed'
              }`}
              onClick={toggleFlash}
              disabled={!hasFlashlight && !isFrontCamera}
              title={
                isFrontCamera 
                  ? 'Screen flash for selfies' 
                  : hasFlashlight 
                    ? 'Toggle flashlight' 
                    : 'Flashlight not available'
              }
            >
              <Zap size={20} />
            </Button>
            </div>
          )}

          {/* Right side - Edit tools (only visible after capture) */}
          {capturedImage && (
            <div className="flex items-center gap-2 pointer-events-auto">
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 backdrop-blur-sm text-white border border-white/20 ${
                  currentEditTool === 'draw' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                onClick={() => handleEditTool('draw')}
              >
                <PenTool size={20} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 backdrop-blur-sm text-white border border-white/20 ${
                  currentEditTool === 'text' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                onClick={() => handleEditTool('text')}
              >
                <Type size={20} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 backdrop-blur-sm text-white border border-white/20 ${
                  currentEditTool === 'sticker' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                onClick={() => handleEditTool('sticker')}
              >
                <Sticker size={20} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 backdrop-blur-sm text-white border border-white/20 ${
                  currentEditTool === 'crop' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                onClick={() => handleEditTool('crop')}
              >
                <Crop size={20} />
              </Button>
            </div>
          )}
        </div>

        {/* Center Content */}
        {!capturedImage ? (
          // Camera view mode
          <div 
            className="absolute inset-0 flex items-center justify-center"
            onClick={handleScreenTap}
          >
            {/* Camera frame guides */}
            <div className="w-80 h-80 border-2 border-white/30 rounded-lg pointer-events-none" />
          </div>
        ) : (
          // Edit mode - show captured image
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/60 backdrop-blur-md border-t border-white/20 z-50 pointer-events-auto">
          {!capturedImage ? (
            // Camera mode controls
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-20 w-20 rounded-full bg-white hover:bg-white/90 text-black border-4 border-white/20"
                onClick={captureImage}
              >
                <Camera size={32} />
              </Button>
            </div>
                     ) : (
             // Edit mode controls - only send button
             <div className="flex items-center justify-center">
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-16 w-16 bg-blue-500 hover:bg-blue-600 text-white border border-blue-400"
                 onClick={handleSend}
               >
                 <Send size={28} />
               </Button>
             </div>
           )}
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );

  return createPortal(cameraContent, document.body);
};

export default CameraScreen;

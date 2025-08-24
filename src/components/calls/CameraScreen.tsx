import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  X, 
  RotateCcw, 
  Zap, 
  PenTool, 
  Type, 
  Sticker, 
  Crop, 
  Save,
  Send,
  ChevronLeft,
  ChevronRight
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera when component mounts
  useEffect(() => {
    if (isOpen) {
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
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
      // Fallback to simulated camera for demo
      simulateCamera();
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
  };

  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
    stopCamera();
    setTimeout(startCamera, 100);
  };

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
    // In a real app, this would control the camera flash
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

  if (!isOpen) return null;

  const cameraContent = (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Camera View */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Flash overlay */}
        {isFlashOn && (
          <div className="absolute inset-0 bg-white opacity-30 pointer-events-none" />
        )}
      </div>

      {/* Camera Overlay */}
      <div className="absolute inset-0 z-10 camera-overlay">
        {/* Top Bar with Safe Space */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-black/40 backdrop-blur-md border-t border-white/10 safe-top z-20 pointer-events-auto camera-controls">
          {/* Left side - Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
            onClick={onClose}
          >
            <X size={20} />
          </Button>

          {/* Center - Camera controls */}
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
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              onClick={toggleFlash}
            >
              <Zap size={20} />
            </Button>
          </div>

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
          <div className="absolute inset-0 flex items-center justify-center">
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
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/40 backdrop-blur-md border-t border-white/10 z-20 pointer-events-auto">
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
            // Edit mode controls
            <div className="flex items-center justify-between">
              {/* Left - Save button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
                onClick={handleSave}
              >
                <Save size={24} />
              </Button>

              {/* Center - Retake button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
                onClick={handleRetake}
              >
                <ChevronLeft size={24} />
              </Button>

              {/* Right - Send button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white border border-blue-400"
                onClick={handleSend}
              >
                <Send size={24} />
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

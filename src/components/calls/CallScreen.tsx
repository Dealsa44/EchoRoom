import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX,
  Settings,
  Wifi,
  WifiOff,
  Clock,
  User,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useCall } from '@/hooks/useCall';
import { CallType } from '@/types';

interface CallScreenProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  callType: CallType;
  callTypeProp?: 'private' | 'group'; // Add call type prop
}

const CallScreen = ({ 
  isOpen, 
  onClose, 
  participantId, 
  participantName, 
  participantAvatar, 
  callType,
  callTypeProp = 'private'
}: CallScreenProps) => {
  const { 
    callState, 
    startCall, 
    endCall, 
    toggleMute, 
    toggleVideo, 
    toggleSpeaker 
  } = useCall();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [remoteVideoStream, setRemoteVideoStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  // Start call when component mounts
  useEffect(() => {
    if (isOpen && !callState.isInCall) {
      startCall(participantId, participantName, participantAvatar, callType, callTypeProp);
    }
  }, [isOpen, participantId, participantName, participantAvatar, callType, startCall, callState.isInCall]);

  // Manage body classes when callscreen is active
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('callscreen-active');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('callscreen-active');
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('callscreen-active');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Simulate video streams
  useEffect(() => {
    if (isOpen && callType === 'video') {
      // Simulate local video stream
      const simulateLocalStream = async () => {
        try {
          // In a real app, this would be getUserMedia
          // For now, we'll simulate it
          const stream = new MediaStream();
          setLocalVideoStream(stream);
          
          // Simulate remote video stream after a delay
          setTimeout(() => {
            const remoteStream = new MediaStream();
            setRemoteVideoStream(remoteStream);
          }, 1000);
                 } catch (error) {
           console.error('Failed to access camera:', error);
         }
      };

      simulateLocalStream();
    }
  }, [isOpen, callType]);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localVideoStream) {
      localVideoRef.current.srcObject = localVideoStream;
    }
  }, [localVideoStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteVideoStream) {
      remoteVideoRef.current.srcObject = remoteVideoStream;
    }
  }, [remoteVideoStream]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getConnectionQualityIcon = () => {
    switch (callState.connectionQuality) {
      case 'excellent':
        return <Wifi size={16} className="text-green-500" />;
      case 'good':
        return <Wifi size={16} className="text-yellow-500" />;
      case 'fair':
        return <Wifi size={16} className="text-orange-500" />;
      case 'poor':
        return <WifiOff size={16} className="text-red-500" />;
      default:
        return <Wifi size={16} className="text-gray-500" />;
    }
  };

  const handleEndCall = () => {
    endCall();
    onClose();
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  const handleToggleVideo = () => {
    toggleVideo();
  };

  const handleToggleSpeaker = () => {
    toggleSpeaker();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Close settings if clicking outside the settings panel
    if (showSettings && e.target === e.currentTarget) {
      setShowSettings(false);
    }
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // Handle clicks outside settings panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettings) {
        const target = event.target as Element;
        // Check if click is outside the settings panel and not on the settings button
        if (settingsPanelRef.current && !settingsPanelRef.current.contains(target) && 
            settingsButtonRef.current && !settingsButtonRef.current.contains(target)) {
          setShowSettings(false);
        }
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  if (!isOpen) return null;

  const callScreenContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black"
      onClick={() => {
        if (showSettings) {
          setShowSettings(false);
        }
      }}
    >
      {/* Video Background */}
      {callType === 'video' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Remote Video (Full Screen) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Local Video (Picture-in-Picture) */}
          {callState.isVideoEnabled && (
            <div className="absolute top-36 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg z-10">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Call Overlay */}
      <div 
        className="absolute inset-0"
        onClick={handleOverlayClick}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10 safe-top z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <div className="text-2xl">{participantAvatar}</div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-white font-semibold text-lg leading-tight">{participantName}</h2>
              <div className="flex items-center gap-2">
                {getConnectionQualityIcon()}
                <span className="text-white/80 text-sm">
                  {callState.isConnecting ? 'Connecting...' : formatDuration(callState.callDuration)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20"
              onClick={handleSettingsToggle}
              ref={settingsButtonRef}
            >
              <Settings size={20} />
            </Button>
          </div>
        </div>

        {/* Center Content (for voice calls or when video is off) */}
        {callType === 'voice' || !callState.isVideoEnabled ? (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ paddingTop: '6rem', paddingBottom: '8rem' }}>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20 mx-auto">
                <div className="text-6xl">{participantAvatar}</div>
              </div>
              <h2 className="text-white font-semibold text-2xl mb-2">{participantName}</h2>
              <p className="text-white/80">
                {callState.isConnecting ? 'Connecting...' : formatDuration(callState.callDuration)}
              </p>
            </div>
          </div>
        ) : null}

        {/* Call Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/40 backdrop-blur-md border-t border-white/10 z-10">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto w-full">
            {/* Mute Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-14 w-14 rounded-full border border-white/20 ${
                callState.isMuted 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
              }`}
              onClick={handleToggleMute}
            >
              {callState.isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>

            {/* Video Toggle (only for video calls) */}
            {callType === 'video' && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-14 w-14 rounded-full border border-white/20 ${
                  !callState.isVideoEnabled 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
                }`}
                onClick={handleToggleVideo}
              >
                {callState.isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
              </Button>
            )}

            {/* Speaker Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-14 w-14 rounded-full border border-white/20 ${
                callState.isSpeakerOn 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
              }`}
              onClick={handleToggleSpeaker}
            >
              {callState.isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </Button>

            {/* End Call Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 text-white border border-red-400"
              onClick={handleEndCall}
            >
              <PhoneOff size={24} />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Panel - Moved outside overlay for better click handling */}
      {showSettings && (
        <div 
          className="absolute top-36 right-4 w-64 bg-black/90 backdrop-blur-md rounded-lg p-4 border border-white/20 z-50"
          onClick={(e) => e.stopPropagation()}
          ref={settingsPanelRef}
        >
          <h3 className="text-white font-semibold mb-3">Call Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Video Quality</span>
              <Badge variant="secondary" className="text-xs">High</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Audio Quality</span>
              <Badge variant="secondary" className="text-xs">High</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Connection</span>
              <div className="flex items-center gap-1">
                {getConnectionQualityIcon()}
                <span className="text-white/80 text-xs capitalize">
                  {callState.connectionQuality}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(callScreenContent, document.body);
};

export default CallScreen;

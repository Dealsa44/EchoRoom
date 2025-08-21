import { useState, useEffect, useRef } from 'react';
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
import { useCall } from '@/contexts/CallContext';
import { CallType } from '@/types';

interface CallScreenProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  callType: CallType;
}

const CallScreen = ({ 
  isOpen, 
  onClose, 
  participantId, 
  participantName, 
  participantAvatar, 
  callType 
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

  // Start call when component mounts
  useEffect(() => {
    if (isOpen && !callState.isInCall) {
      startCall(participantId, participantName, participantAvatar, callType);
    }
  }, [isOpen, participantId, participantName, participantAvatar, callType, startCall, callState.isInCall]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video Background */}
      {callType === 'video' && (
        <div className="absolute inset-0">
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
            <div className="absolute top-4 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
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
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80"
        onClick={handleOverlayClick}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="text-2xl">{participantAvatar}</div>
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">{participantName}</h2>
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
              className="h-10 w-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={20} />
            </Button>
          </div>
        </div>

        {/* Center Content (for voice calls or when video is off) */}
        {callType === 'voice' || !callState.isVideoEnabled ? (
          <div className="absolute top-20 bottom-32 left-0 right-0 flex items-center justify-center pointer-events-none">
            <div className="text-center pointer-events-none">
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
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
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center justify-center gap-4">
            {/* Mute Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-14 w-14 rounded-full ${
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
                className={`h-14 w-14 rounded-full ${
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
              className={`h-14 w-14 rounded-full ${
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
              className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
              onClick={handleEndCall}
            >
              <PhoneOff size={28} />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div 
            className="absolute top-20 right-4 w-64 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/20 z-50"
            onClick={(e) => e.stopPropagation()}
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
    </div>
  );
};

export default CallScreen;

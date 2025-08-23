import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Volume2, Download } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
  className?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  onCancel,
  className = '' 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if browser supports audio recording
  const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const startRecording = async () => {
    if (!isSupported) {
      console.warn('Audio recording not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      // Fallback to simulation if recording fails
      simulateRecording();
    }
  };

  const simulateRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const handleRecordingComplete = () => {
    if (isRecording) {
      stopRecording();
    }
    
    if (audioURL) {
      // Use actual recorded audio
      const audioBlob = audioChunksRef.current.length > 0 
        ? new Blob(audioChunksRef.current, { type: 'audio/wav' })
        : new Blob([''], { type: 'audio/wav' }); // Fallback blob
      
      onRecordingComplete(audioBlob, recordingTime);
    } else {
      // Fallback: create a mock audio blob
      const mockBlob = new Blob([''], { type: 'audio/wav' });
      onRecordingComplete(mockBlob, recordingTime);
    }
    
    // Reset state
    setRecordingTime(0);
    setAudioURL(null);
    setCurrentTime(0);
    setDuration(0);
  };

  const playAudio = () => {
    if (!audioURL) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(audioURL);
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current?.duration || 0);
      };
      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      };
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      
      // Update progress
      playTimerRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWaveformData = () => {
    // Generate mock waveform data for visualization
    return Array.from({ length: 20 }, () => Math.random() * 0.8 + 0.2);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  if (!isSupported && !isRecording) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <p className="text-sm text-muted-foreground mb-2">
          Audio recording not supported in this browser
        </p>
        <Button onClick={simulateRecording} variant="outline" size="sm">
          <Mic className="w-4 h-4 mr-2" />
          Simulate Recording
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {!isRecording && !audioURL && (
        <Button 
          onClick={startRecording}
          variant="outline"
          className="w-full"
        >
          <Mic className="w-4 h-4 mr-2" />
          Start Recording
        </Button>
      )}

      {isRecording && (
        <div className="space-y-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                Recording {formatTime(recordingTime)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopRecording}
              className="h-8 px-3 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Square size={14} />
              <span className="ml-1 text-xs">Stop</span>
            </Button>
          </div>
          
          {/* Waveform visualization */}
          <div className="flex items-center gap-1 h-8">
            {getWaveformData().map((height, index) => (
              <div
                key={index}
                className="w-1 bg-red-400 rounded-full animate-pulse"
                style={{ height: `${height * 100}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {audioURL && !isRecording && (
        <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Recording Complete ({formatTime(duration || recordingTime)})
              </span>
            </div>
          </div>
          
          {/* Audio player */}
          <div className="flex items-center gap-3">
            <Button
              onClick={playAudio}
              variant="outline"
              size="sm"
              className="h-8 px-3"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span className="ml-1 text-xs">
                {isPlaying ? 'Pause' : 'Play'}
              </span>
            </Button>
            
            {/* Progress bar */}
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            
            <span className="text-xs text-muted-foreground min-w-[40px]">
              {formatTime(currentTime)}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleRecordingComplete}
              variant="default"
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Send Voice Message
            </Button>
            
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;

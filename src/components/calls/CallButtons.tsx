import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Video,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CallScreen from './CallScreen';
import { CallType } from '@/types';

interface CallButtonsProps {
  participantId: string;
  participantName: string;
  participantAvatar: string;
  variant?: 'compact' | 'full';
  className?: string;
  callType?: 'private' | 'group'; // Add call type to distinguish private vs group calls
}

const CallButtons = ({ 
  participantId, 
  participantName, 
  participantAvatar, 
  variant = 'full',
  className = '',
  callType: callTypeProp = 'private' // Default to private
}: CallButtonsProps) => {
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [callType, setCallType] = useState<CallType>('voice');

  const handleStartCall = (type: CallType) => {
    setCallType(type);
    setShowCallScreen(true);
  };

  const handleCloseCall = () => {
    setShowCallScreen(false);
  };

  if (variant === 'compact') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className={`h-8 w-8 bg-transparent hover:bg-transparent active:bg-transparent ${className}`}>
               <MoreVertical size={16} />
             </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStartCall('voice')}>
              <Phone size={16} className="mr-2" />
              Voice Call
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStartCall('video')}>
              <Video size={16} className="mr-2" />
              Video Call
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CallScreen
          isOpen={showCallScreen}
          onClose={handleCloseCall}
          participantId={participantId}
          participantName={participantName}
          participantAvatar={participantAvatar}
          callType={callType}
          callTypeProp={callTypeProp}
        />
      </>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 hover:text-green-700 bg-transparent hover:bg-transparent active:bg-transparent"
          onClick={() => handleStartCall('voice')}
        >
          <Phone size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-purple-600 hover:text-purple-700 bg-transparent hover:bg-transparent active:bg-transparent"
          onClick={() => handleStartCall('video')}
        >
          <Video size={16} />
        </Button>
      </div>

      <CallScreen
        isOpen={showCallScreen}
        onClose={handleCloseCall}
        participantId={participantId}
        participantName={participantName}
        participantAvatar={participantAvatar}
        callType={callType}
        callTypeProp={callTypeProp}
      />
    </>
  );
};

export default CallButtons;

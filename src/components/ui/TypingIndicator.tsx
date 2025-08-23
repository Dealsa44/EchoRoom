import React from 'react';

interface TypingIndicatorProps {
  userName: string;
  userAvatar: string;
  isVisible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  userName, 
  userAvatar, 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3 max-w-[80%]">
        <div className="text-lg" title={userName}>
          {userAvatar}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">
            {userName} is typing
          </span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

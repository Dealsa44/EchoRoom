import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TypingUser {
  name: string;
  avatar: string;
}

interface MultiTypingIndicatorProps {
  typingUsers: TypingUser[];
  isVisible: boolean;
  className?: string;
}

const MultiTypingIndicator: React.FC<MultiTypingIndicatorProps> = ({ 
  typingUsers, 
  isVisible, 
  className = '' 
}) => {
  if (!isVisible || typingUsers.length === 0) return null;

  // Don't show typing indicator for current user
  const otherUsers = typingUsers.filter(user => user.name !== 'Guest' && user.name !== 'You');

  if (otherUsers.length === 0) return null;

  return (
    <div className={`flex justify-start ${className}`}>
      <Card className="bg-card max-w-[80%] animate-in slide-in-from-bottom-2 duration-300">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {/* Show up to 2 profile avatars */}
            {otherUsers.slice(0, 2).map((user, index) => (
              <div key={user.name} className="text-lg" title={user.name}>
                {user.avatar}
              </div>
            ))}
            
            {/* Show +N counter if more than 2 users */}
            {otherUsers.length > 2 && (
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                +{otherUsers.length - 2}
              </div>
            )}
            
            {/* Typing dots */}
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiTypingIndicator;

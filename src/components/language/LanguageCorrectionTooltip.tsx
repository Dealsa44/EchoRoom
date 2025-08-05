import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Info } from 'lucide-react';

interface LanguageCorrectionTooltipProps {
  originalText: string;
  correctedText: string;
  explanation: string;
  rule: string;
  example: string;
  children: React.ReactNode;
}

const LanguageCorrectionTooltip = ({ 
  originalText, 
  correctedText, 
  explanation, 
  rule, 
  example, 
  children 
}: LanguageCorrectionTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="top">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Grammar Correction</span>
          </div>
          
          <div className="space-y-2">
            <div>
              <Badge variant="destructive" className="text-xs mb-1">Original</Badge>
              <p className="text-sm bg-destructive/10 p-2 rounded">{originalText}</p>
            </div>
            
            <div>
              <Badge variant="default" className="text-xs mb-1">Corrected</Badge>
              <p className="text-sm bg-primary/10 p-2 rounded">{correctedText}</p>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium">Rule:</span>
            </div>
            <p className="text-xs text-muted-foreground">{rule}</p>
          </div>
          
          <div>
            <p className="text-xs font-medium mb-1">Explanation:</p>
            <p className="text-xs text-muted-foreground">{explanation}</p>
          </div>
          
          <div>
            <p className="text-xs font-medium mb-1">Example:</p>
            <p className="text-xs text-muted-foreground italic">{example}</p>
          </div>
          
          <Button 
            size="sm" 
            className="w-full" 
            onClick={() => setIsOpen(false)}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Got it!
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageCorrectionTooltip;
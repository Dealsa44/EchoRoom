import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  id?: string;
  value?: string;
  onChange?: (time: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  min?: string;
  max?: string;
  disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Select time",
  className,
  error = false,
  min,
  max,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>(value || '');
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    if (value) {
      const [hour] = value.split(':');
      return parseInt(hour);
    }
    return 12;
  });
  const [selectedMinute, setSelectedMinute] = useState<number>(() => {
    if (value) {
      const [, minute] = value.split(':');
      return parseInt(minute);
    }
    return 0;
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  // Generate all hours (0-23) and minutes (0-59)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':');
      setSelectedHour(parseInt(hour));
      setSelectedMinute(parseInt(minute));
      setSelectedTime(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onBlur]);

  const handleTimeSelect = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    setSelectedTime(timeString);
    onChange?.(timeString);
    setIsOpen(false);
  };

  const formatDisplayTime = (time: string) => {
    if (!time) return placeholder;
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes.padStart(2, '0')}`;
  };

  const isTimeDisabled = (hour: number, minute: number) => {
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    if (min && timeString < min) return true;
    if (max && timeString > max) return true;
    
    return false;
  };

  // Create infinite scrolling arrays by duplicating multiple times
  const createInfiniteArray = (array: number[]) => {
    // Duplicate the array 5 times to create smooth infinite scrolling
    return [...array, ...array, ...array, ...array, ...array];
  };

  const infiniteHours = createInfiniteArray(hours);
  const infiniteMinutes = createInfiniteArray(minutes);

  // Handle scroll events to reset position seamlessly
  const handleHourScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const itemHeight = 32; // 8 * 4 (h-8 = 32px)
    const singleArrayHeight = hours.length * itemHeight;
    const totalHeight = infiniteHours.length * itemHeight;
    
    // If scrolled past the middle, reset to the middle
    if (scrollTop > totalHeight / 2) {
      target.scrollTop = scrollTop - singleArrayHeight;
    }
    // If scrolled before the middle, reset to the middle
    else if (scrollTop < singleArrayHeight) {
      target.scrollTop = scrollTop + singleArrayHeight;
    }
  };

  const handleMinuteScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const itemHeight = 32; // 8 * 4 (h-8 = 32px)
    const singleArrayHeight = minutes.length * itemHeight;
    const totalHeight = infiniteMinutes.length * itemHeight;
    
    // If scrolled past the middle, reset to the middle
    if (scrollTop > totalHeight / 2) {
      target.scrollTop = scrollTop - singleArrayHeight;
    }
    // If scrolled before the middle, reset to the middle
    else if (scrollTop < singleArrayHeight) {
      target.scrollTop = scrollTop + singleArrayHeight;
    }
  };

  // Scroll to selected values when opening
  useEffect(() => {
    if (isOpen && hourScrollRef.current && minuteScrollRef.current) {
      const itemHeight = 32;
      const singleArrayHeight = hours.length * itemHeight;
      
      // Calculate scroll position to center the selected hour
      const hourScrollPosition = (selectedHour * itemHeight) + singleArrayHeight;
      hourScrollRef.current.scrollTop = hourScrollPosition;
      
      // Calculate scroll position to center the selected minute
      const minuteScrollPosition = (selectedMinute * itemHeight) + singleArrayHeight;
      minuteScrollRef.current.scrollTop = minuteScrollPosition;
    }
  }, [isOpen, selectedHour, selectedMinute]);

  // Handle hour selection
  const handleHourClick = (hour: number) => {
    setSelectedHour(hour);
  };

  // Handle minute selection
  const handleMinuteClick = (minute: number) => {
    setSelectedMinute(minute);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedTime && "text-muted-foreground",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime(selectedTime)}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={popoverRef}
        className="w-auto p-0"
        align="start"
      >
        <div className="p-3">
          <div className="flex items-center justify-center gap-3">
            {/* Hours */}
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground mb-1">Hour</div>
              <div 
                ref={hourScrollRef}
                className="w-12 h-16 overflow-y-auto scrollbar-hide border rounded-lg bg-muted/30"
                onScroll={handleHourScroll}
              >
                {infiniteHours.map((hour, index) => (
                  <div
                    key={`${hour}-${index}`}
                    className={cn(
                      "h-8 flex items-center justify-center text-sm cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedHour === hour && "bg-primary text-primary-foreground font-medium"
                    )}
                    onClick={() => handleHourClick(hour)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="text-lg font-bold text-muted-foreground">:</div>

            {/* Minutes */}
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground mb-1">Minute</div>
              <div 
                ref={minuteScrollRef}
                className="w-12 h-16 overflow-y-auto scrollbar-hide border rounded-lg bg-muted/30"
                onScroll={handleMinuteScroll}
              >
                {infiniteMinutes.map((minute, index) => (
                  <div
                    key={`${minute}-${index}`}
                    className={cn(
                      "h-8 flex items-center justify-center text-sm cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedMinute === minute && "bg-primary text-primary-foreground font-medium"
                    )}
                    onClick={() => handleMinuteClick(minute)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleTimeSelect}
            className="w-full mt-3"
            size="sm"
          >
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;

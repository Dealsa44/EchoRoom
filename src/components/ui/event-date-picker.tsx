import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

interface EventDatePickerProps {
  id?: string;
  value?: string;
  onChange?: (date: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  max?: string;
  min?: string;
  disabled?: boolean;
}

const EventDatePicker: React.FC<EventDatePickerProps> = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Select date",
  className,
  error = false,
  max,
  min,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      return new Date(value);
    }
    // Start with today for events
    return new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRange, setYearRange] = useState(() => {
    const currentYear = new Date().getFullYear();
    // Show years from current year to 10 years in the future
    return { start: currentYear, end: currentYear + 10 };
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentDate(new Date(value));
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
        setShowMonthPicker(false);
        setShowYearPicker(false);
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

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date): boolean => {
    if (disabled) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable dates before today
    if (date < today) return true;
    
    if (min) {
      const minDate = new Date(min);
      if (date < minDate) return true;
    }
    
    if (max) {
      const maxDate = new Date(max);
      if (date > maxDate) return true;
    }
    
    return false;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    setSelectedDate(selectedDate);
    setCurrentDate(selectedDate);
    onChange?.(formatDate(selectedDate));
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      
      // Don't allow going to past months
      const today = new Date();
      const firstDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      if (firstDayOfNewMonth < today) {
        return prev; // Stay on current month
      }
      
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const goToPreviousYear = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() - 1);
      
      // Don't allow going to past years
      const today = new Date();
      const firstDayOfNewYear = new Date(newDate.getFullYear(), 0, 1);
      if (firstDayOfNewYear < today) {
        return prev; // Stay on current year
      }
      
      return newDate;
    });
  };

  const goToNextYear = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + 1);
      return newDate;
    });
  };

  const goToMonth = (month: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(month);
      
      // Don't allow going to past months
      const today = new Date();
      const firstDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      if (firstDayOfNewMonth < today) {
        return prev; // Stay on current month
      }
      
      return newDate;
    });
    setShowMonthPicker(false);
  };

  const goToYear = (year: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      
      // Don't allow going to past years
      const today = new Date();
      const firstDayOfNewYear = new Date(newDate.getFullYear(), 0, 1);
      if (firstDayOfNewYear < today) {
        return prev; // Stay on current year
      }
      
      return newDate;
    });
    setShowYearPicker(false);
  };

  const isMonthDisabled = (month: number) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), month, 1);
    const lastDayOfMonth = new Date(today.getFullYear(), month + 1, 0);
    
    // Only disable if the entire month is in the past
    // Allow selection if there are any available dates in the month
    return lastDayOfMonth < today;
  };

  const isYearDisabled = (year: number) => {
    const today = new Date();
    const firstDayOfYear = new Date(year, 0, 1);
    const lastDayOfYear = new Date(year, 11, 31);
    
    // Only disable if the entire year is in the past
    // Allow selection if there are any available dates in the year
    return lastDayOfYear < today;
  };

  const canGoToPreviousMonth = () => {
    const today = new Date();
    const firstDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return firstDayOfCurrentMonth > today;
  };

  const canGoToPreviousYear = () => {
    const today = new Date();
    const firstDayOfCurrentYear = new Date(currentDate.getFullYear(), 0, 1);
    return firstDayOfCurrentYear > today;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date);
      const isDisabled = isDateDisabled(date);
      const isToday = formatDate(date) === formatDate(new Date());

      days.push(
        <Button
          key={day}
          variant={isSelected ? "default" : "ghost"}
          size="sm"
          className={cn(
            "w-8 h-8 p-0 text-sm",
            isToday && !isSelected && "bg-blue-100 text-blue-700 hover:bg-blue-200",
            isDisabled && "opacity-30 cursor-not-allowed"
          )}
          disabled={isDisabled}
          onClick={() => handleDateSelect(date)}
        >
          {day}
        </Button>
      );
    }

    return days;
  };

  const renderMonthPicker = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <div className="grid grid-cols-3 gap-2 p-4">
        {months.map((month, index) => (
          <Button
            key={month}
            variant="ghost"
            size="sm"
            className={cn(
              "h-10",
              isMonthDisabled(index) && "opacity-30 cursor-not-allowed text-muted-foreground"
            )}
            onClick={() => goToMonth(index)}
            disabled={isMonthDisabled(index)}
          >
            {month}
          </Button>
        ))}
      </div>
    );
  };

  const renderYearPicker = () => {
    const years = [];
    for (let year = yearRange.start; year <= yearRange.end; year++) {
      years.push(year);
    }

    return (
      <div className="grid grid-cols-3 gap-2 p-4 max-h-48 overflow-y-auto">
        {years.map((year) => (
          <Button
            key={year}
            variant="ghost"
            size="sm"
            className={cn(
              "h-10",
              isYearDisabled(year) && "opacity-30 cursor-not-allowed text-muted-foreground"
            )}
            onClick={() => goToYear(year)}
            disabled={isYearDisabled(year)}
          >
            {year}
          </Button>
        ))}
      </div>
    );
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
            !selectedDate && "text-muted-foreground",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          disabled={disabled}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={popoverRef}
        className="w-auto p-0"
        align="start"
      >
        <div className="p-3">
          {showMonthPicker ? (
            renderMonthPicker()
          ) : showYearPicker ? (
            renderYearPicker()
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8 p-0"
                  disabled={!canGoToPreviousMonth()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMonthPicker(true)}
                    className="h-8 px-2 text-sm"
                  >
                    {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowYearPicker(true)}
                    className="h-8 px-2 text-sm"
                  >
                    {currentDate.getFullYear()}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                  className="h-8 w-8 p-0"
                  disabled={isMonthDisabled(currentDate.getMonth() + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EventDatePicker;

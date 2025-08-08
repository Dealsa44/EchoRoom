import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
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

const DatePicker: React.FC<DatePickerProps> = ({
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
    // Start with the first possible date (18 years ago) instead of today
    const firstPossibleDate = new Date();
    firstPossibleDate.setFullYear(firstPossibleDate.getFullYear() - 18);
    firstPossibleDate.setMonth(0); // Start with January
    firstPossibleDate.setDate(1); // Start with first day
    return firstPossibleDate;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRange, setYearRange] = useState(() => {
    const currentYear = new Date().getFullYear();
    // Show years from 18 years ago down to 100 years ago
    return { start: currentYear - 18, end: currentYear - 100 };
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
    
    // Create a new date object to avoid timezone issues
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    setSelectedDate(selectedDate);
    setCurrentDate(selectedDate);
    onChange?.(formatDate(selectedDate));
    setIsOpen(false);
  };

  const canNavigateToMonth = (direction: 'prev' | 'next') => {
    const testDate = new Date(currentDate);
    if (direction === 'prev') {
      testDate.setMonth(testDate.getMonth() - 1);
    } else {
      testDate.setMonth(testDate.getMonth() + 1);
    }
    
    // Check if any date in the test month would be valid
    const daysInMonth = getDaysInMonth(testDate);
    for (let day = 1; day <= daysInMonth; day++) {
      const testDayDate = new Date(testDate.getFullYear(), testDate.getMonth(), day);
      if (!isDateDisabled(testDayDate)) {
        return true; // At least one date is available
      }
    }
    return false; // No valid dates in this month
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (!canNavigateToMonth(direction)) {
      return; // Don't navigate if no valid dates
    }
    
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(newDate.getFullYear() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const getMonthName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  const getYearRange = () => {
    const years = [];
    for (let year = yearRange.start; year >= yearRange.end; year--) {
      years.push(year);
    }
    return years;
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

         // Add empty cells for days before the first day of the month
     for (let i = 0; i < firstDay; i++) {
       days.push(<div key={`empty-${i}`} className="h-6 w-6" />);
     }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentDate.getMonth() && 
        selectedDate.getFullYear() === currentDate.getFullYear();
      const isToday = date.toDateString() === new Date().toDateString();
      const isDisabled = isDateDisabled(date);

             days.push(
         <button
           key={day}
           onClick={() => handleDateSelect(date)}
           disabled={isDisabled}
                        className={cn(
               "h-6 w-6 rounded-full text-xs font-medium date-cell-hover focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-30 disabled:cursor-not-allowed",
               isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 date-cell-selected",
               isToday && !isSelected && "bg-muted text-foreground",
               !isSelected && !isToday && !isDisabled && "hover:bg-muted/50"
             )}
         >
           {day}
         </button>
       );
    }

    return days;
  };



  const displayValue = selectedDate ? formatDate(selectedDate) : '';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            "w-full justify-between text-left font-normal",
            error && "border-red-500 focus:border-red-500",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <span className={cn(
            "block truncate",
            !displayValue && "text-muted-foreground"
          )}>
            {displayValue || placeholder}
          </span>
          <Calendar className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverRef}
        className="w-auto p-0 border-0 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 date-picker-enter"
        align="start"
        side="top"
        sideOffset={4}
      >
                 <div className="p-2">
                     {/* Header */}
           <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-1">
                                                <button
                  onClick={() => navigateMonth('prev')}
                  disabled={!canNavigateToMonth('prev')}
                  className={cn(
                    "p-0.5 rounded transition-colors date-cell-hover",
                    canNavigateToMonth('prev') 
                      ? "hover:bg-muted cursor-pointer" 
                      : "opacity-30 cursor-not-allowed"
                  )}
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
               
               <div className="flex items-center gap-1">
                                                  <button
                   onClick={(e) => {
                     e.stopPropagation();
                     if (showYearPicker) {
                       setShowYearPicker(false);
                     }
                     setShowMonthPicker(!showMonthPicker);
                   }}
                   className="px-1.5 py-0.5 text-xs font-medium hover:bg-muted rounded transition-colors date-cell-hover"
                 >
                   {getMonthName(currentDate)}
                 </button>
                
                                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     if (showMonthPicker) {
                       setShowMonthPicker(false);
                     }
                     setShowYearPicker(!showYearPicker);
                   }}
                   className="px-1.5 py-0.5 text-xs font-medium hover:bg-muted rounded transition-colors date-cell-hover"
                 >
                   {currentDate.getFullYear()}
                 </button>
               </div>
               
                                                <button
                  onClick={() => navigateMonth('next')}
                  disabled={!canNavigateToMonth('next')}
                  className={cn(
                    "p-0.5 rounded transition-colors date-cell-hover",
                    canNavigateToMonth('next') 
                      ? "hover:bg-muted cursor-pointer" 
                      : "opacity-30 cursor-not-allowed"
                  )}
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
             </div>
             
             <button
               onClick={() => setIsOpen(false)}
               className="p-0.5 hover:bg-muted rounded transition-colors date-cell-hover"
             >
               <X className="h-3 w-3" />
             </button>
           </div>

                     {/* Month Picker */}
           {showMonthPicker && (
             <div className="absolute top-10 left-0 right-0 z-10 bg-background border rounded-md shadow-lg p-1" onClick={(e) => e.stopPropagation()}>
               <div className="grid grid-cols-4 gap-0.5">
                 {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                   <button
                     key={month}
                     onClick={() => {
                       setCurrentDate(new Date(currentDate.getFullYear(), index, 1));
                       setShowMonthPicker(false);
                     }}
                     className={cn(
                       "p-1.5 text-xs font-medium rounded transition-all duration-200 hover:bg-primary/10 focus:outline-none focus:ring-1 focus:ring-primary/20 date-cell-hover",
                       currentDate.getMonth() === index && "bg-primary text-primary-foreground"
                     )}
                   >
                     {month}
                   </button>
                 ))}
               </div>
             </div>
           )}

           {/* Year Picker */}
           {showYearPicker && (
             <div className="absolute top-10 left-0 right-0 z-10 bg-background border rounded-md shadow-lg p-1 max-h-32 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
               <div className="grid grid-cols-4 gap-0.5">
                 {getYearRange().map((year) => (
                   <button
                     key={year}
                     onClick={() => {
                       setCurrentDate(new Date(year, currentDate.getMonth(), 1));
                       setShowYearPicker(false);
                     }}
                     className={cn(
                       "p-1.5 text-xs font-medium rounded transition-all duration-200 hover:bg-primary/10 focus:outline-none focus:ring-1 focus:ring-primary/20 date-cell-hover",
                       currentDate.getFullYear() === year && "bg-primary text-primary-foreground"
                     )}
                   >
                     {year}
                   </button>
                 ))}
               </div>
             </div>
           )}

           {/* Days of week header */}
           <div className="grid grid-cols-7 gap-0.5 mb-1" onClick={() => {
             setShowMonthPicker(false);
             setShowYearPicker(false);
           }}>
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
               <div
                 key={day}
                 className="h-6 w-6 flex items-center justify-center text-xs font-medium text-muted-foreground"
               >
                 {day}
               </div>
             ))}
           </div>

           {/* Calendar content */}
           <div className="min-w-[200px]" onClick={() => {
             setShowMonthPicker(false);
             setShowYearPicker(false);
           }}>
             <div className="grid grid-cols-7 gap-0.5">
               {renderDays()}
             </div>
           </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { DatePicker };

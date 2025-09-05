import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  Clock, 
  MoreVertical,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PhoneOff,
  Search,
  X,
  User,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import TopBar from '@/components/layout/TopBar';
import { useCall } from '@/hooks/useCall';
import { CallRecord, CallType, CallStatus } from '@/types';
import { Input } from '@/components/ui/input';

const CallHistory = () => {
  const navigate = useNavigate();
  const { callHistory, deleteCallRecord, clearCallHistory, getCallStats } = useCall();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearTimeframe, setClearTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('all');
  const [deletingCallId, setDeletingCallId] = useState<string | null>(null);
  const [swipedCallId, setSwipedCallId] = useState<string | null>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'voice' | 'video' | null>(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState<'private' | 'group' | null>(null);
  const [pressedCard, setPressedCard] = useState<'voice' | 'video' | null>(null);
  const [pressedTypeCard, setPressedTypeCard] = useState<'private' | 'group' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = getCallStats();

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    } else {
      // Show full date and time for older calls
      const isThisYear = date.getFullYear() === now.getFullYear();
      if (isThisYear) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } else {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric',
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    }
  };

  const getCallStatusIcon = (status: CallStatus, direction: 'incoming' | 'outgoing') => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'missed':
        return <XCircle size={16} className="text-red-500" />;
      case 'declined':
        return <PhoneOff size={16} className="text-red-500" />;
      default:
        return direction === 'incoming' ? 
          <Phone size={16} className="text-blue-500" /> : 
          <Phone size={16} className="text-green-500" />;
    }
  };

  const getCallStatusText = (status: CallStatus, direction: 'incoming' | 'outgoing') => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'missed':
        return 'Missed';
      case 'declined':
        return 'Declined';
      case 'outgoing':
        return 'Outgoing';
      case 'incoming':
        return 'Incoming';
      default:
        return direction === 'incoming' ? 'Incoming' : 'Outgoing';
    }
  };

  const handleDeleteCall = (callId: string) => {
    setDeletingCallId(callId);
  };

  const confirmDeleteCall = () => {
    if (deletingCallId) {
      deleteCallRecord(deletingCallId);
      setDeletingCallId(null);
      setSwipedCallId(null);
      setSwipeOffset(0);
    }
  };

  const handleSwipeStart = (e: React.TouchEvent, callId: string) => {
    // If another card is swiped, close it first
    if (swipedCallId && swipedCallId !== callId) {
      setSwipeOffset(0);
      setSwipedCallId(null);
    }
    setSwipeStartX(e.touches[0].clientX);
    setSwipedCallId(callId);
  };

  const handleSwipeMove = (e: React.TouchEvent) => {
    if (swipeStartX === null || !swipedCallId) return;
    
    const currentX = e.touches[0].clientX;
    const diff = swipeStartX - currentX;
    
    if (diff > 0) { // Only allow left swipe
      const maxSwipe = 80; // Maximum swipe distance
      // Add resistance as you approach max swipe
      const resistance = Math.max(0.3, 1 - (diff / maxSwipe) * 0.7);
      const newOffset = Math.min(diff * resistance, maxSwipe);
      setSwipeOffset(newOffset);
    } else if (diff < 0) {
      // Allow right swipe to close if already open
      const newOffset = Math.max(swipeOffset + diff, 0);
      setSwipeOffset(newOffset);
    }
  };

  const handleSwipeEnd = () => {
    const threshold = 50; // Slightly higher threshold for better UX
    
    if (swipeOffset > threshold) { // Threshold to reveal delete button
      // Animate to full open position
      setSwipeOffset(80);
    } else {
      // Animate back to closed position
      setSwipeOffset(0);
      // Small delay before clearing the swiped state for smooth animation
      setTimeout(() => {
        setSwipedCallId(null);
      }, 300);
    }
    setSwipeStartX(null);
  };

  const handleCardClick = (e: React.MouseEvent, callId: string) => {
    // If another card is swiped, close it
    if (swipedCallId && swipedCallId !== callId && swipeOffset > 0) {
      setSwipeOffset(0);
      setSwipedCallId(null);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  const handleDeleteSwipe = (callId: string) => {
    setDeletingCallId(callId);
  };

  const handleClearHistory = (timeframe: 'day' | 'week' | 'month' | 'all') => {
    setClearTimeframe(timeframe);
    setShowClearDialog(true);
  };

  const confirmClearHistory = () => {
    clearCallHistory(clearTimeframe);
    setShowClearDialog(false);
  };

  const getTimeframeText = (timeframe: 'day' | 'week' | 'month' | 'all') => {
    switch (timeframe) {
      case 'day': return 'Last Day';
      case 'week': return 'Last Week';
      case 'month': return 'Last Month';
      case 'all': return 'All Time';
    }
  };

  const handleFilterToggle = (filterType: 'voice' | 'video') => {
    if (activeFilter === filterType) {
      // If clicking the same filter, deactivate it
      setActiveFilter(null);
      setPressedCard(null);
    } else {
      // If clicking a different filter, activate it
      setActiveFilter(filterType);
      setPressedCard(filterType);
    }
  };

  const handleTypeFilterToggle = (filterType: 'private' | 'group') => {
    if (activeTypeFilter === filterType) {
      // If clicking the same filter, deactivate it
      setActiveTypeFilter(null);
      setPressedTypeCard(null);
    } else {
      // If clicking a different filter, activate it
      setActiveTypeFilter(filterType);
      setPressedTypeCard(filterType);
    }
  };

  const filteredCallHistory = callHistory.filter(call => {
    // Filter by call type (voice/video)
    if (activeFilter !== null && call.type !== activeFilter) {
      return false;
    }
    
    // Filter by private/group type
    if (activeTypeFilter !== null && call.callType !== activeTypeFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const name = call.participantName.toLowerCase();
      return name.includes(query);
    }
    
    return true;
  });

  return (
    <div className="min-h-screen app-gradient-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-24 right-10 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-28 left-6 w-20 h-20 bg-gradient-secondary rounded-full blur-xl animate-float" style={{ animationDelay: '1.4s' }} />
      </div>

             <TopBar 
         title="Call History" 
         showBack 
         onBack={() => navigate('/chat-inbox')}
         showNotifications={false}
         showDarkModeToggle={false}
         showAIAssistant={false}
                   rightAction={
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="h-8 w-8">
                 <MoreVertical size={18} />
               </Button>
             </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleClearHistory('day')}>
                  <Calendar size={16} className="mr-2" />
                  Clear Last Day
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleClearHistory('week')}>
                  <Calendar size={16} className="mr-2" />
                  Clear Last Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleClearHistory('month')}>
                  <Calendar size={16} className="mr-2" />
                  Clear Last Month
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleClearHistory('all')}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear All
                </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
         }
       />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10 content-safe-top pb-24">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-card/60 backdrop-blur-sm border-border/50 focus:border-border"
          />
          {searchQuery.trim() !== '' && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
            >
              <X 
                size={12} 
                className="text-muted-foreground group-hover:text-foreground transition-colors duration-200" 
              />
            </button>
          )}
        </div>

        {/* Type Filter Toggles (Private/Group) */}
        <div className="flex gap-2">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              activeTypeFilter === 'private'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105'
                : 'bg-card/60 backdrop-blur-sm border border-border/50 text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
            }`}
            onClick={() => handleTypeFilterToggle('private')}
          >
            <User size={18} />
            <span>Private</span>
            <span className={`text-sm font-bold ${
              activeTypeFilter === 'private' ? 'text-green-100' : 'text-green-500'
            }`}>
              {callHistory.filter(call => call.callType === 'private').length}
            </span>
          </button>
          
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              activeTypeFilter === 'group'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                : 'bg-card/60 backdrop-blur-sm border border-border/50 text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
            }`}
            onClick={() => handleTypeFilterToggle('group')}
          >
            <Users size={18} />
            <span>Group</span>
            <span className={`text-sm font-bold ${
              activeTypeFilter === 'group' ? 'text-orange-100' : 'text-orange-500'
            }`}>
              {callHistory.filter(call => call.callType === 'group').length}
            </span>
          </button>
        </div>

        {/* Call Type Filter Toggles (Voice/Video) */}
        <div className="flex gap-2">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              activeFilter === 'voice'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-card/60 backdrop-blur-sm border border-border/50 text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
            }`}
            onClick={() => handleFilterToggle('voice')}
          >
            <Phone size={18} />
            <span>Voice</span>
            <span className={`text-sm font-bold ${
              activeFilter === 'voice' ? 'text-blue-100' : 'text-blue-500'
            }`}>
              {stats.voice}
            </span>
          </button>
          
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              activeFilter === 'video'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                : 'bg-card/60 backdrop-blur-sm border border-border/50 text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
            }`}
            onClick={() => handleFilterToggle('video')}
          >
            <Video size={18} />
            <span>Video</span>
            <span className={`text-sm font-bold ${
              activeFilter === 'video' ? 'text-purple-100' : 'text-purple-500'
            }`}>
              {stats.video}
            </span>
          </button>
        </div>

        {/* Call History List */}
        <div className="space-y-3">
          {filteredCallHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📞</div>
              <p className="text-muted-foreground mb-2">
                {searchQuery.trim() !== '' 
                  ? `No calls found for "${searchQuery}"`
                  : activeFilter || activeTypeFilter
                    ? `No ${[activeTypeFilter, activeFilter].filter(Boolean).join(' ')} calls found` 
                    : 'No call history yet'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {searchQuery.trim() !== ''
                  ? 'Try a different search term or clear your search'
                  : activeFilter || activeTypeFilter
                    ? 'Try adjusting your filters or check back later' 
                    : 'Your call history will appear here'
                }
              </p>
            </div>
          ) : (
                         filteredCallHistory.map((call, index) => (
               <div 
                 key={call.id}
                 className="relative overflow-hidden"
                 style={{ animationDelay: `${0.05 + index * 0.05}s` }}
               >
                                   {/* Delete Button (Hidden behind card) */}
                  <div 
                    className="absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center z-10 shadow-lg"
                    style={{
                      opacity: swipedCallId === call.id ? Math.min(swipeOffset / 40, 1) : 0,
                      transform: `scale(${swipedCallId === call.id ? Math.min(swipeOffset / 40, 1) : 0.8})`,
                      transition: 'opacity 0.2s ease, transform 0.2s ease'
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-full w-full rounded-none text-white hover:bg-red-600/90 transition-all duration-200 hover:scale-105"
                      onClick={() => handleDeleteSwipe(call.id)}
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>
                  
                  {/* Call Card */}
                  <Card 
                    className="cursor-pointer transform-gpu will-change-transform transition-all animate-fade-in animate-slide-up relative z-20 bg-background hover:bg-background active:bg-background focus:bg-background"
                    style={{ 
                      transform: `translateX(-${swipedCallId === call.id ? swipeOffset : 0}px)`,
                      transition: swipeStartX === null ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                      boxShadow: swipedCallId === call.id && swipeOffset > 0 
                        ? `0 4px 20px rgba(0, 0, 0, ${0.1 + (swipeOffset / 80) * 0.1})` 
                        : '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    onTouchStart={(e) => handleSwipeStart(e, call.id)}
                    onTouchMove={handleSwipeMove}
                    onTouchEnd={handleSwipeEnd}
                    onClick={(e) => handleCardClick(e, call.id)}
                  >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-primary/10 grid place-items-center shadow-inner-soft">
                      <div className="text-2xl select-none" aria-hidden>
                        {call.participantAvatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-background flex items-center justify-center">
                        {call.type === 'voice' ? (
                          <Phone size={12} className="text-blue-500" />
                        ) : (
                          <Video size={12} className="text-purple-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="font-medium truncate">{call.participantName}</h3>
                          {getCallStatusIcon(call.status, call.direction)}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTimestamp(call.startTime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm text-muted-foreground">
                          {getCallStatusText(call.status, call.direction)}
                        </span>
                        {call.duration > 0 && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {formatDuration(call.duration)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                   </div>
                 </CardContent>
               </Card>
             </div>
             ))
           )}
         </div>
      </div>

      {/* Clear History Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-destructive" />
              Clear Call History
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear {getTimeframeText(clearTimeframe).toLowerCase()} call history? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmClearHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Call Dialog */}
      <AlertDialog open={!!deletingCallId} onOpenChange={() => setDeletingCallId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 size={20} className="text-destructive" />
              Delete Call Record
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this call record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCall}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CallHistory;

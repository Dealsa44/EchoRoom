import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  MessageCircle, 
  User, 
  Shield, 
  MapPin, 
  Heart,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { MatchCardSkeleton } from '@/components/ui/SkeletonLoader';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Profile } from '@/types';
import { getProfilesByIds } from '@/data/mockProfiles';

const Matches = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  
  // Mock matches data - in real app this would come from context or API
  // Use centralized mock data - simulate matched profiles (Luna and Alex)
  const [matches, setMatches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading matches
  useEffect(() => {
    const timer = setTimeout(() => {
      setMatches(getProfilesByIds([1, 2]));
      setLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  const handleChat = (profile: Profile) => {
    navigate(`/private-chat/${profile.id}`);
  };

  const handleViewProfile = (profile: Profile) => {
    // Navigate to profile view page
    navigate(`/profile/${profile.id}`);
  };

  const handleBlock = (profile: Profile) => {
    setMatches(prev => prev.filter(match => match.id !== profile.id));
    toast({
      title: "User blocked",
      description: `${profile.name} has been blocked`,
    });
  };

  const handleUnmatch = (profile: Profile) => {
    setMatches(prev => prev.filter(match => match.id !== profile.id));
    toast({
      title: "Unmatched",
      description: `You've unmatched with ${profile.name}`,
    });
  };

  const getChatStyleColor = (style: string) => {
    switch (style) {
      case 'introverted': return 'bg-blue-100 text-blue-800';
      case 'balanced': return 'bg-green-100 text-green-800';
      case 'outgoing': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Your Matches" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-4">
        {loading ? (
          <>
            <div className="text-center mb-4">
              <div className="h-6 w-24 bg-muted rounded animate-pulse mx-auto mb-2"></div>
              <div className="h-4 w-48 bg-muted rounded animate-pulse mx-auto"></div>
            </div>
            {[...Array(2)].map((_, index) => (
              <MatchCardSkeleton key={index} />
            ))}
          </>
        ) : matches.length === 0 ? (
          <Card className="shadow-medium">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">💔</div>
              <h3 className="font-semibold mb-2">No matches yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start swiping to find your matches!
              </p>
              <Button 
                variant="default" 
                onClick={() => navigate('/match')}
              >
                Start Matching
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold">{matches.length} Match{matches.length !== 1 ? 'es' : ''}</h2>
              <p className="text-sm text-muted-foreground">People you've connected with</p>
            </div>
            
            {matches.map((match) => (
              <Card key={match.id} className="shadow-medium overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  <img 
                    src={match.photos[0]} 
                    alt={match.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://picsum.photos/400/400?random=999';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Profile Info Overlay */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold">{match.name}</h2>
                      <span className="text-sm">{match.age}</span>
                      {match.isVerified && (
                        <Shield size={14} className="text-blue-400" />
                      )}
                      {match.isOnline && (
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs mb-2">
                      <MapPin size={10} />
                      {match.location} • {match.distance}km away
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleChat(match)}
                      className="h-8 w-8 p-0"
                    >
                      <MessageCircle size={14} />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                        >
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProfile(match)}>
                          <User size={14} className="mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBlock(match)} className="text-red-600">
                          <Shield size={14} className="mr-2" />
                          Block
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUnmatch(match)} className="text-orange-600">
                          <X size={14} className="mr-2" />
                          Unmatch
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{match.bio}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full ${match.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {match.isOnline ? 'Online now' : `Active ${match.lastActive}`}
                      </div>
                      <Badge className="text-xs">
                        {match.sharedInterests} shared interests
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {match.interests.slice(0, 3).map(interest => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                      {match.interests.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{match.interests.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Language:</span>
                        <Badge variant="outline" className="ml-1">{match.languageLevel}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Style:</span>
                        <Badge className={`ml-1 ${getChatStyleColor(match.chatStyle)}`}>
                          {match.chatStyle}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Matches; 
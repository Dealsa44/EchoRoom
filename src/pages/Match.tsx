import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, MessageCircle, X, Filter, MapPin } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import { toast } from '@/hooks/use-toast';

const Match = () => {
  const navigate = useNavigate();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [filters, setFilters] = useState({
    interests: 'all',
    languageLevel: 'all',
    chatStyle: 'all',
    connectionType: 'all'
  });

  const profiles = [
    {
      id: 1,
      name: 'Luna',
      avatar: '🌙',
      age: 24,
      location: 'Tbilisi, Georgia',
      bio: 'Philosophy student who loves deep conversations and poetry. Looking for meaningful connections.',
      interests: ['Philosophy', 'Poetry', 'Mindfulness'],
      languageLevel: 'B2',
      chatStyle: 'introverted',
      lastActive: '2 hours ago',
      sharedInterests: 2,
      connectionType: 'platonic'
    },
    {
      id: 2,
      name: 'Alex',
      avatar: '📚',
      age: 28,
      location: 'London, UK',
      bio: 'Book enthusiast and language learner. Seeking someone to explore ideas and practice languages with.',
      interests: ['Books', 'Languages', 'Culture'],
      languageLevel: 'C1',
      chatStyle: 'balanced',
      lastActive: '1 hour ago',
      sharedInterests: 3,
      connectionType: 'both'
    },
    {
      id: 3,
      name: 'Sage',
      avatar: '🌱',
      age: 22,
      location: 'San Francisco, USA',
      bio: 'Mindfulness practitioner and nature lover. Looking for gentle souls to share wisdom with.',
      interests: ['Mindfulness', 'Nature', 'Art'],
      languageLevel: 'A2',
      chatStyle: 'introverted',
      lastActive: '30 min ago',
      sharedInterests: 1,
      connectionType: 'platonic'
    }
  ];

  const currentProfile = profiles[currentProfileIndex];

  const handleSayHi = () => {
    toast({
      title: "Message sent!",
      description: `Your introduction has been sent to ${currentProfile.name}`,
    });
    navigate(`/private-chat/${currentProfile.id}`);
  };

  const handleSkip = () => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    } else {
      toast({
        title: "That's everyone for now!",
        description: "Check back later for new matches.",
      });
      setCurrentProfileIndex(0);
    }
  };

  const getChatStyleColor = (style: string) => {
    switch (style) {
      case 'introverted': return 'bg-safe-deep';
      case 'balanced': return 'bg-safe-light';
      case 'outgoing': return 'bg-safe-learning';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Find Your Match" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Filters */}
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Filters</h3>
              <Filter size={16} className="text-muted-foreground" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Interests</label>
                <Select value={filters.interests} onValueChange={(value) => setFilters(prev => ({ ...prev, interests: value }))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="philosophy">Philosophy</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Language Level</label>
                <Select value={filters.languageLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, languageLevel: value }))}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">A1-A2</SelectItem>
                    <SelectItem value="intermediate">B1-B2</SelectItem>
                    <SelectItem value="advanced">C1-C2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Card */}
        {currentProfile && (
          <Card className="shadow-medium overflow-hidden">
            <div className="h-32 bg-gradient-hero relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-4xl mb-1">{currentProfile.avatar}</div>
                <div className="flex items-center gap-1 text-xs">
                  <MapPin size={12} />
                  {currentProfile.location}
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-white/20 text-white">
                  {currentProfile.sharedInterests} shared interests
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">{currentProfile.name}</h2>
                  <span className="text-sm text-muted-foreground">{currentProfile.age}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{currentProfile.bio}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Active {currentProfile.lastActive}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-1">
                    {currentProfile.interests.map(interest => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Language Level</h4>
                    <Badge variant="outline">{currentProfile.languageLevel}</Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Chat Style</h4>
                    <Badge className={getChatStyleColor(currentProfile.chatStyle)}>
                      {currentProfile.chatStyle}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Looking for</h4>
                  <Badge variant="outline">
                    {currentProfile.connectionType === 'both' ? 'Friends & Romance' : 
                     currentProfile.connectionType === 'romantic' ? 'Romance' : 'Friendship'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSkip}
            className="flex-1 h-14"
          >
            <X size={20} />
            <span className="ml-2">Skip</span>
          </Button>
          
          <Button
            variant="cozy"
            size="lg"
            onClick={handleSayHi}
            className="flex-1 h-14"
          >
            <MessageCircle size={20} />
            <span className="ml-2">Say Hi</span>
          </Button>
        </div>

        {/* Profile Counter */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Profile {currentProfileIndex + 1} of {profiles.length}
          </p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Match;
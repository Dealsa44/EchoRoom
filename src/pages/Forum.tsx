import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MessageCircle, Heart, TrendingUp, Clock } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import CreateThreadModal from '@/components/modals/CreateThreadModal';

const Forum = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const categories = [
    { value: 'all', label: 'All Topics', icon: '💬' },
    { value: 'mental-health', label: 'Mental Health', icon: '💚' },
    { value: 'philosophy', label: 'Philosophy', icon: '🤔' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'culture', label: 'Culture', icon: '🌍' },
    { value: 'wellness', label: 'Wellness', icon: '🧘' },
    { value: 'creativity', label: 'Creativity', icon: '🎨' }
  ];

  const threads = [
    {
      id: 1,
      title: 'How do you practice self-compassion during difficult times?',
      author: 'MindfulSoul',
      authorAvatar: '🌸',
      category: 'mental-health',
      replies: 24,
      upvotes: 67,
      lastActivity: '2 hours ago',
      excerpt: 'I\'ve been struggling with being kind to myself lately. What practices help you show yourself the same compassion you\'d give a friend?',
      tags: ['Self-Care', 'Mindfulness', 'Support'],
      isStickied: false,
      hasNewReplies: true
    },
    {
      id: 2,
      title: 'The paradox of choice in modern life - thoughts?',
      author: 'DeepThinker',
      authorAvatar: '🤔',
      category: 'philosophy',
      replies: 18,
      upvotes: 43,
      lastActivity: '4 hours ago',
      excerpt: 'Barry Schwartz\'s ideas about how too many options can lead to anxiety and paralysis. How do you navigate decision-making in our choice-rich world?',
      tags: ['Philosophy', 'Psychology', 'Modern Life'],
      isStickied: true,
      hasNewReplies: false
    },
    {
      id: 3,
      title: 'Learning languages as an adult - motivation tips?',
      author: 'PolyglotDreamer',
      authorAvatar: '📚',
      category: 'education',
      replies: 31,
      upvotes: 89,
      lastActivity: '6 hours ago',
      excerpt: 'I\'m 28 and learning Georgian. Some days I feel motivated, others I want to give up. How do you maintain consistency in language learning?',
      tags: ['Languages', 'Learning', 'Motivation'],
      isStickied: false,
      hasNewReplies: true
    },
    {
      id: 4,
      title: 'The beauty of slow living in a fast world',
      author: 'QuietMoments',
      authorAvatar: '🍃',
      category: 'wellness',
      replies: 15,
      upvotes: 52,
      lastActivity: '1 day ago',
      excerpt: 'In our hustle culture, I\'ve found peace in intentionally slowing down. Making tea mindfully, reading without rushing, walking without destination...',
      tags: ['Slow Living', 'Mindfulness', 'Lifestyle'],
      isStickied: false,
      hasNewReplies: false
    },
    {
      id: 5,
      title: 'Creative block: when inspiration feels impossible',
      author: 'ArtisticSoul',
      authorAvatar: '🎨',
      category: 'creativity',
      replies: 22,
      upvotes: 38,
      lastActivity: '1 day ago',
      excerpt: 'Been staring at blank canvases for weeks. How do you push through creative blocks while being gentle with yourself?',
      tags: ['Art', 'Creativity', 'Inspiration'],
      isStickied: false,
      hasNewReplies: true
    }
  ];

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thread.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || thread.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.upvotes - a.upvotes;
      case 'replies':
        return b.replies - a.replies;
      default:
        return a.isStickied === b.isStickied ? 0 : a.isStickied ? -1 : 1;
    }
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'mental-health': 'bg-safe-light',
      'philosophy': 'bg-safe-deep',
      'education': 'bg-safe-learning',
      'culture': 'bg-secondary',
      'wellness': 'bg-accent',
      'creativity': 'bg-primary/20'
    };
    return colors[category as keyof typeof colors] || 'bg-muted';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Deep Discussions" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Safe and slow conversations</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="replies">Most Replies</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="cozy"
              onClick={() => setShowCreateModal(true)}
              className="px-3"
            >
              <Plus size={20} />
            </Button>
          </div>
        </div>

        {/* Threads List */}
        <div className="space-y-3">
          {sortedThreads.map((thread) => (
            <Card 
              key={thread.id} 
              className="cursor-pointer transition-all hover:shadow-medium hover:scale-[1.01]"
              onClick={() => navigate(`/forum/thread/${thread.id}`)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {thread.isStickied && (
                          <Badge variant="secondary" className="text-xs">
                            📌 Pinned
                          </Badge>
                        )}
                        <Badge className={getCategoryColor(thread.category)} variant="secondary">
                          {categories.find(c => c.value === thread.category)?.icon} 
                          {categories.find(c => c.value === thread.category)?.label}
                        </Badge>
                      </div>
                      <h3 className="font-medium line-clamp-2 mb-2">{thread.title}</h3>
                    </div>
                    {thread.hasNewReplies && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>

                  {/* Excerpt */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {thread.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {thread.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{thread.authorAvatar}</span>
                      <span>{thread.author}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart size={12} />
                        <span>{thread.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={12} />
                        <span>{thread.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{thread.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedThreads.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-muted-foreground mb-3">No discussions found</p>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(true)}
            >
              Start a new discussion
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
      
      <CreateThreadModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default Forum;
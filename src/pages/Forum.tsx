import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MessageCircle, Heart, Clock } from 'lucide-react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import TopBar from '@/components/layout/TopBar';
import CreateThreadModal from '@/components/modals/CreateThreadModal';
import { forumApi, type ForumPostListItem } from '@/services/api';

function formatLastActivity(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return d.toLocaleDateString();
}

const Forum = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<ForumPostListItem[]>([]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await forumApi.getPosts({
        category: selectedCategory,
        search: searchTerm.trim() || undefined,
        sort: sortBy,
      });
      if (res.success && res.posts) setThreads(res.posts);
      else setThreads([]);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const categories = [
    { value: 'all', label: 'All Topics', icon: '💬' },
    { value: 'mental-health', label: 'Mental Health', icon: '💚' },
    { value: 'philosophy', label: 'Philosophy', icon: '🤔' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'culture', label: 'Culture', icon: '🌍' },
    { value: 'wellness', label: 'Wellness', icon: '🧘' },
    { value: 'creativity', label: 'Creativity', icon: '🎨' }
  ];

  const sortedThreads = threads;

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
    <div className="min-h-screen app-gradient-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-28 h-28 bg-gradient-tertiary rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 left-12 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-8 w-20 h-20 bg-gradient-secondary rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <TopBar 
        title="Deep Discussions" 
        showBack={true}
        onBack={() => navigate('/community')}
      />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10 content-safe-top pb-24">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <h1 className="text-display-2 font-bold gradient-text-hero mb-2">Community Forum</h1>
          <p className="text-body-small text-muted-foreground">Safe and slow conversations that matter</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative glass rounded-2xl p-1 shadow-medium animate-breathe-slow">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
            <Input
              id="forumSearch"
              name="forumSearch"
              placeholder="Search discussions, topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              className="pl-12 border-0 bg-transparent shadow-none focus:ring-0 h-12"
            />
          </div>
          
          <div className="space-y-3">
            {/* Topics filter gets a full row */}
            <div className="w-full">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full glass border-border-soft transition-smooth h-12 rounded-xl shadow-soft animate-breathe-slow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border-soft shadow-large">
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="hover:bg-primary/10 transition-smooth">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Secondary controls row */}
            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1 glass border-border-soft transition-smooth h-12 rounded-xl shadow-soft animate-breathe-slow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border-soft shadow-large">
                  <SelectItem value="recent" className="hover:bg-primary/10 transition-smooth">Recent</SelectItem>
                  <SelectItem value="popular" className="hover:bg-primary/10 transition-smooth">Popular</SelectItem>
                  <SelectItem value="replies" className="hover:bg-primary/10 transition-smooth">Most Replies</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="gradient"
                size="icon-lg"
                onClick={() => setShowCreateModal(true)}
                className="shadow-glow-primary animate-breathe-slow active:scale-[0.98]"
              >
                <Plus size={22} />
              </Button>
            </div>
          </div>
        </div>

        {/* Threads List */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="shadow-large animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header skeleton */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-6 bg-muted rounded w-20"></div>
                          <div className="h-6 bg-muted rounded w-24"></div>
                        </div>
                        <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                    
                    {/* Excerpt skeleton */}
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                    
                    {/* Tags skeleton */}
                    <div className="flex gap-2 pt-3">
                      <div className="h-6 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                      <div className="h-6 bg-muted rounded w-18"></div>
                    </div>
                    
                    {/* Footer skeleton */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-xl"></div>
                        <div className="space-y-1">
                          <div className="h-4 bg-muted rounded w-24"></div>
                          <div className="h-3 bg-muted rounded w-32"></div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-3 bg-muted rounded w-16"></div>
                        <div className="h-3 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            sortedThreads.map((thread, index) => (
            <Card 
              key={thread.id} 
              className="cursor-pointer shadow-large animate-breathe-slow animate-slide-up animate-fade-in active:scale-[0.98] overflow-hidden"
              style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                const from = urlParams.get('from');
                if (from === 'community') {
                  navigate(`/forum/thread/${thread.id}?from=community`);
                } else {
                  navigate(`/forum/thread/${thread.id}`);
                }
              }}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {thread.isStickied && (
                          <Badge variant="warning" size="sm" className="animate-pulse-soft">
                            📌 Pinned
                          </Badge>
                        )}
                        <Badge className={getCategoryColor(thread.category)} variant="glass" size="sm">
                          <span className="text-base mr-1">{categories.find(c => c.value === thread.category)?.icon}</span>
                          {categories.find(c => c.value === thread.category)?.label}
                        </Badge>
                      </div>
                      <h3 className="relative text-heading-2 font-semibold line-clamp-2 pb-1">
                        {thread.title}
                        <span className="absolute left-0 -bottom-0.5 h-0.5 w-20 bg-gradient-to-r from-primary to-secondary rounded-full" />
                      </h3>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <p className="text-body-small text-muted-foreground leading-relaxed">
                    {thread.excerpt}
                  </p>

                  {/* Tags */}
                  {thread.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 border-t border-border-soft pt-3">
                      {thread.tags.map(tag => (
                        <Badge key={tag} variant="ghost" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl p-2 bg-gradient-primary/10 rounded-xl shadow-inner-soft">
                          {thread.authorAvatar || '💬'}
                        </div>
                        <div>
                          <div className="text-body font-medium text-foreground">{thread.author}</div>
                          <div className="text-caption text-muted-foreground">Member</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-caption text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Heart size={14} />
                          <span className="font-medium">{thread.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle size={14} />
                          <span className="font-medium">{thread.replies}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-caption text-muted-foreground">
                      <Clock size={12} />
                      <span>Last activity {formatLastActivity(thread.lastActivity)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
          )}
        </div>

        {!loading && sortedThreads.length === 0 && (
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
        onSuccess={fetchPosts}
      />
    </div>
  );
};

export default Forum;
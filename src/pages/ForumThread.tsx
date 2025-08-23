import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, MoreHorizontal, Reply, Calendar, Clock, User, ChevronDown, ChevronUp, Minus, Plus, Filter, SortAsc, SortDesc, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';

const ForumThread = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reply, setReply] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const [threadLiked, setThreadLiked] = useState(false);
  const [collapsedComments, setCollapsedComments] = useState<Set<number>>(new Set());
  const [showAllComments, setShowAllComments] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [showCommentForm, setShowCommentForm] = useState(false);

  const thread = {
    id: 1,
    title: 'How do you practice self-compassion during difficult times?',
    author: 'MindfulSoul',
    authorAvatar: '🌸',
    authorLevel: 'Community Helper',
    authorJoined: 'Joined 8 months ago',
    content: 'I\'ve been struggling with being kind to myself lately. What practices help you show yourself the same compassion you\'d give a friend?\n\nI notice I\'m much harder on myself than I would ever be on someone I care about. When friends make mistakes, I remind them that they\'re human and that growth takes time. But when I make mistakes, my inner voice becomes critical and harsh.\n\nI\'m curious about your experiences and any gentle practices that have helped you develop a kinder relationship with yourself.',
    upvotes: 67,
    replies: 24,
    createdAt: '2 days ago',
    category: 'mental-health',
    tags: ['Self-Care', 'Mindfulness', 'Support']
  };

  const getThreadData = (threadId: string) => {
    const threads = {
      '1': {
        id: 1,
    title: 'How do you practice self-compassion during difficult times?',
    author: 'MindfulSoul',
        authorAvatar: '🌸',
        authorLevel: 'Community Helper',
        authorJoined: 'Joined 8 months ago',
        content: 'I\'ve been struggling with being kind to myself lately. What practices help you show yourself the same compassion you\'d give a friend?\n\nI notice I\'m much harder on myself than I would ever be on someone I care about. When friends make mistakes, I remind them that they\'re human and that growth takes time. But when I make mistakes, my inner voice becomes critical and harsh.\n\nI\'m curious about your experiences and any gentle practices that have helped you develop a kinder relationship with yourself.',
    upvotes: 67,
        replies: 24,
        createdAt: '2 days ago',
        category: 'mental-health',
        tags: ['Self-Care', 'Mindfulness', 'Support'],
        comments: [
          {
            id: 1,
            author: 'GentleWisdom',
            authorAvatar: '🕊️',
            authorLevel: 'Frequent Contributor',
            content: 'I\'ve found that talking to myself as I would to my best friend has been transformative. When I catch myself being self-critical, I pause and ask: "What would I say to my friend in this situation?"',
            upvotes: 23,
            createdAt: '1 day ago',
            replies: [
              {
                id: '1-1',
                author: 'MindfulSoul',
                authorAvatar: '🌸',
                authorLevel: 'Community Helper',
                content: 'This is such a beautiful approach! I\'m going to try this today. Thank you for sharing.',
                upvotes: 8,
                createdAt: '18 hours ago',
                replies: [
                  {
                    id: '1-1-1',
                    author: 'GentleWisdom',
                    authorAvatar: '🕊️',
                    authorLevel: 'Frequent Contributor',
                    content: 'You\'re so welcome! Remember to be patient with yourself as you practice this. It takes time to rewire those inner voices.',
                    upvotes: 3,
                    createdAt: '16 hours ago',
                    replies: []
                  }
                ]
              },
              {
                id: '1-2',
                author: 'CompassionateHeart',
                authorAvatar: '💚',
                authorLevel: 'New Member',
                content: 'I love this perspective. It\'s amazing how much easier it is to be kind to others than to ourselves.',
                upvotes: 5,
                createdAt: '12 hours ago',
                replies: [
                  {
                    id: '1-2-1',
                    author: 'WiseSoul',
                    authorAvatar: '🦋',
                    authorLevel: 'Regular Contributor',
                    content: 'Exactly! We have this double standard where we expect perfection from ourselves but offer grace to everyone else.',
                    upvotes: 7,
                    createdAt: '10 hours ago',
                    replies: [
                      {
                        id: '1-2-1-1',
                        author: 'CompassionateHeart',
                        authorAvatar: '💚',
                        authorLevel: 'New Member',
                        content: 'Yes! It\'s like we think being harsh will motivate us, but it usually just makes us feel worse.',
                        upvotes: 2,
                        createdAt: '8 hours ago',
                        replies: []
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 2,
            author: 'ThoughtfulJourney',
            authorAvatar: '📝',
            authorLevel: 'Regular Contributor',
            content: 'Journaling has been my sanctuary. I write myself letters of encouragement, especially after difficult days. Reading them later reminds me of my own capacity for growth and resilience.',
            upvotes: 19,
            createdAt: '1 day ago',
            replies: [
              {
                id: '2-1',
                author: 'CreativeSpirit',
                authorAvatar: '✨',
                authorLevel: 'New Member',
                content: 'What a beautiful practice! Do you have any prompts you use when you\'re feeling stuck?',
                upvotes: 6,
                createdAt: '20 hours ago',
                replies: [
                  {
                    id: '2-1-1',
                    author: 'ThoughtfulJourney',
                    authorAvatar: '📝',
                    authorLevel: 'Regular Contributor',
                    content: 'I often start with "Dear friend," and then write what I would tell my best friend in my situation. It immediately shifts my tone.',
                    upvotes: 9,
                    createdAt: '18 hours ago',
                    replies: []
                  }
                ]
              }
            ]
          },
          {
            id: 3,
            author: 'ZenMoments',
            authorAvatar: '🧘',
            authorLevel: 'Meditation Guide',
            content: 'The loving-kindness meditation specifically focusing on yourself can be powerful. Starting with "May I be happy, may I be at peace, may I be free from suffering" and really meaning it.',
            upvotes: 31,
            createdAt: '20 hours ago',
            replies: [
              {
                id: '3-1',
                author: 'SeekerOfPeace',
                authorAvatar: '🌅',
                authorLevel: 'New Member',
                content: 'I\'ve never tried this before. Do you have any recommendations for guided versions?',
                upvotes: 4,
                createdAt: '15 hours ago',
                replies: []
              }
            ]
          }
        ]
      },
      '2': {
        id: 2,
        title: 'The paradox of choice in modern life - thoughts?',
        author: 'DeepThinker',
        authorAvatar: '🤔',
        authorLevel: 'Philosophy Enthusiast',
        authorJoined: 'Joined 1 year ago',
        content: 'Barry Schwartz\'s ideas about how too many options can lead to anxiety and paralysis. How do you navigate decision-making in our choice-rich world?\n\nI find myself overwhelmed by simple decisions like what to watch on Netflix or which restaurant to order from. The abundance of choices, meant to give us freedom, sometimes feels like a burden.',
        upvotes: 43,
        replies: 18,
        createdAt: '4 hours ago',
        category: 'philosophy',
        tags: ['Philosophy', 'Psychology', 'Modern Life'],
        comments: [
          {
            id: 1,
            author: 'MinimalistMind',
            authorAvatar: '🎯',
            authorLevel: 'Regular Contributor',
            content: 'I\'ve started using the "good enough" principle. Instead of trying to find the perfect choice, I look for the first option that meets my basic needs.',
            upvotes: 15,
            createdAt: '3 hours ago',
            replies: []
          }
        ]
      },
      '3': {
        id: 3,
        title: 'Learning languages as an adult - motivation tips?',
        author: 'PolyglotDreamer',
        authorAvatar: '📚',
        authorLevel: 'Language Learner',
        authorJoined: 'Joined 6 months ago',
        content: 'I\'m 28 and learning Georgian. Some days I feel motivated, others I want to give up. How do you maintain consistency in language learning?\n\nThe grammar is so different from English, and I feel like I\'m making slow progress despite studying daily.',
        upvotes: 89,
        replies: 31,
        createdAt: '6 hours ago',
        category: 'education',
        tags: ['Languages', 'Learning', 'Motivation'],
        comments: [
          {
            id: 1,
            author: 'LanguageLover',
            authorAvatar: '🌍',
            authorLevel: 'Polyglot',
            content: 'Georgian is beautiful but challenging! I found that connecting with native speakers through language exchange really helped maintain motivation.',
            upvotes: 22,
            createdAt: '5 hours ago',
            replies: []
          }
        ]
      }
    };
    return threads[threadId as keyof typeof threads] || threads['1'];
  };

  const threadData = getThreadData(id || '1');
  
  // Sort comments based on selected order
  const sortComments = (commentsToSort: Array<{ createdAt: string; upvotes: number; [key: string]: unknown }>) => {
    return [...commentsToSort].sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return b.upvotes - a.upvotes;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  const comments = sortComments(threadData.comments);

  const handleLikeThread = () => {
    setThreadLiked(!threadLiked);
  };

  const handleLikeComment = (commentId: number) => {
    const newLikedComments = new Set(likedComments);
    if (newLikedComments.has(commentId)) {
      newLikedComments.delete(commentId);
    } else {
      newLikedComments.add(commentId);
    }
    setLikedComments(newLikedComments);
  };

  const toggleCollapse = (commentId: number) => {
    const newCollapsed = new Set(collapsedComments);
    if (newCollapsed.has(commentId)) {
      newCollapsed.delete(commentId);
    } else {
      newCollapsed.add(commentId);
    }
    setCollapsedComments(newCollapsed);
  };

  const handleReply = (commentId?: number) => {
    if (reply.trim()) {
      // Handle posting reply
      console.log('Posting reply:', reply, commentId ? `to comment ${commentId}` : 'to thread');
      setReply('');
      setReplyingTo(null);
    }
  };

  const countReplies = (comment: any): number => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    let total = comment.replies.length;
    comment.replies.forEach((reply: any) => {
      total += countReplies(reply);
    });
    return total;
  };

  const toggleShowAllReplies = (commentId: string) => {
    const newShowAllReplies = new Set(showAllReplies);
    if (newShowAllReplies.has(commentId)) {
      newShowAllReplies.delete(commentId);
    } else {
      newShowAllReplies.add(commentId);
    }
    setShowAllReplies(newShowAllReplies);
  };

  const UserInfo = ({ user, level, timeStamp, showJoinDate = false }: { 
    user: string; 
    level: string; 
    timeStamp: string; 
    showJoinDate?: boolean;
  }) => (
    <div className="flex items-start gap-3">
      <div className="text-2xl">{user === 'MindfulSoul' ? '🌸' : user === 'GentleWisdom' ? '🕊️' : user === 'ThoughtfulJourney' ? '📝' : user === 'ZenMoments' ? '🧘' : user === 'CompassionateHeart' ? '💚' : '🌅'}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{user}</span>
          <Badge variant="outline" className="text-xs px-2 py-0">
            {level}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>{timeStamp}</span>
          </div>
          {showJoinDate && (
            <div className="flex items-center gap-1">
              <Calendar size={10} />
              <span>Joined 8 months ago</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const Comment = ({ comment, depth = 0 }: { comment: { id: number; author: string; authorLevel: string; createdAt: string; content: string; upvotes: number; replies?: unknown[]; [key: string]: unknown }; depth?: number }) => {
    const isCollapsed = collapsedComments.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const totalReplies = countReplies(comment);
    const marginLeft = Math.min(depth * 16, 48); // Max indent of 48px (3 levels)
    const commentKey = `${comment.id}`;
    const showingAllReplies = showAllReplies.has(commentKey);
    const maxVisibleReplies = 2; // Show only first 2 replies by default
    const visibleReplies = showingAllReplies ? comment.replies : comment.replies?.slice(0, maxVisibleReplies) || [];
    const hasMoreReplies = hasReplies && comment.replies.length > maxVisibleReplies;

    return (
      <div style={{ marginLeft: `${marginLeft}px` }}>
        <Card className={`${depth > 0 ? 'border-l-2 border-primary/20' : ''} transition-all duration-300 ease-in-out`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <UserInfo 
                user={comment.author} 
                level={comment.authorLevel}
                timeStamp={comment.createdAt}
              />
              
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCollapse(comment.id)}
                  className="h-auto p-1 text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  {isCollapsed ? (
                    <Plus size={14} />
                  ) : (
                    <Minus size={14} />
                  )}
                  <span className="ml-1 text-xs">{totalReplies}</span>
                </Button>
              )}
            </div>
            
            <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-none opacity-100'}`}>
              <p className="text-sm mt-3 mb-3 leading-relaxed">{comment.content}</p>
              
              <div className="flex items-center gap-4 text-xs">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleLikeComment(comment.id)}
                  className={`h-auto p-1 transition-colors duration-200 ${likedComments.has(comment.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
                >
                  <Heart size={14} className={likedComments.has(comment.id) ? 'fill-current' : ''} />
                  <span className="ml-1">{comment.upvotes + (likedComments.has(comment.id) ? 1 : 0)}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="h-auto p-1 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <Reply size={14} />
                  <span className="ml-1">Reply</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <MoreHorizontal size={14} />
                </Button>
              </div>

              {replyingTo === comment.id && (
                <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Textarea
                    id={`reply-${comment.id}`}
                    name={`reply-${comment.id}`}
                    placeholder={`Reply to ${comment.author}...`}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    autoComplete="off"
                    className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleReply(comment.id)}
                      disabled={!reply.trim()}
                      className="transition-all duration-200"
                    >
                      Post Reply
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReply('');
                      }}
                      className="transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Nested Replies */}
        {hasReplies && !isCollapsed && (
          <div className="space-y-3 mt-3">
            {/* Show All/Less Button for Replies */}
            {hasMoreReplies && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleShowAllReplies(commentKey)}
                  className="h-auto px-3 py-1 text-xs text-primary hover:text-primary-dark transition-colors duration-200 bg-primary/5 hover:bg-primary/10 rounded-full"
                >
                  {showingAllReplies ? (
                    <>
                      <ChevronUp size={12} className="mr-1" />
                      Show less replies
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} className="mr-1" />
                      Show {comment.replies.length - maxVisibleReplies} more replies
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Render Visible Replies */}
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                              {visibleReplies.map((reply: { id: number; author: string; authorLevel: string; createdAt: string; content: string; upvotes: number; replies?: unknown[]; [key: string]: unknown }) => (
                <Comment key={reply.id} comment={reply} depth={depth + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen bg-background overflow-hidden">
      <TopBar 
        title="Deep Discussions" 
        showBack={true}
        onBack={() => navigate('/forum')}
      />
      
      <div className="h-screen overflow-y-auto px-4 py-6 max-w-md mx-auto space-y-6 pt-16 pb-20">
        {/* Thread Post */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <UserInfo 
                user={threadData.author}
                level={threadData.authorLevel}
                timeStamp={threadData.createdAt}
                showJoinDate={true}
              />
            </div>

            <h1 className="text-xl font-bold mb-4 leading-tight">{threadData.title}</h1>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {threadData.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="prose prose-sm max-w-none text-sm leading-relaxed mb-4">
              {threadData.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0">{paragraph}</p>
              ))}
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLikeThread}
                className={`transition-colors duration-200 ${threadLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
              >
                <Heart size={16} className={threadLiked ? 'fill-current' : ''} />
                <span className="ml-1">{threadData.upvotes + (threadLiked ? 1 : 0)}</span>
              </Button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageCircle size={16} />
                <span>{comments.length} replies</span>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                <Share size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comment Form - Moved to top after post */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" />
              Share your thoughts
            </h4>
            <div className="space-y-3">
              <Textarea
                id="mainComment"
                name="mainComment"
                placeholder="Share your thoughtful response..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                autoComplete="off"
                className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  onClick={() => handleReply()}
                  disabled={!reply.trim()}
                  className="flex-1 transition-all duration-200"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="space-y-4">
          {/* Comments title on first row */}
          <div>
            <h3 className="font-semibold text-lg">Comments ({comments.length})</h3>
          </div>
          
          {/* Sort controls and show all toggle on second row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Sort/Filter Controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder('newest')}
                className={`h-7 px-2 text-xs transition-colors duration-200 ${
                  sortOrder === 'newest' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <SortDesc size={12} className="mr-1" />
                Newest
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder('oldest')}
                className={`h-7 px-2 text-xs transition-colors duration-200 ${
                  sortOrder === 'oldest' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <SortAsc size={12} className="mr-1" />
                Oldest
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder('popular')}
                className={`h-7 px-2 text-xs transition-colors duration-200 ${
                  sortOrder === 'popular' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Heart size={12} className="mr-1" />
                Popular
              </Button>
            </div>

            {/* Show All Toggle */}
            {comments.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllComments(!showAllComments)}
                className="h-7 px-2 text-xs text-primary hover:text-primary-dark transition-colors duration-200 bg-primary/5 hover:bg-primary/10 rounded-full"
              >
                {showAllComments ? (
                  <>
                    <ChevronUp size={12} className="mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} className="mr-1" />
                    All {comments.length}
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            {(showAllComments ? comments : comments.slice(0, 3)).map((comment) => (
              <Comment key={String(comment.id)} comment={comment as any} depth={0} />
            ))}
          </div>

          {/* Show more comments button at bottom if needed */}
          {!showAllComments && comments.length > 3 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllComments(true)}
                className="h-auto px-4 py-2 text-sm text-primary hover:text-primary-dark transition-colors duration-200 bg-primary/5 hover:bg-primary/10 rounded-full"
              >
                <ChevronDown size={14} className="mr-2" />
                Show {comments.length - 3} more comments
              </Button>
            </div>
          )}
        </div>

                {/* Floating Comment Button - for mobile/when scrolled */}
        <div className="fixed bottom-24 right-4 z-50">
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            title="Scroll to comment form"
          >
            <MessageSquare size={20} />
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ForumThread;
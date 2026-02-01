import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share, MoreHorizontal, Reply, Calendar, Clock, ChevronDown, ChevronUp, Minus, Plus, SortAsc, SortDesc, MessageSquare } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { forumApi, type ForumPostDetail, type ForumCommentNode } from '@/services/api';

function formatRelativeTime(iso: string): string {
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

const ForumThread = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set());
  const [showAllComments, setShowAllComments] = useState(false);
  const [visibleReplyCount, setVisibleReplyCount] = useState<Record<string, number>>({});
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [submittingComment, setSubmittingComment] = useState(false);

  // When post loads, collapse all reply sections (only main comments visible; replies hidden by default)
  useEffect(() => {
    if (!post?.comments) return;
    const collectIdsWithReplies = (list: ForumCommentNode[]): string[] => {
      const ids: string[] = [];
      list.forEach((c) => {
        if (c.replies && c.replies.length > 0) {
          ids.push(c.id);
          ids.push(...collectIdsWithReplies(c.replies));
        }
      });
      return ids;
    };
    setCollapsedComments(new Set(collectIdsWithReplies(post.comments)));
  }, [post?.id]);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await forumApi.getPost(id);
      if (res.success && res.post) setPost(res.post);
      else setError('Post not found');
    } catch {
      setError('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const sortCommentsList = (commentsToSort: ForumCommentNode[]): ForumCommentNode[] => {
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

  const comments = post ? sortCommentsList(post.comments) : [];

  const handleLikeThread = async () => {
    if (!id || !post) return;
    try {
      const res = await forumApi.reactPost(id);
      if (res.success) setPost(prev => prev ? { ...prev, userLiked: res.liked ?? !prev.userLiked, upvotes: res.count ?? prev.upvotes } : null);
    } catch {}
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await forumApi.reactComment(commentId);
      if (res.success && post) {
        const updateComment = (list: ForumCommentNode[]): ForumCommentNode[] =>
          list.map(c => c.id === commentId
            ? { ...c, userLiked: res.liked ?? !c.userLiked, upvotes: res.count ?? c.upvotes }
            : { ...c, replies: updateComment(c.replies || []) }
          );
        setPost(prev => prev ? { ...prev, comments: updateComment(prev.comments) } : null);
      }
    } catch {}
  };

  const toggleCollapse = (commentId: string) => {
    setCollapsedComments(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const handleReply = async (commentId?: string, text?: string): Promise<boolean> => {
    const body = text !== undefined ? text.trim() : reply.trim();
    if (!body || !id) return false;
    setSubmittingComment(true);
    try {
      const res = await forumApi.addComment(id, body, commentId);
      if (res.success) {
        setReply('');
        setReplyingTo(null);
        fetchPost();
        return true;
      }
      return false;
    } finally {
      setSubmittingComment(false);
    }
  };

  const countReplies = (comment: ForumCommentNode): number => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    let total = comment.replies.length;
    comment.replies.forEach((r) => { total += countReplies(r); });
    return total;
  };

  const countAllComments = (list: ForumCommentNode[]): number => {
    return list.reduce((sum, c) => sum + 1 + countAllComments(c.replies || []), 0);
  };

  const showMoreReplies = (commentId: string) => {
    setVisibleReplyCount((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] ?? 2) + 4,
    }));
  };

  const showLessReplies = (commentId: string) => {
    setVisibleReplyCount((prev) => ({ ...prev, [commentId]: 2 }));
  };

  const UserInfo = ({ user, level, timeStamp, avatar, showJoinDate = false }: { 
    user: string; 
    level: string; 
    timeStamp: string;
    avatar?: string;
    showJoinDate?: boolean;
  }) => (
    <div className="flex items-start gap-3">
      <div className="text-2xl">{avatar || '💬'}</div>
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

  const Comment = ({ comment, depth = 0 }: { comment: ForumCommentNode; depth?: number }) => {
    const [replyDraft, setReplyDraft] = useState('');
    const isCollapsed = collapsedComments.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const totalReplies = countReplies(comment);
    const marginLeft = Math.min(depth * 16, 48);
    const commentKey = comment.id;
    const visibleCount = visibleReplyCount[commentKey] ?? 2;
    const visibleReplies = comment.replies?.slice(0, visibleCount) || [];
    const hasMoreReplies = hasReplies && comment.replies!.length > visibleCount;
    const isReplying = replyingTo === comment.id;

    return (
      <div style={{ marginLeft: `${marginLeft}px` }}>
        <Card className={`${depth > 0 ? 'border-l-2 border-primary/20' : ''} transition-all duration-300 ease-in-out`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <UserInfo 
                user={comment.author} 
                level={comment.authorLevel || 'Member'}
                timeStamp={formatRelativeTime(comment.createdAt)}
                avatar={comment.authorAvatar}
              />
              
              {hasReplies && !isReplying && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCollapse(comment.id)}
                  className="h-auto p-1 text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  {isCollapsed ? <Plus size={14} /> : <Minus size={14} />}
                  <span className="ml-1 text-xs">{totalReplies}</span>
                </Button>
              )}
            </div>
            
            {/* Comment content and actions always visible */}
            <p className="text-sm mt-3 mb-3 leading-relaxed">{comment.content}</p>
            
            <div className="flex items-center gap-4 text-xs">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleLikeComment(comment.id)}
                className={`h-auto p-1 transition-colors duration-200 ${comment.userLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
              >
                <Heart size={14} className={comment.userLiked ? 'fill-current' : ''} />
                <span className="ml-1">{comment.upvotes}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                className="h-auto p-1 text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <Reply size={14} />
                <span className="ml-1">Reply</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground hover:text-foreground transition-colors duration-200">
                <MoreHorizontal size={14} />
              </Button>
            </div>

            {isReplying && (
              <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                <Textarea
                  id={`reply-${comment.id}`}
                  placeholder={`Reply to ${comment.author}...`}
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  autoComplete="off"
                  className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleReply(comment.id, replyDraft).then((ok) => ok && setReplyDraft(''))} disabled={!replyDraft.trim() || submittingComment}>
                    {submittingComment ? 'Posting...' : 'Post Reply'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setReplyingTo(null); setReplyDraft(''); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {hasReplies && !isCollapsed && (
          <div className="space-y-3 mt-3">
            <div className="space-y-3">
              {visibleReplies.map((r) => (
                <Comment key={r.id} comment={r} depth={depth + 1} />
              ))}
            </div>
            {(hasMoreReplies || visibleCount > 2) && (
              <div className="flex justify-center pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (visibleCount >= comment.replies!.length ? showLessReplies(commentKey) : showMoreReplies(commentKey))}
                  className="h-auto px-3 py-1 text-xs text-primary hover:bg-primary/10 rounded-full"
                >
                  {visibleCount >= comment.replies!.length ? (
                    <><ChevronUp size={12} className="mr-1" />Show less</>
                  ) : (
                    <><ChevronDown size={12} className="mr-1" />See more ({comment.replies!.length - visibleCount} more)</>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar title="Deep Discussions" showBack onBack={() => navigate('/forum')} />
        <div className="px-4 py-6 max-w-md mx-auto content-safe-top pb-24 flex items-center justify-center min-h-[40vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar title="Deep Discussions" showBack onBack={() => navigate('/forum')} />
        <div className="px-4 py-6 max-w-md mx-auto content-safe-top pb-24 flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <p className="text-muted-foreground">{error || 'Post not found'}</p>
          <Button variant="outline" onClick={() => navigate('/forum')}>Back to Forum</Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar 
        title="Deep Discussions" 
        showBack={true}
        onBack={() => navigate('/forum')}
      />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6 content-safe-top pb-24">
        {/* Thread Post */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <UserInfo 
                user={post.author}
                level={post.authorLevel || 'Member'}
                timeStamp={formatRelativeTime(post.createdAt)}
                avatar={post.authorAvatar}
                showJoinDate={false}
              />
            </div>

            <h1 className="text-xl font-bold mb-4 leading-tight">{post.title}</h1>
            
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="prose prose-sm max-w-none text-sm leading-relaxed mb-4">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0">{paragraph}</p>
              ))}
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLikeThread}
                className={`transition-colors duration-200 ${post.userLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
              >
                <Heart size={16} className={post.userLiked ? 'fill-current' : ''} />
                <span className="ml-1">{post.upvotes}</span>
              </Button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageCircle size={16} />
                <span>{post.replyCount ?? countAllComments(comments)} comments</span>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                <Share size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comment Form */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" />
              Share your thoughts
            </h4>
            <div className="space-y-3">
              <Textarea
                id="mainComment"
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
                  disabled={!reply.trim() || submittingComment}
                  className="flex-1 transition-all duration-200"
                >
                  <MessageCircle size={16} className="mr-2" />
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="space-y-4">
          {/* Comments title on first row */}
          <div>
            <h3 className="font-semibold text-lg">Comments ({post.replyCount ?? countAllComments(comments)})</h3>
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
                    All {(post?.replyCount ?? countAllComments(comments))}
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            {(showAllComments ? comments : comments.slice(0, 3)).map((comment) => (
              <Comment key={comment.id} comment={comment} depth={0} />
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
        <div className="fixed bottom-0 right-4 z-50">
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
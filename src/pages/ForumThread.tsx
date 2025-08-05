import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Heart, MessageCircle, Share } from 'lucide-react';
import { useState } from 'react';

const ForumThread = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reply, setReply] = useState('');

  const thread = {
    title: 'How do you practice self-compassion during difficult times?',
    author: 'MindfulSoul',
    content: 'I\'ve been struggling with being kind to myself lately. What practices help you show yourself the same compassion you\'d give a friend?',
    upvotes: 67,
    replies: 24
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <Button variant="ghost" onClick={() => navigate('/forum')}>
          <ArrowLeft size={20} />
          <span className="ml-2">Back to Forum</span>
        </Button>
      </div>
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-xl font-bold mb-4">{thread.title}</h1>
            <p className="text-muted-foreground mb-4">{thread.content}</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Heart size={16} />
                <span className="ml-1">{thread.upvotes}</span>
              </Button>
              <Badge variant="secondary">{thread.author}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Textarea
            placeholder="Share your thoughtful response..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <Button variant="cozy" className="w-full">
            Post Reply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForumThread;
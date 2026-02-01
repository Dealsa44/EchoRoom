import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { forumApi } from '@/services/api';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateThreadModal = ({ isOpen, onClose, onSuccess }: CreateThreadModalProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'mental-health', label: 'Mental Health', icon: '💚' },
    { value: 'philosophy', label: 'Philosophy', icon: '🤔' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'culture', label: 'Culture', icon: '🌍' },
    { value: 'wellness', label: 'Wellness', icon: '🧘' },
    { value: 'creativity', label: 'Creativity', icon: '🎨' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.title.trim() || !formData.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await forumApi.createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: []
      });
      if (res.success && res.post) {
        setFormData({ title: '', content: '', category: '' });
        onClose();
        onSuccess?.();
        navigate(`/forum/thread/${res.post.id}`);
      } else {
        toast({ title: 'Error', description: res.message || 'Failed to create discussion', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create discussion', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="w-[calc(100vw-2rem)] max-w-sm mx-auto rounded-xl bg-background border shadow-xl"
        onInteractOutside={(e) => {
          // Prevent accidental closing when interacting with select dropdown
          const target = e.target as Element;
          if (target?.closest('[data-radix-select-content]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
          <DialogDescription>
            Share your thoughts and start a meaningful conversation in our community.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thread-title">Thread Title</Label>
            <Input
              id="thread-title"
              name="threadTitle"
              placeholder="What would you like to discuss?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              name="category"
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              required
            >
              <SelectTrigger className="w-full focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent className="z-[10000]" position="popper" sideOffset={4}>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value} className="cursor-pointer hover:bg-accent focus:bg-accent">
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Thoughts</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Share your thoughts, questions, or insights..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              autoComplete="off"
              className="min-h-24"
              required
            />
            <p className="text-xs text-muted-foreground">
              Remember: This is a safe space for thoughtful, respectful discussion.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="cozy" 
              className="flex-1"
              disabled={!formData.title.trim() || !formData.content.trim() || !formData.category || submitting}
            >
              {submitting ? 'Posting...' : 'Post Discussion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadModal;
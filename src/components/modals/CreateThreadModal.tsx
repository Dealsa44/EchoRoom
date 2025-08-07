import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateThreadModal = ({ isOpen, onClose }: CreateThreadModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });

  const categories = [
    { value: 'mental-health', label: 'Mental Health', icon: '💚' },
    { value: 'philosophy', label: 'Philosophy', icon: '🤔' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'culture', label: 'Culture', icon: '🌍' },
    { value: 'wellness', label: 'Wellness', icon: '🧘' },
    { value: 'creativity', label: 'Creativity', icon: '🎨' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that category is selected
    if (!formData.category) {
      toast({
        title: "Category Required",
        description: "Please select a category for your discussion.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate thread creation
    const selectedCategory = categories.find(cat => cat.value === formData.category);
    toast({
      title: "Discussion Started!",
      description: `Your thread "${formData.title}" has been posted in ${selectedCategory?.label}.`,
    });
    
    // Reset form and close modal
    setFormData({
      title: '',
      content: '',
      category: ''
    });
    
    onClose();
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
              disabled={!formData.title.trim() || !formData.content.trim() || !formData.category}
            >
              Post Discussion
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadModal;
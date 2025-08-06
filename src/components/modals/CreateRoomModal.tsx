import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRoomModal = ({ isOpen, onClose }: CreateRoomModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    description: '',
    isPrivate: false,
    allowAnonymous: true
  });

  const topics = [
    'Philosophy & Deep Thoughts',
    'Books & Literature',
    'Science & Technology',
    'Arts & Culture',
    'Wellness & Mental Health',
    'Language Learning',
    'Creative Writing',
    'Music & Sound',
    'Nature & Environment',
    'Travel & Cultures'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate room creation
    toast({
      title: "Room Created!",
      description: `"${formData.name}" has been created successfully.`,
    });
    
    // Reset form and close modal
    setFormData({
      name: '',
      topic: '',
      description: '',
      isPrivate: false,
      allowAnonymous: true
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Create a New Room</DialogTitle>
          <DialogDescription>
            Set up a new chat room for meaningful conversations and discussions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              name="roomName"
              placeholder="e.g., Midnight Philosophers"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic Category</Label>
            <Select name="topic" value={formData.topic} onValueChange={(value) => setFormData(prev => ({ ...prev, topic: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map(topic => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What will you discuss in this room?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-20"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="private-room">Private Room</Label>
                <p className="text-xs text-muted-foreground">Only invited members can join</p>
              </div>
              <Switch
                id="private-room"
                checked={formData.isPrivate}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="anonymous-chat">Allow Anonymous Chat</Label>
                <p className="text-xs text-muted-foreground">Members can chat without showing names</p>
              </div>
              <Switch
                id="anonymous-chat"
                checked={formData.allowAnonymous}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowAnonymous: checked }))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="cozy" className="flex-1">
              Create Room
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomModal;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { chatApi } from '@/services/api';
import { useApp } from '@/hooks/useApp';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

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
  'Travel & Cultures',
];

const CreateRoomModal = ({ isOpen, onClose, onCreated }: CreateRoomModalProps) => {
  const navigate = useNavigate();
  const { joinRoom, refreshJoinedRooms } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Room name is required', variant: 'destructive' });
      return;
    }
    if (!formData.topic.trim()) {
      toast({ title: 'Please choose a topic', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await chatApi.createRoom({
        title: formData.name.trim(),
        category: formData.topic.trim(),
        description: formData.description.trim() || undefined,
      });
      if (res.success && res.room) {
        setFormData({ name: '', topic: '', description: '' });
        onClose();
        refreshJoinedRooms();
        onCreated?.();
        navigate(`/chat-room/${res.room.id}`, { state: { from: 'chat-rooms' } });
      } else {
        toast({ title: res.message || 'Failed to create room', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to create room', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm mx-auto rounded-xl">
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
              placeholder="e.g., Midnight Philosophers"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic Category</Label>
            <Select
              value={formData.topic}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, topic: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
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
              placeholder="What will you discuss in this room?"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              autoComplete="off"
              className="min-h-20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="cozy" className="flex-1" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomModal;

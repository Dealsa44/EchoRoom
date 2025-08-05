import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: 'thoughtful_soul',
    bio: 'Deep thinker, book lover, always learning'
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <Button variant="ghost" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
          <span className="ml-2">Back</span>
        </Button>
      </div>
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input value={formData.username} onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={formData.bio} onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} />
          </div>
          <Button variant="cozy" className="w-full" onClick={() => navigate('/profile')}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, toggleDarkMode, isDarkMode } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <Button variant="ghost" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
          <span className="ml-2">Back</span>
        </Button>
      </div>
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <Select value={language} onValueChange={(value: 'en' | 'ka') => setLanguage(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ka">Georgian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={toggleDarkMode} className="w-full">
              {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
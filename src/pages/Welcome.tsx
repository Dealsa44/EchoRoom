import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { language, setLanguage, isAuthenticated } = useApp();
  const [currentSlogan, setCurrentSlogan] = useState(0);

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const slogans = [
    "Conversations begin with thoughts – not just selfies.",
    "Even in silence, someone is waiting.",
    "Where your interests become your voice."
  ];

  const translations = {
    en: {
      slogans: slogans,
      signIn: "Sign In",
      createAccount: "Create Account",
      continueAsGuest: "Continue as Guest",
      language: "Language"
    },
    ka: {
      slogans: [
        "საუბრები იწყება აზრებით – არა უბრალოდ სელფებით.",
        "სიჩუმეშიც კი ვინმე გელოდება.",
        "სადაც შენი ინტერესები ხდება შენი ხმა."
      ],
      signIn: "შესვლა",
      createAccount: "ანგარიშის შექმნა",
      continueAsGuest: "სტუმრად გაგრძელება",
      language: "ენა"
    }
  };

  const t = translations[language];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % t.slogans.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [t.slogans.length]);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
            <span className="text-2xl font-bold text-primary-foreground">ER</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">EchoRoom</h1>
        </div>

        {/* Slogan Carousel */}
        <div className="h-16 flex items-center justify-center">
          <p 
            key={currentSlogan}
            className="text-center text-muted-foreground italic animate-in fade-in duration-1000 px-4"
          >
            "{t.slogans[currentSlogan]}"
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">{t.language}:</span>
          <Select value={language} onValueChange={(value: 'en' | 'ka') => setLanguage(value)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="ka">KA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            variant="cozy"
            size="lg"
            onClick={() => navigate('/login')}
            className="w-full"
          >
            {t.signIn}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/register')}
            className="w-full"
          >
            {t.createAccount}
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate('/login')}
            className="w-full text-muted-foreground"
          >
            {t.continueAsGuest}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
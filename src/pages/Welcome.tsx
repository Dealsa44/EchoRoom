import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/hooks/useApp';

const Welcome = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
  const [currentSlogan, setCurrentSlogan] = useState(0);

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/match');
    }
  }, [isAuthenticated, navigate]);

  const slogans = [
    "Conversations begin with thoughts – not just selfies.",
    "Even in silence, someone is waiting.",
    "Where your interests become your voice."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slogans.length]);

  return (
    <div className="min-h-screen app-gradient-bg flex flex-col items-center justify-center p-6 relative overflow-hidden safe-top">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-gradient-secondary rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-tertiary rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10 animate-scale-in">
        {/* Title */}
        <div className="w-full max-w-sm mx-auto">
          <div className="glass-strong rounded-2xl p-6 shadow-large border border-border-soft/50">
            <h1 className="text-4xl font-bold gradient-text-hero mb-3 animate-fade-in drop-shadow-lg tracking-wide text-center">EchoRoom</h1>
            <div className="w-20 h-0.5 bg-gradient-primary rounded-full mx-auto shadow-glow-primary" />
          </div>
        </div>

        {/* Slogan Carousel */}
        <div className="w-full max-w-sm mx-auto">
          <div className="glass rounded-xl p-5 shadow-medium border border-border-soft/30">
            <p 
              key={currentSlogan}
              className="text-center text-sm text-foreground italic animate-fade-in leading-relaxed font-medium"
            >
              "{slogans[currentSlogan]}"
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 w-full max-w-sm mx-auto">
          <Button
            variant="gradient"
            size="lg"
            className="w-full h-12 animate-slide-up shadow-glow-primary hover:shadow-glow-primary/70 hover:scale-105 transition-all duration-300 font-semibold text-base rounded-xl"
            onClick={() => navigate('/login')}
            style={{ animationDelay: '0.1s' }}
          >
            <span className="flex items-center gap-2">
              <span>🔑</span>
              Sign In
            </span>
          </Button>
          
          <Button
            variant="glass"
            size="lg"
            className="w-full h-12 animate-slide-up hover:scale-105 transition-all duration-300 font-semibold text-base rounded-xl shadow-large"
            onClick={() => navigate('/register-new')}
            style={{ animationDelay: '0.2s' }}
          >
            <span className="flex items-center gap-2">
              <span>✨</span>
              Create Account
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
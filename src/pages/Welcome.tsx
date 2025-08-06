import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slogans.length]);

  return (
    <div className="min-h-screen mesh-gradient flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-gradient-secondary rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-accent rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10 animate-scale-in">
        {/* Title */}
        <div className="w-full max-w-sm mx-auto">
          <div className="glass rounded-2xl p-6 backdrop-blur-lg bg-gradient-to-br from-white/15 to-white/5 border border-white/25 shadow-2xl">
            <h1 className="text-4xl font-bold gradient-text-hero mb-3 animate-fade-in drop-shadow-2xl tracking-wide text-center">EchoRoom</h1>
            <div className="w-20 h-0.5 bg-gradient-primary rounded-full mx-auto opacity-90 shadow-glow-primary" />
          </div>
        </div>

        {/* Slogan Carousel */}
        <div className="w-full max-w-sm mx-auto">
          <div className="glass rounded-xl p-5 backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-xl">
            <p 
              key={currentSlogan}
              className="text-center text-sm text-foreground/95 italic animate-fade-in leading-relaxed font-medium drop-shadow-lg"
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
            className="w-full h-12 animate-slide-up backdrop-blur-lg bg-gradient-to-br from-white/20 to-white/10 border border-white/30 hover:from-white/30 hover:to-white/15 hover:scale-105 transition-all duration-300 font-semibold text-base rounded-xl shadow-xl"
            onClick={() => navigate('/register')}
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
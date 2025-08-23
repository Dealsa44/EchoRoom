import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { toast } from '@/hooks/use-toast';
import { loginUser, LoginData } from '@/lib/auth';

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData: LoginData = {
        email: formData.email,
        password: formData.password,
      };

      const result = await loginUser(loginData);

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        // Welcome back - toast removed per user request
        navigate('/match');
      } else {
        // Login failed - toast removed per user request
      }
    } catch (error) {
      // Login error - toast removed per user request
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Password recovery - toast removed per user request
  };

  return (
            <div className="min-h-screen app-gradient-bg flex flex-col items-center justify-center p-6 relative overflow-hidden safe-top">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-32 left-12 w-28 h-28 bg-gradient-secondary rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-8 w-24 h-24 bg-gradient-primary rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-20 w-20 h-20 bg-gradient-tertiary rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-scale-in">
        {/* Back Button */}
        <Button
          variant="glass"
          onClick={() => navigate('/')}
          className="mb-8 shadow-medium hover:scale-105 transition-spring"
        >
          <ArrowLeft size={18} />
          <span className="ml-2 font-medium">Back</span>
        </Button>

        <Card className="shadow-large glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-pulse-soft">
              <span className="text-2xl font-bold text-primary-foreground">ER</span>
            </div>
            <CardTitle className="text-display-2 font-bold gradient-text-hero">Welcome Back</CardTitle>
            <p className="text-body-small text-muted-foreground mt-2">Sign in to your safe space for meaningful conversations</p>
          </CardHeader>
          
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-body font-medium">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email..."
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  autoComplete="email"
                  required
                  className="animate-slide-up"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-body font-medium">Password</Label>
                <div className="relative animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password..."
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    autoComplete="current-password"
                    required
                    className="pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-spring"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full shadow-glow-primary animate-slide-up"
                style={{ animationDelay: '0.5s' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <span className="font-semibold">Sign In</span>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleForgotPassword}
                className="w-full hover:scale-105 transition-spring animate-slide-up"
                style={{ animationDelay: '0.6s' }}
              >
                Forgot password?
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
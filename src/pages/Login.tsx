import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
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
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in to EchoRoom.",
        });
        navigate('/home');
      } else {
        toast({
          title: "Login Failed",
          description: result.errors?.join(', ') || "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password Recovery",
      description: "Password recovery instructions sent to your email.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 p-2"
        >
          <ArrowLeft size={20} />
          <span className="ml-2">Back</span>
        </Button>

        <Card className="shadow-medium">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <p className="text-muted-foreground">Sign in to your safe space</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                variant="cozy"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <Button
                type="button"
                variant="link"
                onClick={handleForgotPassword}
                className="w-full"
              >
                Forgot password?
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
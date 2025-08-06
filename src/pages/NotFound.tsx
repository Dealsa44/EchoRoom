import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/home' : '/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl mb-4">🔍</div>
          <CardTitle className="text-3xl font-bold">404</CardTitle>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The page <code className="bg-muted px-1 py-0.5 rounded text-xs">{location.pathname}</code> could not be found.
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button 
              onClick={handleGoHome}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              {isAuthenticated ? 'Home' : 'Welcome'}
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Looking for something specific?
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(isAuthenticated ? '/chat-rooms' : '/login')}
            >
              <Search className="h-4 w-4 mr-2" />
              {isAuthenticated ? 'Browse Rooms' : 'Sign In'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;

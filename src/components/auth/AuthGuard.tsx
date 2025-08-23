import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/hooks/useApp';

interface AuthGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

const AuthGuard = ({ children, fallbackPath = '/login' }: AuthGuardProps) => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard; 
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

interface PublicGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

const PublicGuard = ({ children, fallbackPath = '/match' }: PublicGuardProps) => {
  const { isAuthenticated, user } = useApp();

  if (isAuthenticated && user) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default PublicGuard; 
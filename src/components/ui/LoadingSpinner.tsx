import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-primary", sizeClasses[size], className)} />
  );
};

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export const LoadingState = ({ message = "Loading...", size = 'md', className, fullScreen = false }: LoadingStateProps) => {
  if (fullScreen) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[calc(100vh-80px)]", className)}>
        <LoadingSpinner size={size} />
        <p className="text-sm text-muted-foreground mt-3">{message}</p>
      </div>
    );
  }
  
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-8", className)}>
      <LoadingSpinner size={size} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};
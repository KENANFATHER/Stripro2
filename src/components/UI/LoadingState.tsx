import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  variant?: 'default' | 'overlay' | 'inline';
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'medium',
  className = '',
  variant = 'default',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  const variantClasses = {
    default: 'p-6 bg-white border border-sage-200 rounded-xl shadow-sm',
    overlay: 'p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md',
    inline: '',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${variantClasses[variant]} ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-coral-500 animate-spin`} />
      {message && (
        <p className={`mt-2 text-sage-600 ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingState;
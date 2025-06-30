import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'default' | 'inline' | 'subtle';
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'p-6 bg-red-50 border border-red-200 rounded-xl',
    inline: 'p-4 bg-red-50 border border-red-200 rounded-lg',
    subtle: 'p-4 bg-white border border-red-100 rounded-lg',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 flex items-center space-x-1 text-sm font-medium text-red-700 hover:text-red-800"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
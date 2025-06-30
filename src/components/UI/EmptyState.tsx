import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'card' | 'subtle';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action,
  className = '',
  size = 'medium',
  variant = 'default',
}) => {
  const sizeClasses = {
    small: 'p-4 max-w-sm',
    medium: 'p-6 sm:p-8 max-w-md',
    large: 'p-8 sm:p-12 max-w-lg',
  };

  const variantClasses = {
    default: 'bg-white border border-sage-200 rounded-xl shadow-sm',
    card: 'bg-white border border-sage-200 rounded-xl shadow-sm',
    subtle: 'bg-sage-50 border border-sage-100 rounded-lg',
  };

  const iconSizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {Icon && (
        <div className={`${iconSizeClasses[size]} text-sage-400 mb-4`}>
          <Icon strokeWidth={1.5} />
        </div>
      )}
      <h3 className={`font-semibold text-sage-900 ${size === 'small' ? 'text-base' : size === 'large' ? 'text-xl' : 'text-lg'}`}>
        {title}
      </h3>
      {description && (
        <p className={`mt-2 text-sage-600 ${size === 'small' ? 'text-sm' : 'text-base'}`}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-gradient-coral text-white rounded-lg font-medium hover:shadow-md transition-shadow"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
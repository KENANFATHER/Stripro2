/**
 * Enhanced Notification Toast Component with Horizontal Layout
 * 
 * This component displays toast notifications with a horizontal layout,
 * responsive design, and customizable styling variables.
 * 
 * Features:
 * - Horizontal layout with flexible width constraints
 * - Responsive breakpoints for mobile optimization
 * - Single-line text with controlled wrapping
 * - Customizable spacing and visual design
 * - Smooth animations and micro-interactions
 * 
 * Styling Variables:
 * - MIN_WIDTH: Minimum notification width (300px)
 * - MAX_WIDTH: Maximum notification width (80vw)
 * - PADDING_X: Horizontal padding (16px-24px)
 * - PADDING_Y: Vertical padding (12px-16px)
 * - ICON_TEXT_GAP: Space between icon and text (12px)
 * - BORDER_RADIUS: Corner radius (8px)
 * - MOBILE_BREAKPOINT: Mobile breakpoint (768px)
 */

import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

// Customizable styling variables
const NOTIFICATION_STYLES = {
  // Layout & Dimensions
  MIN_WIDTH: '300px',
  MAX_WIDTH: '80vw',
  MAX_WIDTH_MOBILE: '95vw',
  
  // Padding
  PADDING_X: '20px',
  PADDING_X_MOBILE: '16px',
  PADDING_Y: '14px',
  PADDING_Y_MOBILE: '12px',
  
  // Spacing
  ICON_TEXT_GAP: '12px',
  ICON_TEXT_GAP_MOBILE: '10px',
  
  // Visual Design
  BORDER_RADIUS: '8px',
  BOX_SHADOW: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  BOX_SHADOW_HOVER: '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
  
  // Typography
  LINE_HEIGHT: '1.4',
  LINE_HEIGHT_TITLE: '1.3',
  
  // Responsive
  MOBILE_BREAKPOINT: '768px',
  
  // Animation
  TRANSITION_DURATION: '200ms',
  SLIDE_DISTANCE: '8px',
} as const;

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const { id, type, title, message, duration, action } = notification;

  // Auto-dismiss notification after duration
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const getIcon = () => {
    const iconProps = {
      className: "flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
      style: { width: '20px', height: '20px' }
    };

    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <XCircle {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          closeButton: 'text-green-500 hover:text-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          closeButton: 'text-red-500 hover:text-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          closeButton: 'text-yellow-500 hover:text-yellow-700'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          closeButton: 'text-blue-500 hover:text-blue-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700',
          closeButton: 'text-gray-500 hover:text-gray-700'
        };
    }
  };

  const colors = getColors();

  // Inline styles for precise control over responsive behavior
  const containerStyles: React.CSSProperties = {
    minWidth: NOTIFICATION_STYLES.MIN_WIDTH,
    maxWidth: NOTIFICATION_STYLES.MAX_WIDTH,
    borderRadius: NOTIFICATION_STYLES.BORDER_RADIUS,
    boxShadow: NOTIFICATION_STYLES.BOX_SHADOW,
    transition: `all ${NOTIFICATION_STYLES.TRANSITION_DURATION} ease-in-out`,
    lineHeight: NOTIFICATION_STYLES.LINE_HEIGHT,
  };

  const paddingStyles: React.CSSProperties = {
    paddingLeft: NOTIFICATION_STYLES.PADDING_X,
    paddingRight: NOTIFICATION_STYLES.PADDING_X,
    paddingTop: NOTIFICATION_STYLES.PADDING_Y,
    paddingBottom: NOTIFICATION_STYLES.PADDING_Y,
  };

  const contentGapStyles: React.CSSProperties = {
    gap: NOTIFICATION_STYLES.ICON_TEXT_GAP,
  };

  return (
    <div 
      className={`group relative ${colors.bg} ${colors.border} border pointer-events-auto transform transition-all duration-300 ease-out hover:scale-[1.02] notification-toast`}
      style={containerStyles}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = NOTIFICATION_STYLES.BOX_SHADOW_HOVER;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = NOTIFICATION_STYLES.BOX_SHADOW;
      }}
    >
      <div 
        className="flex items-start"
        style={{ ...paddingStyles, ...contentGapStyles }}
      >
        {/* Icon */}
        <div className={`${colors.icon} mt-0.5`}>
          {getIcon()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div 
            className={`font-medium ${colors.title} notification-title`}
            style={{ 
              lineHeight: NOTIFICATION_STYLES.LINE_HEIGHT_TITLE,
              wordBreak: 'break-word',
              hyphens: 'auto'
            }}
            title={title} // Tooltip for truncated text
          >
            {title}
          </div>
          
          {/* Message */}
          {message && (
            <div 
              className={`mt-1 text-sm ${colors.message} notification-message`}
              style={{ 
                lineHeight: NOTIFICATION_STYLES.LINE_HEIGHT,
                wordBreak: 'break-word',
                hyphens: 'auto'
              }}
              title={message} // Tooltip for truncated text
            >
              {message}
            </div>
          )}
          
          {/* Action Button */}
          {action && (
            <div className="mt-3">
              <button
                onClick={action.onClick}
                className={`text-sm font-medium ${colors.title} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded transition-all duration-150`}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        
        {/* Close Button */}
        <div className="flex-shrink-0 ml-3">
          <button
            onClick={() => onDismiss(id)}
            className={`inline-flex p-1.5 rounded-md ${colors.closeButton} hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-all duration-150`}
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar for timed notifications */}
      {duration && duration > 0 && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b"
          style={{
            animation: `notification-progress ${duration}ms linear forwards`,
            width: '100%'
          }}
        />
      )}
      
      {/* Responsive and animation styles */}
      <style jsx>{`
        .notification-toast {
          animation: slideInFromTop 0.3s ease-out;
        }
        
        @media (max-width: ${NOTIFICATION_STYLES.MOBILE_BREAKPOINT}) {
          .notification-toast {
            max-width: ${NOTIFICATION_STYLES.MAX_WIDTH_MOBILE};
            padding-left: ${NOTIFICATION_STYLES.PADDING_X_MOBILE};
            padding-right: ${NOTIFICATION_STYLES.PADDING_X_MOBILE};
            padding-top: ${NOTIFICATION_STYLES.PADDING_Y_MOBILE};
            padding-bottom: ${NOTIFICATION_STYLES.PADDING_Y_MOBILE};
          }
          
          .notification-toast .flex {
            gap: ${NOTIFICATION_STYLES.ICON_TEXT_GAP_MOBILE};
          }
          
          .notification-title {
            font-size: 0.875rem;
          }
          
          .notification-message {
            font-size: 0.8125rem;
          }
        }
        
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-${NOTIFICATION_STYLES.SLIDE_DISTANCE}) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes notification-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        /* Ensure text doesn't break awkwardly */
        .notification-title,
        .notification-message {
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        
        /* Smooth hover transitions */
        .notification-toast:hover {
          transform: translateY(-1px) scale(1.02);
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .notification-toast,
          .notification-toast * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
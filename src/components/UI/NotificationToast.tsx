/**
 * Notification Toast Component
 * 
 * This component displays toast notifications with different types
 * (success, error, warning, info) and automatic dismissal functionality.
 * 
 * Features:
 * - Multiple notification types with appropriate colors
 * - Automatic dismissal with configurable duration
 * - Manual dismissal with close button
 * - Smooth animations for show/hide
 * - Action buttons for interactive notifications
 * 
 * Usage:
 * - Used by NotificationContext to display toasts
 * - Automatically positioned and styled
 * - Handles click events and dismissal
 * 
 * Props:
 * - notification: Notification object with type, title, message
 * - onDismiss: Function to call when notification is dismissed
 */

import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

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
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
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
          message: 'text-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700'
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`max-w-sm w-full ${colors.bg} ${colors.border} border rounded-lg shadow-lg pointer-events-auto`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${colors.icon}`}>
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${colors.title}`}>
              {title}
            </p>
            {message && (
              <p className={`mt-1 text-sm ${colors.message}`}>
                {message}
              </p>
            )}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={`text-sm font-medium ${colors.title} hover:underline`}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onDismiss(id)}
              className={`inline-flex ${colors.icon} hover:opacity-75 focus:outline-none`}
            >
              <span className="sr-only">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
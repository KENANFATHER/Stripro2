/**
 * Notification Context Provider
 * 
 * This context manages global notifications and toast messages throughout
 * the application. It provides methods to show success, error, warning,
 * and info notifications with automatic dismissal.
 * 
 * Features:
 * - Multiple notification types (success, error, warning, info)
 * - Automatic dismissal with configurable duration
 * - Queue management for multiple notifications
 * - Custom action buttons for notifications
 * 
 * Usage:
 * - Wrap your app with <NotificationProvider>
 * - Use useNotification() hook to show notifications
 * - Call showNotification() with type and message
 * 
 * Example:
 * const { showNotification } = useNotification();
 * showNotification('success', 'Data saved successfully!');
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Notification, NotificationType } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number
  ) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((
    type: NotificationType,
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    const notification: Notification = {
      id,
      type,
      title,
      message: message || '',
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
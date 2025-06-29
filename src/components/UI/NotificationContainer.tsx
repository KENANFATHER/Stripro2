/**
 * Notification Container Component
 * 
 * This component manages the display of multiple toast notifications
 * in a fixed position on the screen. It handles stacking, animations,
 * and positioning of notification toasts.
 * 
 * Features:
 * - Fixed positioning for notifications
 * - Stacking of multiple notifications
 * - Smooth animations for enter/exit
 * - Responsive positioning
 * - Z-index management
 * 
 * Usage:
 * - Used by NotificationContext to display all active notifications
 * - Automatically positioned in top-right corner
 * - Handles notification lifecycle
 */

import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationToast from './NotificationToast';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-[70] space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="transform transition-all duration-300 ease-in-out"
        >
          <NotificationToast
            notification={notification}
            onDismiss={removeNotification}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
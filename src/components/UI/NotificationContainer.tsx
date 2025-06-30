/**
 * Enhanced Notification Container Component
 * 
 * This component manages the display and positioning of multiple toast notifications
 * with improved responsive behavior and stacking animations.
 * 
 * Features:
 * - Responsive positioning (top-center on desktop, top on mobile)
 * - Smooth stacking animations with proper spacing
 * - Z-index management for proper layering
 * - Mobile-optimized layout and spacing
 * - Automatic cleanup of dismissed notifications
 */

import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationToast from './NotificationToast';

// Container styling variables
const CONTAINER_STYLES = {
  // Desktop positioning
  DESKTOP_TOP: '1rem',
  DESKTOP_MAX_WIDTH: '32rem',
  
  // Mobile positioning  
  MOBILE_TOP: '0.5rem',
  MOBILE_HORIZONTAL_PADDING: '1rem',
  
  // Stacking
  NOTIFICATION_GAP: '0.75rem',
  NOTIFICATION_GAP_MOBILE: '0.5rem',
  
  // Z-index
  Z_INDEX: 70,
  
  // Animation
  STAGGER_DELAY: '50ms',
  
  // Responsive breakpoint
  MOBILE_BREAKPOINT: '768px',
} as const;

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  // Container styles for responsive positioning
  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    top: CONTAINER_STYLES.DESKTOP_TOP,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: CONTAINER_STYLES.Z_INDEX,
    maxWidth: CONTAINER_STYLES.DESKTOP_MAX_WIDTH,
    width: '100%',
    pointerEvents: 'none', // Allow clicks to pass through container
  };

  return (
    <>
      <div 
        className="notification-container"
        style={containerStyles}
      >
        <div 
          className="flex flex-col notification-stack"
          style={{ gap: CONTAINER_STYLES.NOTIFICATION_GAP }}
        >
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className="notification-item"
              style={{
                animationDelay: `${index * parseInt(CONTAINER_STYLES.STAGGER_DELAY)}`,
                pointerEvents: 'auto', // Re-enable pointer events for notifications
              }}
            >
              <NotificationToast
                notification={notification}
                onDismiss={removeNotification}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Responsive and animation styles */}
      <style jsx>{`
        .notification-container {
          transition: all 0.3s ease-in-out;
        }
        
        .notification-item {
          animation: stackSlideIn 0.4s ease-out both;
        }
        
        @media (max-width: ${CONTAINER_STYLES.MOBILE_BREAKPOINT}) {
          .notification-container {
            top: ${CONTAINER_STYLES.MOBILE_TOP};
            left: ${CONTAINER_STYLES.MOBILE_HORIZONTAL_PADDING};
            right: ${CONTAINER_STYLES.MOBILE_HORIZONTAL_PADDING};
            transform: none;
            max-width: none;
          }
          
          .notification-stack {
            gap: ${CONTAINER_STYLES.NOTIFICATION_GAP_MOBILE};
          }
        }
        
        @keyframes stackSlideIn {
          from {
            opacity: 0;
            transform: translateY(-1rem) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Smooth exit animation when notifications are removed */
        .notification-item.removing {
          animation: stackSlideOut 0.3s ease-in both;
        }
        
        @keyframes stackSlideOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
            max-height: 200px;
          }
          to {
            opacity: 0;
            transform: translateY(-0.5rem) scale(0.95);
            max-height: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
        }
        
        /* Hover effects for the entire stack */
        .notification-container:hover .notification-item:not(:hover) {
          opacity: 0.85;
          transform: scale(0.98);
        }
        
        .notification-container:hover .notification-item:hover {
          opacity: 1;
          transform: scale(1.02);
          z-index: 1;
        }
        
        /* Ensure proper stacking order */
        .notification-item:nth-child(1) { z-index: 10; }
        .notification-item:nth-child(2) { z-index: 9; }
        .notification-item:nth-child(3) { z-index: 8; }
        .notification-item:nth-child(4) { z-index: 7; }
        .notification-item:nth-child(5) { z-index: 6; }
        
        /* Limit maximum notifications visible */
        .notification-item:nth-child(n+6) {
          display: none;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .notification-item,
          .notification-container,
          .notification-container * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          .notification-container:hover .notification-item {
            opacity: 1 !important;
            transform: none !important;
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .notification-item {
            border-width: 2px;
          }
        }
        
        /* Focus management for accessibility */
        .notification-item:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

export default NotificationContainer;
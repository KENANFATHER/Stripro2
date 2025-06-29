/**
 * Fully Accessible Login Panel Modal Component
 * 
 * This component provides a modal overlay for the login form with comprehensive
 * accessibility features including proper focus management, keyboard navigation,
 * ARIA attributes, and screen reader support.
 * 
 * Accessibility Features:
 * - Modal dialog with proper ARIA attributes
 * - Focus trap to keep focus within modal
 * - Focus restoration when modal closes
 * - Keyboard navigation (Escape to close, Tab cycling)
 * - Screen reader announcements
 * - High contrast focus indicators
 * - Semantic HTML structure
 * 
 * Responsive Features:
 * - Mobile-first design approach
 * - Touch-friendly close button
 * - Adaptive sizing for all screen sizes
 * - Optimized spacing and typography
 * - Safe area handling for mobile devices
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import AccessibleLoginForm from './AccessibleLoginForm';

interface LoginPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  /**
   * Get all focusable elements within the modal
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!modalRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    return Array.from(modalRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  /**
   * Handle focus trap within modal
   */
  const handleFocusTrap = useCallback((event: KeyboardEvent) => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, [isOpen, getFocusableElements]);

  /**
   * Handle focus management when modal opens/closes
   */
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the close button after a short delay to ensure it's rendered
      setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
      }, 100);
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add focus trap
      document.addEventListener('keydown', handleFocusTrap);
      
      // Announce modal opening to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Login dialog opened. Press Escape to close.';
      document.body.appendChild(announcement);
      
      // Remove announcement after screen readers have processed it
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
      
    } else {
      // Restore focus to the element that opened the modal
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Remove focus trap
      document.removeEventListener('keydown', handleFocusTrap);
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen, handleFocusTrap]);

  /**
   * Handle keyboard events
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  /**
   * Handle backdrop click to close modal
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  /**
   * Handle close button click
   */
  const handleCloseClick = () => {
    onClose();
  };

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = () => {
    onClose();
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-panel-title"
      aria-describedby="login-panel-description"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out animate-slideUp"
        role="document"
      >
        {/* Modal Container */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
          {/* Header with Close Button */}
          <div className="relative p-2">
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={handleCloseClick}
              className="absolute top-2 right-2 p-2 text-sage-600 hover:text-sage-900 hover:bg-sage-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2"
              aria-label="Close login dialog"
              type="button"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Login Form Content */}
          <div className="p-4 sm:p-5 lg:p-6">
            <AccessibleLoginForm
              initialMode="login"
              onSuccess={handleAuthSuccess}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Inline styles for animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(2rem) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-slideUp {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPanel;
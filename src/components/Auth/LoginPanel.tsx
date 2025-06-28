/**
 * Login Panel Modal Component
 * 
 * This component provides a modal overlay for the login form that slides into view
 * with smooth animations. It includes proper accessibility features like focus
 * management, keyboard navigation, and ARIA attributes.
 * 
 * Features:
 * - Modal overlay with backdrop
 * - Slide-up animation using Tailwind CSS
 * - Accessible focus management
 * - Keyboard navigation (Escape to close)
 * - Click outside to close
 * - Responsive design
 * 
 * Usage:
 * - Used in LandingPage to show login form as modal
 * - Controlled by isOpen prop and onClose callback
 * - Integrates with AccessibleLoginForm component
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import AccessibleLoginForm from './AccessibleLoginForm';

interface LoginPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /**
   * Handle focus management when modal opens/closes
   * Accessibility: Ensures proper focus flow for screen readers and keyboard users
   */
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal container after a short delay to ensure it's rendered
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to the element that opened the modal
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  /**
   * Handle keyboard events
   * Accessibility: Allow closing modal with Escape key
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-panel-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md transform transition-all duration-300 ease-out"
        style={{
          animation: isOpen ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-in'
        }}
        tabIndex={-1}
        role="document"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-sage-600 hover:text-sage-900 hover:bg-white/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2"
          aria-label="Close login panel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 id="login-panel-title" className="sr-only">
              Login to Stripro
            </h2>
            
            <AccessibleLoginForm
              initialMode="login"
              onSuccess={handleAuthSuccess}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(100px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPanel;
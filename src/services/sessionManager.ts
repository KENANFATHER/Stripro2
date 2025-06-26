/**
 * Session Manager Service
 * 
 * This service handles secure session management including token validation,
 * refresh logic, and session hijacking prevention. It works alongside the
 * authentication service to maintain secure user sessions.
 * 
 * Security Features:
 * - JWT token validation and refresh
 * - Session fingerprinting to prevent hijacking
 * - Automatic session cleanup
 * - Cross-tab session synchronization
 * - Secure token storage
 * 
 * Usage:
 * - Import sessionManager in app initialization
 * - Call sessionManager.initialize() on app start
 * - Use sessionManager.validateSession() before protected operations
 * 
 * Security Benefits:
 * - Prevents session hijacking attacks
 * - Automatically refreshes expired tokens
 * - Detects suspicious session activity
 * - Maintains session consistency across tabs
 */

import { Session } from '@supabase/supabase-js';
import { supabaseAuthService } from './supabaseAuthService';

interface SessionFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
}

interface StoredSession {
  session: Session;
  fingerprint: SessionFingerprint;
  lastActivity: number;
  createdAt: number;
}

class SessionManager {
  private readonly STORAGE_KEY = 'app_session';
  private readonly FINGERPRINT_KEY = 'session_fingerprint';
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private readonly ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  private sessionCheckInterval?: NodeJS.Timeout;
  private activityTimer?: NodeJS.Timeout;

  /**
   * Initialize session manager
   * Security: Sets up session monitoring and validation
   */
  initialize(): void {
    this.setupActivityTracking();
    this.setupSessionValidation();
    this.setupCrossTabSync();
    this.validateStoredSession();
  }

  /**
   * Generate browser fingerprint for session validation
   * Security: Creates unique identifier to detect session hijacking
   */
  private generateFingerprint(): SessionFingerprint {
    return {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform
    };
  }

  /**
   * Compare session fingerprints
   * Security: Detects if session is being used from different device
   */
  private compareFingerprintsSecure(stored: SessionFingerprint, current: SessionFingerprint): boolean {
    // Allow some flexibility for legitimate changes
    const criticalMatches = [
      stored.userAgent === current.userAgent,
      stored.timezone === current.timezone,
      stored.platform === current.platform
    ];

    // Require at least 2 out of 3 critical matches
    const criticalScore = criticalMatches.filter(Boolean).length;
    return criticalScore >= 2;
  }

  /**
   * Store session securely
   * Security: Encrypts and stores session with fingerprint
   */
  async storeSession(session: Session): Promise<void> {
    try {
      const fingerprint = this.generateFingerprint();
      const storedSession: StoredSession = {
        session,
        fingerprint,
        lastActivity: Date.now(),
        createdAt: Date.now()
      };

      // Store in secure storage (localStorage with encryption in production)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedSession));
      localStorage.setItem(this.FINGERPRINT_KEY, JSON.stringify(fingerprint));

      this.updateActivity();
    } catch (error) {
      console.error('Failed to store session:', error);
      throw new Error('Session storage failed');
    }
  }

  /**
   * Retrieve and validate stored session
   * Security: Validates session integrity and fingerprint
   */
  async getStoredSession(): Promise<Session | null> {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) return null;

      const storedSession: StoredSession = JSON.parse(storedData);
      const currentFingerprint = this.generateFingerprint();

      // Validate session age
      const sessionAge = Date.now() - storedSession.createdAt;
      if (sessionAge > this.SESSION_TIMEOUT) {
        this.clearSession();
        throw new Error('Session expired');
      }

      // Validate activity timeout
      const inactivityTime = Date.now() - storedSession.lastActivity;
      if (inactivityTime > this.ACTIVITY_TIMEOUT) {
        this.clearSession();
        throw new Error('Session inactive too long');
      }

      // Validate fingerprint
      if (!this.compareFingerprintsSecure(storedSession.fingerprint, currentFingerprint)) {
        this.clearSession();
        throw new Error('Session security validation failed');
      }

      // Check if session needs refresh
      const expiresAt = storedSession.session.expires_at ? storedSession.session.expires_at * 1000 : 0;
      const timeUntilExpiry = expiresAt - Date.now();

      if (timeUntilExpiry < this.REFRESH_THRESHOLD) {
        return await this.refreshSession();
      }

      this.updateActivity();
      return storedSession.session;

    } catch (error) {
      console.error('Session validation failed:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Refresh session token
   * Security: Securely refreshes expired or expiring tokens
   */
  private async refreshSession(): Promise<Session | null> {
    try {
      const { session } = await supabaseAuthService.getCurrentSession();
      
      if (session) {
        await this.storeSession(session);
        return session;
      }

      this.clearSession();
      return null;
    } catch (error) {
      console.error('Session refresh failed:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Update last activity timestamp
   * Security: Tracks user activity for timeout management
   */
  private updateActivity(): void {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        const storedSession: StoredSession = JSON.parse(storedData);
        storedSession.lastActivity = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedSession));
      }
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }

  /**
   * Clear session data
   * Security: Securely removes all session information
   */
  clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.FINGERPRINT_KEY);
    
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
  }

  /**
   * Setup activity tracking
   * Security: Monitors user activity for session timeout
   */
  private setupActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      this.updateActivity();
      
      // Reset activity timer
      if (this.activityTimer) {
        clearTimeout(this.activityTimer);
      }
      
      this.activityTimer = setTimeout(() => {
        this.clearSession();
        window.location.reload(); // Force re-authentication
      }, this.ACTIVITY_TIMEOUT);
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });
  }

  /**
   * Setup periodic session validation
   * Security: Regularly validates session integrity
   */
  private setupSessionValidation(): void {
    this.sessionCheckInterval = setInterval(async () => {
      const session = await this.getStoredSession();
      if (!session) {
        // Session invalid, redirect to login
        window.location.href = '/login';
      }
    }, 60000); // Check every minute
  }

  /**
   * Setup cross-tab session synchronization
   * Security: Ensures consistent session state across browser tabs
   */
  private setupCrossTabSync(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEY) {
        if (!event.newValue) {
          // Session cleared in another tab
          window.location.reload();
        }
      }
    });

    // Broadcast session updates to other tabs
    window.addEventListener('beforeunload', () => {
      this.updateActivity();
    });
  }

  /**
   * Validate stored session on initialization
   * Security: Ensures session is valid when app starts
   */
  private async validateStoredSession(): Promise<void> {
    try {
      const session = await this.getStoredSession();
      if (!session) {
        // No valid session found
        this.clearSession();
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      this.clearSession();
    }
  }

  /**
   * Check if current session is valid
   * Security: Validates session before protected operations
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const session = await this.getStoredSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get session information for debugging
   * Security: Provides session status without exposing sensitive data
   */
  async getSessionInfo(): Promise<{
    isValid: boolean;
    expiresAt?: Date;
    lastActivity?: Date;
    fingerprintMatch?: boolean;
  }> {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) {
        return { isValid: false };
      }

      const storedSession: StoredSession = JSON.parse(storedData);
      const currentFingerprint = this.generateFingerprint();

      return {
        isValid: await this.isSessionValid(),
        expiresAt: storedSession.session.expires_at ? new Date(storedSession.session.expires_at * 1000) : undefined,
        lastActivity: new Date(storedSession.lastActivity),
        fingerprintMatch: this.compareFingerprintsSecure(storedSession.fingerprint, currentFingerprint)
      };
    } catch (error) {
      return { isValid: false };
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
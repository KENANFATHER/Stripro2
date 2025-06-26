/**
 * Security Service
 * 
 * This service provides additional security utilities including CSRF protection,
 * input sanitization, and security monitoring. It complements the authentication
 * service with additional security layers.
 * 
 * Security Features:
 * - CSRF token generation and validation
 * - Input sanitization and validation
 * - Security headers management
 * - Threat detection and monitoring
 * - Rate limiting utilities
 * 
 * Usage:
 * - Import securityService for security operations
 * - Call securityService.generateCSRFToken() for forms
 * - Use securityService.sanitizeInput() for user inputs
 * 
 * Security Benefits:
 * - Prevents CSRF attacks
 * - Sanitizes malicious inputs
 * - Monitors for security threats
 * - Provides defense in depth
 */

interface SecurityConfig {
  csrfTokenLength: number;
  maxInputLength: number;
  allowedTags: string[];
  rateLimitWindow: number;
  maxRequestsPerWindow: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface SecurityThreat {
  type: 'xss' | 'sql_injection' | 'csrf' | 'rate_limit' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  userAgent?: string;
  ipAddress?: string;
  payload?: string;
}

class SecurityService {
  private config: SecurityConfig = {
    csrfTokenLength: 32,
    maxInputLength: 10000,
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    rateLimitWindow: 60000, // 1 minute
    maxRequestsPerWindow: 100
  };

  private csrfTokens: Set<string> = new Set();
  private rateLimitMap: Map<string, RateLimitEntry> = new Map();
  private securityThreats: SecurityThreat[] = [];

  /**
   * Generate CSRF token for form protection
   * Security: Prevents Cross-Site Request Forgery attacks
   */
  generateCSRFToken(): string {
    const token = this.generateSecureToken(this.config.csrfTokenLength);
    this.csrfTokens.add(token);
    
    // Clean up old tokens (keep last 100)
    if (this.csrfTokens.size > 100) {
      const tokensArray = Array.from(this.csrfTokens);
      this.csrfTokens = new Set(tokensArray.slice(-100));
    }
    
    return token;
  }

  /**
   * Validate CSRF token
   * Security: Ensures request originated from legitimate form
   */
  validateCSRFToken(token: string): boolean {
    const isValid = this.csrfTokens.has(token);
    
    if (isValid) {
      // Remove token after use (single-use)
      this.csrfTokens.delete(token);
    } else {
      this.logSecurityThreat({
        type: 'csrf',
        severity: 'high',
        description: 'Invalid CSRF token detected',
        timestamp: Date.now(),
        payload: token
      });
    }
    
    return isValid;
  }

  /**
   * Generate cryptographically secure token
   * Security: Uses crypto.getRandomValues for secure randomness
   */
  private generateSecureToken(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    return Array.from(array, byte => chars[byte % chars.length]).join('');
  }

  /**
   * Sanitize user input to prevent XSS attacks
   * Security: Removes malicious scripts and dangerous content
   */
  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Limit input length
    if (input.length > this.config.maxInputLength) {
      input = input.substring(0, this.config.maxInputLength);
    }

    // Remove script tags and their content
    input = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove javascript: protocols
    input = input.replace(/javascript:/gi, '');
    
    // Remove on* event handlers
    input = input.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove data: URLs (potential for XSS)
    input = input.replace(/data:/gi, '');
    
    // Remove vbscript: protocols
    input = input.replace(/vbscript:/gi, '');
    
    // Encode HTML entities
    input = this.encodeHTMLEntities(input);
    
    // Check for potential XSS patterns
    if (this.detectXSSPatterns(input)) {
      this.logSecurityThreat({
        type: 'xss',
        severity: 'high',
        description: 'Potential XSS attempt detected in input',
        timestamp: Date.now(),
        payload: input
      });
    }
    
    return input.trim();
  }

  /**
   * Encode HTML entities to prevent XSS
   * Security: Converts dangerous characters to safe entities
   */
  private encodeHTMLEntities(input: string): string {
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    
    return input.replace(/[&<>"'/]/g, (char) => entityMap[char]);
  }

  /**
   * Detect XSS patterns in input
   * Security: Identifies potential cross-site scripting attempts
   */
  private detectXSSPatterns(input: string): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
      /onmouseover=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\(/i,
      /expression\(/i,
      /document\.cookie/i,
      /document\.write/i
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Validate SQL injection patterns
   * Security: Detects potential SQL injection attempts
   */
  validateSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(--|\/\*|\*\/)/,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/i,
      /(\bCHAR\s*\()/i,
      /(\bCONCAT\s*\()/i,
      /(\bCAST\s*\()/i
    ];
    
    const hasSQLPattern = sqlPatterns.some(pattern => pattern.test(input));
    
    if (hasSQLPattern) {
      this.logSecurityThreat({
        type: 'sql_injection',
        severity: 'critical',
        description: 'Potential SQL injection attempt detected',
        timestamp: Date.now(),
        payload: input
      });
    }
    
    return !hasSQLPattern;
  }

  /**
   * Rate limiting check
   * Security: Prevents abuse and DoS attacks
   */
  checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(identifier);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow
      });
      return true;
    }
    
    if (entry.count >= this.config.maxRequestsPerWindow) {
      this.logSecurityThreat({
        type: 'rate_limit',
        severity: 'medium',
        description: 'Rate limit exceeded',
        timestamp: now,
        payload: identifier
      });
      return false;
    }
    
    entry.count++;
    return true;
  }

  /**
   * Log security threats for monitoring
   * Security: Creates audit trail for security incidents
   */
  private logSecurityThreat(threat: SecurityThreat): void {
    this.securityThreats.push(threat);
    
    // Keep only last 1000 threats to prevent memory issues
    if (this.securityThreats.length > 1000) {
      this.securityThreats = this.securityThreats.slice(-1000);
    }
    
    // In production, send to security monitoring service
    console.warn('Security Threat Detected:', threat);
    
    // Send to external monitoring service
    this.sendToSecurityMonitoring(threat);
  }

  /**
   * Send security events to monitoring service
   * Security: External monitoring for threat analysis
   */
  private async sendToSecurityMonitoring(threat: SecurityThreat): Promise<void> {
    try {
      // TODO: Replace with actual security monitoring service
      // await fetch('/api/security/threats', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(threat)
      // });
      
      console.log('Security threat logged:', threat);
    } catch (error) {
      console.error('Failed to send security event:', error);
    }
  }

  /**
   * Get security threats for analysis
   * Security: Provides threat data for security dashboard
   */
  getSecurityThreats(severity?: SecurityThreat['severity']): SecurityThreat[] {
    if (severity) {
      return this.securityThreats.filter(threat => threat.severity === severity);
    }
    return [...this.securityThreats];
  }

  /**
   * Validate file upload security
   * Security: Ensures uploaded files are safe
   */
  validateFileUpload(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'text/csv'
    ];
    
    // Check file size
    if (file.size > maxSize) {
      errors.push('File size exceeds maximum limit (10MB)');
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }
    
    // Check file name for malicious patterns
    const dangerousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.pif$/i,
      /\.com$/i,
      /\.php$/i,
      /\.jsp$/i,
      /\.asp$/i
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
      errors.push('File name contains dangerous extension');
    }
    
    // Log suspicious file uploads
    if (errors.length > 0) {
      this.logSecurityThreat({
        type: 'suspicious_activity',
        severity: 'medium',
        description: 'Suspicious file upload attempt',
        timestamp: Date.now(),
        payload: `${file.name} (${file.type}, ${file.size} bytes)`
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate Content Security Policy header
   * Security: Prevents XSS and data injection attacks
   */
  generateCSPHeader(): string {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.stripe.com",
      "frame-src 'self' https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ];
    
    return csp.join('; ');
  }

  /**
   * Clean up expired data
   * Security: Prevents memory leaks and stale data
   */
  cleanup(): void {
    const now = Date.now();
    
    // Clean up expired rate limit entries
    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
    
    // Clean up old security threats (keep last 24 hours)
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    this.securityThreats = this.securityThreats.filter(
      threat => threat.timestamp > oneDayAgo
    );
  }
}

// Export singleton instance
export const securityService = new SecurityService();

// Set up periodic cleanup
setInterval(() => {
  securityService.cleanup();
}, 5 * 60 * 1000); // Clean up every 5 minutes
/**
 * Fully Responsive Authentication Page Component
 * 
 * This page provides a comprehensive authentication interface with a beautiful
 * responsive layout that adapts perfectly to all screen sizes using Flexbox.
 * 
 * Layout Strategy:
 * - Desktop (md+): Side-by-side layout using flex-row (50/50 split)
 * - Mobile/Tablet (below md): Stacked layout using flex-col
 * - All sizes: No horizontal scrolling, proper viewport handling
 * 
 * Responsive Features:
 * - Flexbox for responsive layout control
 * - Responsive typography and spacing
 * - Adaptive padding using responsive utilities
 * - Viewport-aware heights to prevent scrolling issues
 */

import React, { Suspense, lazy } from 'react';
import { Loader2, Star, Shield, Zap, Users, CheckCircle } from 'lucide-react';

// Code Splitting: Lazy load the main login form component
const AccessibleLoginForm = lazy(() => 
  import('../components/Auth/AccessibleLoginForm')
);

const AuthPage: React.FC = () => {
  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = () => {
    console.log('Authentication successful');
  };

  return (
    // Main responsive container using Flexbox
    <main 
      className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-coral-400 via-tangerine-400 to-lilac-400"
      role="main"
      aria-label="Authentication page"
    >
      {/* Skip link for keyboard users */}
      <a 
        href="#auth-form" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-coral-600 px-4 py-2 rounded-lg font-semibold z-50"
      >
        Skip to sign in form
      </a>

      {/* Left: Landing/Marketing Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-8 lg:p-12 md:pr-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-24 lg:w-32 h-24 lg:h-32 bg-white/15 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-16 lg:w-24 h-16 lg:h-24 bg-coral-300/20 rounded-full blur-lg"></div>
          <div className="absolute top-1/2 right-1/3 w-12 lg:w-16 h-12 lg:h-16 bg-lilac-300/30 rounded-full blur-md"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-lg text-center md:text-left">
          {/* Logo and Brand */}
          <header className="mb-6 lg:mb-8">
            <div className="flex items-center justify-center md:justify-start space-x-3 lg:space-x-4 mb-4 lg:mb-6">
              <div className="w-12 lg:w-16 h-12 lg:h-16 bg-white rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl">
                <img 
                  src="/Stripro-Logo.png" 
                  alt="Stripro Logo" 
                  className="w-8 lg:w-12 h-8 lg:h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                />
                <div className="hidden w-8 lg:w-12 h-8 lg:h-12 items-center justify-center">
                  <span className="text-coral-600 font-bold text-xl lg:text-2xl">S</span>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white drop-shadow-lg">
                  Stripro
                </h1>
                <p className="text-white/90 text-base lg:text-lg font-medium">Analytics Dashboard</p>
              </div>
            </div>

            {/* Early Access Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 lg:px-6 py-2 lg:py-3">
              <Star className="w-4 lg:w-5 h-4 lg:h-5 text-yellow-300 fill-current" />
              <span className="text-white font-semibold text-sm lg:text-base">Early Access</span>
              <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </header>

          {/* Main Slogan */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 lg:mb-6 leading-tight drop-shadow-lg">
              Know Your Profitable Clients—
              <span className="block text-coral-100">Effortlessly with Stripro</span>
            </h2>
            <p className="text-lg lg:text-xl text-white/90 leading-relaxed drop-shadow-sm">
              Transform your Stripe data into actionable insights. Discover which clients drive real profit.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
            <div className="flex items-center space-x-3 lg:space-x-4 bg-white/15 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/20">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-white/20 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 lg:w-6 h-5 lg:h-6 text-yellow-300" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="text-white font-semibold text-sm lg:text-base">Real-time Analytics</h3>
                <p className="text-white/80 text-xs lg:text-sm">Live insights from your Stripe data</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 lg:space-x-4 bg-white/15 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/20">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-white/20 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 lg:w-6 h-5 lg:h-6 text-green-300" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="text-white font-semibold text-sm lg:text-base">Enterprise Security</h3>
                <p className="text-white/80 text-xs lg:text-sm">Bank-level encryption and protection</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 lg:space-x-4 bg-white/15 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/20">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-white/20 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 lg:w-6 h-5 lg:h-6 text-blue-300" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="text-white font-semibold text-sm lg:text-base">Client Profitability</h3>
                <p className="text-white/80 text-xs lg:text-sm">Identify your most valuable customers</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/20">
            <div className="flex items-center justify-center space-x-2 mb-3 lg:mb-4">
              <div className="flex -space-x-1 lg:-space-x-2">
                <div className="w-6 lg:w-8 h-6 lg:h-8 bg-gradient-to-br from-coral-400 to-coral-600 rounded-full border-2 border-white"></div>
                <div className="w-6 lg:w-8 h-6 lg:h-8 bg-gradient-to-br from-tangerine-400 to-tangerine-600 rounded-full border-2 border-white"></div>
                <div className="w-6 lg:w-8 h-6 lg:h-8 bg-gradient-to-br from-lilac-400 to-lilac-600 rounded-full border-2 border-white"></div>
                <div className="w-6 lg:w-8 h-6 lg:h-8 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              </div>
              <span className="text-white font-semibold text-sm lg:text-base">500+ Early Users</span>
            </div>
            <blockquote className="text-white/90 text-xs lg:text-sm italic mb-2">
              "Stripro helped us identify our most profitable clients and increase revenue by 40%"
            </blockquote>
            <cite className="text-white/70 text-xs">— Sarah Chen, CEO at TechFlow</cite>
          </div>
        </div>
      </div>

      {/* Right: Login Panel */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-6 md:p-8">
        <div className="w-full max-w-md">
          {/* Code Splitting: Suspense boundary for lazy-loaded components */}
          <Suspense 
            fallback={
              // Loading state with proper accessibility
              <div 
                className="flex flex-col items-center justify-center space-y-4 min-h-[400px] bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/30 p-6 sm:p-8 shadow-2xl"
                role="status"
                aria-live="polite"
                aria-label="Loading authentication form"
              >
                <Loader2 className="w-12 h-12 animate-spin text-coral-600" aria-hidden="true" />
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-2 text-sage-900">Loading Stripro</h2>
                  <p className="text-sage-600">Preparing secure authentication...</p>
                </div>
                {/* Screen reader only loading message */}
                <span className="sr-only">
                  Please wait while the authentication form loads. This may take a few seconds.
                </span>
              </div>
            }
          >
            {/* Authentication Form */}
            <div id="auth-form">
              <AccessibleLoginForm
                initialMode="login"
                onSuccess={handleAuthSuccess}
                className="w-full"
              />
            </div>
          </Suspense>
        </div>
      </div>

      {/* Hidden heading for page structure */}
      <h1 className="sr-only">Stripro Authentication - Sign In or Create Account</h1>
    </main>
  );
};

export default AuthPage;
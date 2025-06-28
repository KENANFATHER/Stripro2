/**
 * Fully Accessible Landing Page Component with Animated Background
 * 
 * This component creates a futuristic landing page with comprehensive accessibility
 * features including semantic HTML, ARIA attributes, keyboard navigation, and
 * screen reader support. The design is fully responsive across all devices.
 * 
 * Accessibility Features:
 * - Semantic HTML structure with proper headings hierarchy
 * - ARIA landmarks and labels for screen readers
 * - Keyboard navigation support
 * - Focus management and visible focus indicators
 * - High contrast ratios for text readability
 * - Alternative text for images
 * - Reduced motion support for users with vestibular disorders
 * 
 * Responsive Features:
 * - Mobile-first design approach
 * - Flexible grid layouts that adapt to all screen sizes
 * - Scalable typography and spacing
 * - Touch-friendly interactive elements
 * - Optimized for devices from 320px to 4K displays
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Shield, Check, Clock, Users, BarChart3 } from 'lucide-react';
import { LoginPanel } from '../components/Auth';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLoginPanel, setShowLoginPanel] = React.useState(false);

  const handleGetStarted = () => {
    setShowLoginPanel(true);
  };

  const handleCloseLoginPanel = () => {
    setShowLoginPanel(false);
  };

  const handleAuthSuccess = () => {
    // Navigate to dashboard after successful authentication
    navigate('/dashboard');
  };

  // Skip to main content for keyboard users
  const skipToMain = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
      }
    }
  };

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-coral-600 px-4 py-2 rounded-lg font-semibold z-50 focus:outline-none focus:ring-2 focus:ring-coral-500"
        onKeyDown={skipToMain}
      >
        Skip to main content
      </a>

      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background with reduced motion support */}
        <div 
          className="absolute inset-0 animated-gradient-bg"
          aria-hidden="true"
          style={{
            animationPlayState: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'running'
          }}
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
        
        {/* Main Content */}
        <main 
          id="main-content"
          className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
          tabIndex={-1}
          role="main"
          aria-label="Stripro landing page main content"
        >
          {/* Header Section */}
          <header className="text-center mb-6 sm:mb-8 lg:mb-12">
            {/* Logo and Brand */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-3 lg:space-x-4 mb-4 sm:mb-6 lg:mb-8">
              <div className="w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
                <img 
                  src="/Stripro-Logo.png" 
                  alt="Stripro company logo - analytics dashboard for Stripe businesses" 
                  className="w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="hidden w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 items-center justify-center">
                  <span className="text-coral-600 font-bold text-lg sm:text-2xl lg:text-3xl" aria-hidden="true">S</span>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-2xl">
                  Stripro
                </h1>
                <p className="text-white/90 text-base sm:text-lg lg:text-xl font-medium drop-shadow-lg">
                  Analytics Dashboard
                </p>
              </div>
            </div>

            {/* Early Access Badge */}
            <div 
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 mb-6 sm:mb-8"
              role="status"
              aria-label="Early access available"
            >
              <Sparkles className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-yellow-300 fill-current" aria-hidden="true" />
              <span className="text-white font-semibold text-sm sm:text-base lg:text-lg">Early Access Available</span>
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true" />
            </div>
          </header>

          {/* Hero Section */}
          <section className="text-center max-w-5xl mx-auto mb-8 sm:mb-12 lg:mb-16" aria-labelledby="hero-heading">
            <h2 
              id="hero-heading"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 leading-tight drop-shadow-2xl"
            >
              Know Your Profitable Clients—
              <span className="block text-white/90 mt-1 sm:mt-2">Effortlessly with Stripro</span>
            </h2>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed drop-shadow-lg mb-6 sm:mb-8 lg:mb-12 max-w-4xl mx-auto px-2">
              Transform your Stripe data into actionable insights. Discover which clients drive real profit 
              and optimize your business strategy with powerful analytics.
            </p>

            {/* Feature Highlights */}
            <section 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16"
              aria-labelledby="features-heading"
            >
              <h3 id="features-heading" className="sr-only">Key Features</h3>
              
              <article className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-white/50">
                <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                  <TrendingUp className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8 text-white" aria-hidden="true" />
                </div>
                <h4 className="text-white font-bold text-base sm:text-lg lg:text-xl mb-2 lg:mb-3">Real-time Analytics</h4>
                <p className="text-white/80 text-sm sm:text-base">Live insights from your Stripe data with instant profitability calculations</p>
              </article>

              <article className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-white/50">
                <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                  <Shield className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8 text-white" aria-hidden="true" />
                </div>
                <h4 className="text-white font-bold text-base sm:text-lg lg:text-xl mb-2 lg:mb-3">Enterprise Security</h4>
                <p className="text-white/80 text-sm sm:text-base">Bank-level encryption with secure Stripe integration and data protection</p>
              </article>

              <article className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-white/50 sm:col-span-2 lg:col-span-1">
                <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6">
                  <Sparkles className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8 text-white" aria-hidden="true" />
                </div>
                <h4 className="text-white font-bold text-base sm:text-lg lg:text-xl mb-2 lg:mb-3">Client Profitability</h4>
                <p className="text-white/80 text-sm sm:text-base">Identify your most valuable customers and optimize pricing strategies</p>
              </article>
            </section>

            {/* Call to Action */}
            <section className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 mb-8 sm:mb-12 lg:mb-16" aria-labelledby="cta-heading">
              <h3 id="cta-heading" className="sr-only">Get Started with Stripro</h3>
              
              <button
                onClick={handleGetStarted}
                className="group relative inline-flex items-center space-x-2 sm:space-x-3 bg-white/95 backdrop-blur-sm text-coral-600 px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl lg:rounded-3xl font-bold text-base sm:text-lg lg:text-xl shadow-2xl border border-white/30 hover:bg-white hover:scale-105 transition-all duration-300 hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
                aria-describedby="cta-description"
              >
                <span>Get 15-Day Trial</span>
                <ArrowRight className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
              </button>
              
              <div id="cta-description" className="text-center sm:text-left">
                <p className="text-white/90 text-sm sm:text-base lg:text-lg font-medium">
                  No credit card required
                </p>
                <p className="text-white/70 text-xs sm:text-sm lg:text-base">
                  Start analyzing your Stripe data in minutes
                </p>
              </div>
            </section>
          </section>

          {/* Pricing Section */}
          <section className="w-full max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16" aria-labelledby="pricing-heading">
            <h3 id="pricing-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-6 sm:mb-8 lg:mb-12 drop-shadow-2xl">
              Simple, Transparent Pricing
            </h3>
            
            <div className="flex justify-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl lg:rounded-[2rem] p-6 sm:p-8 lg:p-12 border border-white/30 shadow-2xl max-w-md w-full mx-4 hover:scale-105 transition-all duration-300">
                {/* Trial Badge */}
                <div className="bg-gradient-to-r from-coral-500 to-tangerine-500 text-white px-4 py-2 rounded-full text-sm font-bold text-center mb-6 shadow-lg">
                  <Clock className="w-4 h-4 inline mr-2" aria-hidden="true" />
                  15-Day Free Trial
                </div>
                
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-sage-900 mb-2">
                    €15
                    <span className="text-lg sm:text-xl lg:text-2xl text-sage-600 font-normal">/month</span>
                  </div>
                  <p className="text-sage-600 text-sm sm:text-base">
                    Billed monthly • Cancel anytime
                  </p>
                </div>
                
                {/* Features */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sage-800 text-sm sm:text-base">All core features</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sage-800 text-sm sm:text-base">Unlimited projects</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sage-800 text-sm sm:text-base">Email support</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-coral-600 to-tangerine-600 text-white py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-coral-700 hover:to-tangerine-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-coral-500/50"
                >
                  Get 15-Day Trial
                </button>
                
                <p className="text-center text-sage-600 text-xs sm:text-sm mt-3">
                  No credit card required • Start immediately
                </p>
              </div>
            </div>
          </section>

          {/* Coming Soon Section */}
          <section className="w-full max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16" aria-labelledby="coming-soon-heading">
            <h3 id="coming-soon-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-6 sm:mb-8 lg:mb-12 drop-shadow-2xl">
              Coming Soon
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mx-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-6 sm:p-8 border border-white/20 text-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-white" aria-hidden="true" />
                </div>
                <h4 className="text-white font-bold text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3">
                  Business-type Analytics
                </h4>
                <p className="text-white/80 text-sm sm:text-base">
                  Advanced analytics tailored to your specific business model and industry
                </p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-6 sm:p-8 border border-white/20 text-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Users className="w-6 sm:w-8 h-6 sm:h-8 text-white" aria-hidden="true" />
                </div>
                <h4 className="text-white font-bold text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3">
                  Team Access & Multi-user Support
                </h4>
                <p className="text-white/80 text-sm sm:text-base">
                  Collaborate with your team and manage user permissions across your organization
                </p>
              </div>
            </div>
          </section>

          {/* Social Proof Section */}
          <section className="text-center w-full max-w-3xl mx-auto" aria-labelledby="social-proof-heading">
            <h3 id="social-proof-heading" className="sr-only">Customer Testimonials</h3>
            
            <div className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 mx-4">
              <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4 lg:mb-6">
                <div className="flex -space-x-1 sm:-space-x-2 lg:-space-x-3" role="img" aria-label="Profile pictures of satisfied customers">
                  <div className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 bg-gradient-to-br from-coral-400 to-coral-600 rounded-full border-2 border-white" aria-hidden="true" />
                  <div className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 bg-gradient-to-br from-tangerine-400 to-tangerine-600 rounded-full border-2 border-white" aria-hidden="true" />
                  <div className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 bg-gradient-to-br from-lilac-400 to-lilac-600 rounded-full border-2 border-white" aria-hidden="true" />
                  <div className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm lg:text-base font-bold" aria-hidden="true">+</span>
                  </div>
                </div>
                <span className="text-white font-bold text-sm sm:text-base lg:text-lg">500+ Early Users</span>
              </div>
              
              <blockquote className="text-white/90 text-sm sm:text-base lg:text-lg italic mb-2 sm:mb-3 lg:mb-4">
                "Stripro helped us identify our most profitable clients and increase revenue by 40% in just 3 months"
              </blockquote>
              
              <cite className="text-white/70 text-xs sm:text-sm lg:text-base">
                — Sarah Chen, CEO at TechFlow Solutions
              </cite>
            </div>
          </section>
        </main>
        
        {/* Login Panel Modal */}
        <LoginPanel
          isOpen={showLoginPanel}
          onClose={handleCloseLoginPanel}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </>
  );
};

export default LandingPage;
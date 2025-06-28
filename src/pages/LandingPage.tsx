/**
 * Landing Page Component with Animated Background
 * 
 * This component creates a futuristic landing page with an animated gradient
 * background that smoothly transitions between brand colors, creating a
 * waving flag or gradient mixture effect.
 * 
 * Features:
 * - Animated gradient background with brand colors
 * - Horizontal wave motion effect
 * - Fully responsive design
 * - Centered welcome message and login button
 * - Smooth transitions and hover effects
 * 
 * Brand Colors Used:
 * - Lilac: #c08cad
 * - Atomic Tangerine: #e69c7f
 * - Coral: #ed8074
 * - Ash Gray/Sage: #becdb8
 * - White: #ffffff
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Shield } from 'lucide-react';
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-gradient-bg"></div>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-3 lg:space-x-4 mb-6 lg:mb-8">
            <div className="w-16 lg:w-20 h-16 lg:h-20 bg-white/95 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
              <img 
                src="/Stripro-Logo.png" 
                alt="Stripro Logo" 
                className="w-12 lg:w-16 h-12 lg:h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
              <div className="hidden w-12 lg:w-16 h-12 lg:h-16 items-center justify-center">
                <span className="text-coral-600 font-bold text-2xl lg:text-3xl">S</span>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white drop-shadow-2xl">
                Stripro
              </h1>
              <p className="text-white/90 text-lg lg:text-xl font-medium drop-shadow-lg">
                Analytics Dashboard
              </p>
            </div>
          </div>

          {/* Early Access Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 lg:px-8 py-3 lg:py-4 mb-8">
            <Sparkles className="w-5 lg:w-6 h-5 lg:h-6 text-yellow-300 fill-current" />
            <span className="text-white font-semibold text-base lg:text-lg">Early Access Available</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 lg:mb-8 leading-tight drop-shadow-2xl">
            Know Your Profitable Clients—
            <span className="block text-white/90 mt-2">Effortlessly with Stripro</span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-white/90 leading-relaxed drop-shadow-lg mb-8 lg:mb-12 max-w-3xl mx-auto">
            Transform your Stripe data into actionable insights. Discover which clients drive real profit 
            and optimize your business strategy with powerful analytics.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-12 lg:w-16 h-12 lg:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <TrendingUp className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg lg:text-xl mb-2 lg:mb-3">Real-time Analytics</h3>
              <p className="text-white/80 text-sm lg:text-base">Live insights from your Stripe data with instant profitability calculations</p>
            </div>

            <div className="bg-white/15 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-12 lg:w-16 h-12 lg:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Shield className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg lg:text-xl mb-2 lg:mb-3">Enterprise Security</h3>
              <p className="text-white/80 text-sm lg:text-base">Bank-level encryption with secure Stripe integration and data protection</p>
            </div>

            <div className="bg-white/15 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-12 lg:w-16 h-12 lg:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Sparkles className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg lg:text-xl mb-2 lg:mb-3">Client Profitability</h3>
              <p className="text-white/80 text-sm lg:text-base">Identify your most valuable customers and optimize pricing strategies</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={handleGetStarted}
              className="group relative inline-flex items-center space-x-3 bg-white/95 backdrop-blur-sm text-coral-600 px-8 lg:px-12 py-4 lg:py-5 rounded-2xl lg:rounded-3xl font-bold text-lg lg:text-xl shadow-2xl border border-white/30 hover:bg-white hover:scale-105 transition-all duration-300 hover:shadow-3xl"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 lg:w-6 h-5 lg:h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <div className="text-center sm:text-left">
              <p className="text-white/90 text-sm lg:text-base font-medium">
                No credit card required
              </p>
              <p className="text-white/70 text-xs lg:text-sm">
                Start analyzing your Stripe data in minutes
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-white/20 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4 lg:mb-6">
              <div className="flex -space-x-2 lg:-space-x-3">
                <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-coral-400 to-coral-600 rounded-full border-2 border-white"></div>
                <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-tangerine-400 to-tangerine-600 rounded-full border-2 border-white"></div>
                <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-lilac-400 to-lilac-600 rounded-full border-2 border-white"></div>
                <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs lg:text-sm font-bold">+</span>
                </div>
              </div>
              <span className="text-white font-bold text-base lg:text-lg">500+ Early Users</span>
            </div>
            <blockquote className="text-white/90 text-sm lg:text-base italic mb-3 lg:mb-4">
              "Stripro helped us identify our most profitable clients and increase revenue by 40% in just 3 months"
            </blockquote>
            <cite className="text-white/70 text-xs lg:text-sm">— Sarah Chen, CEO at TechFlow Solutions</cite>
          </div>
        </div>
      </div>
      
      {/* Login Panel Modal */}
      <LoginPanel
        isOpen={showLoginPanel}
        onClose={handleCloseLoginPanel}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;
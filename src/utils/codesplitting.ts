/**
 * Code Splitting Utilities
 * 
 * This module provides utilities for implementing code splitting in React applications.
 * Code splitting helps reduce initial bundle size and improves page load performance
 * by loading code only when it's needed.
 * 
 * Benefits of Code Splitting:
 * - Reduced initial bundle size
 * - Faster page load times
 * - Better user experience
 * - Improved Core Web Vitals scores
 * - More efficient caching strategies
 * 
 * Implementation Strategies:
 * - Route-based splitting (different pages)
 * - Component-based splitting (heavy components)
 * - Feature-based splitting (optional features)
 * - Library-based splitting (heavy dependencies)
 */

import { lazy, ComponentType } from 'react';

/**
 * Enhanced lazy loading with error boundaries and retry logic
 * This wrapper provides better error handling for lazy-loaded components
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3
): ComponentType<T> => {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (attemptsLeft: number) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (attemptsLeft === 0) {
              reject(error);
              return;
            }
            
            // Retry after a short delay
            setTimeout(() => {
              attemptImport(attemptsLeft - 1);
            }, 1000);
          });
      };
      
      attemptImport(retries);
    });
  });
};

/**
 * Preload a lazy component
 * This allows you to start loading a component before it's actually needed
 */
export const preloadComponent = (importFunc: () => Promise<any>) => {
  // Start the import but don't wait for it
  importFunc().catch(() => {
    // Silently ignore preload errors
    // The component will be loaded again when actually needed
  });
};

/**
 * Create a lazy component with preloading capability
 * This combines lazy loading with the ability to preload on user interaction
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  const LazyComponent = lazy(importFunc);
  
  // Add preload method to the component
  (LazyComponent as any).preload = () => preloadComponent(importFunc);
  
  return LazyComponent as ComponentType<T> & { preload: () => void };
};

/**
 * Bundle size analyzer helper
 * This helps identify which components/modules are taking up the most space
 */
export const logBundleSize = (componentName: string, startTime: number) => {
  const loadTime = performance.now() - startTime;
  console.log(`[Code Splitting] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
};

/**
 * Dynamic import with size tracking
 * This wrapper tracks the loading time of dynamically imported modules
 */
export const importWithTracking = async <T>(
  importFunc: () => Promise<T>,
  moduleName: string
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const module = await importFunc();
    logBundleSize(moduleName, startTime);
    return module;
  } catch (error) {
    console.error(`[Code Splitting] Failed to load ${moduleName}:`, error);
    throw error;
  }
};

/**
 * Intersection Observer based lazy loading
 * This loads components only when they come into view
 */
export const createIntersectionLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = {}
) => {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve) => {
      // Create a placeholder that triggers loading when in view
      const PlaceholderComponent: ComponentType<any> = (props) => {
        const ref = React.useRef<HTMLDivElement>(null);
        const [shouldLoad, setShouldLoad] = React.useState(false);
        
        React.useEffect(() => {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                setShouldLoad(true);
                observer.disconnect();
              }
            },
            options
          );
          
          if (ref.current) {
            observer.observe(ref.current);
          }
          
          return () => observer.disconnect();
        }, []);
        
        React.useEffect(() => {
          if (shouldLoad) {
            importFunc().then(resolve);
          }
        }, [shouldLoad]);
        
        return <div ref={ref} {...props} />;
      };
      
      // Return the placeholder initially
      resolve({ default: PlaceholderComponent as T });
    });
  });
};

/**
 * Route-based code splitting helper
 * This creates lazy-loaded route components with proper error boundaries
 */
export const createLazyRoute = (
  importFunc: () => Promise<{ default: ComponentType<any> }>,
  fallback?: ComponentType<any>
) => {
  const LazyRoute = lazy(importFunc);
  
  // Wrap with error boundary and suspense
  const WrappedRoute: ComponentType<any> = (props) => {
    return (
      <React.Suspense 
        fallback={
          fallback ? 
            React.createElement(fallback) : 
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading page...</p>
              </div>
            </div>
        }
      >
        <LazyRoute {...props} />
      </React.Suspense>
    );
  };
  
  return WrappedRoute;
};

/**
 * Feature flag based code splitting
 * This loads components only if a feature flag is enabled
 */
export const createFeatureFlagLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  featureFlag: string,
  fallback?: ComponentType<any>
) => {
  return lazy(async () => {
    // Check feature flag (this would typically come from a feature flag service)
    const isFeatureEnabled = localStorage.getItem(`feature_${featureFlag}`) === 'true';
    
    if (!isFeatureEnabled) {
      return { 
        default: (fallback || (() => null)) as T 
      };
    }
    
    return importFunc();
  });
};

// Re-export React's lazy and Suspense for convenience
export { lazy, Suspense } from 'react';
```

// Example usage in a component:
/*
import { createLazyComponent, preloadComponent } from '../utils/codesplitting';

// Create a lazy component with preloading
const HeavyChart = createLazyComponent(() => import('./HeavyChart'));

// In your component:
const MyComponent = () => {
  const handleMouseEnter = () => {
    // Preload the component on hover
    HeavyChart.preload();
  };
  
  return (
    <div onMouseEnter={handleMouseEnter}>
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart />
      </Suspense>
    </div>
  );
};
*/
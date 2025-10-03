'use client';

import React, { useEffect, useRef, useState, useId } from 'react';
import { useSimpleAdSense } from '@/hooks/useSimpleAdSense';
import { cn } from '@/lib/utils';

interface EnhancedResponsiveAdProps {
  className?: string;
  slot?: string;
  format?: 'auto' | 'rectangle' | 'banner' | 'leaderboard';
  lazy?: boolean;
  retryOnError?: boolean;
  showPlaceholder?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

/**
 * Enhanced ResponsiveAd component that works with the new AdSense architecture
 * Handles queue management, proper error recovery, and conflict-free loading
 */
function ResponsiveAdInner({
  className,
  slot,
  format = 'auto',
  lazy = true,
  retryOnError = true,
  showPlaceholder = true,
  onLoad,
  onError,
}: EnhancedResponsiveAdProps) {
  const adId = useId();
  const adRef = useRef<HTMLModElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    config,
    isLoaded: adSenseLoaded,
    initializeAd,
  } = useSimpleAdSense();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isVisible || !config.manualAdsEnabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before ad comes into view
        threshold: 0.1,
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isVisible, config.manualAdsEnabled]);

  // Initialize ad when ready
  useEffect(() => {
    if (
      !isVisible ||
      !config.manualAdsEnabled ||
      !adSenseLoaded ||
      !adRef.current ||
      isLoaded ||
      error
    ) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        const success = initializeAd(adRef.current);
        
        if (success) {
          setIsLoaded(true);
          setError(null);
          onLoad?.();
        } else {
          throw new Error('Failed to initialize ad');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        onError?.(errorMessage);

        // Simple retry logic
        if (retryOnError && retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setError(null);
          }, 1000 * (retryCount + 1));
        }
      }
    }, 100 * (retryCount + 1));

    return () => clearTimeout(timer);
  }, [
    isVisible,
    config.manualAdsEnabled,
    adSenseLoaded,
    isLoaded,
    error,
    retryCount,
    retryOnError,
    initializeAd,
    onLoad,
    onError,
  ]);

  // Don't render if ads are disabled
  if (!config.isEnabled || !config.manualAdsEnabled) {
    return null;
  }

  // Development mode placeholder
  if (!config.isProduction && !config.isTesting) {
    return (
      <div className={cn("text-center p-4", className)}>
        <div 
          className="border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm rounded-lg"
          style={{ minHeight: 10 }}
        >
          <div className="text-center">
            <div className="font-semibold mb-1">AdSense Ad ({format})</div>
            <div className="text-xs opacity-75">Development Mode</div>
            <div className="text-xs opacity-50 mt-1">ID: {adId.slice(-8)}</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error && (!retryOnError || retryCount >= 3)) {
    return (
      <div className={cn("text-center p-4 text-gray-500 text-sm", className)}>
        <div>Advertisement could not be loaded</div>
        {!config.isProduction && (
          <div className="text-xs opacity-75 mt-1">{error}</div>
        )}
      </div>
    );
  }

  // Loading state
  if (!adSenseLoaded || (isVisible && !isLoaded && !error)) {
    return (
      <div className={cn("text-center", className)}>
        {showPlaceholder && (
          <div 
            className="bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"
            style={{ minHeight: 10, width: '100%' }}
          />
        )}
      </div>
    );
  }

  // Render actual ad unit
  return (
    <div className={cn("text-center w-full", className)}>
      {isVisible && (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            minHeight: 10,
            maxWidth: '100%'
          }}
          data-ad-client={config.adsenseId}
          data-ad-slot={slot || "9659974650"}
          data-ad-format={format === 'auto' ? 'auto' : undefined}
          data-full-width-responsive="true"
        />
      )}
      
      {/* Debug info in development */}
      {!config.isProduction && isVisible && (
        <div className="text-xs text-gray-400 mt-2 opacity-50">
          AdSense: {adSenseLoaded ? 'Ready' : 'Loading'} | Loaded: {isLoaded ? 'Yes' : 'No'} | Retry: {retryCount}
        </div>
      )}
    </div>
  );
}

// Export the simplified component
export function EnhancedResponsiveAd(props: EnhancedResponsiveAdProps) {
  return <ResponsiveAdInner {...props} />;
}
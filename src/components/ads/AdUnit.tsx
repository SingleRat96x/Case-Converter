'use client';

import { useEffect, useRef, useState } from 'react';
import { useSimpleAdSense } from '@/hooks/useSimpleAdSense';
import { cn } from '@/lib/utils';

export type AdFormat = 
  | 'auto'
  | 'rectangle' 
  | 'leaderboard'
  | 'banner'
  | 'skyscraper'
  | 'square'
  | 'vertical-banner';

export type AdSize = 
  | 'responsive'
  | '300x250'    // Rectangle
  | '728x90'     // Leaderboard  
  | '320x50'     // Mobile banner
  | '160x600'    // Wide skyscraper
  | '250x250'    // Square
  | '120x600'    // Skyscraper
  | '468x60';    // Banner

interface AdUnitProps {
  slot?: string;
  format?: AdFormat;
  size?: AdSize;
  className?: string;
  responsive?: boolean;
  lazy?: boolean;
  testMode?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

// Ad size mappings for responsive design
const adSizeMap: Record<AdSize, { width: number; height: number }> = {
  'responsive': { width: 0, height: 0 },
  '300x250': { width: 300, height: 250 },
  '728x90': { width: 728, height: 90 },
  '320x50': { width: 320, height: 50 },
  '160x600': { width: 160, height: 600 },
  '250x250': { width: 250, height: 250 },
  '120x600': { width: 120, height: 600 },
  '468x60': { width: 468, height: 60 },
};

// Format to size mapping
const formatToSize: Record<AdFormat, AdSize> = {
  'auto': 'responsive',
  'rectangle': '300x250',
  'leaderboard': '728x90', 
  'banner': '468x60',
  'skyscraper': '120x600',
  'square': '250x250',
  'vertical-banner': '160x600',
};

export function AdUnit({
  slot,
  format = 'auto',
  size,
  className,
  responsive = true,
  lazy = true,
  testMode = false,
  onLoad,
  onError,
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { config, isLoaded: adSenseLoaded, initializeAd } = useSimpleAdSense();

  // Determine final size
  const finalSize = size || formatToSize[format];
  const { width, height } = adSizeMap[finalSize];

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before ad comes into view
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isVisible]);

  // Initialize ad when conditions are met
  useEffect(() => {
    if (!isVisible || !adSenseLoaded || !adRef.current || isLoaded) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        const success = initializeAd(adRef.current);
        if (success) {
          setIsLoaded(true);
          onLoad?.();
        } else {
          const errorMsg = 'Failed to initialize ad unit';
          setError(errorMsg);
          onError?.(errorMsg);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [isVisible, adSenseLoaded, isLoaded, initializeAd, onLoad, onError]);

  // Don't render if ads are disabled
  if (!config.isEnabled || !config.manualAdsEnabled) {
    return null;
  }

  // Generate test content for development
  const renderTestAd = () => (
    <div 
      className={cn(
        "border-2 border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm",
        className
      )}
      style={{ 
        width: responsive ? '100%' : width || 'auto', 
        height: height || 250,
        maxWidth: width || '100%'
      }}
    >
      <div className="text-center">
        <div className="font-semibold mb-1">AdSense Ad ({format})</div>
        <div className="text-xs opacity-75">
          {finalSize} • {testMode ? 'Test Mode' : 'Development'}
        </div>
      </div>
    </div>
  );

  // Show test ad in development or test mode
  if (!config.isProduction && !config.isTesting) {
    return renderTestAd();
  }

  // Show error state
  if (error) {
    return (
      <div className={cn("text-center p-4 text-gray-500 text-sm", className)}>
        <div>Ad could not be loaded</div>
        <div className="text-xs opacity-75">{error}</div>
      </div>
    );
  }

  // Render actual ad unit
  return (
    <div 
      className={cn("text-center", className)}
      style={{ 
        minWidth: responsive ? 'auto' : width,
        minHeight: height || 250
      }}
    >
      {isVisible && (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: responsive ? 'block' : 'inline-block',
            width: responsive ? '100%' : width,
            height: height || 'auto',
            maxWidth: '100%'
          }}
          data-ad-client={config.adsenseId}
          data-ad-slot={slot}
          data-ad-format={responsive ? 'auto' : undefined}
          data-full-width-responsive={responsive ? 'true' : undefined}
          data-adtest={testMode ? 'on' : undefined}
        />
      )}
      
      {!isVisible && lazy && (
        <div 
          className="bg-gray-100 dark:bg-gray-800 animate-pulse"
          style={{ 
            width: responsive ? '100%' : width,
            height: height || 250,
            maxWidth: '100%'
          }}
        />
      )}
    </div>
  );
}
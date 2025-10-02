'use client';

import Script from 'next/script';

interface AdSenseScriptProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function AdSenseScript({ onLoad, onError }: AdSenseScriptProps) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const autoAdsEnabled = process.env.NEXT_PUBLIC_AUTO_ADS_ENABLED === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTesting = process.env.NEXT_PUBLIC_ADS_TESTING === 'true';

  // Don't load ads in development unless testing is enabled
  if (!isProduction && !isTesting) {
    return null;
  }

  if (!adsenseId) {
    console.warn('AdSense: NEXT_PUBLIC_ADSENSE_ID is not configured');
    return null;
  }

  const handleLoad = () => {
    console.log('AdSense: Script loaded successfully');
    onLoad?.();
  };

  const handleError = () => {
    console.error('AdSense: Script failed to load');
    onError?.(new Error('AdSense script failed to load'));
  };

  return (
    <Script
      id="adsense-script"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

// Global type declaration for AdSense
declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}
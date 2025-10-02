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
    // Initialize auto ads if enabled
    if (autoAdsEnabled && typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        window.adsbygoogle.push({
          google_ad_client: adsenseId,
          enable_page_level_ads: true,
          overlays: {
            bottom: true
          }
        });
        console.log('AdSense: Auto ads initialized');
      } catch (error) {
        console.error('AdSense: Auto ads initialization failed', error);
        onError?.(error instanceof Error ? error : new Error('Auto ads initialization failed'));
      }
    }
    
    onLoad?.();
  };

  const handleError = () => {
    console.error('AdSense: Script failed to load');
    onError?.(new Error('AdSense script failed to load'));
  };

  return (
    <>
      <Script
        id="adsense-script"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Auto Ads Configuration Script */}
      {autoAdsEnabled && (
        <Script
          id="adsense-auto-ads"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.adsbygoogle = window.adsbygoogle || [];
              (adsbygoogle = window.adsbygoogle).push({
                google_ad_client: "${adsenseId}",
                enable_page_level_ads: true
              });
            `
          }}
        />
      )}
    </>
  );
}

// Global type declaration for AdSense
declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}
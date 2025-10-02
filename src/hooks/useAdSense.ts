'use client';

import { useState, useCallback, useEffect } from 'react';

interface AdSenseConfig {
  adsenseId: string | null;
  autoAdsEnabled: boolean;
  manualAdsEnabled: boolean;
  isProduction: boolean;
  isTesting: boolean;
  isEnabled: boolean;
}

interface AdSenseState {
  isLoaded: boolean;
  isError: boolean;
  error: string | null;
  isClient: boolean;
}

export function useAdSense() {
  const [state, setState] = useState<AdSenseState>({
    isLoaded: false,
    isError: false,
    error: null,
    isClient: false,
  });

  // Set isClient to true after hydration to avoid SSR mismatch
  useEffect(() => {
    setState(prev => ({ ...prev, isClient: true }));
  }, []);

  // Configuration
  const config: AdSenseConfig = {
    adsenseId: process.env.NEXT_PUBLIC_ADSENSE_ID || null,
    autoAdsEnabled: process.env.NEXT_PUBLIC_AUTO_ADS_ENABLED === 'true',
    manualAdsEnabled: process.env.NEXT_PUBLIC_MANUAL_ADS_ENABLED === 'true',
    isProduction: process.env.NODE_ENV === 'production',
    isTesting: process.env.NEXT_PUBLIC_ADS_TESTING === 'true',
    isEnabled: false,
  };

  // Determine if ads should be enabled
  config.isEnabled = Boolean(
    config.adsenseId && 
    (config.isProduction || config.isTesting) &&
    (config.autoAdsEnabled || config.manualAdsEnabled)
  );

  // Handle script load success
  const handleLoad = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoaded: true,
      isError: false,
      error: null,
    }));
  }, []);

  // Handle script load error
  const handleError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      isLoaded: false,
      isError: true,
      error: error.message,
    }));
  }, []);

  // Push ad to queue
  const pushAd = useCallback((adConfig: Record<string, unknown>) => {
    if (!state.isLoaded || !window.adsbygoogle) {
      console.warn('AdSense: Script not loaded, cannot push ad');
      return false;
    }

    try {
      window.adsbygoogle.push(adConfig);
      return true;
    } catch (error) {
      console.error('AdSense: Failed to push ad', error);
      return false;
    }
  }, [state.isLoaded]);

  // Refresh ads on the page
  const refreshAds = useCallback(() => {
    if (!state.isLoaded || !window.adsbygoogle) {
      return false;
    }

    try {
      // Find all ads on the page and refresh them
      const adElements = document.querySelectorAll('.adsbygoogle');
      adElements.forEach((adElement) => {
        if (adElement instanceof HTMLElement) {
          adElement.innerHTML = '';
          window.adsbygoogle.push({});
        }
      });
      return true;
    } catch (error) {
      console.error('AdSense: Failed to refresh ads', error);
      return false;
    }
  }, [state.isLoaded]);

  // Initialize manual ad
  const initializeAd = useCallback((element: HTMLElement | null) => {
    if (!element || !state.isLoaded) {
      return false;
    }

    try {
      window.adsbygoogle.push({});
      return true;
    } catch (error) {
      console.error('AdSense: Failed to initialize ad', error);
      return false;
    }
  }, [state.isLoaded]);

  // Debug information
  const debugInfo = {
    config,
    state,
    adsbygoogleQueue: state.isClient ? window.adsbygoogle?.length || 0 : 0,
  };

  return {
    ...state,
    config,
    handleLoad,
    handleError,
    pushAd,
    refreshAds,
    initializeAd,
    debugInfo,
  };
}
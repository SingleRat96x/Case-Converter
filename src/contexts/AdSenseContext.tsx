'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// Configuration interface
export interface AdSenseConfig {
  adsenseId: string | null;
  autoAdsEnabled: boolean;
  manualAdsEnabled: boolean;
  isProduction: boolean;
  isTesting: boolean;
  isEnabled: boolean;
  maxConcurrentAds: number;
  retryAttempts: number;
  retryDelay: number;
}

// AdSense states
export type AdSenseStatus = 'idle' | 'loading' | 'ready' | 'error';
export type AutoAdsStatus = 'idle' | 'initializing' | 'ready' | 'error';

// Context state interface
interface AdSenseState {
  // Script status
  scriptStatus: AdSenseStatus;
  scriptError: string | null;
  
  // Auto ads status
  autoAdsStatus: AutoAdsStatus;
  autoAdsError: string | null;
  
  // Manual ads management
  activeAds: Set<string>;
  adQueue: string[];
  processingQueue: boolean;
  
  // Configuration
  config: AdSenseConfig;
}

// Context actions interface
interface AdSenseActions {
  // Manual ad management
  registerAd: (adId: string) => void;
  unregisterAd: (adId: string) => void;
  initializeManualAd: (element: HTMLElement, adId: string) => Promise<boolean>;
  
  // Queue management
  processAdQueue: () => Promise<void>;
  
  // Auto ads management
  initializeAutoAds: () => Promise<boolean>;
  
  // Utility functions
  isReady: () => boolean;
  canLoadAds: () => boolean;
  getDebugInfo: () => Record<string, unknown>;
}

type AdSenseContextType = AdSenseState & AdSenseActions;

const AdSenseContext = createContext<AdSenseContextType | null>(null);

// Configuration factory
function createAdSenseConfig(): AdSenseConfig {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID || null;
  const autoAdsEnabled = process.env.NEXT_PUBLIC_AUTO_ADS_ENABLED === 'true';
  const manualAdsEnabled = process.env.NEXT_PUBLIC_MANUAL_ADS_ENABLED === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTesting = process.env.NEXT_PUBLIC_ADS_TESTING === 'true';
  const maxConcurrentAds = parseInt(process.env.NEXT_PUBLIC_ADS_MAX_CONCURRENT || '3', 10);
  const retryAttempts = parseInt(process.env.NEXT_PUBLIC_ADS_RETRY_ATTEMPTS || '2', 10);
  const retryDelay = parseInt(process.env.NEXT_PUBLIC_ADS_RETRY_DELAY || '1000', 10);

  const isEnabled = Boolean(
    adsenseId && 
    (isProduction || isTesting) &&
    (autoAdsEnabled || manualAdsEnabled)
  );

  return {
    adsenseId,
    autoAdsEnabled,
    manualAdsEnabled,
    isProduction,
    isTesting,
    isEnabled,
    maxConcurrentAds,
    retryAttempts,
    retryDelay,
  };
}

interface AdSenseProviderProps {
  children: ReactNode;
}

export function AdSenseProvider({ children }: AdSenseProviderProps) {
  const config = createAdSenseConfig();
  
  const [state, setState] = useState<Omit<AdSenseState, 'config'>>({
    scriptStatus: 'idle',
    scriptError: null,
    autoAdsStatus: 'idle',
    autoAdsError: null,
    activeAds: new Set(),
    adQueue: [],
    processingQueue: false,
  });

  // Load AdSense script
  const loadAdSenseScript = useCallback(async (): Promise<boolean> => {
    if (!config.isEnabled || !config.adsenseId) {
      console.warn('AdSense: Not enabled or missing AdSense ID');
      return false;
    }

    if (state.scriptStatus === 'ready') {
      return true;
    }

    setState(prev => ({ 
      ...prev, 
      scriptStatus: 'loading', 
      scriptError: null 
    }));

    try {
      // Check if script is already loaded
      if (document.querySelector(`script[src*="${config.adsenseId}"]`)) {
        setState(prev => ({ ...prev, scriptStatus: 'ready' }));
        return true;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsenseId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          // Initialize adsbygoogle array if not exists
          window.adsbygoogle = window.adsbygoogle || [];
          setState(prev => ({ ...prev, scriptStatus: 'ready' }));
          resolve();
        };
        
        script.onerror = () => {
          setState(prev => ({ 
            ...prev, 
            scriptStatus: 'error', 
            scriptError: 'Failed to load AdSense script' 
          }));
          reject(new Error('Failed to load AdSense script'));
        };

        document.head.appendChild(script);
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        scriptStatus: 'error', 
        scriptError: errorMessage 
      }));
      console.error('AdSense: Script loading failed', error);
      return false;
    }
  }, [config.isEnabled, config.adsenseId, state.scriptStatus]);

  // Initialize auto ads
  const initializeAutoAds = useCallback(async (): Promise<boolean> => {
    if (!config.autoAdsEnabled || state.autoAdsStatus === 'ready') {
      return config.autoAdsEnabled ? state.autoAdsStatus === 'ready' : true;
    }

    if (state.scriptStatus !== 'ready') {
      console.warn('AdSense: Script not ready, cannot initialize auto ads');
      return false;
    }

    setState(prev => ({ 
      ...prev, 
      autoAdsStatus: 'initializing', 
      autoAdsError: null 
    }));

    try {
      window.adsbygoogle.push({
        google_ad_client: config.adsenseId,
        enable_page_level_ads: true,
        overlays: {
          bottom: true
        }
      });

      setState(prev => ({ ...prev, autoAdsStatus: 'ready' }));
      console.log('AdSense: Auto ads initialized successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auto ads initialization failed';
      setState(prev => ({ 
        ...prev, 
        autoAdsStatus: 'error', 
        autoAdsError: errorMessage 
      }));
      console.error('AdSense: Auto ads initialization failed', error);
      return false;
    }
  }, [config.autoAdsEnabled, config.adsenseId, state.scriptStatus, state.autoAdsStatus]);

  // Register manual ad
  const registerAd = useCallback((adId: string) => {
    setState(prev => ({
      ...prev,
      adQueue: prev.adQueue.includes(adId) ? prev.adQueue : [...prev.adQueue, adId]
    }));
  }, []);

  // Unregister manual ad
  const unregisterAd = useCallback((adId: string) => {
    setState(prev => {
      const newActiveAds = new Set(prev.activeAds);
      newActiveAds.delete(adId);
      return {
        ...prev,
        activeAds: newActiveAds,
        adQueue: prev.adQueue.filter(id => id !== adId)
      };
    });
  }, []);

  // Initialize manual ad
  const initializeManualAd = useCallback(async (element: HTMLElement, adId: string): Promise<boolean> => {
    if (!config.manualAdsEnabled || state.scriptStatus !== 'ready') {
      return false;
    }

    try {
      window.adsbygoogle.push({});
      setState(prev => {
        const newActiveAds = new Set(prev.activeAds);
        newActiveAds.add(adId);
        return { ...prev, activeAds: newActiveAds };
      });
      return true;
    } catch (error) {
      console.error(`AdSense: Failed to initialize manual ad ${adId}`, error);
      return false;
    }
  }, [config.manualAdsEnabled, state.scriptStatus]);

  // Process ad queue with concurrency control
  const processAdQueue = useCallback(async (): Promise<void> => {
    if (state.processingQueue || state.adQueue.length === 0) {
      return;
    }

    setState(prev => ({ ...prev, processingQueue: true }));

    try {
      // Process ads in batches to avoid overwhelming the system
      const batchSize = Math.min(config.maxConcurrentAds, state.adQueue.length);
      const batch = state.adQueue.slice(0, batchSize);

      await Promise.all(
        batch.map(async () => {
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between ads
          // Ad processing will be handled by individual ad components
        })
      );

      setState(prev => ({
        ...prev,
        adQueue: prev.adQueue.slice(batchSize),
        processingQueue: false
      }));
    } catch (error) {
      console.error('AdSense: Queue processing failed', error);
      setState(prev => ({ ...prev, processingQueue: false }));
    }
  }, [state.processingQueue, state.adQueue, config.maxConcurrentAds]);

  // Utility functions
  const isReady = useCallback(() => {
    return state.scriptStatus === 'ready';
  }, [state.scriptStatus]);

  const canLoadAds = useCallback(() => {
    return (
      config.isEnabled &&
      state.scriptStatus === 'ready' &&
      state.activeAds.size < config.maxConcurrentAds
    );
  }, [config.isEnabled, config.maxConcurrentAds, state.scriptStatus, state.activeAds.size]);

  const getDebugInfo = useCallback(() => {
    return {
      config,
      state: {
        ...state,
        activeAds: Array.from(state.activeAds),
      },
      windowAdSenseQueue: typeof window !== 'undefined' ? window.adsbygoogle?.length : 0,
    };
  }, [config, state]);

  // Initialize on mount
  useEffect(() => {
    if (config.isEnabled) {
      loadAdSenseScript().then(() => {
        if (config.autoAdsEnabled) {
          initializeAutoAds();
        }
      });
    }
  }, [config.isEnabled, config.autoAdsEnabled, loadAdSenseScript, initializeAutoAds]);

  // Process queue when it changes
  useEffect(() => {
    if (state.adQueue.length > 0 && !state.processingQueue) {
      processAdQueue();
    }
  }, [state.adQueue.length, state.processingQueue, processAdQueue]);

  const contextValue: AdSenseContextType = {
    // State
    ...state,
    config,
    
    // Actions
    registerAd,
    unregisterAd,
    initializeManualAd,
    processAdQueue,
    initializeAutoAds,
    isReady,
    canLoadAds,
    getDebugInfo,
  };

  return (
    <AdSenseContext.Provider value={contextValue}>
      {children}
    </AdSenseContext.Provider>
  );
}

// Hook to use AdSense context
export function useAdSenseContext(): AdSenseContextType {
  const context = useContext(AdSenseContext);
  if (!context) {
    throw new Error('useAdSenseContext must be used within an AdSenseProvider');
  }
  return context;
}

// Global type declaration for AdSense
declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}
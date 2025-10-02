'use client';

import React from 'react';
import { useAdSenseContext } from '@/contexts/AdSenseContext';

interface AdSenseManagerProps {
  children: React.ReactNode;
  showDebugInfo?: boolean;
}

/**
 * AdSenseManager - Central component that manages AdSense initialization
 * This replaces the old AdSenseScript component with proper state management
 */
export function AdSenseManager({ children, showDebugInfo = false }: AdSenseManagerProps) {
  const { 
    scriptStatus, 
    scriptError, 
    autoAdsStatus, 
    autoAdsError, 
    config,
    getDebugInfo 
  } = useAdSenseContext();

  // Debug info for development
  if (showDebugInfo && !config.isProduction) {
    const debugInfo = getDebugInfo();
    console.log('AdSense Debug Info:', debugInfo);
  }

  return (
    <>
      {children}
      
      {/* Development debug panel */}
      {!config.isProduction && showDebugInfo && (
        <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded-lg max-w-sm z-50">
          <div className="font-bold mb-2">AdSense Debug</div>
          <div>Script: {scriptStatus}</div>
          <div>Auto Ads: {autoAdsStatus}</div>
          {scriptError && <div className="text-red-400">Error: {scriptError}</div>}
          {autoAdsError && <div className="text-red-400">Auto Ads Error: {autoAdsError}</div>}
          <div>Config: {config.autoAdsEnabled ? 'Auto' : ''} {config.manualAdsEnabled ? 'Manual' : ''}</div>
        </div>
      )}
    </>
  );
}

/**
 * AdSenseErrorBoundary - Catches and handles AdSense-related errors
 */
interface AdSenseErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface AdSenseErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AdSenseErrorBoundary extends React.Component<
  AdSenseErrorBoundaryProps,
  AdSenseErrorBoundaryState
> {
  constructor(props: AdSenseErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AdSenseErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AdSense Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="text-center p-4 text-gray-500 text-sm">
          <div>Advertisement could not be loaded</div>
          <div className="text-xs opacity-75 mt-1">
            {this.state.error?.message || 'Unknown error'}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
'use client';

import { useAdSense } from '@/hooks/useAdSense';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge'; // Not available, using inline styling
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export function AdSenseDebug() {
  const { config, isLoaded, isError, error, refreshAds, debugInfo } = useAdSense();

  // Only show when testing is enabled or in development
  if (config.isProduction && !config.isTesting) {
    return null;
  }

  // Force hide - never show
  return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="p-4 bg-background border shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">AdSense Debug</h3>
            <span className={`px-2 py-1 text-xs rounded ${
              isLoaded ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
              isError ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              {isLoaded ? 'Loaded' : isError ? 'Error' : 'Loading'}
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              {config.isEnabled ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span>Ads Enabled: {config.isEnabled ? 'Yes' : 'No'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {config.autoAdsEnabled ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-gray-400" />
              )}
              <span>Auto Ads: {config.autoAdsEnabled ? 'On' : 'Off'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {config.manualAdsEnabled ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-gray-400" />
              )}
              <span>Manual Ads: {config.manualAdsEnabled ? 'On' : 'Off'}</span>
            </div>
            
            <div className="text-gray-500">
              AdSense ID: {config.adsenseId ? '***' + config.adsenseId.slice(-4) : 'None'}
            </div>
            
            <div className="text-gray-500">
              Queue Length: {debugInfo.adsbygoogleQueue}
            </div>
            
            {error && (
              <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-red-700 dark:text-red-300">
                <AlertCircle className="h-3 w-3 mt-0.5" />
                <span className="text-xs">{error}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Reload
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={refreshAds}
              disabled={!isLoaded}
              className="flex-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Ads
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
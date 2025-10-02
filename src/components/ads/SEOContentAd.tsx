'use client';

import { useState } from 'react';
import { AdUnit } from './AdUnit';
import { cn } from '@/lib/utils';

interface SEOContentAdProps {
  className?: string;
  slot?: string;
}

export function SEOContentAd({ className, slot }: SEOContentAdProps) {
  const [adLoaded, setAdLoaded] = useState<boolean | null>(null);

  const handleAdLoad = () => {
    setAdLoaded(true);
  };

  const handleAdError = () => {
    setAdLoaded(false);
  };

  // Don't render anything if ad failed to load
  if (adLoaded === false) {
    return null;
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto my-12", className, {
      "opacity-0": adLoaded === null, // Hide while checking
      "opacity-100": adLoaded === true, // Show when loaded
    })}>
      <div className="min-h-[300px] flex items-center justify-center">
        <AdUnit
          format="auto"
          slot={slot || "4917772104"}
          responsive={true}
          lazy={false}
          className="w-full"
          onLoad={handleAdLoad}
          onError={handleAdError}
        />
      </div>
    </div>
  );
}
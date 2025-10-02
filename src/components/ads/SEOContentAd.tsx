'use client';

import { AdUnit } from './AdUnit';
import { cn } from '@/lib/utils';

interface SEOContentAdProps {
  className?: string;
  slot?: string;
}

export function SEOContentAd({ className, slot }: SEOContentAdProps) {
  return (
    <div className={cn("w-full max-w-4xl mx-auto my-12", className)}>
      <div className="min-h-[300px] flex items-center justify-center">
        <AdUnit
          format="auto"
          slot={slot || "4917772104"}
          responsive={true}
          lazy={false}
          className="w-full"
        />
      </div>
    </div>
  );
}
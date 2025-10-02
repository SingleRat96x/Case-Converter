'use client';

import { AdUnit } from './AdUnit';
import { cn } from '@/lib/utils';

interface AdPlacementProps {
  className?: string;
  slot?: string;
}

// Strategic ad placements for maximum impressions

export function HeaderAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("w-full max-w-4xl mx-auto mb-6", className)}>
      <AdUnit
        format="leaderboard"
        slot={slot}
        responsive={true}
        className="w-full"
      />
    </div>
  );
}

export function SidebarAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("hidden lg:block sticky top-20", className)}>
      <AdUnit
        format="skyscraper"
        slot={slot}
        className="w-full"
        lazy={false} // Sidebar ads should load immediately
      />
    </div>
  );
}

export function InContentAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("my-8 w-full max-w-2xl mx-auto", className)}>
      <AdUnit
        format="rectangle"
        slot={slot}
        responsive={true}
        className="w-full"
      />
    </div>
  );
}

export function FooterAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("w-full max-w-4xl mx-auto mt-8 mb-4", className)}>
      <AdUnit
        format="leaderboard"
        slot={slot}
        responsive={true}
        className="w-full"
      />
    </div>
  );
}

export function MobileAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("block md:hidden w-full my-6", className)}>
      <AdUnit
        format="banner"
        size="320x50"
        slot={slot}
        responsive={true}
        className="w-full"
      />
    </div>
  );
}

export function ToolSeparatorAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("my-12 w-full max-w-3xl mx-auto", className)}>
      <div className="relative">
        {/* Subtle separator line */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        
        {/* Ad in center */}
        <div className="relative flex justify-center bg-background px-4">
          <AdUnit
            format="rectangle"
            slot={slot}
            responsive={true}
            className="bg-background"
          />
        </div>
      </div>
    </div>
  );
}

// Responsive ad that adapts to different screen sizes
export function ResponsiveAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("w-full my-6", className)}>
      <AdUnit
        format="auto"
        slot={slot}
        responsive={true}
        className="w-full min-h-[250px] md:min-h-[300px]"
      />
    </div>
  );
}

// Ad placement for between tool cards/listings
export function CardSeparatorAd({ className, slot, index }: AdPlacementProps & { index?: number }) {
  // Only show every 6th item to avoid oversaturation
  if (index !== undefined && index % 6 !== 0) {
    return null;
  }

  return (
    <div className={cn("w-full my-4 px-4", className)}>
      <AdUnit
        format="rectangle"
        slot={slot}
        responsive={true}
        className="w-full max-w-sm mx-auto"
      />
    </div>
  );
}

// Sticky bottom ad for mobile (like AdMob)
export function StickyBottomAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-lg md:hidden",
      className
    )}>
      <AdUnit
        format="banner"
        size="320x50"
        slot={slot}
        responsive={true}
        lazy={false} // Always load sticky ads
        className="w-full"
      />
    </div>
  );
}

// High-impact ad for above the fold content
export function HeroAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("w-full max-w-5xl mx-auto my-8", className)}>
      <AdUnit
        format="auto"
        slot={slot}
        responsive={true}
        lazy={false} // Hero ads should load immediately
        className="w-full min-h-[200px] md:min-h-[250px]"
      />
    </div>
  );
}
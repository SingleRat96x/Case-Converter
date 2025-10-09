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
      <div className="w-full aspect-[728/90] flex items-center justify-center bg-muted/10">
        <AdUnit
          format="leaderboard"
          slot={slot || "9659974650"}
          responsive={true}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export function SidebarAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("hidden lg:block sticky top-20", className)}>
      <div className="w-full min-h-[600px] flex items-center justify-center bg-muted/10">
        <AdUnit
          format="skyscraper"
          slot={slot || "9659974650"}
          className="w-full h-full"
          lazy={false} // Sidebar ads should load immediately
        />
      </div>
    </div>
  );
}

export function InContentAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("w-full max-w-6xl mx-auto mt-8 mb-4", className)}>
      <div className="w-full aspect-[300/250] flex items-center justify-center bg-muted/10">
        <AdUnit
          format="auto"
          slot={slot || "9659974650"}
          responsive={true}
          lazy={false}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export function FooterAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("w-full max-w-4xl mx-auto mt-8 mb-4", className)}>
      <div className="w-full aspect-[300/250] flex items-center justify-center bg-muted/10">
        <AdUnit
          format="auto"
          slot={slot || "9659974650"}
          responsive={true}
          lazy={false}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export function MobileAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("block md:hidden w-full my-6", className)}>
      <div className="w-full aspect-[320/50] flex items-center justify-center bg-muted/10">
        <AdUnit
          format="banner"
          size="320x50"
          slot={slot || "9659974650"}
          responsive={true}
          className="w-full h-full"
        />
      </div>
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
          <div className="w-full aspect-[300/250] flex items-center justify-center bg-muted/10">
            <AdUnit
              format="rectangle"
              slot={slot || "4917772104"}
              responsive={true}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Responsive ad that adapts to different screen sizes
export function ResponsiveAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("w-full my-6", className)}>
      <div className="w-full aspect-[300/250] flex items-center justify-center bg-muted/10">
        <AdUnit
          format="auto"
          slot={slot || "9659974650"}
          responsive={true}
          className="w-full h-full"
        />
      </div>
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
      <div className="w-full max-w-sm mx-auto aspect-[300/250] flex items-center justify-center bg-muted/10">
        <AdUnit
          format="rectangle"
          slot={slot || "4917772104"}
          responsive={true}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

// Tool page header ad - placed below H1 description
export function ToolHeaderAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("w-full max-w-4xl mx-auto my-8", className)}>
      <div className="w-full aspect-[300/250] flex items-center justify-center bg-muted/10">
        <AdUnit
          format="auto"
          slot={slot || "4917772104"}
          responsive={true}
          lazy={false}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

// Wide ad for full-width pages like /tools/
export function WidePageAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("w-full max-w-6xl mx-auto mt-8 mb-4", className)}>
      <div className="w-full aspect-[300/250] flex items-center justify-center bg-muted/10">
        <AdUnit
          format="auto"
          slot={slot || "9659974650"}
          responsive={true}
          lazy={false}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

// High-impact ad for above the fold content
export function HeroAd({ className, slot }: AdPlacementProps) {
  return (
    <div className={cn("w-full max-w-5xl mx-auto my-8", className)}>
      <div className="w-full aspect-[300/250] flex items-center justify-center bg-muted/10">
        <AdUnit
          format="auto"
          slot={slot || "9659974650"}
          responsive={true}
          lazy={false} // Hero ads should load immediately
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
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
    <div 
      className={cn("w-full max-w-4xl mx-auto mb-6", className)}
      style={{ 
        minHeight: '90px',
        containIntrinsicSize: '728px 90px'
      }}
    >
      <AdUnit
        format="leaderboard"
        slot={slot || "9659974650"}
        responsive={true}
        className="w-full min-h-[10px]"
      />
    </div>
  );
}

export function SidebarAd({ className, slot }: AdPlacementProps) {
  return (
    <div 
      className={cn("hidden lg:block sticky top-20", className)}
      style={{ 
        minHeight: '600px',
        containIntrinsicSize: '160px 600px'
      }}
    >
      <AdUnit
        format="skyscraper"
        slot={slot || "9659974650"}
        className="w-full min-h-[10px]"
        lazy={false} // Sidebar ads should load immediately
      />
    </div>
  );
}

export function InContentAd({ className, slot }: AdPlacementProps) {
  return (
    <div 
      className={cn("w-full max-w-6xl mx-auto mt-8 mb-4", className)}
      style={{ 
        minHeight: '250px',
        containIntrinsicSize: '300px 250px'
      }}
    >
      <div className="min-h-[250px] flex items-center justify-center">
        <AdUnit
          format="auto"
          slot={slot || "9659974650"}
          responsive={true}
          lazy={false}
          className="w-full min-h-[250px]"
        />
      </div>
    </div>
  );
}

export function FooterAd({ className, slot }: AdPlacementProps) {
  return (
    <div 
      className={cn("w-full max-w-4xl mx-auto mt-8 mb-4", className)}
      style={{ 
        minHeight: '250px',
        containIntrinsicSize: '300px 250px'
      }}
    >
      <div className="min-h-[250px] flex items-center justify-center">
        <AdUnit
          format="auto"
          slot={slot || "9659974650"}
          responsive={true}
          lazy={false}
          className="w-full min-h-[250px]"
        />
      </div>
    </div>
  );
}

export function MobileAd({ className, slot }: AdPlacementProps) {
  return (
    <div 
      className={cn("block md:hidden w-full my-6", className)}
      style={{ 
        minHeight: '50px',
        containIntrinsicSize: '320px 50px'
      }}
    >
      <AdUnit
        format="banner"
        size="320x50"
        slot={slot || "9659974650"}
        responsive={true}
        className="w-full min-h-[50px]"
      />
    </div>
  );
}

export function ToolSeparatorAd({ className, slot }: AdPlacementProps) {
  return (
    <div 
      className={cn("my-12 w-full max-w-3xl mx-auto", className)}
      style={{ 
        minHeight: '250px',
        containIntrinsicSize: '300px 250px'
      }}
    >
      <div className="relative">
        {/* Subtle separator line */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        
        {/* Ad in center */}
        <div className="relative flex justify-center bg-background px-4">
          <AdUnit
            format="rectangle"
            slot={slot || "4917772104"}
            responsive={true}
            className="bg-background min-h-[250px]"
          />
        </div>
      </div>
    </div>
  );
}

// Responsive ad that adapts to different screen sizes
export function ResponsiveAd({ className, slot }: AdPlacementProps) {
  return (
    <div 
      className={cn("w-full my-6", className)}
      style={{ 
        minHeight: '250px',
        containIntrinsicSize: '300px 250px'
      }}
    >
      <AdUnit
        format="auto"
        slot={slot || "9659974650"}
        responsive={true}
        className="w-full min-h-[250px]"
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
    <div 
      className={cn("w-full my-4 px-4", className)}
      style={{ 
        minHeight: '250px',
        containIntrinsicSize: '300px 250px'
      }}
    >
      <AdUnit
        format="rectangle"
        slot={slot || "4917772104"}
        responsive={true}
        className="w-full max-w-sm mx-auto min-h-[250px]"
      />
    </div>
  );
}

// Tool page header ad - placed below H1 description
export function ToolHeaderAd({ className, slot }: AdPlacementProps) {
  return (
    <div 
      className={cn("w-full max-w-4xl mx-auto my-8", className)}
      style={{ 
        minHeight: '250px',
        containIntrinsicSize: '300px 250px'
      }}
    >
      <AdUnit
        format="auto"
        slot={slot || "4917772104"}
        responsive={true}
        lazy={false}
        className="w-full min-h-[250px]"
      />
    </div>
  );
}

// Wide ad for full-width pages like /tools/
export function WidePageAd({ className, slot }: AdPlacementProps) {
  return (
    <div 
      className={cn("w-full max-w-6xl mx-auto mt-8 mb-4", className)}
      style={{ 
        minHeight: '250px',
        containIntrinsicSize: '300px 250px'
      }}
    >
      <div className="min-h-[250px] flex items-center justify-center">
        <AdUnit
          format="auto"
          slot={slot || "9659974650"}
          responsive={true}
          lazy={false}
          className="w-full min-h-[250px]"
        />
      </div>
    </div>
  );
}

// High-impact ad for above the fold content
export function HeroAd({ className, slot }: AdPlacementProps) {
  return (
    <div 
      className={cn("w-full max-w-5xl mx-auto my-8", className)}
      style={{ 
        minHeight: '250px',
        containIntrinsicSize: '300px 250px'
      }}
    >
      <AdUnit
        format="auto"
        slot={slot || "9659974650"}
        responsive={true}
        lazy={false} // Hero ads should load immediately
        className="w-full min-h-[250px]"
      />
    </div>
  );
}
'use client';

import React from 'react';
import { StickyLeftAd, StickyRightAd } from '@/components/ads/AdPlacements';

interface TextToolLayoutProps {
  children: React.ReactNode;
  enableStickyAds?: boolean;
  leftAdSlot?: string;
  rightAdSlot?: string;
}

export function TextToolLayout({ 
  children, 
  enableStickyAds = true,
  leftAdSlot = "9659974650",
  rightAdSlot = "9659974650"
}: TextToolLayoutProps) {
  return (
    <div className="relative">
      {/* Sticky Ads - Only on XL screens and above */}
      {enableStickyAds && (
        <>
          <StickyLeftAd slot={leftAdSlot} />
          <StickyRightAd slot={rightAdSlot} />
        </>
      )}
      
      {/* Main Content */}
      {children}
    </div>
  );
}
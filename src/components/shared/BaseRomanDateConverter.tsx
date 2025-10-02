'use client';

import React, { ReactNode } from 'react';
import { EnhancedResponsiveAd } from '@/components/ads/EnhancedResponsiveAd';

interface BaseRomanDateConverterProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export function BaseRomanDateConverter({
  title,
  description,
  children,
  className = ''
}: BaseRomanDateConverterProps) {

  return (
    <div className="w-full">
      {/* Consistent container for all content */}
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 ${className}`}>
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* Ad Break */}
        <EnhancedResponsiveAd className="my-6" format="auto" lazy={true} />

        {/* Main Content */}
        <div className="space-y-6">
          {children}
        </div>

        {/* Bottom Ad */}
        <EnhancedResponsiveAd className="my-8" format="auto" lazy={true} />
      </div>
    </div>
  );
}
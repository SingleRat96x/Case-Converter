'use client';

import React, { ReactNode } from 'react';
import { EnhancedResponsiveAd } from '@/components/ads/EnhancedResponsiveAd';

interface BasePasswordGeneratorProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export function BasePasswordGenerator({
  title,
  description,
  children,
  className = ''
}: BasePasswordGeneratorProps) {

  return (
    <div className={`w-full max-w-2xl mx-auto space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
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
  );
}
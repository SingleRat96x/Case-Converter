'use client';

import React, { ReactNode } from 'react';
import { ToolHeaderAd } from '@/components/ads/AdPlacements';

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

      {/* Tool Header Ad - below title and description */}
      <ToolHeaderAd />

      {/* Main Content */}
      <div className="space-y-6">
        {children}
      </div>

    </div>
  );
}
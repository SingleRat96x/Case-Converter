'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ImageCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export function ImageCardSkeleton({ viewMode = 'grid' }: ImageCardSkeletonProps) {
  if (viewMode === 'grid') {
    return (
      <Card className="p-3 image-card-hover">
        <div className="space-y-2">
          <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </div>
          <div className="text-xs text-center space-y-1">
            <div className="h-4 bg-muted/50 rounded animate-pulse" />
            <div className="h-3 bg-muted/30 rounded animate-pulse w-2/3 mx-auto" />
          </div>
          <div className="flex gap-1">
            <div className="flex-1 h-6 bg-muted/40 rounded animate-pulse" />
            <div className="flex-1 h-6 bg-muted/40 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 image-card-hover">
      <div className="flex items-center space-x-3">
        <div className="w-16 h-16 bg-muted/50 rounded-lg flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted/30 rounded animate-pulse w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="w-16 h-8 bg-muted/40 rounded animate-pulse" />
          <div className="w-12 h-8 bg-muted/40 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
}
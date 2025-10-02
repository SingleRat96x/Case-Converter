'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  FileImage, 
  Scissors, 
  Minimize, 
  Maximize, 
  BarChart3, 
  Zap 
} from 'lucide-react';

interface ImageCropperAnalyticsProps {
  originalWidth?: number;
  originalHeight?: number;
  originalSize?: number;
  croppedWidth?: number;
  croppedHeight?: number;
  croppedSize?: number;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface ImageCropperStats {
  originalDimensions: string;
  croppedDimensions: string;
  originalFileSize: number;
  croppedFileSize: number;
  compressionRatio: number;
  cropReduction: number;
}

export function ImageCropperAnalytics({ 
  originalWidth = 0,
  originalHeight = 0,
  originalSize = 0,
  croppedWidth = 0,
  croppedHeight = 0,
  croppedSize = 0,
  showTitle = true, 
  variant = 'default' 
}: ImageCropperAnalyticsProps) {
  const { tool } = useToolTranslations('tools/image-tools');
  
  const stats: ImageCropperStats = useMemo(() => {
    // Calculate original and cropped dimensions
    const originalDimensions = originalWidth && originalHeight ? 
      `${originalWidth}×${originalHeight}` : '0×0';
    const croppedDimensions = croppedWidth && croppedHeight ? 
      `${croppedWidth}×${croppedHeight}` : '0×0';
    
    // Calculate file sizes in KB
    const originalFileSize = originalSize / 1024;
    const croppedFileSize = croppedSize / 1024;
    
    // Calculate compression ratio
    const compressionRatio = originalSize > 0 ? 
      ((croppedSize / originalSize) * 100) : 0;
    
    // Calculate crop reduction (pixel count reduction)
    const originalPixels = originalWidth * originalHeight;
    const croppedPixels = croppedWidth * croppedHeight;
    const cropReduction = originalPixels > 0 ? 
      (((originalPixels - croppedPixels) / originalPixels) * 100) : 0;

    return {
      originalDimensions,
      croppedDimensions,
      originalFileSize,
      croppedFileSize,
      compressionRatio,
      cropReduction
    };
  }, [originalWidth, originalHeight, originalSize, croppedWidth, croppedHeight, croppedSize]);

  const statisticsData = [
    {
      key: 'originalDimensions',
      label: tool('imageCropper.analytics.originalSize'),
      value: stats.originalDimensions as string | number,
      icon: FileImage,
      color: 'text-blue-600 dark:text-blue-400',
      suffix: 'px'
    },
    {
      key: 'croppedDimensions',
      label: tool('imageCropper.analytics.croppedSize'),
      value: stats.croppedDimensions as string | number,
      icon: Scissors,
      color: 'text-green-600 dark:text-green-400',
      suffix: 'px'
    },
    {
      key: 'originalFileSize',
      label: tool('imageCropper.analytics.originalFileSize'),
      value: stats.originalFileSize.toFixed(1) as string | number,
      icon: Maximize,
      color: 'text-purple-600 dark:text-purple-400',
      suffix: 'KB'
    },
    {
      key: 'croppedFileSize',
      label: tool('imageCropper.analytics.croppedFileSize'),
      value: stats.croppedFileSize.toFixed(1) as string | number,
      icon: Minimize,
      color: 'text-orange-600 dark:text-orange-400',
      suffix: 'KB'
    },
    {
      key: 'compressionRatio',
      label: tool('imageCropper.analytics.compressionRatio'),
      value: `${stats.compressionRatio.toFixed(1)}%` as string | number,
      icon: BarChart3,
      color: stats.compressionRatio < 50 ? 'text-green-600 dark:text-green-400' : 
             stats.compressionRatio < 80 ? 'text-yellow-600 dark:text-yellow-400' : 
             'text-red-600 dark:text-red-400'
    },
    {
      key: 'cropReduction',
      label: tool('imageCropper.analytics.cropReduction'),
      value: `${stats.cropReduction.toFixed(1)}%` as string | number,
      icon: Zap,
      color: stats.cropReduction > 50 ? 'text-green-600 dark:text-green-400' : 
             stats.cropReduction > 25 ? 'text-yellow-600 dark:text-yellow-400' : 
             'text-red-600 dark:text-red-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color, suffix }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {String(value)}
              {suffix && value !== '0×0' && ` ${suffix}`}
            </span>
            <span className="text-xs text-muted-foreground text-center">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scissors className="h-5 w-5 text-primary" />
            {tool('imageCropper.analytics.title')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color, suffix }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className="text-sm font-medium text-foreground">
                {String(value)}
                {suffix && value !== '0×0' && ` ${suffix}`}
              </span>
              <span className="text-xs text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>
        
        {/* AdSense Optimized Spacing */}
        <div className="mt-4 min-h-[50px] flex items-center justify-center">
          {/* This space can be used for ads - proper spacing from content */}
          <div className="w-full border-t border-border/50"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export utility functions for external use
export function calculateImageCropperStats(
  originalWidth: number,
  originalHeight: number,
  originalSize: number,
  croppedWidth: number,
  croppedHeight: number,
  croppedSize: number
): ImageCropperStats {
  const originalDimensions = `${originalWidth}×${originalHeight}`;
  const croppedDimensions = `${croppedWidth}×${croppedHeight}`;
  
  const originalFileSize = originalSize / 1024;
  const croppedFileSize = croppedSize / 1024;
  
  const compressionRatio = originalSize > 0 ? 
    ((croppedSize / originalSize) * 100) : 0;
  
  const originalPixels = originalWidth * originalHeight;
  const croppedPixels = croppedWidth * croppedHeight;
  const cropReduction = originalPixels > 0 ? 
    (((originalPixels - croppedPixels) / originalPixels) * 100) : 0;

  return {
    originalDimensions,
    croppedDimensions,
    originalFileSize,
    croppedFileSize,
    compressionRatio,
    cropReduction
  };
}
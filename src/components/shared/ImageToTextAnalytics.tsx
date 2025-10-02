'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  FileImage, 
  FileText, 
  Eye, 
  Zap, 
  BarChart3, 
  Globe 
} from 'lucide-react';

interface ImageToTextAnalyticsProps {
  imageSize?: number;
  extractedText: string;
  confidence?: number;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface ImageToTextStats {
  imageFileSize: number;
  textLength: number;
  wordCount: number;
  lineCount: number;
  confidence: number;
  extractionRatio: number;
}

export function ImageToTextAnalytics({ 
  imageSize = 0,
  extractedText,
  confidence = 0,
  showTitle = true, 
  variant = 'default' 
}: ImageToTextAnalyticsProps) {
  const { tool } = useToolTranslations('tools/image-tools');
  
  const stats: ImageToTextStats = useMemo(() => {
    // Calculate file size in KB
    const imageFileSize = imageSize / 1024;
    
    // Calculate text metrics
    const textLength = extractedText.length;
    const wordCount = extractedText ? extractedText.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
    const lineCount = extractedText ? extractedText.split('\n').length : 0;
    
    // Calculate extraction ratio (characters per KB of image)
    const extractionRatio = imageFileSize > 0 ? (textLength / imageFileSize) : 0;

    return {
      imageFileSize,
      textLength,
      wordCount,
      lineCount,
      confidence,
      extractionRatio
    };
  }, [imageSize, extractedText, confidence]);

  const statisticsData = [
    {
      key: 'imageFileSize',
      label: tool('imageToText.analytics.imageFileSize'),
      value: stats.imageFileSize.toFixed(1),
      icon: FileImage,
      color: 'text-blue-600 dark:text-blue-400',
      suffix: 'KB'
    },
    {
      key: 'textLength',
      label: tool('imageToText.analytics.textLength'),
      value: stats.textLength,
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
      suffix: 'chars'
    },
    {
      key: 'wordCount',
      label: tool('imageToText.analytics.wordCount'),
      value: stats.wordCount,
      icon: BarChart3,
      color: 'text-purple-600 dark:text-purple-400',
      suffix: 'words'
    },
    {
      key: 'lineCount',
      label: tool('imageToText.analytics.lineCount'),
      value: stats.lineCount,
      icon: Globe,
      color: 'text-cyan-600 dark:text-cyan-400',
      suffix: 'lines'
    },
    {
      key: 'confidence',
      label: tool('imageToText.analytics.confidence'),
      value: `${stats.confidence}%`,
      icon: Eye,
      color: stats.confidence >= 80 ? 'text-green-600 dark:text-green-400' : 
             stats.confidence >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
             'text-red-600 dark:text-red-400'
    },
    {
      key: 'extractionRatio',
      label: tool('imageToText.analytics.extractionRatio'),
      value: stats.extractionRatio.toFixed(1),
      icon: Zap,
      color: stats.extractionRatio > 50 ? 'text-green-600 dark:text-green-400' : 
             stats.extractionRatio > 20 ? 'text-yellow-600 dark:text-yellow-400' : 
             'text-orange-600 dark:text-orange-400',
      suffix: 'chars/KB'
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
              {suffix && ` ${suffix}`}
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
            <FileText className="h-5 w-5 text-primary" />
            {tool('imageToText.analytics.title')}
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
                {suffix && ` ${suffix}`}
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
export function calculateImageToTextStats(
  imageSize: number,
  extractedText: string,
  confidence: number
): ImageToTextStats {
  const imageFileSize = imageSize / 1024;
  const textLength = extractedText.length;
  const wordCount = extractedText ? extractedText.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  const lineCount = extractedText ? extractedText.split('\n').length : 0;
  const extractionRatio = imageFileSize > 0 ? (textLength / imageFileSize) : 0;

  return {
    imageFileSize,
    textLength,
    wordCount,
    lineCount,
    confidence,
    extractionRatio
  };
}
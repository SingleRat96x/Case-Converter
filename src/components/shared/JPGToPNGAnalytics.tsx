'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  FileImage, 
  Move, 
  Zap, 
  Activity, 
  Percent,
  LucideIcon 
} from 'lucide-react';

interface ProcessedFile {
  processedBlob?: Blob;
}

interface JPGToPNGAnalyticsProps {
  originalFile?: File | null;
  processedFile?: ProcessedFile | null;
  variant?: 'default' | 'compact';
  showTitle?: boolean;
  className?: string;
}

interface AnalyticsData {
  key: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  isText?: boolean;
  suffix?: string;
}

export function JPGToPNGAnalytics({ 
  originalFile,
  processedFile,
  variant = 'default', 
  showTitle = true,
  className = '' 
}: JPGToPNGAnalyticsProps) {
  const { tool } = useToolTranslations('tools/image-tools');
  
  // Calculate JPG to PNG specific statistics - always show cards
  const analyticsData = React.useMemo((): AnalyticsData[] => {
    const stats: AnalyticsData[] = [];
    
    // Always show original size (with placeholder if no file)
    stats.push({
      key: 'originalSize',
      label: tool('jpgToPng.stats.originalSize'),
      value: originalFile ? (originalFile.size / 1024).toFixed(1) : '0.0',
      icon: FileImage,
      color: 'text-blue-600 dark:text-blue-400',
      suffix: 'KB'
    });
    
    // Always show PNG size (with placeholder if no processed file)
    const processedSize = processedFile?.processedBlob?.size || 0;
    const originalSize = originalFile?.size || 0;
    const sizeChange = originalSize > 0 && processedSize > 0 ? ((processedSize - originalSize) / originalSize) * 100 : 0;
    const compressionRatio = originalSize > 0 && processedSize > 0 ? (processedSize / originalSize) : 0;
    
    stats.push(
      {
        key: 'newSize',
        label: tool('jpgToPng.stats.newSize'),
        value: processedSize > 0 ? (processedSize / 1024).toFixed(1) : '0.0',
        icon: FileImage,
        color: 'text-green-600 dark:text-green-400',
        suffix: 'KB'
      },
      {
        key: 'sizeChange',
        label: tool('jpgToPng.stats.sizeChange'),
        value: sizeChange !== 0 ? (sizeChange >= 0 ? `+${sizeChange.toFixed(1)}` : sizeChange.toFixed(1)) : '0.0',
        icon: Move,
        color: sizeChange >= 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400',
        suffix: '%'
      },
      {
        key: 'compressionRatio',
        label: tool('jpgToPng.stats.sizeRatio'),
        value: compressionRatio > 0 ? `${(compressionRatio * 100).toFixed(1)}%` : '0.0%',
        icon: Percent,
        color: 'text-purple-600 dark:text-purple-400',
        isText: true
      },
      {
        key: 'quality',
        label: tool('jpgToPng.stats.quality'),
        value: 'Lossless',
        icon: Zap,
        color: 'text-cyan-600 dark:text-cyan-400',
        isText: true
      },
      {
        key: 'format',
        label: tool('jpgToPng.stats.format'),
        value: 'PNG',
        icon: Activity,
        color: 'text-pink-600 dark:text-pink-400',
        isText: true
      }
    );
    
    return stats;
  }, [originalFile, processedFile, tool]);

  if (variant === 'compact') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row gap-3 ${className}`}>
        {analyticsData.map(({ key, label, value, icon: Icon, color, isText, suffix }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow lg:flex-1"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}
              {suffix && ` ${suffix}`}
            </span>
            <span className="text-xs text-muted-foreground text-center">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            JPG to PNG Analytics
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {analyticsData.map(({ key, label, value, icon: Icon, color, isText, suffix }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">
                {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}
                {suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

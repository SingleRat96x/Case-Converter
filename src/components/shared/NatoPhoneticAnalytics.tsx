'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getConversionStats } from '@/lib/natoPhoneticUtils';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Hash, ArrowRightLeft, FileText, TrendingUp } from 'lucide-react';

interface NatoPhoneticAnalyticsProps {
  originalText: string;
  convertedText: string;
  variant?: 'default' | 'compact';
  showTitle?: boolean;
  className?: string;
}

export function NatoPhoneticAnalytics({ 
  originalText, 
  convertedText, 
  variant = 'default',
  showTitle = true,
  className = '' 
}: NatoPhoneticAnalyticsProps) {
  const { tool } = useToolTranslations('tools/miscellaneous');

  if (!originalText && !convertedText) {
    return null;
  }

  const stats = getConversionStats(originalText, convertedText);

  const statisticsData = [
    {
      key: 'originalLength',
      label: tool('natoPhonetic.stats.originalLength'),
      value: stats.originalLength,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'convertedLength',
      label: tool('natoPhonetic.stats.convertedLength'),
      value: stats.convertedLength,
      icon: ArrowRightLeft,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'wordCount',
      label: tool('natoPhonetic.stats.wordCount'),
      value: stats.wordCount,
      icon: Hash,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'expansionRatio',
      label: tool('natoPhonetic.stats.compressionRatio'),
      value: `${stats.compressionRatio}x`,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
        {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground text-center">
              {typeof value === 'string' ? value : value.toLocaleString()}
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
          <CardTitle className="text-base">Conversion Statistics</CardTitle>
          <CardDescription>
            Analysis of your NATO phonetic alphabet conversion
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
            <div
              key={key}
              className="flex flex-col items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Icon className={`h-5 w-5 mb-2 ${color}`} />
              <span className="text-lg font-semibold text-foreground text-center">
                {typeof value === 'string' ? value : value.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground text-center mt-1">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
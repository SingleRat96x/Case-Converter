'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Type, Repeat, Hash, BarChart3, Minus } from 'lucide-react';

interface RepeatTextAnalyticsProps {
  originalText: string;
  repeatedText: string;
  repeatCount: number;
  separator: string;
  separatorType: 'newline' | 'space' | 'none' | 'custom';
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface RepeatTextStats {
  originalLength: number;
  repeatedLength: number;
  repeatCount: number;
  separatorLength: number;
  compressionRatio: number;
}

export function RepeatTextAnalytics({ 
  originalText, 
  repeatedText, 
  repeatCount,
  separator,
  separatorType,
  showTitle = true, 
  variant = 'default' 
}: RepeatTextAnalyticsProps) {
  const { tool } = useToolTranslations('tools/text-generators');
  
  const stats: RepeatTextStats = useMemo(() => {
    const originalLength = originalText.length;
    const repeatedLength = repeatedText.length;
    const separatorLength = separator.length;
    const compressionRatio = originalLength > 0 ? Math.round((repeatedLength / originalLength) * 100) / 100 : 0;

    return {
      originalLength,
      repeatedLength,
      repeatCount,
      separatorLength,
      compressionRatio
    };
  }, [originalText, repeatedText, repeatCount, separator]);

  const getSeparatorDisplayName = (type: string) => {
    switch (type) {
      case 'newline': return tool('repeatText.separators.newline');
      case 'space': return tool('repeatText.separators.space');  
      case 'none': return tool('repeatText.separators.none');
      case 'custom': return tool('repeatText.separators.custom');
      default: return type;
    }
  };

  const statisticsData = [
    {
      key: 'original',
      label: tool('repeatText.analytics.originalLength'),
      value: stats.originalLength,
      icon: Type,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'repeatCount',
      label: tool('repeatText.analytics.repeatCount'),
      value: stats.repeatCount,
      icon: Repeat,
      color: 'text-green-600 dark:text-green-400',
      suffix: 'x'
    },
    {
      key: 'separator',
      label: tool('repeatText.analytics.separatorType'),
      value: getSeparatorDisplayName(separatorType),
      icon: Minus,
      color: 'text-purple-600 dark:text-purple-400',
      isText: true
    },
    {
      key: 'total',
      label: tool('repeatText.analytics.totalLength'),
      value: stats.repeatedLength,
      icon: Hash,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'ratio',
      label: tool('repeatText.analytics.expansionRatio'),
      value: stats.compressionRatio,
      icon: BarChart3,
      color: 'text-red-600 dark:text-red-400',
      suffix: 'x'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color, suffix, isText }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {isText ? value : `${typeof value === 'number' ? value.toLocaleString() : value}${suffix || ''}`}
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
            <Repeat className="h-5 w-5 text-primary" />
            {tool('repeatText.analytics.title')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color, suffix, isText }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className="text-sm font-medium text-foreground">
                {isText ? value : `${typeof value === 'number' ? value.toLocaleString() : value}${suffix || ''}`}
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
export function calculateRepeatTextStats(
  originalText: string, 
  repeatedText: string, 
  repeatCount: number, 
  separator: string
): RepeatTextStats {
  const originalLength = originalText.length;
  const repeatedLength = repeatedText.length;
  const separatorLength = separator.length;
  const compressionRatio = originalLength > 0 ? Math.round((repeatedLength / originalLength) * 100) / 100 : 0;

  return {
    originalLength,
    repeatedLength,
    repeatCount,
    separatorLength,
    compressionRatio
  };
}
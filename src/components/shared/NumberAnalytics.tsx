'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { BarChart3, Hash, TrendingUp, TrendingDown, Target, Calculator } from 'lucide-react';

interface NumberAnalyticsProps {
  numbers: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface NumberStats {
  count: number;
  min: number;
  max: number;
  range: number;
  sum: number;
  average: number;
}

export function NumberAnalytics({ numbers, showTitle = true, variant = 'default' }: NumberAnalyticsProps) {
  const { tSync } = useCommonTranslations();
  
  const stats: NumberStats = useMemo(() => {
    if (!numbers || numbers.trim().length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        range: 0,
        sum: 0,
        average: 0
      };
    }

    // Parse numbers from the text
    const numberArray = numbers
      .split(/[\n,\s]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0)
      .map(n => parseFloat(n))
      .filter(n => !isNaN(n));

    if (numberArray.length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        range: 0,
        sum: 0,
        average: 0
      };
    }

    const count = numberArray.length;
    const min = Math.min(...numberArray);
    const max = Math.max(...numberArray);
    const range = max - min;
    const sum = numberArray.reduce((acc, num) => acc + num, 0);
    const average = sum / count;

    return {
      count,
      min,
      max,
      range,
      sum,
      average: Math.round(average * 100) / 100 // Round to 2 decimal places
    };
  }, [numbers]);

  const statisticsData = [
    {
      key: 'count',
      label: tSync('analytics.count'),
      value: stats.count,
      icon: Hash,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'min',
      label: tSync('analytics.minimum'),
      value: stats.min,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      key: 'max',
      label: tSync('analytics.maximum'),
      value: stats.max,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'range',
      label: tSync('analytics.range'),
      value: stats.range,
      icon: Target,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'sum',
      label: tSync('analytics.sum'),
      value: stats.sum,
      icon: Calculator,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'average',
      label: tSync('analytics.average'),
      value: stats.average,
      icon: BarChart3,
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
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
            <BarChart3 className="h-5 w-5 text-primary" />
            {tSync('analytics.numberStatistics')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
            <div
              key={key}
              className="flex flex-col items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Icon className={`h-5 w-5 mb-2 ${color}`} />
              <span className="text-lg font-semibold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              <span className="text-sm text-muted-foreground text-center mt-1">{label}</span>
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
export function calculateNumberStats(numbers: string): NumberStats {
  if (!numbers || numbers.trim().length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      range: 0,
      sum: 0,
      average: 0
    };
  }

  const numberArray = numbers
    .split(/[\n,\s]+/)
    .map(n => n.trim())
    .filter(n => n.length > 0)
    .map(n => parseFloat(n))
    .filter(n => !isNaN(n));

  if (numberArray.length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      range: 0,
      sum: 0,
      average: 0
    };
  }

  const count = numberArray.length;
  const min = Math.min(...numberArray);
  const max = Math.max(...numberArray);
  const range = max - min;
  const sum = numberArray.reduce((acc, num) => acc + num, 0);
  const average = Math.round((sum / count) * 100) / 100;

  return {
    count,
    min,
    max,
    range,
    sum,
    average
  };
}
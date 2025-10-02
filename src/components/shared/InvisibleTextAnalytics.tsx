'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Eye, EyeOff, Hash, BarChart3 } from 'lucide-react';

interface InvisibleTextAnalyticsProps {
  originalText: string;
  invisibleText: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface InvisibleTextStats {
  visibleChars: number;
  invisibleChars: number;
  totalChars: number;
  invisibilityRatio: number;
}

export function InvisibleTextAnalytics({ 
  originalText, 
  invisibleText, 
  showTitle = true, 
  variant = 'default' 
}: InvisibleTextAnalyticsProps) {
  const { tool } = useToolTranslations('tools/text-generators');
  
  const stats: InvisibleTextStats = useMemo(() => {
    const visibleChars = originalText.length;
    const totalChars = invisibleText.length;
    const invisibleChars = totalChars - visibleChars;
    const invisibilityRatio = visibleChars > 0 ? Math.round((invisibleChars / totalChars) * 100) : 0;

    return {
      visibleChars,
      invisibleChars,
      totalChars,
      invisibilityRatio
    };
  }, [originalText, invisibleText]);

  const statisticsData = [
    {
      key: 'visible',
      label: tool('invisibleText.stats.visible'),
      value: stats.visibleChars,
      icon: Eye,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'invisible',
      label: tool('invisibleText.stats.invisible'),
      value: stats.invisibleChars,
      icon: EyeOff,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'total',
      label: tool('invisibleText.stats.total'),
      value: stats.totalChars,
      icon: Hash,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'ratio',
      label: tool('invisibleText.stats.invisibilityRatio'),
      value: stats.invisibilityRatio,
      icon: BarChart3,
      color: 'text-purple-600 dark:text-purple-400',
      suffix: '%'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color, suffix }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {value.toLocaleString()}{suffix || ''}
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
            <EyeOff className="h-5 w-5 text-primary" />
            Invisible Text Analysis
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color, suffix }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className="text-sm font-medium text-foreground">
                {value.toLocaleString()}{suffix || ''}
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
export function calculateInvisibleTextStats(originalText: string, invisibleText: string): InvisibleTextStats {
  const visibleChars = originalText.length;
  const totalChars = invisibleText.length;
  const invisibleChars = totalChars - visibleChars;
  const invisibilityRatio = visibleChars > 0 ? Math.round((invisibleChars / totalChars) * 100) : 0;

  return {
    visibleChars,
    invisibleChars,
    totalChars,
    invisibilityRatio
  };
}
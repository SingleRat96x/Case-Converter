'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Type, Minus, FileText, ArrowDown, BarChart3 } from 'lucide-react';

interface RemoveLineBreaksAnalyticsProps {
  originalText: string;
  convertedText: string;
  preserveParagraphs: boolean;
  replaceWith: 'space' | 'nothing';
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface LineBreakStats {
  originalLength: number;
  convertedLength: number;
  lineBreaksRemoved: number;
  linesOriginal: number;
  linesConverted: number;
  reductionPercentage: number;
}

export function RemoveLineBreaksAnalytics({ 
  originalText, 
  convertedText, 
  preserveParagraphs,
  replaceWith,
  showTitle = true, 
  variant = 'default' 
}: RemoveLineBreaksAnalyticsProps) {
  const { tool } = useToolTranslations('tools/text-generators');
  
  const stats: LineBreakStats = useMemo(() => {
    const originalLength = originalText.length;
    const convertedLength = convertedText.length;
    const linesOriginal = originalText ? originalText.split('\n').length : 0;
    const linesConverted = convertedText ? convertedText.split('\n').length : 0;
    const lineBreaksRemoved = Math.max(0, linesOriginal - linesConverted);
    const reductionPercentage = originalLength > 0 ? Math.round(((originalLength - convertedLength) / originalLength) * 100) : 0;

    return {
      originalLength,
      convertedLength,
      lineBreaksRemoved,
      linesOriginal,
      linesConverted,
      reductionPercentage
    };
  }, [originalText, convertedText]);

  const getProcessingMode = () => {
    const modes = [];
    if (preserveParagraphs) modes.push(tool('removeLineBreaks.analytics.preserveParagraphs'));
    else modes.push(tool('removeLineBreaks.analytics.removeAll'));
    
    if (replaceWith === 'space') modes.push(tool('removeLineBreaks.analytics.withSpaces'));
    else modes.push(tool('removeLineBreaks.analytics.withoutSpaces'));
    
    return modes.join(', ');
  };

  const statisticsData = [
    {
      key: 'originalLines',
      label: tool('removeLineBreaks.analytics.originalLines'),
      value: stats.linesOriginal,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'lineBreaksRemoved',
      label: tool('removeLineBreaks.analytics.lineBreaksRemoved'),
      value: stats.lineBreaksRemoved,
      icon: Minus,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      key: 'processingMode',
      label: tool('removeLineBreaks.analytics.processingMode'),
      value: getProcessingMode(),
      icon: ArrowDown,
      color: 'text-purple-600 dark:text-purple-400',
      isText: true
    },
    {
      key: 'convertedLines',
      label: tool('removeLineBreaks.analytics.convertedLines'),
      value: stats.linesConverted,
      icon: Type,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'reduction',
      label: tool('removeLineBreaks.analytics.lengthReduction'),
      value: stats.reductionPercentage >= 0 ? `${stats.reductionPercentage}%` : `+${Math.abs(stats.reductionPercentage)}%`,
      icon: BarChart3,
      color: stats.reductionPercentage > 0 ? 'text-green-600 dark:text-green-400' : 
             stats.reductionPercentage < 0 ? 'text-red-600 dark:text-red-400' : 
             'text-gray-600 dark:text-gray-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color, isText }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {isText ? (
                <span className="text-xs text-center max-w-full break-words">{value}</span>
              ) : (
                typeof value === 'number' ? value.toLocaleString() : value
              )}
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
            <Minus className="h-5 w-5 text-primary" />
            {tool('removeLineBreaks.analytics.title')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color, isText }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className="text-sm font-medium text-foreground">
                {isText ? (
                  <span className="text-xs text-center max-w-full break-words">{value}</span>
                ) : (
                  typeof value === 'number' ? value.toLocaleString() : value
                )}
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
export function calculateLineBreakStats(
  originalText: string, 
  convertedText: string
): LineBreakStats {
  const originalLength = originalText.length;
  const convertedLength = convertedText.length;
  const linesOriginal = originalText ? originalText.split('\n').length : 0;
  const linesConverted = convertedText ? convertedText.split('\n').length : 0;
  const lineBreaksRemoved = Math.max(0, linesOriginal - linesConverted);
  const reductionPercentage = originalLength > 0 ? Math.round(((originalLength - convertedLength) / originalLength) * 100) : 0;

  return {
    originalLength,
    convertedLength,
    lineBreaksRemoved,
    linesOriginal,
    linesConverted,
    reductionPercentage
  };
}
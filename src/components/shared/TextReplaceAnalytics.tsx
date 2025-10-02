'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Type, Search, Replace, Hash, BarChart3 } from 'lucide-react';

interface TextReplaceAnalyticsProps {
  originalText: string;
  replacedText: string;
  findText: string;
  replaceText: string;
  matchCount: number;
  options: {
    caseSensitive: boolean;
    wholeWord: boolean;
    useRegex: boolean;
  };
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface TextReplaceStats {
  originalLength: number;
  replacedLength: number;
  findLength: number;
  replaceLength: number;
  matchesFound: number;
  lengthDifference: number;
}

export function TextReplaceAnalytics({ 
  originalText, 
  replacedText, 
  findText,
  replaceText,
  matchCount,
  options,
  showTitle = true, 
  variant = 'default' 
}: TextReplaceAnalyticsProps) {
  const { tool } = useToolTranslations('tools/text-generators');
  
  const stats: TextReplaceStats = useMemo(() => {
    const originalLength = originalText.length;
    const replacedLength = replacedText.length;
    const findLength = findText.length;
    const replaceLength = replaceText.length;
    const matchesFound = matchCount;
    const lengthDifference = replacedLength - originalLength;

    return {
      originalLength,
      replacedLength,
      findLength,
      replaceLength,
      matchesFound,
      lengthDifference
    };
  }, [originalText, replacedText, findText, replaceText, matchCount]);

  const getOperationType = () => {
    const types = [];
    if (options.caseSensitive) types.push(tool('textReplace.analytics.caseSensitive'));
    if (options.wholeWord) types.push(tool('textReplace.analytics.wholeWord'));
    if (options.useRegex) types.push(tool('textReplace.analytics.regex'));
    
    return types.length > 0 ? types.join(', ') : tool('textReplace.analytics.standard');
  };

  const statisticsData = [
    {
      key: 'original',
      label: tool('textReplace.analytics.originalLength'),
      value: stats.originalLength,
      icon: Type,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'matches',
      label: tool('textReplace.analytics.matchesFound'),
      value: stats.matchesFound,
      icon: Search,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'operation',
      label: tool('textReplace.analytics.operationType'),
      value: getOperationType(),
      icon: Replace,
      color: 'text-purple-600 dark:text-purple-400',
      isText: true
    },
    {
      key: 'replaced',
      label: tool('textReplace.analytics.replacedLength'),
      value: stats.replacedLength,
      icon: Hash,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'difference',
      label: tool('textReplace.analytics.lengthDifference'),
      value: stats.lengthDifference >= 0 ? `+${stats.lengthDifference}` : stats.lengthDifference.toString(),
      icon: BarChart3,
      color: stats.lengthDifference > 0 ? 'text-green-600 dark:text-green-400' : 
             stats.lengthDifference < 0 ? 'text-red-600 dark:text-red-400' : 
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
            <Replace className="h-5 w-5 text-primary" />
            {tool('textReplace.analytics.title')}
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
export function calculateTextReplaceStats(
  originalText: string, 
  replacedText: string, 
  findText: string,
  replaceText: string,
  matchCount: number
): TextReplaceStats {
  const originalLength = originalText.length;
  const replacedLength = replacedText.length;
  const findLength = findText.length;
  const replaceLength = replaceText.length;
  const matchesFound = matchCount;
  const lengthDifference = replacedLength - originalLength;

  return {
    originalLength,
    replacedLength,
    findLength,
    replaceLength,
    matchesFound,
    lengthDifference
  };
}
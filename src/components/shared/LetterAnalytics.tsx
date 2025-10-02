'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { BarChart3, Hash, Type, Palette, Globe, Zap } from 'lucide-react';

interface LetterAnalyticsProps {
  letters: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface LetterStats {
  count: number;
  uniqueLetters: number;
  uppercaseCount: number;
  lowercaseCount: number;
  mostCommon: string;
  mostCommonCount: number;
}

export function LetterAnalytics({ letters, showTitle = true, variant = 'default' }: LetterAnalyticsProps) {
  const { tSync } = useCommonTranslations();
  
  const stats: LetterStats = useMemo(() => {
    if (!letters || letters.trim().length === 0) {
      return {
        count: 0,
        uniqueLetters: 0,
        uppercaseCount: 0,
        lowercaseCount: 0,
        mostCommon: '-',
        mostCommonCount: 0
      };
    }

    // Parse letters from the text (remove spaces, newlines, etc.)
    const letterArray = letters
      .split(/[\n,\s]+/)
      .join('')
      .split('')
      .filter(char => /[A-Za-z]/.test(char));

    if (letterArray.length === 0) {
      return {
        count: 0,
        uniqueLetters: 0,
        uppercaseCount: 0,
        lowercaseCount: 0,
        mostCommon: '-',
        mostCommonCount: 0
      };
    }

    // Count frequency
    const frequency: { [key: string]: number } = {};
    let uppercaseCount = 0;
    let lowercaseCount = 0;

    letterArray.forEach(letter => {
      frequency[letter] = (frequency[letter] || 0) + 1;
      if (letter >= 'A' && letter <= 'Z') {
        uppercaseCount++;
      } else if (letter >= 'a' && letter <= 'z') {
        lowercaseCount++;
      }
    });

    // Find most common letter
    let mostCommon = '-';
    let mostCommonCount = 0;
    Object.entries(frequency).forEach(([letter, count]) => {
      if (count > mostCommonCount) {
        mostCommon = letter;
        mostCommonCount = count;
      }
    });

    const count = letterArray.length;
    const uniqueLetters = Object.keys(frequency).length;

    return {
      count,
      uniqueLetters,
      uppercaseCount,
      lowercaseCount,
      mostCommon,
      mostCommonCount
    };
  }, [letters]);

  const statisticsData = [
    {
      key: 'count',
      label: tSync('analytics.totalLetters'),
      value: stats.count,
      icon: Hash,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'unique',
      label: tSync('analytics.uniqueLetters'),
      value: stats.uniqueLetters,
      icon: Zap,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'uppercase',
      label: tSync('analytics.uppercase'),
      value: stats.uppercaseCount,
      icon: Type,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'lowercase',
      label: tSync('analytics.lowercase'),
      value: stats.lowercaseCount,
      icon: Palette,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'mostCommon',
      label: tSync('analytics.mostCommon'),
      value: `${stats.mostCommon} (${stats.mostCommonCount})`,
      icon: Globe,
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {typeof value === 'string' ? value : value.toLocaleString()}
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
            {tSync('analytics.letterStatistics')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
            <div
              key={key}
              className="flex flex-col items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Icon className={`h-5 w-5 mb-2 ${color}`} />
              <span className="text-lg font-semibold text-foreground">
                {typeof value === 'string' ? value : value.toLocaleString()}
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
export function calculateLetterStats(letters: string): LetterStats {
  if (!letters || letters.trim().length === 0) {
    return {
      count: 0,
      uniqueLetters: 0,
      uppercaseCount: 0,
      lowercaseCount: 0,
      mostCommon: '-',
      mostCommonCount: 0
    };
  }

  const letterArray = letters
    .split(/[\n,\s]+/)
    .join('')
    .split('')
    .filter(char => /[A-Za-z]/.test(char));

  if (letterArray.length === 0) {
    return {
      count: 0,
      uniqueLetters: 0,
      uppercaseCount: 0,
      lowercaseCount: 0,
      mostCommon: '-',
      mostCommonCount: 0
    };
  }

  const frequency: { [key: string]: number } = {};
  let uppercaseCount = 0;
  let lowercaseCount = 0;

  letterArray.forEach(letter => {
    frequency[letter] = (frequency[letter] || 0) + 1;
    if (letter >= 'A' && letter <= 'Z') {
      uppercaseCount++;
    } else if (letter >= 'a' && letter <= 'z') {
      lowercaseCount++;
    }
  });

  let mostCommon = '-';
  let mostCommonCount = 0;
  Object.entries(frequency).forEach(([letter, count]) => {
    if (count > mostCommonCount) {
      mostCommon = letter;
      mostCommonCount = count;
    }
  });

  return {
    count: letterArray.length,
    uniqueLetters: Object.keys(frequency).length,
    uppercaseCount,
    lowercaseCount,
    mostCommon,
    mostCommonCount
  };
}
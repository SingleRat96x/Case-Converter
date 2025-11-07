'use client';

import React from 'react';
import { Clock, BookOpen, Hash, Type } from 'lucide-react';
import { formatReadingTime, getTimeFormatLabel, type ReadingTimeResult } from '@/lib/readingTimeUtils';
import { useToolTranslations } from '@/lib/i18n/hooks';

interface ReadingTimeAnalyticsProps {
  silentTime: ReadingTimeResult;
  aloudTime: ReadingTimeResult;
  wordCount: number;
  characterCount: number;
}

export function ReadingTimeAnalytics({ 
  silentTime, 
  aloudTime, 
  wordCount,
  characterCount 
}: ReadingTimeAnalyticsProps) {
  const { tool } = useToolTranslations('tools/misc-tools');
  
  const statisticsData = [
    {
      key: 'aloud',
      label: tool('readingTimeEstimator.analyticsReadAloud'),
      value: formatReadingTime(aloudTime.hours, aloudTime.minutes, aloudTime.seconds),
      subLabel: getTimeFormatLabel(aloudTime.hours),
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'silent',
      label: tool('readingTimeEstimator.analyticsReadingTime'),
      value: formatReadingTime(silentTime.hours, silentTime.minutes, silentTime.seconds),
      subLabel: getTimeFormatLabel(silentTime.hours),
      icon: Clock,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'words',
      label: tool('readingTimeEstimator.analyticsWords'),
      value: wordCount.toLocaleString(),
      subLabel: '',
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'characters',
      label: tool('readingTimeEstimator.analyticsCharacters'),
      value: characterCount.toLocaleString(),
      subLabel: '',
      icon: Type,
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statisticsData.map(({ key, label, value, subLabel, icon: Icon, color }) => (
        <div
          key={key}
          className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
        >
          <Icon className={`h-4 w-4 mb-1 ${color}`} />
          <span className="text-sm font-medium text-foreground">{value}</span>
          {subLabel && (
            <span className="text-xs text-muted-foreground mt-0.5">{subLabel}</span>
          )}
          <span className="text-xs text-muted-foreground text-center mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}

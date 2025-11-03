'use client';

import React from 'react';
import { Clock, BookOpen, Hash, Type } from 'lucide-react';
import { formatReadingTime, type ReadingTimeResult } from '@/lib/readingTimeUtils';

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
  
  const statisticsData = [
    {
      key: 'aloud',
      label: 'READ ALOUD TIME',
      value: formatReadingTime(aloudTime.minutes, aloudTime.seconds),
      subLabel: 'mins:secs',
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'silent',
      label: 'READING TIME',
      value: formatReadingTime(silentTime.minutes, silentTime.seconds),
      subLabel: 'mins:secs',
      icon: Clock,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'words',
      label: 'WORDS',
      value: wordCount.toLocaleString(),
      subLabel: '',
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'characters',
      label: 'CHARACTERS',
      value: characterCount.toLocaleString(),
      subLabel: '',
      icon: Type,
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statisticsData.map(({ key, label, value, subLabel, icon: Icon, color }) => (
        <div
          key={key}
          className="flex flex-col items-center p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
        >
          <Icon className={`h-5 w-5 mb-2 ${color}`} />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {label}
          </span>
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {subLabel && (
            <span className="text-xs text-muted-foreground mt-1">{subLabel}</span>
          )}
        </div>
      ))}
    </div>
  );
}

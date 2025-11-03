'use client';

import React from 'react';
import { Clock, BarChart3, Timer } from 'lucide-react';
import { formatReadingTime, formatReadingRange, type ReadingTimeResult } from '@/lib/readingTimeUtils';

interface ReadingTimeAnalyticsProps {
  results: ReadingTimeResult;
  currentWpm: number;
  speedPreset: string;
  title?: string;
  icon?: React.ElementType;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

export function ReadingTimeAnalytics({ 
  results, 
  currentWpm, 
  speedPreset,
  title = "Reading Time Estimate",
  icon: Icon = Clock,
  showTitle = true, 
  variant = 'default' 
}: ReadingTimeAnalyticsProps) {
  
  if (!results || results.wordCount === 0) {
    return null;
  }

  const StatItem = ({ icon: StatIcon, label, value, highlight = false }: { 
    icon: React.ElementType; 
    label: string; 
    value: string | number;
    highlight?: boolean;
  }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      highlight 
        ? 'bg-primary/10 border border-primary/20' 
        : 'bg-muted/50'
    }`}>
      <div className="flex items-center gap-2">
        <StatIcon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`text-lg font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className="space-y-4 p-6 rounded-lg border bg-card">
        {showTitle && (
          <div className="flex items-center gap-2 pb-3 border-b">
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}

        <div className="grid gap-3">
          {/* Main reading time - highlighted */}
          <StatItem
            icon={Clock}
            label="Estimated time"
            value={formatReadingTime(results.minutes, results.seconds)}
            highlight={true}
          />

          {/* Word count */}
          {results.wordCount > 0 && (
            <StatItem
              icon={BarChart3}
              label="Word count"
              value={`${results.wordCount.toLocaleString()}`}
            />
          )}

          {/* Reading time range */}
          <StatItem
            icon={Timer}
            label="Time range"
            value={formatReadingRange(results.range.min, results.range.max)}
          />
        </div>

        {/* Reading speed info */}
        <div className="pt-3 text-xs text-muted-foreground text-center border-t">
          Based on {currentWpm} words per minute
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-4 p-6 rounded-lg border bg-card">
      {showTitle && (
        <div className="flex items-center gap-2 pb-3 border-b">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}

      <div className="grid gap-3">
        {/* Main reading time */}
        <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-sm font-medium text-muted-foreground">
            Estimated time:
          </span>
          <span className="text-2xl font-bold text-primary">
            {formatReadingTime(results.minutes, results.seconds)}
          </span>
        </div>

        {/* Word count */}
        {results.wordCount > 0 && (
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Word count:
            </span>
            <span className="text-lg font-semibold">
              {results.wordCount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Reading time range */}
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Time range:
          </span>
          <span className="text-lg font-semibold">
            {formatReadingRange(results.range.min, results.range.max)}
          </span>
        </div>
      </div>

      {/* Reading speed info */}
      <div className="pt-3 border-t text-xs text-muted-foreground text-center">
        Based on {currentWpm} words per minute
      </div>
    </div>
  );
}

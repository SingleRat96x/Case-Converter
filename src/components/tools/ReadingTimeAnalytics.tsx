'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, BookOpen, BarChart3, Timer } from 'lucide-react';
import { formatReadingTime, formatReadingRange, type ReadingTimeResult } from '@/lib/readingTimeUtils';

interface ReadingTimeAnalyticsProps {
  results: ReadingTimeResult;
  currentWpm: number;
  speedPreset: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

export function ReadingTimeAnalytics({ 
  results, 
  currentWpm, 
  speedPreset,
  showTitle = true, 
  variant = 'default' 
}: ReadingTimeAnalyticsProps) {
  
  if (!results || results.wordCount === 0) {
    return null;
  }

  const StatItem = ({ icon: Icon, label, value, highlight = false }: { 
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
        <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`text-lg font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {showTitle && (
          <div className="flex items-center gap-2 pb-2 border-b">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Reading Time Estimate</h3>
          </div>
        )}

        <div className="grid gap-3">
          {/* Main reading time - highlighted */}
          <StatItem
            icon={Clock}
            label="Estimated reading time"
            value={formatReadingTime(results.minutes, results.seconds)}
            highlight={true}
          />

          {/* Word count */}
          {results.wordCount > 0 && (
            <StatItem
              icon={BarChart3}
              label="Word count"
              value={`${results.wordCount.toLocaleString()} words`}
            />
          )}

          {/* Reading time range */}
          <StatItem
            icon={Timer}
            label="Reading time range"
            value={formatReadingRange(results.range.min, results.range.max)}
          />

          {/* Out-loud time (if not already selected) */}
          {speedPreset !== 'outloud' && results.outLoudMinutes > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-200">Out loud</span>
              </div>
              <span className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                about {results.outLoudMinutes} min
              </span>
            </div>
          )}
        </div>

        {/* Reading speed info */}
        <div className="pt-2 text-xs text-muted-foreground text-center border-t">
          Based on {currentWpm} words per minute
        </div>
      </div>
    );
  }

  // Default variant (card view)
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Reading Time Estimate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {/* Main reading time */}
          <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium text-muted-foreground">
              Estimated reading time:
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatReadingTime(results.minutes, results.seconds)}
            </span>
          </div>

          {/* Word count */}
          {results.wordCount > 0 && (
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Approximate word count:
              </span>
              <span className="text-lg font-semibold">
                {results.wordCount.toLocaleString()} words
              </span>
            </div>
          )}

          {/* Reading time range */}
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Reading time range:
            </span>
            <span className="text-lg font-semibold">
              {formatReadingRange(results.range.min, results.range.max)}
            </span>
          </div>

          {/* Out-loud time */}
          {speedPreset !== 'outloud' && results.outLoudMinutes > 0 && (
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Out loud:
              </span>
              <span className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                about {results.outLoudMinutes} minute{results.outLoudMinutes === 1 ? '' : 's'}
              </span>
            </div>
          )}
        </div>

        {/* Reading speed info */}
        <div className="pt-3 border-t text-xs text-muted-foreground text-center">
          Based on {currentWpm} words per minute
        </div>
      </CardContent>
    </Card>
  );
}

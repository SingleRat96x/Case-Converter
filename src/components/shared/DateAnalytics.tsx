'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { BarChart3, Hash, Calendar, Clock, CalendarDays, TrendingUp } from 'lucide-react';

interface DateAnalyticsProps {
  dates: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface DateStats {
  count: number;
  uniqueDates: number;
  earliestDate: string;
  latestDate: string;
  dateRange: number;
  mostCommonYear: string;
}

export function DateAnalytics({ dates, showTitle = true, variant = 'default' }: DateAnalyticsProps) {
  const { tSync } = useCommonTranslations();
  
  const stats: DateStats = useMemo(() => {
    if (!dates || dates.trim().length === 0) {
      return {
        count: 0,
        uniqueDates: 0,
        earliestDate: '-',
        latestDate: '-',
        dateRange: 0,
        mostCommonYear: '-'
      };
    }

    // Parse dates from the text
    const dateLines = dates
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (dateLines.length === 0) {
      return {
        count: 0,
        uniqueDates: 0,
        earliestDate: '-',
        latestDate: '-',
        dateRange: 0,
        mostCommonYear: '-'
      };
    }

    // Convert to Date objects and filter valid dates
    const parsedDates = dateLines
      .map(dateStr => {
        // Handle different date formats
        let date: Date;
        
        // Try ISO format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          date = new Date(dateStr);
        }
        // Try US format (MM/DD/YYYY)
        else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
          date = new Date(dateStr);
        }
        // Try EU format (DD/MM/YYYY) - convert to MM/DD/YYYY
        else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
          const parts = dateStr.split('/');
          date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
        }
        // Try readable format (Month DD, YYYY)
        else {
          date = new Date(dateStr);
        }
        
        return { original: dateStr, parsed: date, valid: !isNaN(date.getTime()) };
      })
      .filter(item => item.valid);

    if (parsedDates.length === 0) {
      return {
        count: dateLines.length,
        uniqueDates: 0,
        earliestDate: '-',
        latestDate: '-',
        dateRange: 0,
        mostCommonYear: '-'
      };
    }

    // Calculate statistics
    const validDates = parsedDates.map(item => item.parsed);
    const uniqueDateStrings = new Set(parsedDates.map(item => item.original));
    
    const sortedDates = validDates.sort((a, b) => a.getTime() - b.getTime());
    const earliest = sortedDates[0];
    const latest = sortedDates[sortedDates.length - 1];
    
    const dateRange = Math.floor((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Find most common year
    const yearCounts: { [key: string]: number } = {};
    validDates.forEach(date => {
      const year = date.getFullYear().toString();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    let mostCommonYear = '-';
    let maxCount = 0;
    Object.entries(yearCounts).forEach(([year, count]) => {
      if (count > maxCount) {
        mostCommonYear = year;
        maxCount = count;
      }
    });

    return {
      count: dateLines.length,
      uniqueDates: uniqueDateStrings.size,
      earliestDate: earliest.toLocaleDateString(),
      latestDate: latest.toLocaleDateString(),
      dateRange,
      mostCommonYear: `${mostCommonYear} (${maxCount})`
    };
  }, [dates]);

  const statisticsData = [
    {
      key: 'count',
      label: tSync('analytics.totalDates'),
      value: stats.count,
      icon: Hash,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'unique',
      label: tSync('analytics.uniqueDates'),
      value: stats.uniqueDates,
      icon: CalendarDays,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'earliest',
      label: tSync('analytics.earliestDate'),
      value: stats.earliestDate,
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'latest',
      label: tSync('analytics.latestDate'),
      value: stats.latestDate,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'range',
      label: tSync('analytics.dateRange'),
      value: `${stats.dateRange} ${stats.dateRange === 1 ? 'day' : 'days'}`,
      icon: TrendingUp,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      key: 'commonYear',
      label: tSync('analytics.mostCommonYear'),
      value: stats.mostCommonYear,
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
            <span className="text-sm font-medium text-foreground text-center">
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
            {tSync('analytics.dateStatistics')}
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
              <span className="text-lg font-semibold text-foreground text-center">
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
export function calculateDateStats(dates: string): DateStats {
  if (!dates || dates.trim().length === 0) {
    return {
      count: 0,
      uniqueDates: 0,
      earliestDate: '-',
      latestDate: '-',
      dateRange: 0,
      mostCommonYear: '-'
    };
  }

  const dateLines = dates
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (dateLines.length === 0) {
    return {
      count: 0,
      uniqueDates: 0,
      earliestDate: '-',
      latestDate: '-',
      dateRange: 0,
      mostCommonYear: '-'
    };
  }

  const parsedDates = dateLines
    .map(dateStr => {
      let date: Date;
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        date = new Date(dateStr);
      } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        date = new Date(dateStr);
      } else {
        date = new Date(dateStr);
      }
      
      return { original: dateStr, parsed: date, valid: !isNaN(date.getTime()) };
    })
    .filter(item => item.valid);

  if (parsedDates.length === 0) {
    return {
      count: dateLines.length,
      uniqueDates: 0,
      earliestDate: '-',
      latestDate: '-',
      dateRange: 0,
      mostCommonYear: '-'
    };
  }

  const validDates = parsedDates.map(item => item.parsed);
  const uniqueDateStrings = new Set(parsedDates.map(item => item.original));
  
  const sortedDates = validDates.sort((a, b) => a.getTime() - b.getTime());
  const earliest = sortedDates[0];
  const latest = sortedDates[sortedDates.length - 1];
  
  const dateRange = Math.floor((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const yearCounts: { [key: string]: number } = {};
  validDates.forEach(date => {
    const year = date.getFullYear().toString();
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  });
  
  let mostCommonYear = '-';
  let maxCount = 0;
  Object.entries(yearCounts).forEach(([year, count]) => {
    if (count > maxCount) {
      mostCommonYear = year;
      maxCount = count;
    }
  });

  return {
    count: dateLines.length,
    uniqueDates: uniqueDateStrings.size,
    earliestDate: earliest.toLocaleDateString(),
    latestDate: latest.toLocaleDateString(),
    dateRange,
    mostCommonYear: `${mostCommonYear} (${maxCount})`
  };
}
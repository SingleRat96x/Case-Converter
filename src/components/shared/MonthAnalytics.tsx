'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { BarChart3, Hash, Calendar, Clock, CalendarDays, TrendingUp } from 'lucide-react';

interface MonthAnalyticsProps {
  months: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface MonthStats {
  count: number;
  uniqueMonths: number;
  earliestMonth: string;
  latestMonth: string;
  monthRange: number;
  mostCommonYear: string;
}

export function MonthAnalytics({ months, showTitle = true, variant = 'default' }: MonthAnalyticsProps) {
  const { tSync } = useCommonTranslations();
  
  const stats: MonthStats = useMemo(() => {
    if (!months || months.trim().length === 0) {
      return {
        count: 0,
        uniqueMonths: 0,
        earliestMonth: '-',
        latestMonth: '-',
        monthRange: 0,
        mostCommonYear: '-'
      };
    }

    // Parse months from the text
    const monthLines = months
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (monthLines.length === 0) {
      return {
        count: 0,
        uniqueMonths: 0,
        earliestMonth: '-',
        latestMonth: '-',
        monthRange: 0,
        mostCommonYear: '-'
      };
    }

    // Month name mappings
    const monthNames = {
      'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
      'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12,
      'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'Jun': 6,
      'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };

    // Convert to date objects and filter valid months
    const parsedMonths = monthLines
      .map(monthStr => {
        let year = 0;
        let month = 0;
        let valid = false;
        
        // Try different month formats
        if (/^\d{2}$/.test(monthStr)) {
          // Numeric format (01, 02, etc.)
          month = parseInt(monthStr);
          year = new Date().getFullYear(); // Use current year as default
          valid = month >= 1 && month <= 12;
        } else if (/^(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i.test(monthStr)) {
          // Format: "January 2024" or "Jan 2024"
          const parts = monthStr.split(/\s+/);
          const monthName = parts[0];
          year = parseInt(parts[1]);
          month = monthNames[monthName as keyof typeof monthNames] || 0;
          valid = month >= 1 && month <= 12 && year >= 1900 && year <= 2100;
        } else if (/^(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i.test(monthStr)) {
          // Just month name
          month = monthNames[monthStr as keyof typeof monthNames] || 0;
          year = new Date().getFullYear(); // Use current year as default
          valid = month >= 1 && month <= 12;
        }
        
        return { 
          original: monthStr, 
          year: year || 0, 
          month: month || 0, 
          valid 
        };
      })
      .filter(item => item.valid);

    if (parsedMonths.length === 0) {
      return {
        count: monthLines.length,
        uniqueMonths: 0,
        earliestMonth: '-',
        latestMonth: '-',
        monthRange: 0,
        mostCommonYear: '-'
      };
    }

    // Calculate statistics
    const uniqueMonthStrings = new Set(parsedMonths.map(item => item.original));
    
    // Sort months chronologically
    const sortedMonths = parsedMonths.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.month - b.month;
    });
    
    const earliest = sortedMonths[0];
    const latest = sortedMonths[sortedMonths.length - 1];
    
    // Calculate month range (difference in months between earliest and latest)
    const monthRange = (latest.year - earliest.year) * 12 + (latest.month - earliest.month) + 1;
    
    // Find most common year
    const yearCounts: { [key: string]: number } = {};
    parsedMonths.forEach(item => {
      const year = item.year.toString();
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

    // Format month names for display
    const monthNameArray = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];

    return {
      count: monthLines.length,
      uniqueMonths: uniqueMonthStrings.size,
      earliestMonth: earliest.year > 1900 ? `${monthNameArray[earliest.month - 1]} ${earliest.year}` : monthNameArray[earliest.month - 1] || earliest.original,
      latestMonth: latest.year > 1900 ? `${monthNameArray[latest.month - 1]} ${latest.year}` : monthNameArray[latest.month - 1] || latest.original,
      monthRange,
      mostCommonYear: maxCount > 1 ? `${mostCommonYear} (${maxCount})` : mostCommonYear
    };
  }, [months]);

  const statisticsData = [
    {
      key: 'count',
      label: tSync('analytics.totalMonths'),
      value: stats.count,
      icon: Hash,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'unique',
      label: tSync('analytics.uniqueMonths'),
      value: stats.uniqueMonths,
      icon: CalendarDays,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'earliest',
      label: tSync('analytics.earliestMonth'),
      value: stats.earliestMonth,
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'latest',
      label: tSync('analytics.latestMonth'),
      value: stats.latestMonth,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'range',
      label: tSync('analytics.monthRange'),
      value: `${stats.monthRange} ${stats.monthRange === 1 ? 'month' : 'months'}`,
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
            {tSync('analytics.monthStatistics')}
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
export function calculateMonthStats(months: string): MonthStats {
  if (!months || months.trim().length === 0) {
    return {
      count: 0,
      uniqueMonths: 0,
      earliestMonth: '-',
      latestMonth: '-',
      monthRange: 0,
      mostCommonYear: '-'
    };
  }

  const monthLines = months
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (monthLines.length === 0) {
    return {
      count: 0,
      uniqueMonths: 0,
      earliestMonth: '-',
      latestMonth: '-',
      monthRange: 0,
      mostCommonYear: '-'
    };
  }

  // Month name mappings
  const monthNames = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
    'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12,
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };

  const parsedMonths = monthLines
    .map(monthStr => {
      let year = 0;
      let month = 0;
      let valid = false;
      
      if (/^\d{2}$/.test(monthStr)) {
        month = parseInt(monthStr);
        year = new Date().getFullYear();
        valid = month >= 1 && month <= 12;
      } else if (/^(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i.test(monthStr)) {
        const parts = monthStr.split(/\s+/);
        const monthName = parts[0];
        year = parseInt(parts[1]);
        month = monthNames[monthName as keyof typeof monthNames] || 0;
        valid = month >= 1 && month <= 12 && year >= 1900 && year <= 2100;
      } else if (/^(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i.test(monthStr)) {
        month = monthNames[monthStr as keyof typeof monthNames] || 0;
        year = new Date().getFullYear();
        valid = month >= 1 && month <= 12;
      }
      
      return { 
        original: monthStr, 
        year: year || 0, 
        month: month || 0, 
        valid 
      };
    })
    .filter(item => item.valid);

  if (parsedMonths.length === 0) {
    return {
      count: monthLines.length,
      uniqueMonths: 0,
      earliestMonth: '-',
      latestMonth: '-',
      monthRange: 0,
      mostCommonYear: '-'
    };
  }

  const uniqueMonthStrings = new Set(parsedMonths.map(item => item.original));
  
  const sortedMonths = parsedMonths.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    return a.month - b.month;
  });
  
  const earliest = sortedMonths[0];
  const latest = sortedMonths[sortedMonths.length - 1];
  
  const monthRange = (latest.year - earliest.year) * 12 + (latest.month - earliest.month) + 1;
  
  const yearCounts: { [key: string]: number } = {};
  parsedMonths.forEach(item => {
    const year = item.year.toString();
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

  const monthNameArray = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];

  return {
    count: monthLines.length,
    uniqueMonths: uniqueMonthStrings.size,
    earliestMonth: earliest.year > 1900 ? `${monthNameArray[earliest.month - 1]} ${earliest.year}` : monthNameArray[earliest.month - 1] || earliest.original,
    latestMonth: latest.year > 1900 ? `${monthNameArray[latest.month - 1]} ${latest.year}` : monthNameArray[latest.month - 1] || latest.original,
    monthRange,
    mostCommonYear: maxCount > 1 ? `${mostCommonYear} (${maxCount})` : mostCommonYear
  };
}
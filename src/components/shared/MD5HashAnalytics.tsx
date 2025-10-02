'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Hash, FileText, Shield, Key, CheckCircle2 } from 'lucide-react';
import { generateMD5Hash, formatMD5Hash } from '@/lib/md5Utils';

interface MD5HashAnalyticsProps {
  text: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface MD5Stats {
  inputLength: number;
  hashLength: number;
  hash: string;
  hashUppercase: string;
  hashWithColons: string;
  isValid: boolean;
}

export function MD5HashAnalytics({ text, showTitle = true, variant = 'default' }: MD5HashAnalyticsProps) {
  const { tool } = useToolTranslations('tools/miscellaneous');
  
  const stats: MD5Stats = useMemo(() => {
    if (!text || text.trim().length === 0) {
      return {
        inputLength: 0,
        hashLength: 0,
        hash: '',
        hashUppercase: '',
        hashWithColons: '',
        isValid: false
      };
    }

    const hash = generateMD5Hash(text);
    const formats = formatMD5Hash(hash);

    return {
      inputLength: text.length,
      hashLength: hash.length,
      hash: formats.lowercase,
      hashUppercase: formats.uppercase,
      hashWithColons: formats.colonSeparated,
      isValid: true
    };
  }, [text]);


  const statisticsData = [
    {
      key: 'inputLength',
      label: tool('md5Hash.analytics.inputLength', 'Input Length'),
      value: stats.inputLength,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'hashLength',
      label: tool('md5Hash.analytics.hashLength', 'Hash Length'),
      value: stats.hashLength,
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'algorithm',
      label: 'Algorithm',
      value: 'MD5',
      icon: Shield,
      color: 'text-green-600 dark:text-green-400',
      isText: true
    },
    {
      key: 'encoding',
      label: tool('md5Hash.analytics.encoding', 'Encoding'),
      value: 'UTF-8',
      icon: Key,
      color: 'text-orange-600 dark:text-orange-400',
      isText: true
    },
    {
      key: 'status',
      label: 'Status',
      value: stats.isValid ? 'Valid' : 'Invalid',
      icon: CheckCircle2,
      color: stats.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      isText: true
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {statisticsData.map(({ key, label, value, icon: Icon, color, isText }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className="text-sm font-medium text-foreground">
                {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              <span className="text-xs text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>


        {/* AdSense Optimized Spacing */}
        <div className="mt-4 min-h-[50px] flex items-center justify-center">
          <div className="w-full border-t border-border/50"></div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="h-5 w-5 text-primary" />
            {tool('md5Hash.stats.title', 'MD5 Hash Analysis')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
          {statisticsData.map(({ key, label, value, icon: Icon, color, isText }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className="text-sm font-medium text-foreground">
                {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              <span className="text-xs text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>

        
        {/* AdSense Optimized Spacing */}
        <div className="mt-4 min-h-[50px] flex items-center justify-center">
          <div className="w-full border-t border-border/50"></div>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Hash, 
  Binary, 
  HardDrive, 
  FileText, 
  Activity, 
  Percent,
  LucideIcon 
} from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';

interface BinaryAnalyticsProps {
  input: string;
  output: string;
  variant?: 'default' | 'compact';
  showTitle?: boolean;
  className?: string;
}

interface AnalyticsData {
  key: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  isText?: boolean;
}

export function BinaryCodeAnalytics({ 
  input, 
  output, 
  variant = 'default', 
  showTitle = true,
  className = '' 
}: BinaryAnalyticsProps) {
  const { tool } = useToolTranslations('tools/code-data');
  
  // Calculate binary-specific statistics
  const analyticsData = React.useMemo((): AnalyticsData[] => {
    const inputChars = input.length;
    const outputBits = output.replace(/\s/g, '').length;
    const bytes = Math.ceil(outputBits / 8);
    const compressionRatio = inputChars > 0 ? ((outputBits / 8) / inputChars) : 0;
    const bitDensity = outputBits > 0 ? (outputBits / (outputBits / 8)) : 0;
    const uniqueChars = new Set(input).size;
    
    return [
      {
        key: 'inputChars',
        label: tool('binary.analytics.inputChars'),
        value: inputChars,
        icon: FileText,
        color: 'text-blue-600 dark:text-blue-400'
      },
      {
        key: 'outputBits',
        label: tool('binary.analytics.outputBits'),
        value: outputBits,
        icon: Binary,
        color: 'text-green-600 dark:text-green-400'
      },
      {
        key: 'bytes',
        label: tool('binary.analytics.bytes'),
        value: bytes,
        icon: HardDrive,
        color: 'text-purple-600 dark:text-purple-400'
      },
      {
        key: 'compressionRatio',
        label: tool('binary.analytics.sizeRatio'),
        value: `${(compressionRatio * 100).toFixed(1)}%`,
        icon: Percent,
        color: 'text-orange-600 dark:text-orange-400',
        isText: true
      },
      {
        key: 'uniqueChars',
        label: tool('binary.analytics.uniqueChars'),
        value: uniqueChars,
        icon: Hash,
        color: 'text-cyan-600 dark:text-cyan-400'
      },
      {
        key: 'bitDensity',
        label: tool('binary.analytics.bitDensity'),
        value: `${bitDensity.toFixed(2)}`,
        icon: Activity,
        color: 'text-pink-600 dark:text-pink-400'
      }
    ];
  }, [input, output, tool]);

  if (variant === 'compact') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 ${className}`}>
        {analyticsData.map(({ key, label, value, icon: Icon, color, isText }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            <span className="text-xs text-muted-foreground text-center">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Binary className="h-4 w-4" />
            {tool('binary.analytics.title')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {analyticsData.map(({ key, label, value, icon: Icon, color, isText }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">
                {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  FileText, 
  Globe, 
  Hash, 
  Percent, 
  BarChart3, 
  Link 
} from 'lucide-react';

interface URLConverterAnalyticsProps {
  inputText: string;
  outputText: string;
  mode: 'encode' | 'decode';
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface URLConverterStats {
  inputLength: number;
  outputLength: number;
  encodedChars: number;
  specialChars: number;
  compressionRatio: number;
  safetyImprovement: number;
}

export function URLConverterAnalytics({ 
  inputText, 
  outputText, 
  mode,
  showTitle = true, 
  variant = 'default' 
}: URLConverterAnalyticsProps) {
  const { tool } = useToolTranslations('tools/code-data');
  
  const stats: URLConverterStats = useMemo(() => {
    const inputLength = inputText.length;
    const outputLength = outputText.length;
    
    // Count encoded characters (% followed by 2 hex digits or + for spaces)
    const encodedChars = mode === 'encode' ? 
      (outputText.match(/%[0-9A-Fa-f]{2}|\+/g) || []).length : 
      (inputText.match(/%[0-9A-Fa-f]{2}|\+/g) || []).length;
    
    // Count special characters that need encoding
    const specialChars = mode === 'encode' ? 
      (inputText.match(/[^A-Za-z0-9\-_.~]/g) || []).length :
      (outputText.match(/[^A-Za-z0-9\-_.~]/g) || []).length;
    
    // Calculate compression ratio (how much the size changed)
    const compressionRatio = inputLength > 0 ? 
      Math.round(((outputLength - inputLength) / inputLength) * 100) : 0;
    
    // Calculate safety improvement (percentage of special chars made safe)
    const totalChars = mode === 'encode' ? inputLength : outputLength;
    const safetyImprovement = totalChars > 0 ? 
      Math.round((encodedChars / totalChars) * 100) : 0;

    return {
      inputLength,
      outputLength,
      encodedChars,
      specialChars,
      compressionRatio,
      safetyImprovement
    };
  }, [inputText, outputText, mode]);

  const statisticsData = [
    {
      key: 'inputLength',
      label: tool('url.analytics.inputLength'),
      value: stats.inputLength,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      suffix: 'chars'
    },
    {
      key: 'outputLength',
      label: tool('url.analytics.outputLength'),
      value: stats.outputLength,
      icon: Globe,
      color: 'text-green-600 dark:text-green-400',
      suffix: 'chars'
    },
    {
      key: 'encodedChars',
      label: tool('url.analytics.encodedChars'),
      value: stats.encodedChars,
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'specialChars',
      label: tool('url.analytics.specialChars'),
      value: stats.specialChars,
      icon: Link,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'compressionRatio',
      label: tool('url.analytics.compressionRatio'),
      value: `${stats.compressionRatio > 0 ? '+' : ''}${stats.compressionRatio}%`,
      icon: BarChart3,
      color: stats.compressionRatio > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
    },
    {
      key: 'safetyImprovement',
      label: tool('url.analytics.safetyImprovement'),
      value: `${stats.safetyImprovement}%`,
      icon: Percent,
      color: 'text-cyan-600 dark:text-cyan-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color, suffix }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix && ` ${suffix}`}
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
            <Globe className="h-5 w-5 text-primary" />
            {tool('url.analytics.title')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color, suffix }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className="text-sm font-medium text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {suffix && ` ${suffix}`}
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
export function calculateURLConverterStats(
  inputText: string, 
  outputText: string, 
  mode: 'encode' | 'decode'
): URLConverterStats {
  const inputLength = inputText.length;
  const outputLength = outputText.length;
  
  const encodedChars = mode === 'encode' ? 
    (outputText.match(/%[0-9A-Fa-f]{2}|\+/g) || []).length : 
    (inputText.match(/%[0-9A-Fa-f]{2}|\+/g) || []).length;
  
  const specialChars = mode === 'encode' ? 
    (inputText.match(/[^A-Za-z0-9\-_.~]/g) || []).length :
    (outputText.match(/[^A-Za-z0-9\-_.~]/g) || []).length;
  
  const compressionRatio = inputLength > 0 ? 
    Math.round(((outputLength - inputLength) / inputLength) * 100) : 0;
  
  const totalChars = mode === 'encode' ? inputLength : outputLength;
  const safetyImprovement = totalChars > 0 ? 
    Math.round((encodedChars / totalChars) * 100) : 0;

  return {
    inputLength,
    outputLength,
    encodedChars,
    specialChars,
    compressionRatio,
    safetyImprovement
  };
}
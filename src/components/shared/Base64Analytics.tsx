'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  FileUp, 
  FileDown, 
  Percent, 
  BarChart3, 
  Binary,
  Activity,
  Hash
} from 'lucide-react';

interface Base64AnalyticsProps {
  inputText: string;
  outputText: string;
  mode: 'encode' | 'decode';
  options: {
    urlSafe: boolean;
    includePadding: boolean;
    lineBreaks: boolean;
    lineLength: number;
  };
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface Base64Stats {
  inputSize: number;
  outputSize: number;
  expansionRatio: number;
  compressionRatio: number;
  lineCount: number;
  characterCount: number;
  base64Length: number;
  efficiency: number;
}

export function Base64Analytics({ 
  inputText, 
  outputText, 
  mode,
  options: _options, // eslint-disable-line @typescript-eslint/no-unused-vars
  showTitle = true, 
  variant = 'default' 
}: Base64AnalyticsProps) {
  const { tool } = useToolTranslations('tools/code-data');
  
  const stats: Base64Stats = useMemo(() => {
    const inputSize = inputText ? new Blob([inputText]).size : 0;
    const outputSize = outputText ? new Blob([outputText]).size : 0;
    const lineCount = outputText ? outputText.split(/\r?\n/).length : 0;
    const characterCount = inputText ? inputText.length : 0;
    const base64Length = outputText ? outputText.replace(/\s/g, '').length : 0;
    
    let expansionRatio = 0;
    let compressionRatio = 0;
    let efficiency = 0;
    
    if (mode === 'encode') {
      expansionRatio = inputSize > 0 ? Math.round(((outputSize - inputSize) / inputSize) * 100) : 0;
      efficiency = inputSize > 0 ? Math.round((inputSize / outputSize) * 100) : 0;
    } else {
      compressionRatio = outputSize > 0 ? Math.round(((inputSize - outputSize) / outputSize) * 100) : 0;
      efficiency = outputSize > 0 ? Math.round((outputSize / inputSize) * 100) : 0;
    }

    return {
      inputSize,
      outputSize,
      expansionRatio,
      compressionRatio,
      lineCount,
      characterCount,
      base64Length,
      efficiency
    };
  }, [inputText, outputText, mode]);

  const statisticsData = [
    {
      key: 'inputSize',
      label: tool('base64.stats.inputSize'),
      value: stats.inputSize,
      icon: FileUp,
      color: 'text-blue-600 dark:text-blue-400',
      suffix: 'bytes'
    },
    {
      key: 'outputSize',
      label: tool('base64.stats.outputSize'),
      value: stats.outputSize,
      icon: FileDown,
      color: 'text-green-600 dark:text-green-400',
      suffix: 'bytes'
    },
    {
      key: 'ratio',
      label: mode === 'encode' ? tool('base64.stats.expansionRatio') : tool('base64.stats.compressionRatio'),
      value: mode === 'encode' ? stats.expansionRatio : stats.compressionRatio,
      icon: Percent,
      color: mode === 'encode' 
        ? (stats.expansionRatio > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400')
        : (stats.compressionRatio > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'),
      suffix: '%'
    },
    {
      key: 'lineCount',
      label: tool('base64.analytics.lines', 'Lines'),
      value: stats.lineCount,
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'characterCount',
      label: tool('base64.analytics.characters', 'Characters'),
      value: stats.characterCount,
      icon: Binary,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'efficiency',
      label: tool('base64.analytics.efficiency', 'Efficiency'),
      value: stats.efficiency,
      icon: Activity,
      color: 'text-cyan-600 dark:text-cyan-400',
      suffix: '%'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color, suffix }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow dark:shadow-orange-500/10"
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
            <BarChart3 className="h-5 w-5 text-primary" />
            {tool('base64.analytics.title')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color, suffix }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow dark:shadow-orange-500/10"
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
export function calculateBase64Stats(
  inputText: string, 
  outputText: string, 
  mode: 'encode' | 'decode',
  _options: { // eslint-disable-line @typescript-eslint/no-unused-vars
    urlSafe: boolean;
    includePadding: boolean;
    lineBreaks: boolean;
    lineLength: number;
  }
): Base64Stats {
  const inputSize = inputText ? new Blob([inputText]).size : 0;
  const outputSize = outputText ? new Blob([outputText]).size : 0;
  const lineCount = outputText ? outputText.split(/\r?\n/).length : 0;
  const characterCount = inputText ? inputText.length : 0;
  const base64Length = outputText ? outputText.replace(/\s/g, '').length : 0;
  
  let expansionRatio = 0;
  let compressionRatio = 0;
  let efficiency = 0;
  
  if (mode === 'encode') {
    expansionRatio = inputSize > 0 ? Math.round(((outputSize - inputSize) / inputSize) * 100) : 0;
    efficiency = inputSize > 0 ? Math.round((inputSize / outputSize) * 100) : 0;
  } else {
    compressionRatio = outputSize > 0 ? Math.round(((inputSize - outputSize) / outputSize) * 100) : 0;
    efficiency = outputSize > 0 ? Math.round((outputSize / inputSize) * 100) : 0;
  }

  return {
    inputSize,
    outputSize,
    expansionRatio,
    compressionRatio,
    lineCount,
    characterCount,
    base64Length,
    efficiency
  };
}

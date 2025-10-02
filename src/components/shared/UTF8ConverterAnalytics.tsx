'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  FileText, 
  Binary, 
  Hash, 
  Zap, 
  BarChart3, 
  Globe 
} from 'lucide-react';

interface UTF8ConverterAnalyticsProps {
  inputText: string;
  outputText: string;
  mode: 'encode' | 'decode';
  showBom: boolean;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface UTF8ConverterStats {
  inputChars: number;
  outputBytes: number;
  bytesPerChar: number;
  efficiency: number;
  unicodeChars: number;
  asciiChars: number;
}

export function UTF8ConverterAnalytics({ 
  inputText, 
  outputText, 
  mode,
  showBom,
  showTitle = true, 
  variant = 'default' 
}: UTF8ConverterAnalyticsProps) {
  const { tool } = useToolTranslations('tools/code-data');
  
  const stats: UTF8ConverterStats = useMemo(() => {
    const inputChars = inputText.length;
    const encoder = new TextEncoder();
    
    // Calculate bytes based on mode
    const inputBytes = mode === 'encode' ? encoder.encode(inputText).length : 0;
    const outputBytes = mode === 'decode' && outputText ? encoder.encode(outputText).length : inputBytes;
    const finalOutputBytes = mode === 'encode' ? inputBytes + (showBom ? 3 : 0) : outputBytes;
    
    // Calculate average bytes per character
    const bytesPerChar = inputChars > 0 ? (inputBytes / inputChars) : 0;
    
    // Calculate encoding efficiency (chars per byte ratio)
    const efficiency = inputBytes > 0 ? ((inputChars / inputBytes) * 100) : 0;
    
    // Count ASCII vs Unicode characters
    const asciiChars = (inputText.match(/[\x00-\x7F]/g) || []).length;
    const unicodeChars = inputChars - asciiChars;

    return {
      inputChars,
      outputBytes: finalOutputBytes,
      bytesPerChar,
      efficiency,
      unicodeChars,
      asciiChars
    };
  }, [inputText, outputText, mode, showBom]);

  const statisticsData = [
    {
      key: 'inputChars',
      label: tool('utf8.analytics.inputChars'),
      value: stats.inputChars,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      suffix: 'chars'
    },
    {
      key: 'outputBytes',
      label: tool('utf8.analytics.outputBytes'),
      value: stats.outputBytes,
      icon: Binary,
      color: 'text-green-600 dark:text-green-400',
      suffix: 'bytes'
    },
    {
      key: 'bytesPerChar',
      label: tool('utf8.analytics.bytesPerChar'),
      value: stats.bytesPerChar.toFixed(2),
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'efficiency',
      label: tool('utf8.analytics.efficiency'),
      value: `${stats.efficiency.toFixed(1)}%`,
      icon: Zap,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'asciiChars',
      label: tool('utf8.analytics.asciiChars'),
      value: stats.asciiChars,
      icon: Globe,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      key: 'unicodeChars',
      label: tool('utf8.analytics.unicodeChars'),
      value: stats.unicodeChars,
      icon: BarChart3,
      color: 'text-pink-600 dark:text-pink-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color, suffix }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
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
            <Binary className="h-5 w-5 text-primary" />
            {tool('utf8.analytics.title')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color, suffix }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
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
export function calculateUTF8ConverterStats(
  inputText: string, 
  outputText: string, 
  mode: 'encode' | 'decode',
  showBom: boolean
): UTF8ConverterStats {
  const inputChars = inputText.length;
  const encoder = new TextEncoder();
  
  const inputBytes = mode === 'encode' ? encoder.encode(inputText).length : 0;
  const outputBytes = mode === 'decode' && outputText ? encoder.encode(outputText).length : inputBytes;
  const finalOutputBytes = mode === 'encode' ? inputBytes + (showBom ? 3 : 0) : outputBytes;
  
  const bytesPerChar = inputChars > 0 ? (inputBytes / inputChars) : 0;
  const efficiency = inputBytes > 0 ? ((inputChars / inputBytes) * 100) : 0;
  
  const asciiChars = (inputText.match(/[\x00-\x7F]/g) || []).length;
  const unicodeChars = inputChars - asciiChars;

  return {
    inputChars,
    outputBytes: finalOutputBytes,
    bytesPerChar,
    efficiency,
    unicodeChars,
    asciiChars
  };
}
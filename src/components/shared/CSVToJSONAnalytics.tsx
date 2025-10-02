'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  Table, 
  Hash, 
  FileUp, 
  FileDown, 
  BarChart3, 
  Database 
} from 'lucide-react';

interface CSVToJSONAnalyticsProps {
  inputText: string;
  outputText: string;
  mode: 'csvToJson' | 'jsonToCsv';
  options: {
    delimiter: string;
    customDelimiter: string;
    hasHeaders: boolean;
  };
  parseCSVLine: (line: string, delimiter: string) => string[];
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface CSVToJSONStats {
  rows: number;
  columns: number;
  inputSize: number;
  outputSize: number;
  compressionRatio: number;
  dataPoints: number;
}

export function CSVToJSONAnalytics({ 
  inputText, 
  outputText, 
  mode,
  options,
  parseCSVLine,
  showTitle = true, 
  variant = 'default' 
}: CSVToJSONAnalyticsProps) {
  const { tool } = useToolTranslations('tools/code-data');
  
  const stats: CSVToJSONStats = useMemo(() => {
    const delimiter = options.customDelimiter || options.delimiter;
    
    if (mode === 'csvToJson') {
      // CSV to JSON mode
      const lines = inputText.split(/\r?\n/).filter(line => line.trim().length > 0).length;
      const columns = inputText ? parseCSVLine(inputText.split(/\r?\n/)[0] || '', delimiter).length : 0;
      const rows = options.hasHeaders ? Math.max(0, lines - 1) : lines;
      const inputSize = inputText ? new Blob([inputText]).size : 0;
      const outputSize = outputText ? new Blob([outputText]).size : 0;
      const compressionRatio = inputSize > 0 ? Math.round(((outputSize - inputSize) / inputSize) * 100) : 0;
      const dataPoints = rows * columns;

      return {
        rows,
        columns,
        inputSize,
        outputSize,
        compressionRatio,
        dataPoints
      };
    } else {
      // JSON to CSV mode
      const inputSize = inputText ? new Blob([inputText]).size : 0;
      const outputSize = outputText ? new Blob([outputText]).size : 0;
      const outputLines = outputText.split(/\r?\n/).filter(line => line.trim().length > 0).length;
      const rows = options.hasHeaders ? Math.max(0, outputLines - 1) : outputLines;
      const columns = outputText ? parseCSVLine(outputText.split(/\r?\n/)[0] || '', delimiter).length : 0;
      const compressionRatio = inputSize > 0 ? Math.round(((outputSize - inputSize) / inputSize) * 100) : 0;
      const dataPoints = rows * columns;

      return {
        rows,
        columns,
        inputSize,
        outputSize,
        compressionRatio,
        dataPoints
      };
    }
  }, [inputText, outputText, mode, options, parseCSVLine]);

  const statisticsData = [
    {
      key: 'rows',
      label: tool('csvJson.analytics.rows'),
      value: stats.rows,
      icon: Table,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'columns',
      label: tool('csvJson.analytics.columns'),
      value: stats.columns,
      icon: Hash,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'inputSize',
      label: tool('csvJson.analytics.inputSize'),
      value: stats.inputSize,
      icon: FileUp,
      color: 'text-purple-600 dark:text-purple-400',
      suffix: 'bytes'
    },
    {
      key: 'outputSize',
      label: tool('csvJson.analytics.outputSize'),
      value: stats.outputSize,
      icon: FileDown,
      color: 'text-orange-600 dark:text-orange-400',
      suffix: 'bytes'
    },
    {
      key: 'dataPoints',
      label: tool('csvJson.analytics.dataPoints'),
      value: stats.dataPoints,
      icon: Database,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      key: 'compressionRatio',
      label: tool('csvJson.analytics.compressionRatio'),
      value: `${stats.compressionRatio > 0 ? '+' : ''}${stats.compressionRatio}%`,
      icon: BarChart3,
      color: stats.compressionRatio > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
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
            <BarChart3 className="h-5 w-5 text-primary" />
            {tool('csvJson.analytics.title')}
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
export function calculateCSVToJSONStats(
  inputText: string, 
  outputText: string, 
  mode: 'csvToJson' | 'jsonToCsv',
  options: {
    delimiter: string;
    customDelimiter: string;
    hasHeaders: boolean;
  },
  parseCSVLine: (line: string, delimiter: string) => string[]
): CSVToJSONStats {
  const delimiter = options.customDelimiter || options.delimiter;
  
  if (mode === 'csvToJson') {
    const lines = inputText.split(/\r?\n/).filter(line => line.trim().length > 0).length;
    const columns = inputText ? parseCSVLine(inputText.split(/\r?\n/)[0] || '', delimiter).length : 0;
    const rows = options.hasHeaders ? Math.max(0, lines - 1) : lines;
    const inputSize = inputText ? new Blob([inputText]).size : 0;
    const outputSize = outputText ? new Blob([outputText]).size : 0;
    const compressionRatio = inputSize > 0 ? Math.round(((outputSize - inputSize) / inputSize) * 100) : 0;
    const dataPoints = rows * columns;

    return {
      rows,
      columns,
      inputSize,
      outputSize,
      compressionRatio,
      dataPoints
    };
  } else {
    const inputSize = inputText ? new Blob([inputText]).size : 0;
    const outputSize = outputText ? new Blob([outputText]).size : 0;
    const outputLines = outputText.split(/\r?\n/).filter(line => line.trim().length > 0).length;
    const rows = options.hasHeaders ? Math.max(0, outputLines - 1) : outputLines;
    const columns = outputText ? parseCSVLine(outputText.split(/\r?\n/)[0] || '', delimiter).length : 0;
    const compressionRatio = inputSize > 0 ? Math.round(((outputSize - inputSize) / inputSize) * 100) : 0;
    const dataPoints = rows * columns;

    return {
      rows,
      columns,
      inputSize,
      outputSize,
      compressionRatio,
      dataPoints
    };
  }
}
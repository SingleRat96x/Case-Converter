'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  FileText, 
  Code2, 
  Hash, 
  Layers, 
  BarChart3, 
  Percent 
} from 'lucide-react';

interface JSONStringifyAnalyticsProps {
  inputText: string;
  outputText: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface JSONStringifyStats {
  inputSize: number;
  outputSize: number;
  elements: number;
  depth: number;
  compressionRatio: number;
  keys: number;
}

export function JSONStringifyAnalytics({ 
  inputText, 
  outputText, 
  showTitle = true, 
  variant = 'default' 
}: JSONStringifyAnalyticsProps) {
  const { tool } = useToolTranslations('tools/code-data');
  
  const stats: JSONStringifyStats = useMemo(() => {
    const inputSize = inputText ? new Blob([inputText]).size : 0;
    const outputSize = outputText ? new Blob([outputText]).size : 0;
    
    // Calculate compression ratio
    const compressionRatio = inputSize > 0 ? Math.round(((outputSize - inputSize) / inputSize) * 100) : 0;
    
    // Count JSON properties/elements and calculate depth
    let elementCount = 0;
    let depth = 0;
    let keyCount = 0;
    
    try {
      if (inputText.trim()) {
        const parsed = JSON.parse(inputText);
        
        const analyzeStructure = (obj: unknown, currentDepth = 0): { elements: number; keys: number } => {
          depth = Math.max(depth, currentDepth);
          
          if (Array.isArray(obj)) {
            let totalElements = obj.length;
            let totalKeys = 0;
            
            obj.forEach(item => {
              const result = analyzeStructure(item, currentDepth + 1);
              totalElements += result.elements;
              totalKeys += result.keys;
            });
            
            return { elements: totalElements, keys: totalKeys };
          } else if (obj !== null && typeof obj === 'object') {
            const keys = Object.keys(obj as Record<string, unknown>);
            let totalElements = keys.length;
            let totalKeys = keys.length;
            
            keys.forEach(key => {
              const result = analyzeStructure((obj as Record<string, unknown>)[key], currentDepth + 1);
              totalElements += result.elements;
              totalKeys += result.keys;
            });
            
            return { elements: totalElements, keys: totalKeys };
          }
          
          return { elements: 1, keys: 0 };
        };
        
        const result = analyzeStructure(parsed);
        elementCount = result.elements;
        keyCount = result.keys;
      }
    } catch {
      // Ignore parsing errors for stats
    }

    return {
      inputSize,
      outputSize,
      elements: elementCount,
      depth,
      compressionRatio,
      keys: keyCount
    };
  }, [inputText, outputText]);

  const statisticsData = [
    {
      key: 'inputSize',
      label: tool('jsonStringify.analytics.inputSize'),
      value: stats.inputSize,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      suffix: 'bytes'
    },
    {
      key: 'outputSize',
      label: tool('jsonStringify.analytics.outputSize'),
      value: stats.outputSize,
      icon: Code2,
      color: 'text-green-600 dark:text-green-400',
      suffix: 'bytes'
    },
    {
      key: 'elements',
      label: tool('jsonStringify.analytics.elements'),
      value: stats.elements,
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'keys',
      label: tool('jsonStringify.analytics.keys'),
      value: stats.keys,
      icon: Layers,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'depth',
      label: tool('jsonStringify.analytics.depth'),
      value: stats.depth,
      icon: BarChart3,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      key: 'compressionRatio',
      label: tool('jsonStringify.analytics.compressionRatio'),
      value: `${stats.compressionRatio > 0 ? '+' : ''}${stats.compressionRatio}%`,
      icon: Percent,
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
            <Code2 className="h-5 w-5 text-primary" />
            {tool('jsonStringify.analytics.title')}
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
export function calculateJSONStringifyStats(
  inputText: string, 
  outputText: string
): JSONStringifyStats {
  const inputSize = inputText ? new Blob([inputText]).size : 0;
  const outputSize = outputText ? new Blob([outputText]).size : 0;
  const compressionRatio = inputSize > 0 ? Math.round(((outputSize - inputSize) / inputSize) * 100) : 0;
  
  let elementCount = 0;
  let depth = 0;
  let keyCount = 0;
  
  try {
    if (inputText.trim()) {
      const parsed = JSON.parse(inputText);
      
      const analyzeStructure = (obj: unknown, currentDepth = 0): { elements: number; keys: number } => {
        depth = Math.max(depth, currentDepth);
        
        if (Array.isArray(obj)) {
          let totalElements = obj.length;
          let totalKeys = 0;
          
          obj.forEach(item => {
            const result = analyzeStructure(item, currentDepth + 1);
            totalElements += result.elements;
            totalKeys += result.keys;
          });
          
          return { elements: totalElements, keys: totalKeys };
        } else if (obj !== null && typeof obj === 'object') {
          const keys = Object.keys(obj as Record<string, unknown>);
          let totalElements = keys.length;
          let totalKeys = keys.length;
          
          keys.forEach(key => {
            const result = analyzeStructure((obj as Record<string, unknown>)[key], currentDepth + 1);
            totalElements += result.elements;
            totalKeys += result.keys;
          });
          
          return { elements: totalElements, keys: totalKeys };
        }
        
        return { elements: 1, keys: 0 };
      };
      
      const result = analyzeStructure(parsed);
      elementCount = result.elements;
      keyCount = result.keys;
    }
  } catch {
    // Ignore parsing errors for stats
  }

  return {
    inputSize,
    outputSize,
    elements: elementCount,
    depth,
    compressionRatio,
    keys: keyCount
  };
}
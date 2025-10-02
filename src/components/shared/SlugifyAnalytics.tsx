'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  FileText, 
  Link, 
  Hash, 
  Zap, 
  BarChart3, 
  Globe 
} from 'lucide-react';

interface SlugifyAnalyticsProps {
  inputText: string;
  outputText: string;
  separator: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface SlugifyStats {
  inputLength: number;
  outputLength: number;
  wordCount: number;
  compressionRatio: number;
  separatorCount: number;
  seoScore: number;
}

export function SlugifyAnalytics({ 
  inputText, 
  outputText, 
  separator,
  showTitle = true, 
  variant = 'default' 
}: SlugifyAnalyticsProps) {
  const { tool } = useToolTranslations('tools/code-data');
  
  const stats: SlugifyStats = useMemo(() => {
    const inputLength = inputText.length;
    const outputLength = outputText.length;
    
    // Count words/segments based on separator
    const wordCount = outputText ? outputText.split(separator).filter(Boolean).length : 0;
    
    // Calculate compression ratio
    const compressionRatio = inputLength > 0 ? ((outputLength / inputLength) * 100) : 0;
    
    // Count separators
    const separatorCount = outputText ? (outputText.match(new RegExp(`\\${separator}`, 'g')) || []).length : 0;
    
    // Calculate SEO score based on various factors
    let seoScore = 0;
    if (outputText) {
      // Length score (optimal 3-5 words, 30-60 chars)
      const lengthScore = outputLength >= 30 && outputLength <= 60 ? 25 : 
                         outputLength >= 20 && outputLength <= 80 ? 15 : 10;
      
      // Word count score (3-5 words is optimal)
      const wordScore = wordCount >= 3 && wordCount <= 5 ? 25 : 
                       wordCount >= 2 && wordCount <= 7 ? 15 : 10;
      
      // Character composition score
      const hasNumbers = /\d/.test(outputText) ? 10 : 0;
      const hasOnlyValidChars = /^[a-z0-9\-_.]+$/.test(outputText) ? 20 : 10;
      const noConsecutiveSeparators = !new RegExp(`\\${separator}{2,}`).test(outputText) ? 20 : 10;
      
      seoScore = lengthScore + wordScore + hasNumbers + hasOnlyValidChars + noConsecutiveSeparators;
    }

    return {
      inputLength,
      outputLength,
      wordCount,
      compressionRatio,
      separatorCount,
      seoScore: Math.min(seoScore, 100)
    };
  }, [inputText, outputText, separator]);

  const statisticsData = [
    {
      key: 'inputLength',
      label: tool('slugify.analytics.inputLength'),
      value: stats.inputLength,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      suffix: 'chars'
    },
    {
      key: 'outputLength',
      label: tool('slugify.analytics.outputLength'),
      value: stats.outputLength,
      icon: Link,
      color: 'text-green-600 dark:text-green-400',
      suffix: 'chars'
    },
    {
      key: 'wordCount',
      label: tool('slugify.analytics.wordCount'),
      value: stats.wordCount,
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400',
      suffix: 'words'
    },
    {
      key: 'compressionRatio',
      label: tool('slugify.analytics.compressionRatio'),
      value: `${stats.compressionRatio.toFixed(1)}%`,
      icon: BarChart3,
      color: stats.compressionRatio < 100 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
    },
    {
      key: 'separatorCount',
      label: tool('slugify.analytics.separatorCount'),
      value: stats.separatorCount,
      icon: Globe,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      key: 'seoScore',
      label: tool('slugify.analytics.seoScore'),
      value: `${stats.seoScore}%`,
      icon: Zap,
      color: stats.seoScore >= 80 ? 'text-green-600 dark:text-green-400' : 
             stats.seoScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
             'text-red-600 dark:text-red-400'
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
            <Link className="h-5 w-5 text-primary" />
            {tool('slugify.analytics.title')}
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
export function calculateSlugifyStats(
  inputText: string, 
  outputText: string, 
  separator: string
): SlugifyStats {
  const inputLength = inputText.length;
  const outputLength = outputText.length;
  
  const wordCount = outputText ? outputText.split(separator).filter(Boolean).length : 0;
  const compressionRatio = inputLength > 0 ? ((outputLength / inputLength) * 100) : 0;
  const separatorCount = outputText ? (outputText.match(new RegExp(`\\${separator}`, 'g')) || []).length : 0;
  
  let seoScore = 0;
  if (outputText) {
    const lengthScore = outputLength >= 30 && outputLength <= 60 ? 25 : 
                       outputLength >= 20 && outputLength <= 80 ? 15 : 10;
    
    const wordScore = wordCount >= 3 && wordCount <= 5 ? 25 : 
                     wordCount >= 2 && wordCount <= 7 ? 15 : 10;
    
    const hasNumbers = /\d/.test(outputText) ? 10 : 0;
    const hasOnlyValidChars = /^[a-z0-9\-_.]+$/.test(outputText) ? 20 : 10;
    const noConsecutiveSeparators = !new RegExp(`\\${separator}{2,}`).test(outputText) ? 20 : 10;
    
    seoScore = lengthScore + wordScore + hasNumbers + hasOnlyValidChars + noConsecutiveSeparators;
  }

  return {
    inputLength,
    outputLength,
    wordCount,
    compressionRatio,
    separatorCount,
    seoScore: Math.min(seoScore, 100)
  };
}
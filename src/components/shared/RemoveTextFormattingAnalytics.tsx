'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Code2, Link, Hash, FileText, Zap, Shield, BarChart3 } from 'lucide-react';

interface RemoveTextFormattingAnalyticsProps {
  originalText: string;
  convertedText: string;
  options: {
    removeHtml: boolean;
    removeMarkdown: boolean;
    removeExtraSpaces: boolean;
    removeSpecialChars: boolean;
    removeNumbers: boolean;
    removeUrls: boolean;
    removeEmails: boolean;
  };
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface FormattingStats {
  originalLength: number;
  cleanedLength: number;
  htmlTagsRemoved: number;
  markdownElementsRemoved: number;
  urlsRemoved: number;
  emailsRemoved: number;
  specialCharsRemoved: number;
  reductionPercentage: number;
}

export function RemoveTextFormattingAnalytics({ 
  originalText, 
  convertedText, 
  options,
  showTitle = true, 
  variant = 'default' 
}: RemoveTextFormattingAnalyticsProps) {
  const { tool } = useToolTranslations('tools/text-generators');
  
  const stats: FormattingStats = useMemo(() => {
    const originalLength = originalText.length;
    const cleanedLength = convertedText.length;
    
    // Count HTML tags
    const htmlTagsRemoved = options.removeHtml ? (originalText.match(/<[^>]*>/g) || []).length : 0;
    
    // Count Markdown elements (headers, bold, italic, links, etc.)
    let markdownElementsRemoved = 0;
    if (options.removeMarkdown) {
      const headers = (originalText.match(/^#{1,6}\s+/gm) || []).length;
      const bold = (originalText.match(/\*{2,3}[^*]+\*{2,3}/g) || []).length;
      const italic = (originalText.match(/\*[^*]+\*/g) || []).length;
      const links = (originalText.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
      const codeBlocks = (originalText.match(/```[\s\S]*?```/g) || []).length;
      const inlineCode = (originalText.match(/`[^`]+`/g) || []).length;
      markdownElementsRemoved = headers + bold + italic + links + codeBlocks + inlineCode;
    }
    
    // Count URLs
    const urlsRemoved = options.removeUrls ? 
      ((originalText.match(/https?:\/\/[^\s]+/g) || []).length + 
       (originalText.match(/www\.[^\s]+/g) || []).length) : 0;
    
    // Count emails
    const emailsRemoved = options.removeEmails ? 
      (originalText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).length : 0;
    
    // Estimate special characters removed
    const specialCharsRemoved = options.removeSpecialChars ? 
      (originalText.match(/[^a-zA-Z0-9\s.,!?;:\-'"]/g) || []).length : 0;
    
    const reductionPercentage = originalLength > 0 ? 
      Math.round(((originalLength - cleanedLength) / originalLength) * 100) : 0;

    return {
      originalLength,
      cleanedLength,
      htmlTagsRemoved,
      markdownElementsRemoved,
      urlsRemoved,
      emailsRemoved,
      specialCharsRemoved,
      reductionPercentage
    };
  }, [originalText, convertedText, options]);


  const statisticsData = [
    {
      key: 'originalLength',
      label: tool('removeTextFormatting.analytics.originalLength'),
      value: stats.originalLength,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'urlsEmails',
      label: tool('removeTextFormatting.analytics.urlsEmails'),
      value: stats.urlsRemoved + stats.emailsRemoved,
      icon: Link,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'specialChars',
      label: tool('removeTextFormatting.analytics.specialCharsRemoved'),
      value: stats.specialCharsRemoved,
      icon: Zap,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      key: 'totalElementsRemoved',
      label: tool('removeTextFormatting.analytics.totalElementsRemoved'),
      value: stats.htmlTagsRemoved + stats.markdownElementsRemoved,
      icon: Code2,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'charactersReduced',
      label: tool('removeTextFormatting.analytics.charactersReduced'),
      value: stats.originalLength - stats.cleanedLength,
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'reduction',
      label: tool('removeTextFormatting.analytics.textReduction'),
      value: `${stats.reductionPercentage}%`,
      icon: BarChart3,
      color: stats.reductionPercentage > 0 ? 'text-green-600 dark:text-green-400' : 
             'text-gray-600 dark:text-gray-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
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
            <Shield className="h-5 w-5 text-primary" />
            {tool('removeTextFormatting.analytics.title')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className="text-sm font-medium text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
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
export function calculateFormattingStats(
  originalText: string, 
  convertedText: string, 
  options: {
    removeHtml: boolean;
    removeMarkdown: boolean;
    removeUrls: boolean;
    removeEmails: boolean;
    removeSpecialChars: boolean;
  }
): FormattingStats {
  const originalLength = originalText.length;
  const cleanedLength = convertedText.length;
  
  const htmlTagsRemoved = options.removeHtml ? (originalText.match(/<[^>]*>/g) || []).length : 0;
  
  let markdownElementsRemoved = 0;
  if (options.removeMarkdown) {
    const headers = (originalText.match(/^#{1,6}\s+/gm) || []).length;
    const bold = (originalText.match(/\*{2,3}[^*]+\*{2,3}/g) || []).length;
    const italic = (originalText.match(/\*[^*]+\*/g) || []).length;
    const links = (originalText.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
    markdownElementsRemoved = headers + bold + italic + links;
  }
  
  const urlsRemoved = options.removeUrls ? 
    ((originalText.match(/https?:\/\/[^\s]+/g) || []).length + 
     (originalText.match(/www\.[^\s]+/g) || []).length) : 0;
  
  const emailsRemoved = options.removeEmails ? 
    (originalText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).length : 0;
  
  const specialCharsRemoved = options.removeSpecialChars ? 
    (originalText.match(/[^a-zA-Z0-9\s.,!?;:\-'"]/g) || []).length : 0;
  
  const reductionPercentage = originalLength > 0 ? 
    Math.round(((originalLength - cleanedLength) / originalLength) * 100) : 0;

  return {
    originalLength,
    cleanedLength,
    htmlTagsRemoved,
    markdownElementsRemoved,
    urlsRemoved,
    emailsRemoved,
    specialCharsRemoved,
    reductionPercentage
  };
}
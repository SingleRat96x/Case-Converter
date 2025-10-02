'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  FileText, 
  Code, 
  Link2, 
  Mail, 
  Hash, 
  Sparkles, 
  BarChart3, 
  Percent 
} from 'lucide-react';

interface PlainTextAnalyticsProps {
  originalText: string;
  plainText: string;
  options: {
    removeHtml: boolean;
    removeMarkdown: boolean;
    removeUrls: boolean;
    removeEmails: boolean;
    removeNumbers: boolean;
    removeSpecialChars: boolean;
    removeEmojis: boolean;
    removePunctuation: boolean;
  };
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface PlainTextStats {
  originalLength: number;
  plainLength: number;
  charactersRemoved: number;
  reductionPercentage: number;
  htmlTagsRemoved: number;
  markdownElementsRemoved: number;
  urlsRemoved: number;
  emailsRemoved: number;
}

export function PlainTextAnalytics({ 
  originalText, 
  plainText, 
  options,
  showTitle = true, 
  variant = 'default' 
}: PlainTextAnalyticsProps) {
  const { tool } = useToolTranslations('tools/text-modifiers');
  
  const stats: PlainTextStats = useMemo(() => {
    const originalLength = originalText.length;
    const plainLength = plainText.length;
    const charactersRemoved = originalLength - plainLength;
    const reductionPercentage = originalLength > 0 ? 
      Math.round((charactersRemoved / originalLength) * 100) : 0;
    
    // Count HTML tags removed
    const htmlTagsRemoved = options.removeHtml ? 
      (originalText.match(/<[^>]*>/g) || []).length : 0;
    
    // Count Markdown elements removed
    let markdownElementsRemoved = 0;
    if (options.removeMarkdown) {
      const headers = (originalText.match(/^#{1,6}\s+/gm) || []).length;
      const bold = (originalText.match(/(\*\*|__)(.*?)\1/g) || []).length;
      const italic = (originalText.match(/(\*|_)(.*?)\1/g) || []).length;
      const links = (originalText.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
      const codeBlocks = (originalText.match(/```[\s\S]*?```/g) || []).length;
      const inlineCode = (originalText.match(/`[^`]+`/g) || []).length;
      markdownElementsRemoved = headers + bold + italic + links + codeBlocks + inlineCode;
    }
    
    // Count URLs removed
    const urlsRemoved = options.removeUrls ? 
      ((originalText.match(/https?:\/\/[^\s]+/gi) || []).length + 
       (originalText.match(/www\.[^\s]+/gi) || []).length + 
       (originalText.match(/[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.(?:com|org|net|edu|gov|mil|int|co|uk|de|fr|jp|au|us|ru|ch|it|nl|se|no|es|mil|info|biz|name|io|ly|app|dev)\b[^\s]*/gi) || []).length) : 0;
    
    // Count emails removed
    const emailsRemoved = options.removeEmails ? 
      (originalText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).length : 0;

    return {
      originalLength,
      plainLength,
      charactersRemoved,
      reductionPercentage,
      htmlTagsRemoved,
      markdownElementsRemoved,
      urlsRemoved,
      emailsRemoved
    };
  }, [originalText, plainText, options]);

  const statisticsData = [
    {
      key: 'originalLength',
      label: tool('plainText.analytics.originalLength'),
      value: stats.originalLength,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'plainLength',
      label: tool('plainText.analytics.plainLength'),
      value: stats.plainLength,
      icon: Sparkles,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'charactersRemoved',
      label: tool('plainText.analytics.charactersRemoved'),
      value: stats.charactersRemoved,
      icon: Hash,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      key: 'reductionPercentage',
      label: tool('plainText.analytics.reductionPercentage'),
      value: `${stats.reductionPercentage}%`,
      icon: Percent,
      color: stats.reductionPercentage > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
    },
    {
      key: 'htmlElements',
      label: tool('plainText.analytics.htmlElements'),
      value: stats.htmlTagsRemoved,
      icon: Code,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'markdownElements',
      label: tool('plainText.analytics.markdownElements'),
      value: stats.markdownElementsRemoved,
      icon: BarChart3,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      key: 'urlsRemoved',
      label: tool('plainText.analytics.urlsRemoved'),
      value: stats.urlsRemoved,
      icon: Link2,
      color: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      key: 'emailsRemoved',
      label: tool('plainText.analytics.emailsRemoved'),
      value: stats.emailsRemoved,
      icon: Mail,
      color: 'text-pink-600 dark:text-pink-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
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
            <Sparkles className="h-5 w-5 text-primary" />
            {tool('plainText.analytics.title')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
export function calculatePlainTextStats(
  originalText: string, 
  plainText: string, 
  options: {
    removeHtml: boolean;
    removeMarkdown: boolean;
    removeUrls: boolean;
    removeEmails: boolean;
    removeNumbers: boolean;
    removeSpecialChars: boolean;
    removeEmojis: boolean;
    removePunctuation: boolean;
  }
): PlainTextStats {
  const originalLength = originalText.length;
  const plainLength = plainText.length;
  const charactersRemoved = originalLength - plainLength;
  const reductionPercentage = originalLength > 0 ? 
    Math.round((charactersRemoved / originalLength) * 100) : 0;
  
  const htmlTagsRemoved = options.removeHtml ? 
    (originalText.match(/<[^>]*>/g) || []).length : 0;
  
  let markdownElementsRemoved = 0;
  if (options.removeMarkdown) {
    const headers = (originalText.match(/^#{1,6}\s+/gm) || []).length;
    const bold = (originalText.match(/(\*\*|__)(.*?)\1/g) || []).length;
    const italic = (originalText.match(/(\*|_)(.*?)\1/g) || []).length;
    const links = (originalText.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
    markdownElementsRemoved = headers + bold + italic + links;
  }
  
  const urlsRemoved = options.removeUrls ? 
    ((originalText.match(/https?:\/\/[^\s]+/gi) || []).length + 
     (originalText.match(/www\.[^\s]+/gi) || []).length) : 0;
  
  const emailsRemoved = options.removeEmails ? 
    (originalText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).length : 0;

  return {
    originalLength,
    plainLength,
    charactersRemoved,
    reductionPercentage,
    htmlTagsRemoved,
    markdownElementsRemoved,
    urlsRemoved,
    emailsRemoved
  };
}
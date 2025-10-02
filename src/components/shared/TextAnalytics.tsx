'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { BarChart3, Hash, Type, FileText, AlignLeft, PilcrowIcon } from 'lucide-react';

interface TextAnalyticsProps {
  text: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  lines: number;
  paragraphs: number;
}

export function TextAnalytics({ text, showTitle = true, variant = 'default' }: TextAnalyticsProps) {
  const { tSync } = useCommonTranslations();
  
  const stats: TextStats = useMemo(() => {
    if (!text || text.trim().length === 0) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        lines: 0,
        paragraphs: 0
      };
    }

    // Characters
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    
    // Words - split by whitespace and filter out empty strings
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Sentences - split by sentence terminators
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    
    // Lines - split by line breaks
    const lines = text.split(/\r?\n/).length;
    
    // Paragraphs - split by double line breaks or empty lines
    const paragraphs = text.split(/\r?\n\s*\r?\n/).filter(paragraph => paragraph.trim().length > 0).length;

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      lines,
      paragraphs
    };
  }, [text]);

  const statisticsData = [
    {
      key: 'characters',
      label: tSync('analytics.characters', 'Characters'),
      value: stats.characters,
      icon: Type,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'charactersNoSpaces',
      label: tSync('analytics.charactersNoSpaces', 'Characters (no spaces)'),
      value: stats.charactersNoSpaces,
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'words',
      label: tSync('analytics.words', 'Words'),
      value: stats.words,
      icon: FileText,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'sentences',
      label: tSync('analytics.sentences', 'Sentences'),
      value: stats.sentences,
      icon: AlignLeft,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'lines',
      label: tSync('analytics.lines', 'Lines'),
      value: stats.lines,
      icon: BarChart3,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      key: 'paragraphs',
      label: tSync('analytics.paragraphs', 'Paragraphs'),
      value: stats.paragraphs,
      icon: PilcrowIcon,
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">{value.toLocaleString()}</span>
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
            {tSync('analytics.title', 'Text Statistics')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
            <div
              key={key}
              className="flex flex-col items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Icon className={`h-5 w-5 mb-2 ${color}`} />
              <span className="text-lg font-semibold text-foreground">{value.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground text-center mt-1">{label}</span>
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
export function calculateTextStats(text: string): TextStats {
  if (!text || text.trim().length === 0) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      lines: 0,
      paragraphs: 0
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  const lines = text.split(/\r?\n/).length;
  const paragraphs = text.split(/\r?\n\s*\r?\n/).filter(paragraph => paragraph.trim().length > 0).length;

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    lines,
    paragraphs
  };
}
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { BarChart3, Hash, Type, FileText, AlignLeft, PilcrowIcon, Clock, Mic } from 'lucide-react';

interface TextCounterAnalyticsProps {
  text: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface ExtendedTextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  lines: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
}

export function TextCounterAnalytics({ text, showTitle = true, variant = 'default' }: TextCounterAnalyticsProps) {
  const { tSync } = useCommonTranslations();
  
  const stats: ExtendedTextStats = useMemo(() => {
    if (!text || text.trim().length === 0) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        lines: 0,
        paragraphs: 0,
        readingTime: 0,
        speakingTime: 0
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

    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200) || 0;
    
    // Calculate speaking time (average 130 words per minute)
    const speakingTime = Math.ceil(words / 130) || 0;

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      lines,
      paragraphs,
      readingTime,
      speakingTime
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
      key: 'paragraphs',
      label: tSync('analytics.paragraphs', 'Paragraphs'),
      value: stats.paragraphs,
      icon: PilcrowIcon,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      key: 'readingTime',
      label: tSync('analytics.readingTime', 'Reading Time (min)'),
      value: stats.readingTime,
      icon: Clock,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      key: 'speakingTime',
      label: tSync('analytics.speakingTime', 'Speaking Time (min)'),
      value: stats.speakingTime,
      icon: Mic,
      color: 'text-pink-600 dark:text-pink-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
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
            {tSync('analytics.title', 'Text Analysis')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
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
export function calculateExtendedTextStats(text: string): ExtendedTextStats {
  if (!text || text.trim().length === 0) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      lines: 0,
      paragraphs: 0,
      readingTime: 0,
      speakingTime: 0
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  const lines = text.split(/\r?\n/).length;
  const paragraphs = text.split(/\r?\n\s*\r?\n/).filter(paragraph => paragraph.trim().length > 0).length;

  // Calculate reading time (average 200 words per minute)
  const readingTime = Math.ceil(words / 200) || 0;
  
  // Calculate speaking time (average 130 words per minute)
  const speakingTime = Math.ceil(words / 130) || 0;

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    lines,
    paragraphs,
    readingTime,
    speakingTime
  };
}
'use client';

import React from 'react';

export interface TextStats {
  characters?: number;
  charactersNoSpaces?: number;
  words?: number;
  sentences?: number;
  paragraphs?: number;
  lines?: number;
  uniqueWords?: number;
  readingTime?: number;
  duplicateLines?: number;
  escapedCharacters?: number;
  averageWordsPerSentence?: number;
  [key: string]: number | undefined;
}

interface StatConfig {
  key: keyof TextStats;
  label: string;
  color: 'primary' | 'emerald' | 'orange' | 'purple' | 'rose' | 'blue';
  format?: (value: number) => string;
}

interface TextAnalyticsProps {
  stats: TextStats;
  mode?: 'grid' | 'inline';
  showStats?: Array<keyof TextStats>;
  className?: string;
}

const defaultStatConfigs: StatConfig[] = [
  {
    key: 'characters',
    label: 'Characters',
    color: 'primary',
  },
  {
    key: 'charactersNoSpaces',
    label: 'Chars (No Spaces)',
    color: 'blue',
  },
  {
    key: 'words',
    label: 'Words',
    color: 'emerald',
  },
  {
    key: 'sentences',
    label: 'Sentences',
    color: 'purple',
  },
  {
    key: 'paragraphs',
    label: 'Paragraphs',
    color: 'orange',
  },
  {
    key: 'lines',
    label: 'Lines',
    color: 'rose',
  },
  {
    key: 'uniqueWords',
    label: 'Unique Words',
    color: 'blue',
  },
  {
    key: 'readingTime',
    label: 'Reading Time',
    color: 'purple',
    format: (value: number) => `${value} min${value !== 1 ? 's' : ''}`,
  },
  {
    key: 'duplicateLines',
    label: 'Duplicates Removed',
    color: 'orange',
  },
  {
    key: 'escapedCharacters',
    label: 'Escaped Chars',
    color: 'emerald',
  },
  {
    key: 'averageWordsPerSentence',
    label: 'Avg Words/Sentence',
    color: 'blue',
    format: (value: number) => value.toFixed(1),
  },
];

export function useTextStats() {
  const calculateStats = React.useCallback((text: string): TextStats => {
    if (!text) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        uniqueWords: 0,
        readingTime: 0,
      };
    }

    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const uniqueWords = new Set(words.map(word => word.toLowerCase().replace(/[^\w]/g, '')));
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
    const lines = text.split('\n');
    const avgWordsPerMinute = 200;

    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      lines: lines.length,
      uniqueWords: uniqueWords.size,
      readingTime: Math.ceil(words.length / avgWordsPerMinute),
    };
  }, []);

  return { calculateStats };
}

export function TextAnalytics({
  stats,
  mode = 'grid',
  showStats,
  className = '',
}: TextAnalyticsProps) {
  // Filter configs based on showStats prop - always show, display zeros if no data
  const visibleConfigs = defaultStatConfigs.filter(config => {
    const isRequested = showStats ? showStats.includes(config.key) : true;
    return isRequested;
  });

  if (visibleConfigs.length === 0) {
    return null;
  }

  if (mode === 'inline') {
    return (
      <div className={`stats-inline ${className}`}>
        {visibleConfigs.map((config, index) => {
          const value = stats[config.key] ?? 0;
          const displayValue = config.format ? config.format(value) : value.toString();

          return (
            <React.Fragment key={config.key}>
              <div className="stats-inline-item">
                <span className="text-muted-foreground">{config.label}:</span>
                <span className="stats-inline-value">{displayValue}</span>
              </div>
              {index < visibleConfigs.length - 1 && (
                <div className="stats-inline-separator" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`stats-grid ${className}`}>
      {visibleConfigs.map(config => {
        const value = stats[config.key] ?? 0;
        const displayValue = config.format ? config.format(value) : value.toString();

        return (
          <div
            key={config.key}
            className={`stats-card stats-${config.color}`}
          >
            <div className="stats-card-content">
              <div className="stats-value">{displayValue}</div>
              <div className="stats-label">{config.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Utility function to generate basic stats from text
export function generateTextStats(text: string): TextStats {
  const { calculateStats } = useTextStats();
  return calculateStats(text);
}

// Export for backward compatibility
export { TextAnalytics as default }; 
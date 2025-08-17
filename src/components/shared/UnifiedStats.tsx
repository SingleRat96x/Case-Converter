import React from 'react';
import { TextStats } from './types';
import { themeClasses, cn } from '@/lib/theme-config';

interface UnifiedStatsProps {
  stats: TextStats & Record<string, number>;
  variant?: 'cards' | 'inline' | 'compact';
  showFields?: Array<string>;
  cardVariant?: keyof typeof themeClasses.stats.card.variants;
  className?: string;
}

const defaultFields = ['characters', 'words', 'sentences', 'lines'];

const fieldLabels: Record<string, string> = {
  characters: 'Characters',
  charactersNoSpaces: 'Characters (no spaces)',
  words: 'Words',
  sentences: 'Sentences',
  lines: 'Lines',
  paragraphs: 'Paragraphs',
  uniqueWords: 'Unique Words',
  readingTime: 'Reading Time (minutes)',
  duplicateLines: 'Duplicates Removed',
};

export function UnifiedStats({
  stats,
  variant = 'cards',
  showFields = defaultFields,
  cardVariant = 'default',
  className
}: UnifiedStatsProps) {
  const displayFields = showFields.filter(field => field in stats);

  if (variant === 'inline') {
    return (
      <div className={cn(themeClasses.stats.inline.base, themeClasses.divider, 'pt-4', className)}>
        {displayFields.map((field, index) => (
          <React.Fragment key={field}>
            {index > 0 && (
              <span className={themeClasses.stats.inline.divider} aria-hidden="true">|</span>
            )}
            <div className="flex items-center gap-1">
              <span className={themeClasses.stats.inline.label}>
                {fieldLabels[field] || field}:
              </span>
              <span className={themeClasses.stats.inline.value}>
                {typeof stats[field] === 'number' ? stats[field].toLocaleString() : stats[field]}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-4', className)}>
        {displayFields.map(field => (
          <div key={field} className="text-sm">
            <span className={themeClasses.stats.inline.value}>
              {typeof stats[field] === 'number' ? stats[field].toLocaleString() : stats[field]}
            </span>
            {' '}
            <span className={themeClasses.stats.inline.label}>
              {fieldLabels[field] || field}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Cards variant (default)
  const gridCols = displayFields.length <= 2 
    ? themeClasses.grid.cols[2] 
    : displayFields.length === 3 
    ? themeClasses.grid.cols[3]
    : themeClasses.grid.cols[4];

  return (
    <div className={cn(
      themeClasses.grid.base,
      gridCols,
      themeClasses.grid.gaps.sm,
      themeClasses.divider,
      'pt-8',
      className
    )}>
      {displayFields.map(field => (
        <div
          key={field}
          className={cn(
            themeClasses.stats.card.base,
            themeClasses.stats.card.variants[cardVariant]
          )}
        >
          <div className="text-2xl font-semibold text-foreground">
            {typeof stats[field] === 'number' ? stats[field].toLocaleString() : stats[field]}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {fieldLabels[field] || field}
          </div>
        </div>
      ))}
    </div>
  );
}
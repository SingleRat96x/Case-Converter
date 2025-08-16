'use client';

import { Download, Copy, RotateCw } from 'lucide-react';
import { TextStats } from './types';
import { useState, useEffect } from 'react';
import { UnifiedStats } from './UnifiedStats';
import { themeClasses, cn } from '@/lib/theme-config';

interface CaseConverterButtonsProps {
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  stats: TextStats & Record<string, number>;
  inputText?: string;
  variant?: 'default' | 'compact';
  statsVariant?: 'cards' | 'inline' | 'compact';
  showStats?: boolean;
  showStatsFields?: string[];
}

export function CaseConverterButtons({ 
  onDownload, 
  onCopy, 
  onClear, 
  stats, 
  inputText,
  variant = 'default',
  statsVariant = 'cards',
  showStats = true,
  showStatsFields
}: CaseConverterButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setCopied(false);
  }, [inputText]);

  const buttonSize = variant === 'compact' ? 'sm' : 'md';

  return (
    <div className={cn(themeClasses.section.spacing.lg)}>
      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mx-auto">
        <button
          onClick={onDownload}
          className={cn(
            themeClasses.button.base,
            themeClasses.button.sizes[buttonSize],
            themeClasses.button.variants.primary,
            'w-full'
          )}
          disabled={!inputText}
          aria-label="Download text as file"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
        <button
          onClick={handleCopy}
          className={cn(
            themeClasses.button.base,
            themeClasses.button.sizes[buttonSize],
            themeClasses.button.variants.secondary,
            'w-full'
          )}
          disabled={!inputText}
          aria-label="Copy text to clipboard"
        >
          <Copy className="h-4 w-4" />
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
        <button
          onClick={onClear}
          className={cn(
            themeClasses.button.base,
            themeClasses.button.sizes[buttonSize],
            themeClasses.button.variants.ghost,
            'w-full'
          )}
          disabled={!inputText}
          aria-label="Clear all text"
        >
          <RotateCw className="h-4 w-4" />
          <span>Clear</span>
        </button>
      </div>

      {/* Stats Display */}
      {showStats && (
        <UnifiedStats
          stats={stats}
          variant={statsVariant}
          showFields={showStatsFields}
        />
      )}
    </div>
  );
} 
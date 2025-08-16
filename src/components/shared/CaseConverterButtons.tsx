'use client';

import { Download, Copy, RotateCw } from 'lucide-react';
import { TextStats } from './types';
import { useState, useEffect } from 'react';

interface CaseConverterButtonsProps {
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  stats: TextStats;
  inputText?: string;
}

export function CaseConverterButtons({ onDownload, onCopy, onClear, stats, inputText }: CaseConverterButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setCopied(false);
  }, [inputText]);

  return (
    <div className="space-y-8">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          disabled={!inputText}
          aria-label="Download text as file"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          disabled={!inputText}
          aria-label="Copy text to clipboard"
        >
          <Copy className="h-4 w-4" />
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          disabled={!inputText}
          aria-label="Clear all text"
        >
          <RotateCw className="h-4 w-4" />
          <span>Clear</span>
        </button>
      </div>

      {/* Stats Cards - Subtle Design */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 border-t border-border">
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="text-2xl font-semibold text-foreground">{stats.characters.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-1">Characters</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="text-2xl font-semibold text-foreground">{stats.words.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-1">Words</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="text-2xl font-semibold text-foreground">{stats.sentences.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-1">Sentences</div>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="text-2xl font-semibold text-foreground">{stats.lines.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-1">Lines</div>
        </div>
      </div>
    </div>
  );
} 
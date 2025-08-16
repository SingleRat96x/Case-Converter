'use client';

import { Download, Copy, RefreshCw } from 'lucide-react';
import { TextStats } from './types';

interface CaseConverterButtonsProps {
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  stats: TextStats;
}

export function CaseConverterButtons({ onDownload, onCopy, onClear, stats }: CaseConverterButtonsProps) {
  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
        >
          <Download className="h-4 w-4" />
          Download Text
        </button>
        <button
          onClick={onCopy}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
        >
          <Copy className="h-4 w-4" />
          Copy to Clipboard
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
        <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
          <div className="text-2xl font-bold text-primary">{stats.characters}</div>
          <div className="text-sm text-muted-foreground">Characters</div>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
          <div className="text-2xl font-bold text-primary">{stats.words}</div>
          <div className="text-sm text-muted-foreground">Words</div>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
          <div className="text-2xl font-bold text-primary">{stats.sentences}</div>
          <div className="text-sm text-muted-foreground">Sentences</div>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
          <div className="text-2xl font-bold text-primary">{stats.lines}</div>
          <div className="text-sm text-muted-foreground">Lines</div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { Download, Copy, RefreshCw } from 'lucide-react';
import { ActionButtonGroup } from '@/app/components/shared/ToolActions';
import { TextAnalytics, type TextStats } from '@/app/components/shared/TextAnalytics';

interface CaseConverterButtonsProps {
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  stats: TextStats;
}

export function CaseConverterButtons({ onDownload, onCopy, onClear, stats }: CaseConverterButtonsProps) {
  return (
    <div className="space-y-6">
      {/* Unified Action Buttons */}
      <ActionButtonGroup
        onDownload={onDownload}
        onCopy={onCopy}
        onClear={onClear}
        copyLabel="Copy to Clipboard"
        className="justify-center"
      />

      {/* Unified Stats */}
      <div className="max-w-4xl mx-auto">
        <TextAnalytics
          stats={stats}
          mode="grid"
          showStats={['characters', 'words', 'sentences', 'lines']}
        />
      </div>
    </div>
  );
} 
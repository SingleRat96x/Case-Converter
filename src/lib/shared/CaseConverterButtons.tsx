'use client';

import { Download, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionSection, StatsSection } from './ToolLayout';
import { TextStats } from './types';

interface CaseConverterButtonsProps {
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  stats: TextStats;
}

export function CaseConverterButtons({
  onDownload,
  onCopy,
  onClear,
  stats,
}: CaseConverterButtonsProps) {
  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <ActionSection>
        <Button
          onClick={onCopy}
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Result
        </Button>
        <Button
          onClick={onDownload}
          variant="outline"
          className="px-6 py-2.5 border-border hover:bg-accent"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button
          onClick={onClear}
          variant="outline"
          className="px-6 py-2.5 border-border hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </ActionSection>

      {/* Stats */}
      <StatsSection>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Characters:</span>
          <Badge variant="secondary" className="px-3 py-1 bg-muted/50">
            {stats.characters}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Words:</span>
          <Badge variant="secondary" className="px-3 py-1 bg-muted/50">
            {stats.words}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Sentences:</span>
          <Badge variant="secondary" className="px-3 py-1 bg-muted/50">
            {stats.sentences}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Lines:</span>
          <Badge variant="secondary" className="px-3 py-1 bg-muted/50">
            {stats.lines}
          </Badge>
        </div>
      </StatsSection>
    </div>
  );
}

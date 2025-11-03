'use client';

import React from 'react';
import { 
  Sparkles, 
  Minimize2, 
  Copy, 
  Download, 
  Trash2, 
  Check, 
  Loader2,
  Settings2,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToolTranslations } from '@/lib/i18n/hooks';

interface JsonFormatterToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onClear: () => void;
  isProcessing: boolean;
  hasInput: boolean;
  hasOutput: boolean;
  copySuccess: boolean;
  downloadSuccess: boolean;
  className?: string;
}

export function JsonFormatterToolbar({
  onFormat,
  onMinify,
  onCopy,
  onDownload,
  onClear,
  isProcessing,
  hasInput,
  hasOutput,
  copySuccess,
  downloadSuccess,
  className = ''
}: JsonFormatterToolbarProps) {
  const { common, tool } = useToolTranslations('tools/code-data');

  const formatButtonText = isProcessing 
    ? tool('jsonFormatter.processing') || 'Processing...' 
    : tool('jsonFormatter.formatButton') || 'Format & Validate';

  return (
    <div className={`bg-muted/30 rounded-lg p-4 border border-border space-y-4 ${className}`}>
      {/* Primary Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={onFormat}
          disabled={!hasInput || isProcessing}
          size="lg"
          className="gap-2"
          title="Format and validate JSON (Ctrl+Enter)"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {formatButtonText}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {formatButtonText}
            </>
          )}
        </Button>

        <Button
          onClick={onMinify}
          disabled={!hasInput || isProcessing}
          size="lg"
          variant="outline"
          className="gap-2"
          title="Minify JSON (remove whitespace)"
        >
          <Minimize2 className="h-4 w-4" />
          {tool('jsonFormatter.minifyButton') || 'Minify'}
        </Button>

        <Button
          onClick={onCopy}
          disabled={!hasOutput}
          size="lg"
          variant="outline"
          className="gap-2"
          title="Copy output to clipboard (Ctrl+C)"
        >
          {copySuccess ? (
            <>
              <Check className="h-4 w-4" />
              {common('buttons.copied') || 'Copied!'}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {common('buttons.copy') || 'Copy'}
            </>
          )}
        </Button>

        <Button
          onClick={onDownload}
          disabled={!hasOutput}
          size="lg"
          variant="outline"
          className="gap-2"
          title="Download formatted JSON as file"
        >
          {downloadSuccess ? (
            <>
              <Check className="h-4 w-4" />
              {common('buttons.downloaded') || 'Downloaded!'}
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              {common('buttons.download') || 'Download'}
            </>
          )}
        </Button>

        <Button
          onClick={onClear}
          disabled={!hasInput && !hasOutput}
          size="lg"
          variant="ghost"
          className="gap-2 ml-auto"
          title="Clear all input and output (Ctrl+K)"
        >
          <Trash2 className="h-4 w-4" />
          {common('buttons.clear') || 'Clear'}
        </Button>
      </div>

      {/* Helper Text */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          {tool('jsonFormatter.helperText') || 'Paste JSON or drop a JSON/TXT file. We\'ll pretty-print and validate in your browser. Press Ctrl/Cmd+Enter to format.'}
        </p>
      </div>
    </div>
  );
}

'use client';

import { Download, Copy, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { themeClasses, cn } from '@/lib/theme-config';

interface ActionButtonsProps {
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  disabled?: boolean;
  downloadDisabled?: boolean;
  copyDisabled?: boolean;
  clearDisabled?: boolean;
}

export function ActionButtons({
  onDownload,
  onCopy,
  onClear,
  disabled = false,
  downloadDisabled = false,
  copyDisabled = false,
  clearDisabled = false,
}: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset copied state when component updates
  useEffect(() => {
    if (disabled || copyDisabled) {
      setCopied(false);
    }
  }, [disabled, copyDisabled]);

  const isDownloadDisabled = disabled || downloadDisabled;
  const isCopyDisabled = disabled || copyDisabled;
  const isClearDisabled = disabled || clearDisabled;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Mobile-first layout: 2 buttons first row, 1 button second row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Download - Primary button */}
        <button
          onClick={onDownload}
          disabled={isDownloadDisabled}
          className={cn(
            themeClasses.button.base,
            themeClasses.button.sizes.md,
            themeClasses.button.variants.primary,
            'w-full min-w-0',
            isDownloadDisabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Download text as file"
        >
          <Download className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">Download</span>
        </button>

        {/* Copy - Secondary button */}
        <button
          onClick={handleCopy}
          disabled={isCopyDisabled}
          className={cn(
            themeClasses.button.base,
            themeClasses.button.sizes.md,
            themeClasses.button.variants.secondary,
            'w-full min-w-0',
            isCopyDisabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Copy text to clipboard"
        >
          <Copy className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Second row: Clear button - full width */}
      <div className="grid grid-cols-1">
        <button
          onClick={onClear}
          disabled={isClearDisabled}
          className={cn(
            themeClasses.button.base,
            themeClasses.button.sizes.md,
            themeClasses.button.variants.ghost,
            'w-full min-w-0',
            isClearDisabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Clear all text"
        >
          <RotateCcw className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">Clear</span>
        </button>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download, Trash2, Upload } from 'lucide-react';
import { useCommonTranslations } from '@/lib/i18n/hooks';

interface ActionButtonsProps {
  onCopy: () => Promise<boolean> | boolean;
  onClear: () => void;
  onDownload: () => void;
  onUpload: () => void;
  copyText: string;
  clearText: string;
  downloadText: string;
  uploadText: string;
  isUploading?: boolean;
  hasContent?: boolean;
  /** When false, do not render the upload button */
  showUpload?: boolean;
  /** Optional: show a download report button */
  onDownloadReport?: () => void;
  reportText?: string;
  showReport?: boolean;
  /** Mobile layout: default "row" or "2x2" grid */
  mobileLayout?: 'row' | '2x2';
}

export function ActionButtons({
  onCopy,
  onClear,
  onDownload,
  onUpload,
  copyText,
  clearText,
  downloadText,
  uploadText,
  isUploading = false,
  hasContent = true,
  showUpload = true,
  onDownloadReport,
  reportText,
  showReport = false,
  mobileLayout = 'row'
}: ActionButtonsProps) {
  const { tSync } = useCommonTranslations();
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');

  const handleCopy = async () => {
    try {
      const success = await onCopy();
      
      if (success) {
        setCopyState('copied');
        // Show "Copied" state for 2 seconds, then revert to normal
        setTimeout(() => {
          setCopyState('idle');
        }, 2000);
      }
    } catch {
      // If copy fails, don't show copied state
    }
  };

  const isCopied = copyState === 'copied';
  const copyIcon = isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />;
  const copyTextDisplay = isCopied ? tSync('buttons.copied', 'Copied') : copyText;

  // Determine layout classes
  const containerClass = mobileLayout === '2x2' 
    ? "grid grid-cols-2 sm:flex sm:flex-row gap-3 justify-center w-full max-w-md sm:max-w-none"
    : "flex flex-col sm:flex-row gap-3 justify-center w-full";

  const buttonClass = mobileLayout === '2x2'
    ? "flex items-center gap-2 w-full sm:flex-1"
    : "w-full sm:flex-1 flex items-center gap-2";

  return (
    <div className={containerClass}>
      <Button 
        onClick={handleCopy}
        className={`${buttonClass} transition-all duration-300 ease-in-out ${
          isCopied
            ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white'
            : ''
        }`}
        disabled={!hasContent}
      >
        <span className="transition-all duration-200">
          {copyIcon}
        </span>
        <span className="transition-all duration-200">
          {copyTextDisplay}
        </span>
      </Button>
      
      <Button 
        onClick={onDownload} 
        variant="outline" 
        className={buttonClass}
        disabled={!hasContent}
      >
        <Download className="h-4 w-4" />
        {downloadText}
      </Button>
      
      <Button 
        onClick={onClear} 
        variant="outline" 
        className={buttonClass}
      >
        <Trash2 className="h-4 w-4" />
        {clearText}
      </Button>
      
      {showUpload && (
        <Button 
          onClick={onUpload} 
          variant="outline" 
          className={buttonClass}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Uploading...' : uploadText}
        </Button>
      )}

      {showReport && onDownloadReport && (
        <Button
          onClick={onDownloadReport}
          variant="outline"
          className={buttonClass}
          disabled={!hasContent}
        >
          <Download className="h-4 w-4" />
          {reportText || tSync('buttons.downloadReport', 'Download Report')}
        </Button>
      )}
    </div>
  );
}
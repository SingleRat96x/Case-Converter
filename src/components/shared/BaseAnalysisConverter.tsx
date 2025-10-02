'use client';

import React, { useState, useRef, ReactNode } from 'react';
import { TextInput } from './TextInput';
import { ActionButtons } from './ActionButtons';
import { FeedbackMessage } from './FeedbackMessage';
import { ClearConfirmDialog } from './ClearConfirmDialog';
import { copyToClipboard, downloadTextAsFile, validateTextFile } from '@/lib/utils';
import { EnhancedResponsiveAd } from '@/components/ads/EnhancedResponsiveAd';

interface BaseAnalysisConverterProps {
  title: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  /** Label for the Copy button (optional). If provided, a Copy button will be shown. */
  copyText?: string;
  clearText: string;
  /** Label for the Download button (optional). If provided, a Download button will be shown. */
  downloadText?: string;
  uploadText: string;
  uploadDescription: string;
  /** Filename to use when downloading the input text. Defaults to "text.txt". */
  downloadFileName?: string;
  children?: ReactNode;
  useMonoFont?: boolean;
  onTextChange: (text: string) => void;
  text: string;
  onFileUploaded?: (content: string) => void;
  /** Additional action buttons to show alongside clear and upload */
  additionalActions?: ReactNode;
  /** Optional report download hook and labels to render as part of action bar */
  onDownloadReport?: () => void;
  reportText?: string;
  /** Mobile layout for action buttons */
  mobileLayout?: 'row' | '2x2';
}

export function BaseAnalysisConverter({
  title,
  description,
  inputLabel,
  inputPlaceholder,
  copyText,
  clearText,
  downloadText,
  uploadText,
  uploadDescription,
  downloadFileName,
  children,
  onTextChange,
  text,
  onFileUploaded,
  additionalActions,
  onDownloadReport,
  reportText,
  mobileLayout = 'row'
}: BaseAnalysisConverterProps) {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setShowClearDialog(true);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(text || '');
    if (!success) {
      showFeedback('error', 'Failed to copy text');
    }
    return success;
  };

  const handleDownload = () => {
    if (!text) return;
    downloadTextAsFile(text, downloadFileName || 'text.txt');
  };

  const handleConfirmClear = () => {
    onTextChange('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateTextFile(file)) {
      showFeedback('error', 'Please select a valid text file');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onTextChange(content);
      onFileUploaded?.(content);
      setIsUploading(false);
      showFeedback('success', 'File uploaded successfully');
    };
    reader.onerror = () => {
      setIsUploading(false);
      showFeedback('error', 'Failed to read file');
    };
    reader.readAsText(file);
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Text Input Section */}
      <div className="space-y-4">
        <TextInput
          id="analysis-input"
          label={inputLabel}
          value={text}
          onChange={onTextChange}
          placeholder={inputPlaceholder}
        />
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <ActionButtons
            onCopy={handleCopy}
            onClear={handleClear}
            onDownload={handleDownload}
            onUpload={() => fileInputRef.current?.click()}
            copyText={copyText || ''}
            clearText={clearText}
            downloadText={downloadText || ''}
            uploadText={uploadText}
            isUploading={isUploading}
            hasContent={!!text}
            mobileLayout={mobileLayout}
            showUpload={true}
            onDownloadReport={onDownloadReport}
            reportText={reportText}
            showReport={!!onDownloadReport}
          />
          
          {/* Additional Actions */}
          {additionalActions}
        </div>

        {/* Upload Description (hidden for text-counter use-case) */}
        {uploadDescription && uploadDescription.trim().length > 0 && (
          <p className="hidden text-sm text-muted-foreground">{uploadDescription}</p>
        )}
      </div>

      {/* Children (Analytics/Results) */}
      {children}

      {/* Strategic Ad Placement */}
      <EnhancedResponsiveAd 
        format="auto" 
        className="my-8" 
        lazy={true}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.js,.ts,.jsx,.tsx,.json,.css,.html"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Feedback Message */}
      <FeedbackMessage
        feedback={feedback}
      />

      {/* Clear Confirmation Dialog */}
      <ClearConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleConfirmClear}
        contentType="text"
      />
    </div>
  );
}
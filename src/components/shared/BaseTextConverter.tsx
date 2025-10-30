'use client';

import React, { useState, useRef, ReactNode } from 'react';
import { TextInput } from './TextInput';
import { TextOutput } from './TextOutput';
import { ActionButtons } from './ActionButtons';
import { FeedbackMessage } from './FeedbackMessage';
import { TextAnalytics } from './TextAnalytics';
import { ClearConfirmDialog } from './ClearConfirmDialog';
import { copyToClipboard, downloadTextAsFile, validateTextFile } from '@/lib/utils';
import { ToolHeaderAd } from '@/components/ads/AdPlacements';

interface BaseTextConverterProps {
  title: string;
  description: string;
  inputLabel: string;
  outputLabel: string;
  inputPlaceholder: string;
  copyText: string;
  clearText: string;
  downloadText: string;
  uploadText: string;
  uploadDescription: string;
  downloadFileName: string;
  children?: ReactNode;
  showAnalytics?: boolean;
  analyticsVariant?: 'default' | 'compact';
  useMonoFont?: boolean;
  onTextChange: (text: string) => void;
  text: string;
  convertedText: string;
  onConvertedTextUpdate: (text: string) => void;
  onFileUploaded?: (content: string) => void;
  actionButtonsPosition?: 'after-children' | 'before-children';
  mobileLayout?: 'row' | '2x2';
  // Optional second download button (e.g., for CSV vs TXT)
  onDownloadSecondary?: () => void;
  downloadSecondaryText?: string;
  downloadSecondaryFileName?: string;
  showSecondaryDownload?: boolean;
  // Optional custom download handler (overrides default)
  onDownloadPrimary?: () => void;
  // Optional custom label component for input
  customInputLabel?: ReactNode;
}

export function BaseTextConverter({
  title,
  description,
  inputLabel,
  outputLabel,
  inputPlaceholder,
  copyText,
  clearText,
  downloadText,
  uploadText,
  uploadDescription,
  downloadFileName,
  children,
  showAnalytics = true,
  analyticsVariant = 'default',
  useMonoFont = false,
  onTextChange,
  text,
  convertedText,
  onConvertedTextUpdate,
  onFileUploaded,
  actionButtonsPosition = 'after-children',
  mobileLayout = 'row',
  onDownloadSecondary,
  downloadSecondaryText,
  downloadSecondaryFileName,
  showSecondaryDownload = false,
  onDownloadPrimary,
  customInputLabel
}: BaseTextConverterProps) {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    const success = await copyToClipboard(convertedText);
    if (!success) {
      showFeedback('error', 'Failed to copy text');
    }
    return success;
  };

  const handleClear = () => {
    setShowClearDialog(true);
  };

  const handleConfirmClear = () => {
    onTextChange('');
    onConvertedTextUpdate('');
  };

  const handleDownload = () => {
    if (onDownloadPrimary) {
      onDownloadPrimary();
    } else if (convertedText) {
      downloadTextAsFile(convertedText, downloadFileName);
    }
  };

  const handleDownloadSecondary = () => {
    if (onDownloadSecondary) {
      onDownloadSecondary();
    } else if (convertedText && downloadSecondaryFileName) {
      downloadTextAsFile(convertedText, downloadSecondaryFileName);
    }
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
      if (onFileUploaded) {
        onFileUploaded(content);
      }
      setIsUploading(false);
      showFeedback('success', 'File uploaded successfully!');
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

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Heading */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">{title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      {/* Tool Header Ad - below title and description */}
      <ToolHeaderAd />

      {/* Feedback Message */}
      <FeedbackMessage feedback={feedback} />

      {/* Text Input Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <TextInput
            id="text-input"
            label={inputLabel}
            value={text}
            onChange={onTextChange}
            placeholder={inputPlaceholder}
            customLabelComponent={customInputLabel}
          />
          
          <TextOutput
            id="converted-text"
            label={outputLabel}
            value={convertedText}
            useMonoFont={useMonoFont}
          />
        </div>

        {/* Action Buttons - Before Children */}
        {actionButtonsPosition === 'before-children' && copyText && clearText && downloadText && uploadText && (
          <ActionButtons
            onCopy={handleCopy}
            onClear={handleClear}
            onDownload={handleDownload}
            onUpload={triggerFileUpload}
            copyText={copyText}
            clearText={clearText}
            downloadText={downloadText}
            uploadText={uploadText}
            isUploading={isUploading}
            hasContent={!!convertedText}
            mobileLayout={mobileLayout}
            onDownloadReport={showSecondaryDownload ? handleDownloadSecondary : undefined}
            reportText={downloadSecondaryText}
            showReport={showSecondaryDownload}
          />
        )}

        {/* Additional controls (like case selection buttons) */}
        {children}

        {/* Action Buttons - After Children */}
        {actionButtonsPosition === 'after-children' && copyText && clearText && downloadText && uploadText && (
          <ActionButtons
            onCopy={handleCopy}
            onClear={handleClear}
            onDownload={handleDownload}
            onUpload={triggerFileUpload}
            copyText={copyText}
            clearText={clearText}
            downloadText={downloadText}
            uploadText={uploadText}
            isUploading={isUploading}
            hasContent={!!convertedText}
            mobileLayout={mobileLayout}
            onDownloadReport={showSecondaryDownload ? handleDownloadSecondary : undefined}
            reportText={downloadSecondaryText}
            showReport={showSecondaryDownload}
          />
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.js,.ts,.jsx,.tsx,.json,.css,.html"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Upload Description (hidden to match BaseAnalysisConverter behavior) */}
        {uploadDescription && uploadDescription.trim().length > 0 && (
          <p className="hidden text-sm text-muted-foreground">{uploadDescription}</p>
        )}
        
        {/* Text Analytics */}
        {showAnalytics && (
          <div className="mt-6">
            <TextAnalytics 
              text={convertedText || text || ''} 
              variant={analyticsVariant}
              showTitle={false}
            />
          </div>
        )}
      </div>

      {/* Clear Confirmation Dialog */}
      <ClearConfirmDialog 
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleConfirmClear}
      />
    </div>
  );
}
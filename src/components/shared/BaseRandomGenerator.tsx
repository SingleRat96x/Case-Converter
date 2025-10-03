'use client';

import React, { useState, ReactNode } from 'react';
import { ActionButtons } from './ActionButtons';
import { FeedbackMessage } from './FeedbackMessage';
import { NumberAnalytics } from './NumberAnalytics';
import { LetterAnalytics } from './LetterAnalytics';
import { DateAnalytics } from './DateAnalytics';
import { MonthAnalytics } from './MonthAnalytics';
import { IPAnalytics } from './IPAnalytics';
import { ClearConfirmDialog } from './ClearConfirmDialog';
import { copyToClipboard, downloadTextAsFile } from '@/lib/utils';
import { ToolHeaderAd } from '@/components/ads/AdPlacements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommonTranslations } from '@/lib/i18n/hooks';

interface BaseRandomGeneratorProps {
  title: string;
  description: string;
  generateButtonText: string;
  outputLabel: string;
  copyText: string;
  clearText: string;
  downloadText: string;
  downloadFileName: string;
  children?: ReactNode;
  showAnalytics?: boolean;
  analyticsVariant?: 'default' | 'compact';
  useMonoFont?: boolean;
  onGenerate: () => void;
  generatedContent: string;
  onClearContent: () => void;
  isGenerating?: boolean;
  generateButtonVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  generateButtonSize?: 'default' | 'sm' | 'lg' | 'icon';
  actionButtonsPosition?: 'after-children' | 'before-children';
  /** When true, show action buttons even when there is no content */
  alwaysShowActions?: boolean;
  /** When true, show analytics even when there is no content */
  alwaysShowAnalytics?: boolean;
  /** When true, hide the upload button from the action buttons */
  hideUploadButton?: boolean;
  /** Analytics type: 'number' for NumberAnalytics, 'letter' for LetterAnalytics, 'date' for DateAnalytics, 'month' for MonthAnalytics, 'ip' for IPAnalytics */
  analyticsType?: 'number' | 'letter' | 'date' | 'month' | 'ip';
}

export function BaseRandomGenerator({
  title,
  description,
  generateButtonText,
  outputLabel,
  copyText,
  clearText,
  downloadText,
  downloadFileName,
  children,
  showAnalytics = true,
  analyticsVariant = 'default',
  useMonoFont = false,
  onGenerate,
  generatedContent,
  onClearContent,
  isGenerating = false,
  generateButtonVariant = 'default',
  generateButtonSize = 'default',
  actionButtonsPosition = 'after-children',
  alwaysShowActions = false,
  alwaysShowAnalytics = false,
  hideUploadButton = false,
  analyticsType = 'number'
}: BaseRandomGeneratorProps) {
  const { tSync } = useCommonTranslations();
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [showClearDialog, setShowClearDialog] = useState(false);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const handleCopy = async () => {
    if (!generatedContent.trim()) {
      showFeedback('No content to copy', 'error');
      return false;
    }

    const success = await copyToClipboard(generatedContent);
    if (success) {
      showFeedback('Content copied to clipboard!');
    } else {
      showFeedback('Failed to copy content', 'error');
    }
    return success;
  };

  const handleDownload = () => {
    if (!generatedContent.trim()) {
      showFeedback('No content to download', 'error');
      return false;
    }

    try {
      downloadTextAsFile(generatedContent, downloadFileName);
      showFeedback('File downloaded successfully!');
      return true;
    } catch {
      showFeedback('Failed to download file', 'error');
      return false;
    }
  };

  const handleClear = () => {
    if (!generatedContent.trim()) {
      showFeedback('No content to clear', 'error');
      return false;
    }
    setShowClearDialog(true);
    return true;
  };

  const confirmClear = () => {
    onClearContent();
    setShowClearDialog(false);
    showFeedback('Content cleared!');
  };

  const hasContent = generatedContent.trim().length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      {/* Tool Header Ad - below title and description */}
      <ToolHeaderAd />

      {/* Main Content */}
      <div className="space-y-8">
        {/* Desktop: Side by side, Mobile: Stacked */}
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Generator Section */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">{tSync('generator.generatorOptions')}</CardTitle>
              <CardDescription>{tSync('generator.configureSettings')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tool-specific options */}
              {actionButtonsPosition === 'before-children' && children}
              
              {children && actionButtonsPosition === 'after-children' && children}

              {/* Generate Button - Mobile/Tablet only */}
              <div className="flex justify-center pt-4 lg:hidden">
                <Button
                  onClick={onGenerate}
                  disabled={isGenerating}
                  variant={generateButtonVariant}
                  size={generateButtonSize}
                  className="min-w-[200px]"
                >
                  {isGenerating ? 'Generating...' : generateButtonText}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section - Always visible */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">{outputLabel}</CardTitle>
              <CardDescription>{tSync('generator.generatedContent')}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Generated Content Display */}
              <div className="relative">
                <div
                  className={`
                    w-full h-[200px] md:h-[240px] p-4 border rounded-lg bg-muted/30 overflow-y-auto
                    ${useMonoFont ? 'font-mono text-sm' : ''}
                    whitespace-pre-wrap break-words
                  `}
                >
                  {generatedContent || tSync('generator.contentPlaceholder')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Button - Desktop only, centered below both columns */}
        <div className="hidden lg:flex justify-center">
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            variant={generateButtonVariant}
            size={generateButtonSize}
            className="min-w-[240px]"
          >
            {isGenerating ? 'Generating...' : generateButtonText}
          </Button>
        </div>

        {/* Action Buttons - Centered below both boxes */}
        {(alwaysShowActions || hasContent) && (
          <div className="flex justify-center">
            <ActionButtons
              onCopy={handleCopy}
              onClear={handleClear}
              onDownload={handleDownload}
              onUpload={() => false}
              copyText={copyText}
              clearText={clearText}
              downloadText={downloadText}
              uploadText=""
              hasContent={hasContent}
              showUpload={!hideUploadButton}
            />
          </div>
        )}


        {/* Analytics Section - Outside and below generated content */}
        {showAnalytics && (alwaysShowAnalytics || hasContent) && (
          analyticsType === 'letter' ? (
            <LetterAnalytics
              letters={generatedContent}
              variant={analyticsVariant}
            />
          ) : analyticsType === 'date' ? (
            <DateAnalytics
              dates={generatedContent}
              variant={analyticsVariant}
            />
          ) : analyticsType === 'month' ? (
            <MonthAnalytics
              months={generatedContent}
              variant={analyticsVariant}
            />
          ) : analyticsType === 'ip' ? (
            <IPAnalytics
              ips={generatedContent}
              variant={analyticsVariant}
            />
          ) : (
            <NumberAnalytics
              numbers={generatedContent}
              variant={analyticsVariant}
            />
          )
        )}
      </div>

      {/* Feedback Message */}
      <FeedbackMessage
        feedback={feedbackMessage ? { type: feedbackType, message: feedbackMessage } : null}
      />

      {/* Clear Confirmation Dialog */}
      <ClearConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={confirmClear}
        contentType="text"
      />
    </div>
  );
}
'use client';

import React, { useState, useRef, ReactNode, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ActionButtons } from './ActionButtons';
import { FeedbackMessage } from './FeedbackMessage';
import { ClearConfirmDialog } from './ClearConfirmDialog';
import { DataStats, type DataStat } from './DataStats';
import { EnhancedResponsiveAd } from '@/components/ads/EnhancedResponsiveAd';
import { Upload, Download, Image as ImageIcon, AlertCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';

export interface ProcessedImage {
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
  blob: Blob;
}

export interface ImageDimensions {
  width: number;
  height: number;
  size: number;
  format: string;
}

interface BaseImageConverterProps {
  title: string;
  description: string;
  uploadLabel: string;
  processedLabel: string;
  uploadAreaLabel: string;
  dragDropLabel: string;
  supportedFormatsLabel: string;
  copyText: string;
  clearText: string;
  downloadText: string;
  uploadText: string;
  replaceText: string;
  downloadFileName: string;
  children?: ReactNode;
  showStats?: boolean;
  statsVariant?: 'default' | 'compact';
  acceptedFormats?: string[];
  originalImage: HTMLImageElement | null;
  processedImage: ProcessedImage | null;
  isUploading?: boolean;
  isProcessing?: boolean;
  error?: string | null;
  stats?: DataStat[];
  // Action handlers
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onDownload?: () => void;
  onCopy?: () => Promise<boolean>;
}

export function BaseImageConverter({
  title,
  description,
  uploadLabel,
  processedLabel,
  uploadAreaLabel,
  dragDropLabel,
  supportedFormatsLabel,
  copyText,
  clearText,
  downloadText,
  replaceText,
  children,
  showStats = true,
  statsVariant = 'compact',
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  originalImage,
  processedImage,
  isUploading = false,
  isProcessing = false,
  error = null,
  stats = [],
  onFileUpload,
  onClear,
  onDownload,
  onCopy,
}: BaseImageConverterProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => acceptedFormats.includes(file.type));
    
    if (imageFile) {
      const fakeEvent = {
        target: { files: [imageFile] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileUpload(fakeEvent);
    }
  }, [acceptedFormats, onFileUpload]);

  // Handle copy action
  const handleCopy = useCallback(async () => {
    if (!onCopy) return false;
    
    try {
      const success = await onCopy();
      if (success) {
        setFeedbackMessage({ type: 'success', message: 'Image copied to clipboard!' });
        setTimeout(() => setFeedbackMessage(null), 3000);
        return true;
      } else {
        setFeedbackMessage({ type: 'error', message: 'Failed to copy image to clipboard' });
        setTimeout(() => setFeedbackMessage(null), 3000);
        return false;
      }
    } catch {
      setFeedbackMessage({ type: 'error', message: 'Failed to copy image to clipboard' });
      setTimeout(() => setFeedbackMessage(null), 3000);
      return false;
    }
  }, [onCopy]);

  // Handle clear action
  const handleClear = useCallback(() => {
    setShowClearDialog(true);
  }, []);

  const handleConfirmClear = useCallback(() => {
    onClear();
    setShowClearDialog(false);
    setFeedbackMessage(null);
  }, [onClear]);

  // Trigger file upload
  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      {/* Feedback Message */}
      {feedbackMessage && (
        <FeedbackMessage
          feedback={feedbackMessage}
        />
      )}

      {/* Ad Break */}
      <EnhancedResponsiveAd className="my-8" format="auto" lazy={true} />

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Area / Original Image */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{uploadLabel}</h3>
            {originalImage && (
              <Button
                onClick={triggerFileUpload}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {replaceText}
              </Button>
            )}
          </div>

          {!originalImage ? (
            <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted/70 transition-colors h-96">
              <div 
                className="flex flex-col items-center justify-center p-12 text-center cursor-pointer h-full"
                onClick={triggerFileUpload}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {uploadAreaLabel}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {dragDropLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {supportedFormatsLabel}
                </p>
                {isUploading && (
                  <div className="mt-4">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="relative">
                <Image
                  src={originalImage.src}
                  alt="Original image for processing"
                  width={originalImage.width}
                  height={originalImage.height}
                  className="max-w-full h-auto rounded-lg"
                  unoptimized={true}
                  priority={true}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Processed Result */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{processedLabel}</h3>
          
          {processedImage ? (
            <Card className="p-4">
              <div className="space-y-4">
                {/* Processed Image Display */}
                <div className="relative w-full bg-muted/10 rounded-lg overflow-hidden">
                  <Image
                    src={processedImage.url}
                    alt="Processed result image"
                    width={processedImage.width}
                    height={processedImage.height}
                    className="max-w-full h-auto"
                    unoptimized={true}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                {onCopy && (
                  <ActionButtons
                    onCopy={handleCopy}
                    onClear={handleClear}
                    onDownload={onDownload || (() => {})}
                    onUpload={triggerFileUpload}
                    copyText={copyText}
                    clearText={clearText}
                    downloadText={downloadText}
                    uploadText={replaceText}
                    isUploading={isUploading}
                    hasContent={!!processedImage}
                  />
                )}
                {!onCopy && (
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      size="sm"
                      disabled={!processedImage}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {clearText}
                    </Button>
                    {onDownload && (
                      <Button
                        onClick={onDownload}
                        variant="default"
                        size="sm"
                        disabled={!processedImage}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        {downloadText}
                      </Button>
                    )}
                    <Button
                      onClick={triggerFileUpload}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {replaceText}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/10 h-96">
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Processed image will appear here
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Tool-specific Options and Controls */}
      {children}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Statistics */}
      {showStats && stats.length > 0 && (
        <DataStats 
          stats={stats} 
          variant={statsVariant}
          showIcons={true}
        />
      )}

      {/* Ad Break */}
      <EnhancedResponsiveAd className="my-8" format="auto" lazy={true} />

      {/* Hidden Elements */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={onFileUpload}
        className="hidden"
      />

      {/* Clear Confirmation Dialog */}
      <ClearConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleConfirmClear}
      />
    </div>
  );
}
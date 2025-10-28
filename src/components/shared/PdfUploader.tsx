'use client';

import React, { useRef, useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { validatePdfFile, formatFileSize } from '@/lib/pdfUtils';

export interface PdfFile {
  file: File;
  name: string;
  size: number;
  isValid: boolean;
  error?: string;
}

interface PdfUploaderProps {
  onFileUpload: (file: File) => void;
  onClear?: () => void;
  isUploading?: boolean;
  isProcessing?: boolean;
  error?: string | null;
  uploadedFile?: PdfFile | null;
  // Labels and text
  uploadAreaLabel: string;
  dragDropLabel: string;
  supportedFormatsLabel: string;
  replaceText: string;
  clearText: string;
  processingText: string;
  // Configuration
  maxFileSize?: number; // in MB
  className?: string;
}

export function PdfUploader({
  onFileUpload,
  onClear,
  isUploading = false,
  isProcessing = false,
  error = null,
  uploadedFile = null,
  uploadAreaLabel,
  dragDropLabel,
  supportedFormatsLabel,
  replaceText,
  clearText,
  processingText,
  maxFileSize = 10, // eslint-disable-line @typescript-eslint/no-unused-vars
  className = ''
}: PdfUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle drag and drop events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      const validation = validatePdfFile(pdfFile);
      if (validation.isValid) {
        onFileUpload(pdfFile);
      }
    }
  }, [onFileUpload]);

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validatePdfFile(file);
      if (validation.isValid) {
        onFileUpload(file);
      }
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  }, [onFileUpload]);

  // Trigger file input click
  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle clear action
  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
    }
  }, [onClear]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {!uploadedFile ? (
        <Card 
          className={`border-2 border-dashed transition-all duration-200 h-64 ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 bg-muted/50 hover:bg-muted/70'
          }`}
        >
          <div 
            className="flex flex-col items-center justify-center p-8 text-center cursor-pointer h-full"
            onClick={triggerFileUpload}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading || isProcessing ? (
              <>
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isProcessing ? processingText : 'Uploading...'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we process your PDF file
                </p>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </Card>
      ) : (
        /* File Info Display */
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="h-8 w-8 text-red-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {uploadedFile.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(uploadedFile.size)}
                </p>
                
                {/* Validation Status */}
                <div className="flex items-center gap-1 mt-2">
                  {uploadedFile.isValid ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Valid PDF file</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      <span className="text-xs text-red-600">{uploadedFile.error}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-2 sm:ml-4">
              <Button
                onClick={triggerFileUpload}
                variant="outline"
                size="sm"
                className="gap-1 sm:gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300"
                disabled={isUploading || isProcessing}
              >
                <Upload className="h-3 w-3 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline">{replaceText}</span>
              </Button>
              
              {onClear && (
                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:border-red-800 dark:text-red-300"
                  disabled={isUploading || isProcessing}
                >
                  <X className="h-3 w-3 sm:h-3 sm:w-3" />
                  <span className="hidden sm:inline">{clearText}</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Processing Overlay */}
          {(isUploading || isProcessing) && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md border">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  {isProcessing ? processingText : 'Uploading file...'}
                </span>
              </div>
            </div>
          )}
        </Card>
      )}
      
      {/* Error Display */}
      {error && (
        <Card className="p-3 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </Card>
      )}
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
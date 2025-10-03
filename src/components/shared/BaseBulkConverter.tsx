'use client';

import React, { useState, useRef, ReactNode, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ClearConfirmDialog } from './ClearConfirmDialog';
import { DataStats, type DataStat } from './DataStats';
import { ToolHeaderAd } from '@/components/ads/AdPlacements';
import { EnhancedResponsiveAd } from '@/components/ads/EnhancedResponsiveAd';
import { 
  Upload, 
  Download, 
  AlertCircle,
  FileUp,
  Files,
  CheckCircle,
  XCircle,
  Loader2,
  Archive,
  Grid3X3,
  List,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import Image from 'next/image';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { ImageCardSkeleton } from './ImageCardSkeleton';

export interface ProcessedFile {
  id: string;
  originalFile: File;
  originalUrl?: string;
  processedBlob?: Blob;
  processedUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  progress?: number;
}

export interface BulkProcessingStats {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  totalOriginalSize: number;
  totalProcessedSize: number;
}

interface BaseBulkConverterProps {
  title: string;
  description: string;
  uploadAreaLabel: string;
  dragDropLabel: string;
  supportedFormatsLabel: string;
  clearText: string;
  downloadAllText: string;
  downloadFileName: string;
  children?: ReactNode;
  showStats?: boolean;
  statsVariant?: 'default' | 'compact';
  acceptedFormats?: string[];
  maxFiles?: number;
  supportsBulk?: boolean;
  
  // Single file mode props
  originalFile?: File | null;
  processedFile?: ProcessedFile | null;
  isUploading?: boolean;
  error?: string | null;
  stats?: DataStat[];
  
  // Bulk mode props
  fileQueue?: ProcessedFile[];
  bulkStats?: BulkProcessingStats;
  isProcessingBulk?: boolean;
  
  // Action handlers
  onFileUpload: (files: File[]) => void;
  onClear: () => void;
  onDownload?: (fileId?: string) => void;
  onDownloadAll?: () => void;
  onCopy?: (fileId?: string) => Promise<boolean>;
  onRemoveFile?: (fileId: string) => void;
  
  // Processing function - implemented by each converter
  processFile?: (file: File, options?: Record<string, unknown>) => Promise<Blob>;
}

export function BaseBulkConverter({
  title,
  description,
  uploadAreaLabel,
  dragDropLabel,
  supportedFormatsLabel,
  clearText,
  downloadAllText,
  children,
  showStats = true,
  statsVariant = 'compact',
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles = 30,
  supportsBulk = true,
  originalFile,
  processedFile,
  isUploading = false,
  error = null,
  stats = [],
  fileQueue = [],
  bulkStats,
  isProcessingBulk = false,
  onFileUpload,
  onClear,
  onDownload,
  onDownloadAll,
  onCopy,
  onRemoveFile,
}: BaseBulkConverterProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copyStates, setCopyStates] = useState<Record<string, 'idle' | 'copying' | 'copied'>>({});
  
  const { tSync: tCommon } = useCommonTranslations();
  
  // Smart mode detection: bulk mode if there are multiple files in queue
  const isBulkMode = supportsBulk && fileQueue.length > 1;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to get output filename
  const getOutputFileName = useCallback((originalName: string, outputExtension: string = 'png') => {
    return `${originalName.replace(/\.[^/.]+$/, "")}.${outputExtension}`;
  }, []);

  // Helper function to get output file size
  const getOutputFileSize = useCallback((processedBlob?: Blob) => {
    if (!processedBlob) return null;
    return (processedBlob.size / 1024).toFixed(1);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const handleCopy = useCallback(async (fileId: string): Promise<boolean> => {
    if (!onCopy) return false;
    
    setCopyStates(prev => ({ ...prev, [fileId]: 'copying' }));
    
    try {
      const success = await onCopy(fileId);
      if (success) {
        setCopyStates(prev => ({ ...prev, [fileId]: 'copied' }));
        // Reset to idle after 2 seconds
        setTimeout(() => {
          setCopyStates(prev => ({ ...prev, [fileId]: 'idle' }));
        }, 2000);
      } else {
        setCopyStates(prev => ({ ...prev, [fileId]: 'idle' }));
      }
      return success;
    } catch {
      setCopyStates(prev => ({ ...prev, [fileId]: 'idle' }));
      return false;
    }
  }, [onCopy]);

  const triggerFileUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const getStatusIcon = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <FileUp className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAcceptAttribute = () => {
    return acceptedFormats.join(',');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </div>

      {/* Tool Header Ad - below title and description */}
      <ToolHeaderAd />

      {/* Upload Area */}
      {(!isBulkMode && !originalFile) || (isBulkMode && fileQueue.length === 0) ? (
        <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted/70 transition-colors">
          <div 
            className="flex flex-col items-center justify-center p-12 text-center cursor-pointer"
            onClick={triggerFileUpload}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {supportsBulk && fileQueue.length === 0 ? (
              <>
                <Files className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {uploadAreaLabel}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {`${dragDropLabel} (${maxFiles} files max)`}
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
              </>
            )}
            <p className="text-xs text-muted-foreground">
              {supportedFormatsLabel}
            </p>
            {(isUploading || isProcessingBulk) && (
              <div className="mt-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </Card>
      ) : null}


      {/* File Queue - Same UI for 1 image or many images */}
      {(fileQueue.length > 0 || processedFile) && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold">
              {(() => {
                const totalCount = fileQueue.length > 0 ? fileQueue.length : (processedFile ? 1 : 0);
                return totalCount === 1 
                  ? tCommon('labels.convertedImage')
                  : `${tCommon('labels.convertedImages')} (${totalCount})`;
              })()}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`flex-shrink-0 ${viewMode === 'grid' ? 'bg-accent' : ''}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`flex-shrink-0 ${viewMode === 'list' ? 'bg-accent' : ''}`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                onClick={triggerFileUpload}
                variant="outline"
                size="sm"
                className="gap-2 flex-1 min-w-[100px] sm:flex-initial"
              >
                <Upload className="h-4 w-4" />
                Add More
              </Button>
              <Button
                onClick={() => setShowClearDialog(true)}
                variant="outline"
                size="sm"
                className="gap-2 flex-1 min-w-[80px] sm:flex-initial"
              >
                <Trash2 className="h-4 w-4" />
                {clearText}
              </Button>
              {onDownloadAll && (
                <Button
                  onClick={onDownloadAll}
                  variant="default"
                  size="sm"
                  className="gap-2 flex-1 min-w-[120px] sm:flex-initial"
                  disabled={
                    fileQueue.length > 0 
                      ? fileQueue.filter(f => f.status === 'completed').length === 0
                      : !processedFile || processedFile.status !== 'completed'
                  }
                >
                  <Archive className="h-4 w-4" />
                  {downloadAllText}
                </Button>
              )}
            </div>
          </div>

          {/* File Grid/List */}
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
            : "space-y-2"
          }>
            {(fileQueue.length > 0 ? fileQueue : processedFile ? [processedFile] : []).map((file) => {
              // Show skeleton for processing files
              if (file.status === 'processing') {
                return <ImageCardSkeleton key={file.id} viewMode={viewMode} />;
              }
              
              return (
              <Card key={file.id} className={`${viewMode === 'grid' ? "p-3" : "p-4"} image-card-hover`}>
                {viewMode === 'grid' ? (
                  <div className="space-y-2">
                    <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {file.originalFile.type.startsWith('image/') && file.processedUrl ? (
                        <>
                          <Image
                            src={file.processedUrl}
                            alt={`Preview of ${file.originalFile.name}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute top-1 left-1 bg-background/80 rounded p-1">
                            {getStatusIcon(file.status)}
                          </div>
                        </>
                      ) : file.originalFile.type.startsWith('image/') && file.originalUrl ? (
                        <>
                          <Image
                            src={file.originalUrl}
                            alt={`Original ${file.originalFile.name}`}
                            fill
                            className="object-cover opacity-50"
                            unoptimized
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                            {getStatusIcon(file.status)}
                          </div>
                        </>
                      ) : (
                        <>
                          <FileUp className="h-8 w-8 text-muted-foreground/50" />
                          <div className="absolute top-1 right-1">
                            {getStatusIcon(file.status)}
                          </div>
                        </>
                      )}
                      {onRemoveFile && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-background"
                          onClick={() => onRemoveFile(file.id)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-center">
                      <p className="font-medium truncate">
                        {file.status === 'completed' && file.processedBlob 
                          ? getOutputFileName(file.originalFile.name)
                          : file.originalFile.name
                        }
                      </p>
                      <p className="text-muted-foreground">
                        {file.status === 'completed' && file.processedBlob 
                          ? `${getOutputFileSize(file.processedBlob)} KB`
                          : `${(file.originalFile.size / 1024).toFixed(1)} KB`
                        }
                      </p>
                    </div>
                    {file.status === 'completed' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="flex-1 text-xs" 
                                onClick={() => onDownload?.(file.id)}>
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className={`flex-1 text-xs transition-all duration-300 ease-in-out ${
                            copyStates[file.id] === 'copied'
                              ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white border-green-600'
                              : ''
                          }`}
                          onClick={() => handleCopy(file.id)}
                        >
                          <span className="transition-all duration-200 flex items-center gap-1">
                            {copyStates[file.id] === 'copied' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copyStates[file.id] === 'copied' ? 'Copied' : 'Copy'}
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    {file.originalFile.type.startsWith('image/') && (file.processedUrl || file.originalUrl) ? (
                      <div className="w-16 h-16 bg-muted/50 rounded-lg flex-shrink-0 relative overflow-hidden">
                        <Image
                          src={file.processedUrl || file.originalUrl || ''}
                          alt={`Preview of ${file.originalFile.name}`}
                          fill
                          className={`object-cover ${file.processedUrl ? '' : 'opacity-50'}`}
                          unoptimized
                        />
                        <div className="absolute top-1 left-1 bg-background/80 rounded p-0.5">
                          {getStatusIcon(file.status)}
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-muted/50 rounded-lg flex-shrink-0 flex items-center justify-center relative">
                        <FileUp className="h-6 w-6 text-muted-foreground/50" />
                        <div className="absolute top-1 right-1">
                          {getStatusIcon(file.status)}
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.status === 'completed' && file.processedBlob 
                          ? getOutputFileName(file.originalFile.name)
                          : file.originalFile.name
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.status === 'completed' && file.processedBlob 
                          ? `${getOutputFileSize(file.processedBlob)} KB`
                          : `${(file.originalFile.size / 1024).toFixed(1)} KB`
                        }
                      </p>
                      {file.error && (
                        <p className="text-xs text-red-600">{file.error}</p>
                      )}
                    </div>
                    {file.status === 'completed' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onDownload?.(file.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className={`transition-all duration-300 ease-in-out ${
                            copyStates[file.id] === 'copied'
                              ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white border-green-600'
                              : ''
                          }`}
                          onClick={() => handleCopy(file.id)}
                        >
                          <span className="transition-all duration-200 flex items-center gap-1">
                            {copyStates[file.id] === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copyStates[file.id] === 'copied' ? 'Copied' : 'Copy'}
                          </span>
                        </Button>
                      </div>
                    )}
                    {onRemoveFile && fileQueue.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveFile(file.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Content (Options, etc.) */}
      {children}

      {/* Statistics */}
      {showStats && ((stats.length > 0) || bulkStats) && (
        <DataStats 
          stats={isBulkMode && bulkStats ? [
            {
              key: 'total',
              label: 'Total Files',
              value: bulkStats.total.toString(),
              icon: Files,
              color: 'text-blue-600 dark:text-blue-400'
            },
            {
              key: 'completed',
              label: 'Completed',
              value: bulkStats.completed.toString(),
              icon: CheckCircle,
              color: 'text-green-600 dark:text-green-400'
            },
            {
              key: 'failed',
              label: 'Failed',
              value: bulkStats.failed.toString(),
              icon: XCircle,
              color: 'text-red-600 dark:text-red-400'
            },
            {
              key: 'totalSize',
              label: 'Total Size',
              value: (bulkStats.totalProcessedSize / 1024).toFixed(1),
              icon: Archive,
              color: 'text-purple-600 dark:text-purple-400',
              suffix: 'KB'
            }
          ] : stats}
          variant={statsVariant}
          showIcons={true}
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <div className="flex items-start gap-2 p-4">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </Card>
      )}


      {/* Ad Placement */}
      <div className="flex justify-center">
        <EnhancedResponsiveAd 
          slot="4917772104"
          className="max-w-full"
        />
      </div>

      {/* Clear Confirmation Dialog */}
      <ClearConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={() => {
          onClear();
          setShowClearDialog(false);
        }}
        contentType="images"
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptAttribute()}
        multiple={supportsBulk}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
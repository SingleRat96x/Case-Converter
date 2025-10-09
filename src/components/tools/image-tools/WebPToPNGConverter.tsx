'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseBulkConverter, type ProcessedFile, type BulkProcessingStats } from '@/components/shared/BaseBulkConverter';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { WebPToPNGAnalytics } from '@/components/shared/WebPToPNGAnalytics';
import { Button } from '@/components/ui/button';
// JSZip will be imported dynamically to avoid SSR issues
import { 
  Settings, 
  Zap
} from 'lucide-react';

interface ConversionOptions {
  quality: number;
  compression: 'none' | 'fast' | 'best';
}

const getQualityPresets = (tool: (key: string) => string) => [
  { label: tool('webpToPng.options.qualityLevels.max'), value: 1.0 },
  { label: tool('webpToPng.options.qualityLevels.high'), value: 0.9 },
  { label: tool('webpToPng.options.qualityLevels.medium'), value: 0.7 },
  { label: tool('webpToPng.options.qualityLevels.low'), value: 0.5 }
];

export function WebPToPNGConverter() {
  const { common, tool } = useToolTranslations('tools/image-tools');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [fileQueue, setFileQueue] = useState<ProcessedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [, setIsProcessing] = useState(false);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [options, setOptions] = useState<ConversionOptions>({
    quality: 1.0,
    compression: 'best'
  });

  const handleOptionChange = useCallback(<K extends keyof ConversionOptions>(
    option: K,
    value: ConversionOptions[K]
  ) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
  }, []);

  const addProcessingDelay = useCallback(async (minDelay: number = 800, maxDelay: number = 1500) => {
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    return new Promise(resolve => setTimeout(resolve, delay));
  }, []);

  const convertSingleFile = useCallback(async (file: File): Promise<Blob> => {
    await addProcessingDelay();
    return new Promise((resolve, reject) => {
      if (!file.type.match(/^image\/webp$/i)) {
        reject(new Error(tool('webpToPng.errors.invalidFile')));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error(tool('webpToPng.errors.fileTooLarge')));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const img = new window.Image();

        img.onload = () => {
          try {
            const canvas = canvasRef.current;
            if (!canvas) {
              reject(new Error(tool('webpToPng.errors.canvasNotSupported')));
              return;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error(tool('webpToPng.errors.canvasNotSupported')));
              return;
            }

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = options.compression === 'best' ? 'high' : 
                                       options.compression === 'fast' ? 'low' : 'medium';

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error(tool('webpToPng.errors.failedToConvert')));
                }
              },
              'image/png',
              options.quality
            );
          } catch {
            reject(new Error(tool('webpToPng.errors.failedToConvert')));
          }
        };
        img.onerror = () => reject(new Error(tool('webpToPng.errors.failedToLoad')));
        img.src = imageUrl;
      };
      reader.onerror = () => reject(new Error(tool('webpToPng.errors.failedToRead')));
      reader.readAsDataURL(file);
    });
  }, [options, tool, addProcessingDelay]);

  const processFileQueue = useCallback(async (queue: ProcessedFile[]) => {
    const pendingFiles = queue.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsProcessingBulk(true);

    for (const file of pendingFiles) {
      setFileQueue(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing' as const } : f
      ));

      try {
        const convertedBlob = await convertSingleFile(file.originalFile);
        const url = URL.createObjectURL(convertedBlob);
        setFileQueue(prev => prev.map(f => 
          f.id === file.id ? {
            ...f,
            status: 'completed' as const,
            processedBlob: convertedBlob,
            processedUrl: url
          } : f
        ));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : tool('webpToPng.errors.conversionFailed');
        setFileQueue(prev => prev.map(f => 
          f.id === file.id ? {
            ...f,
            status: 'error' as const,
            error: errorMessage
          } : f
        ));
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setIsProcessingBulk(false);
  }, [convertSingleFile, tool]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    setError(null);
    const shouldUseBulkMode = files.length > 1 || fileQueue.length > 0 || processedFile !== null;

    if (!shouldUseBulkMode && files.length === 1) {
      const file = files[0];
      setOriginalFile(file);
      setIsUploading(true);
      try {
        setIsProcessing(true);
        const convertedBlob = await convertSingleFile(file);
        const url = URL.createObjectURL(convertedBlob);
        const processed: ProcessedFile = {
          id: `single-${Date.now()}`,
          originalFile: file,
          originalUrl: URL.createObjectURL(file),
          processedBlob: convertedBlob,
          processedUrl: url,
          status: 'completed'
        };
        setProcessedFile(processed);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : tool('webpToPng.errors.failedToConvert');
        setError(errorMessage);
      } finally {
        setIsUploading(false);
        setIsProcessing(false);
      }
    } else {
      const validFiles = files.filter(file => 
        file.type.match(/^image\/webp$/i) && file.size <= 10 * 1024 * 1024
      );
      if (validFiles.length === 0) {
        setError(tool('webpToPng.errors.invalidFile'));
        return;
      }
      const newFiles: ProcessedFile[] = validFiles.map(file => ({
        id: `bulk-${Date.now()}-${Math.random()}`,
        originalFile: file,
        originalUrl: URL.createObjectURL(file),
        status: 'pending'
      }));
      setFileQueue(prev => {
        const existingFiles = prev.length > 0 ? prev : (processedFile ? [processedFile] : []);
        const updated = [...existingFiles, ...newFiles];
        const pendingFiles = updated.filter(f => f.status === 'pending');
        if (pendingFiles.length > 0) {
          processFileQueue(updated);
        }
        return updated;
      });
      if (processedFile) {
        setProcessedFile(null);
        setOriginalFile(null);
      }
    }
  }, [tool, processFileQueue, fileQueue, processedFile, convertSingleFile]);

  const handleClear = useCallback(() => {
    if (processedFile) {
      if (processedFile.originalUrl) URL.revokeObjectURL(processedFile.originalUrl);
      if (processedFile.processedUrl) URL.revokeObjectURL(processedFile.processedUrl);
    }
    fileQueue.forEach(file => {
      if (file.originalUrl) URL.revokeObjectURL(file.originalUrl);
      if (file.processedUrl) URL.revokeObjectURL(file.processedUrl);
    });
    setOriginalFile(null);
    setProcessedFile(null);
    setFileQueue([]);
    setError(null);
  }, [processedFile, fileQueue]);

  const handleDownload = useCallback((fileId?: string) => {
    let fileToDownload: ProcessedFile | null = null;
    if (fileId) {
      fileToDownload = fileQueue.find(f => f.id === fileId) || 
                       (processedFile && processedFile.id === fileId ? processedFile : null);
    } else {
      fileToDownload = processedFile;
    }
    if (!fileToDownload?.processedUrl) return;
    const link = document.createElement('a');
    link.download = `${fileToDownload.originalFile.name.replace(/\.[^/.]+$/, '')}.png`;
    link.href = fileToDownload.processedUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedFile, fileQueue]);

  const handleDownloadAll = useCallback(async () => {
    const completedFiles = fileQueue.length > 0 
      ? fileQueue.filter(f => f.status === 'completed' && f.processedBlob)
      : processedFile && processedFile.status === 'completed' && processedFile.processedBlob 
        ? [processedFile] 
        : [];
    if (completedFiles.length === 0) return;
    try {
      if (completedFiles.length === 1) {
        const file = completedFiles[0];
        const link = document.createElement('a');
        link.download = `${file.originalFile.name.replace(/\.[^/.]+$/, '')}.png`;
        link.href = file.processedUrl!;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const file of completedFiles) {
        if (file.processedBlob) {
          const fileName = `${file.originalFile.name.replace(/\.[^/.]+$/, '')}.png`;
          zip.file(fileName, file.processedBlob);
        }
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.download = 'converted-images.zip';
      link.href = URL.createObjectURL(zipBlob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch {
      setError(tool('webpToPng.errors.failedToCreateZip'));
    }
  }, [fileQueue, processedFile, tool]);

  const handleCopy = useCallback(async (fileId?: string): Promise<boolean> => {
    let fileToCopy: ProcessedFile | null = null;
    if (fileId) {
      fileToCopy = fileQueue.find(f => f.id === fileId) || 
                   (processedFile && processedFile.id === fileId ? processedFile : null);
    } else {
      fileToCopy = processedFile;
    }
    if (!fileToCopy?.processedBlob) return false;
    if (navigator.clipboard && 'write' in navigator.clipboard) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ [fileToCopy.processedBlob.type]: fileToCopy.processedBlob })
        ]);
        return true;
      } catch {}
    }
    if (navigator.clipboard && 'writeText' in navigator.clipboard) {
      try {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileToCopy!.processedBlob!);
        });
        await navigator.clipboard.writeText(dataUrl);
        return true;
      } catch {}
    }
    return false;
  }, [processedFile, fileQueue]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFileQueue(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        if (fileToRemove.originalUrl) URL.revokeObjectURL(fileToRemove.originalUrl);
        if (fileToRemove.processedUrl) URL.revokeObjectURL(fileToRemove.processedUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);


  const bulkStats = useMemo((): BulkProcessingStats => {
    const completed = fileQueue.filter(f => f.status === 'completed');
    const failed = fileQueue.filter(f => f.status === 'error');
    const inProgress = fileQueue.filter(f => f.status === 'processing');
    const totalOriginalSize = fileQueue.reduce((sum, f) => sum + f.originalFile.size, 0);
    const totalProcessedSize = completed.reduce((sum, f) => 
      sum + (f.processedBlob?.size || 0), 0
    );
    return {
      total: fileQueue.length,
      completed: completed.length,
      failed: failed.length,
      inProgress: inProgress.length,
      totalOriginalSize,
      totalProcessedSize
    };
  }, [fileQueue]);

  // Handle responsive accordion behavior
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint
        setIsAccordionOpen(true);
      } else {
        setIsAccordionOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="space-y-6">
      <BaseBulkConverter
        title={tool('webpToPng.title')}
        description={tool('webpToPng.description')}
        uploadAreaLabel={tool('webpToPng.labels.uploadArea')}
        dragDropLabel={tool('webpToPng.labels.dragDrop')}
        supportedFormatsLabel={tool('webpToPng.labels.supportedFormats')}
        clearText={common('buttons.clear')}
        downloadAllText="Download All"
        downloadFileName={tool('webpToPng.downloadFileName')}
        acceptedFormats={['image/webp']}
        supportsBulk={true}
        maxFiles={30}
        originalFile={originalFile}
        processedFile={processedFile}
        fileQueue={fileQueue}
        isUploading={isUploading}
        isProcessingBulk={isProcessingBulk}
        error={error}
        stats={[]}
        bulkStats={bulkStats}
        onFileUpload={handleFileUpload}
        onClear={handleClear}
        onDownload={handleDownload}
        onDownloadAll={handleDownloadAll}
        onCopy={handleCopy}
        onRemoveFile={handleRemoveFile}
      >
        {/* WebP to PNG Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('webpToPng.options.conversionSettings')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Quality Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('webpToPng.options.quality')}</h3>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {getQualityPresets(tool).map((preset) => (
                    <Button
                      key={preset.label}
                      onClick={() => handleOptionChange('quality', preset.value)}
                      variant={options.quality === preset.value ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Compression Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Settings className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('webpToPng.options.compression')}</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {(['none', 'fast', 'best'] as const).map((compression) => (
                    <Button
                      key={compression}
                      onClick={() => handleOptionChange('compression', compression)}
                      variant={options.compression === compression ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                    >
                      {tool(`webpToPng.options.compressionLevels.${compression}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </BaseBulkConverter>

      {/* WebP to PNG Analytics */}
      <WebPToPNGAnalytics 
        originalFile={originalFile}
        processedFile={processedFile}
        variant="compact"
        showTitle={false}
      />

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default WebPToPNGConverter;



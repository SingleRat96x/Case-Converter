'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseBulkConverter, type ProcessedFile, type BulkProcessingStats } from '@/components/shared/BaseBulkConverter';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { JPGToWebPAnalytics } from '@/components/shared/JPGToWebPAnalytics';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
// JSZip will be imported dynamically to avoid SSR issues
import { Settings, Zap, Globe } from 'lucide-react';

interface ConversionOptions {
  quality: number;
  compression: 'none' | 'fast' | 'best';
  lossless: boolean;
}

const getQualityPresets = (tool: (key: string) => string) => [
  { label: tool('jpgToWebp.options.qualityLevels.max'), value: 1.0 },
  { label: tool('jpgToWebp.options.qualityLevels.high'), value: 0.9 },
  { label: tool('jpgToWebp.options.qualityLevels.medium'), value: 0.7 },
  { label: tool('jpgToWebp.options.qualityLevels.low'), value: 0.5 }
];

export function JPGToWebPConverter() {
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

  const addProcessingDelay = useCallback(async (minDelay: number = 800, maxDelay: number = 1500) => {
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    return new Promise(resolve => setTimeout(resolve, delay));
  }, []);

  const [options, setOptions] = useState<ConversionOptions>({
    quality: 0.9,
    compression: 'best',
    lossless: false
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

  const processFileQueue = useCallback(async (queue: ProcessedFile[]) => {
    const pendingFiles = queue.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsProcessingBulk(true);

    for (const file of pendingFiles) {
      setFileQueue(prev => prev.map(f => f.id === file.id ? { ...f, status: 'processing' as const } : f));

      try {
        await addProcessingDelay();

        const convertedBlob = await (async (fileToProcess: File): Promise<Blob> => {
          return new Promise((resolve, reject) => {
            if (!fileToProcess.type.match(/^image\/(jpeg|jpg)$/i)) {
              reject(new Error(tool('jpgToWebp.errors.invalidFile')));
              return;
            }

            if (fileToProcess.size > 10 * 1024 * 1024) {
              reject(new Error(tool('jpgToWebp.errors.fileTooLarge')));
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
                    reject(new Error(tool('jpgToWebp.errors.canvasNotSupported')));
                    return;
                  }

                  const ctx = canvas.getContext('2d');
                  if (!ctx) {
                    reject(new Error(tool('jpgToWebp.errors.canvasNotSupported')));
                    return;
                  }

                  canvas.width = img.width;
                  canvas.height = img.height;

                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = options.compression === 'best' ? 'high' : options.compression === 'fast' ? 'low' : 'medium';
                  ctx.drawImage(img, 0, 0);

                  canvas.toBlob(
                    (blob) => {
                      if (blob) {
                        resolve(blob);
                      } else {
                        reject(new Error(tool('jpgToWebp.errors.failedToConvert')));
                      }
                    },
                    'image/webp',
                    options.quality
                  );
                } catch {
                  reject(new Error(tool('jpgToWebp.errors.failedToConvert')));
                }
              };

              img.onerror = () => reject(new Error(tool('jpgToWebp.errors.failedToLoad')));
              img.src = imageUrl;
            };

            reader.onerror = () => reject(new Error(tool('jpgToWebp.errors.failedToRead')));
            reader.readAsDataURL(fileToProcess);
          });
        })(file.originalFile);

        const url = URL.createObjectURL(convertedBlob);

        setFileQueue(prev => prev.map(f => f.id === file.id ? {
          ...f,
          status: 'completed' as const,
          processedBlob: convertedBlob,
          processedUrl: url
        } : f));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : tool('jpgToWebp.errors.conversionFailed');
        setFileQueue(prev => prev.map(f => f.id === file.id ? {
          ...f,
          status: 'error' as const,
          error: errorMessage
        } : f));
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsProcessingBulk(false);
  }, [options, tool, addProcessingDelay]);

  const convertSingleFile = useCallback(async (file: File): Promise<Blob> => {
    await addProcessingDelay();

    return new Promise((resolve, reject) => {
      if (!file.type.match(/^image\/(jpeg|jpg)$/i)) {
        reject(new Error(tool('jpgToWebp.errors.invalidFile')));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        reject(new Error(tool('jpgToWebp.errors.fileTooLarge')));
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
              reject(new Error(tool('jpgToWebp.errors.canvasNotSupported')));
              return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error(tool('jpgToWebp.errors.canvasNotSupported')));
              return;
            }

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = options.compression === 'best' ? 'high' : options.compression === 'fast' ? 'low' : 'medium';
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error(tool('jpgToWebp.errors.failedToConvert')));
                }
              },
              'image/webp',
              options.quality
            );
          } catch {
            reject(new Error(tool('jpgToWebp.errors.failedToConvert')));
          }
        };

        img.onerror = () => reject(new Error(tool('jpgToWebp.errors.failedToLoad')));
        img.src = imageUrl;
      };

      reader.onerror = () => reject(new Error(tool('jpgToWebp.errors.failedToRead')));
      reader.readAsDataURL(file);
    });
  }, [options, tool, addProcessingDelay]);

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
        const errorMessage = err instanceof Error ? err.message : tool('jpgToWebp.errors.failedToConvert');
        setError(errorMessage);
      } finally {
        setIsUploading(false);
        setIsProcessing(false);
      }
    } else {
      const validFiles = files.filter(file => file.type.match(/^image\/(jpeg|jpg)$/i) && file.size <= 10 * 1024 * 1024);

      if (validFiles.length === 0) {
        setError(tool('jpgToWebp.errors.invalidFile'));
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
      fileToDownload = fileQueue.find(f => f.id === fileId) || (processedFile && processedFile.id === fileId ? processedFile : null);
    } else {
      fileToDownload = processedFile;
    }
    if (!fileToDownload?.processedUrl) return;

    const link = document.createElement('a');
    link.download = `${fileToDownload.originalFile.name.replace(/\.[^/.]+$/, '')}.webp`;
    link.href = fileToDownload.processedUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedFile, fileQueue]);

  const handleDownloadAll = useCallback(async () => {
    const completedFiles = fileQueue.length > 0 ? fileQueue.filter(f => f.status === 'completed' && f.processedBlob) : processedFile && processedFile.status === 'completed' && processedFile.processedBlob ? [processedFile] : [];
    if (completedFiles.length === 0) return;

    try {
      if (completedFiles.length === 1) {
        const file = completedFiles[0];
        const link = document.createElement('a');
        link.download = `${file.originalFile.name.replace(/\.[^/.]+$/, '')}.webp`;
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
          const fileName = `${file.originalFile.name.replace(/\.[^/.]+$/, '')}.webp`;
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
    } catch (e) {
      console.error('Error creating ZIP file:', e);
      setError(tool('jpgToWebp.errors.failedToCreateZip'));
    }
  }, [fileQueue, processedFile, tool]);

  const handleCopy = useCallback(async (fileId?: string): Promise<boolean> => {
    let fileToCopy: ProcessedFile | null = null;
    if (fileId) {
      fileToCopy = fileQueue.find(f => f.id === fileId) || (processedFile && processedFile.id === fileId ? processedFile : null);
    } else {
      fileToCopy = processedFile;
    }
    if (!fileToCopy?.processedBlob) return false;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [fileToCopy.processedBlob.type]: fileToCopy.processedBlob })
      ]);
      return true;
    } catch {
      return false;
    }
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
    const totalProcessedSize = completed.reduce((sum, f) => sum + (f.processedBlob?.size || 0), 0);

    return { total: fileQueue.length, completed: completed.length, failed: failed.length, inProgress: inProgress.length, totalOriginalSize, totalProcessedSize };
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
        title={tool('jpgToWebp.title')}
        description={tool('jpgToWebp.description')}
        uploadAreaLabel={tool('jpgToWebp.labels.uploadArea')}
        dragDropLabel={tool('jpgToWebp.labels.dragDrop')}
        supportedFormatsLabel={tool('jpgToWebp.labels.supportedFormats')}
        clearText={common('buttons.clear')}
        downloadAllText={common('buttons.download')}
        downloadFileName={tool('jpgToWebp.downloadFileName')}
        acceptedFormats={['image/jpeg', 'image/jpg']}
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
        {/* JPG to WebP Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('jpgToWebp.options.conversionSettings')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Quality Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('jpgToWebp.options.quality')}</h3>
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
                  <h3 className="text-base font-semibold text-foreground">{tool('jpgToWebp.options.compression')}</h3>
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
                      {tool(`jpgToWebp.options.compressionLevels.${compression}`)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* WebP Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Globe className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('jpgToWebp.options.webpSettings')}</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label
                      htmlFor="lossless"
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {tool('jpgToWebp.options.losslessMode')}
                    </label>
                    <Switch
                      id="lossless"
                      checked={options.lossless}
                      onCheckedChange={(checked) => handleOptionChange('lossless', checked)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tool('jpgToWebp.options.losslessModeDescription')}
                  </p>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </BaseBulkConverter>

      {/* JPG to WebP Analytics */}
      <JPGToWebPAnalytics 
        originalFile={originalFile}
        processedFile={processedFile}
        variant="compact"
        showTitle={false}
      />

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default JPGToWebPConverter;



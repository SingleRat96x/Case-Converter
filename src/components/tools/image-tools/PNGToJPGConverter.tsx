'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseBulkConverter, type ProcessedFile, type BulkProcessingStats } from '@/components/shared/BaseBulkConverter';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { PNGToJPGAnalytics } from '@/components/shared/PNGToJPGAnalytics';
import { Button } from '@/components/ui/button';
// JSZip will be imported dynamically to avoid SSR issues
import { 
  Settings, 
  Zap,
  Palette
} from 'lucide-react';

interface ConversionOptions {
  quality: number;
  backgroundColor: string;
  compression: 'fast' | 'standard' | 'best';
}

const getQualityPresets = (tool: (key: string) => string) => [
  { label: tool('pngToJpg.options.qualityLevels.max'), value: 1.0 },
  { label: tool('pngToJpg.options.qualityLevels.high'), value: 0.9 },
  { label: tool('pngToJpg.options.qualityLevels.medium'), value: 0.7 },
  { label: tool('pngToJpg.options.qualityLevels.low'), value: 0.5 }
];

export function PNGToJPGConverter() {
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
    quality: 0.9, // High quality for JPG
    backgroundColor: '#ffffff',
    compression: 'standard'
  });

  // Handle option changes
  const handleOptionChange = useCallback(<K extends keyof ConversionOptions>(
    option: K,
    value: ConversionOptions[K]
  ) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
  }, []);

  // Add artificial delay for better UX
  const addProcessingDelay = useCallback(async (minDelay: number = 800, maxDelay: number = 1500) => {
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    return new Promise(resolve => setTimeout(resolve, delay));
  }, []);

  // Convert single file
  const convertSingleFile = useCallback(async (file: File): Promise<Blob> => {
    // Add artificial delay for better UX
    await addProcessingDelay();
    
    return new Promise((resolve, reject) => {
      // Validate file type - only accept PNG
      if (!file.type.match(/^image\/png$/i)) {
        reject(new Error(tool('pngToJpg.errors.invalidFile')));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        reject(new Error(tool('pngToJpg.errors.fileTooLarge')));
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
              reject(new Error(tool('pngToJpg.errors.canvasNotSupported')));
              return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error(tool('pngToJpg.errors.canvasNotSupported')));
              return;
            }

            // Set canvas size to match original image
            canvas.width = img.width;
            canvas.height = img.height;

            // Fill with background color (JPG doesn't support transparency)
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Set image smoothing based on compression setting
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = options.compression === 'best' ? 'high' : 
                                       options.compression === 'fast' ? 'low' : 'medium';

            // Draw the original image
            ctx.drawImage(img, 0, 0);

            // Convert to JPG blob
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error(tool('pngToJpg.errors.failedToConvert')));
                }
              },
              'image/jpeg',
              options.quality
            );
          } catch {
            reject(new Error(tool('pngToJpg.errors.failedToConvert')));
          }
        };
        
        img.onerror = () => {
          reject(new Error(tool('pngToJpg.errors.failedToLoad')));
        };
        
        img.src = imageUrl;
      };
      
      reader.onerror = () => {
        reject(new Error(tool('pngToJpg.errors.failedToRead')));
      };
      
      reader.readAsDataURL(file);
    });
  }, [options, tool, addProcessingDelay]);

  // Process file queue for bulk operations
  const processFileQueue = useCallback(async (queue: ProcessedFile[]) => {
    const pendingFiles = queue.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsProcessingBulk(true);
    
    for (const file of pendingFiles) {
      // Update status to processing
      setFileQueue(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing' as const } : f
      ));

      try {
        const convertedBlob = await convertSingleFile(file.originalFile);
        const url = URL.createObjectURL(convertedBlob);
        
        // Update with completed status
        setFileQueue(prev => prev.map(f => 
          f.id === file.id ? {
            ...f, 
            status: 'completed' as const,
            processedBlob: convertedBlob,
            processedUrl: url
          } : f
        ));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : tool('pngToJpg.errors.conversionFailed');
        
        // Update with error status
        setFileQueue(prev => prev.map(f => 
          f.id === file.id ? {
            ...f, 
            status: 'error' as const,
            error: errorMessage
          } : f
        ));
      }

      // Small delay to prevent browser freezing
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsProcessingBulk(false);
  }, [convertSingleFile, tool]);

  // Handle file upload (single or multiple)
  const handleFileUpload = useCallback(async (files: File[]) => {
    setError(null);

    // If we have existing files (processedFile or fileQueue), always use bulk mode
    const shouldUseBulkMode = files.length > 1 || fileQueue.length > 0 || processedFile !== null;

    if (!shouldUseBulkMode && files.length === 1) {
      // Single file mode (only when no existing files)
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
        const errorMessage = err instanceof Error ? err.message : tool('pngToJpg.errors.failedToConvert');
        setError(errorMessage);
      } finally {
        setIsUploading(false);
        setIsProcessing(false);
      }
    } else {
      // Bulk mode
      const validFiles = files.filter(file => 
        file.type.match(/^image\/png$/i) && file.size <= 10 * 1024 * 1024
      );

      if (validFiles.length === 0) {
        setError(tool('pngToJpg.errors.invalidFile'));
        return;
      }

      const newFiles: ProcessedFile[] = validFiles.map(file => ({
        id: `bulk-${Date.now()}-${Math.random()}`,
        originalFile: file,
        originalUrl: URL.createObjectURL(file),
        status: 'pending'
      }));

      setFileQueue(prev => {
        // If we have a processedFile, convert it to fileQueue first
        const existingFiles = prev.length > 0 ? prev : (processedFile ? [processedFile] : []);
        const updated = [...existingFiles, ...newFiles];
        
        // Only process the new pending files
        const pendingFiles = updated.filter(f => f.status === 'pending');
        if (pendingFiles.length > 0) {
          processFileQueue(updated);
        }
        
        return updated;
      });
      
      // Clear processedFile since we're now in bulk mode
      if (processedFile) {
        setProcessedFile(null);
        setOriginalFile(null);
      }
    }
  }, [tool, processFileQueue, fileQueue, processedFile, convertSingleFile]);

  // Handle clear
  const handleClear = useCallback(() => {
    // Clean up URL objects to prevent memory leaks
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

  // Handle single file download
  const handleDownload = useCallback((fileId?: string) => {
    let fileToDownload: ProcessedFile | null = null;
    
    if (fileId) {
      // Look for the file in fileQueue or use processedFile if it matches
      fileToDownload = fileQueue.find(f => f.id === fileId) || 
                       (processedFile && processedFile.id === fileId ? processedFile : null);
    } else {
      fileToDownload = processedFile;
    }
    
    if (!fileToDownload?.processedUrl) return;
    
    const link = document.createElement('a');
    link.download = `${fileToDownload.originalFile.name.replace(/\.[^/.]+$/, "")}.jpg`;
    link.href = fileToDownload.processedUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedFile, fileQueue]);

  // Handle bulk download (ZIP)
  const handleDownloadAll = useCallback(async () => {
    // Get completed files from either fileQueue or processedFile
    const completedFiles = fileQueue.length > 0 
      ? fileQueue.filter(f => f.status === 'completed' && f.processedBlob)
      : processedFile && processedFile.status === 'completed' && processedFile.processedBlob 
        ? [processedFile] 
        : [];
        
    if (completedFiles.length === 0) return;

    try {
      // Single file - download directly as JPG
      if (completedFiles.length === 1) {
        const file = completedFiles[0];
        const link = document.createElement('a');
        link.download = `${file.originalFile.name.replace(/\.[^/.]+$/, "")}.jpg`;
        link.href = file.processedUrl!;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Multiple files - create ZIP
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Add each completed file to the ZIP
      for (const file of completedFiles) {
        if (file.processedBlob) {
          const fileName = `${file.originalFile.name.replace(/\.[^/.]+$/, "")}.jpg`;
          zip.file(fileName, file.processedBlob);
        }
      }
      
      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download the ZIP
      const link = document.createElement('a');
      link.download = 'converted-images.zip';
      link.href = URL.createObjectURL(zipBlob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      setError(tool('pngToJpg.errors.failedToCreateZip'));
    }
  }, [fileQueue, processedFile, tool]);

  // Handle copy to clipboard with fallback strategies
  const handleCopy = useCallback(async (fileId?: string): Promise<boolean> => {
    let fileToCopy: ProcessedFile | null = null;
    
    if (fileId) {
      // Look for the file in fileQueue or use processedFile if it matches
      fileToCopy = fileQueue.find(f => f.id === fileId) || 
                   (processedFile && processedFile.id === fileId ? processedFile : null);
    } else {
      // Default to processedFile if no fileId provided
      fileToCopy = processedFile;
    }
    
    if (!fileToCopy?.processedBlob) return false;
    
    // Strategy 1: Try modern Clipboard API with blob
    if (navigator.clipboard && 'write' in navigator.clipboard) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ [fileToCopy.processedBlob.type]: fileToCopy.processedBlob })
        ]);
        return true;
      } catch (error) {
        console.warn('Clipboard API with blob failed:', error);
      }
    }
    
    // Strategy 2: Try copying the image as data URL to clipboard
    if (navigator.clipboard && 'writeText' in navigator.clipboard) {
      try {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileToCopy.processedBlob!);
        });
        
        await navigator.clipboard.writeText(dataUrl);
        return true;
      } catch (error) {
        console.warn('Clipboard API with text failed:', error);
      }
    }
    
    // Strategy 3: Fallback - copy canvas to clipboard (if available)
    if (canvasRef.current && fileToCopy.processedUrl) {
      try {
        const canvas = canvasRef.current;
        const img = new Image();
        
        return await new Promise<boolean>((resolve) => {
          img.onload = async () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(false);
              return;
            }
            
            ctx.drawImage(img, 0, 0);
            
            try {
              canvas.toBlob(async (blob) => {
                if (!blob) {
                  resolve(false);
                  return;
                }
                
                try {
                  await navigator.clipboard.write([
                    new ClipboardItem({ [blob.type]: blob })
                  ]);
                  resolve(true);
                } catch {
                  resolve(false);
                }
              }, 'image/jpeg');
            } catch {
              resolve(false);
            }
          };
          
          img.onerror = () => resolve(false);
          img.src = fileToCopy.processedUrl!;
        });
      } catch (error) {
        console.warn('Canvas fallback failed:', error);
      }
    }
    
    // All strategies failed
    return false;
  }, [processedFile, fileQueue]);

  // Remove file from queue
  const handleRemoveFile = useCallback((fileId: string) => {
    setFileQueue(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        // Clean up URL objects
        if (fileToRemove.originalUrl) URL.revokeObjectURL(fileToRemove.originalUrl);
        if (fileToRemove.processedUrl) URL.revokeObjectURL(fileToRemove.processedUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);


  // Calculate bulk statistics
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
        title={tool('pngToJpg.title')}
        description={tool('pngToJpg.description')}
        uploadAreaLabel={tool('pngToJpg.labels.uploadArea')}
        dragDropLabel={tool('pngToJpg.labels.dragDrop')}
        supportedFormatsLabel={tool('pngToJpg.labels.supportedFormats')}
        clearText={common('buttons.clear')}
        downloadAllText="Download All"
        downloadFileName={tool('pngToJpg.downloadFileName')}
        acceptedFormats={['image/png']}
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
        {/* PNG to JPG Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('pngToJpg.options.conversionSettings')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Quality Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('pngToJpg.options.quality')}</h3>
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
                  <h3 className="text-base font-semibold text-foreground">{tool('pngToJpg.options.compression')}</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {(['fast', 'standard', 'best'] as const).map((compression) => (
                    <Button
                      key={compression}
                      onClick={() => handleOptionChange('compression', compression)}
                      variant={options.compression === compression ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                    >
                      {tool(`pngToJpg.options.compressionLevels.${compression}`)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Background Color Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Palette className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('pngToJpg.options.backgroundColor')}</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={options.backgroundColor}
                      onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                      className="w-12 h-8 rounded border border-input cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.backgroundColor}
                      onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG format doesn&apos;t support transparency. Transparent areas will be filled with this color.
                  </p>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </BaseBulkConverter>

      {/* PNG to JPG Analytics */}
      <PNGToJPGAnalytics 
        originalFile={originalFile}
        processedFile={processedFile}
        variant="compact"
        showTitle={false}
      />

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
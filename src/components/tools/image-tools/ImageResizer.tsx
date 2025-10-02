'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseImageConverter, type ProcessedImage, type ImageDimensions } from '@/components/shared/BaseImageConverter';
import { ToolOptionsAccordion } from '@/components/shared/ToolOptionsAccordion';
import { type DataStat } from '@/components/shared/DataStats';
import { 
  Maximize2, 
  Minimize2, 
  Percent, 
  FileImage, 
  Move, 
  Settings, 
  Sliders, 
  Zap,
  Monitor,
  Smartphone,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  ChevronDown
} from 'lucide-react';

interface ResizeOptions {
  mode: 'exact' | 'aspectRatio' | 'percentage';
  width: number;
  height: number;
  percentage: number;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio: boolean;
  backgroundColor: string;
  interpolation: 'auto' | 'nearest' | 'bilinear' | 'bicubic';
}

interface PresetSize {
  name: string;
  width: number;
  height: number;
  category: 'social' | 'web';
}

const QUALITY_PRESETS = [
  { label: 'Max', value: 1.0 },
  { label: 'High', value: 0.9 },
  { label: 'Med', value: 0.7 },
  { label: 'Low', value: 0.5 }
];

const PRESET_SIZES: PresetSize[] = [
  // Social Media Presets
  { name: 'Instagram Post', width: 1080, height: 1080, category: 'social' },
  { name: 'Instagram Story', width: 1080, height: 1920, category: 'social' },
  { name: 'Facebook Post', width: 1200, height: 630, category: 'social' },
  { name: 'Twitter Post', width: 1200, height: 675, category: 'social' },
  { name: 'LinkedIn Post', width: 1200, height: 627, category: 'social' },
  // Web Presets
  { name: 'Thumbnail', width: 300, height: 300, category: 'web' },
  { name: 'Banner', width: 728, height: 90, category: 'web' },
  { name: 'Rectangle', width: 300, height: 250, category: 'web' },
  { name: 'Square', width: 250, height: 250, category: 'web' }
];

export function ImageResizer() {
  const { common, tool } = useToolTranslations('tools/image-tools');
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
  const [activeTab, setActiveTab] = useState<'dimensions' | 'settings' | 'presets'>('dimensions');
  const [showPercentagePresets, setShowPercentagePresets] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const percentageDropdownRef = useRef<HTMLDivElement>(null);

  const [options, setOptions] = useState<ResizeOptions>({
    mode: 'aspectRatio',
    width: 800,
    height: 600,
    percentage: 100,
    quality: 0.9,
    format: 'png',
    maintainAspectRatio: true,
    backgroundColor: '#ffffff',
    interpolation: 'auto'
  });

  // Handle option changes
  const handleOptionChange = useCallback(<K extends keyof ResizeOptions>(
    option: K,
    value: ResizeOptions[K]
  ) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
    
    // If changing mode to percentage and we have an original image, calculate percentage
    if (option === 'mode' && value === 'percentage' && originalImage) {
      const currentPercentage = (options.width / originalImage.width) * 100;
      setOptions(prev => ({
        ...prev,
        percentage: Math.round(currentPercentage)
      }));
    }
  }, [options.width, originalImage]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(tool('imageResizer.errors.invalidFile'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(tool('imageResizer.errors.fileTooLarge'));
      return;
    }

    setIsUploading(true);
    setError(null);
    setProcessedImage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const img = new window.Image();
      
      img.onload = () => {
        setOriginalImage(img);
        setOriginalDimensions({
          width: img.width,
          height: img.height,
          size: file.size,
          format: file.type
        });
        
        // Set initial dimensions based on original image
        setOptions(prev => ({
          ...prev,
          width: Math.min(img.width, 800),
          height: Math.min(img.height, 600)
        }));
        
        setIsUploading(false);
      };
      
      img.onerror = () => {
        setError(tool('imageResizer.errors.failedToLoad'));
        setIsUploading(false);
      };
      
      img.src = imageUrl;
    };
    
    reader.onerror = () => {
      setError(tool('imageResizer.errors.failedToRead'));
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  }, [tool]);

  // Resize image
  const resizeImage = useCallback(async () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error(tool('imageResizer.errors.canvasNotSupported'));

      let targetWidth: number;
      let targetHeight: number;

      // Calculate target dimensions based on mode
      switch (options.mode) {
        case 'exact':
          targetWidth = options.width;
          targetHeight = options.height;
          break;
        case 'percentage':
          targetWidth = Math.round((originalImage.width * options.percentage) / 100);
          targetHeight = Math.round((originalImage.height * options.percentage) / 100);
          break;
        case 'aspectRatio':
        default:
          const aspectRatio = originalImage.width / originalImage.height;
          if (options.width / aspectRatio <= options.height) {
            targetWidth = options.width;
            targetHeight = Math.round(options.width / aspectRatio);
          } else {
            targetHeight = options.height;
            targetWidth = Math.round(options.height * aspectRatio);
          }
          break;
      }

      // Validate dimensions
      if (targetWidth <= 0 || targetHeight <= 0) {
        throw new Error(tool('imageResizer.errors.invalidDimensions'));
      }

      if (targetWidth > 5000 || targetHeight > 5000) {
        throw new Error(tool('imageResizer.errors.dimensionsTooLarge'));
      }

      // Set canvas size
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Clear canvas with background color
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set image smoothing based on interpolation method
      switch (options.interpolation) {
        case 'nearest':
          ctx.imageSmoothingEnabled = false;
          break;
        case 'bilinear':
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'low';
          break;
        case 'bicubic':
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          break;
        default:
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
      }

      // Draw resized image
      ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const processedImg: ProcessedImage = {
              url,
              width: targetWidth,
              height: targetHeight,
              size: blob.size,
              format: `image/${options.format}`,
              blob
            };
            setProcessedImage(processedImg);
          }
          setIsProcessing(false);
        },
        `image/${options.format}`,
        options.quality
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : tool('imageResizer.errors.failedToResize');
      setError(errorMessage);
      setIsProcessing(false);
    }
  }, [originalImage, options, tool]);

  // Auto-resize when options change
  React.useEffect(() => {
    if (originalImage) {
      const timeoutId = setTimeout(() => {
        resizeImage();
      }, 300); // Debounce

      return () => clearTimeout(timeoutId);
    }
  }, [originalImage, resizeImage]);

  // Handle click outside to close percentage dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (percentageDropdownRef.current && !percentageDropdownRef.current.contains(event.target as Node)) {
        setShowPercentagePresets(false);
      }
    };

    if (showPercentagePresets) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPercentagePresets]);

  // Clear all
  const handleClear = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
    setOriginalDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Download image
  const handleDownload = useCallback(() => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = `${tool('imageResizer.downloadFileName')}.${options.format}`;
    link.href = processedImage.url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedImage, options.format, tool]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!processedImage) return false;
    
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [processedImage.blob.type]: processedImage.blob })
      ]);
      return true;
    } catch {
      return false;
    }
  }, [processedImage]);

  // Apply preset
  const handleApplyPreset = useCallback((preset: PresetSize) => {
    setOptions(prev => ({
      ...prev,
      mode: 'exact',
      width: preset.width,
      height: preset.height
    }));
    setActiveTab('dimensions');
  }, []);

  // Calculate statistics
  const statistics = useMemo((): DataStat[] => {
    const stats: DataStat[] = [];
    
    if (originalDimensions) {
      stats.push({
        key: 'originalSize',
        label: tool('imageResizer.stats.originalSize'),
        value: `${originalDimensions.width}×${originalDimensions.height}`,
        icon: FileImage,
        color: 'text-blue-600 dark:text-blue-400',
        suffix: 'px'
      });
    }
    
    if (processedImage) {
      stats.push(
        {
          key: 'newSize',
          label: tool('imageResizer.stats.newSize'),
          value: `${processedImage.width}×${processedImage.height}`,
          icon: Maximize2,
          color: 'text-green-600 dark:text-green-400',
          suffix: 'px'
        },
        {
          key: 'fileSize',
          label: tool('imageResizer.stats.fileSize'),
          value: (processedImage.size / 1024).toFixed(1),
          icon: Move,
          color: 'text-purple-600 dark:text-purple-400',
          suffix: 'KB'
        }
      );

      if (originalDimensions) {
        const reduction = ((originalDimensions.size - processedImage.size) / originalDimensions.size) * 100;
        stats.push({
          key: 'reduction',
          label: tool('imageResizer.stats.reduction'),
          value: reduction.toFixed(1),
          icon: Minimize2,
          color: 'text-orange-600 dark:text-orange-400',
          suffix: '%'
        });
      }
    }
    
    return stats;
  }, [originalDimensions, processedImage, tool]);

  return (
    <div className="space-y-6">
      <BaseImageConverter
        title={tool('imageResizer.title')}
        description={tool('imageResizer.description')}
        uploadLabel={tool('imageResizer.labels.originalImage')}
        processedLabel={tool('imageResizer.labels.resizedResult')}
        uploadAreaLabel={tool('imageResizer.labels.uploadArea')}
        dragDropLabel={tool('imageResizer.labels.dragDrop')}
        supportedFormatsLabel={tool('imageResizer.labels.supportedFormats')}
        copyText={common('buttons.copy')}
        clearText={common('buttons.clear')}
        downloadText={common('buttons.download')}
        uploadText={common('buttons.upload')}
        replaceText={tool('imageResizer.labels.replace')}
        downloadFileName={tool('imageResizer.downloadFileName')}
        originalImage={originalImage}
        processedImage={processedImage}
        isUploading={isUploading}
        isProcessing={isProcessing}
        error={error}
        stats={statistics}
        onFileUpload={handleFileUpload}
        onClear={handleClear}
        onDownload={handleDownload}
        onCopy={handleCopy}
      >
        {/* Resize Options */}
        <ToolOptionsAccordion
          title={tool('imageResizer.options.resizeSettings')}
          defaultOpen={false}
        >
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex bg-muted rounded-md p-1">
              <button
                onClick={() => setActiveTab('dimensions')}
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm transition-colors flex-1 justify-center ${
                  activeTab === 'dimensions' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sliders className="h-4 w-4" />
                {tool('imageResizer.tabs.dimensions')}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm transition-colors flex-1 justify-center ${
                  activeTab === 'settings' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings className="h-4 w-4" />
                {tool('imageResizer.tabs.settings')}
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm transition-colors flex-1 justify-center ${
                  activeTab === 'presets' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Zap className="h-4 w-4" />
                {tool('imageResizer.tabs.presets')}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'dimensions' && (
              <div className="space-y-4">
                {/* Resize Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{tool('imageResizer.options.resizeMode')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['aspectRatio', 'exact', 'percentage'] as const).map((mode) => (
                      <Button
                        key={mode}
                        variant={options.mode === mode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleOptionChange('mode', mode)}
                        className="text-xs"
                      >
                        {tool(`imageResizer.options.resizeModes.${mode}`)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Dimensions Input */}
                {options.mode !== 'percentage' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{tool('imageResizer.options.width')}</label>
                      <input
                        type="number"
                        value={options.width}
                        onChange={(e) => handleOptionChange('width', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                        min="1"
                        max="5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{tool('imageResizer.options.height')}</label>
                      <input
                        type="number"
                        value={options.height}
                        onChange={(e) => handleOptionChange('height', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                        min="1"
                        max="5000"
                      />
                    </div>
                  </div>
                )}

                {/* Percentage Input */}
                {options.mode === 'percentage' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tool('imageResizer.options.percentage')}</label>
                    <div className="relative" ref={percentageDropdownRef}>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={options.percentage || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              handleOptionChange('percentage', 100);
                            } else {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue) && numValue > 0 && numValue <= 500) {
                                handleOptionChange('percentage', numValue);
                              }
                            }
                          }}
                          className="flex-1 px-3 py-2 pr-16 border border-input bg-background rounded-md text-sm"
                          min="1"
                          max="500"
                        />
                        <div className="absolute right-1 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowPercentagePresets(!showPercentagePresets);
                            }}
                            className="h-8 w-8 p-0 hover:bg-accent rounded flex items-center justify-center"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${showPercentagePresets ? 'rotate-180' : ''}`} />
                          </button>
                          <Percent className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      
                      {/* Dropdown Menu */}
                      {showPercentagePresets && (
                        <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-background border border-input rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {[10, 25, 50, 75, 100, 150, 200, 300].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOptionChange('percentage', preset);
                                setShowPercentagePresets(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground border-b last:border-b-0"
                            >
                              {preset}%
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                {/* Output Format */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{tool('imageResizer.options.outputFormat')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['png', 'jpeg', 'webp'] as const).map((format) => (
                      <Button
                        key={format}
                        variant={options.format === format ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleOptionChange('format', format)}
                        className="text-xs uppercase"
                      >
                        {format}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{tool('imageResizer.options.quality')}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {QUALITY_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={options.quality === preset.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleOptionChange('quality', preset.value)}
                        className="text-xs"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Interpolation Method */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{tool('imageResizer.options.interpolation')}</label>
                  <select
                    value={options.interpolation}
                    onChange={(e) => handleOptionChange('interpolation', e.target.value as 'auto' | 'nearest' | 'bilinear' | 'bicubic')}
                    className="w-full p-2 border rounded-md bg-background text-foreground text-sm"
                  >
                    <option value="auto">{tool('imageResizer.options.interpolationMethods.auto')}</option>
                    <option value="nearest">{tool('imageResizer.options.interpolationMethods.nearest')}</option>
                    <option value="bilinear">{tool('imageResizer.options.interpolationMethods.bilinear')}</option>
                    <option value="bicubic">{tool('imageResizer.options.interpolationMethods.bicubic')}</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="space-y-6">
                {/* Social Media Presets */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <label className="text-sm font-medium">Social Media</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                    {PRESET_SIZES.filter(p => p.category === 'social').map((preset) => {
                      const getIcon = (name: string) => {
                        if (name.includes('Instagram')) {
                          if (name.includes('Story')) return <RectangleVertical className="h-4 w-4" />;
                          return <Instagram className="h-4 w-4" />;
                        }
                        if (name.includes('Facebook')) return <Facebook className="h-4 w-4" />;
                        if (name.includes('Twitter')) return <Twitter className="h-4 w-4" />;
                        if (name.includes('LinkedIn')) return <Linkedin className="h-4 w-4" />;
                        return <Square className="h-4 w-4" />;
                      };
                      
                      return (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyPreset(preset)}
                          className="justify-between text-xs p-3 h-auto"
                        >
                          <div className="flex items-center gap-2">
                            {getIcon(preset.name)}
                            <span className="text-left">{preset.name}</span>
                          </div>
                          <span className="text-muted-foreground font-mono">{preset.width}×{preset.height}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Web Presets */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <label className="text-sm font-medium">Web Sizes</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                    {PRESET_SIZES.filter(p => p.category === 'web').map((preset) => {
                      const getIcon = (name: string) => {
                        if (name.includes('Thumbnail')) return <Square className="h-4 w-4" />;
                        if (name.includes('Banner') || name.includes('Rectangle')) return <RectangleHorizontal className="h-4 w-4" />;
                        if (name.includes('Square')) return <Square className="h-4 w-4" />;
                        return <Monitor className="h-4 w-4" />;
                      };
                      
                      return (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyPreset(preset)}
                          className="justify-between text-xs p-3 h-auto"
                        >
                          <div className="flex items-center gap-2">
                            {getIcon(preset.name)}
                            <span className="text-left">{preset.name}</span>
                          </div>
                          <span className="text-muted-foreground font-mono">{preset.width}×{preset.height}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ToolOptionsAccordion>
      </BaseImageConverter>

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
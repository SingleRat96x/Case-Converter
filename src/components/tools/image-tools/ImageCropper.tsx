'use client';

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { BaseImageConverter, type ProcessedImage, type ImageDimensions } from '@/components/shared/BaseImageConverter';
import { ImageCropperAnalytics } from '@/components/shared/ImageCropperAnalytics';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { 
  RotateCw, 
  RotateCcw, 
  Settings, 
  Palette,
  RectangleHorizontal,
  Image as ImageIcon
} from 'lucide-react';
import ReactCrop, { Crop as CropType, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropOptions {
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
  keepOriginalSize: boolean;
  outputWidth: number;
  outputHeight: number;
  backgroundColor: string;
}

const QUALITY_PRESETS = [
  { label: 'Max', value: 1.0 },
  { label: 'High', value: 0.9 },
  { label: 'Med', value: 0.7 },
  { label: 'Low', value: 0.5 }
];

const ASPECT_RATIOS = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16/9 },
  { label: '4:3', value: 4/3 },
  { label: '3:2', value: 3/2 },
  { label: '5:4', value: 5/4 },
  { label: '2:3', value: 2/3 },
];

export function ImageCropper() {
  const { common, tool } = useToolTranslations('tools/image-tools');
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | undefined>(undefined);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [options, setOptions] = useState<CropOptions>({
    quality: 0.9,
    format: 'png',
    keepOriginalSize: true,
    outputWidth: 800,
    outputHeight: 600,
    backgroundColor: '#ffffff',
  });

  // Handle option changes
  const handleOptionChange = useCallback(<K extends keyof CropOptions>(
    option: K,
    value: CropOptions[K]
  ) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(tool('imageCropper.errors.invalidFile'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(tool('imageCropper.errors.fileTooLarge'));
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
        
        // Set initial crop
        const initialCrop = centerCrop(
          { unit: '%', width: 50, height: 50, x: 25, y: 25 },
          img.width,
          img.height
        );
        setCrop(initialCrop);
        setRotation(0);
        setIsUploading(false);
      };
      
      img.onerror = () => {
        setError(tool('imageCropper.errors.failedToLoad'));
        setIsUploading(false);
      };
      
      img.src = imageUrl;
    };
    
    reader.onerror = () => {
      setError(tool('imageCropper.errors.failedToRead'));
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  }, [tool]);

  // Create cropped image
  const createCroppedImage = useCallback(async () => {
    if (!originalImage || !crop || !imageRef.current || !canvasRef.current) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error(tool('imageCropper.errors.canvasNotSupported'));

      const image = imageRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Calculate actual crop dimensions
      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;

      // Set canvas size
      if (options.keepOriginalSize) {
        canvas.width = cropWidth;
        canvas.height = cropHeight;
      } else {
        canvas.width = options.outputWidth;
        canvas.height = options.outputHeight;
      }

      // Clear canvas with background color
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply rotation if needed
      if (rotation !== 0) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Draw the cropped image
      ctx.drawImage(
        originalImage,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (rotation !== 0) {
        ctx.restore();
      }

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const croppedImg: ProcessedImage = {
              url,
              width: canvas.width,
              height: canvas.height,
              size: blob.size,
              format: `image/${options.format}`,
              blob
            };
            setProcessedImage(croppedImg);
          }
          setIsProcessing(false);
        },
        `image/${options.format}`,
        options.quality
      );
    } catch {
      setError(tool('imageCropper.errors.failedToCrop'));
      setIsProcessing(false);
    }
  }, [originalImage, crop, rotation, options, tool]);

  // Auto-crop when crop area or options change
  React.useEffect(() => {
    if (originalImage && crop) {
      const timeoutId = setTimeout(() => {
        createCroppedImage();
      }, 500); // Debounce to avoid excessive processing

      return () => clearTimeout(timeoutId);
    }
  }, [originalImage, crop, createCroppedImage, rotation]);

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

  // Handle rotation
  const handleRotate = useCallback((direction: 'cw' | 'ccw') => {
    setRotation(prev => {
      const newRotation = direction === 'cw' ? prev + 90 : prev - 90;
      return ((newRotation % 360) + 360) % 360;
    });
  }, []);

  // Handle aspect ratio change
  const handleAspectRatioChange = useCallback((aspectRatio: number | undefined) => {
    setSelectedAspectRatio(aspectRatio);
    if (originalImage && crop) {
      const newCrop = {
        ...crop,
        aspect: aspectRatio
      };
      setCrop(newCrop);
    }
  }, [originalImage, crop]);

  // Handle clear
  const handleClear = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setCrop(undefined);
    setRotation(0);
    setError(null);
    setOriginalDimensions(null);
    setZoomLevel(1);
  }, []);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = `${tool('imageCropper.downloadFileName')}.${options.format}`;
    link.href = processedImage.url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedImage, options.format, tool]);

  // Handle copy to clipboard
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


  return (
    <div className="space-y-6">
      <BaseImageConverter
        title={tool('imageCropper.title')}
        description={tool('imageCropper.description')}
        uploadLabel={tool('imageCropper.labels.originalImage')}
        processedLabel={tool('imageCropper.labels.croppedResult')}
        uploadAreaLabel={tool('imageCropper.labels.uploadArea')}
        dragDropLabel={tool('imageCropper.labels.dragDrop')}
        supportedFormatsLabel={tool('imageCropper.labels.supportedFormats')}
        copyText={common('buttons.copy')}
        clearText={common('buttons.clear')}
        downloadText={common('buttons.download')}
        uploadText={common('buttons.upload')}
        replaceText={tool('imageCropper.labels.replace')}
        downloadFileName={tool('imageCropper.downloadFileName')}
        acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
        originalImage={originalImage}
        processedImage={processedImage}
        isUploading={isUploading}
        isProcessing={isProcessing}
        error={error}
        onFileUpload={handleFileUpload}
        onClear={handleClear}
        onDownload={handleDownload}
        onCopy={handleCopy}
      >
        {/* Custom Cropping Interface */}
        {originalImage && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{tool('imageCropper.labels.originalImage')}</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRotate('ccw')}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  title="Rotate left"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleRotate('cw')}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  title="Rotate right"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={selectedAspectRatio}
                className="max-w-full"
                ruleOfThirds={true}
                minWidth={20}
                minHeight={20}
                keepSelection={true}
              >
                <Image
                  ref={imageRef}
                  src={originalImage.src}
                  alt="Original image for cropping"
                  width={originalImage.width}
                  height={originalImage.height}
                  className="max-w-full h-auto"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    maxHeight: '500px'
                  }}
                  unoptimized={true}
                  priority={true}
                />
              </ReactCrop>
            </div>
          </Card>
        )}

        {/* Crop Result Preview */}
        {processedImage && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{tool('imageCropper.labels.croppedResult')}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(prev => Math.max(0.1, prev - 0.1))}
                >
                  -
                </Button>
                <span className="min-w-16 text-center text-sm">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.1))}
                >
                  +
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(1)}
                >
                  Reset
                </Button>
              </div>
            </div>
            
            <div className="relative w-full h-96 border rounded-lg overflow-hidden bg-muted/10">
              <div className="absolute inset-0 overflow-auto">
                <div 
                  className="flex items-center justify-center min-h-full" 
                  style={{ 
                    width: `${zoomLevel * 100}%`,
                    height: `${zoomLevel * 100}%`,
                    minWidth: '100%',
                    minHeight: '100%'
                  }}
                >
                  <Image
                    src={processedImage.url}
                    alt="Cropped result"
                    width={processedImage.width}
                    height={processedImage.height}
                    className="max-w-none h-auto"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'center'
                    }}
                    unoptimized={true}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Image Cropper Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('imageCropper.accordion.title')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Crop Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <RectangleHorizontal className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('imageCropper.sections.cropSettings')}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Aspect Ratio Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      {tool('imageCropper.options.aspectRatio')}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {ASPECT_RATIOS.map((ratio) => (
                        <Button
                          key={ratio.label}
                          variant={selectedAspectRatio === ratio.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAspectRatioChange(ratio.value)}
                          className="text-xs hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
                        >
                          <RectangleHorizontal className="h-3 w-3 mr-1" />
                          {ratio.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Settings className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('imageCropper.sections.outputSettings')}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Output Format */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      {tool('imageCropper.options.outputFormat')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['png', 'jpeg', 'webp'] as const).map((format) => (
                        <Button
                          key={format}
                          variant={options.format === format ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleOptionChange('format', format)}
                          className="text-xs uppercase hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
                        >
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {format}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Quality */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      {tool('imageCropper.options.quality')}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {QUALITY_PRESETS.map((preset) => (
                        <Button
                          key={preset.label}
                          variant={options.quality === preset.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleOptionChange('quality', preset.value)}
                          className="text-xs hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Output Size Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow">
                    <label className="text-sm font-medium cursor-pointer flex-1">
                      {tool('imageCropper.options.keepOriginalSize')}
                    </label>
                    <Switch
                      checked={options.keepOriginalSize}
                      onCheckedChange={(checked) => handleOptionChange('keepOriginalSize', checked)}
                    />
                  </div>

                  {/* Custom Output Dimensions */}
                  {!options.keepOriginalSize && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {tool('imageCropper.options.width')}
                        </label>
                        <select
                          value={options.outputWidth}
                          onChange={(e) => handleOptionChange('outputWidth', Number(e.target.value))}
                          className="w-full p-2 border rounded-md bg-background text-foreground text-sm hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
                        >
                          {[400, 600, 800, 1200, 1600, 1920].map(width => (
                            <option key={width} value={width}>{width}px</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {tool('imageCropper.options.height')}
                        </label>
                        <select
                          value={options.outputHeight}
                          onChange={(e) => handleOptionChange('outputHeight', Number(e.target.value))}
                          className="w-full p-2 border rounded-md bg-background text-foreground text-sm hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
                        >
                          {[300, 400, 600, 800, 1200, 1080].map(height => (
                            <option key={height} value={height}>{height}px</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Appearance Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Palette className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('imageCropper.sections.appearance')}</h3>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    {tool('imageCropper.options.backgroundColor')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={options.backgroundColor}
                      onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                      className="w-12 h-8 rounded border border-input cursor-pointer hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
                    />
                    <input
                      type="text"
                      value={options.backgroundColor}
                      onChange={(e) => handleOptionChange('backgroundColor', e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>

        {/* Image Cropper Analytics */}
        <ImageCropperAnalytics 
          originalWidth={originalDimensions?.width}
          originalHeight={originalDimensions?.height}
          originalSize={originalDimensions?.size}
          croppedWidth={processedImage?.width}
          croppedHeight={processedImage?.height}
          croppedSize={processedImage?.size}
          variant="compact"
          showTitle={false}
        />
      </BaseImageConverter>

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
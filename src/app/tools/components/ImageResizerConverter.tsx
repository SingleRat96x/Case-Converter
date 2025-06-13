'use client';

import { useState, useRef } from 'react';
import { Copy, Download, RefreshCw, Upload, Image, Settings, Maximize2 } from 'lucide-react';

interface ImageDimensions {
  width: number;
  height: number;
}

export default function ImageResizerConverter() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [targetDimensions, setTargetDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [quality, setQuality] = useState(90);
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const presetSizes = [
    { name: 'Instagram Square', width: 1080, height: 1080 },
    { name: 'Instagram Portrait', width: 1080, height: 1350 },
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'Twitter Header', width: 1500, height: 500 },
    { name: 'LinkedIn Post', width: 1200, height: 627 },
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
    { name: 'Profile Picture', width: 400, height: 400 },
    { name: 'Banner', width: 1920, height: 1080 }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setTargetDimensions({ width: img.width, height: img.height });
        setSelectedImage(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    if (maintainAspectRatio && originalDimensions.width > 0 && originalDimensions.height > 0) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      
      if (dimension === 'width') {
        setTargetDimensions({
          width: value,
          height: Math.round(value / aspectRatio)
        });
      } else {
        setTargetDimensions({
          width: Math.round(value * aspectRatio),
          height: value
        });
      }
    } else {
      setTargetDimensions(prev => ({
        ...prev,
        [dimension]: value
      }));
    }
  };

  const applyPresetSize = (preset: { width: number; height: number }) => {
    setTargetDimensions(preset);
  };

  const processImage = async () => {
    if (!selectedImage || !canvasRef.current) return;

    setIsProcessing(true);
    
    try {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = targetDimensions.width;
        canvas.height = targetDimensions.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, targetDimensions.width, targetDimensions.height);
        
        // Convert to desired format
        const outputMimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
        const processedDataUrl = canvas.toDataURL(outputMimeType, quality / 100);
        
        setProcessedImage(processedDataUrl);
        setIsProcessing(false);
      };
      
      img.src = selectedImage;
    } catch (error) {
      console.error('Image processing failed:', error);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = `resized-${fileName.replace(/\.[^/.]+$/, '')}.${outputFormat}`;
    link.href = processedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setProcessedImage(null);
    setFileName('');
    setOriginalDimensions({ width: 0, height: 0 });
    setTargetDimensions({ width: 0, height: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileSizeEstimate = () => {
    if (!targetDimensions.width || !targetDimensions.height) return '';
    
    // Rough estimate based on dimensions and quality
    const pixels = targetDimensions.width * targetDimensions.height;
    const bytesPerPixel = outputFormat === 'png' ? 4 : (quality / 100) * 3;
    const estimatedBytes = pixels * bytesPerPixel;
    
    if (estimatedBytes < 1024) return `~${estimatedBytes.toFixed(0)} B`;
    if (estimatedBytes < 1024 * 1024) return `~${(estimatedBytes / 1024).toFixed(1)} KB`;
    return `~${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Upload Area */}
      {!selectedImage && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Image className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <label className="cursor-pointer">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-50">
                  Upload an image to resize
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Supported formats: JPG, PNG, GIF, WEBP • Max size: 10MB
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Choose Image
            </button>
          </div>
        </div>
      )}

      {/* Image Preview and Controls */}
      {selectedImage && (
        <div className="space-y-4">
          {/* Original Image */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Original Image
              </label>
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <img 
                  src={selectedImage} 
                  alt="Original"
                  className="max-w-full h-auto rounded max-h-64 object-contain mx-auto"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {originalDimensions.width} × {originalDimensions.height} px
                </div>
              </div>
            </div>

            {/* Processed Image */}
            {processedImage && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  Resized Image
                </label>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <img 
                    src={processedImage} 
                    alt="Resized"
                    className="max-w-full h-auto rounded max-h-64 object-contain mx-auto"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    {targetDimensions.width} × {targetDimensions.height} px • {getFileSizeEstimate()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Resize Settings</h3>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Width (px)</label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={targetDimensions.width}
                  onChange={(e) => handleDimensionChange('width', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Height (px)</label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={targetDimensions.height}
                  onChange={(e) => handleDimensionChange('height', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>
            </div>

            {/* Aspect Ratio */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={maintainAspectRatio}
                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Maintain aspect ratio
            </label>

            {/* Preset Sizes */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {presetSizes.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPresetSize(preset)}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md text-xs transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Format and Quality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Output Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Quality ({quality}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                  disabled={outputFormat === 'png'}
                />
              </div>
            </div>
          </div>

          {/* Process Button */}
          <div className="flex justify-center">
            <button
              onClick={processImage}
              disabled={isProcessing || !targetDimensions.width || !targetDimensions.height}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  Resize Image
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {processedImage && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Resized
              </button>
            )}
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">Features</h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>• Resize images to custom dimensions or social media presets</div>
          <div>• Maintain aspect ratio or stretch to exact dimensions</div>
          <div>• Convert between JPEG and PNG formats</div>
          <div>• Adjust quality for file size optimization</div>
          <div>• Process images up to 10MB in size</div>
        </div>
      </div>
    </div>
  );
} 
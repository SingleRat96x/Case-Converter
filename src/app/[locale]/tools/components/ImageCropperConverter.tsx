'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Download,
  RefreshCw,
  Upload,
  FileImage,
  Scissors,
  Square,
} from 'lucide-react';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageCropperConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [croppedUrl, setCroppedUrl] = useState<string>('');
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setCroppedUrl('');

    // Reset crop area when new image is loaded
    setCropArea({ x: 50, y: 50, width: 200, height: 200 });
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight, width, height } = imageRef.current;
      setImageSize({ width, height });

      // Set initial crop area to center of image
      const initialSize = Math.min(width, height) * 0.5;
      setCropArea({
        x: (width - initialSize) / 2,
        y: (height - initialSize) / 2,
        width: initialSize,
        height: initialSize,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault();
    const rect = cropperRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    if (action === 'drag') {
      setIsDragging(true);
    } else {
      setIsResizing(true);
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!cropperRef.current || !imageRef.current) return;

      const rect = cropperRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      setCropArea(prev => {
        let newArea = { ...prev };

        if (isDragging) {
          const deltaX = currentX - dragStart.x;
          const deltaY = currentY - dragStart.y;

          newArea.x = Math.max(
            0,
            Math.min(imageSize.width - prev.width, prev.x + deltaX)
          );
          newArea.y = Math.max(
            0,
            Math.min(imageSize.height - prev.height, prev.y + deltaY)
          );

          setDragStart({ x: currentX, y: currentY });
        } else if (isResizing) {
          const newWidth = Math.max(50, currentX - prev.x);
          const newHeight = aspectRatio
            ? newWidth / aspectRatio
            : Math.max(50, currentY - prev.y);

          newArea.width = Math.min(imageSize.width - prev.x, newWidth);
          newArea.height = Math.min(imageSize.height - prev.y, newHeight);

          if (aspectRatio) {
            newArea.height = newArea.width / aspectRatio;
          }
        }

        return newArea;
      });
    },
    [isDragging, isResizing, dragStart, imageSize, aspectRatio]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Add event listeners
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const cropImage = async () => {
    if (!selectedFile || !imageRef.current) return;

    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      const { naturalWidth, naturalHeight, width, height } = imageRef.current;
      const scaleX = naturalWidth / width;
      const scaleY = naturalHeight / height;

      canvas.width = cropArea.width * scaleX;
      canvas.height = cropArea.height * scaleY;

      ctx.drawImage(
        imageRef.current,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCroppedUrl(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Error cropping image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!croppedUrl || !selectedFile) return;

    const link = document.createElement('a');
    link.href = croppedUrl;
    link.download = `cropped-${selectedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setCroppedUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const setAspectRatioPreset = (ratio: number | null) => {
    setAspectRatio(ratio);
    if (ratio) {
      setCropArea(prev => ({
        ...prev,
        height: prev.width / ratio,
      }));
    }
  };

  const getFileInfo = () => {
    if (!selectedFile) return null;

    const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    return {
      name: selectedFile.name,
      size: sizeInMB,
      type: selectedFile.type.split('/')[1].toUpperCase(),
    };
  };

  const fileInfo = getFileInfo();

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      {!selectedFile && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Scissors className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <label className="cursor-pointer">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-50">
                  Upload an image to crop
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
                All image formats supported • Max size: 10MB
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

      {/* Image Cropping Interface */}
      {selectedFile && (
        <div className="space-y-4">
          {/* Aspect Ratio Controls */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">
              Crop Settings
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <button
                onClick={() => setAspectRatioPreset(null)}
                className={`px-3 py-2 text-xs rounded ${!aspectRatio ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Free
              </button>
              <button
                onClick={() => setAspectRatioPreset(1)}
                className={`px-3 py-2 text-xs rounded ${aspectRatio === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Square
              </button>
              <button
                onClick={() => setAspectRatioPreset(16 / 9)}
                className={`px-3 py-2 text-xs rounded ${aspectRatio === 16 / 9 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                16:9
              </button>
              <button
                onClick={() => setAspectRatioPreset(4 / 3)}
                className={`px-3 py-2 text-xs rounded ${aspectRatio === 4 / 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                4:3
              </button>
            </div>
            {fileInfo && (
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>Name: {fileInfo.name}</div>
                <div>Size: {fileInfo.size} MB</div>
                <div>Type: {fileInfo.type}</div>
              </div>
            )}
          </div>

          {/* Image Cropper */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Original Image
              </label>
              <div
                ref={cropperRef}
                className="relative border rounded-lg bg-gray-50 dark:bg-gray-900 overflow-hidden"
              >
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Original"
                  className="max-w-full h-auto"
                  onLoad={handleImageLoad}
                />

                {/* Crop Overlay */}
                {imageSize.width > 0 && (
                  <>
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none" />

                    {/* Crop area */}
                    <div
                      className="absolute border-2 border-white bg-transparent cursor-move"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                      }}
                      onMouseDown={e => handleMouseDown(e, 'drag')}
                    >
                      {/* Resize handle */}
                      <div
                        className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-gray-300 cursor-se-resize"
                        onMouseDown={e => {
                          e.stopPropagation();
                          handleMouseDown(e, 'resize');
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Drag to move • Drag corner to resize
              </div>
            </div>

            {/* Crop Preview */}
            {croppedUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  Cropped Image
                </label>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <img
                    src={croppedUrl}
                    alt="Cropped"
                    className="max-w-full h-auto rounded mx-auto"
                  />
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                    ✓ Image cropped successfully
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Crop Button */}
          {!croppedUrl && (
            <div className="flex justify-center">
              <button
                onClick={cropImage}
                disabled={isProcessing}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Scissors className="h-4 w-4" />
                    Crop Image
                  </>
                )}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {croppedUrl && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
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

      {/* Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          Image Cropper Features
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>• Drag the crop area to reposition it on the image</div>
          <div>• Drag the corner handle to resize the crop area</div>
          <div>• Use aspect ratio presets for consistent proportions</div>
          <div>• Supports all common image formats (JPG, PNG, WEBP, etc.)</div>
          <div>• Output is saved as PNG to preserve quality</div>
        </div>
      </div>
    </div>
  );
}

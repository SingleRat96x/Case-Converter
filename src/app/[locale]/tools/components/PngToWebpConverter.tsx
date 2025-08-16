'use client';

import { useState, useRef } from 'react';
import { Download, RefreshCw, Upload, FileImage } from 'lucide-react';

export default function PngToWebpConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string>('');
  const [quality, setQuality] = useState(90);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png')) {
      alert('Please select a PNG image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setConvertedUrl('');
  };

  const convertToWebp = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      const img = new window.Image();
      img.src = URL.createObjectURL(selectedFile);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            blob => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                setConvertedUrl(url);
                resolve();
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            'image/webp',
            quality / 100
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      });
    } catch (error) {
      console.error('Error converting image:', error);
      alert('Error converting image. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl || !selectedFile) return;

    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = selectedFile.name.replace(/\.png$/i, '.webp');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setConvertedUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileInfo = () => {
    if (!selectedFile) return null;

    const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    return {
      name: selectedFile.name,
      size: sizeInMB,
      type: 'PNG',
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
              <FileImage className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <label className="cursor-pointer">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-50">
                  Upload a PNG image to convert to WEBP
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                PNG files only • Max size: 10MB
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Choose PNG File
            </button>
          </div>
        </div>
      )}

      {/* Image Preview and Conversion */}
      {selectedFile && (
        <div className="space-y-4">
          {/* Quality Settings */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">
              Conversion Settings
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  WEBP Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={e => setQuality(parseInt(e.target.value))}
                  className="w-full mt-1"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher quality = larger file size, but still smaller than PNG
                </div>
              </div>
              {fileInfo && (
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Name: {fileInfo.name}</div>
                  <div>Size: {fileInfo.size} MB</div>
                  <div>Type: {fileInfo.type}</div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Original PNG Image
              </label>
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <img
                  src={previewUrl}
                  alt="Original PNG"
                  className="max-w-full h-auto rounded max-h-80 object-contain mx-auto"
                />
              </div>
            </div>

            {/* Converted Preview */}
            {convertedUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  Converted WEBP Image
                </label>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <img
                    src={convertedUrl}
                    alt="Converted WEBP"
                    className="max-w-full h-auto rounded max-h-80 object-contain mx-auto"
                  />
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                    ✓ Converted to WEBP successfully (Quality: {quality}%)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Convert Button */}
          {!convertedUrl && (
            <div className="flex justify-center">
              <button
                onClick={convertToWebp}
                disabled={isConverting}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                {isConverting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Converting...
                  </>
                ) : (
                  <>
                    <FileImage className="h-4 w-4" />
                    Convert to WEBP
                  </>
                )}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {convertedUrl && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download WEBP
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

      {/* Format Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          About PNG to WEBP Conversion
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>• WEBP provides superior compression compared to PNG</div>
          <div>• Maintains transparency support like PNG</div>
          <div>• File sizes typically 25-50% smaller than PNG</div>
          <div>
            • Supported by all modern browsers (Chrome, Firefox, Safari, Edge)
          </div>
          <div>• Perfect for web use to improve loading speeds</div>
        </div>
      </div>
    </div>
  );
}

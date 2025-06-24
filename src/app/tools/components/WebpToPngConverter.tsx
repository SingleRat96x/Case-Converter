'use client';

import { useState, useRef } from 'react';
import { FileImage, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ToolLayout,
  ImageProcessingLayout,
  TwoColumnLayout,
} from '@/lib/shared/ToolLayout';
import { FileUpload } from '@/app/components/shared/ToolInputs';
import { ImageProcessorActions } from '@/app/components/shared/ToolActions';
import AdSpace from '../components/AdSpace';

export default function WebpToPngConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.includes('webp')) {
      alert('Please select a WEBP image file.');
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

  const convertToPng = async () => {
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

          canvas.toBlob(blob => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setConvertedUrl(url);
              resolve();
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');
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
    link.download = selectedFile.name.replace(/\.webp$/i, '.png');
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
      type: 'WEBP',
    };
  };

  const fileInfo = getFileInfo();

  return (
    <ToolLayout>
      <ImageProcessingLayout>
        {/* Universal File Upload Component */}
        <FileUpload
          title="Upload WEBP Image"
          onFileSelect={handleFileUpload}
          acceptedTypes=".webp,image/webp"
          maxSize={10}
          preview={previewUrl}
          previewAlt="WEBP Preview"
          variant="professional"
          icon={<FileImage className="h-12 w-12 text-muted-foreground" />}
        />

        {/* File Information Card */}
        {selectedFile && fileInfo && (
          <Card className="tool-card-vibrant">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                File Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Filename</div>
                  <div className="font-medium break-all">{fileInfo.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">File Size</div>
                  <Badge variant="secondary">{fileInfo.size} MB</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Format</div>
                  <Badge variant="outline">{fileInfo.type}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ad Space */}
        <AdSpace position="middle" />

        {/* Image Preview Grid */}
        {selectedFile && (
          <TwoColumnLayout>
            <Card className="tool-card-vibrant">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground">
                  Original WEBP Image
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <img
                    src={previewUrl}
                    alt="Original WEBP"
                    className="max-w-full h-auto rounded max-h-80 object-contain mx-auto"
                  />
                </div>
              </CardContent>
            </Card>

            {convertedUrl && (
              <Card className="tool-card-vibrant">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Converted PNG Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <img
                      src={convertedUrl}
                      alt="Converted PNG"
                      className="max-w-full h-auto rounded max-h-80 object-contain mx-auto"
                    />
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 text-center flex items-center justify-center gap-1">
                      ✓ Successfully converted to PNG format
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TwoColumnLayout>
        )}

        {/* Format Information */}
        <Card className="tool-card-vibrant bg-primary/5 border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              About WEBP to PNG Conversion
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  WEBP is a modern image format with superior compression
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  PNG provides lossless compression and transparency support
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Converting to PNG ensures wider browser compatibility
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  PNG files are larger but maintain perfect image quality
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  Ideal for images that need transparency or highest quality
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Universal Image Processor Actions */}
        <ImageProcessorActions
          onDownload={handleDownload}
          onClear={handleClear}
          onProcess={convertToPng}
          hasImage={!!selectedFile}
          hasResult={!!convertedUrl}
          processing={isConverting}
          className="mt-8"
        />
      </ImageProcessingLayout>
    </ToolLayout>
  );
}

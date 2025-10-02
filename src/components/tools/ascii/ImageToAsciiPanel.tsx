'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, AlertCircle, Settings, ChevronDown } from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { imageToAscii, processImageFile } from '@/lib/asciiTransforms';
import { IMAGE_ASCII_PRESETS, DEFAULT_IMAGE_ASCII_OPTIONS, validateImageFile } from '@/lib/asciiUtils';
import { InteractiveSlider } from '@/components/shared/InteractiveSlider';
import type { ImageToAsciiOptions } from '@/lib/asciiTransforms';
import Image from 'next/image';

interface ImageToAsciiPanelProps {
  onAsciiGenerated: (ascii: string, stats: {
    lines: number;
    characters: number;
    originalFile?: string;
    width?: number;
    height?: number;
  } | null) => void;
}

export function ImageToAsciiPanel({ onAsciiGenerated }: ImageToAsciiPanelProps) {
  const { tool } = useToolTranslations('tools/miscellaneous');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ImageToAsciiOptions>(DEFAULT_IMAGE_ASCII_OPTIONS);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const imageData = await processImageFile(file);
      const ascii = imageToAscii(imageData, options);
      
      const stats = {
        originalWidth: imageData.width,
        originalHeight: imageData.height,
        asciiWidth: options.width,
        asciiHeight: options.height || Math.floor(imageData.height * (options.width / imageData.width) * 0.5),
        charset: options.charset,
        lines: ascii.split('\n').length,
        characters: ascii.length,
        fileSize: file.size,
        fileName: file.name
      };

      onAsciiGenerated(ascii, stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : tool('asciiArtGenerator.errors.processingFailed');
      setError(errorMessage);
      onAsciiGenerated('', null);
    } finally {
      setIsProcessing(false);
    }
  }, [options, onAsciiGenerated, tool]);

  const handleFileSelect = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setError(null);

    try {
      const url = URL.createObjectURL(file);
      setOriginalFile(file);
      setOriginalUrl(url);
      
      await processImage(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('asciiArtGenerator.errors.processingFailed'));
    }
  }, [tool, processImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleOptionChange = <K extends keyof ImageToAsciiOptions>(
    key: K,
    value: ImageToAsciiOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
    
    if (originalFile) {
      processImage(originalFile);
    }
  };

  const handlePresetChange = (presetName: string) => {
    const preset = IMAGE_ASCII_PRESETS[presetName as keyof typeof IMAGE_ASCII_PRESETS];
    if (preset) {
      setOptions(prev => ({
        ...prev,
        charset: preset.charset,
        width: preset.width,
        contrast: preset.contrast,
        brightness: preset.brightness
      }));
      
      if (originalFile) {
        processImage(originalFile);
      }
    }
  };

  const handleClear = useCallback(() => {
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }
    setOriginalFile(null);
    setOriginalUrl(null);
    setError(null);
    onAsciiGenerated('', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [originalUrl, onAsciiGenerated]);

  const SettingsPanel = () => (
    <div className="space-y-6">
      {/* ASCII Style Presets */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {tool('asciiArtGenerator.imagePanel.presetLabel')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(IMAGE_ASCII_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => handlePresetChange(key)}
              className="text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Character Set */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {tool('asciiArtGenerator.imagePanel.charsetLabel')}
        </label>
        <input
          type="text"
          value={options.charset}
          onChange={(e) => handleOptionChange('charset', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background font-mono"
          placeholder=" .,:;ox%#@"
        />
        <p className="text-xs text-muted-foreground">
          Characters from light to dark. More characters = more detail.
        </p>
      </div>

      {/* Width Control */}
      <InteractiveSlider
        value={options.width}
        min={20}
        max={150}
        step={1}
        label={`${tool('asciiArtGenerator.imagePanel.widthLabel')}`}
        onChange={(value) => handleOptionChange('width', value)}
      />

      {/* Contrast and Brightness */}
      <div className="grid grid-cols-1 gap-4">
        <InteractiveSlider
          value={options.contrast}
          min={0.5}
          max={2.0}
          step={0.1}
          label={`${tool('asciiArtGenerator.imagePanel.contrastLabel')}`}
          onChange={(value) => handleOptionChange('contrast', Math.round(value * 10) / 10)}
        />

        <InteractiveSlider
          value={options.brightness}
          min={-50}
          max={50}
          step={1}
          label={`${tool('asciiArtGenerator.imagePanel.brightnessLabel')}`}
          onChange={(value) => handleOptionChange('brightness', value)}
        />
      </div>

      {/* Invert Colors Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {tool('asciiArtGenerator.imagePanel.invertLabel')}
        </label>
        <button
          onClick={() => handleOptionChange('invert', !options.invert)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            options.invert ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform shadow-md ${
              options.invert ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Desktop Layout: Upload Area and Settings Side by Side */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Upload Area - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          {/* File Upload Area */}
          {!originalFile && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer h-64"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {tool('asciiArtGenerator.imagePanel.dragDropLabel')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tool('asciiArtGenerator.imagePanel.supportedFormats')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Original Image Preview */}
          {originalFile && originalUrl && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Original Image</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Replace Image
                </Button>
              </div>
              
              <div className="relative h-64 bg-background rounded border overflow-hidden">
                <Image
                  src={originalUrl}
                  alt="Original"
                  fill
                  className="object-contain"
                />
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                {originalFile.name} ({(originalFile.size / 1024).toFixed(1)} KB)
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 p-4 bg-muted/30 rounded-md">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Processing image...</span>
            </div>
          )}
        </div>

        {/* Settings Panel - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Settings className="h-4 w-4" />
              ASCII Settings
            </label>
          </div>
          <div className="border border-border rounded-lg p-4 bg-muted/10">
            <SettingsPanel />
          </div>
        </div>
      </div>

      {/* Mobile Layout: Stacked with Accordion */}
      <div className="lg:hidden space-y-4">
        {/* Upload Area */}
        <div className="space-y-4">
          {/* File Upload Area */}
          {!originalFile && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer h-48"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {tool('asciiArtGenerator.imagePanel.dragDropLabel')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tool('asciiArtGenerator.imagePanel.supportedFormats')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Original Image Preview */}
          {originalFile && originalUrl && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Original Image</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Replace Image
                </Button>
              </div>
              
              <div className="relative h-48 bg-background rounded border overflow-hidden">
                <Image
                  src={originalUrl}
                  alt="Original"
                  fill
                  className="object-contain"
                />
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                {originalFile.name} ({(originalFile.size / 1024).toFixed(1)} KB)
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 p-4 bg-muted/30 rounded-md">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Processing image...</span>
            </div>
          )}
        </div>

        {/* Settings Accordion - Always visible */}
        <div className="border border-border rounded-lg bg-card">
          <button
            onClick={() => setShowMobileSettings(!showMobileSettings)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">ASCII Settings</span>
            </div>
            <ChevronDown 
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                showMobileSettings ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {showMobileSettings && (
            <div className="px-4 pb-4 border-t border-border">
              <div className="pt-4">
                <SettingsPanel />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
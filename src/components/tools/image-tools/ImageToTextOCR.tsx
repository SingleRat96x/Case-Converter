'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { ImageToTextAnalytics } from '@/components/shared/ImageToTextAnalytics';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { InteractiveSlider } from '@/components/shared/InteractiveSlider';
import { 
  Upload, 
  AlertCircle,
  FileText,
  Loader2,
  Scan,
  RotateCcw,
  Settings,
  Languages
} from 'lucide-react';
import Image from 'next/image';

// OCR library - we'll use Tesseract.js for client-side OCR
// Note: You'll need to install it: npm install tesseract.js
import { createWorker } from 'tesseract.js';

interface OCROptions {
  language: 'eng' | 'spa' | 'fra' | 'deu' | 'rus' | 'chi_sim' | 'jpn' | 'ara';
  confidence: number; // 0-100
  preserveFormatting: boolean;
  detectOrientation: boolean;
}

interface ProcessedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  extractedText: string;
  confidence: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  progress?: number;
}

const SUPPORTED_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'rus', name: 'Russian' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'ara', name: 'Arabic' }
] as const;

export function ImageToTextOCR() {
  const { tool } = useToolTranslations('tools/image-tools');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrWorkerRef = useRef<import('tesseract.js').Worker | null>(null);

  const [options, setOptions] = useState<OCROptions>({
    language: 'eng',
    confidence: 70,
    preserveFormatting: true,
    detectOrientation: true
  });

  const handleOptionChange = useCallback(<K extends keyof OCROptions>(
    option: K,
    value: OCROptions[K]
  ) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
  }, []);

  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setCopyFeedback({ type, message });
    setTimeout(() => setCopyFeedback(null), 3000);
  }, []);

  const initializeOCRWorker = useCallback(async () => {
    if (!ocrWorkerRef.current) {
      ocrWorkerRef.current = await createWorker(options.language);
    }
    return ocrWorkerRef.current;
  }, [options.language]);

  const processImageOCR = useCallback(async (file: File): Promise<string> => {
    try {
      const worker = await initializeOCRWorker();
      
      // Configure OCR options - skip strict typing for Tesseract parameters
      if (options.detectOrientation || options.preserveFormatting) {
        const params = {
          tessedit_pageseg_mode: options.detectOrientation ? 1 : 3,
          preserve_interword_spaces: options.preserveFormatting ? '1' : '0',
        };
        // @ts-expect-error - Tesseract.js types are inconsistent
        await worker.setParameters(params);
      }

      const { data: { text, confidence } } = await worker.recognize(file);

      // Filter out text with low confidence if needed
      if (confidence < options.confidence) {
        throw new Error(tool('imageToText.errors.lowConfidence'));
      }

      return text;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : tool('imageToText.errors.ocrFailed'));
    }
  }, [options, tool, initializeOCRWorker]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    setError(null);
    
    const file = files[0]; // OCR typically processes one image at a time
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp|bmp|tiff)$/i)) {
      setError(tool('imageToText.errors.invalidFile'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(tool('imageToText.errors.fileTooLarge'));
      return;
    }

    setUploadedImage(file);
    
    const processed: ProcessedImage = {
      id: `ocr-${Date.now()}`,
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      extractedText: '',
      confidence: 0,
      status: 'pending',
      progress: 0
    };

    setProcessedImage(processed);
    // Reset previous results
    setExtractedText('');
  }, [tool]);

  const handleProcessOCR = useCallback(async () => {
    if (!uploadedImage || isOCRProcessing) return;
    
    setError(null);
    setIsOCRProcessing(true);
    
    setProcessedImage(prev => prev ? { ...prev, status: 'processing', progress: 0 } : null);
    
    try {
      const text = await processImageOCR(uploadedImage);
      
      setProcessedImage(prev => prev ? {
        ...prev,
        extractedText: text,
        status: 'completed',
        confidence: options.confidence,
        progress: 100
      } : null);
      
      setExtractedText(text);
      showFeedback('success', tool('imageToText.messages.ocrSuccess'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : tool('imageToText.errors.ocrFailed');
      setProcessedImage(prev => prev ? {
        ...prev,
        status: 'error',
        error: errorMessage
      } : null);
      setError(errorMessage);
    } finally {
      setIsOCRProcessing(false);
    }
  }, [uploadedImage, isOCRProcessing, processImageOCR, options.confidence, tool, showFeedback]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  };


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

  // Cleanup worker on unmount
  React.useEffect(() => {
    return () => {
      if (ocrWorkerRef.current) {
        ocrWorkerRef.current.terminate();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {tool('imageToText.title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {tool('imageToText.description')}
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Desktop Layout - Side by Side */}
        <div className="hidden lg:block space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Image Upload Section - Desktop */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {tool('imageToText.labels.uploadArea')}
                </h2>
                {uploadedImage && (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={!uploadedImage}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {tool('imageToText.actions.reupload')}
                  </Button>
                )}
              </div>

              {!uploadedImage ? (
                <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted/70 transition-colors h-96">
                  <div 
                    className="flex flex-col items-center justify-center p-12 text-center cursor-pointer h-full"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {tool('imageToText.labels.uploadArea')}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {tool('imageToText.labels.dragDrop')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tool('imageToText.labels.supportedFormats')}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                </Card>
              ) : (
                <Card className="p-4">
                  <div className="relative h-72 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={processedImage?.originalUrl || ''}
                      alt="Uploaded image"
                      fill
                      className="object-contain"
                    />
                    {isOCRProcessing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p>{tool('imageToText.placeholders.processing')}</p>
                          {processedImage?.progress && (
                            <p className="text-sm">{processedImage.progress}%</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </Card>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Text Output Section - Desktop */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {tool('imageToText.labels.extractedText')}
              </h2>
              
              <div className="space-y-4">
                <textarea
                  id="extracted-text"
                  value={extractedText}
                  readOnly
                  className="w-full h-96 p-4 rounded-lg bg-muted/30 text-foreground resize-none transition-colors shadow-inner focus:outline-none border border-input"
                  placeholder={tool('imageToText.placeholders.textPreview')}
                />
              </div>

              {copyFeedback && (
                <div className={`mt-4 p-3 rounded-md ${copyFeedback.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                  {copyFeedback.message}
                </div>
              )}
            </div>
          </div>

          {/* Extract Text Button - Centered Below Both Sections (Desktop) */}
          <div className="flex justify-center">
            <Button
              onClick={handleProcessOCR}
              disabled={isOCRProcessing || !uploadedImage}
              size="lg"
              className="gap-2"
            >
              {isOCRProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Scan className="h-5 w-5" />
              )}
              {isOCRProcessing ? tool('imageToText.actions.processing') : tool('imageToText.actions.extractText')}
            </Button>
          </div>
        </div>
        
        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden space-y-6">
          {/* Image Upload Section - Mobile */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {tool('imageToText.labels.uploadArea')}
              </h2>
              {uploadedImage && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={!uploadedImage}
                >
                  <RotateCcw className="h-4 w-4" />
                  {tool('imageToText.actions.reupload')}
                </Button>
              )}
            </div>
            
            {!uploadedImage ? (
              <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted/70 transition-colors h-96">
                <div
                  className="flex flex-col items-center justify-center p-12 text-center cursor-pointer h-full"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {tool('imageToText.labels.uploadArea')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {tool('imageToText.labels.dragDrop')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tool('imageToText.labels.supportedFormats')}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              </Card>
            ) : (
              <Card className="p-4">
                <div className="relative h-72 bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={processedImage?.originalUrl || ''}
                    alt="Uploaded image"
                    fill
                    className="object-contain"
                  />
                  {isOCRProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>{tool('imageToText.placeholders.processing')}</p>
                        {processedImage?.progress && (
                          <p className="text-sm">{processedImage.progress}%</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </Card>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
          
          {/* Extract Text Button - Between Upload and Output (Mobile) */}
          <div className="flex justify-center">
            <Button
              onClick={handleProcessOCR}
              disabled={isOCRProcessing || !uploadedImage}
              size="lg"
              className="gap-2"
            >
              {isOCRProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Scan className="h-5 w-5" />
              )}
              {isOCRProcessing ? tool('imageToText.actions.processing') : tool('imageToText.actions.extractText')}
            </Button>
          </div>
          
          {/* Text Output Section - Mobile */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {tool('imageToText.labels.extractedText')}
            </h2>
            
            <div className="space-y-4">
              <textarea
                id="extracted-text-mobile"
                value={extractedText}
                readOnly
                className="w-full h-96 p-4 rounded-lg bg-muted/30 text-foreground resize-none transition-colors shadow-inner focus:outline-none border border-input"
                placeholder={tool('imageToText.placeholders.textPreview')}
              />
            </div>

            {copyFeedback && (
              <div className={`mt-4 p-3 rounded-md ${copyFeedback.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                {copyFeedback.message}
              </div>
            )}
          </div>
        </div>
        
      </div>


      {/* OCR Options Accordion */}
      <Accordion className="w-full">
        <AccordionItem 
          title={tool('imageToText.accordion.title')}
          defaultOpen={isAccordionOpen}
          className="w-full"
        >
          <div className="space-y-6">
            {/* Language Settings Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Languages className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">{tool('imageToText.sections.language')}</h3>
              </div>
              
              <div className="space-y-4">
                {/* Language Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    {tool('imageToText.options.language')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <Button
                        key={lang.code}
                        variant={options.language === lang.code ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleOptionChange('language', lang.code)}
                        className="text-xs hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
                      >
                        <Languages className="h-3 w-3 mr-1" />
                        {lang.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Confidence Threshold */}
                <div className="space-y-3">
                  <InteractiveSlider
                    label={`${tool('imageToText.options.confidence')} (${options.confidence}%)`}
                    value={options.confidence}
                    min={0}
                    max={100}
                    step={5}
                    onChange={(value) => handleOptionChange('confidence', value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {tool('imageToText.options.confidenceDescription')}
                  </p>
                </div>
              </div>
            </div>

            {/* Processing Settings Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Settings className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">{tool('imageToText.sections.processing')}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow">
                  <label className="text-sm font-medium cursor-pointer flex-1">
                    {tool('imageToText.options.preserveFormatting')}
                  </label>
                  <Switch
                    checked={options.preserveFormatting}
                    onCheckedChange={(checked) => handleOptionChange('preserveFormatting', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow">
                  <label className="text-sm font-medium cursor-pointer flex-1">
                    {tool('imageToText.options.detectOrientation')}
                  </label>
                  <Switch
                    checked={options.detectOrientation}
                    onCheckedChange={(checked) => handleOptionChange('detectOrientation', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </AccordionItem>
      </Accordion>


      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
          <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Image To Text Analytics */}
      <ImageToTextAnalytics 
        imageSize={uploadedImage?.size}
        extractedText={extractedText}
        confidence={processedImage?.confidence}
        variant="compact"
        showTitle={false}
      />
    </div>
  );
}

export default ImageToTextOCR;
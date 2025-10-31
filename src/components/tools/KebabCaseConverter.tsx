'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { TextAnalytics } from '@/components/shared/TextAnalytics';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Check, AlertCircle, Loader2, ArrowRight, ArrowLeftRight, Type, Code, FileJson, FileText, Table, Zap } from 'lucide-react';
import { 
  convertText, 
  convertJsonKeys, 
  convertCsvHeaders,
  validateAndParseJson,
  shouldUseWorker,
  type TargetCase,
  type SourceFormat,
  type KebabCaseOptions 
} from '@/lib/kebabCaseUtils';
import { downloadTextAsFile } from '@/lib/utils';

export function KebabCaseConverter() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  
  // Main state
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [inputType, setInputType] = useState<'text' | 'json' | 'csv'>('text');
  const [validationError, setValidationError] = useState<{ 
    message: string; 
    line?: number; 
    column?: number 
  } | null>(null);
  
  // Options state
  const [targetCase, setTargetCase] = useState<TargetCase>('kebab-case');
  const [sourceFormat, setSourceFormat] = useState<SourceFormat>('auto');
  const [preserveAcronyms, setPreserveAcronyms] = useState(true);
  const [treatDigitsAsBoundaries, setTreatDigitsAsBoundaries] = useState(false);
  const [lowercaseOutput, setLowercaseOutput] = useState(true);
  const [convertKeysOnly, setConvertKeysOnly] = useState(true);
  const [deepTransform, setDeepTransform] = useState(true);
  const [excludePaths, setExcludePaths] = useState('');
  const [prettyPrint, setPrettyPrint] = useState(true);
  
  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [ctaButtonState, setCtaButtonState] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Status message for screen readers
  const statusRef = useRef<HTMLDivElement>(null);

  // Build options object with useMemo to prevent recreation on every render
  const options: KebabCaseOptions = useMemo(() => ({
    targetCase,
    sourceFormat,
    preserveAcronyms,
    treatDigitsAsBoundaries,
    lowercaseOutput,
    convertKeysOnly: inputType === 'json' ? convertKeysOnly : undefined,
    deepTransform: inputType === 'json' ? deepTransform : undefined,
    excludePaths: inputType === 'json' && excludePaths ? excludePaths.split(',').map(p => p.trim()) : undefined,
    prettyPrint: inputType === 'json' ? prettyPrint : undefined
  }), [targetCase, sourceFormat, preserveAcronyms, treatDigitsAsBoundaries, lowercaseOutput, inputType, convertKeysOnly, deepTransform, excludePaths, prettyPrint]);

  // Validate JSON when in JSON mode
  const validateInput = useCallback((inputText: string) => {
    if (inputType === 'json' && inputText.trim()) {
      const result = validateAndParseJson(inputText);
      if (!result.success && result.error) {
        setValidationError(result.error);
        return false;
      }
    }
    setValidationError(null);
    return true;
  }, [inputType]);

  // Main conversion function
  const handleConvert = useCallback(async () => {
    if (!text) return;
    
    // Validate first
    if (!validateInput(text)) {
      setCtaButtonState('error');
      setStatusMessage(tool('kebabCase.errorInvalidInput') || 'Invalid input');
      setTimeout(() => setCtaButtonState('idle'), 2000);
      return;
    }
    
    setIsProcessing(true);
    setStatusMessage(tool('kebabCase.processing') || 'Processing...');
    
    try {
      let result: string;
      
      // Check if we should use worker for large inputs
      if (shouldUseWorker(text)) {
        // For now, process on main thread with timeout
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (inputType === 'json') {
        const parsed = JSON.parse(text);
        const converted = convertJsonKeys(parsed, options);
        result = prettyPrint 
          ? JSON.stringify(converted, null, 2)
          : JSON.stringify(converted);
      } else if (inputType === 'csv') {
        result = convertCsvHeaders(text, options);
      } else {
        // Text mode - process line by line
        const lines = text.split('\n');
        result = lines.map(line => convertText(line, options)).join('\n');
      }
      
      setConvertedText(result);
      setCtaButtonState('success');
      setStatusMessage(tool('kebabCase.converted') || 'Converted!');
      setTimeout(() => {
        setCtaButtonState('idle');
        setStatusMessage('');
      }, 2000);
    } catch (error) {
      setCtaButtonState('error');
      const errorMsg = error instanceof Error ? error.message : String(error);
      setStatusMessage(tool('kebabCase.errorConversion') || `Error: ${errorMsg}`);
      setTimeout(() => {
        setCtaButtonState('idle');
        setStatusMessage('');
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  }, [text, inputType, options, tool, validateInput, prettyPrint]);

  // Handle file upload
  const handleFileUploaded = useCallback(() => {
    handleConvert();
  }, [handleConvert]);

  // Handle text changes
  const handleTextChange = (newText: string) => {
    setText(newText);
    // Clear validation error when user types
    if (validationError) {
      setValidationError(null);
    }
  };

  // Handle tab change
  const handleTabChange = (newTab: string) => {
    setInputType(newTab as 'text' | 'json' | 'csv');
    setValidationError(null);
    setConvertedText('');
  };

  // Download handlers
  const handleDownloadPrimary = useCallback(() => {
    if (!convertedText) return;
    const ext = inputType === 'json' ? 'json' : inputType === 'csv' ? 'csv' : 'txt';
    const brandedContent = inputType === 'json' || inputType === 'csv' 
      ? convertedText
      : `Downloaded from TextCaseConverter.net\n=====================================\n\n${convertedText}`;
    downloadTextAsFile(brandedContent, `kebab-case-output.${ext}`);
  }, [convertedText, inputType]);

  // Shortcut button handlers
  const handleShortcut = useCallback((fromFormat: SourceFormat, toCase: TargetCase) => {
    setSourceFormat(fromFormat);
    setTargetCase(toCase);
    // Auto-convert if there's text
    if (text) {
      setTimeout(() => handleConvert(), 100);
    }
  }, [text, handleConvert]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to convert
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConvert();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleConvert]);

  // Custom label with input type selector
  const customInputLabel = (
    <div className="flex items-center gap-2 mb-2">
      <label htmlFor="text-input" className="text-sm font-medium text-foreground">
        Input:
      </label>
      <Select value={inputType} onValueChange={handleTabChange}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text" className="text-xs">
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Text / Identifiers
            </div>
          </SelectItem>
          <SelectItem value="json" className="text-xs">
            <div className="flex items-center gap-2">
              <FileJson className="h-3 w-3" />
              JSON
            </div>
          </SelectItem>
          <SelectItem value="csv" className="text-xs">
            <div className="flex items-center gap-2">
              <Table className="h-3 w-3" />
              CSV Headers
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Custom label with target case selector
  const customOutputLabel = (
    <div className="flex items-center gap-2 mb-2">
      <label htmlFor="text-output" className="text-sm font-medium text-foreground">
        {tool('kebabCase.outputLabel') || 'Output'}:
      </label>
      <Select value={targetCase} onValueChange={(value) => setTargetCase(value as TargetCase)}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="kebab-case" className="text-xs">
            <div className="flex items-center gap-2">
              <Code className="h-3 w-3" />
              {tool('kebabCase.targetKebab') || 'kebab-case'}
            </div>
          </SelectItem>
          <SelectItem value="camelCase" className="text-xs">
            <div className="flex items-center gap-2">
              <Type className="h-3 w-3" />
              {tool('kebabCase.targetCamel') || 'camelCase'}
            </div>
          </SelectItem>
          <SelectItem value="snake_case" className="text-xs">
            <div className="flex items-center gap-2">
              <Code className="h-3 w-3" />
              {tool('kebabCase.targetSnake') || 'snake_case'}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Get dynamic button text based on target case
  const getConvertButtonText = () => {
    const targets = {
      'kebab-case': tool('kebabCase.targetKebab') || 'kebab-case',
      'camelCase': tool('kebabCase.targetCamel') || 'camelCase',
      'snake_case': tool('kebabCase.targetSnake') || 'snake_case'
    };
    return tool('kebabCase.convertButton')?.replace('{targetCase}', targets[targetCase]) || `Convert to ${targets[targetCase]}`;
  };

  return (
    <BaseTextConverter
        title={tool('kebabCase.title') || 'Kebab Case Converter (Text & JSON Keys)'}
        description={tool('kebabCase.description') || 'Convert between kebab-case, camelCase, and snake_case'}
        inputLabel=""
        outputLabel=""
        inputPlaceholder={tool('kebabCase.inputPlaceholder') || 'Paste text, JSON, or CSV here...'}
        copyText={common('buttons.copy')}
        clearText={common('buttons.clear')}
        downloadText={common('buttons.download')}
        uploadText={common('buttons.upload')}
        uploadDescription=""
        downloadFileName={`kebab-case-output.${inputType === 'json' ? 'json' : inputType === 'csv' ? 'csv' : 'txt'}`}
        onTextChange={handleTextChange}
        text={text}
        convertedText={convertedText}
        onConvertedTextUpdate={setConvertedText}
        onFileUploaded={handleFileUploaded}
        showAnalytics={false}
        mobileLayout="2x2"
        onDownloadPrimary={handleDownloadPrimary}
        customInputLabel={customInputLabel}
        customOutputLabel={customOutputLabel}
      >
        <div className="space-y-4">
          {/* Validation Error Display */}
          {validationError && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {validationError.message}
                  </p>
                  {validationError.line && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Line {validationError.line}, Column {validationError.column}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shortcut Buttons */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                {tool('kebabCase.shortcutsTitle') || 'Quick Conversions'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShortcut('camelCase', 'kebab-case')}
                className="gap-1.5"
              >
                <ArrowRight className="h-3 w-3" />
                {tool('kebabCase.shortcutCamelToKebab') || 'Camel → Kebab'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShortcut('snake_case', 'kebab-case')}
                className="gap-1.5"
              >
                <ArrowRight className="h-3 w-3" />
                {tool('kebabCase.shortcutSnakeToKebab') || 'Snake → Kebab'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShortcut('kebab-case', 'camelCase')}
                className="gap-1.5"
              >
                <ArrowLeftRight className="h-3 w-3" />
                {tool('kebabCase.shortcutKebabToCamel') || 'Kebab → Camel'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShortcut('kebab-case', 'snake_case')}
                className="gap-1.5"
              >
                <ArrowLeftRight className="h-3 w-3" />
                {tool('kebabCase.shortcutKebabToSnake') || 'Kebab → Snake'}
              </Button>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleConvert}
              variant="default"
              size="lg"
              className={`gap-2 transition-all duration-300 ${
                ctaButtonState === 'success'
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                  : ctaButtonState === 'error'
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
                  : ''
              }`}
              disabled={!text || isProcessing || !!validationError}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tool('kebabCase.processing') || 'Processing...'}
                </>
              ) : ctaButtonState === 'success' ? (
                <>
                  <Check className="h-4 w-4" />
                  {tool('kebabCase.converted') || 'Converted!'}
                </>
              ) : ctaButtonState === 'error' ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  {tool('kebabCase.error') || 'Error'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {getConvertButtonText()}
                </>
              )}
            </Button>
          </div>

          {/* Helper Text */}
          <div className="text-center text-sm text-muted-foreground">
            {tool('kebabCase.helperText') || 'Choose input type and target case, paste your data, then convert.'} 
            <br />
            <span className="text-xs">(Ctrl/Cmd + Enter)</span>
          </div>

          {/* Status message for screen readers */}
          {statusMessage && (
            <div ref={statusRef} className="sr-only" role="status" aria-live="polite">
              {statusMessage}
            </div>
          )}

          {/* Options Accordion */}
          <Accordion className="w-full">
            <AccordionItem 
              title={tool('kebabCase.optionsTitle') || 'Conversion Options'}
              defaultOpen={true}
            >
              <div className="space-y-6">
                  {/* Source Format Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      {tool('kebabCase.sourceFormatLabel') || 'Source Format'}
                    </Label>
                    <Select value={sourceFormat} onValueChange={(value) => setSourceFormat(value as SourceFormat)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">{tool('kebabCase.sourceAuto') || 'Auto-detect'}</SelectItem>
                        <SelectItem value="camelCase">{tool('kebabCase.sourceCamel') || 'camelCase'}</SelectItem>
                        <SelectItem value="snake_case">{tool('kebabCase.sourceSnake') || 'snake_case'}</SelectItem>
                        <SelectItem value="kebab-case">{tool('kebabCase.sourceKebab') || 'kebab-case'}</SelectItem>
                        <SelectItem value="PascalCase">{tool('kebabCase.sourcePascal') || 'PascalCase'}</SelectItem>
                        <SelectItem value="Title Case">{tool('kebabCase.sourceTitle') || 'Title Case'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* General Options */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      {tool('kebabCase.generalOptions') || 'General Options'}
                    </Label>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="preserve-acronyms" className="text-sm">
                          {tool('kebabCase.preserveAcronyms') || 'Preserve acronyms'}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {tool('kebabCase.preserveAcronymsHint') || 'Keep API, URL intact'}
                        </p>
                      </div>
                      <Switch
                        id="preserve-acronyms"
                        checked={preserveAcronyms}
                        onCheckedChange={setPreserveAcronyms}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="digit-boundaries" className="text-sm">
                          {tool('kebabCase.treatDigitsAsBoundaries') || 'Treat digits as word boundaries'}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {tool('kebabCase.treatDigitsAsBoundariesHint') || 'Separate numbers with hyphens'}
                        </p>
                      </div>
                      <Switch
                        id="digit-boundaries"
                        checked={treatDigitsAsBoundaries}
                        onCheckedChange={setTreatDigitsAsBoundaries}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="lowercase-output" className="text-sm">
                          {tool('kebabCase.lowercaseOutput') || 'Lowercase output'}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {tool('kebabCase.lowercaseOutputHint') || 'Standard kebab-case'}
                        </p>
                      </div>
                      <Switch
                        id="lowercase-output"
                        checked={lowercaseOutput}
                        onCheckedChange={setLowercaseOutput}
                      />
                    </div>
                  </div>

                  {/* JSON-Specific Options */}
                  {inputType === 'json' && (
                    <div className="space-y-3 pt-3 border-t">
                      <Label className="text-sm font-semibold">
                        {tool('kebabCase.jsonOptions') || 'JSON Options'}
                      </Label>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="convert-keys-only" className="text-sm">
                          {tool('kebabCase.convertKeysOnly') || 'Convert keys only'}
                        </Label>
                        <Switch
                          id="convert-keys-only"
                          checked={convertKeysOnly}
                          onCheckedChange={setConvertKeysOnly}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="deep-transform" className="text-sm">
                          {tool('kebabCase.deepTransform') || 'Deep transform nested objects'}
                        </Label>
                        <Switch
                          id="deep-transform"
                          checked={deepTransform}
                          onCheckedChange={setDeepTransform}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="pretty-print" className="text-sm">
                          {tool('kebabCase.prettyPrint') || 'Pretty print'}
                        </Label>
                        <Switch
                          id="pretty-print"
                          checked={prettyPrint}
                          onCheckedChange={setPrettyPrint}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exclude-paths" className="text-sm">
                          {tool('kebabCase.excludePaths') || 'Exclude JSONPath patterns'}
                        </Label>
                        <Input
                          id="exclude-paths"
                          type="text"
                          value={excludePaths}
                          onChange={(e) => setExcludePaths(e.target.value)}
                          placeholder="$.config.urls,$.meta.*"
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          {tool('kebabCase.excludePathsHint') || 'Comma-separated paths'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
            </AccordionItem>
          </Accordion>

          {/* Analytics Display */}
          {convertedText && (
            <div className="mt-6">
              <TextAnalytics text={convertedText} variant="compact" />
            </div>
          )}
        </div>
      </BaseTextConverter>
  );
}

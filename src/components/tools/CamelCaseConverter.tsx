'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { TextAnalytics } from '@/components/shared/TextAnalytics';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Sparkles, Check, AlertCircle, Loader2, ArrowRight, ArrowLeftRight, Type, Code, FileJson, FileText, Table } from 'lucide-react';
import { 
  convertTextToCamelCase, 
  convertJsonKeys, 
  convertCsvHeaders,
  validateAndParseJson,
  shouldUseWorker,
  type ConversionMode,
  type CaseStyle,
  type CamelCaseOptions 
} from '@/lib/camelCaseUtils';
import { downloadTextAsFile } from '@/lib/utils';

export function CamelCaseConverter() {
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
  const [mode, setMode] = useState<ConversionMode | null>(null);
  const [caseStyle, setCaseStyle] = useState<CaseStyle>('camelCase');
  const [preserveAcronyms, setPreserveAcronyms] = useState(true);
  const [safeCharsOnly, setSafeCharsOnly] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [convertKeysOnly, setConvertKeysOnly] = useState(true);
  const [excludePaths, setExcludePaths] = useState('');
  const [prettyPrint, setPrettyPrint] = useState(true);
  
  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [ctaButtonState, setCtaButtonState] = useState<'idle' | 'success' | 'error'>('idle');
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  
  // Status message for screen readers
  const statusRef = useRef<HTMLDivElement>(null);

  // Build options object
  const options: CamelCaseOptions = {
    mode,
    caseStyle,
    preserveAcronyms,
    safeCharsOnly,
    trimWhitespace,
    convertKeysOnly: inputType === 'json' ? convertKeysOnly : undefined,
    excludePaths: inputType === 'json' && excludePaths ? excludePaths.split(',').map(p => p.trim()) : undefined,
    prettyPrint: inputType === 'json' ? prettyPrint : undefined
  };

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
      setStatusMessage(tool('camelCase.errorInvalidInput') || 'Invalid input');
      setTimeout(() => setCtaButtonState('idle'), 2000);
      return;
    }
    
    setIsProcessing(true);
    setStatusMessage(tool('camelCase.processing') || 'Processing...');
    
    try {
      let result: string;
      
      // Check if we should use worker for large inputs
      if (shouldUseWorker(text)) {
        // For now, process on main thread with timeout
        // TODO: Implement worker in next phase
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
        result = lines.map(line => convertTextToCamelCase(line, options)).join('\n');
      }
      
      setConvertedText(result);
      setCtaButtonState('success');
      setStatusMessage(tool('camelCase.converted') || 'Converted!');
      setTimeout(() => {
        setCtaButtonState('idle');
        setStatusMessage('');
      }, 2000);
    } catch (error) {
      setCtaButtonState('error');
      const errorMsg = error instanceof Error ? error.message : String(error);
      setStatusMessage(tool('camelCase.errorConversion') || `Error: ${errorMsg}`);
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
      ? convertedText // Don't brand JSON/CSV
      : `Downloaded from TextCaseConverter.net\n=====================================\n\n${convertedText}`;
    downloadTextAsFile(brandedContent, `camelCase-output.${ext}`);
  }, [convertedText, inputType]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to convert
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConvert();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleConvert]);

  // Responsive accordion behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsAccordionOpen(true);
      } else {
        setIsAccordionOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <BaseTextConverter
        title={tool('camelCase.title')}
        description={tool('camelCase.description')}
        inputLabel=""
        outputLabel={tool('camelCase.outputLabel')}
        inputPlaceholder={tool('camelCase.inputPlaceholder')}
        copyText={common('buttons.copy')}
        clearText={common('buttons.clear')}
        downloadText={common('buttons.download')}
        uploadText={common('buttons.upload')}
        uploadDescription=""
        downloadFileName={`camelCase-output.${inputType === 'json' ? 'json' : inputType === 'csv' ? 'csv' : 'txt'}`}
        onTextChange={handleTextChange}
        text={text}
        convertedText={convertedText}
        onConvertedTextUpdate={setConvertedText}
        onFileUploaded={handleFileUploaded}
        showAnalytics={false}
        mobileLayout="2x2"
        onDownloadPrimary={handleDownloadPrimary}
        customInputLabel={customInputLabel}
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
              disabled={!text || !mode || isProcessing || !!validationError}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tool('camelCase.processing') || 'Processing...'}
                </>
              ) : ctaButtonState === 'success' ? (
                <>
                  <Check className="h-4 w-4" />
                  {tool('camelCase.converted') || 'Converted!'}
                </>
              ) : ctaButtonState === 'error' ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  {tool('camelCase.error') || 'Error'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {tool('camelCase.convertButton') || 'Convert to camelCase'}
                </>
              )}
            </Button>
          </div>

          {/* Helper Text */}
          <div className="text-center text-sm text-muted-foreground">
            {tool('camelCase.helperText') || 'Choose input type and options, paste your data, then convert.'} 
            <span className="text-xs ml-2 opacity-70">
              (Ctrl/Cmd + Enter)
            </span>
          </div>

          {/* ARIA Live Region for Status */}
          <div 
            ref={statusRef}
            role="status" 
            aria-live="polite" 
            aria-atomic="true"
            className="sr-only"
          >
            {statusMessage}
          </div>

          {/* Options Accordion */}
          <Accordion className="w-full">
            <AccordionItem
              title={tool('camelCase.optionsTitle') || 'Conversion Options'}
              defaultOpen={isAccordionOpen}
              className="w-full"
            >
              <div className="space-y-6">
                {/* Mode Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Settings className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">
                      {tool('camelCase.sourceFormatTitle') || 'Source Format'}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      ({tool('camelCase.sourceFormatHint') || 'How is your input formatted?'})
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      variant={mode === 'snake-to-camel' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMode('snake-to-camel')}
                      className="justify-start gap-2"
                    >
                      <Code className="h-4 w-4" />
                      {tool('camelCase.modeSnake') || 'snake_case'}
                    </Button>
                    <Button
                      variant={mode === 'kebab-to-camel' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMode('kebab-to-camel')}
                      className="justify-start gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      {tool('camelCase.modeKebab') || 'kebab-case'}
                    </Button>
                    <Button
                      variant={mode === 'title-to-camel' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMode('title-to-camel')}
                      className="justify-start gap-2"
                    >
                      <Type className="h-4 w-4" />
                      {tool('camelCase.modeTitleCase') || 'Title Case / Spaces'}
                    </Button>
                    <Button
                      variant={mode === 'reverse' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMode('reverse')}
                      className="justify-start gap-2"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      {tool('camelCase.modeReverse') || 'Reverse (camelCase → snake_case)'}
                    </Button>
                  </div>
                </div>

                {/* Case Style Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {tool('camelCase.caseStyleLabel') || 'Case Style'}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={caseStyle === 'camelCase' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCaseStyle('camelCase')}
                      className="gap-2"
                    >
                      <Code className="h-4 w-4" />
                      {tool('camelCase.styleCamel') || 'camelCase'}
                    </Button>
                    <Button
                      variant={caseStyle === 'PascalCase' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCaseStyle('PascalCase')}
                      className="gap-2"
                    >
                      <Type className="h-4 w-4" />
                      {tool('camelCase.stylePascal') || 'PascalCase'}
                    </Button>
                  </div>
                </div>

                {/* General Options */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    {tool('camelCase.generalOptions') || 'General Options'}
                  </Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Preserve Acronyms */}
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      <label htmlFor="preserve-acronyms" className="text-sm font-medium cursor-pointer flex-1 pr-2">
                        {tool('camelCase.preserveAcronyms') || 'Preserve acronyms (e.g., userID)'}
                      </label>
                      <Switch
                        id="preserve-acronyms"
                        checked={preserveAcronyms}
                        onCheckedChange={setPreserveAcronyms}
                      />
                    </div>

                    {/* Safe Characters Only */}
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      <label htmlFor="safe-chars" className="text-sm font-medium cursor-pointer flex-1 pr-2">
                        {tool('camelCase.safeCharsOnly') || 'Safe characters only (strip non-ASCII)'}
                      </label>
                      <Switch
                        id="safe-chars"
                        checked={safeCharsOnly}
                        onCheckedChange={setSafeCharsOnly}
                      />
                    </div>

                    {/* Trim Whitespace */}
                    {inputType === 'text' && (
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                        <label htmlFor="trim-whitespace" className="text-sm font-medium cursor-pointer flex-1 pr-2">
                          {tool('camelCase.trimWhitespace') || 'Trim & collapse whitespace'}
                        </label>
                        <Switch
                          id="trim-whitespace"
                          checked={trimWhitespace}
                          onCheckedChange={setTrimWhitespace}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* JSON-Specific Options */}
                {inputType === 'json' && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <Label className="text-sm font-medium text-primary">
                      {tool('camelCase.jsonOptions') || 'JSON-Specific Options'}
                    </Label>
                    
                    <div className="space-y-3">
                      {/* Convert Keys Only */}
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                        <label htmlFor="convert-keys-only" className="text-sm font-medium cursor-pointer flex-1 pr-2">
                          {tool('camelCase.convertKeysOnly') || "Convert keys only (don't touch values)"}
                        </label>
                        <Switch
                          id="convert-keys-only"
                          checked={convertKeysOnly}
                          onCheckedChange={setConvertKeysOnly}
                        />
                      </div>

                      {/* Pretty Print */}
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                        <label htmlFor="pretty-print" className="text-sm font-medium cursor-pointer flex-1 pr-2">
                          {tool('camelCase.prettyPrint') || 'Pretty-print output'}
                        </label>
                        <Switch
                          id="pretty-print"
                          checked={prettyPrint}
                          onCheckedChange={setPrettyPrint}
                        />
                      </div>

                      {/* Exclude Paths */}
                      <div className="space-y-2">
                        <Label htmlFor="exclude-paths" className="text-sm font-medium">
                          {tool('camelCase.excludePaths') || 'Exclude paths (comma-separated)'}
                        </Label>
                        <Input
                          id="exclude-paths"
                          value={excludePaths}
                          onChange={(e) => setExcludePaths(e.target.value)}
                          placeholder="$.data.items[*].url, $.metadata.timestamp"
                          className="font-mono text-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                          {tool('camelCase.excludePathsHint') || 'Use JSONPath notation. Wildcards (*) supported.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AccordionItem>
          </Accordion>

          {/* Analytics */}
          {convertedText && (
            <TextAnalytics
              text={convertedText}
              variant="compact"
              showTitle={false}
            />
          )}
        </div>
      </BaseTextConverter>
  );
}

'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { JSONStringifyAnalytics } from '@/components/shared/JSONStringifyAnalytics';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { ArrowRightLeft, XCircle, RefreshCw, Zap, FileType, Braces } from 'lucide-react';

type ConversionMode = 'stringify' | 'parse';

interface ConversionOptions {
  indentSize: 2 | 4 | 8;
  sortKeys: boolean;
  escapeUnicode: boolean;
  compactOutput: boolean;
  removeComments: boolean;
  validateJson: boolean;
}

export function JSONStringifyConverter() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('stringify');
  const [error, setError] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [options, setOptions] = useState<ConversionOptions>({
    indentSize: 2,
    sortKeys: false,
    escapeUnicode: false,
    compactOutput: false,
    removeComments: false,
    validateJson: true,
  });

  // JSON stringify with custom options
  const stringifyJSON = useCallback((jsonText: string): string => {
    try {
      // Parse the input first
      let parsed = JSON.parse(jsonText);

      // Sort keys if enabled
      if (options.sortKeys && typeof parsed === 'object' && parsed !== null) {
        const sortObject = (obj: unknown): unknown => {
          if (Array.isArray(obj)) {
            return obj.map(sortObject);
          } else if (obj !== null && typeof obj === 'object') {
            const sorted: Record<string, unknown> = {};
            Object.keys(obj as Record<string, unknown>).sort().forEach(key => {
              sorted[key] = sortObject((obj as Record<string, unknown>)[key]);
            });
            return sorted;
          }
          return obj;
        };
        parsed = sortObject(parsed);
      }

      // Stringify with options
      const spaces = options.compactOutput ? 0 : options.indentSize;
      let result = JSON.stringify(parsed, null, spaces);

      // Escape unicode if enabled
      if (options.escapeUnicode) {
        result = result.replace(/[\u0080-\uFFFF]/g, (match) => {
          return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).substr(-4);
        });
      }

      return result;

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : tool('jsonStringify.errors.stringifyFailed'));
    }
  }, [options, tool]);

  // JSON parse with formatting
  const parseJSON = useCallback((jsonText: string): string => {
    try {
      // Remove comments if enabled
      let cleanText = jsonText;
      if (options.removeComments) {
        // Remove single-line comments
        cleanText = cleanText.replace(/\/\/.*$/gm, '');
        // Remove multi-line comments
        cleanText = cleanText.replace(/\/\*[\s\S]*?\*\//g, '');
      }

      // Parse the JSON
      const parsed = JSON.parse(cleanText);

      // Format output based on options
      const spaces = options.compactOutput ? 0 : options.indentSize;
      return JSON.stringify(parsed, null, spaces);

    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error(tool('jsonStringify.errors.invalidJson'));
      }
      throw new Error(err instanceof Error ? err.message : tool('jsonStringify.errors.parseFailed'));
    }
  }, [options, tool]);

  // Process conversion based on mode
  const processConversion = useCallback((inputText: string) => {
    setError(null);
    
    if (!inputText.trim()) {
      setOutput('');
      return;
    }
    
    try {
      if (mode === 'stringify') {
        const converted = stringifyJSON(inputText);
        setOutput(converted);
      } else {
        const converted = parseJSON(inputText);
        setOutput(converted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('jsonStringify.errors.conversionFailed'));
      setOutput('');
    }
  }, [mode, stringifyJSON, parseJSON, tool]);

  // Handle input change
  const handleInputChange = useCallback((newInput: string) => {
    setInput(newInput);
    processConversion(newInput);
  }, [processConversion]);

  // Handle mode switch
  const handleModeSwitch = useCallback(() => {
    const newMode = mode === 'stringify' ? 'parse' : 'stringify';
    setMode(newMode);
    // Keep the same input and reprocess
    processConversion(input);
  }, [mode, input, processConversion]);

  // Handle option changes
  const handleOptionChange = useCallback((key: keyof ConversionOptions, value: string | boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Apply example JSON
  const applyExample = useCallback((example: string) => {
    setInput(example);
    processConversion(example);
  }, [processConversion]);

  // Clear all fields
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  // Update output when options change
  React.useEffect(() => {
    processConversion(input);
  }, [options, processConversion, input]);

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

  return (
    <BaseTextConverter
      title={tool('jsonStringify.title')}
      description={tool('jsonStringify.description')}
      inputLabel={mode === 'stringify' ? tool('jsonStringify.labels.jsonInput') : tool('jsonStringify.labels.jsonString')}
      outputLabel={mode === 'stringify' ? tool('jsonStringify.labels.jsonString') : tool('jsonStringify.labels.jsonInput')}
      inputPlaceholder={mode === 'stringify' ? tool('jsonStringify.placeholders.json') : tool('jsonStringify.placeholders.string')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName="processed.json"
      onTextChange={handleInputChange}
      text={input}
      convertedText={output}
      onConvertedTextUpdate={setOutput}
      onFileUploaded={(content: string) => {
        setInput(content);
        processConversion(content);
      }}
      showAnalytics={false}
      mobileLayout="2x2"
      useMonoFont={true}
    >
      <div className="space-y-3">
        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={handleModeSwitch}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {mode === 'stringify' ? tool('jsonStringify.modes.stringify') : tool('jsonStringify.modes.parse')}
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
          
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={!input && !output}
            >
              <RefreshCw className="h-3 w-3" />
              {tool('jsonStringify.actions.clear')}
            </Button>
            
            <Button
              onClick={() => applyExample(mode === 'stringify' 
                ? '{"name": "John", "age": 30, "hobbies": ["reading", "coding"], "address": {"city": "New York", "zip": "10001"}}'
                : '{"name":"John","age":30,"hobbies":["reading","coding"]}'
              )}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Zap className="h-3 w-3" />
              {tool('jsonStringify.actions.example')}
            </Button>
          </div>
        </div>

        {/* JSON Stringify Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('jsonStringify.accordion.title')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Formatting Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <FileType className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('jsonStringify.sections.formatting')}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Indent Size Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      {tool('jsonStringify.options.indentSize')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([2, 4, 8] as const).map((size) => (
                        <Button
                          key={size}
                          variant={options.indentSize === size ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleOptionChange('indentSize', size)}
                          className="text-xs"
                        >
                          {size} {tool('jsonStringify.options.spaces')}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Output Format */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      {tool('jsonStringify.options.outputFormat')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={!options.compactOutput ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleOptionChange('compactOutput', false)}
                        className="text-xs"
                      >
                        {tool('jsonStringify.options.pretty')}
                      </Button>
                      <Button
                        variant={options.compactOutput ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleOptionChange('compactOutput', true)}
                        className="text-xs"
                      >
                        {tool('jsonStringify.options.compact')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Braces className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('jsonStringify.sections.processing')}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="sort-keys" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('jsonStringify.options.sortKeys')}
                    </label>
                    <Switch
                      id="sort-keys"
                      checked={options.sortKeys}
                      onCheckedChange={(checked) => handleOptionChange('sortKeys', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="escape-unicode" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('jsonStringify.options.escapeUnicode')}
                    </label>
                    <Switch
                      id="escape-unicode"
                      checked={options.escapeUnicode}
                      onCheckedChange={(checked) => handleOptionChange('escapeUnicode', checked)}
                    />
                  </div>
                  
                  {mode === 'parse' && (
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label htmlFor="remove-comments" className="text-sm font-medium cursor-pointer flex-1">
                        {tool('jsonStringify.options.removeComments')}
                      </label>
                      <Switch
                        id="remove-comments"
                        checked={options.removeComments}
                        onCheckedChange={(checked) => handleOptionChange('removeComments', checked)}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="validate-json" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('jsonStringify.options.validateJson')}
                    </label>
                    <Switch
                      id="validate-json"
                      checked={options.validateJson}
                      onCheckedChange={(checked) => handleOptionChange('validateJson', checked)}
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
            <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* JSON Stringify Analytics */}
        <JSONStringifyAnalytics 
          inputText={input}
          outputText={output}
          variant="compact"
          showTitle={false}
        />

      </div>
    </BaseTextConverter>
  );
}
'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { Base64Analytics } from '@/components/shared/Base64Analytics';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { ArrowRightLeft, XCircle, Settings } from 'lucide-react';

type ConversionMode = 'encode' | 'decode';

interface ConversionOptions {
  urlSafe: boolean;
  includePadding: boolean;
  lineBreaks: boolean;
  lineLength: number;
}

export function Base64EncoderDecoder() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('encode');
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    urlSafe: false,
    includePadding: true,
    lineBreaks: false,
    lineLength: 76,
  });

  // Base64 encoding function
  const encodeToBase64 = useCallback((text: string): string => {
    try {
      // Convert string to base64
      let encoded = btoa(unescape(encodeURIComponent(text)));
      
      // Apply URL-safe encoding if enabled
      if (options.urlSafe) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_');
        if (!options.includePadding) {
          encoded = encoded.replace(/=/g, '');
        }
      }
      
      // Add line breaks if enabled
      if (options.lineBreaks && options.lineLength > 0) {
        const chunks = [];
        for (let i = 0; i < encoded.length; i += options.lineLength) {
          chunks.push(encoded.slice(i, i + options.lineLength));
        }
        encoded = chunks.join('\n');
      }
      
      return encoded;
    } catch {
      throw new Error(tool('base64.errors.encodeFailed'));
    }
  }, [options, tool]);

  // Base64 decoding function
  const decodeFromBase64 = useCallback((text: string): string => {
    try {
      // Remove line breaks and whitespace
      let cleaned = text.replace(/[\s\r\n]+/g, '');
      
      // Convert from URL-safe format if needed
      if (options.urlSafe) {
        cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');
        
        // Add padding if needed
        const padding = cleaned.length % 4;
        if (padding && options.includePadding) {
          cleaned += '='.repeat(4 - padding);
        }
      }
      
      // Validate base64 string
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(cleaned)) {
        throw new Error(tool('base64.errors.invalidBase64'));
      }
      
      // Decode base64
      const decoded = decodeURIComponent(escape(atob(cleaned)));
      return decoded;
    } catch (err) {
      if (err instanceof Error && err.message === tool('base64.errors.invalidBase64')) {
        throw err;
      }
      throw new Error(tool('base64.errors.decodeFailed'));
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
      if (mode === 'encode') {
        const encoded = encodeToBase64(inputText);
        setOutput(encoded);
      } else {
        const decoded = decodeFromBase64(inputText);
        setOutput(decoded);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('base64.errors.conversionFailed'));
      setOutput('');
    }
  }, [mode, encodeToBase64, decodeFromBase64, tool]);

  // Handle input change
  const handleInputChange = useCallback((newInput: string) => {
    setInput(newInput);
    processConversion(newInput);
  }, [processConversion]);

  // Handle mode switch
  const handleModeSwitch = useCallback(() => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    // Swap input and output if both have content
    if (input && output && !error) {
      setInput(output);
      setOutput(input);
      processConversion(output);
    } else {
      processConversion(input);
    }
  }, [mode, input, output, error, processConversion]);

  // Handle option changes
  const handleOptionChange = useCallback((option: keyof ConversionOptions, value?: boolean | number) => {
    setOptions(prev => ({
      ...prev,
      [option]: value !== undefined ? value : !prev[option]
    }));
  }, []);

  // Update output when options change
  React.useEffect(() => {
    processConversion(input);
  }, [options, processConversion, input]);

  // Handle responsive accordion behavior
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

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
      title={tool('base64.title')}
      description={tool('base64.description')}
      inputLabel={mode === 'encode' ? tool('base64.labels.plainText') : tool('base64.labels.base64Text')}
      outputLabel={mode === 'encode' ? tool('base64.labels.base64Text') : tool('base64.labels.plainText')}
      inputPlaceholder={mode === 'encode' ? tool('base64.placeholders.encode') : tool('base64.placeholders.decode')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={''}
      downloadFileName={mode === 'encode' ? 'encoded-base64.txt' : 'decoded-text.txt'}
      onTextChange={handleInputChange}
      text={input}
      convertedText={output}
      onConvertedTextUpdate={setOutput}
      showAnalytics={false}
      mobileLayout="row"
      useMonoFont={true}
    >
      <div className="space-y-3">
        {/* Main Action Buttons */}
        <div className="flex justify-center">
          <Button
            onClick={handleModeSwitch}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {mode === 'encode' ? tool('base64.modes.encode') : tool('base64.modes.decode')}
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Base64 Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('base64.options.title')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Settings className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">{tool('base64.options.title')}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                  <label 
                    htmlFor="url-safe" 
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {tool('base64.options.urlSafe')}
                  </label>
                  <Switch
                    id="url-safe"
                    checked={options.urlSafe}
                    onCheckedChange={() => handleOptionChange('urlSafe')}
                  />
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border bg-card transition-colors ${
                  !options.urlSafe ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/5'
                }`}>
                  <label 
                    htmlFor="include-padding" 
                    className={`text-sm font-medium flex-1 ${
                      !options.urlSafe ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'
                    }`}
                  >
                    {tool('base64.options.includePadding')}
                  </label>
                  <Switch
                    id="include-padding"
                    checked={options.includePadding}
                    onCheckedChange={() => handleOptionChange('includePadding')}
                    disabled={!options.urlSafe}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                  <label 
                    htmlFor="line-breaks" 
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {tool('base64.options.lineBreaks')}
                  </label>
                  <Switch
                    id="line-breaks"
                    checked={options.lineBreaks}
                    onCheckedChange={() => handleOptionChange('lineBreaks')}
                  />
                </div>
                {options.lineBreaks && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <label 
                      htmlFor="line-length" 
                      className="text-sm font-medium"
                    >
                      {tool('base64.options.lineLength')}
                    </label>
                    <input
                      id="line-length"
                      type="number"
                      min="4"
                      max="1000"
                      value={options.lineLength}
                      onChange={(e) => handleOptionChange('lineLength', parseInt(e.target.value) || 76)}
                      className="w-20 px-2 py-1 text-sm border border-input bg-background rounded-md text-right"
                    />
                  </div>
                )}
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

        {/* Base64 Analytics */}
        <Base64Analytics 
          inputText={input}
          outputText={output}
          mode={mode}
          options={options}
          variant="compact"
          showTitle={false}
        />

      </div>
    </BaseTextConverter>
  );
}
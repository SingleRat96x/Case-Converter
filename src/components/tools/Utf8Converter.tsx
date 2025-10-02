'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { UTF8ConverterAnalytics } from '@/components/shared/UTF8ConverterAnalytics';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { ArrowRightLeft, XCircle, RefreshCw, Zap, Binary } from 'lucide-react';

type ConversionMode = 'encode' | 'decode';
type Separator = 'space' | 'comma' | 'none';

interface ConversionOptions {
  separator: Separator;
  showBom: boolean;
  uppercase: boolean;
}

export function Utf8Converter() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('encode');
  const [error, setError] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [options, setOptions] = useState<ConversionOptions>({
    separator: 'comma',
    showBom: false,
    uppercase: false,
  });

  // UTF-8 encoding function - always outputs escaped format
  const encodeToUtf8 = useCallback((text: string): string => {
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      
      // Add BOM if requested (UTF-8 BOM: 239, 187, 191)
      const finalBytes = options.showBom 
        ? new Uint8Array([239, 187, 191, ...bytes])
        : bytes;
      
      // Always use escaped format with selected separator
      const result = Array.from(finalBytes).map(b => {
        const hex = b.toString(16).padStart(2, '0');
        return `\\x${options.uppercase ? hex.toUpperCase() : hex}`;
      });
      
      // Apply separator
      switch (options.separator) {
        case 'space':
          return result.join(' ');
        case 'comma':
          return result.join(', ');
        case 'none':
          return result.join('');
        default:
          return result.join(', ');
      }
    } catch {
      throw new Error(tool('utf8.errors.encodeFailed'));
    }
  }, [options, tool]);

  // UTF-8 decoding function - only handles escaped format
  const decodeFromUtf8 = useCallback((text: string): string => {
    try {
      let cleanInput = text.trim();
      
      // Handle different separators by normalizing to space-separated
      if (cleanInput.includes(', ')) {
        cleanInput = cleanInput.replace(/, /g, ' ');
      } else if (cleanInput.includes(',')) {
        cleanInput = cleanInput.replace(/,/g, ' ');
      }
      
      // Extract all \x patterns regardless of separator
      const matches = cleanInput.match(/\\x[0-9a-fA-F]{2}/g);
      if (!matches || matches.length === 0) {
        throw new Error(tool('utf8.errors.invalidFormat'));
      }
      
      const bytes = matches.map(match => {
        const hex = match.slice(2); // Remove \x
        const num = parseInt(hex, 16);
        if (isNaN(num)) {
          throw new Error(tool('utf8.errors.invalidBytes'));
        }
        return num;
      });
      
      // Remove BOM if present (239, 187, 191)
      const finalBytes = bytes.length >= 3 && bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191
        ? bytes.slice(3)
        : bytes;
      
      // Decode using TextDecoder
      const decoder = new TextDecoder('utf-8', { fatal: true });
      const uint8Array = new Uint8Array(finalBytes);
      const decoded = decoder.decode(uint8Array);
      
      return decoded;
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Invalid byte sequence') || err.message.includes('invalid')) {
          throw new Error(tool('utf8.errors.invalidBytes'));
        }
        if (err.message === tool('utf8.errors.invalidBytes') || 
            err.message === tool('utf8.errors.invalidFormat')) {
          throw err;
        }
      }
      throw new Error(tool('utf8.errors.decodeFailed'));
    }
  }, [tool]);

  // Process conversion based on mode
  const processConversion = useCallback((inputText: string, targetMode?: ConversionMode) => {
    setError(null);
    
    if (!inputText.trim()) {
      setOutput('');
      return;
    }
    
    const currentMode = targetMode || mode;
    
    try {
      if (currentMode === 'encode') {
        const encoded = encodeToUtf8(inputText);
        setOutput(encoded);
      } else {
        const decoded = decodeFromUtf8(inputText);
        setOutput(decoded);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('utf8.errors.conversionFailed'));
      setOutput('');
    }
  }, [mode, encodeToUtf8, decodeFromUtf8, tool]);

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
      processConversion(output, newMode);
    } else {
      processConversion(input, newMode);
    }
  }, [mode, input, output, error, processConversion]);

  // Handle option changes
  const handleOptionChange = useCallback((option: keyof ConversionOptions, value?: boolean | Separator) => {
    setOptions(prev => ({
      ...prev,
      [option]: value !== undefined ? value : !prev[option]
    }));
  }, []);

  // Handle separator change
  const handleSeparatorChange = useCallback((separator: Separator) => {
    handleOptionChange('separator', separator);
  }, [handleOptionChange]);

  // Update output when options change (only for encoding)
  React.useEffect(() => {
    if (mode === 'encode') {
      processConversion(input);
    }
  }, [options, processConversion, input, mode]);

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

  // Handle clear action
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  return (
    <BaseTextConverter
      title={tool('utf8.title')}
      description={tool('utf8.description')}
      inputLabel={mode === 'encode' ? tool('utf8.labels.plainText') : tool('utf8.labels.utf8Bytes')}
      outputLabel={mode === 'encode' ? tool('utf8.labels.utf8Bytes') : tool('utf8.labels.plainText')}
      inputPlaceholder={mode === 'encode' ? tool('utf8.placeholders.encode') : tool('utf8.placeholders.decode')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName={mode === 'encode' ? 'utf8-encoded.txt' : 'utf8-decoded.txt'}
      onTextChange={handleInputChange}
      text={input}
      convertedText={output}
      onConvertedTextUpdate={setOutput}
      onFileUploaded={(content: string) => {
        setInput(content);
        processConversion(content);
      }}
      showAnalytics={false}
      useMonoFont={true}
      mobileLayout="2x2"
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
            {mode === 'encode' ? tool('utf8.modes.encode') : tool('utf8.modes.decode')}
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
              {tool('utf8.actions.clear')}
            </Button>
            
            <Button
              onClick={() => {
                const example = mode === 'encode' ? 'Hello 世界! 🌍' : '\\x48\\x65\\x6c\\x6c\\x6f\\x20\\xe4\\xb8\\x96\\xe7\\x95\\x8c\\x21\\x20\\xf0\\x9f\\x8c\\x8d';
                setInput(example);
                processConversion(example);
              }}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Zap className="h-3 w-3" />
              {tool('utf8.actions.example')}
            </Button>
          </div>
        </div>

        {/* UTF-8 Converter Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('utf8.accordion.title')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Encoding Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Binary className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('utf8.sections.encoding')}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Separator Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      {tool('utf8.options.separator')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['space', 'comma', 'none'] as Separator[]).map((separator) => (
                        <Button
                          key={separator}
                          variant={options.separator === separator ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSeparatorChange(separator)}
                          className="text-xs"
                        >
                          {tool(`utf8.options.separators.${separator}`)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* BOM and Uppercase Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow">
                      <label 
                        htmlFor="show-bom" 
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {tool('utf8.options.showBom')}
                      </label>
                      <Switch
                        id="show-bom"
                        checked={options.showBom}
                        onCheckedChange={() => handleOptionChange('showBom')}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow">
                      <label 
                        htmlFor="uppercase" 
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {tool('utf8.options.uppercase')}
                      </label>
                      <Switch
                        id="uppercase"
                        checked={options.uppercase}
                        onCheckedChange={() => handleOptionChange('uppercase')}
                      />
                    </div>
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

        {/* UTF-8 Converter Analytics */}
        <UTF8ConverterAnalytics 
          inputText={input}
          outputText={output}
          mode={mode}
          showBom={options.showBom}
          variant="compact"
          showTitle={false}
        />
      </div>
    </BaseTextConverter>
  );
}
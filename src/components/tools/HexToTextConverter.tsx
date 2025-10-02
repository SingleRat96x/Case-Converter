'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { ArrowRightLeft, XCircle } from 'lucide-react';
import { HexToTextAnalytics } from '@/components/shared/HexToTextAnalytics';
import { Accordion, AccordionItem } from '@/components/ui/accordion';

type ConversionMode = 'encode' | 'decode';

interface ConversionOptions {
  delimiter: 'space' | 'none' | 'colon';
  uppercase: boolean;
  prefix: boolean;
}

export function HexToTextConverter() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('encode');
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    delimiter: 'space',
    uppercase: false,
    prefix: false,
  });

  // Text to Hex encoding
  const encodeToHex = useCallback((text: string): string => {
    try {
      const hexArray = Array.from(text).map(char => {
        let hex = char.charCodeAt(0).toString(16);
        
        // Apply uppercase if enabled
        if (options.uppercase) {
          hex = hex.toUpperCase();
        }
        
        // Add prefix if enabled
        if (options.prefix) {
          hex = '0x' + hex;
        }
        
        // Pad to 2 digits if no prefix
        if (!options.prefix && hex.length === 1) {
          hex = '0' + hex;
        }
        
        return hex;
      });

      // Apply delimiter
      switch (options.delimiter) {
        case 'space':
          return hexArray.join(' ');
        case 'colon':
          return hexArray.join(':');
        case 'none':
          return hexArray.join('');
        default:
          return hexArray.join(' ');
      }
    } catch {
      throw new Error(tool('hex.errors.encodeFailed'));
    }
  }, [options, tool]);

  // Hex to Text decoding
  const decodeFromHex = useCallback((hex: string): string => {
    try {
      // Clean the input - remove prefixes and normalize
      const cleanHex = hex
        .replace(/0x/g, '') // Remove 0x prefixes
        .replace(/[^0-9a-fA-F\s:]/g, ''); // Remove non-hex characters except delimiters
      
      // Split based on delimiter
      let hexGroups: string[];
      
      if (cleanHex.includes(':')) {
        hexGroups = cleanHex.split(':').filter(group => group.length > 0);
      } else if (cleanHex.includes(' ')) {
        hexGroups = cleanHex.split(/\s+/).filter(group => group.length > 0);
      } else {
        // No delimiter, split by pairs
        const regex = /.{1,2}/g;
        hexGroups = cleanHex.match(regex) || [];
      }
      
      // Validate hex groups
      const invalidGroups = hexGroups.filter(group => !/^[0-9a-fA-F]+$/.test(group));
      if (invalidGroups.length > 0) {
        throw new Error(tool('hex.errors.invalidHex'));
      }
      
      // Convert to text
      const text = hexGroups.map(hexChar => {
        const charCode = parseInt(hexChar, 16);
        if (charCode === 0 || charCode > 1114111) { // Max Unicode code point
          throw new Error(tool('hex.errors.invalidCharCode'));
        }
        return String.fromCharCode(charCode);
      }).join('');
      
      return text;
    } catch (err) {
      if (err instanceof Error && err.message.includes(tool('hex.errors'))) {
        throw err;
      }
      throw new Error(tool('hex.errors.decodeFailed'));
    }
  }, [tool]);

  // Process conversion based on mode
  const processConversion = useCallback((inputText: string) => {
    setError(null);
    
    if (!inputText.trim()) {
      setOutput('');
      return;
    }
    
    try {
      if (mode === 'encode') {
        const encoded = encodeToHex(inputText);
        setOutput(encoded);
      } else {
        const decoded = decodeFromHex(inputText);
        setOutput(decoded);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('hex.errors.conversionFailed'));
      setOutput('');
    }
  }, [mode, encodeToHex, decodeFromHex, tool]);

  // Handle input change
  const handleInputChange = useCallback((newInput: string) => {
    setInput(newInput);
    processConversion(newInput);
  }, [processConversion]);

  // Handle mode switch
  const handleModeSwitch = useCallback(() => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    setInput(output);
    setOutput(input);
    setError(null);
  }, [mode, input, output]);

  // Handle option change
  const handleOptionChange = useCallback((key: keyof ConversionOptions, value: string | boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update output when options change
  React.useEffect(() => {
    processConversion(input);
  }, [options, processConversion, input]);


  return (
    <BaseTextConverter
      title={tool('hex.title')}
      description={tool('hex.description')}
      inputLabel={mode === 'encode' ? common('labels.inputText') : tool('hex.labels.hexCode')}
      outputLabel={mode === 'encode' ? tool('hex.labels.hexCode') : common('labels.outputText')}
      inputPlaceholder={mode === 'encode' ? tool('hex.placeholders.encode') : tool('hex.placeholders.decode')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={common('descriptions.uploadFile')}
      downloadFileName={mode === 'encode' ? 'encoded-hex.txt' : 'decoded-text.txt'}
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
      <div className="space-y-4">
        {/* Mode Switcher */}
        <div className="flex justify-center">
          <Button
            onClick={handleModeSwitch}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {mode === 'encode' ? tool('hex.modes.textToHex') : tool('hex.modes.hexToText')}
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('hex.options.title')}
          >
            <div className="space-y-4">
              {/* Delimiter Option */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  {tool('hex.options.delimiter')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['space', 'none', 'colon'] as const).map((delim) => (
                    <Button
                      key={delim}
                      variant={options.delimiter === delim ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleOptionChange('delimiter', delim)}
                      className="w-full"
                    >
                      {tool(`hex.options.delimiters.${delim}`)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Format Options (only for encoding) */}
              {mode === 'encode' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label
                      htmlFor="uppercase"
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {tool('hex.options.uppercase')}
                    </label>
                    <Switch
                      id="uppercase"
                      checked={options.uppercase}
                      onCheckedChange={(checked) => handleOptionChange('uppercase', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label
                      htmlFor="prefix"
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {tool('hex.options.prefix')}
                    </label>
                    <Switch
                      id="prefix"
                      checked={options.prefix}
                      onCheckedChange={(checked) => handleOptionChange('prefix', checked)}
                    />
                  </div>
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Hex to Text Analytics */}
        <HexToTextAnalytics 
          input={input}
          output={output}
          variant="compact"
          showTitle={false}
        />

      </div>
    </BaseTextConverter>
  );
}
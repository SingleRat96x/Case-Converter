'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { ArrowRightLeft, XCircle } from 'lucide-react';
import { BinaryCodeAnalytics } from '@/components/shared/BinaryCodeAnalytics';
import { Accordion, AccordionItem } from '@/components/ui/accordion';

type ConversionMode = 'encode' | 'decode';

interface ConversionOptions {
  delimiter: 'space' | 'none' | 'newline';
  padding: boolean;
  groupSize: number;
}

export function BinaryCodeTranslator() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('encode');
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    delimiter: 'space',
    padding: true,
    groupSize: 8,
  });

  // Text to Binary encoding
  const encodeToBinary = useCallback((text: string): string => {
    try {
      const binaryArray = Array.from(text).map(char => {
        let binary = char.charCodeAt(0).toString(2);
        
        // Apply padding if enabled
        if (options.padding) {
          binary = binary.padStart(options.groupSize, '0');
        }
        
        return binary;
      });

      // Apply delimiter
      switch (options.delimiter) {
        case 'space':
          return binaryArray.join(' ');
        case 'newline':
          return binaryArray.join('\n');
        case 'none':
          return binaryArray.join('');
        default:
          return binaryArray.join(' ');
      }
    } catch {
      throw new Error(tool('binary.errors.encodeFailed'));
    }
  }, [options, tool]);

  // Binary to Text decoding
  const decodeFromBinary = useCallback((binary: string): string => {
    try {
      // Clean the input - remove all non-binary characters except delimiters
      const cleanBinary = binary.replace(/[^01\s\n]/g, '');
      
      // Split based on delimiter or group size
      let binaryGroups: string[];
      
      if (options.delimiter === 'none' && cleanBinary.indexOf(' ') === -1 && cleanBinary.indexOf('\n') === -1) {
        // No delimiter and no spaces/newlines found, split by group size
        const regex = new RegExp(`.{1,${options.groupSize}}`, 'g');
        binaryGroups = cleanBinary.match(regex) || [];
      } else {
        // Split by whitespace (spaces or newlines)
        binaryGroups = cleanBinary.split(/\s+/).filter(group => group.length > 0);
      }
      
      // Validate binary groups
      const invalidGroups = binaryGroups.filter(group => !/^[01]+$/.test(group));
      if (invalidGroups.length > 0) {
        throw new Error(tool('binary.errors.invalidBinary'));
      }
      
      // Convert to text
      const text = binaryGroups.map(binaryChar => {
        const charCode = parseInt(binaryChar, 2);
        if (charCode === 0 || charCode > 1114111) { // Max Unicode code point
          throw new Error(tool('binary.errors.invalidCharCode'));
        }
        return String.fromCharCode(charCode);
      }).join('');
      
      return text;
    } catch (err) {
      if (err instanceof Error && err.message.includes(tool('binary.errors'))) {
        throw err;
      }
      throw new Error(tool('binary.errors.decodeFailed'));
    }
  }, [options.groupSize, options.delimiter, tool]);

  // Process conversion based on mode
  const processConversion = useCallback((inputText: string) => {
    setError(null);
    
    if (!inputText.trim()) {
      setOutput('');
      return;
    }
    
    try {
      if (mode === 'encode') {
        const encoded = encodeToBinary(inputText);
        setOutput(encoded);
      } else {
        const decoded = decodeFromBinary(inputText);
        setOutput(decoded);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('binary.errors.conversionFailed'));
      setOutput('');
    }
  }, [mode, encodeToBinary, decodeFromBinary, tool]);

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
  const handleOptionChange = useCallback((key: keyof ConversionOptions, value: string | boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update output when options change
  React.useEffect(() => {
    processConversion(input);
  }, [options, processConversion, input]);


  return (
    <BaseTextConverter
      title={tool('binary.title')}
      description={tool('binary.description')}
      inputLabel={mode === 'encode' ? common('labels.inputText') : tool('binary.labels.binaryCode')}
      outputLabel={mode === 'encode' ? tool('binary.labels.binaryCode') : common('labels.outputText')}
      inputPlaceholder={mode === 'encode' ? tool('binary.placeholders.encode') : tool('binary.placeholders.decode')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={common('descriptions.uploadFile')}
      downloadFileName={mode === 'encode' ? 'encoded-binary.txt' : 'decoded-text.txt'}
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
            {mode === 'encode' ? tool('binary.modes.textToBinary') : tool('binary.modes.binaryToText')}
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('binary.options.title')}
          >
            <div className="space-y-4">
              {/* Delimiter Option */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  {tool('binary.options.delimiter')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['space', 'none', 'newline'] as const).map((delim) => (
                    <Button
                      key={delim}
                      variant={options.delimiter === delim ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleOptionChange('delimiter', delim)}
                      className="w-full"
                    >
                      {tool(`binary.options.delimiters.${delim}`)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Group Size Option */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  {tool('binary.options.groupSize')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[8, 16].map((size) => (
                    <Button
                      key={size}
                      variant={options.groupSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleOptionChange('groupSize', size)}
                      className="w-full"
                    >
                      {size} {tool('binary.options.bitLabel')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Padding Option (only for encoding) */}
              {mode === 'encode' && (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                  <label
                    htmlFor="padding"
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {tool('binary.options.padding')}
                  </label>
                  <Switch
                    id="padding"
                    checked={options.padding}
                    onCheckedChange={(checked) => handleOptionChange('padding', checked)}
                  />
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

        {/* Binary Code Analytics */}
        <BinaryCodeAnalytics 
          input={input}
          output={output}
          variant="compact"
          showTitle={false}
        />

      </div>
    </BaseTextConverter>
  );
}

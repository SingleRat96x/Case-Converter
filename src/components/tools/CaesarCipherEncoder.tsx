'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { CaesarCipherAnalytics } from '@/components/shared/CaesarCipherAnalytics';
import { InteractiveSlider } from '@/components/shared/InteractiveSlider';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { ArrowRightLeft, XCircle, RotateCcw, Shuffle, Key, Lock } from 'lucide-react';

type ConversionMode = 'encode' | 'decode';

interface ConversionOptions {
  shift: number;
  preserveCase: boolean;
  preserveNumbers: boolean;
  preserveSymbols: boolean;
}

export function CaesarCipherEncoder() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('encode');
  const [error, setError] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [options, setOptions] = useState<ConversionOptions>({
    shift: 3,
    preserveCase: true,
    preserveNumbers: true,
    preserveSymbols: true,
  });

  // Caesar cipher encoding
  const encodeCaesar = useCallback((text: string): string => {
    try {
      return Array.from(text).map(char => {
        // Preserve numbers if option is enabled
        if (options.preserveNumbers && /\d/.test(char)) {
          return char;
        }
        
        // Preserve symbols/punctuation if option is enabled
        if (options.preserveSymbols && !/[a-zA-Z]/.test(char)) {
          return char;
        }
        
        // Only process alphabetic characters
        if (!/[a-zA-Z]/.test(char)) {
          return char;
        }
        
        const isUpperCase = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0) - 65;
        const shiftedCode = (charCode + options.shift) % 26;
        const newChar = String.fromCharCode(shiftedCode + 65);
        
        // Preserve original case if option is enabled
        if (options.preserveCase) {
          return isUpperCase ? newChar : newChar.toLowerCase();
        } else {
          return newChar.toLowerCase();
        }
      }).join('');
    } catch {
      throw new Error(tool('caesar.errors.encodeFailed'));
    }
  }, [options, tool]);

  // Caesar cipher decoding
  const decodeCaesar = useCallback((text: string): string => {
    try {
      return Array.from(text).map(char => {
        // Preserve numbers if option is enabled
        if (options.preserveNumbers && /\d/.test(char)) {
          return char;
        }
        
        // Preserve symbols/punctuation if option is enabled
        if (options.preserveSymbols && !/[a-zA-Z]/.test(char)) {
          return char;
        }
        
        // Only process alphabetic characters
        if (!/[a-zA-Z]/.test(char)) {
          return char;
        }
        
        const isUpperCase = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0) - 65;
        const shiftedCode = (charCode - options.shift + 26) % 26;
        const newChar = String.fromCharCode(shiftedCode + 65);
        
        // Preserve original case if option is enabled
        if (options.preserveCase) {
          return isUpperCase ? newChar : newChar.toLowerCase();
        } else {
          return newChar.toLowerCase();
        }
      }).join('');
    } catch {
      throw new Error(tool('caesar.errors.decodeFailed'));
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
        const encoded = encodeCaesar(inputText);
        setOutput(encoded);
      } else {
        const decoded = decodeCaesar(inputText);
        setOutput(decoded);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('caesar.errors.conversionFailed'));
      setOutput('');
    }
  }, [mode, encodeCaesar, decodeCaesar, tool]);

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
  const handleOptionChange = useCallback((key: keyof ConversionOptions, value: number | boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Generate random shift
  const generateRandomShift = useCallback(() => {
    const randomShift = Math.floor(Math.random() * 25) + 1; // 1-25
    handleOptionChange('shift', randomShift);
  }, [handleOptionChange]);

  // Reset to classic Caesar (shift 3)
  const resetToClassic = useCallback(() => {
    setOptions({
      shift: 3,
      preserveCase: true,
      preserveNumbers: true,
      preserveSymbols: true,
    });
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

  // Calculate letter frequency for analysis
  const getLetterFrequency = useCallback((text: string) => {
    const frequency: Record<string, number> = {};
    const letters = text.replace(/[^a-zA-Z]/g, '').toUpperCase();
    
    for (const char of letters) {
      frequency[char] = (frequency[char] || 0) + 1;
    }
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Top 5 most frequent letters
  }, []);

  return (
    <BaseTextConverter
      title={tool('caesar.title')}
      description={tool('caesar.description')}
      inputLabel={mode === 'encode' ? common('labels.inputText') : tool('caesar.labels.cipherText')}
      outputLabel={mode === 'encode' ? tool('caesar.labels.cipherText') : common('labels.outputText')}
      inputPlaceholder={mode === 'encode' ? tool('caesar.placeholders.encode') : tool('caesar.placeholders.decode')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName={mode === 'encode' ? 'caesar-encrypted.txt' : 'caesar-decrypted.txt'}
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
        {/* Mode Switcher with Quick Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={handleModeSwitch}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {mode === 'encode' ? tool('caesar.modes.encode') : tool('caesar.modes.decode')}
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
          
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={generateRandomShift}
              variant="outline"
              size="sm"
              className="gap-1"
              title={tool('caesar.actions.randomShift')}
            >
              <Shuffle className="h-3 w-3" />
              {tool('caesar.actions.random')}
            </Button>
            
            <Button
              onClick={resetToClassic}
              variant="outline"
              size="sm"
              className="gap-1"
              title={tool('caesar.actions.resetClassic')}
            >
              <RotateCcw className="h-3 w-3" />
              ROT3
            </Button>
          </div>
        </div>

        {/* Caesar Cipher Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('caesar.accordion.title')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Cipher Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Key className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('caesar.sections.cipher')}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Shift Value Slider */}
                  <InteractiveSlider
                    value={options.shift}
                    min={1}
                    max={25}
                    step={1}
                    label={`${tool('caesar.options.shift')}: ${options.shift} (A → ${String.fromCharCode(65 + (options.shift % 26))})`}
                    onChange={(value) => handleOptionChange('shift', value)}
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 (ROT1)</span>
                    <span>13 (ROT13)</span>
                    <span>25 (ROT25)</span>
                  </div>
                </div>
              </div>

              {/* Preservation Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Lock className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('caesar.sections.preservation')}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="preserve-case" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('caesar.options.preserveCase')}
                    </label>
                    <Switch
                      id="preserve-case"
                      checked={options.preserveCase}
                      onCheckedChange={(checked) => handleOptionChange('preserveCase', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="preserve-numbers" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('caesar.options.preserveNumbers')}
                    </label>
                    <Switch
                      id="preserve-numbers"
                      checked={options.preserveNumbers}
                      onCheckedChange={(checked) => handleOptionChange('preserveNumbers', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="preserve-symbols" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('caesar.options.preserveSymbols')}
                    </label>
                    <Switch
                      id="preserve-symbols"
                      checked={options.preserveSymbols}
                      onCheckedChange={(checked) => handleOptionChange('preserveSymbols', checked)}
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

        {/* Caesar Cipher Analytics */}
        <CaesarCipherAnalytics 
          inputText={input}
          outputText={output}
          mode={mode}
          shift={options.shift}
          variant="compact"
          showTitle={false}
        />

        {/* Letter Frequency Analysis (for decode mode) */}
        {mode === 'decode' && input && input.replace(/[^a-zA-Z]/g, '').length > 10 && (
          <div className="space-y-2 p-2 bg-muted/50 rounded-md border border-border">
            <h4 className="text-xs font-medium text-muted-foreground">{tool('caesar.analysis.frequencyTitle')}</h4>
            <div className="flex flex-wrap gap-1">
              {getLetterFrequency(input).map(([letter, count]) => (
                <span key={letter} className="px-2 py-1 bg-card border rounded text-xs font-mono">
                  {letter}: {count}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground opacity-75">{tool('caesar.analysis.frequencyHint')}</p>
          </div>
        )}

      </div>
    </BaseTextConverter>
  );
}
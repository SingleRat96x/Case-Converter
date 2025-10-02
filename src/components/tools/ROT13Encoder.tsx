'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { ROT13Analytics } from '@/components/shared/ROT13Analytics';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { ArrowUpDown, XCircle, RefreshCw, Zap, Copy, RotateCcw, Lock } from 'lucide-react';

interface ConversionOptions {
  preserveCase: boolean;
  preserveNumbers: boolean;
  preserveSymbols: boolean;
  doubleEncode: boolean;
}

export function ROT13Encoder() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [options, setOptions] = useState<ConversionOptions>({
    preserveCase: true,
    preserveNumbers: true,
    preserveSymbols: true,
    doubleEncode: false,
  });

  // ROT13 transformation (symmetric operation)
  const transformROT13 = useCallback((text: string, applyDouble: boolean = false): string => {
    try {
      let result = text;
      
      // Apply ROT13 once or twice based on option
      const iterations = applyDouble ? 2 : 1;
      
      for (let i = 0; i < iterations; i++) {
        result = Array.from(result).map(char => {
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
          const shiftedCode = (charCode + 13) % 26;
          const newChar = String.fromCharCode(shiftedCode + 65);
          
          // Preserve original case if option is enabled
          if (options.preserveCase) {
            return isUpperCase ? newChar : newChar.toLowerCase();
          } else {
            return newChar.toLowerCase();
          }
        }).join('');
      }
      
      return result;
    } catch {
      throw new Error(tool('rot13.errors.transformFailed'));
    }
  }, [options, tool]);

  // Process transformation
  const processTransformation = useCallback((inputText: string) => {
    setError(null);
    
    if (!inputText.trim()) {
      setOutput('');
      return;
    }
    
    try {
      const transformed = transformROT13(inputText, options.doubleEncode);
      setOutput(transformed);
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('rot13.errors.transformFailed'));
      setOutput('');
    }
  }, [transformROT13, options.doubleEncode, tool]);

  // Handle input change
  const handleInputChange = useCallback((newInput: string) => {
    setInput(newInput);
    processTransformation(newInput);
  }, [processTransformation]);

  // Swap input and output (since ROT13 is symmetric)
  const handleSwap = useCallback(() => {
    const temp = input;
    setInput(output);
    setOutput(temp);
  }, [input, output]);

  // Handle option change
  const handleOptionChange = useCallback((key: keyof ConversionOptions, value: boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Apply example transformations
  const applyExample = useCallback((exampleText: string) => {
    setInput(exampleText);
    processTransformation(exampleText);
  }, [processTransformation]);

  // Clear all fields
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  // Update output when options change
  React.useEffect(() => {
    processTransformation(input);
  }, [options, processTransformation, input]);

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

  // Generate alphabet demonstration
  const getAlphabetDemo = useCallback(() => {
    const original = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const transformed = transformROT13(original, false);
    return { original, transformed };
  }, [transformROT13]);

  const alphabetDemo = getAlphabetDemo();

  return (
    <BaseTextConverter
      title={tool('rot13.title')}
      description={tool('rot13.description')}
      inputLabel={tool('rot13.labels.inputText')}
      outputLabel={tool('rot13.labels.outputText')}
      inputPlaceholder={tool('rot13.placeholders.input')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName="rot13-transformed.txt"
      onTextChange={handleInputChange}
      text={input}
      convertedText={output}
      onConvertedTextUpdate={setOutput}
      onFileUploaded={(content: string) => {
        setInput(content);
        processTransformation(content);
      }}
      showAnalytics={false}
      mobileLayout="2x2"
      useMonoFont={true}
    >
      <div className="space-y-3">
        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={handleSwap}
            variant="outline"
            size="lg"
            className="gap-2"
            disabled={!input && !output}
          >
            {tool('rot13.actions.swap')}
            <ArrowUpDown className="h-4 w-4" />
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
              {tool('rot13.actions.clear')}
            </Button>
            
            <Button
              onClick={() => applyExample('Hello World!')}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Zap className="h-3 w-3" />
              {tool('rot13.actions.example')}
            </Button>
          </div>
        </div>

        {/* ROT13 Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('rot13.accordion.title')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Transformation Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('rot13.sections.transformation')}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Alphabet Demonstration */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {tool('rot13.demo.alphabetTitle')}
                    </label>
                    <div className="space-y-1 p-3 bg-card border border-border rounded-lg font-mono text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">A-Z:</span>
                        <Button
                          onClick={() => navigator.clipboard?.writeText(alphabetDemo.original)}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-foreground break-all">{alphabetDemo.original}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">ROT13:</span>
                        <Button
                          onClick={() => navigator.clipboard?.writeText(alphabetDemo.transformed)}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-foreground break-all">{alphabetDemo.transformed}</div>
                    </div>
                  </div>

                  {/* Double Encoding Option */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="double-encode" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('rot13.options.doubleEncode')}
                    </label>
                    <Switch
                      id="double-encode"
                      checked={options.doubleEncode}
                      onCheckedChange={(checked) => handleOptionChange('doubleEncode', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Preservation Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Lock className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('rot13.sections.preservation')}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="preserve-case" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('rot13.options.preserveCase')}
                    </label>
                    <Switch
                      id="preserve-case"
                      checked={options.preserveCase}
                      onCheckedChange={(checked) => handleOptionChange('preserveCase', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="preserve-numbers" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('rot13.options.preserveNumbers')}
                    </label>
                    <Switch
                      id="preserve-numbers"
                      checked={options.preserveNumbers}
                      onCheckedChange={(checked) => handleOptionChange('preserveNumbers', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="preserve-symbols" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('rot13.options.preserveSymbols')}
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

        {/* ROT13 Analytics */}
        <ROT13Analytics 
          inputText={input}
          doubleEncode={options.doubleEncode}
          variant="compact"
          showTitle={false}
        />

      </div>
    </BaseTextConverter>
  );
}
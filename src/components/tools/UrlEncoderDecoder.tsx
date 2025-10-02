'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { URLConverterAnalytics } from '@/components/shared/URLConverterAnalytics';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { ArrowRightLeft, XCircle, RefreshCw, Zap, Link2 } from 'lucide-react';

type ConversionMode = 'encode' | 'decode';
type EncodingType = 'component' | 'uri' | 'form';

interface ConversionOptions {
  encodingType: EncodingType;
}

export function UrlEncoderDecoder() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('encode');
  const [error, setError] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [options, setOptions] = useState<ConversionOptions>({
    encodingType: 'component',
  });

  // URL encoding function
  const encodeUrl = useCallback((text: string): string => {
    try {
      let encoded: string;
      
      switch (options.encodingType) {
        case 'component':
          encoded = encodeURIComponent(text);
          break;
        case 'uri':
          encoded = encodeURI(text);
          break;
        case 'form':
          // Form data encoding: space becomes +, then URI component encoding
          encoded = encodeURIComponent(text).replace(/%20/g, '+');
          break;
        default:
          encoded = encodeURIComponent(text);
      }
      
      return encoded;
    } catch {
      throw new Error(tool('url.errors.encodeFailed'));
    }
  }, [options, tool]);

  // URL decoding function
  const decodeUrl = useCallback((text: string): string => {
    try {
      const cleanInput = text.trim();
      
      // Handle form data encoding (+ to space, then decode)
      if (options.encodingType === 'form') {
        const formDecoded = cleanInput.replace(/\+/g, ' ');
        return decodeURIComponent(formDecoded);
      }
      
      // Standard URI decoding
      return decodeURIComponent(cleanInput);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('malformed') || err.message.includes('invalid')) {
          throw new Error(tool('url.errors.malformedUri'));
        }
      }
      throw new Error(tool('url.errors.decodeFailed'));
    }
  }, [options, tool]);

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
        const encoded = encodeUrl(inputText);
        setOutput(encoded);
      } else {
        const decoded = decodeUrl(inputText);
        setOutput(decoded);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('url.errors.conversionFailed'));
      setOutput('');
    }
  }, [mode, encodeUrl, decodeUrl, tool]);

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
  const handleOptionChange = useCallback((option: keyof ConversionOptions, value?: EncodingType) => {
    setOptions(prev => ({
      ...prev,
      [option]: value !== undefined ? value : prev[option]
    }));
  }, []);

  // Handle encoding type change
  const handleEncodingTypeChange = useCallback((type: EncodingType) => {
    handleOptionChange('encodingType', type);
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
      title={tool('url.title')}
      description={tool('url.description')}
      inputLabel={mode === 'encode' ? tool('url.labels.plainText') : tool('url.labels.encodedUrl')}
      outputLabel={mode === 'encode' ? tool('url.labels.encodedUrl') : tool('url.labels.plainText')}
      inputPlaceholder={mode === 'encode' ? tool('url.placeholders.encode') : tool('url.placeholders.decode')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName={mode === 'encode' ? 'url-encoded.txt' : 'url-decoded.txt'}
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
            {mode === 'encode' ? tool('url.modes.encode') : tool('url.modes.decode')}
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
              {tool('url.actions.clear')}
            </Button>
            
            <Button
              onClick={() => {
                const example = mode === 'encode' ? 'Hello World! & Special Characters' : 'Hello%20World%21%20%26%20Special%20Characters';
                setInput(example);
                processConversion(example);
              }}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Zap className="h-3 w-3" />
              {tool('url.actions.example')}
            </Button>
          </div>
        </div>

        {/* URL Converter Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('url.accordion.title')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Encoding Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Link2 className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('url.sections.encoding')}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Encoding Type Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      {tool('url.options.encodeType')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['component', 'uri', 'form'] as EncodingType[]).map((type) => (
                        <Button
                          key={type}
                          variant={options.encodingType === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleEncodingTypeChange(type)}
                          className="text-xs justify-start"
                        >
                          {tool(`url.options.types.${type}`)}
                        </Button>
                      ))}
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

        {/* URL Converter Analytics */}
        <URLConverterAnalytics 
          inputText={input}
          outputText={output}
          mode={mode}
          variant="compact"
          showTitle={false}
        />
      </div>
    </BaseTextConverter>
  );
}
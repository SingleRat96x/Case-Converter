'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { ArrowRightLeft, XCircle, Info, Hash, FileText, Globe } from 'lucide-react';
import { DataStats, type DataStat } from '@/components/shared/DataStats';
import { ToolOptionsAccordion, ExampleChips } from '@/components/shared/ToolOptionsAccordion';
import { ActionButtons } from '@/components/shared/ActionButtons';

type ConversionMode = 'encode' | 'decode';
type EncodingType = 'component' | 'uri' | 'form';

interface ConversionOptions {
  encodingType: EncodingType;
}

export function UrlConverter() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('encode');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
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

  // Calculate statistics
  const statistics = useMemo((): DataStat[] => {
    const inputLength = input.length;
    const outputLength = output.length;
    const encodedChars = mode === 'encode' ? (output.match(/%[0-9A-Fa-f]{2}|\+/g) || []).length : 0;
    const compressionRatio = inputLength > 0 ? ((outputLength / inputLength) * 100) : 0;
    
    return [
      {
        key: 'inputLength',
        label: tool('url.stats.inputLength'),
        value: inputLength,
        icon: FileText,
        color: 'text-blue-600 dark:text-blue-400',
        suffix: 'chars'
      },
      {
        key: 'outputLength',
        label: tool('url.stats.outputLength'),
        value: outputLength,
        icon: Globe,
        color: 'text-green-600 dark:text-green-400',
        suffix: 'chars'
      },
      {
        key: 'encodedChars',
        label: tool('url.stats.encodedChars'),
        value: encodedChars,
        icon: Hash,
        color: 'text-purple-600 dark:text-purple-400',
        suffix: ''
      },
      {
        key: 'compressionRatio',
        label: 'Size Ratio',
        value: `${compressionRatio.toFixed(1)}%`,
        icon: ArrowRightLeft,
        color: 'text-orange-600 dark:text-orange-400',
        suffix: ''
      }
    ];
  }, [input, output, mode, tool]);

  // Examples for quick testing (mobile-first)
  const topExamples = useMemo(() => [
    { label: 'Basic', value: 'Hello World!', description: 'Simple text with space' },
    { label: 'Special', value: 'name=John&age=25', description: 'Query parameters' },
    { label: 'Unicode', value: 'café & résumé', description: 'Accented characters' },
  ], []);

  // Handle clear action
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  // Handle example selection
  const handleExampleSelect = useCallback((value: string) => {
    handleInputChange(value);
  }, [handleInputChange]);

  // Action button handlers
  const handleCopy = async () => {
    if (!output) return false;
    try {
      await navigator.clipboard.writeText(output);
      return true;
    } catch {
      return false;
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'encode' ? 'url-encoded.txt' : 'url-decoded.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        handleInputChange(content);
      }
      setIsUploading(false);
    };
    reader.onerror = () => setIsUploading(false);
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <BaseTextConverter
      title={tool('url.title')}
      description={tool('url.description')}
      inputLabel={mode === 'encode' ? tool('url.labels.plainText') : tool('url.labels.encodedUrl')}
      outputLabel={mode === 'encode' ? tool('url.labels.encodedUrl') : tool('url.labels.plainText')}
      inputPlaceholder={mode === 'encode' ? tool('url.placeholders.encode') : tool('url.placeholders.decode')}
      copyText=""
      clearText=""
      downloadText=""
      uploadText=""
      uploadDescription=""
      downloadFileName={mode === 'encode' ? 'url-encoded.txt' : 'url-decoded.txt'}
      onTextChange={handleInputChange}
      text={input}
      convertedText={output}
      onConvertedTextUpdate={setOutput}
      showAnalytics={false}
      useMonoFont={true}
      actionButtonsPosition="after-children"
    >
      <div className="space-y-3">
        {/* Example chips */}
        <ExampleChips 
          examples={topExamples}
          onExampleSelect={handleExampleSelect}
        />

        {/* Mode Switch Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleModeSwitch}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {mode === 'encode' ? tool('url.modes.encode') : tool('url.modes.decode')}
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <ActionButtons
          onCopy={handleCopy}
          onClear={handleClear}
          onDownload={handleDownload}
          onUpload={triggerFileUpload}
          copyText={common('buttons.copy')}
          clearText={common('buttons.clear')}
          downloadText={common('buttons.download')}
          uploadText={common('buttons.upload')}
          isUploading={isUploading}
          hasContent={!!output}
        />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.js,.ts,.jsx,.tsx,.json,.css,.html"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Advanced Options (only for encoding) */}
        {mode === 'encode' && (
          <ToolOptionsAccordion
            title="Advanced Options"
            defaultOpen={false}
          >
            <div className="space-y-3">
              {/* Encoding Type Selection */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  {tool('url.options.encodeType')}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(['component', 'uri', 'form'] as EncodingType[]).map((type) => (
                    <Button
                      key={type}
                      variant={options.encodingType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleEncodingTypeChange(type)}
                      className="w-full text-xs justify-start"
                    >
                      {tool(`url.options.types.${type}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ToolOptionsAccordion>
        )}

        {/* Status Messages */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p>{tool('url.info.description')}</p>
            {mode === 'encode' && (
              <p className="text-xs">{tool('url.info.encodingNote')}</p>
            )}
            {mode === 'decode' && (
              <p className="text-xs">{tool('url.info.decodingNote')}</p>
            )}
          </div>
        </div>

        {/* Statistics */}
        <DataStats 
          stats={statistics} 
          variant="compact"
          showIcons={true}
        />
      </div>
    </BaseTextConverter>
  );
}
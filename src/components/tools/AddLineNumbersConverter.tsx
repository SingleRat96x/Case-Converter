'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LineNumberOptions } from './LineNumberOptions';
import { addLineNumbers, type LineNumberOptions as LineNumberOptionsType } from '@/lib/textTransforms';
import { Clipboard, Download, RotateCcw } from 'lucide-react';

export function AddLineNumbersConverter() {
  const { common, tool } = useToolTranslations('tools/text-modifiers');
  const [text, setText] = useState('');
  const [hasProcessed, setHasProcessed] = useState(false);
  const [options, setOptions] = useState<LineNumberOptionsType>({
    startAt: 1,
    step: 1,
    format: 'numeric',
    separator: '. ',
    applyTo: 'all',
    skipLinesStartingWith: ''
  });

  const handleAddLineNumbers = () => {
    if (text.trim()) {
      const result = addLineNumbers(text, options);
      setText(result);
      setHasProcessed(true);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'numbered-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setText('');
    setHasProcessed(false);
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;

  return (
    <div className="space-y-6">
      {/* Main Text Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-input" className="text-base font-semibold">
            {hasProcessed ? tool('addLineNumbers.outputLabel') : tool('addLineNumbers.inputLabel')}
          </Label>
          <div className="text-xs text-muted-foreground space-x-4">
            <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
            <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            <span>{charCount} {charCount === 1 ? 'char' : 'chars'}</span>
          </div>
        </div>
        
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setHasProcessed(false);
          }}
          placeholder={tool('addLineNumbers.inputPlaceholder')}
          className="w-full min-h-[300px] p-4 bg-background border border-border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm leading-relaxed"
        />
        
        <p className="text-xs text-muted-foreground">
          {tool('addLineNumbers.helperText')}
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleAddLineNumbers}
          disabled={!text.trim() || hasProcessed}
          size="lg"
          className="flex-1 text-base font-semibold h-12"
        >
          <span className="mr-2">🔢</span>
          {tool('addLineNumbers.addButton')}
        </Button>
        
        {hasProcessed && (
          <>
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="lg"
              className="flex-1 sm:flex-none"
            >
              <Clipboard className="w-4 h-4 mr-2" />
              {common('buttons.copy')}
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="secondary"
              size="lg"
              className="flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4 mr-2" />
              {common('buttons.download')}
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="flex-1 sm:flex-none"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </>
        )}
      </div>

      {/* Options - Only show before processing */}
      {!hasProcessed && (
        <div className="pt-4 border-t">
          <LineNumberOptions 
            options={options} 
            onOptionsChange={setOptions}
            translations={{
              startAt: tool('addLineNumbers.options.startAt'),
              step: tool('addLineNumbers.options.step'),
              format: tool('addLineNumbers.options.format'),
              separator: tool('addLineNumbers.options.separator'),
              applyTo: tool('addLineNumbers.options.applyTo'),
              skipLinesStartingWith: tool('addLineNumbers.options.skipLinesStartingWith'),
              formats: {
                numeric: tool('addLineNumbers.formats.numeric'),
                padded2: tool('addLineNumbers.formats.padded2'),
                padded3: tool('addLineNumbers.formats.padded3'),
                alphaUpper: tool('addLineNumbers.formats.alphaUpper'),
                alphaLower: tool('addLineNumbers.formats.alphaLower'),
                romanUpper: tool('addLineNumbers.formats.romanUpper'),
                romanLower: tool('addLineNumbers.formats.romanLower')
              },
              separators: {
                periodSpace: tool('addLineNumbers.separators.periodSpace'),
                parenSpace: tool('addLineNumbers.separators.parenSpace'),
                colonSpace: tool('addLineNumbers.separators.colonSpace'),
                hyphenSpace: tool('addLineNumbers.separators.hyphenSpace'),
                pipe: tool('addLineNumbers.separators.pipe'),
                tab: tool('addLineNumbers.separators.tab')
              },
              applyToOptions: {
                all: tool('addLineNumbers.applyToOptions.all'),
                nonEmpty: tool('addLineNumbers.applyToOptions.nonEmpty')
              }
            }}
          />
        </div>
      )}

      {/* Processing message when button is clicked */}
      {hasProcessed && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✅ Line numbers added successfully! You can now copy or download the result.
          </p>
        </div>
      )}
    </div>
  );
}

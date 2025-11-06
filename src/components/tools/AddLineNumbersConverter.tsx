'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LineNumberOptions } from './LineNumberOptions';
import { addLineNumbers, type LineNumberOptions as LineNumberOptionsType } from '@/lib/textTransforms';
import { Clipboard, Download, RotateCcw, ListOrdered, Check } from 'lucide-react';

export function AddLineNumbersConverter() {
  const { common, tool } = useToolTranslations('tools/text-modifiers');
  const [text, setText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [buttonState, setButtonState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [hasProcessed, setHasProcessed] = useState(false);
  const [options, setOptions] = useState<LineNumberOptionsType>({
    startAt: 1,
    step: 1,
    format: 'numeric',
    separator: '. ',
    applyTo: 'all',
    skipLinesStartingWith: ''
  });
  const [lastAppliedOptions, setLastAppliedOptions] = useState<LineNumberOptionsType | null>(null);

  // Track if options have changed since last application
  const optionsChanged = lastAppliedOptions !== null && 
    JSON.stringify(options) !== JSON.stringify(lastAppliedOptions);

  const handleAddLineNumbers = () => {
    if (text.trim()) {
      setButtonState('processing');
      
      // If this is first time, save original text
      if (!hasProcessed) {
        setOriginalText(text);
      }
      
      // Use original text if we're reapplying, otherwise use current text
      const textToProcess = hasProcessed && originalText ? originalText : text;
      const result = addLineNumbers(textToProcess, options);
      
      setText(result);
      setLastAppliedOptions({ ...options });
      setHasProcessed(true);
      
      // Show success state briefly
      setTimeout(() => {
        setButtonState('success');
        setTimeout(() => {
          setButtonState('idle');
        }, 1500);
      }, 200);
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
    setOriginalText('');
    setHasProcessed(false);
    setLastAppliedOptions(null);
    setButtonState('idle');
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    // If user manually edits numbered text, reset the state
    if (hasProcessed) {
      setHasProcessed(false);
      setOriginalText('');
      setLastAppliedOptions(null);
    }
  };

  const handleOptionsChange = (newOptions: LineNumberOptionsType) => {
    setOptions(newOptions);
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;

  // Determine button content based on state
  const getButtonContent = () => {
    if (buttonState === 'processing') {
      return (
        <>
          <ListOrdered className="w-4 h-4 mr-2 animate-pulse" />
          Processing...
        </>
      );
    }
    if (buttonState === 'success') {
      return (
        <>
          <Check className="w-4 h-4 mr-2" />
          Applied!
        </>
      );
    }
    if (hasProcessed && optionsChanged) {
      return (
        <>
          <ListOrdered className="w-4 h-4 mr-2" />
          Re-apply Line Numbers
        </>
      );
    }
    return (
      <>
        <ListOrdered className="w-4 h-4 mr-2" />
        {tool('addLineNumbers.addButton')}
      </>
    );
  };

  return (
    <div className="space-y-8">
      {/* H1 and H2 Description */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {tool('addLineNumbers.title')}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          {tool('addLineNumbers.description')}
        </p>
      </div>

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
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={tool('addLineNumbers.inputPlaceholder')}
          className="w-full min-h-[300px] p-4 bg-background border border-border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm leading-relaxed"
        />
        
        <p className="text-xs text-muted-foreground">
          {tool('addLineNumbers.helperText')}
        </p>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleAddLineNumbers}
          disabled={!text.trim() || buttonState === 'processing'}
          size="default"
          className="w-full sm:flex-1"
        >
          {getButtonContent()}
        </Button>
        
        {hasProcessed && (
          <>
            <div className="flex gap-3 sm:contents">
              <Button
                onClick={handleCopy}
                variant="secondary"
                size="default"
                className="flex-1 sm:flex-none"
              >
                <Clipboard className="w-4 h-4 mr-2" />
                {common('buttons.copy')}
              </Button>
              
              <Button
                onClick={handleDownload}
                variant="secondary"
                size="default"
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                {common('buttons.download')}
              </Button>
            </div>
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="default"
              className="w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </>
        )}
      </div>

      {/* Options - Always visible */}
      <div className="pt-4 border-t">
        <LineNumberOptions 
          options={options} 
          onOptionsChange={handleOptionsChange}
          translations={{
            title: tool('addLineNumbers.options.title'),
            tabBasic: tool('addLineNumbers.options.tabBasic'),
            tabFormat: tool('addLineNumbers.options.tabFormat'),
            tabSeparator: tool('addLineNumbers.options.tabSeparator'),
            startAt: tool('addLineNumbers.options.startAt'),
            step: tool('addLineNumbers.options.step'),
            format: tool('addLineNumbers.options.format'),
            separator: tool('addLineNumbers.options.separator'),
            applyTo: tool('addLineNumbers.options.applyTo'),
            skipLinesStartingWith: tool('addLineNumbers.options.skipLinesStartingWith'),
            nonEmptyLabel: tool('addLineNumbers.options.nonEmptyLabel'),
            nonEmptyDescription: tool('addLineNumbers.options.nonEmptyDescription'),
            skipPatternsPlaceholder: tool('addLineNumbers.options.skipPatternsPlaceholder'),
            skipPatternsDescription: tool('addLineNumbers.options.skipPatternsDescription'),
            formats: {
              numeric: tool('addLineNumbers.formats.numeric'),
              padded2: tool('addLineNumbers.formats.padded2'),
              padded3: tool('addLineNumbers.formats.padded3'),
              alphaUpper: tool('addLineNumbers.formats.alphaUpper'),
              alphaLower: tool('addLineNumbers.formats.alphaLower'),
              romanUpper: tool('addLineNumbers.formats.romanUpper'),
              romanLower: tool('addLineNumbers.formats.romanLower')
            },
            formatLabels: {
              standard: tool('addLineNumbers.formatLabels.standard'),
              twoDigit: tool('addLineNumbers.formatLabels.twoDigit'),
              threeDigit: tool('addLineNumbers.formatLabels.threeDigit'),
              uppercase: tool('addLineNumbers.formatLabels.uppercase'),
              lowercase: tool('addLineNumbers.formatLabels.lowercase')
            },
            separators: {
              periodSpace: tool('addLineNumbers.separators.periodSpace'),
              parenSpace: tool('addLineNumbers.separators.parenSpace'),
              colonSpace: tool('addLineNumbers.separators.colonSpace'),
              hyphenSpace: tool('addLineNumbers.separators.hyphenSpace'),
              pipe: tool('addLineNumbers.separators.pipe'),
              tab: tool('addLineNumbers.separators.tab')
            },
            separatorLabels: {
              period: tool('addLineNumbers.separatorLabels.period'),
              paren: tool('addLineNumbers.separatorLabels.paren'),
              colon: tool('addLineNumbers.separatorLabels.colon'),
              hyphen: tool('addLineNumbers.separatorLabels.hyphen'),
              pipe: tool('addLineNumbers.separatorLabels.pipe'),
              tab: tool('addLineNumbers.separatorLabels.tab')
            },
            applyToOptions: {
              all: tool('addLineNumbers.applyToOptions.all'),
              nonEmpty: tool('addLineNumbers.applyToOptions.nonEmpty')
            }
          }}
        />
      </div>

      {/* Success message when processing is complete */}
      {hasProcessed && buttonState === 'idle' && !optionsChanged && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✅ Line numbers added successfully! You can now copy or download the result.
          </p>
        </div>
      )}

      {/* Options changed notification */}
      {optionsChanged && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            ℹ️ You&apos;ve changed the numbering options. Click &quot;Re-apply Line Numbers&quot; to see the changes.
          </p>
        </div>
      )}
    </div>
  );
}

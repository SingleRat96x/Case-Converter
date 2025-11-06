'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PrefixSuffixOptions } from './PrefixSuffixOptions';
import { addPrefixSuffix, type PrefixSuffixOptions as PrefixSuffixOptionsType } from '@/lib/textTransforms';
import { Clipboard, Download, RotateCcw, WrapText, Check } from 'lucide-react';

export function AddPrefixSuffixConverter() {
  const { common, tool } = useToolTranslations('tools/text-modifiers');
  const [text, setText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [buttonState, setButtonState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [hasProcessed, setHasProcessed] = useState(false);
  const [options, setOptions] = useState<PrefixSuffixOptionsType>({
    prefix: '',
    suffix: '',
    ignoreEmpty: true
  });
  const [lastAppliedOptions, setLastAppliedOptions] = useState<PrefixSuffixOptionsType | null>(null);

  // Track if options have changed since last application
  const optionsChanged = lastAppliedOptions !== null && 
    JSON.stringify(options) !== JSON.stringify(lastAppliedOptions);

  const handleApplyPrefixSuffix = () => {
    if (text.trim()) {
      setButtonState('processing');
      
      // If this is first time, save original text
      if (!hasProcessed) {
        setOriginalText(text);
      }
      
      // Use original text if we're reapplying, otherwise use current text
      const textToProcess = hasProcessed && originalText ? originalText : text;
      const result = addPrefixSuffix(textToProcess, options);
      
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
    a.download = tool('addPrefixSuffix.downloadFileName');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setText('');
    setOriginalText('');
    setHasProcessed(false);
    setButtonState('idle');
    setLastAppliedOptions(null);
    setOptions({
      prefix: '',
      suffix: '',
      ignoreEmpty: true
    });
  };

  const handleTextChange = (value: string) => {
    setText(value);
    if (hasProcessed) {
      // Update original text when user manually edits after processing
      setOriginalText(value);
    }
  };

  const getButtonContent = () => {
    if (buttonState === 'processing') {
      return (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          {tool('addPrefixSuffix.processing')}
        </>
      );
    }
    if (buttonState === 'success') {
      return (
        <>
          <Check className="mr-2 h-4 w-4" />
          {tool('addPrefixSuffix.applied')}
        </>
      );
    }
    if (optionsChanged && hasProcessed) {
      return (
        <>
          <WrapText className="mr-2 h-4 w-4" />
          {tool('addPrefixSuffix.reapplyButton')}
        </>
      );
    }
    return (
      <>
        <WrapText className="mr-2 h-4 w-4" />
        {tool('addPrefixSuffix.addButton')}
      </>
    );
  };

  // Calculate stats
  const lineCount = text.split('\n').length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="space-y-8">
      {/* H1 and H2 */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {tool('addPrefixSuffix.title')}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          {tool('addPrefixSuffix.description')}
        </p>
      </div>

      {/* Single Text Area with Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-input" className="text-sm font-medium">
            {tool('addPrefixSuffix.inputLabel')}
          </Label>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {lineCount} {lineCount === 1 ? tool('addPrefixSuffix.stats.line') : tool('addPrefixSuffix.stats.lines')}
            </span>
            <span>
              {wordCount} {wordCount === 1 ? tool('addPrefixSuffix.stats.word') : tool('addPrefixSuffix.stats.words')}
            </span>
            <span>
              {charCount} {charCount === 1 ? tool('addPrefixSuffix.stats.character') : tool('addPrefixSuffix.stats.characters')}
            </span>
          </div>
        </div>
        
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={tool('addPrefixSuffix.inputPlaceholder')}
          className="min-h-[300px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          spellCheck={false}
        />
        
        <p className="text-xs text-muted-foreground">
          {tool('addPrefixSuffix.helperText')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleApplyPrefixSuffix}
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
                className="flex-1 sm:w-auto"
              >
                <Clipboard className="mr-2 h-4 w-4" />
                {common('copy')}
              </Button>

              <Button
                onClick={handleDownload}
                variant="secondary"
                size="default"
                className="flex-1 sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                {common('download')}
              </Button>
            </div>

            <Button
              onClick={handleReset}
              variant="outline"
              size="default"
              className="w-full sm:w-auto"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {tool('addPrefixSuffix.resetButton')}
            </Button>
          </>
        )}
      </div>

      {/* Success Message */}
      {hasProcessed && buttonState === 'idle' && !optionsChanged && (
        <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ {tool('addPrefixSuffix.successMessage')}
          </p>
        </div>
      )}

      {/* Options Changed Message */}
      {optionsChanged && hasProcessed && buttonState === 'idle' && (
        <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            ℹ {tool('addPrefixSuffix.optionsChangedMessage')}
          </p>
        </div>
      )}

      {/* Options Component */}
      <PrefixSuffixOptions
        options={options}
        onOptionsChange={setOptions}
        translations={{
          title: tool('addPrefixSuffix.options.title'),
          prefix: tool('addPrefixSuffix.options.prefix'),
          prefixPlaceholder: tool('addPrefixSuffix.options.prefixPlaceholder'),
          suffix: tool('addPrefixSuffix.options.suffix'),
          suffixPlaceholder: tool('addPrefixSuffix.options.suffixPlaceholder'),
          ignoreEmptyLabel: tool('addPrefixSuffix.options.ignoreEmptyLabel'),
          ignoreEmptyDescription: tool('addPrefixSuffix.options.ignoreEmptyDescription')
        }}
      />
    </div>
  );
}

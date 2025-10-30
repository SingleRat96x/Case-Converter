'use client';

import React, { useState, useCallback } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { TextAnalytics } from '@/components/shared/TextAnalytics';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RemovePunctuationConverter() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  
  // Options state
  const [keepApostrophes, setKeepApostrophes] = useState(true);
  const [keepHyphens, setKeepHyphens] = useState(true);
  const [keepEmailURL, setKeepEmailURL] = useState(true);
  const [keepNumbers, setKeepNumbers] = useState(true);
  const [keepLineBreaks, setKeepLineBreaks] = useState(true);
  const [customKeepList, setCustomKeepList] = useState('');

  const removePunctuation = useCallback((
    inputText: string,
    options: {
      keepApostrophes: boolean;
      keepHyphens: boolean;
      keepEmailURL: boolean;
      keepNumbers: boolean;
      keepLineBreaks: boolean;
      customKeepList: string;
    }
  ) => {
    if (!inputText) {
      return '';
    }

    let result = inputText;
    
    // Build a list of characters to keep
    const keepChars = new Set<string>();
    
    // Always keep letters and spaces
    keepChars.add(' ');
    
    // Add optional character sets
    if (options.keepApostrophes) {
      keepChars.add("'");
      keepChars.add("'"); // Unicode apostrophe
      keepChars.add("'"); // Another variant
    }
    
    if (options.keepHyphens) {
      keepChars.add('-');
      keepChars.add('_');
      keepChars.add('–'); // en dash
      keepChars.add('—'); // em dash
    }
    
    if (options.keepEmailURL) {
      // Keep characters commonly used in emails and URLs
      keepChars.add('@');
      keepChars.add('.');
      keepChars.add('/');
      keepChars.add(':');
      keepChars.add('?');
      keepChars.add('=');
      keepChars.add('&');
      keepChars.add('%');
      keepChars.add('+');
      keepChars.add('~');
    }
    
    if (options.keepNumbers) {
      // Keep digits
      for (let i = 0; i <= 9; i++) {
        keepChars.add(i.toString());
      }
    }
    
    if (options.keepLineBreaks) {
      keepChars.add('\n');
      keepChars.add('\r');
    }
    
    // Add custom characters from the keep list
    if (options.customKeepList) {
      for (const char of options.customKeepList) {
        keepChars.add(char);
      }
    }
    
    // Remove punctuation
    result = result
      .split('')
      .filter(char => {
        // Keep letters (any language)
        if (/\p{L}/u.test(char)) return true;
        // Keep characters in our keep list
        if (keepChars.has(char)) return true;
        // Remove everything else
        return false;
      })
      .join('');
    
    // Clean up multiple spaces (but only if we're keeping spaces)
    if (!options.keepLineBreaks) {
      result = result.replace(/\s+/g, ' ').trim();
    } else {
      // Clean up spaces but preserve line breaks
      result = result.replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();
    }
    
    return result;
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);
    updateConvertedText(newText);
  };

  const updateConvertedText = (inputText: string = text) => {
    const result = removePunctuation(inputText, {
      keepApostrophes,
      keepHyphens,
      keepEmailURL,
      keepNumbers,
      keepLineBreaks,
      customKeepList,
    });
    setConvertedText(result);
  };

  // Update whenever options change
  React.useEffect(() => {
    if (text) {
      updateConvertedText();
    }
  }, [keepApostrophes, keepHyphens, keepEmailURL, keepNumbers, keepLineBreaks, customKeepList]);

  const handleFileUploaded = (content: string) => {
    updateConvertedText(content);
  };

  return (
    <BaseTextConverter
      title={tool('removePunctuation.title')}
      description={tool('removePunctuation.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('removePunctuation.outputLabel')}
      inputPlaceholder={tool('removePunctuation.inputPlaceholder')}
      copyText={tool('removePunctuation.copyCleanedText')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName={tool('removePunctuation.downloadFileName')}
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      onFileUploaded={handleFileUploaded}
      showAnalytics={false}
      mobileLayout="2x2"
    >
      <div className="space-y-4">
        {/* Helper Text */}
        <div className="text-center text-sm text-muted-foreground">
          {tool('removePunctuation.helperText')}
        </div>

        {/* Options Grid */}
        <div className="border rounded-lg p-4 bg-card space-y-3">
          <h3 className="text-sm font-semibold text-foreground mb-3 text-center">
            {tool('removePunctuation.optionsTitle') || 'Options: Choose what to keep'}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Keep Apostrophes */}
            <Button
              variant={keepApostrophes ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKeepApostrophes(!keepApostrophes)}
              className="justify-start gap-2 h-auto py-3"
            >
              <div className={`h-4 w-4 rounded border flex-shrink-0 ${keepApostrophes ? 'bg-primary border-primary' : 'border-input'}`}>
                {keepApostrophes && (
                  <svg viewBox="0 0 16 16" className="w-full h-full text-primary-foreground">
                    <path
                      fill="currentColor"
                      d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                    />
                  </svg>
                )}
              </div>
              <span className="text-left text-xs flex-1">{tool('removePunctuation.keepApostrophes')}</span>
            </Button>

            {/* Keep Hyphens */}
            <Button
              variant={keepHyphens ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKeepHyphens(!keepHyphens)}
              className="justify-start gap-2 h-auto py-3"
            >
              <div className={`h-4 w-4 rounded border flex-shrink-0 ${keepHyphens ? 'bg-primary border-primary' : 'border-input'}`}>
                {keepHyphens && (
                  <svg viewBox="0 0 16 16" className="w-full h-full text-primary-foreground">
                    <path
                      fill="currentColor"
                      d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                    />
                  </svg>
                )}
              </div>
              <span className="text-left text-xs flex-1">{tool('removePunctuation.keepHyphens')}</span>
            </Button>

            {/* Keep Email/URL */}
            <Button
              variant={keepEmailURL ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKeepEmailURL(!keepEmailURL)}
              className="justify-start gap-2 h-auto py-3"
            >
              <div className={`h-4 w-4 rounded border flex-shrink-0 ${keepEmailURL ? 'bg-primary border-primary' : 'border-input'}`}>
                {keepEmailURL && (
                  <svg viewBox="0 0 16 16" className="w-full h-full text-primary-foreground">
                    <path
                      fill="currentColor"
                      d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                    />
                  </svg>
                )}
              </div>
              <span className="text-left text-xs flex-1">{tool('removePunctuation.keepEmailURL')}</span>
            </Button>

            {/* Keep Numbers */}
            <Button
              variant={keepNumbers ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKeepNumbers(!keepNumbers)}
              className="justify-start gap-2 h-auto py-3"
            >
              <div className={`h-4 w-4 rounded border flex-shrink-0 ${keepNumbers ? 'bg-primary border-primary' : 'border-input'}`}>
                {keepNumbers && (
                  <svg viewBox="0 0 16 16" className="w-full h-full text-primary-foreground">
                    <path
                      fill="currentColor"
                      d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                    />
                  </svg>
                )}
              </div>
              <span className="text-left text-xs flex-1">{tool('removePunctuation.keepNumbers')}</span>
            </Button>

            {/* Keep Line Breaks */}
            <Button
              variant={keepLineBreaks ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKeepLineBreaks(!keepLineBreaks)}
              className="justify-start gap-2 h-auto py-3 sm:col-span-2"
            >
              <div className={`h-4 w-4 rounded border flex-shrink-0 ${keepLineBreaks ? 'bg-primary border-primary' : 'border-input'}`}>
                {keepLineBreaks && (
                  <svg viewBox="0 0 16 16" className="w-full h-full text-primary-foreground">
                    <path
                      fill="currentColor"
                      d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                    />
                  </svg>
                )}
              </div>
              <span className="text-left text-xs flex-1">{tool('removePunctuation.keepLineBreaks')}</span>
            </Button>
          </div>

          {/* Custom Keep List */}
          <div className="pt-2 space-y-2">
            <label className="text-sm font-medium text-foreground">
              {tool('removePunctuation.customKeepLabel')}
            </label>
            <Input
              type="text"
              placeholder={tool('removePunctuation.customKeepPlaceholder')}
              value={customKeepList}
              onChange={(e) => setCustomKeepList(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {tool('removePunctuation.customKeepHint') || 'Enter any additional characters you want to preserve'}
            </p>
          </div>
        </div>

        {/* Analytics */}
        {text && (
          <TextAnalytics
            text={convertedText || text}
            variant="compact"
            showTitle={false}
          />
        )}
      </div>
    </BaseTextConverter>
  );
}

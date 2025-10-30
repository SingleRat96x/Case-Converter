'use client';

import React, { useState, useCallback } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { TextAnalytics } from '@/components/shared/TextAnalytics';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Settings, Sparkles } from 'lucide-react';

export function RemovePunctuationConverter() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  
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
  };

  const handleRemovePunctuation = useCallback(() => {
    const result = removePunctuation(text, {
      keepApostrophes,
      keepHyphens,
      keepEmailURL,
      keepNumbers,
      keepLineBreaks,
      customKeepList,
    });
    setConvertedText(result);
  }, [text, keepApostrophes, keepHyphens, keepEmailURL, keepNumbers, keepLineBreaks, customKeepList, removePunctuation]);

  const handleFileUploaded = (content: string) => {
    const result = removePunctuation(content, {
      keepApostrophes,
      keepHyphens,
      keepEmailURL,
      keepNumbers,
      keepLineBreaks,
      customKeepList,
    });
    setConvertedText(result);
  };

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
      <div className="space-y-3">
        {/* Primary CTA Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRemovePunctuation}
            variant="default"
            size="lg"
            className="gap-2"
            disabled={!text}
          >
            <Sparkles className="h-4 w-4" />
            {tool('removePunctuation.removeButton')}
          </Button>
        </div>

        {/* Helper Text */}
        <div className="text-center text-sm text-muted-foreground">
          {tool('removePunctuation.helperText')}
        </div>

        {/* Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('removePunctuation.optionsTitle')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Options Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Settings className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('removePunctuation.preserveTitle') || 'Preservation Options'}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Toggle Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Keep Apostrophes */}
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      <label 
                        htmlFor="keep-apostrophes" 
                        className="text-sm font-medium cursor-pointer flex-1 pr-2"
                      >
                        {tool('removePunctuation.keepApostrophes')}
                      </label>
                      <Switch
                        id="keep-apostrophes"
                        checked={keepApostrophes}
                        onCheckedChange={setKeepApostrophes}
                      />
                    </div>

                    {/* Keep Hyphens */}
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      <label 
                        htmlFor="keep-hyphens" 
                        className="text-sm font-medium cursor-pointer flex-1 pr-2"
                      >
                        {tool('removePunctuation.keepHyphens')}
                      </label>
                      <Switch
                        id="keep-hyphens"
                        checked={keepHyphens}
                        onCheckedChange={setKeepHyphens}
                      />
                    </div>

                    {/* Keep Email/URL */}
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      <label 
                        htmlFor="keep-email-url" 
                        className="text-sm font-medium cursor-pointer flex-1 pr-2"
                      >
                        {tool('removePunctuation.keepEmailURL')}
                      </label>
                      <Switch
                        id="keep-email-url"
                        checked={keepEmailURL}
                        onCheckedChange={setKeepEmailURL}
                      />
                    </div>

                    {/* Keep Numbers */}
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      <label 
                        htmlFor="keep-numbers" 
                        className="text-sm font-medium cursor-pointer flex-1 pr-2"
                      >
                        {tool('removePunctuation.keepNumbers')}
                      </label>
                      <Switch
                        id="keep-numbers"
                        checked={keepNumbers}
                        onCheckedChange={setKeepNumbers}
                      />
                    </div>

                    {/* Keep Line Breaks */}
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow sm:col-span-2">
                      <label 
                        htmlFor="keep-line-breaks" 
                        className="text-sm font-medium cursor-pointer flex-1 pr-2"
                      >
                        {tool('removePunctuation.keepLineBreaks')}
                      </label>
                      <Switch
                        id="keep-line-breaks"
                        checked={keepLineBreaks}
                        onCheckedChange={setKeepLineBreaks}
                      />
                    </div>
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
                      {tool('removePunctuation.customKeepHint')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>

        {/* Analytics */}
        {convertedText && (
          <TextAnalytics
            text={convertedText}
            variant="compact"
            showTitle={false}
          />
        )}
      </div>
    </BaseTextConverter>
  );
}

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { SlugifyAnalytics } from '@/components/shared/SlugifyAnalytics';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { ArrowRightLeft, XCircle, RefreshCw, Zap, Settings, Link2 } from 'lucide-react';

type ConversionMode = 'slugify' | 'humanize';
type Separator = '-' | '_' | '.';

interface ConversionOptions {
  separator: Separator;
  lowercase: boolean;
  removeStopWords: boolean;
  maxLength: number;
  removeSpecialChars: boolean;
  preserveNumbers: boolean;
}

export function SlugifyUrlGenerator() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('slugify');
  const [error, setError] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [options, setOptions] = useState<ConversionOptions>({
    separator: '-',
    lowercase: true,
    removeStopWords: false,
    maxLength: 100,
    removeSpecialChars: true,
    preserveNumbers: true,
  });

  // Common stop words to remove
  const stopWords = useMemo(() => [
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it',
    'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'но', 'и', 'в', 'на', 'с', 'по'
  ], []);

  // Slugify function
  const slugifyText = useCallback((text: string): string => {
    try {
      let result = text.trim();

      // Convert to lowercase if enabled
      if (options.lowercase) {
        result = result.toLowerCase();
      }

      // Remove or replace special characters
      if (options.removeSpecialChars) {
        // Keep letters, numbers, spaces, and basic punctuation
        result = result.replace(/[^\w\s\-_.]/g, '');
      }

      // Replace accented characters
      result = result
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/[ß]/g, 'ss')
        .replace(/[а-яё]/g, (match) => {
          // Transliterate Cyrillic characters
          const cyrillicMap: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return cyrillicMap[match] || match;
        });

      // Remove stop words if enabled
      if (options.removeStopWords) {
        const words = result.split(/\s+/);
        const filteredWords = words.filter(word => 
          word.length > 0 && !stopWords.includes(word.toLowerCase())
        );
        result = filteredWords.join(' ');
      }

      // Replace whitespace and multiple separators with single separator
      result = result
        .replace(/\s+/g, options.separator)
        .replace(new RegExp(`\\${options.separator}+`, 'g'), options.separator);

      // Remove leading/trailing separators
      result = result.replace(new RegExp(`^\\${options.separator}+|\\${options.separator}+$`, 'g'), '');

      // Limit length if specified
      if (options.maxLength > 0 && result.length > options.maxLength) {
        result = result.substring(0, options.maxLength);
        // Ensure we don't cut in the middle of a word
        const lastSeparator = result.lastIndexOf(options.separator);
        if (lastSeparator > 0) {
          result = result.substring(0, lastSeparator);
        }
      }

      return result;
    } catch {
      throw new Error(tool('slugify.errors.slugifyFailed'));
    }
  }, [options, tool, stopWords]);

  // Humanize function (convert slug back to readable text)
  const humanizeSlug = useCallback((slug: string): string => {
    try {
      let result = slug.trim();

      // Replace separators with spaces
      result = result.replace(new RegExp(`\\${options.separator}`, 'g'), ' ');

      // Replace underscores and dots with spaces if they're not the main separator
      if (options.separator !== '_') result = result.replace(/_/g, ' ');
      if (options.separator !== '.') result = result.replace(/\./g, ' ');

      // Clean up multiple spaces
      result = result.replace(/\s+/g, ' ').trim();

      // Capitalize first letter of each word
      result = result.replace(/\b\w/g, letter => letter.toUpperCase());

      return result;
    } catch {
      throw new Error(tool('slugify.errors.humanizeFailed'));
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
      if (currentMode === 'slugify') {
        const slugified = slugifyText(inputText);
        setOutput(slugified);
      } else {
        const humanized = humanizeSlug(inputText);
        setOutput(humanized);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('slugify.errors.conversionFailed'));
      setOutput('');
    }
  }, [mode, slugifyText, humanizeSlug, tool]);

  // Handle input change
  const handleInputChange = useCallback((newInput: string) => {
    setInput(newInput);
    processConversion(newInput);
  }, [processConversion]);

  // Handle mode switch
  const handleModeSwitch = useCallback(() => {
    const newMode = mode === 'slugify' ? 'humanize' : 'slugify';
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
  const handleOptionChange = useCallback((option: keyof ConversionOptions, value: string | boolean | number) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
  }, []);

  // Handle separator change
  const handleSeparatorChange = useCallback((separator: Separator) => {
    handleOptionChange('separator', separator);
  }, [handleOptionChange]);

  // Update output when options change (only for slugify mode)
  React.useEffect(() => {
    if (mode === 'slugify' && input) {
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
      title={tool('slugify.title')}
      description={tool('slugify.description')}
      inputLabel={mode === 'slugify' ? tool('slugify.labels.textInput') : tool('slugify.labels.slugInput')}
      outputLabel={mode === 'slugify' ? tool('slugify.labels.slugOutput') : tool('slugify.labels.textOutput')}
      inputPlaceholder={mode === 'slugify' ? tool('slugify.placeholders.text') : tool('slugify.placeholders.slug')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName={mode === 'slugify' ? 'url-slug.txt' : 'humanized-text.txt'}
      onTextChange={handleInputChange}
      text={input}
      convertedText={output}
      onConvertedTextUpdate={setOutput}
      onFileUploaded={(content: string) => {
        setInput(content);
        processConversion(content);
      }}
      showAnalytics={false}
      useMonoFont={mode === 'slugify'}
      mobileLayout="2x2"
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
            {mode === 'slugify' ? tool('slugify.modes.slugify') : tool('slugify.modes.humanize')}
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
              {tool('slugify.actions.clear')}
            </Button>
            
            <Button
              onClick={() => {
                const example = mode === 'slugify' ? 'My Amazing Blog Post Title' : 'my-amazing-blog-post-title';
                setInput(example);
                processConversion(example);
              }}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Zap className="h-3 w-3" />
              {tool('slugify.actions.example')}
            </Button>
          </div>
        </div>

        {/* Slugify Options Accordion */}
        {mode === 'slugify' && (
          <Accordion className="w-full">
            <AccordionItem 
              title={tool('slugify.accordion.title')}
              defaultOpen={isAccordionOpen}
              className="w-full"
            >
              <div className="space-y-6">
                {/* Slug Configuration Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Link2 className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">{tool('slugify.sections.configuration')}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Separator Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-muted-foreground">
                        {tool('slugify.options.separator')}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['-', '_', '.'] as Separator[]).map((sep) => (
                          <Button
                            key={sep}
                            variant={options.separator === sep ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSeparatorChange(sep)}
                            className="text-xs"
                          >
                            {tool(`slugify.options.separators.${sep === '-' ? 'hyphen' : sep === '_' ? 'underscore' : 'dot'}`)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Max Length Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-muted-foreground">
                        {tool('slugify.options.maxLength')}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[50, 75, 100, 150].map((length) => (
                          <Button
                            key={length}
                            variant={options.maxLength === length ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleOptionChange('maxLength', length)}
                            className="text-xs"
                          >
                            {length}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processing Settings Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Settings className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">{tool('slugify.sections.processing')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow">
                      <label htmlFor="lowercase" className="text-sm font-medium cursor-pointer flex-1">
                        {tool('slugify.options.lowercase')}
                      </label>
                      <Switch
                        id="lowercase"
                        checked={options.lowercase}
                        onCheckedChange={(checked) => handleOptionChange('lowercase', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow">
                      <label htmlFor="remove-stop-words" className="text-sm font-medium cursor-pointer flex-1">
                        {tool('slugify.options.removeStopWords')}
                      </label>
                      <Switch
                        id="remove-stop-words"
                        checked={options.removeStopWords}
                        onCheckedChange={(checked) => handleOptionChange('removeStopWords', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow">
                      <label htmlFor="remove-special-chars" className="text-sm font-medium cursor-pointer flex-1">
                        {tool('slugify.options.removeSpecialChars')}
                      </label>
                      <Switch
                        id="remove-special-chars"
                        checked={options.removeSpecialChars}
                        onCheckedChange={(checked) => handleOptionChange('removeSpecialChars', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow">
                      <label htmlFor="preserve-numbers" className="text-sm font-medium cursor-pointer flex-1">
                        {tool('slugify.options.preserveNumbers')}
                      </label>
                      <Switch
                        id="preserve-numbers"
                        checked={options.preserveNumbers}
                        onCheckedChange={(checked) => handleOptionChange('preserveNumbers', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
            <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Slugify Analytics */}
        <SlugifyAnalytics 
          inputText={input}
          outputText={output}
          separator={options.separator}
          variant="compact"
          showTitle={false}
        />
      </div>
    </BaseTextConverter>
  );
}
'use client';

import React, { useState, useCallback } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { PlainTextAnalytics } from '@/components/shared/PlainTextAnalytics';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { 
  Code, 
  Type, 
  Hash,
  AlertCircle,
  Settings,
  Filter,
  AlignLeft,
  Smile,
  AtSign,
  Globe,
  Zap,
  Space,
  RotateCcw
} from 'lucide-react';

interface ConversionOptions {
  removeHtml: boolean;
  removeMarkdown: boolean;
  removeUrls: boolean;
  removeEmails: boolean;
  removeNumbers: boolean;
  removeSpecialChars: boolean;
  removeExtraSpaces: boolean;
  removePunctuation: boolean;
  removeEmojis: boolean;
  normalizeWhitespace: boolean;
  preserveLineBreaks: boolean;
  trimLines: boolean;
}

export function PlainTextConverter() {
  const { common, tool } = useToolTranslations('tools/text-modifiers');
  const [text, setText] = useState('');
  const [plainText, setPlainText] = useState('');
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'format' | 'content' | 'processing'>('format');
  const [options, setOptions] = useState<ConversionOptions>({
    removeHtml: true,
    removeMarkdown: true,
    removeUrls: false,
    removeEmails: false,
    removeNumbers: false,
    removeSpecialChars: false,
    removeExtraSpaces: true,
    removePunctuation: false,
    removeEmojis: false,
    normalizeWhitespace: true,
    preserveLineBreaks: true,
    trimLines: true,
  });

  // Conversion functions
  const removeHtmlTags = useCallback((text: string): string => {
    // Remove script and style content
    text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Convert br tags to newlines
    text = text.replace(/<br\s*\/?>/gi, '\n');
    
    // Convert p and div tags to double newlines
    text = text.replace(/<\/(p|div)>/gi, '\n\n');
    
    // Remove all remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }, []);

  const removeMarkdownFormatting = useCallback((text: string): string => {
    // Headers
    text = text.replace(/^#{1,6}\s+/gm, '');
    
    // Bold and italic
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
    text = text.replace(/(\*|_)(.*?)\1/g, '$2');
    
    // Strikethrough
    text = text.replace(/~~(.*?)~~/g, '$1');
    
    // Code blocks
    text = text.replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```(\w+)?\n?/, '').replace(/```$/, '');
    });
    
    // Inline code
    text = text.replace(/`([^`]+)`/g, '$1');
    
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    text = text.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, '$1');
    
    // Images
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1');
    
    // Blockquotes
    text = text.replace(/^>\s+/gm, '');
    
    // Lists
    text = text.replace(/^[\s]*[-*+]\s+/gm, '');
    text = text.replace(/^[\s]*\d+\.\s+/gm, '');
    
    // Horizontal rules
    text = text.replace(/^([-*_]){3,}\s*$/gm, '');
    
    // Tables
    text = text.replace(/\|/g, ' ');
    text = text.replace(/^[\s]*:?-+:?\s*$/gm, '');
    
    return text;
  }, []);

  const removeUrlsFromText = useCallback((text: string): string => {
    // Remove URLs with protocols
    text = text.replace(/https?:\/\/[^\s]+/gi, '');
    text = text.replace(/ftp:\/\/[^\s]+/gi, '');
    
    // Remove www URLs without protocol
    text = text.replace(/www\.[^\s]+/gi, '');
    
    // Remove URLs with common TLDs
    text = text.replace(/[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.(?:com|org|net|edu|gov|mil|int|co|uk|de|fr|jp|au|us|ru|ch|it|nl|se|no|es|mil|info|biz|name|io|ly|app|dev)\b[^\s]*/gi, '');
    
    return text;
  }, []);

  const removeEmailAddresses = useCallback((text: string): string => {
    return text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  }, []);

  const removeNumbersFromText = useCallback((text: string): string => {
    // Remove standalone numbers
    return text.replace(/\b\d+\b/g, '');
  }, []);

  const removeSpecialCharacters = useCallback((text: string): string => {
    // Keep only letters, numbers, spaces, and basic punctuation
    return text.replace(/[^a-zA-Z0-9\s.,!?;:'"()-]/g, '');
  }, []);

  const removePunctuationMarks = useCallback((text: string): string => {
    return text.replace(/[.,!?;:'"()-]/g, '');
  }, []);

  const removeEmojiCharacters = useCallback((text: string): string => {
    // Remove emojis and other Unicode symbols
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  }, []);

  const normalizeWhitespaceChars = useCallback((text: string): string => {
    // Replace various whitespace characters with regular spaces
    text = text.replace(/[\t\f\v\u00A0\u2000-\u200B\u2028\u2029\u202F\u205F\u3000]/g, ' ');
    
    // Replace multiple spaces with single space
    if (options.removeExtraSpaces) {
      text = text.replace(/ {2,}/g, ' ');
    }
    
    return text;
  }, [options.removeExtraSpaces]);

  const processLineBreaks = useCallback((text: string): string => {
    if (options.preserveLineBreaks) {
      // Normalize different line break styles
      text = text.replace(/\r\n/g, '\n');
      text = text.replace(/\r/g, '\n');
      
      // Remove multiple consecutive line breaks (more than 2)
      text = text.replace(/\n{3,}/g, '\n\n');
    } else {
      // Replace all line breaks with spaces
      text = text.replace(/[\r\n]+/g, ' ');
    }
    
    return text;
  }, [options.preserveLineBreaks]);

  const trimLinesInText = useCallback((text: string): string => {
    if (options.trimLines && options.preserveLineBreaks) {
      return text.split('\n').map(line => line.trim()).join('\n');
    }
    return text;
  }, [options.trimLines, options.preserveLineBreaks]);

  const convertToPlainText = useCallback((inputText: string): string => {
    if (!inputText) return '';

    let result = inputText;

    // Apply conversions in order
    if (options.removeHtml) {
      result = removeHtmlTags(result);
    }

    if (options.removeMarkdown) {
      result = removeMarkdownFormatting(result);
    }

    if (options.removeUrls) {
      result = removeUrlsFromText(result);
    }

    if (options.removeEmails) {
      result = removeEmailAddresses(result);
    }

    if (options.removeEmojis) {
      result = removeEmojiCharacters(result);
    }

    if (options.removeNumbers) {
      result = removeNumbersFromText(result);
    }

    if (options.removeSpecialChars) {
      result = removeSpecialCharacters(result);
    }

    if (options.removePunctuation) {
      result = removePunctuationMarks(result);
    }

    if (options.normalizeWhitespace) {
      result = normalizeWhitespaceChars(result);
    }

    result = processLineBreaks(result);

    if (options.trimLines) {
      result = trimLinesInText(result);
    }

    // Final cleanup
    result = result.trim();

    return result;
  }, [
    options,
    removeHtmlTags,
    removeMarkdownFormatting,
    removeUrlsFromText,
    removeEmailAddresses,
    removeEmojiCharacters,
    removeNumbersFromText,
    removeSpecialCharacters,
    removePunctuationMarks,
    normalizeWhitespaceChars,
    processLineBreaks,
    trimLinesInText
  ]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    const converted = convertToPlainText(newText);
    setPlainText(converted);
  }, [convertToPlainText]);

  const handleOptionChange = useCallback((option: keyof ConversionOptions) => {
    setOptions((prev: ConversionOptions) => {
      const newOptions = { ...prev, [option]: !prev[option] };
      // Update the output immediately
      const converted = convertToPlainText(text);
      setPlainText(converted);
      return newOptions;
    });
  }, [text, convertToPlainText]);

  // Update plain text when options change
  React.useEffect(() => {
    const converted = convertToPlainText(text);
    setPlainText(converted);
  }, [text, options, convertToPlainText]);

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


  // Tab configuration
  const tabs = [
    {
      id: 'format' as const,
      label: tool('plainText.tabs.formatRemoval'),
      icon: Code,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'content' as const,
      label: tool('plainText.tabs.contentFiltering'),
      icon: Filter,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'processing' as const,
      label: tool('plainText.tabs.textProcessing'),
      icon: Settings,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <BaseTextConverter
      title={tool('plainText.title')}
      description={tool('plainText.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('plainText.outputLabel')}
      inputPlaceholder={tool('plainText.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName="plain-text.txt"
      onTextChange={handleTextChange}
      text={text}
      convertedText={plainText}
      onConvertedTextUpdate={setPlainText}
      showAnalytics={false}
      mobileLayout="2x2"
    >
      <div className="space-y-4">
        {/* Plain Text Conversion Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('plainText.accordion.title')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex flex-wrap justify-center gap-2 p-1 bg-muted rounded-lg">
                {tabs.map(({ id, label, icon: Icon, color }) => (
                  <Button
                    key={id}
                    variant={activeTab === id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(id)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Icon className={`h-3 w-3 ${activeTab === id ? 'text-primary-foreground' : color}`} />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Format Removal Tab */}
              {activeTab === 'format' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Code className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">{tool('plainText.tabs.formatRemoval')}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label 
                        htmlFor="remove-html" 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.removeHtml')}</span>
                      </label>
                      <Switch
                        id="remove-html"
                        checked={options.removeHtml}
                        onCheckedChange={() => handleOptionChange('removeHtml')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label 
                        htmlFor="remove-markdown" 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.removeMarkdown')}</span>
                      </label>
                      <Switch
                        id="remove-markdown"
                        checked={options.removeMarkdown}
                        onCheckedChange={() => handleOptionChange('removeMarkdown')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Content Filtering Tab */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Filter className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">{tool('plainText.tabs.contentFiltering')}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label 
                        htmlFor="remove-urls" 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.removeUrls')}</span>
                      </label>
                      <Switch
                        id="remove-urls"
                        checked={options.removeUrls}
                        onCheckedChange={() => handleOptionChange('removeUrls')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label 
                        htmlFor="remove-emails" 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <AtSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.removeEmails')}</span>
                      </label>
                      <Switch
                        id="remove-emails"
                        checked={options.removeEmails}
                        onCheckedChange={() => handleOptionChange('removeEmails')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label 
                        htmlFor="remove-numbers" 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.removeNumbers')}</span>
                      </label>
                      <Switch
                        id="remove-numbers"
                        checked={options.removeNumbers}
                        onCheckedChange={() => handleOptionChange('removeNumbers')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label 
                        htmlFor="remove-emojis" 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Smile className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.removeEmojis')}</span>
                      </label>
                      <Switch
                        id="remove-emojis"
                        checked={options.removeEmojis}
                        onCheckedChange={() => handleOptionChange('removeEmojis')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label 
                        htmlFor="remove-special-chars" 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.removeSpecialChars')}</span>
                      </label>
                      <Switch
                        id="remove-special-chars"
                        checked={options.removeSpecialChars}
                        onCheckedChange={() => handleOptionChange('removeSpecialChars')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label 
                        htmlFor="remove-punctuation" 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.removePunctuation')}</span>
                      </label>
                      <Switch
                        id="remove-punctuation"
                        checked={options.removePunctuation}
                        onCheckedChange={() => handleOptionChange('removePunctuation')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Text Processing Tab */}
              {activeTab === 'processing' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Settings className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">{tool('plainText.tabs.textProcessing')}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label 
                        htmlFor="remove-extra-spaces" 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Space className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.removeExtraSpaces')}</span>
                      </label>
                      <Switch
                        id="remove-extra-spaces"
                        checked={options.removeExtraSpaces}
                        onCheckedChange={() => handleOptionChange('removeExtraSpaces')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label 
                        htmlFor="normalize-whitespace" 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <AlignLeft className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.normalizeWhitespace')}</span>
                      </label>
                      <Switch
                        id="normalize-whitespace"
                        checked={options.normalizeWhitespace}
                        onCheckedChange={() => handleOptionChange('normalizeWhitespace')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <label 
                        htmlFor="preserve-line-breaks" 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <AlignLeft className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.preserveLineBreaks')}</span>
                      </label>
                      <Switch
                        id="preserve-line-breaks"
                        checked={options.preserveLineBreaks}
                        onCheckedChange={() => handleOptionChange('preserveLineBreaks')}
                      />
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg border bg-card transition-colors ${
                      !options.preserveLineBreaks 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-accent/5'
                    }`}>
                      <label 
                        htmlFor="trim-lines" 
                        className={`flex items-center gap-2 flex-1 ${
                          !options.preserveLineBreaks 
                            ? 'cursor-not-allowed text-muted-foreground' 
                            : 'cursor-pointer'
                        }`}
                      >
                        <Space className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool('plainText.options.trimLines')}</span>
                      </label>
                      <Switch
                        id="trim-lines"
                        checked={options.trimLines}
                        onCheckedChange={() => handleOptionChange('trimLines')}
                        disabled={!options.preserveLineBreaks}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>

        {/* Warning for aggressive options */}
        {(options.removeNumbers || options.removeSpecialChars || options.removePunctuation) && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {tool('plainText.warning')}
            </p>
          </div>
        )}

        {/* Plain Text Analytics */}
        <PlainTextAnalytics 
          originalText={text}
          plainText={plainText}
          options={options}
          variant="compact"
          showTitle={false}
        />
      </div>
    </BaseTextConverter>
  );
}
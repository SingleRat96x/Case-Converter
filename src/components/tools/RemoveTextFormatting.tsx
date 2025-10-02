'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { RemoveTextFormattingAnalytics } from '@/components/shared/RemoveTextFormattingAnalytics';
import { useToolTranslations } from '@/lib/i18n/hooks';
// Removed unused Button import
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Settings, Code2, Hash, Link2, Mail, Zap, FileDigit } from 'lucide-react';
import { ToolOptionsAccordion } from '@/components/shared/ToolOptionsAccordion';

export function RemoveTextFormatting() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [isDesktop, setIsDesktop] = useState(true);
  const [options, setOptions] = useState({
    removeHtml: true,
    removeMarkdown: true,
    removeExtraSpaces: true,
    removeSpecialChars: false,
    removeNumbers: false,
    removeUrls: true,
    removeEmails: true,
  });

  // Check if desktop on mount
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const stripFormatting = useCallback((inputText: string, opts: typeof options) => {
    if (!inputText) {
      return '';
    }

    let result = inputText;

    // Remove HTML tags
    if (opts.removeHtml) {
      result = result.replace(/<[^>]*>/g, '');
      // Decode HTML entities
      result = result
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ');
    }

    // Remove Markdown formatting
    if (opts.removeMarkdown) {
      // Headers
      result = result.replace(/^#{1,6}\s+/gm, '');
      // Bold and italic
      result = result.replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2');
      // Links
      result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      // Images
      result = result.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
      // Code blocks
      result = result.replace(/```[\s\S]*?```/g, '');
      result = result.replace(/`([^`]+)`/g, '$1');
      // Blockquotes
      result = result.replace(/^>\s+/gm, '');
      // Lists
      result = result.replace(/^[\*\-\+]\s+/gm, '');
      result = result.replace(/^\d+\.\s+/gm, '');
    }

    // Remove URLs
    if (opts.removeUrls) {
      result = result.replace(/https?:\/\/[^\s]+/g, '');
      result = result.replace(/www\.[^\s]+/g, '');
    }

    // Remove emails
    if (opts.removeEmails) {
      result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
    }

    // Remove special characters (keep letters, numbers, and basic punctuation)
    if (opts.removeSpecialChars) {
      result = result.replace(/[^a-zA-Z0-9\s.,!?;:\-'"]/g, '');
    }

    // Remove numbers
    if (opts.removeNumbers) {
      result = result.replace(/\d+/g, '');
    }

    // Remove extra spaces
    if (opts.removeExtraSpaces) {
      result = result.replace(/\s+/g, ' ').trim();
      // Remove spaces before punctuation
      result = result.replace(/\s+([.,!?;:])/g, '$1');
    }

    return result;
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);
    setConvertedText(stripFormatting(newText, options));
  };

  const handleOptionChange = (option: keyof typeof options) => {
    const newOptions = { ...options, [option]: !options[option] };
    setOptions(newOptions);
    setConvertedText(stripFormatting(text, newOptions));
  };

  const optionsList = [
    { key: 'removeHtml', label: tool('removeTextFormatting.options.removeHtml'), icon: Code2, default: true },
    { key: 'removeMarkdown', label: tool('removeTextFormatting.options.removeMarkdown'), icon: Hash, default: true },
    { key: 'removeExtraSpaces', label: tool('removeTextFormatting.options.removeExtraSpaces'), icon: Zap, default: true },
    { key: 'removeUrls', label: tool('removeTextFormatting.options.removeUrls'), icon: Link2, default: true },
    { key: 'removeEmails', label: tool('removeTextFormatting.options.removeEmails'), icon: Mail, default: true },
    { key: 'removeSpecialChars', label: tool('removeTextFormatting.options.removeSpecialChars'), icon: Zap, default: false },
    { key: 'removeNumbers', label: tool('removeTextFormatting.options.removeNumbers'), icon: FileDigit, default: false },
  ];

  return (
    <BaseTextConverter
      title={tool('removeTextFormatting.title')}
      description={tool('removeTextFormatting.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('removeTextFormatting.outputLabel')}
      inputPlaceholder={tool('removeTextFormatting.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName="clean-text.txt"
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      showAnalytics={false}
      mobileLayout="2x2"
    >
      <div className="space-y-4">
        {/* Options Accordion */}
        <ToolOptionsAccordion
          title={tool('removeTextFormatting.optionsTitle')}
          defaultOpen={isDesktop}
          icon={<Settings className="h-4 w-4" />}
        >
          <div className="space-y-4">
            {/* Toggle Options - Clean horizontal layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {optionsList.map(({ key, label, icon: Icon }) => (
                <div 
                  key={key}
                  className="group flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 cursor-pointer"
                  onClick={() => handleOptionChange(key as keyof typeof options)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <label 
                      htmlFor={key} 
                      className="text-sm font-medium cursor-pointer text-foreground leading-tight"
                    >
                      {label}
                    </label>
                  </div>
                  <Switch
                    id={key}
                    checked={options[key as keyof typeof options]}
                    onCheckedChange={() => handleOptionChange(key as keyof typeof options)}
                    className="ml-2"
                  />
                </div>
              ))}
            </div>

            {/* Warning for aggressive options */}
            {(options.removeSpecialChars || options.removeNumbers) && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 text-warning rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  {tool('removeTextFormatting.warning')}
                </div>
              </div>
            )}
          </div>
        </ToolOptionsAccordion>

        {/* Analytics - Always visible */}
        <RemoveTextFormattingAnalytics
          originalText={text}
          convertedText={convertedText}
          options={options}
          variant="compact"
          showTitle={false}
        />
      </div>
    </BaseTextConverter>
  );
}
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Settings, Shield, Mail, Hash, FileText, Minus, List } from 'lucide-react';
import { ToolOptionsAccordion } from '@/components/shared/ToolOptionsAccordion';
import { 
  removePunctuation, 
  getPunctuationStats,
  validateCustomKeepList,
  type RemovePunctuationOptions,
  DEFAULT_OPTIONS 
} from '@/lib/removePunctuation';

interface PunctuationAnalytics {
  originalLength: number;
  resultLength: number;
  charactersRemoved: number;
  reductionPercentage: number;
  punctuationFound: string[];
  protectedElements: {
    emails: number;
    urls: number;
    contractions: number;
    hyphens: number;
  };
}

export function RemovePunctuationTool() {
  const { common, tool } = useToolTranslations('tools/text-modifiers');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [isDesktop, setIsDesktop] = useState(true);
  const [customKeepError, setCustomKeepError] = useState<string>('');
  const [analytics, setAnalytics] = useState<PunctuationAnalytics | null>(null);
  
  const [options, setOptions] = useState<RemovePunctuationOptions>(DEFAULT_OPTIONS);

  // Check if desktop on mount
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const processText = useCallback((inputText: string, currentOptions: RemovePunctuationOptions) => {
    if (!inputText) {
      setConvertedText('');
      setAnalytics(null);
      return '';
    }

    // Validate custom keep list
    const validation = validateCustomKeepList(currentOptions.customKeepList);
    if (!validation.isValid) {
      setCustomKeepError(`Invalid characters: ${validation.invalidChars.join(', ')}`);
      return inputText; // Return original text if validation fails
    } else {
      setCustomKeepError('');
    }

    const result = removePunctuation(inputText, currentOptions);
    const stats = getPunctuationStats(inputText, result, currentOptions);
    
    setAnalytics(stats);
    return result;
  }, []);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    const result = processText(newText, options);
    setConvertedText(result);
  }, [options, processText]);

  const handleOptionChange = useCallback((optionKey: keyof RemovePunctuationOptions, value: boolean | string) => {
    const newOptions = { ...options, [optionKey]: value };
    setOptions(newOptions);
    const result = processText(text, newOptions);
    setConvertedText(result);
  }, [options, text, processText]);

  const resetToDefaults = () => {
    setOptions(DEFAULT_OPTIONS);
    const result = processText(text, DEFAULT_OPTIONS);
    setConvertedText(result);
  };

  const optionsList = [
    { 
      key: 'keepApostrophes', 
      label: tool('removePunctuation.options.keepApostrophes'), 
      icon: Shield, 
      description: tool('removePunctuation.options.keepApostrophesDesc'),
      category: 'smart'
    },
    { 
      key: 'keepHyphens', 
      label: tool('removePunctuation.options.keepHyphens'), 
      icon: Minus, 
      description: tool('removePunctuation.options.keepHyphensDesc'),
      category: 'smart'
    },
    { 
      key: 'keepEmailUrl', 
      label: tool('removePunctuation.options.keepEmailUrl'), 
      icon: Mail, 
      description: tool('removePunctuation.options.keepEmailUrlDesc'),
      category: 'smart'
    },
    { 
      key: 'keepNumbers', 
      label: tool('removePunctuation.options.keepNumbers'), 
      icon: Hash, 
      description: tool('removePunctuation.options.keepNumbersDesc'),
      category: 'content'
    },
    { 
      key: 'keepLineBreaks', 
      label: tool('removePunctuation.options.keepLineBreaks'), 
      icon: FileText, 
      description: tool('removePunctuation.options.keepLineBreaksDesc'),
      category: 'formatting'
    },
  ];

  const smartOptions = optionsList.filter(opt => opt.category === 'smart');
  const contentOptions = optionsList.filter(opt => opt.category === 'content');
  const formattingOptions = optionsList.filter(opt => opt.category === 'formatting');

  return (
    <BaseTextConverter
      title={tool('removePunctuation.title')}
      description={tool('removePunctuation.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('removePunctuation.outputLabel')}
      inputPlaceholder={tool('removePunctuation.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName="text-without-punctuation.txt"
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      showAnalytics={false}
      mobileLayout="2x2"
    >
      <div className="space-y-6">
        {/* Options Accordion */}
        <ToolOptionsAccordion
          title={tool('removePunctuation.optionsTitle')}
          defaultOpen={isDesktop}
          icon={<Settings className="h-4 w-4" />}
        >
          <div className="space-y-6">
            {/* Reset Button */}
            <div className="flex justify-between items-center pb-4 border-b border-border/50">
              <h3 className="text-lg font-semibold text-foreground">
                {tool('removePunctuation.optionsTitle')}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                className="text-xs"
              >
                {common('buttons.reset')}
              </Button>
            </div>

            {/* Smart Keep Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <Shield className="h-4 w-4 text-primary" />
                <h4 className="text-base font-semibold text-foreground">
                  {tool('removePunctuation.smartKeepOptions')}
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {smartOptions.map(({ key, label, icon: Icon, description }) => (
                  <div 
                    key={key}
                    className="group flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors mt-0.5">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1">
                        <label 
                          htmlFor={key} 
                          className="text-sm font-medium cursor-pointer text-foreground leading-tight block mb-1"
                        >
                          {label}
                        </label>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={key}
                      checked={options[key as keyof RemovePunctuationOptions] as boolean}
                      onCheckedChange={(checked) => handleOptionChange(key as keyof RemovePunctuationOptions, checked)}
                      className="ml-3 mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Content & Formatting Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <List className="h-4 w-4 text-primary" />
                <h4 className="text-base font-semibold text-foreground">
                  {tool('removePunctuation.contentFormattingOptions')}
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...contentOptions, ...formattingOptions].map(({ key, label, icon: Icon, description }) => (
                  <div 
                    key={key}
                    className="group flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors mt-0.5">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1">
                        <label 
                          htmlFor={key} 
                          className="text-sm font-medium cursor-pointer text-foreground leading-tight block mb-1"
                        >
                          {label}
                        </label>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={key}
                      checked={options[key as keyof RemovePunctuationOptions] as boolean}
                      onCheckedChange={(checked) => handleOptionChange(key as keyof RemovePunctuationOptions, checked)}
                      className="ml-3 mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Keep List */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <Settings className="h-4 w-4 text-primary" />
                <h4 className="text-base font-semibold text-foreground">
                  {tool('removePunctuation.customKeepList')}
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <Input
                    id="customKeepList"
                    placeholder={tool('removePunctuation.customKeepListPlaceholder')}
                    value={options.customKeepList}
                    onChange={(e) => handleOptionChange('customKeepList', e.target.value)}
                    className={customKeepError ? 'border-destructive' : ''}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {tool('removePunctuation.customKeepListHint')}
                  </p>
                  {customKeepError && (
                    <div className="flex items-start gap-2 mt-2 p-2 bg-destructive/10 text-destructive rounded text-xs">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{customKeepError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ToolOptionsAccordion>

        {/* Analytics */}
        {analytics && text && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <h3 className="text-base font-semibold text-foreground mb-3">
              {tool('removePunctuation.analytics.title')}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{analytics.originalLength}</div>
                <div className="text-xs text-muted-foreground">{tool('removePunctuation.analytics.originalLength')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.charactersRemoved}</div>
                <div className="text-xs text-muted-foreground">{tool('removePunctuation.analytics.charactersRemoved')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.reductionPercentage}%</div>
                <div className="text-xs text-muted-foreground">{tool('removePunctuation.analytics.reductionPercentage')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics.punctuationFound.length}</div>
                <div className="text-xs text-muted-foreground">{tool('removePunctuation.analytics.uniquePunctuation')}</div>
              </div>
            </div>

            {/* Protected Elements */}
            {(analytics.protectedElements.emails > 0 || 
              analytics.protectedElements.urls > 0 || 
              analytics.protectedElements.contractions > 0 || 
              analytics.protectedElements.hyphens > 0) && (
              <div className="pt-3 border-t border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  {tool('removePunctuation.analytics.protectedElements')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {analytics.protectedElements.emails > 0 && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-blue-500" />
                      <span>{analytics.protectedElements.emails} {tool('removePunctuation.analytics.emails')}</span>
                    </div>
                  )}
                  {analytics.protectedElements.urls > 0 && (
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3 text-green-500" />
                      <span>{analytics.protectedElements.urls} {tool('removePunctuation.analytics.urls')}</span>
                    </div>
                  )}
                  {analytics.protectedElements.contractions > 0 && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-purple-500" />
                      <span>{analytics.protectedElements.contractions} {tool('removePunctuation.analytics.contractions')}</span>
                    </div>
                  )}
                  {analytics.protectedElements.hyphens > 0 && (
                    <div className="flex items-center gap-1">
                      <Minus className="h-3 w-3 text-orange-500" />
                      <span>{analytics.protectedElements.hyphens} {tool('removePunctuation.analytics.hyphens')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Punctuation Found */}
            {analytics.punctuationFound.length > 0 && (
              <div className="pt-3 border-t border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  {tool('removePunctuation.analytics.punctuationFound')}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analytics.punctuationFound.map((char, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center justify-center w-6 h-6 bg-muted border rounded text-xs font-mono"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Warning for aggressive settings */}
        {(!options.keepApostrophes || !options.keepEmailUrl || !options.keepNumbers) && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {tool('removePunctuation.warning')}
            </p>
          </div>
        )}
      </div>
    </BaseTextConverter>
  );
}
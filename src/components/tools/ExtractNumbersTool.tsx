'use client';

import React, { useState, useCallback } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { NumberAnalytics } from '@/components/shared/NumberAnalytics';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Settings, Sparkles, Check } from 'lucide-react';
import { downloadTextAsFile } from '@/lib/utils';

interface ExtractionOptions {
  keepDecimals: boolean;
  keepNegatives: boolean;
  respectThousandsSeparators: boolean;
  acceptScientificNotation: boolean;
  outputUniqueOnly: boolean;
  phoneNumbersMode: boolean;
  percentageHandling: 'keep-symbol' | 'strip-symbol' | 'convert-decimal';
  outputFormat: 'one-per-line' | 'csv';
  keepCurrency: string[];
}

export function ExtractNumbersTool() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [extractedNumbers, setExtractedNumbers] = useState('');
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [ctaButtonState, setCtaButtonState] = useState<'idle' | 'success' | 'no-results'>('idle');
  
  // Options state
  const [options, setOptions] = useState<ExtractionOptions>({
    keepDecimals: true,
    keepNegatives: true,
    respectThousandsSeparators: true,
    acceptScientificNotation: false,
    outputUniqueOnly: false,
    phoneNumbersMode: false,
    percentageHandling: 'strip-symbol',
    outputFormat: 'one-per-line',
    keepCurrency: ['$', '€', '£']
  });

  // Currency symbols for selection
  const currencySymbols = ['$', '€', '£', '¥', '₹', '₽', 'TND', 'د.ت'];

  const extractNumbers = useCallback((
    inputText: string,
    opts: ExtractionOptions
  ): string[] => {
    if (!inputText) {
      return [];
    }

    const numbers: string[] = [];

    // Phone numbers mode - exclusive mode
    if (opts.phoneNumbersMode) {
      // E.164 format: +[1-9]\d{1,14}
      const e164Pattern = /\+[1-9]\d{1,14}/g;
      // US format: (XXX) XXX-XXXX or XXX-XXX-XXXX
      const usPattern = /(\(\d{3}\)\s*\d{3}-\d{4}|\d{3}-\d{3}-\d{4})/g;
      // International formats
      const intlPattern = /\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{4,}/g;
      
      const e164Matches = inputText.match(e164Pattern) || [];
      const usMatches = inputText.match(usPattern) || [];
      const intlMatches = inputText.match(intlPattern) || [];
      
      // Normalize all to E.164 format (simplified - just extract digits and add +)
      [...e164Matches, ...usMatches, ...intlMatches].forEach(phone => {
        const digits = phone.replace(/\D/g, '');
        if (digits.length >= 10) {
          numbers.push(phone.startsWith('+') ? phone : `+${digits}`);
        }
      });
      
      return opts.outputUniqueOnly ? [...new Set(numbers)] : numbers;
    }

    // Build regex patterns based on options
    const patterns: RegExp[] = [];

    // Scientific notation (e.g., 1.2e6, 3E-4)
    if (opts.acceptScientificNotation) {
      patterns.push(/-?\d+\.?\d*[eE][+-]?\d+/g);
    }

    // Thousands separators (e.g., 1,234.56 or 1.234,56)
    if (opts.respectThousandsSeparators) {
      // US/UK format: 1,234.56
      patterns.push(/-?\d{1,3}(?:,\d{3})+(?:\.\d+)?/g);
      // EU format: 1.234,56
      patterns.push(/-?\d{1,3}(?:\.\d{3})+(?:,\d+)?/g);
    }

    // Decimals (e.g., 123.45, -42.7)
    if (opts.keepDecimals) {
      patterns.push(/-?\d+\.\d+/g);
      patterns.push(/-?\d+,\d+/g); // EU decimal separator
    }

    // Percentages (e.g., 25%, -10.5%)
    patterns.push(/-?\d+\.?\d*%/g);

    // Currency patterns
    if (opts.keepCurrency.length > 0) {
      const currencyChars = opts.keepCurrency.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      patterns.push(new RegExp(`(?:${currencyChars})\\s*-?\\d+\\.?\\d*`, 'g'));
      patterns.push(new RegExp(`-?\\d+\\.?\\d*\\s*(?:${currencyChars})`, 'g'));
    }

    // Basic integers (always included)
    patterns.push(/-?\d+/g);

    // Extract numbers using all patterns
    const foundNumbers = new Set<string>();
    patterns.forEach(pattern => {
      const matches = inputText.match(pattern);
      if (matches) {
        matches.forEach(match => foundNumbers.add(match));
      }
    });

    // Process found numbers
    foundNumbers.forEach(num => {
      let processed = num;

      // Handle negatives
      if (!opts.keepNegatives && processed.startsWith('-')) {
        processed = processed.substring(1);
      }

      // Handle currency symbols
      const hasCurrency = opts.keepCurrency.some(symbol => processed.includes(symbol));
      if (hasCurrency) {
        // Keep or strip based on option (for now, keep the number part)
        processed = processed.replace(/[^\d.,-]/g, '');
      }

      // Handle percentages
      if (processed.includes('%')) {
        const numValue = parseFloat(processed.replace('%', ''));
        if (!isNaN(numValue)) {
          switch (opts.percentageHandling) {
            case 'keep-symbol':
              processed = `${numValue}%`;
              break;
            case 'strip-symbol':
              processed = numValue.toString();
              break;
            case 'convert-decimal':
              processed = (numValue / 100).toString();
              break;
          }
        }
      }

      // Clean up thousands separators for final output
      if (opts.respectThousandsSeparators) {
        // Keep the number as-is for display
      } else {
        processed = processed.replace(/,/g, '');
      }

      // Validate it's a valid number
      const testNum = processed.replace(/[,\s]/g, '').replace(',', '.');
      if (!isNaN(parseFloat(testNum)) || processed.includes('e') || processed.includes('E') || processed.includes('+')) {
        numbers.push(processed);
      }
    });

    // Remove duplicates if requested
    const result = opts.outputUniqueOnly ? [...new Set(numbers)] : numbers;
    
    return result;
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleExtractNumbers = useCallback(() => {
    const numbers = extractNumbers(text, options);
    
    if (options.outputFormat === 'csv') {
      setExtractedNumbers(numbers.join(', '));
    } else {
      setExtractedNumbers(numbers.join('\n'));
    }

    // Show feedback
    if (numbers.length > 0) {
      setCtaButtonState('success');
      setTimeout(() => setCtaButtonState('idle'), 2000);
    } else {
      setCtaButtonState('no-results');
      setTimeout(() => setCtaButtonState('idle'), 2000);
    }
  }, [text, options, extractNumbers]);

  const handleFileUploaded = (content: string) => {
    const numbers = extractNumbers(content, options);
    setExtractedNumbers(numbers.join('\n'));
  };

  const handleDownloadCSV = useCallback(() => {
    if (!extractedNumbers) return;
    
    const numbers = extractedNumbers.split(/[\n,]+/).map(n => n.trim()).filter(n => n);
    const csvContent = 'number\n' + numbers.join('\n');
    downloadTextAsFile(csvContent, 'extracted-numbers.csv');
  }, [extractedNumbers]);

  const handleDownloadText = useCallback(() => {
    if (!extractedNumbers) return;
    const brandedContent = `Downloaded from TextCaseConverter.net
=====================================

${extractedNumbers}`;
    downloadTextAsFile(brandedContent, 'extracted-numbers.txt');
  }, [extractedNumbers]);

  const toggleCurrency = (symbol: string) => {
    setOptions(prev => ({
      ...prev,
      keepCurrency: prev.keepCurrency.includes(symbol)
        ? prev.keepCurrency.filter(s => s !== symbol)
        : [...prev.keepCurrency, symbol]
    }));
  };

  // Handle responsive accordion behavior
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsAccordionOpen(true);
      } else {
        setIsAccordionOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BaseTextConverter
      title={tool('extractNumbers.title')}
      description={tool('extractNumbers.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('extractNumbers.outputLabel')}
      inputPlaceholder={tool('extractNumbers.inputPlaceholder')}
      copyText={tool('extractNumbers.copyList')}
      clearText={common('buttons.clear')}
      downloadText={tool('extractNumbers.downloadCSV')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName="extracted-numbers.csv"
      onTextChange={handleTextChange}
      text={text}
      convertedText={extractedNumbers}
      onConvertedTextUpdate={setExtractedNumbers}
      onFileUploaded={handleFileUploaded}
      showAnalytics={false}
      mobileLayout="2x2"
      onDownloadPrimary={handleDownloadCSV}
      onDownloadSecondary={handleDownloadText}
      downloadSecondaryText={tool('extractNumbers.downloadTXT', 'Download TXT')}
      showSecondaryDownload={true}
    >
      <div className="space-y-3">
        {/* Primary CTA Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleExtractNumbers}
            variant="default"
            size="lg"
            className={`gap-2 transition-all duration-300 ${
              ctaButtonState === 'success'
                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                : ctaButtonState === 'no-results'
                ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700'
                : ''
            }`}
            disabled={!text}
          >
            {ctaButtonState === 'success' ? (
              <>
                <Check className="h-4 w-4" />
                {tool('extractNumbers.numbersExtracted') || 'Numbers extracted!'}
              </>
            ) : ctaButtonState === 'no-results' ? (
              <>
                <Sparkles className="h-4 w-4" />
                {tool('extractNumbers.noNumbersFound') || 'No numbers found'}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {tool('extractNumbers.extractButton')}
              </>
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <div className="text-center text-sm text-muted-foreground">
          {tool('extractNumbers.helperText')}
        </div>

        {/* Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('extractNumbers.optionsTitle')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Number Format Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Settings className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('extractNumbers.numberFormatTitle')}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Keep Decimals */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                    <label htmlFor="keep-decimals" className="text-sm font-medium cursor-pointer flex-1 pr-2">
                      {tool('extractNumbers.keepDecimals')}
                    </label>
                    <Switch
                      id="keep-decimals"
                      checked={options.keepDecimals}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, keepDecimals: checked }))}
                    />
                  </div>

                  {/* Keep Negatives */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                    <label htmlFor="keep-negatives" className="text-sm font-medium cursor-pointer flex-1 pr-2">
                      {tool('extractNumbers.keepNegatives')}
                    </label>
                    <Switch
                      id="keep-negatives"
                      checked={options.keepNegatives}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, keepNegatives: checked }))}
                    />
                  </div>

                  {/* Thousands Separators */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                    <label htmlFor="thousands-sep" className="text-sm font-medium cursor-pointer flex-1 pr-2">
                      {tool('extractNumbers.thousandsSeparators')}
                    </label>
                    <Switch
                      id="thousands-sep"
                      checked={options.respectThousandsSeparators}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, respectThousandsSeparators: checked }))}
                    />
                  </div>

                  {/* Scientific Notation */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                    <label htmlFor="scientific" className="text-sm font-medium cursor-pointer flex-1 pr-2">
                      {tool('extractNumbers.scientificNotation')}
                    </label>
                    <Switch
                      id="scientific"
                      checked={options.acceptScientificNotation}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, acceptScientificNotation: checked }))}
                    />
                  </div>

                  {/* Unique Only */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                    <label htmlFor="unique-only" className="text-sm font-medium cursor-pointer flex-1 pr-2">
                      {tool('extractNumbers.uniqueOnly')}
                    </label>
                    <Switch
                      id="unique-only"
                      checked={options.outputUniqueOnly}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, outputUniqueOnly: checked }))}
                    />
                  </div>

                  {/* Phone Numbers Mode */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                    <label htmlFor="phone-mode" className="text-sm font-medium cursor-pointer flex-1 pr-2">
                      {tool('extractNumbers.phoneNumbersMode')}
                    </label>
                    <Switch
                      id="phone-mode"
                      checked={options.phoneNumbersMode}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, phoneNumbersMode: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Percentage Handling */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  {tool('extractNumbers.percentageHandling')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={options.percentageHandling === 'keep-symbol' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOptions(prev => ({ ...prev, percentageHandling: 'keep-symbol' }))}
                    className="text-xs"
                  >
                    {tool('extractNumbers.keepPercent')}
                  </Button>
                  <Button
                    variant={options.percentageHandling === 'strip-symbol' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOptions(prev => ({ ...prev, percentageHandling: 'strip-symbol' }))}
                    className="text-xs"
                  >
                    {tool('extractNumbers.stripPercent')}
                  </Button>
                  <Button
                    variant={options.percentageHandling === 'convert-decimal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOptions(prev => ({ ...prev, percentageHandling: 'convert-decimal' }))}
                    className="text-xs"
                  >
                    {tool('extractNumbers.convertDecimal')}
                  </Button>
                </div>
              </div>

              {/* Currency Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  {tool('extractNumbers.currencyLabel')}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {currencySymbols.map(symbol => (
                    <Button
                      key={symbol}
                      variant={options.keepCurrency.includes(symbol) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleCurrency(symbol)}
                      className="text-xs h-9"
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Output Format */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  {tool('extractNumbers.outputFormat')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={options.outputFormat === 'one-per-line' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOptions(prev => ({ ...prev, outputFormat: 'one-per-line' }))}
                    className="text-xs"
                  >
                    {tool('extractNumbers.onePerLine')}
                  </Button>
                  <Button
                    variant={options.outputFormat === 'csv' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOptions(prev => ({ ...prev, outputFormat: 'csv' }))}
                    className="text-xs"
                  >
                    {tool('extractNumbers.csvFormat')}
                  </Button>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>

        {/* Number Statistics */}
        {extractedNumbers && (
          <NumberAnalytics
            numbers={extractedNumbers}
            variant="compact"
            showTitle={false}
          />
        )}
      </div>
    </BaseTextConverter>
  );
}

'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseRandomGenerator } from '@/components/shared/BaseRandomGenerator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ValidationErrors {
  startYear?: string;
  endYear?: string;
  quantity?: string;
}

type OutputFormat = 'numeric' | 'short' | 'long' | 'yearMonth';

export function RandomMonthGenerator() {
  const { common, tool } = useToolTranslations('tools/random-generators');
  
  // Form state
  const [startYear, setStartYear] = useState<string>('2020');
  const [endYear, setEndYear] = useState<string>('2030');
  const [quantity, setQuantity] = useState<string>('10');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('long');
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);
  const [sortResults, setSortResults] = useState<boolean>(false);
  
  // Generated content state
  const [generatedMonths, setGeneratedMonths] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Month names for different formats
  const monthNames = {
    long: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    short: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
  };

  // Validation function
  const validateInputs = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Parse inputs
    const qty = parseInt(quantity);
    const startYr = parseInt(startYear);
    const endYr = parseInt(endYear);

    // Validate start year
    if (!startYear.trim()) {
      errors.startYear = tool('randomMonth.validation.startYearRequired');
    } else if (isNaN(startYr) || startYr < 1900 || startYr > 2100) {
      errors.startYear = tool('randomMonth.validation.invalidYear');
    }

    // Validate end year
    if (!endYear.trim()) {
      errors.endYear = tool('randomMonth.validation.endYearRequired');
    } else if (isNaN(endYr) || endYr < 1900 || endYr > 2100) {
      errors.endYear = tool('randomMonth.validation.invalidYear');
    }

    // Validate quantity
    if (!quantity.trim()) {
      errors.quantity = tool('randomMonth.validation.quantityRequired');
    } else if (isNaN(qty) || qty < 1 || qty > 10000) {
      errors.quantity = tool('randomMonth.validation.quantityInvalid');
    }

    // Cross-validation
    if (!isNaN(startYr) && !isNaN(endYr)) {
      if (endYr < startYr) {
        errors.endYear = tool('randomMonth.validation.endBeforeStart');
      }
      
      // Check if quantity is valid when duplicates are not allowed
      if (!allowDuplicates && !isNaN(qty)) {
        const totalMonths = (endYr - startYr + 1) * 12;
        if (qty > totalMonths) {
          errors.quantity = tool('randomMonth.validation.quantityTooLarge');
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate cryptographically secure random month
  const generateSecureRandomMonth = (startYr: number, endYr: number): { year: number; month: number } => {
    const totalMonths = (endYr - startYr + 1) * 12;
    const randomBytes = new Uint8Array(4);
    crypto.getRandomValues(randomBytes);
    
    // Convert bytes to a number between 0 and 1
    const randomValue = randomBytes.reduce((acc, byte, index) => acc + byte * Math.pow(256, index), 0) / Math.pow(256, 4);
    
    const randomMonthIndex = Math.floor(randomValue * totalMonths);
    const year = startYr + Math.floor(randomMonthIndex / 12);
    const month = (randomMonthIndex % 12) + 1; // 1-12
    
    return { year, month };
  };

  // Format month based on selected format
  const formatMonth = (year: number, month: number): string => {
    switch (outputFormat) {
      case 'numeric':
        return month.toString().padStart(2, '0');
      case 'short':
        return monthNames.short[month - 1];
      case 'long':
        return monthNames.long[month - 1];
      case 'yearMonth':
        return `${monthNames.long[month - 1]} ${year}`;
      default:
        return monthNames.long[month - 1];
    }
  };

  // Generate random months
  const handleGenerate = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const startYr = parseInt(startYear);
      const endYr = parseInt(endYear);
      const qty = parseInt(quantity);
      
      const months: { year: number; month: number }[] = [];
      const usedMonths = new Set<string>();
      
      for (let i = 0; i < qty; i++) {
        let randomMonth: { year: number; month: number };
        
        if (allowDuplicates) {
          randomMonth = generateSecureRandomMonth(startYr, endYr);
        } else {
          // Generate unique months
          let attempts = 0;
          do {
            randomMonth = generateSecureRandomMonth(startYr, endYr);
            attempts++;
            // Prevent infinite loops
            if (attempts > qty * 10) break;
          } while (usedMonths.has(`${randomMonth.year}-${randomMonth.month}`) && usedMonths.size < (endYr - startYr + 1) * 12);
          
          usedMonths.add(`${randomMonth.year}-${randomMonth.month}`);
        }
        
        months.push(randomMonth);
      }
      
      // Sort months chronologically if requested
      if (sortResults) {
        months.sort((a, b) => {
          if (a.year !== b.year) {
            return a.year - b.year;
          }
          return a.month - b.month;
        });
      }
      
      // Format output
      const formattedMonths = months.map(({ year, month }) => formatMonth(year, month));
      const output = formattedMonths.join('\n');
      setGeneratedMonths(output);
      
    } catch (error) {
      console.error('Error generating random months:', error);
      setValidationErrors({ quantity: 'An error occurred while generating months' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setGeneratedMonths('');
    setValidationErrors({});
  };

  const HelpTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <BaseRandomGenerator
      title={tool('randomMonth.title')}
      description={tool('randomMonth.description')}
      generateButtonText={tool('randomMonth.generateButton')}
      outputLabel={tool('randomMonth.outputLabel')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      downloadFileName={tool('randomMonth.downloadFileName')}
      onGenerate={handleGenerate}
      generatedContent={generatedMonths}
      onClearContent={handleClear}
      isGenerating={isGenerating}
      useMonoFont={true}
      showAnalytics={true}
      analyticsVariant="compact"
      analyticsType="month"
      alwaysShowActions={true}
      alwaysShowAnalytics={true}
      hideUploadButton={true}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Year Range Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="startYear">{tool('randomMonth.options.startYear')}</Label>
              <HelpTooltip content={tool('randomMonth.help.startYear')} />
            </div>
            <Input
              id="startYear"
              type="number"
              min="1900"
              max="2100"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder={tool('randomMonth.placeholders.startYear')}
              className={validationErrors.startYear ? 'border-destructive' : ''}
            />
            {validationErrors.startYear && (
              <p className="text-sm text-destructive">{validationErrors.startYear}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="endYear">{tool('randomMonth.options.endYear')}</Label>
              <HelpTooltip content={tool('randomMonth.help.endYear')} />
            </div>
            <Input
              id="endYear"
              type="number"
              min="1900"
              max="2100"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              placeholder={tool('randomMonth.placeholders.endYear')}
              className={validationErrors.endYear ? 'border-destructive' : ''}
            />
            {validationErrors.endYear && (
              <p className="text-sm text-destructive">{validationErrors.endYear}</p>
            )}
          </div>
        </div>

        {/* Generation Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="quantity">{tool('randomMonth.options.quantity')}</Label>
              <HelpTooltip content={tool('randomMonth.help.quantity')} />
            </div>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="10000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={tool('randomMonth.placeholders.quantity')}
              className={validationErrors.quantity ? 'border-destructive' : ''}
            />
            {validationErrors.quantity && (
              <p className="text-sm text-destructive">{validationErrors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="outputFormat">{tool('randomMonth.options.outputFormat')}</Label>
              <HelpTooltip content={tool('randomMonth.help.outputFormat')} />
            </div>
            <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numeric">{tool('randomMonth.options.numeric')}</SelectItem>
                <SelectItem value="short">{tool('randomMonth.options.short')}</SelectItem>
                <SelectItem value="long">{tool('randomMonth.options.long')}</SelectItem>
                <SelectItem value="yearMonth">{tool('randomMonth.options.yearMonth')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="allowDuplicates">{tool('randomMonth.options.allowDuplicates')}</Label>
              <HelpTooltip content={tool('randomMonth.help.allowDuplicates')} />
            </div>
            <Switch
              id="allowDuplicates"
              checked={allowDuplicates}
              onCheckedChange={setAllowDuplicates}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="sortResults">{tool('randomMonth.options.sortResults')}</Label>
              <HelpTooltip content={tool('randomMonth.help.sortResults')} />
            </div>
            <Switch
              id="sortResults"
              checked={sortResults}
              onCheckedChange={setSortResults}
            />
          </div>
        </div>
      </div>
    </BaseRandomGenerator>
  );
}
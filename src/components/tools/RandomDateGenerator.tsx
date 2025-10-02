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
  startDate?: string;
  endDate?: string;
  quantity?: string;
}

type OutputFormat = 'iso' | 'us' | 'eu' | 'readable';

export function RandomDateGenerator() {
  const { common, tool } = useToolTranslations('tools/random-generators');
  
  // Form state
  const [startDate, setStartDate] = useState<string>('2020-01-01');
  const [endDate, setEndDate] = useState<string>('2030-12-31');
  const [quantity, setQuantity] = useState<string>('10');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('iso');
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);
  
  // Generated content state
  const [generatedDates, setGeneratedDates] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Validation function
  const validateInputs = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Parse quantity
    const qty = parseInt(quantity);
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate start date
    if (!startDate.trim()) {
      errors.startDate = tool('randomDate.validation.startDateRequired');
    } else if (isNaN(start.getTime())) {
      errors.startDate = tool('randomDate.validation.invalidDate');
    }

    // Validate end date
    if (!endDate.trim()) {
      errors.endDate = tool('randomDate.validation.endDateRequired');
    } else if (isNaN(end.getTime())) {
      errors.endDate = tool('randomDate.validation.invalidDate');
    }

    // Validate quantity
    if (!quantity.trim()) {
      errors.quantity = tool('randomDate.validation.quantityRequired');
    } else if (isNaN(qty) || qty < 1 || qty > 10000) {
      errors.quantity = tool('randomDate.validation.quantityInvalid');
    }

    // Cross-validation
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      if (end <= start) {
        errors.endDate = tool('randomDate.validation.endBeforeStart');
      }
      
      // Check if quantity is valid when duplicates are not allowed
      if (!allowDuplicates && !isNaN(qty)) {
        const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (qty > daysDiff) {
          errors.quantity = tool('randomDate.validation.quantityTooLarge');
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate cryptographically secure random date
  const generateSecureRandomDate = (startTime: number, endTime: number): Date => {
    const timeRange = endTime - startTime;
    const randomBytes = new Uint8Array(4);
    crypto.getRandomValues(randomBytes);
    
    // Convert bytes to a number between 0 and 1
    const randomValue = randomBytes.reduce((acc, byte, index) => acc + byte * Math.pow(256, index), 0) / Math.pow(256, 4);
    
    const randomTime = startTime + Math.floor(randomValue * timeRange);
    return new Date(randomTime);
  };

  // Format date based on selected format
  const formatDate = (date: Date): string => {
    switch (outputFormat) {
      case 'iso':
        return date.toISOString().split('T')[0];
      case 'us':
        return date.toLocaleDateString('en-US');
      case 'eu':
        return date.toLocaleDateString('en-GB');
      case 'readable':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      default:
        return date.toISOString().split('T')[0];
    }
  };

  // Generate random dates
  const handleGenerate = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const qty = parseInt(quantity);
      
      const startTime = start.getTime();
      const endTime = end.getTime();
      
      const dates: Date[] = [];
      const usedDates = new Set<string>();
      
      for (let i = 0; i < qty; i++) {
        let randomDate: Date;
        
        if (allowDuplicates) {
          randomDate = generateSecureRandomDate(startTime, endTime);
        } else {
          // Generate unique dates
          let attempts = 0;
          do {
            randomDate = generateSecureRandomDate(startTime, endTime);
            attempts++;
            // Prevent infinite loops
            if (attempts > qty * 10) break;
          } while (usedDates.has(randomDate.toDateString()) && usedDates.size < Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1);
          
          usedDates.add(randomDate.toDateString());
        }
        
        dates.push(randomDate);
      }
      
      // Sort dates chronologically for better presentation
      dates.sort((a, b) => a.getTime() - b.getTime());
      
      // Format output
      const formattedDates = dates.map(date => formatDate(date));
      const output = formattedDates.join('\n');
      setGeneratedDates(output);
      
    } catch (error) {
      console.error('Error generating random dates:', error);
      setValidationErrors({ quantity: 'An error occurred while generating dates' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setGeneratedDates('');
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
      title={tool('randomDate.title')}
      description={tool('randomDate.description')}
      generateButtonText={tool('randomDate.generateButton')}
      outputLabel={tool('randomDate.outputLabel')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      downloadFileName={tool('randomDate.downloadFileName')}
      onGenerate={handleGenerate}
      generatedContent={generatedDates}
      onClearContent={handleClear}
      isGenerating={isGenerating}
      useMonoFont={true}
      showAnalytics={true}
      analyticsVariant="compact"
      analyticsType="date"
      alwaysShowActions={true}
      alwaysShowAnalytics={true}
      hideUploadButton={true}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Date Range Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="startDate">{tool('randomDate.options.startDate')}</Label>
              <HelpTooltip content={tool('randomDate.help.startDate')} />
            </div>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={validationErrors.startDate ? 'border-destructive' : ''}
            />
            {validationErrors.startDate && (
              <p className="text-sm text-destructive">{validationErrors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="endDate">{tool('randomDate.options.endDate')}</Label>
              <HelpTooltip content={tool('randomDate.help.endDate')} />
            </div>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={validationErrors.endDate ? 'border-destructive' : ''}
            />
            {validationErrors.endDate && (
              <p className="text-sm text-destructive">{validationErrors.endDate}</p>
            )}
          </div>
        </div>

        {/* Generation Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="quantity">{tool('randomDate.options.quantity')}</Label>
              <HelpTooltip content={tool('randomDate.help.quantity')} />
            </div>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="10000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={tool('randomDate.placeholders.quantity')}
              className={validationErrors.quantity ? 'border-destructive' : ''}
            />
            {validationErrors.quantity && (
              <p className="text-sm text-destructive">{validationErrors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="outputFormat">{tool('randomDate.options.outputFormat')}</Label>
              <HelpTooltip content={tool('randomDate.help.outputFormat')} />
            </div>
            <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iso">{tool('randomDate.options.iso')}</SelectItem>
                <SelectItem value="us">{tool('randomDate.options.us')}</SelectItem>
                <SelectItem value="eu">{tool('randomDate.options.eu')}</SelectItem>
                <SelectItem value="readable">{tool('randomDate.options.readable')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="allowDuplicates">{tool('randomDate.options.allowDuplicates')}</Label>
              <HelpTooltip content={tool('randomDate.help.allowDuplicates')} />
            </div>
            <Switch
              id="allowDuplicates"
              checked={allowDuplicates}
              onCheckedChange={setAllowDuplicates}
            />
          </div>
        </div>
      </div>
    </BaseRandomGenerator>
  );
}
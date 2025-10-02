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
  minValue?: string;
  maxValue?: string;
  quantity?: string;
}

type SortOrder = 'none' | 'ascending' | 'descending';

export function RandomNumberGenerator() {
  const { common, tool } = useToolTranslations('tools/random-generators');
  
  // Form state
  const [minValue, setMinValue] = useState<string>('1');
  const [maxValue, setMaxValue] = useState<string>('100');
  const [quantity, setQuantity] = useState<string>('10');
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  
  // Generated content state
  const [generatedNumbers, setGeneratedNumbers] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Validation function
  const validateInputs = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Parse values
    const min = parseFloat(minValue);
    const max = parseFloat(maxValue);
    const qty = parseInt(quantity);

    // Validate minimum value
    if (!minValue.trim()) {
      errors.minValue = tool('randomNumber.validation.minRequired');
    } else if (isNaN(min)) {
      errors.minValue = tool('randomNumber.validation.invalidNumber');
    }

    // Validate maximum value
    if (!maxValue.trim()) {
      errors.maxValue = tool('randomNumber.validation.maxRequired');
    } else if (isNaN(max)) {
      errors.maxValue = tool('randomNumber.validation.invalidNumber');
    }

    // Validate quantity
    if (!quantity.trim()) {
      errors.quantity = tool('randomNumber.validation.quantityRequired');
    } else if (isNaN(qty) || qty < 1 || qty > 10000) {
      errors.quantity = tool('randomNumber.validation.quantityInvalid');
    }

    // Cross-validation
    if (!isNaN(min) && !isNaN(max)) {
      if (max <= min) {
        errors.maxValue = tool('randomNumber.validation.minMaxInvalid');
      }
      
      // Check if quantity is valid when duplicates are not allowed
      if (!allowDuplicates && !isNaN(qty)) {
        const range = Math.floor(max) - Math.ceil(min) + 1;
        if (qty > range) {
          errors.quantity = tool('randomNumber.validation.quantityTooLarge');
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate cryptographically secure random numbers
  const generateSecureRandomNumber = (min: number, max: number): number => {
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const threshold = Math.floor(maxValue / range) * range;
    
    let randomValue;
    do {
      const randomBytes = new Uint8Array(bytesNeeded);
      crypto.getRandomValues(randomBytes);
      randomValue = randomBytes.reduce((acc, byte, index) => acc + byte * Math.pow(256, index), 0);
    } while (randomValue >= threshold);
    
    return Math.floor(min + (randomValue % range));
  };

  // Generate random numbers
  const handleGenerate = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const min = Math.ceil(parseFloat(minValue));
      const max = Math.floor(parseFloat(maxValue));
      const qty = parseInt(quantity);
      
      const numbers: number[] = [];
      const usedNumbers = new Set<number>();
      
      for (let i = 0; i < qty; i++) {
        let randomNum: number;
        
        if (allowDuplicates) {
          randomNum = generateSecureRandomNumber(min, max);
        } else {
          // Generate unique numbers
          do {
            randomNum = generateSecureRandomNumber(min, max);
          } while (usedNumbers.has(randomNum) && usedNumbers.size < (max - min + 1));
          
          usedNumbers.add(randomNum);
        }
        
        numbers.push(randomNum);
      }
      
      // Apply sorting
      const sortedNumbers = [...numbers];
      if (sortOrder === 'ascending') {
        sortedNumbers.sort((a, b) => a - b);
      } else if (sortOrder === 'descending') {
        sortedNumbers.sort((a, b) => b - a);
      }
      
      // Format output
      const output = sortedNumbers.join('\n');
      setGeneratedNumbers(output);
      
    } catch (error) {
      console.error('Error generating random numbers:', error);
      setValidationErrors({ quantity: 'An error occurred while generating numbers' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setGeneratedNumbers('');
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
      title={tool('randomNumber.title')}
      description={tool('randomNumber.description')}
      generateButtonText={tool('randomNumber.generateButton')}
      outputLabel={tool('randomNumber.outputLabel')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      downloadFileName={tool('randomNumber.downloadFileName')}
      onGenerate={handleGenerate}
      generatedContent={generatedNumbers}
      onClearContent={handleClear}
      isGenerating={isGenerating}
      useMonoFont={true}
      showAnalytics={true}
      analyticsVariant="compact"
      alwaysShowActions={true}
      alwaysShowAnalytics={true}
      hideUploadButton={true}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Range Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="minValue">{tool('randomNumber.options.minValue')}</Label>
              <HelpTooltip content={tool('randomNumber.help.minValue')} />
            </div>
            <Input
              id="minValue"
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              placeholder={tool('randomNumber.placeholders.minValue')}
              className={validationErrors.minValue ? 'border-destructive' : ''}
            />
            {validationErrors.minValue && (
              <p className="text-sm text-destructive">{validationErrors.minValue}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="maxValue">{tool('randomNumber.options.maxValue')}</Label>
              <HelpTooltip content={tool('randomNumber.help.maxValue')} />
            </div>
            <Input
              id="maxValue"
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              placeholder={tool('randomNumber.placeholders.maxValue')}
              className={validationErrors.maxValue ? 'border-destructive' : ''}
            />
            {validationErrors.maxValue && (
              <p className="text-sm text-destructive">{validationErrors.maxValue}</p>
            )}
          </div>
        </div>

        {/* Generation Settings */}
        <div className="space-y-4">
          {/* Row 1: Quantity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="quantity">{tool('randomNumber.options.quantity')}</Label>
              <HelpTooltip content={tool('randomNumber.help.quantity')} />
            </div>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="10000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={tool('randomNumber.placeholders.quantity')}
              className={validationErrors.quantity ? 'border-destructive' : ''}
            />
            {validationErrors.quantity && (
              <p className="text-sm text-destructive">{validationErrors.quantity}</p>
            )}
          </div>

          {/* Row 2: Sort Options */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="sortOrder">{tool('randomNumber.options.sortOrder')}</Label>
              <HelpTooltip content={tool('randomNumber.help.sortResults')} />
            </div>
            <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{tool('randomNumber.options.none')}</SelectItem>
                <SelectItem value="ascending">{tool('randomNumber.options.ascending')}</SelectItem>
                <SelectItem value="descending">{tool('randomNumber.options.descending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 3: Allow Duplicates */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="allowDuplicates">{tool('randomNumber.options.allowDuplicates')}</Label>
              <HelpTooltip content={tool('randomNumber.help.allowDuplicates')} />
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
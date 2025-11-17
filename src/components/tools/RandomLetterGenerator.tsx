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
  quantity?: string;
}

type CaseType = 'uppercase' | 'lowercase' | 'mixed';
type OutputFormat = 'continuous' | 'spaced' | 'lines';

export function RandomLetterGenerator() {
  const { common, tool } = useToolTranslations('tools/random-generators');
  
  // Form state
  const [quantity, setQuantity] = useState<string>('10');
  const [caseType, setCaseType] = useState<CaseType>('mixed');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('spaced');
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);
  
  // Generated content state
  const [generatedLetters, setGeneratedLetters] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Validation function
  const validateInputs = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Parse quantity
    const qty = parseInt(quantity);

    // Validate quantity
    if (!quantity.trim()) {
      errors.quantity = tool('randomLetter.validation.quantityRequired');
    } else if (isNaN(qty) || qty < 1 || qty > 10000) {
      errors.quantity = tool('randomLetter.validation.quantityInvalid');
    }

    // Check if quantity is valid when duplicates are not allowed
    if (!allowDuplicates && !isNaN(qty)) {
      const maxUniqueLetters = caseType === 'mixed' ? 52 : 26;
      if (qty > maxUniqueLetters) {
        errors.quantity = tool('randomLetter.validation.quantityTooLarge');
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate cryptographically secure random letters
  const generateSecureRandomLetter = (availableLetters: string[]): string => {
    const randomBytes = new Uint8Array(1);
    crypto.getRandomValues(randomBytes);
    const randomIndex = randomBytes[0] % availableLetters.length;
    return availableLetters[randomIndex];
  };

  // Get available letters based on case type
  const getAvailableLetters = (): string[] => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'.split('');
    
    switch (caseType) {
      case 'uppercase':
        return uppercase;
      case 'lowercase':
        return lowercase;
      case 'mixed':
        return [...uppercase, ...lowercase];
      default:
        return [...uppercase, ...lowercase];
    }
  };

  // Format output based on selected format
  const formatOutput = (letters: string[]): string => {
    switch (outputFormat) {
      case 'continuous':
        return letters.join('');
      case 'spaced':
        return letters.join(' ');
      case 'lines':
        return letters.join('\n');
      default:
        return letters.join(' ');
    }
  };

  // Generate random letters
  const handleGenerate = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const qty = parseInt(quantity);
      const availableLetters = getAvailableLetters();
      
      const letters: string[] = [];
      const usedLetters = new Set<string>();
      
      for (let i = 0; i < qty; i++) {
        let randomLetter: string;
        
        if (allowDuplicates) {
          randomLetter = generateSecureRandomLetter(availableLetters);
        } else {
          // Generate unique letters
          const remainingLetters = availableLetters.filter(letter => !usedLetters.has(letter));
          if (remainingLetters.length === 0) break; // No more unique letters available
          
          randomLetter = generateSecureRandomLetter(remainingLetters);
          usedLetters.add(randomLetter);
        }
        
        letters.push(randomLetter);
      }
      
      // Format output
      const output = formatOutput(letters);
      setGeneratedLetters(output);
      
    } catch (error) {
      console.error('Error generating random letters:', error);
      setValidationErrors({ quantity: tool('randomLetter.validation.generationError') });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setGeneratedLetters('');
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
      title={tool('randomLetter.title')}
      description={tool('randomLetter.description')}
      generateButtonText={tool('randomLetter.generateButton')}
      outputLabel={tool('randomLetter.outputLabel')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      downloadFileName={tool('randomLetter.downloadFileName')}
      onGenerate={handleGenerate}
      generatedContent={generatedLetters}
      onClearContent={handleClear}
      isGenerating={isGenerating}
      useMonoFont={true}
      showAnalytics={true}
      analyticsVariant="compact"
      analyticsType="letter"
      alwaysShowActions={true}
      alwaysShowAnalytics={true}
      hideUploadButton={true}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Generation Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="quantity">{tool('randomLetter.options.quantity')}</Label>
              <HelpTooltip content={tool('randomLetter.help.quantity')} />
            </div>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="10000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={tool('randomLetter.placeholders.quantity')}
              className={validationErrors.quantity ? 'border-destructive' : ''}
            />
            {validationErrors.quantity && (
              <p className="text-sm text-destructive">{validationErrors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="caseType">{tool('randomLetter.options.caseType')}</Label>
              <HelpTooltip content={tool('randomLetter.help.caseType')} />
            </div>
            <Select value={caseType} onValueChange={(value: CaseType) => setCaseType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">{tool('randomLetter.options.mixed')}</SelectItem>
                <SelectItem value="uppercase">{tool('randomLetter.options.uppercase')}</SelectItem>
                <SelectItem value="lowercase">{tool('randomLetter.options.lowercase')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Output Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="outputFormat">{tool('randomLetter.options.outputFormat')}</Label>
              <HelpTooltip content={tool('randomLetter.help.outputFormat')} />
            </div>
            <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spaced">{tool('randomLetter.options.spaced')}</SelectItem>
                <SelectItem value="continuous">{tool('randomLetter.options.continuous')}</SelectItem>
                <SelectItem value="lines">{tool('randomLetter.options.lines')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="allowDuplicates">{tool('randomLetter.options.allowDuplicates')}</Label>
              <HelpTooltip content={tool('randomLetter.help.allowDuplicates')} />
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
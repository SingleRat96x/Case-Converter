'use client';

import React, { useState, useEffect } from 'react';
import { useToolTranslations, useCommonTranslations } from '@/lib/i18n/hooks';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { FeedbackMessage } from '@/components/shared/FeedbackMessage';
import { ClearConfirmDialog } from '@/components/shared/ClearConfirmDialog';
import { EnhancedResponsiveAd } from '@/components/ads/EnhancedResponsiveAd';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, Shuffle, Settings, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { copyToClipboard, downloadTextAsFile } from '@/lib/utils';

interface ValidationErrors {
  choices?: string;
  quantity?: string;
}

type OutputFormat = 'lines' | 'comma' | 'numbered' | 'bulleted';

export function RandomChoiceGenerator() {
  const { common, tool } = useToolTranslations('tools/random-generators');
  const { tSync } = useCommonTranslations();
  
  // Form state
  const [choices, setChoices] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('lines');
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);
  const [removeBlanks, setRemoveBlanks] = useState<boolean>(true);
  
  // Generated content state
  const [generatedChoices, setGeneratedChoices] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // UI state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Mobile detection for accordion default state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsAccordionOpen(!mobile); // Open on desktop, closed on mobile
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Feedback helper
  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Action handlers
  const handleCopy = async (): Promise<boolean> => {
    if (!generatedChoices.trim()) {
      showFeedback('No content to copy', 'error');
      return false;
    }
    const success = await copyToClipboard(generatedChoices);
    if (success) {
      showFeedback(tool('randomChoice.copiedMessage') || 'Copied to clipboard!');
    } else {
      showFeedback('Failed to copy to clipboard', 'error');
    }
    return success;
  };

  const handleDownload = () => {
    if (!generatedChoices.trim()) {
      showFeedback('No content to download', 'error');
      return;
    }
    downloadTextAsFile(generatedChoices, tool('randomChoice.downloadFileName'));
    showFeedback('File downloaded successfully!');
  };

  const handleClear = () => {
    if (generatedChoices.trim()) {
      setShowClearDialog(true);
    }
  };

  const confirmClear = () => {
    setChoices('');
    setGeneratedChoices('');
    setValidationErrors({});
    setShowClearDialog(false);
    showFeedback('Content cleared!');
  };

  // Validation function
  const validateInputs = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Parse quantity
    const qty = parseInt(quantity);
    const choiceList = parseChoices();

    // Validate choices
    if (!choices.trim()) {
      errors.choices = tool('randomChoice.validation.choicesRequired');
    } else if (choiceList.length === 0) {
      errors.choices = tool('randomChoice.validation.noValidChoices');
    } else if (choiceList.length === 1 && qty > 1) {
      errors.choices = tool('randomChoice.validation.needMoreChoices');
    }

    // Validate quantity
    if (!quantity.trim()) {
      errors.quantity = tool('randomChoice.validation.quantityRequired');
    } else if (isNaN(qty) || qty < 1 || qty > 1000) {
      errors.quantity = tool('randomChoice.validation.quantityInvalid');
    }

    // Check if quantity is valid when duplicates are not allowed
    if (!allowDuplicates && !isNaN(qty) && choiceList.length > 0) {
      if (qty > choiceList.length) {
        errors.quantity = tool('randomChoice.validation.quantityTooLarge');
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Parse choices from textarea
  const parseChoices = (): string[] => {
    const lines = choices.split(/\r?\n/);
    let choiceList = lines
      .map(line => line.trim())
      .filter(line => removeBlanks ? line.length > 0 : true);
    
    // Remove duplicates if needed
    if (!allowDuplicates) {
      choiceList = [...new Set(choiceList)];
    }
    
    return choiceList;
  };

  // Generate cryptographically secure random choice
  const generateSecureRandomChoice = (availableChoices: string[]): string => {
    const randomBytes = new Uint8Array(1);
    crypto.getRandomValues(randomBytes);
    const randomIndex = randomBytes[0] % availableChoices.length;
    return availableChoices[randomIndex];
  };

  // Format output based on selected format
  const formatOutput = (selectedChoices: string[]): string => {
    switch (outputFormat) {
      case 'lines':
        return selectedChoices.join('\n');
      case 'comma':
        return selectedChoices.join(', ');
      case 'numbered':
        return selectedChoices.map((choice, index) => `${index + 1}. ${choice}`).join('\n');
      case 'bulleted':
        return selectedChoices.map(choice => `• ${choice}`).join('\n');
      default:
        return selectedChoices.join('\n');
    }
  };

  // Generate random choices
  const handleGenerate = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const qty = parseInt(quantity);
      const availableChoices = parseChoices();
      
      const selectedChoices: string[] = [];
      const usedChoices = new Set<string>();
      
      for (let i = 0; i < qty; i++) {
        let randomChoice: string;
        
        if (allowDuplicates) {
          randomChoice = generateSecureRandomChoice(availableChoices);
        } else {
          // Generate unique choices
          const remainingChoices = availableChoices.filter(choice => !usedChoices.has(choice));
          if (remainingChoices.length === 0) break; // No more unique choices available
          
          randomChoice = generateSecureRandomChoice(remainingChoices);
          usedChoices.add(randomChoice);
        }
        
        selectedChoices.push(randomChoice);
      }
      
      // Format output
      const output = formatOutput(selectedChoices);
      setGeneratedChoices(output);
      
    } catch (error) {
      console.error('Error generating random choices:', error);
      setValidationErrors({ quantity: 'An error occurred while generating choices' });
    } finally {
      setIsGenerating(false);
    }
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

  const hasContent = generatedChoices.trim().length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Heading */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">{tool('randomChoice.title')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {tool('randomChoice.description')}
        </p>
      </div>

      {/* Simple responsive ad below description */}
      <EnhancedResponsiveAd className="my-6" format="auto" lazy={true} />

      {/* Feedback Message */}
      <FeedbackMessage feedback={feedback} />

      {/* Main Content Section - Side by Side Layout */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Input Section */}
          <div className="w-full sm:w-1/2 space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="choices" className="text-base font-semibold">
                {tool('randomChoice.options.choices')}
              </Label>
              <HelpTooltip content={tool('randomChoice.help.choices')} />
            </div>
            <textarea
              id="choices"
              value={choices}
              onChange={(e) => setChoices(e.target.value)}
              placeholder={tool('randomChoice.placeholders.choices')}
              className={`w-full h-80 p-4 text-base border border-input bg-background rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors ${validationErrors.choices ? 'border-destructive' : ''}`}
            />
            {validationErrors.choices && (
              <p className="text-sm text-destructive">{validationErrors.choices}</p>
            )}
          </div>

          {/* Output Section */}
          <div className="w-full sm:w-1/2 space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">{tool('randomChoice.outputLabel')}</Label>
            </div>
            <div
              className="w-full h-80 p-4 border border-input bg-muted/30 rounded-lg overflow-y-auto whitespace-pre-wrap break-words text-base"
            >
              {generatedChoices || tSync('generator.contentPlaceholder')}
            </div>
          </div>
        </div>

        {/* Advanced Options Accordion */}
        <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
          <button
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="flex items-center justify-between w-full text-left focus:outline-none hover:text-foreground transition-colors rounded-md p-1 -m-1"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h3 className="text-sm font-medium">Advanced Options</h3>
            </div>
            <ChevronDown 
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                isAccordionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          <div
            className={`transition-all duration-300 ease-in-out ${
              isAccordionOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="pt-2">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Quantity */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quantity">{tool('randomChoice.options.quantity')}</Label>
                    <HelpTooltip content={tool('randomChoice.help.quantity')} />
                  </div>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={tool('randomChoice.placeholders.quantity')}
                    className={validationErrors.quantity ? 'border-destructive' : ''}
                  />
                  {validationErrors.quantity && (
                    <p className="text-sm text-destructive">{validationErrors.quantity}</p>
                  )}
                </div>

                {/* Output Format */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="outputFormat">{tool('randomChoice.options.outputFormat')}</Label>
                    <HelpTooltip content={tool('randomChoice.help.outputFormat')} />
                  </div>
                  <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lines">{tool('randomChoice.options.lines')}</SelectItem>
                      <SelectItem value="comma">{tool('randomChoice.options.comma')}</SelectItem>
                      <SelectItem value="numbered">{tool('randomChoice.options.numbered')}</SelectItem>
                      <SelectItem value="bulleted">{tool('randomChoice.options.bulleted')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Allow Duplicates */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="allowDuplicates">{tool('randomChoice.options.allowDuplicates')}</Label>
                    <HelpTooltip content={tool('randomChoice.help.allowDuplicates')} />
                  </div>
                  <Switch
                    id="allowDuplicates"
                    checked={allowDuplicates}
                    onCheckedChange={setAllowDuplicates}
                  />
                </div>

                {/* Remove Blanks */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="removeBlanks">{tool('randomChoice.options.removeBlanks')}</Label>
                    <HelpTooltip content={tool('randomChoice.help.removeBlanks')} />
                  </div>
                  <Switch
                    id="removeBlanks"
                    checked={removeBlanks}
                    onCheckedChange={setRemoveBlanks}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center py-4">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="lg"
            className="min-w-[220px] gap-2"
          >
            <Shuffle className="h-4 w-4" />
            {isGenerating ? 'Picking...' : tool('randomChoice.generateButton')}
          </Button>
        </div>

        {/* Action Buttons */}
        {hasContent && (
          <div className="flex justify-center">
            <ActionButtons
              onCopy={handleCopy}
              onClear={handleClear}
              onDownload={handleDownload}
              onUpload={() => false}
              copyText={common('buttons.copy')}
              clearText={common('buttons.clear')}
              downloadText={common('buttons.download')}
              uploadText=""
              hasContent={hasContent}
              showUpload={false}
            />
          </div>
        )}
      </div>

      {/* Clear Confirmation Dialog */}
      <ClearConfirmDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={confirmClear}
      />
    </div>
  );
}
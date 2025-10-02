'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseRomanDateConverter } from '@/components/shared/BaseRomanDateConverter';
import { RomanDateDisplay } from '@/components/shared/RomanDateDisplay';
import { RomanNumeralTable } from './roman/RomanNumeralTable';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { 
  formatRomanDate, 
  romanDateToDate,
  validateDateRange,
  type RomanDateFormat
} from '@/lib/romanNumeralTransforms';

type ConversionMode = 'modernToRoman' | 'romanToModern';

export function RomanNumeralDateConverter() {
  const { tool } = useToolTranslations('tools/miscellaneous');
  
  // State
  const [inputText, setInputText] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [outputText, setOutputText] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<RomanDateFormat>('classical');
  const [mode, setMode] = useState<ConversionMode>('modernToRoman');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Handle conversion
  const handleConversion = useCallback(async (input: string, conversionMode: ConversionMode, format: RomanDateFormat) => {
    if (!input.trim()) {
      setOutputText('');
      return;
    }

    setIsAnimating(true);
    
    try {
      // Add delay for smooth animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let result: string;
      
      if (conversionMode === 'modernToRoman') {
        // Convert modern date to Roman
        const date = new Date(input + 'T00:00:00');
        if (isNaN(date.getTime())) {
          result = tool('romanNumeralDate.errors.invalidDate');
        } else {
          const validation = validateDateRange(date);
          if (!validation.valid) {
            result = validation.error || tool('romanNumeralDate.errors.dateOutOfRange');
          } else {
            const conversionResult = formatRomanDate(date, format);
            result = conversionResult.success 
              ? conversionResult.result! 
              : conversionResult.error || tool('romanNumeralDate.errors.conversionFailed');
          }
        }
      } else {
        // Convert Roman date to modern
        try {
          const date = romanDateToDate(input);
          result = date ? date.toISOString().split('T')[0] : tool('romanNumeralDate.errors.invalidRomanDate');
        } catch {
          result = tool('romanNumeralDate.errors.conversionFailed');
        }
      }

      setOutputText(result);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);
      
    } catch (error) {
      console.error('Error in conversion:', error);
      setOutputText(tool('romanNumeralDate.errors.conversionFailed'));
      setIsAnimating(false);
    } finally {
      // Animation cleanup handled above
    }
  }, [tool]);

  // Convert when input, mode, or format changes
  useEffect(() => {
    handleConversion(inputText, mode, outputFormat);
  }, [inputText, mode, outputFormat, handleConversion]);

  // Handle text change
  const handleTextChange = (text: string) => {
    setInputText(text);
  };

  // Handle mode change
  const handleModeChange = (newMode: ConversionMode) => {
    setMode(newMode);
    // Clear input when switching modes
    setInputText('');
    setOutputText('');
  };

  // Insert current date (only for modern to Roman mode)
  const insertCurrentDate = () => {
    const today = new Date().toISOString().split('T')[0];
    setInputText(today);
  };


  return (
    <BaseRomanDateConverter
      title={tool('romanNumeralDate.title')}
      description={tool('romanNumeralDate.description')}
    >
      {/* Conversion Mode Toggle */}
      <div className="mb-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-md border border-border bg-card p-1">
            <Button
              variant={mode === 'modernToRoman' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleModeChange('modernToRoman')}
              className="rounded-sm"
            >
              {tool('romanNumeralDate.toggleLabels.modernToRoman')}
            </Button>
            <Button
              variant={mode === 'romanToModern' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleModeChange('romanToModern')}
              className="rounded-sm"
            >
              {tool('romanNumeralDate.toggleLabels.romanToModern')}
            </Button>
          </div>
        </div>
      </div>

      {/* Dynamic Input */}
      <div className="space-y-4">
        <Label htmlFor="input-field" className="text-base font-medium">
          {mode === 'modernToRoman' 
            ? tool('romanNumeralDate.inputLabels.modernInput') 
            : tool('romanNumeralDate.inputLabels.romanInput')
          }
        </Label>
        
        {mode === 'modernToRoman' ? (
          // Date input for modern to Roman
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                id="input-field"
                type="date"
                value={inputText}
                onChange={(e) => handleTextChange(e.target.value)}
                className="pl-10 h-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0"
                onClick={(e) => {
                  const input = e.currentTarget;
                  input.showPicker?.();
                }}
              />
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={insertCurrentDate}
              className="flex items-center gap-2 h-10 px-4 whitespace-nowrap"
            >
              <Clock className="h-4 w-4" />
              {tool('romanNumeralDate.quickInput.today')}
            </Button>
          </div>
        ) : (
          // Text input for Roman to modern
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Input
                id="input-field"
                type="text"
                value={inputText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={tool('romanNumeralDate.placeholders.romanInput')}
                className="h-10"
              />
            </div>
          </div>
        )}
      </div>

      {/* Format Style Options - Only show for Modern → Roman */}
      {mode === 'modernToRoman' && (
        <div className="space-y-6">
          <Label className="text-base font-medium">
            {tool('romanNumeralDate.options.outputFormat')}
          </Label>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => setOutputFormat('classical')}
              className={`
                h-12 px-2 py-2 rounded-lg border transition-all duration-200 flex flex-col justify-center items-center gap-0.5
                ${outputFormat === 'classical' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card hover:bg-muted border-border hover:border-muted-foreground/20'
                }
              `}
              title="DIE XXII APRILIS ANNO DOMINI MMXXV"
            >
              <span className="font-medium text-xs">{tool('romanNumeralDate.formatLabels.classical')}</span>
              <span className={`text-[10px] leading-tight text-center ${
                outputFormat === 'classical' ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                {tool('romanNumeralDate.formatDescriptions.classical')}
              </span>
            </button>
            
            <button
              onClick={() => setOutputFormat('medieval')}
              className={`
                h-12 px-2 py-2 rounded-lg border transition-all duration-200 flex flex-col justify-center items-center gap-0.5
                ${outputFormat === 'medieval' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card hover:bg-muted border-border hover:border-muted-foreground/20'
                }
              `}
              title="XXII • APRILIS • MMXXV"
            >
              <span className="font-medium text-xs">{tool('romanNumeralDate.formatLabels.medieval')}</span>
              <span className={`text-[10px] leading-tight text-center ${
                outputFormat === 'medieval' ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                {tool('romanNumeralDate.formatDescriptions.medieval')}
              </span>
            </button>
            
            <button
              onClick={() => setOutputFormat('minimal')}
              className={`
                h-12 px-2 py-2 rounded-lg border transition-all duration-200 flex flex-col justify-center items-center gap-0.5
                ${outputFormat === 'minimal' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card hover:bg-muted border-border hover:border-muted-foreground/20'
                }
              `}
              title="XXII APRILIS MMXXV"
            >
              <span className="font-medium text-xs">{tool('romanNumeralDate.formatLabels.minimal')}</span>
              <span className={`text-[10px] leading-tight text-center ${
                outputFormat === 'minimal' ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                {tool('romanNumeralDate.formatDescriptions.minimal')}
              </span>
            </button>
            
            <button
              onClick={() => setOutputFormat('decorative')}
              className={`
                h-12 px-2 py-2 rounded-lg border transition-all duration-200 flex flex-col justify-center items-center gap-0.5
                ${outputFormat === 'decorative' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card hover:bg-muted border-border hover:border-muted-foreground/20'
                }
              `}
              title="ⅩⅩⅡ • APRILIS • ⅯⅯⅩⅩⅤ"
            >
              <span className="font-medium text-xs">{tool('romanNumeralDate.formatLabels.decorative')}</span>
              <span className={`text-[10px] leading-tight text-center ${
                outputFormat === 'decorative' ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                {tool('romanNumeralDate.formatDescriptions.decorative')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Output Display */}
      <RomanDateDisplay
        romanDate={outputText}
        isAnimating={isAnimating}
        copyText={tool('romanNumeralDate.actions.copyTooltip')}
      />

      {/* Roman Numeral Reference Table */}
      <RomanNumeralTable className="mt-6" />

    </BaseRomanDateConverter>
  );
}
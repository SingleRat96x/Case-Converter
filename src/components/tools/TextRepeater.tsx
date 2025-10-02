'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { RepeatTextAnalytics } from '@/components/shared/RepeatTextAnalytics';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Plus, Minus, RotateCcw, AlertCircle } from 'lucide-react';

export function TextRepeater() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [repeatedText, setRepeatedText] = useState('');
  const [repeatCount, setRepeatCount] = useState(2);
  const [separator, setSeparator] = useState<'newline' | 'space' | 'none' | 'custom'>('newline');
  const [customSeparator, setCustomSeparator] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const MAX_REPEAT = 1000;
  const WARNING_THRESHOLD = 100;

  // Generate repeated text
  const generateRepeatedText = useCallback((inputText: string, count: number, sep: string, customSep: string) => {
    if (!inputText || count < 1) {
      setRepeatedText('');
      setShowWarning(false);
      return;
    }

    // Show warning for large repetitions
    setShowWarning(count > WARNING_THRESHOLD && inputText.length > 50);

    const actualSeparator = sep === 'newline' ? '\n' : 
                          sep === 'space' ? ' ' : 
                          sep === 'custom' ? customSep : '';

    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      results.push(inputText);
    }
    
    setRepeatedText(results.join(actualSeparator));
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);
    generateRepeatedText(newText, repeatCount, separator, customSeparator);
  };

  const handleRepeatCountChange = useCallback((newCount: number) => {
    const validCount = Math.max(1, Math.min(newCount, MAX_REPEAT));
    setRepeatCount(validCount);
    generateRepeatedText(text, validCount, separator, customSeparator);
  }, [text, separator, customSeparator, generateRepeatedText]);

  const handleSeparatorChange = (newSeparator: typeof separator) => {
    setSeparator(newSeparator);
    generateRepeatedText(text, repeatCount, newSeparator, customSeparator);
  };

  const handleCustomSeparatorChange = (newCustomSeparator: string) => {
    setCustomSeparator(newCustomSeparator);
    if (separator === 'custom') {
      generateRepeatedText(text, repeatCount, separator, newCustomSeparator);
    }
  };

  // Quick repeat buttons
  const quickRepeatOptions = [2, 5, 10, 25, 50, 100];

  // Keyboard shortcuts for repeat count
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === '+' || e.key === '=') {
        handleRepeatCountChange(repeatCount + 1);
      } else if (e.key === '-' || e.key === '_') {
        handleRepeatCountChange(repeatCount - 1);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [repeatCount, handleRepeatCountChange]);

  return (
    <BaseTextConverter
      title={tool('repeatText.title')}
      description={tool('repeatText.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('repeatText.outputLabel')}
      inputPlaceholder={tool('repeatText.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName="repeated-text.txt"
      onTextChange={handleTextChange}
      text={text}
      convertedText={repeatedText}
      onConvertedTextUpdate={setRepeatedText}
      showAnalytics={false}
      mobileLayout="2x2"
    >
      <div className="space-y-4">
        {/* Repeat Count Control */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleRepeatCountChange(repeatCount - 1)}
              disabled={repeatCount <= 1}
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <input
                type="number"
                value={repeatCount}
                onChange={(e) => handleRepeatCountChange(parseInt(e.target.value) || 1)}
                className="w-20 h-10 text-center text-lg font-bold bg-background border rounded-md"
                min="1"
                max={MAX_REPEAT}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {tool('repeatText.times')}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleRepeatCountChange(repeatCount + 1)}
              disabled={repeatCount >= MAX_REPEAT}
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Repeat Options */}
          <div className="flex flex-wrap gap-2 justify-center">
            {quickRepeatOptions.map(count => (
              <Button
                key={count}
                variant={repeatCount === count ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRepeatCountChange(count)}
                className="min-w-[60px]"
              >
                {count}x
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRepeatCountChange(1)}
              className="gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              {tool('repeatText.reset')}
            </Button>
          </div>
        </div>

        {/* Separator Options */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-center">
            {tool('repeatText.separator')}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              variant={separator === 'newline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSeparatorChange('newline')}
              className="w-full"
            >
              {tool('repeatText.separators.newline')}
            </Button>
            <Button
              variant={separator === 'space' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSeparatorChange('space')}
              className="w-full"
            >
              {tool('repeatText.separators.space')}
            </Button>
            <Button
              variant={separator === 'none' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSeparatorChange('none')}
              className="w-full"
            >
              {tool('repeatText.separators.none')}
            </Button>
            <Button
              variant={separator === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSeparatorChange('custom')}
              className="w-full"
            >
              {tool('repeatText.separators.custom')}
            </Button>
          </div>

          {/* Custom Separator Input */}
          {separator === 'custom' && (
            <div className="flex gap-2 items-center max-w-xs mx-auto">
              <input
                type="text"
                value={customSeparator}
                onChange={(e) => handleCustomSeparatorChange(e.target.value)}
                placeholder={tool('repeatText.customPlaceholder')}
                className="flex-1 h-9 px-3 bg-background border rounded-md text-sm"
              />
            </div>
          )}
        </div>

        {/* Analytics */}
        <RepeatTextAnalytics 
          originalText={text}
          repeatedText={repeatedText}
          repeatCount={repeatCount}
          separator={separator === 'newline' ? '\n' : separator === 'space' ? ' ' : separator === 'custom' ? customSeparator : ''}
          separatorType={separator}
          variant="compact"
          showTitle={false}
        />

        {/* Warning for large outputs */}
        {showWarning && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 text-warning rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{tool('repeatText.warning')}</span>
          </div>
        )}

        {/* Keyboard shortcut hint */}
        <div className="text-center text-xs text-muted-foreground">
          {tool('repeatText.hint')}
        </div>
      </div>
    </BaseTextConverter>
  );
}
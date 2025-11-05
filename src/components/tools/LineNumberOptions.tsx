'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { LineNumberFormat, LineNumberSeparator, LineNumberOptions as LineNumberOptionsType } from '@/lib/textTransforms';

interface LineNumberOptionsProps {
  options: LineNumberOptionsType;
  onOptionsChange: (options: LineNumberOptionsType) => void;
  translations: {
    startAt: string;
    step: string;
    format: string;
    separator: string;
    applyTo: string;
    skipLinesStartingWith: string;
    formats: {
      numeric: string;
      padded2: string;
      padded3: string;
      alphaUpper: string;
      alphaLower: string;
      romanUpper: string;
      romanLower: string;
    };
    separators: {
      periodSpace: string;
      parenSpace: string;
      colonSpace: string;
      hyphenSpace: string;
      pipe: string;
      tab: string;
    };
    applyToOptions: {
      all: string;
      nonEmpty: string;
    };
  };
}

export function LineNumberOptions({ options, onOptionsChange, translations }: LineNumberOptionsProps) {
  const handleStartAtChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      onOptionsChange({ ...options, startAt: num });
    }
  };

  const handleStepChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      onOptionsChange({ ...options, step: num });
    }
  };

  const handleFormatChange = (value: string) => {
    onOptionsChange({ ...options, format: value as LineNumberFormat });
  };

  const handleSeparatorChange = (value: LineNumberSeparator) => {
    onOptionsChange({ ...options, separator: value });
  };

  const handleApplyToChange = (checked: boolean) => {
    onOptionsChange({ ...options, applyTo: checked ? 'non-empty' : 'all' });
  };

  const handleSkipPatternsChange = (value: string) => {
    onOptionsChange({ ...options, skipLinesStartingWith: value });
  };

  // Get format type from full format string
  const getFormatType = () => {
    if (options.format === 'numeric' || options.format === 'padded2' || options.format === 'padded3') return 'numeric';
    if (options.format === 'alpha-upper' || options.format === 'alpha-lower') return 'alphabetic';
    if (options.format === 'roman-upper' || options.format === 'roman-lower') return 'roman';
    return 'numeric';
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Basic Settings */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-primary">⚙️</span>
          Numbering Settings
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Start At */}
          <div className="space-y-2">
            <Label htmlFor="start-at" className="text-sm font-medium">
              {translations.startAt}
            </Label>
            <Input
              id="start-at"
              type="number"
              min="1"
              value={options.startAt}
              onChange={(e) => handleStartAtChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Step */}
          <div className="space-y-2">
            <Label htmlFor="step" className="text-sm font-medium">
              {translations.step}
            </Label>
            <Input
              id="step"
              type="number"
              min="1"
              value={options.step}
              onChange={(e) => handleStepChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Format Selection */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-primary">🔢</span>
          {translations.format}
        </h3>
        
        <Tabs defaultValue={getFormatType()} onValueChange={(type) => {
          // Set default format for each type
          if (type === 'numeric') handleFormatChange('numeric');
          if (type === 'alphabetic') handleFormatChange('alpha-upper');
          if (type === 'roman') handleFormatChange('roman-upper');
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="numeric">123</TabsTrigger>
            <TabsTrigger value="alphabetic">ABC</TabsTrigger>
            <TabsTrigger value="roman">I II III</TabsTrigger>
          </TabsList>
          
          <TabsContent value="numeric" className="space-y-3 mt-4">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFormatChange('numeric')}
                className={`p-3 rounded-md border-2 transition-all text-center font-mono text-sm ${
                  options.format === 'numeric'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className="font-bold mb-1">1, 2, 3</div>
                <div className="text-xs text-muted-foreground">Standard</div>
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange('padded2')}
                className={`p-3 rounded-md border-2 transition-all text-center font-mono text-sm ${
                  options.format === 'padded2'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className="font-bold mb-1">01, 02, 03</div>
                <div className="text-xs text-muted-foreground">2-digit</div>
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange('padded3')}
                className={`p-3 rounded-md border-2 transition-all text-center font-mono text-sm ${
                  options.format === 'padded3'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className="font-bold mb-1">001, 002, 003</div>
                <div className="text-xs text-muted-foreground">3-digit</div>
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="alphabetic" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFormatChange('alpha-upper')}
                className={`p-3 rounded-md border-2 transition-all text-center font-mono text-sm ${
                  options.format === 'alpha-upper'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className="font-bold mb-1">A, B, C</div>
                <div className="text-xs text-muted-foreground">Uppercase</div>
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange('alpha-lower')}
                className={`p-3 rounded-md border-2 transition-all text-center font-mono text-sm ${
                  options.format === 'alpha-lower'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className="font-bold mb-1">a, b, c</div>
                <div className="text-xs text-muted-foreground">Lowercase</div>
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="roman" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFormatChange('roman-upper')}
                className={`p-3 rounded-md border-2 transition-all text-center font-mono text-sm ${
                  options.format === 'roman-upper'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className="font-bold mb-1">I, II, III</div>
                <div className="text-xs text-muted-foreground">Uppercase</div>
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange('roman-lower')}
                className={`p-3 rounded-md border-2 transition-all text-center font-mono text-sm ${
                  options.format === 'roman-lower'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className="font-bold mb-1">i, ii, iii</div>
                <div className="text-xs text-muted-foreground">Lowercase</div>
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Section 3: Separator */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-primary">➡️</span>
          {translations.separator}
        </h3>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { value: '. ' as LineNumberSeparator, label: '1. Text', desc: 'Period' },
            { value: ') ' as LineNumberSeparator, label: '1) Text', desc: 'Paren' },
            { value: ': ' as LineNumberSeparator, label: '1: Text', desc: 'Colon' },
            { value: ' - ' as LineNumberSeparator, label: '1 - Text', desc: 'Hyphen' },
            { value: '|' as LineNumberSeparator, label: '1|Text', desc: 'Pipe' },
            { value: '\t' as LineNumberSeparator, label: '1→Text', desc: 'Tab' },
          ].map((sep) => (
            <button
              key={sep.value}
              type="button"
              onClick={() => handleSeparatorChange(sep.value)}
              className={`p-2 rounded-md border-2 transition-all text-center ${
                options.separator === sep.value
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <div className="font-mono text-xs mb-1">{sep.label}</div>
              <div className="text-[10px] text-muted-foreground">{sep.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Section 4: Advanced Options */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-primary">⚡</span>
          Advanced Options
        </h3>
        
        <div className="space-y-4">
          {/* Non-empty lines toggle */}
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-md border">
            <div className="space-y-0.5">
              <Label htmlFor="non-empty" className="text-sm font-medium cursor-pointer">
                Number non-empty lines only
              </Label>
              <p className="text-xs text-muted-foreground">
                Skip blank lines when numbering
              </p>
            </div>
            <Switch
              id="non-empty"
              checked={options.applyTo === 'non-empty'}
              onCheckedChange={handleApplyToChange}
            />
          </div>

          {/* Skip patterns */}
          <div className="space-y-2">
            <Label htmlFor="skip-patterns" className="text-sm font-medium">
              {translations.skipLinesStartingWith}
            </Label>
            <Input
              id="skip-patterns"
              type="text"
              placeholder="e.g., //, #, ;"
              value={options.skipLinesStartingWith}
              onChange={(e) => handleSkipPatternsChange(e.target.value)}
              className="w-full font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated patterns to skip (e.g., &quot;//, #&quot; for comments)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

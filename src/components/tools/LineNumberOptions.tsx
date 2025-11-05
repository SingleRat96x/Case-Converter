'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LineNumberFormat, LineNumberSeparator, LineNumberApplyTo, LineNumberOptions as LineNumberOptionsType } from '@/lib/textTransforms';

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

  const handleFormatChange = (value: LineNumberFormat) => {
    onOptionsChange({ ...options, format: value });
  };

  const handleSeparatorChange = (value: LineNumberSeparator) => {
    onOptionsChange({ ...options, separator: value });
  };

  const handleApplyToChange = (value: LineNumberApplyTo) => {
    onOptionsChange({ ...options, applyTo: value });
  };

  const handleSkipPatternsChange = (value: string) => {
    onOptionsChange({ ...options, skipLinesStartingWith: value });
  };

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Number Format */}
      <div className="space-y-2">
        <Label htmlFor="format" className="text-sm font-medium">
          {translations.format}
        </Label>
        <Select value={options.format} onValueChange={handleFormatChange}>
          <SelectTrigger id="format" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="numeric">{translations.formats.numeric}</SelectItem>
            <SelectItem value="padded2">{translations.formats.padded2}</SelectItem>
            <SelectItem value="padded3">{translations.formats.padded3}</SelectItem>
            <SelectItem value="alpha-upper">{translations.formats.alphaUpper}</SelectItem>
            <SelectItem value="alpha-lower">{translations.formats.alphaLower}</SelectItem>
            <SelectItem value="roman-upper">{translations.formats.romanUpper}</SelectItem>
            <SelectItem value="roman-lower">{translations.formats.romanLower}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Separator */}
      <div className="space-y-2">
        <Label htmlFor="separator" className="text-sm font-medium">
          {translations.separator}
        </Label>
        <Select value={options.separator} onValueChange={handleSeparatorChange}>
          <SelectTrigger id="separator" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=". ">{translations.separators.periodSpace}</SelectItem>
            <SelectItem value=") ">{translations.separators.parenSpace}</SelectItem>
            <SelectItem value=": ">{translations.separators.colonSpace}</SelectItem>
            <SelectItem value=" - ">{translations.separators.hyphenSpace}</SelectItem>
            <SelectItem value="|">{translations.separators.pipe}</SelectItem>
            <SelectItem value="\t">{translations.separators.tab}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Apply To */}
      <div className="space-y-2">
        <Label htmlFor="apply-to" className="text-sm font-medium">
          {translations.applyTo}
        </Label>
        <Select value={options.applyTo} onValueChange={handleApplyToChange}>
          <SelectTrigger id="apply-to" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{translations.applyToOptions.all}</SelectItem>
            <SelectItem value="non-empty">{translations.applyToOptions.nonEmpty}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Skip Lines Starting With */}
      <div className="space-y-2">
        <Label htmlFor="skip-patterns" className="text-sm font-medium">
          {translations.skipLinesStartingWith}
        </Label>
        <Input
          id="skip-patterns"
          type="text"
          placeholder="//, #, ;"
          value={options.skipLinesStartingWith}
          onChange={(e) => handleSkipPatternsChange(e.target.value)}
          className="w-full font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated patterns (e.g., &quot;//, #&quot;)
        </p>
      </div>
    </div>
  );
}

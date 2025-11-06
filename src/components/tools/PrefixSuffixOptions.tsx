'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { PrefixSuffixOptions as PrefixSuffixOptionsType } from '@/lib/textTransforms';

interface PrefixSuffixOptionsProps {
  options: PrefixSuffixOptionsType;
  onOptionsChange: (options: PrefixSuffixOptionsType) => void;
  translations: {
    title: string;
    prefix: string;
    prefixPlaceholder: string;
    suffix: string;
    suffixPlaceholder: string;
    ignoreEmptyLabel: string;
    ignoreEmptyDescription: string;
  };
}

export function PrefixSuffixOptions({ options, onOptionsChange, translations }: PrefixSuffixOptionsProps) {
  const handlePrefixChange = (value: string) => {
    onOptionsChange({ ...options, prefix: value });
  };

  const handleSuffixChange = (value: string) => {
    onOptionsChange({ ...options, suffix: value });
  };

  const handleIgnoreEmptyChange = (checked: boolean) => {
    onOptionsChange({ ...options, ignoreEmpty: checked });
  };

  return (
    <div className="w-full space-y-6">
      <h3 className="text-lg font-semibold text-foreground">{translations.title}</h3>
      
      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        {/* Prefix Input */}
        <div className="space-y-2">
          <Label htmlFor="prefix" className="text-sm font-medium">
            {translations.prefix}
          </Label>
          <Input
            id="prefix"
            type="text"
            value={options.prefix}
            onChange={(e) => handlePrefixChange(e.target.value)}
            placeholder={translations.prefixPlaceholder}
            className="w-full font-mono"
          />
        </div>

        {/* Suffix Input */}
        <div className="space-y-2">
          <Label htmlFor="suffix" className="text-sm font-medium">
            {translations.suffix}
          </Label>
          <Input
            id="suffix"
            type="text"
            value={options.suffix}
            onChange={(e) => handleSuffixChange(e.target.value)}
            placeholder={translations.suffixPlaceholder}
            className="w-full font-mono"
          />
        </div>

        {/* Ignore Empty Lines Toggle */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-md bg-muted/50">
          <div className="flex-1 space-y-1">
            <Label htmlFor="ignore-empty" className="text-sm font-medium cursor-pointer">
              {translations.ignoreEmptyLabel}
            </Label>
            <p className="text-xs text-muted-foreground">
              {translations.ignoreEmptyDescription}
            </p>
          </div>
          <Switch
            id="ignore-empty"
            checked={options.ignoreEmpty}
            onCheckedChange={handleIgnoreEmptyChange}
          />
        </div>
      </div>
    </div>
  );
}

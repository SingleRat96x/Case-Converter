'use client';

import React from 'react';
import { RemovePunctuationOptions } from '@/lib/textTransforms';

interface PunctuationOptionsProps {
  options: RemovePunctuationOptions;
  onOptionsChange: (options: RemovePunctuationOptions) => void;
  labels: {
    keepApostrophes: string;
    keepHyphens: string;
    keepEmailUrls: string;
    keepNumbers: string;
    keepLineBreaks: string;
    customKeepList: string;
    customKeepListPlaceholder: string;
  };
}

export function PunctuationOptions({ options, onOptionsChange, labels }: PunctuationOptionsProps) {
  const handleCheckboxChange = (key: keyof RemovePunctuationOptions) => (checked: boolean) => {
    onOptionsChange({
      ...options,
      [key]: checked
    });
  };

  const handleCustomKeepListChange = (value: string) => {
    onOptionsChange({
      ...options,
      customKeepList: value
    });
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Keep apostrophes */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.keepApostrophes}
            onChange={(e) => handleCheckboxChange('keepApostrophes')(e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-2 border-input rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-sm text-foreground select-none">
            {labels.keepApostrophes}
          </span>
        </label>

        {/* Keep hyphens */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.keepHyphens}
            onChange={(e) => handleCheckboxChange('keepHyphens')(e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-2 border-input rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-sm text-foreground select-none">
            {labels.keepHyphens}
          </span>
        </label>

        {/* Keep email/URL punctuation */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.keepEmailUrls}
            onChange={(e) => handleCheckboxChange('keepEmailUrls')(e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-2 border-input rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-sm text-foreground select-none">
            {labels.keepEmailUrls}
          </span>
        </label>

        {/* Keep numbers */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.keepNumbers}
            onChange={(e) => handleCheckboxChange('keepNumbers')(e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-2 border-input rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-sm text-foreground select-none">
            {labels.keepNumbers}
          </span>
        </label>

        {/* Keep line breaks */}
        <label className="flex items-center space-x-3 cursor-pointer sm:col-span-2">
          <input
            type="checkbox"
            checked={options.keepLineBreaks}
            onChange={(e) => handleCheckboxChange('keepLineBreaks')(e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-2 border-input rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-sm text-foreground select-none">
            {labels.keepLineBreaks}
          </span>
        </label>
      </div>

      {/* Custom keep list */}
      <div className="space-y-2">
        <label htmlFor="custom-keep-list" className="block text-sm font-medium text-foreground">
          {labels.customKeepList}
        </label>
        <input
          id="custom-keep-list"
          type="text"
          value={options.customKeepList}
          onChange={(e) => handleCustomKeepListChange(e.target.value)}
          placeholder={labels.customKeepListPlaceholder}
          className="w-full px-3 py-2 border-2 border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
        />
      </div>
    </div>
  );
}
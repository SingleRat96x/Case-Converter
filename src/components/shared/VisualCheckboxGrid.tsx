'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxOption {
  id: string;
  label: string;
  icon: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface VisualCheckboxGridProps {
  title: string;
  options: CheckboxOption[];
  className?: string;
  columns?: number;
}

export function VisualCheckboxGrid({
  title,
  options,
  className = ''
}: VisualCheckboxGridProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Mobile Layout - Stacked */}
      <div className="sm:hidden space-y-3">
        {/* Title - Centered on mobile */}
        <h3 className="text-sm text-muted-foreground text-center">
          {title}
        </h3>

        {/* Options Grid - Centered on mobile */}
        <div className="flex flex-wrap gap-2 justify-center">
          {options.map((option) => (
            <label
              key={option.id}
              className={`
                relative flex items-center justify-center min-w-[60px] h-10 px-3 rounded-lg border cursor-pointer
                transition-all duration-200 hover:scale-105 select-none text-sm font-medium
                ${
                  option.checked
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-input bg-background text-foreground hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              {/* Checkbox Input (Hidden) */}
              <input
                type="checkbox"
                checked={option.checked}
                onChange={(e) => option.onChange(e.target.checked)}
                className="sr-only"
              />

              {/* Check Icon (Top Right) */}
              {option.checked && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary border border-background text-primary-foreground rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}

              {/* Icon Text */}
              <span className="font-mono font-bold">
                {option.icon}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Desktop Layout - Inline */}
      <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Title */}
        <span className="text-sm text-muted-foreground flex-shrink-0">
          {title}
        </span>

        {/* Options Grid - Aligned to right */}
        <div className="flex flex-wrap gap-3 justify-start">
          {options.map((option) => (
            <label
              key={option.id}
              className={`
                relative flex items-center justify-center min-w-[60px] h-10 px-3 rounded-lg border cursor-pointer
                transition-all duration-200 hover:scale-105 select-none text-sm font-medium
                ${
                  option.checked
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-input bg-background text-foreground hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              {/* Checkbox Input (Hidden) */}
              <input
                type="checkbox"
                checked={option.checked}
                onChange={(e) => option.onChange(e.target.checked)}
                className="sr-only"
              />

              {/* Check Icon (Top Right) */}
              {option.checked && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary border border-background text-primary-foreground rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}

              {/* Icon Text */}
              <span className="font-mono font-bold">
                {option.icon}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { copyToClipboard } from '@/lib/utils';

interface RomanNumeralTableProps {
  className?: string;
}

interface RomanNumeral {
  number: number;
  roman: string;
  description?: string;
}

export function RomanNumeralTable({ className = '' }: RomanNumeralTableProps) {
  const { tool } = useToolTranslations('tools/miscellaneous');
  const [isExpanded, setIsExpanded] = useState(false); // Always start with false for SSR
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Set initial state after hydration to avoid hydration mismatch
  useEffect(() => {
    // Open by default on desktop (screen width >= 1024px), closed on mobile
    setIsExpanded(window.innerWidth >= 1024);
  }, []);

  // Basic Roman numerals (1-20)
  const basicNumerals: RomanNumeral[] = [
    { number: 1, roman: 'I' },
    { number: 2, roman: 'II' },
    { number: 3, roman: 'III' },
    { number: 4, roman: 'IV' },
    { number: 5, roman: 'V' },
    { number: 6, roman: 'VI' },
    { number: 7, roman: 'VII' },
    { number: 8, roman: 'VIII' },
    { number: 9, roman: 'IX' },
    { number: 10, roman: 'X' },
    { number: 11, roman: 'XI' },
    { number: 12, roman: 'XII' },
    { number: 13, roman: 'XIII' },
    { number: 14, roman: 'XIV' },
    { number: 15, roman: 'XV' },
    { number: 16, roman: 'XVI' },
    { number: 17, roman: 'XVII' },
    { number: 18, roman: 'XVIII' },
    { number: 19, roman: 'XIX' },
    { number: 20, roman: 'XX' }
  ];

  // Key values and larger numbers
  const keyNumerals: RomanNumeral[] = [
    { number: 1, roman: 'I', description: tool('romanNumeralDate.reference.basicSymbols.one') },
    { number: 5, roman: 'V', description: tool('romanNumeralDate.reference.basicSymbols.five') },
    { number: 10, roman: 'X', description: tool('romanNumeralDate.reference.basicSymbols.ten') },
    { number: 50, roman: 'L', description: tool('romanNumeralDate.reference.basicSymbols.fifty') },
    { number: 100, roman: 'C', description: tool('romanNumeralDate.reference.basicSymbols.hundred') },
    { number: 500, roman: 'D', description: tool('romanNumeralDate.reference.basicSymbols.fiveHundred') },
    { number: 1000, roman: 'M', description: tool('romanNumeralDate.reference.basicSymbols.thousand') }
  ];

  // Common years
  const commonYears: RomanNumeral[] = [
    { number: 2020, roman: 'MMXX' },
    { number: 2021, roman: 'MMXXI' },
    { number: 2022, roman: 'MMXXII' },
    { number: 2023, roman: 'MMXXIII' },
    { number: 2024, roman: 'MMXXIV' },
    { number: 2025, roman: 'MMXXV' },
    { number: 2030, roman: 'MMXXX' },
    { number: 2050, roman: 'MML' },
    { number: 2100, roman: 'MMC' }
  ];

  // Months in Roman
  const romanMonths = [
    { modern: tool('romanNumeralDate.reference.months.january'), roman: 'IANUARIUS' },
    { modern: tool('romanNumeralDate.reference.months.february'), roman: 'FEBRUARIUS' },
    { modern: tool('romanNumeralDate.reference.months.march'), roman: 'MARTIUS' },
    { modern: tool('romanNumeralDate.reference.months.april'), roman: 'APRILIS' },
    { modern: tool('romanNumeralDate.reference.months.may'), roman: 'MAIUS' },
    { modern: tool('romanNumeralDate.reference.months.june'), roman: 'IUNIUS' },
    { modern: tool('romanNumeralDate.reference.months.july'), roman: 'IULIUS' },
    { modern: tool('romanNumeralDate.reference.months.august'), roman: 'AUGUSTUS' },
    { modern: tool('romanNumeralDate.reference.months.september'), roman: 'SEPTEMBER' },
    { modern: tool('romanNumeralDate.reference.months.october'), roman: 'OCTOBER' },
    { modern: tool('romanNumeralDate.reference.months.november'), roman: 'NOVEMBER' },
    { modern: tool('romanNumeralDate.reference.months.december'), roman: 'DECEMBER' }
  ];

  const handleCopyRoman = async (roman: string, identifier: string) => {
    const success = await copyToClipboard(roman);
    if (success) {
      setCopiedItem(identifier);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  const CopyButton = ({ roman, identifier, size = 'sm' }: { 
    roman: string; 
    identifier: string; 
    size?: 'sm' | 'xs' 
  }) => {
    const isCopied = copiedItem === identifier;
    const iconSize = size === 'xs' ? 'h-3 w-3' : 'h-4 w-4';
    
    return (
      <button
        onClick={() => handleCopyRoman(roman, identifier)}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-all ${
          isCopied
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
            : 'bg-card hover:bg-accent text-muted-foreground hover:text-accent-foreground border-border'
        }`}
        title={tool('romanNumeralDate.actions.copyTooltip')}
      >
        {isCopied ? (
          <Check className={iconSize} />
        ) : (
          <Copy className={iconSize} />
        )}
        {size === 'sm' && (
          <span className="hidden sm:inline">
            {isCopied ? tool('romanNumeralDate.actions.copied') : tool('romanNumeralDate.actions.copy')}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`border rounded-lg bg-card ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-foreground">
          {tool('romanNumeralDate.reference.title')}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isExpanded ? tool('romanNumeralDate.actions.hideReference') : tool('romanNumeralDate.actions.showReference')}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Table Content */}
      {isExpanded && (
        <div className="border-t bg-muted/30">
          <div className="p-4 space-y-6">
            
            {/* Basic Symbols */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">
                {tool('romanNumeralDate.reference.sections.basicSymbols')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {keyNumerals.map(({ number, roman, description }) => (
                  <div
                    key={number}
                    className="flex items-center justify-between p-3 bg-card rounded-md border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary min-w-[40px]">
                        {roman}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {number}
                        </span>
                        {description && (
                          <span className="text-xs text-muted-foreground">
                            {description}
                          </span>
                        )}
                      </div>
                    </div>
                    <CopyButton 
                      roman={roman} 
                      identifier={`basic-${number}`}
                      size="xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Numbers 1-20 */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">
                {tool('romanNumeralDate.reference.sections.numbers1to20')}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
                {basicNumerals.map(({ number, roman }) => (
                  <div
                    key={number}
                    className="flex items-center justify-between p-2 bg-card rounded-md border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col items-center w-full">
                      <span className="text-sm font-bold text-primary">
                        {roman}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {number}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Years */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">
                {tool('romanNumeralDate.reference.sections.commonYears')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {commonYears.map(({ number, roman }) => (
                  <div
                    key={number}
                    className="flex items-center justify-between p-3 bg-card rounded-md border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary min-w-[60px]">
                        {roman}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {number}
                      </span>
                    </div>
                    <CopyButton 
                      roman={roman} 
                      identifier={`year-${number}`}
                      size="xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Roman Months */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">
                {tool('romanNumeralDate.reference.sections.romanMonths')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {romanMonths.map(({ modern, roman }) => (
                  <div
                    key={modern}
                    className="flex items-center justify-between p-3 bg-card rounded-md border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary min-w-[80px]">
                        {roman}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {modern}
                      </span>
                    </div>
                    <CopyButton 
                      roman={roman} 
                      identifier={`month-${modern}`}
                      size="xs"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
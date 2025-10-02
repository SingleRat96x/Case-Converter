'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Hash, FileUp, FileDown, Percent, Trash2, CheckCircle, Type, Scissors, ArrowUp, ArrowDown } from 'lucide-react';
import { DataStats, type DataStat } from '@/components/shared/DataStats';

export function DuplicateLineRemover() {
  const { common, tool } = useToolTranslations('tools/text-modifiers');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [keepFirst, setKeepFirst] = useState(true);
  const [preserveOrder, setPreserveOrder] = useState(true);

  // Remove duplicate lines
  const removeDuplicates = useCallback((inputText: string, options: {
    caseSensitive: boolean;
    trimLines: boolean;
    keepFirst: boolean;
    preserveOrder: boolean;
  }) => {
    if (!inputText) {
      return { result: '', stats: { original: 0, unique: 0, removed: 0 } };
    }

    const lines = inputText.split('\n');
    const processedLines: string[] = [];
    const seen = new Map<string, number>();
    const uniqueLines: string[] = [];

    // Process each line
    lines.forEach((line, index) => {
      const processedLine = options.trimLines ? line.trim() : line;
      const compareKey = options.caseSensitive ? processedLine : processedLine.toLowerCase();
      
      if (!seen.has(compareKey)) {
        seen.set(compareKey, index);
        uniqueLines.push(line);
        if (options.preserveOrder) {
          processedLines[index] = line;
        } else {
          processedLines.push(line);
        }
      } else if (!options.keepFirst) {
        // If keeping last occurrence, update the position
        const originalIndex = seen.get(compareKey)!;
        if (options.preserveOrder) {
          delete processedLines[originalIndex];
          processedLines[index] = line;
        } else {
          const uniqueIndex = uniqueLines.findIndex((l) => {
            const lKey = options.caseSensitive ? 
              (options.trimLines ? l.trim() : l) : 
              (options.trimLines ? l.trim().toLowerCase() : l.toLowerCase());
            return lKey === compareKey;
          });
          if (uniqueIndex !== -1) {
            uniqueLines[uniqueIndex] = line;
          }
        }
        seen.set(compareKey, index);
      }
    });

    let result: string;
    if (options.preserveOrder) {
      result = processedLines.filter(line => line !== undefined).join('\n');
    } else {
      result = uniqueLines.join('\n');
    }

    const stats = {
      original: lines.length,
      unique: seen.size,
      removed: lines.length - seen.size
    };

    return { result, stats };
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);
    const { result } = removeDuplicates(newText, { caseSensitive, trimLines, keepFirst, preserveOrder });
    setConvertedText(result);
  };

  const handleOptionChange = (option: 'caseSensitive' | 'trimLines' | 'keepFirst' | 'preserveOrder', value: boolean) => {
    if (option === 'caseSensitive') setCaseSensitive(value);
    if (option === 'trimLines') setTrimLines(value);
    if (option === 'keepFirst') setKeepFirst(value);
    if (option === 'preserveOrder') setPreserveOrder(value);
    
    const { result } = removeDuplicates(text, {
      caseSensitive: option === 'caseSensitive' ? value : caseSensitive,
      trimLines: option === 'trimLines' ? value : trimLines,
      keepFirst: option === 'keepFirst' ? value : keepFirst,
      preserveOrder: option === 'preserveOrder' ? value : preserveOrder
    });
    setConvertedText(result);
  };

  // Calculate statistics for analytics cards
  const statistics = useMemo((): DataStat[] => {
    const { stats } = removeDuplicates(text || '', { caseSensitive, trimLines, keepFirst, preserveOrder });
    const inputBytes = text ? new Blob([text]).size : 0;
    const outputBytes = convertedText ? new Blob([convertedText]).size : 0;
    const compressionRatio = inputBytes > 0 && outputBytes > 0 ? (outputBytes / inputBytes) : 0;
    const duplicatePercentage = stats.original > 0 ? ((stats.removed / stats.original) * 100) : 0;
    
    return [
      {
        key: 'original',
        label: tool('duplicateLineRemover.stats.original'),
        value: stats.original,
        icon: FileUp,
        color: 'text-blue-600 dark:text-blue-400'
      },
      {
        key: 'unique',
        label: tool('duplicateLineRemover.stats.unique'),
        value: stats.unique,
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400'
      },
      {
        key: 'removed',
        label: tool('duplicateLineRemover.stats.removed'),
        value: stats.removed,
        icon: Trash2,
        color: 'text-red-600 dark:text-red-400'
      },
      {
        key: 'percentage',
        label: 'Duplicate %',
        value: duplicatePercentage > 0 ? duplicatePercentage.toFixed(1) : '0.0',
        icon: Percent,
        color: 'text-orange-600 dark:text-orange-400',
        suffix: '%'
      },
      {
        key: 'compression',
        label: 'Size Ratio',
        value: compressionRatio > 0 ? compressionRatio.toFixed(2) : '1.00',
        icon: FileDown,
        color: 'text-purple-600 dark:text-purple-400',
        suffix: '×'
      },
      {
        key: 'efficiency',
        label: 'Efficiency',
        value: stats.original > 0 ? ((stats.unique / stats.original) * 100).toFixed(1) : '100.0',
        icon: Hash,
        color: 'text-cyan-600 dark:text-cyan-400',
        suffix: '%'
      }
    ];
  }, [text, convertedText, caseSensitive, trimLines, keepFirst, preserveOrder, removeDuplicates, tool]);

  return (
    <BaseTextConverter
      title={tool('duplicateLineRemover.title')}
      description={tool('duplicateLineRemover.description')}
      inputLabel={tool('duplicateLineRemover.inputLabel')}
      outputLabel={tool('duplicateLineRemover.outputLabel')}
      inputPlaceholder={tool('duplicateLineRemover.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('duplicateLineRemover.uploadDescription')}
      downloadFileName={tool('duplicateLineRemover.downloadFileName')}
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      showAnalytics={false}
      analyticsVariant="compact"
      mobileLayout="2x2"
    >
      <div className="space-y-4">
        {/* Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleOptionChange('caseSensitive', !caseSensitive)}
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              caseSensitive 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">{tool('duplicateLineRemover.options.caseSensitive')}</span>
            </div>
            <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
              caseSensitive 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground/30'
            }`}>
              {caseSensitive && (
                <svg viewBox="0 0 16 16" className="w-3 h-3">
                  <path
                    fill="currentColor"
                    d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                  />
                </svg>
              )}
            </div>
          </button>

          <button
            onClick={() => handleOptionChange('trimLines', !trimLines)}
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              trimLines 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">{tool('duplicateLineRemover.options.trimLines')}</span>
            </div>
            <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
              trimLines 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground/30'
            }`}>
              {trimLines && (
                <svg viewBox="0 0 16 16" className="w-3 h-3">
                  <path
                    fill="currentColor"
                    d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                  />
                </svg>
              )}
            </div>
          </button>

          <button
            onClick={() => handleOptionChange('keepFirst', !keepFirst)}
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              keepFirst 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">{tool('duplicateLineRemover.options.keepFirst')}</span>
            </div>
            <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
              keepFirst 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground/30'
            }`}>
              {keepFirst && (
                <svg viewBox="0 0 16 16" className="w-3 h-3">
                  <path
                    fill="currentColor"
                    d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                  />
                </svg>
              )}
            </div>
          </button>

          <button
            onClick={() => handleOptionChange('preserveOrder', !preserveOrder)}
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              preserveOrder 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">{tool('duplicateLineRemover.options.preserveOrder')}</span>
            </div>
            <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
              preserveOrder 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground/30'
            }`}>
              {preserveOrder && (
                <svg viewBox="0 0 16 16" className="w-3 h-3">
                  <path
                    fill="currentColor"
                    d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Analytics Cards */}
        <DataStats 
          stats={statistics} 
          variant="compact"
          showIcons={true}
        />

      </div>
    </BaseTextConverter>
  );
}
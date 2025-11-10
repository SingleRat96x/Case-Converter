'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { ArrowUpDown, ArrowUp, ArrowDown, Hash, Shuffle, Settings2, FileText, List, SortAsc, Shuffle as ShuffleIcon, CheckCircle, Trash2, Space, AlignLeft, Circle, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { DataStats, type DataStat } from '@/components/shared/DataStats';
import { Accordion, AccordionItem } from '@/components/ui/accordion';

type SortOrder = 'asc' | 'desc' | 'random';
type SortMode = 'alphabetical' | 'length' | 'reverse';
type Separator = 'space' | 'newline' | 'comma' | 'custom';

export function WordSorter() {
  const { common, tool } = useToolTranslations('tools/text-modifiers');
  const [text, setText] = useState('');
  const [sortedText, setSortedText] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');
  const [separator, setSeparator] = useState<Separator>('space');
  const [customSeparator, setCustomSeparator] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  const getSeparatorChar = useCallback((sep: Separator): string => {
    switch (sep) {
      case 'space': return ' ';
      case 'newline': return '\n';
      case 'comma': return ', ';
      case 'custom': return customSeparator || ' ';
      default: return ' ';
    }
  }, [customSeparator]);

  const detectSeparator = useCallback((text: string): Separator => {
    // Check for newlines first (most specific)
    if (text.includes('\n')) return 'newline';
    // Check for commas with optional spaces
    if (text.includes(',')) return 'comma';
    // Default to space
    return 'space';
  }, []);

  const sortWords = useCallback((inputText: string) => {
    if (!inputText.trim()) {
      setSortedText('');
      return;
    }

    // Auto-detect separator if using space (default)
    const actualSeparator = separator === 'space' ? detectSeparator(inputText) : separator;
    
    // Split text into words based on separator
    let words = inputText.split(
      actualSeparator === 'newline' ? /\n+/ :
      actualSeparator === 'comma' ? /,\s*/ :
      actualSeparator === 'custom' && customSeparator ? new RegExp(customSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) :
      /\s+/
    );

    // Filter and process words
    words = words
      .filter(word => word.length > 0)
      .map(word => trimWhitespace ? word.trim() : word)
      .filter(word => word.length > 0);

    // Remove duplicates if enabled
    if (removeDuplicates) {
      const seen = new Set<string>();
      words = words.filter(word => {
        const key = caseSensitive ? word : word.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    // Sort based on mode and order
    const sortedWords = [...words];
    
    switch (sortMode) {
      case 'alphabetical':
        sortedWords.sort((a, b) => {
          const compareA = caseSensitive ? a : a.toLowerCase();
          const compareB = caseSensitive ? b : b.toLowerCase();
          return sortOrder === 'asc' 
            ? compareA.localeCompare(compareB)
            : compareB.localeCompare(compareA);
        });
        break;
      
      case 'length':
        sortedWords.sort((a, b) => {
          const diff = a.length - b.length;
          if (diff !== 0) {
            return sortOrder === 'asc' ? diff : -diff;
          }
          // If same length, sort alphabetically
          const compareA = caseSensitive ? a : a.toLowerCase();
          const compareB = caseSensitive ? b : b.toLowerCase();
          return sortOrder === 'asc' 
            ? compareA.localeCompare(compareB)
            : compareB.localeCompare(compareA);
        });
        break;
      
      case 'reverse':
        sortedWords.reverse();
        break;
    }

    // Apply random order if selected
    if (sortOrder === 'random') {
      for (let i = sortedWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sortedWords[i], sortedWords[j]] = [sortedWords[j], sortedWords[i]];
      }
    }

    // Join with appropriate separator
    const outputSep = getSeparatorChar(separator);
    setSortedText(sortedWords.join(outputSep));
  }, [sortOrder, sortMode, separator, customSeparator, caseSensitive, removeDuplicates, trimWhitespace, getSeparatorChar, detectSeparator]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    sortWords(newText);
  }, [sortWords]);

  const handleSortChange = useCallback((newSortOrder?: SortOrder, newSortMode?: SortMode) => {
    if (newSortOrder) setSortOrder(newSortOrder);
    if (newSortMode) setSortMode(newSortMode);
    sortWords(text);
  }, [text, sortWords]);

  const handleSeparatorChange = useCallback((newSeparator: Separator) => {
    setSeparator(newSeparator);
    sortWords(text);
  }, [text, sortWords]);

  const handleOptionsChange = useCallback(() => {
    sortWords(text);
  }, [text, sortWords]);

  // Update sorted text when any option changes
  React.useEffect(() => {
    sortWords(text);
  }, [sortOrder, sortMode, separator, customSeparator, caseSensitive, removeDuplicates, trimWhitespace, sortWords, text]);

  // Handle responsive accordion behavior
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint
        setIsAccordionOpen(true);
      } else {
        setIsAccordionOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate statistics for analytics cards
  const statistics = useMemo((): DataStat[] => {
    if (!text) {
      return [
        {
          key: 'original',
          label: tool('wordSorter.stats.original'),
          value: 0,
          icon: FileText,
          color: 'text-blue-600 dark:text-blue-400'
        },
        {
          key: 'sorted',
          label: tool('wordSorter.stats.sorted'),
          value: 0,
          icon: List,
          color: 'text-green-600 dark:text-green-400'
        },
        {
          key: 'duplicates',
          label: tool('wordSorter.stats.duplicates'),
          value: 0,
          icon: Trash2,
          color: 'text-red-600 dark:text-red-400'
        },
        {
          key: 'mode',
          label: tool('wordSorter.stats.mode'),
          value: tool(`wordSorter.modes.${sortMode}`),
          icon: sortMode === 'alphabetical' ? SortAsc : sortMode === 'length' ? Hash : ArrowDown,
          color: 'text-purple-600 dark:text-purple-400'
        },
        {
          key: 'order',
          label: tool('wordSorter.stats.order'),
          value: sortOrder === 'random' ? tool('wordSorter.orders.random') : 
                 sortOrder === 'asc' ? tool('wordSorter.orders.ascending') : 
                 tool('wordSorter.orders.descending'),
          icon: sortOrder === 'random' ? ShuffleIcon : 
                sortOrder === 'asc' ? ArrowUp : ArrowDown,
          color: 'text-orange-600 dark:text-orange-400'
        },
        {
          key: 'separator',
          label: tool('wordSorter.stats.separator'),
          value: tool(`wordSorter.separators.${separator}`),
          icon: CheckCircle,
          color: 'text-cyan-600 dark:text-cyan-400'
        }
      ];
    }

    const originalWords = text.split(
      separator === 'newline' ? /\n+/ :
      separator === 'comma' ? /,\s*/ :
      separator === 'custom' && customSeparator ? new RegExp(customSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) :
      /\s+/
    ).filter(word => word.length > 0);

    const sortedWords = sortedText.split(getSeparatorChar(separator)).filter(word => word.length > 0);
    const duplicatesRemoved = removeDuplicates ? originalWords.length - sortedWords.length : 0;

    return [
      {
        key: 'original',
        label: tool('wordSorter.stats.original'),
        value: originalWords.length,
        icon: FileText,
        color: 'text-blue-600 dark:text-blue-400'
      },
      {
        key: 'sorted',
        label: tool('wordSorter.stats.sorted'),
        value: sortedWords.length,
        icon: List,
        color: 'text-green-600 dark:text-green-400'
      },
      {
        key: 'duplicates',
        label: tool('wordSorter.stats.duplicates'),
        value: duplicatesRemoved,
        icon: Trash2,
        color: 'text-red-600 dark:text-red-400'
      },
      {
        key: 'mode',
        label: tool('wordSorter.stats.mode'),
        value: tool(`wordSorter.modes.${sortMode}`),
        icon: sortMode === 'alphabetical' ? SortAsc : sortMode === 'length' ? Hash : ArrowDown,
        color: 'text-purple-600 dark:text-purple-400'
      },
      {
        key: 'order',
        label: tool('wordSorter.stats.order'),
        value: sortOrder === 'random' ? tool('wordSorter.orders.random') : 
               sortOrder === 'asc' ? tool('wordSorter.orders.ascending') : 
               tool('wordSorter.orders.descending'),
        icon: sortOrder === 'random' ? ShuffleIcon : 
              sortOrder === 'asc' ? ArrowUp : ArrowDown,
        color: 'text-orange-600 dark:text-orange-400'
      },
      {
        key: 'separator',
        label: tool('wordSorter.stats.separator'),
        value: tool(`wordSorter.separators.${separator}`),
        icon: CheckCircle,
        color: 'text-cyan-600 dark:text-cyan-400'
      }
    ];
  }, [text, sortedText, sortMode, sortOrder, separator, customSeparator, removeDuplicates, getSeparatorChar, tool]);

  return (
    <BaseTextConverter
      title={tool('wordSorter.title')}
      description={tool('wordSorter.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('wordSorter.outputLabel')}
      inputPlaceholder={tool('wordSorter.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName="sorted-words.txt"
      onTextChange={handleTextChange}
      text={text}
      convertedText={sortedText}
      onConvertedTextUpdate={setSortedText}
      showAnalytics={false}
      analyticsVariant="compact"
      mobileLayout="2x2"
    >
      <div className="space-y-4">
        {/* Comprehensive Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title="Word Sorting Options" 
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Sort Options Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('wordSorter.sectionTitles.sortConfig', 'Sort Configuration')}</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                      {tool('wordSorter.sortMode')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={sortMode === 'alphabetical' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSortChange(undefined, 'alphabetical')}
                        className="text-xs"
                      >
                        <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {tool('wordSorter.modes.alphabetical')}
                      </Button>
                      <Button
                        variant={sortMode === 'length' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSortChange(undefined, 'length')}
                        className="text-xs"
                      >
                        <Hash className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {tool('wordSorter.modes.length')}
                      </Button>
                      <Button
                        variant={sortMode === 'reverse' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSortChange(undefined, 'reverse')}
                        className="text-xs"
                      >
                        <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {tool('wordSorter.modes.reverse')}
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                      {tool('wordSorter.sortOrder')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={sortOrder === 'asc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSortChange('asc', undefined)}
                        disabled={sortMode === 'reverse'}
                        className="text-xs"
                      >
                        <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {tool('wordSorter.orders.ascending')}
                      </Button>
                      <Button
                        variant={sortOrder === 'desc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSortChange('desc', undefined)}
                        disabled={sortMode === 'reverse'}
                        className="text-xs"
                      >
                        <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {tool('wordSorter.orders.descending')}
                      </Button>
                      <Button
                        variant={sortOrder === 'random' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSortChange('random', undefined)}
                        className="text-xs"
                      >
                        <Shuffle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {tool('wordSorter.orders.random')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Separator Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Settings className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('wordSorter.sectionTitles.separatorOptions', 'Separator Options')}</h3>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
                    {tool('wordSorter.separator')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['space', 'newline', 'comma', 'custom'] as const).map((sep) => {
                      const getIcon = () => {
                        switch (sep) {
                          case 'space': return Space;
                          case 'newline': return AlignLeft;
                          case 'comma': return Circle;
                          case 'custom': return Settings;
                          default: return Space;
                        }
                      };
                      const Icon = getIcon();
                      
                      return (
                        <Button
                          key={sep}
                          variant={separator === sep ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSeparatorChange(sep)}
                            className="text-xs flex items-center gap-1"
                        >
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                          {tool(`wordSorter.separators.${sep}`)}
                        </Button>
                      );
                    })}
                  </div>
                  {separator === 'custom' && (
                    <input
                      type="text"
                      value={customSeparator}
                      onChange={(e) => setCustomSeparator(e.target.value)}
                      placeholder={tool('wordSorter.customSeparatorPlaceholder')}
                      className="mt-2 w-full px-3 py-2 text-sm border border-input bg-background rounded-md"
                    />
                  )}
                </div>
              </div>

              {/* Advanced Options Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Settings2 className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('wordSorter.sectionTitles.advancedOptions', 'Advanced Options')}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label 
                      htmlFor="case-sensitive" 
                      className="text-xs font-medium text-muted-foreground cursor-pointer flex-1"
                    >
                      {tool('wordSorter.options.caseSensitive')}
                    </label>
                    <Switch
                      id="case-sensitive"
                      checked={caseSensitive}
                      onCheckedChange={(checked) => {
                        setCaseSensitive(checked);
                        handleOptionsChange();
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label 
                      htmlFor="remove-duplicates" 
                      className="text-xs font-medium text-muted-foreground cursor-pointer flex-1"
                    >
                      {tool('wordSorter.options.removeDuplicates')}
                    </label>
                    <Switch
                      id="remove-duplicates"
                      checked={removeDuplicates}
                      onCheckedChange={(checked) => {
                        setRemoveDuplicates(checked);
                        handleOptionsChange();
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label 
                      htmlFor="trim-whitespace" 
                      className="text-xs font-medium text-muted-foreground cursor-pointer flex-1"
                    >
                      {tool('wordSorter.options.trimWhitespace')}
                    </label>
                    <Switch
                      id="trim-whitespace"
                      checked={trimWhitespace}
                      onCheckedChange={(checked) => {
                        setTrimWhitespace(checked);
                        handleOptionsChange();
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>

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
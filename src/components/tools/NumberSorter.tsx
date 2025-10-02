'use client';

import React, { useState, useMemo } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { ToolOptionsAccordion } from '@/components/shared/ToolOptionsAccordion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { TrendingUp, TrendingDown, Hash, Target, BarChart3, Sigma, Settings } from 'lucide-react';

type SortOrder = 'asc' | 'desc';
type SortType = 'numerical' | 'lexicographical';
type SeparatorType = 'auto' | 'newline' | 'space' | 'comma' | 'dash' | 'semicolon';

interface SortOptions {
  order: SortOrder;
  type: SortType;
  separator: SeparatorType;
  removeDuplicates: boolean;
  preserveOriginalFormat: boolean;
}

export function NumberSorter() {
  const { common, tool } = useToolTranslations('tools/misc-tools');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [options, setOptions] = useState<SortOptions>({
    order: 'asc',
    type: 'numerical',
    separator: 'auto',
    removeDuplicates: false,
    preserveOriginalFormat: false
  });

  const { sortedText, stats } = useMemo(() => {
    if (!text.trim()) {
      return { 
        sortedText: '', 
        stats: {
          originalCount: 0,
          finalCount: 0,
          duplicatesRemoved: 0,
          numericValues: 0,
          minValue: 0,
          maxValue: 0,
          sum: 0,
          average: 0
        }
      };
    }

    let numbers: string[];
    
    if (options.separator === 'auto') {
      // Smart mode: Extract numbers from mixed content
      // First, remove all non-numeric characters except separators and decimal points
      const cleanedText = text.replace(/[^\d\s,.;\-+]/g, ' ');
      // Split by common separators and extract valid numbers
      numbers = cleanedText
        .split(/[\s,;\-]+/)
        .map(n => n.trim())
        .filter(n => n.length > 0 && !isNaN(parseFloat(n)))
        .map(n => parseFloat(n).toString());
    } else {
      // Manual separator mode
      let separator: RegExp;
      switch (options.separator) {
        case 'newline':
          separator = /\n/;
          break;
        case 'space':
          separator = /\s+/;
          break;
        case 'comma':
          separator = /,/;
          break;
        case 'dash':
          separator = /-/;
          break;
        case 'semicolon':
          separator = /;/;
          break;
        default:
          separator = /[\s,;\-]+/;
      }
      
      numbers = text
        .split(separator)
        .map(n => n.trim())
        .filter(n => n.length > 0);
    }

    const originalCount = numbers.length;
    
    // Remove duplicates if option is enabled
    if (options.removeDuplicates) {
      numbers = [...new Set(numbers)];
    }

    // Sort based on type
    let sorted: string[];
    if (options.type === 'numerical') {
      sorted = numbers.sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        
        // Handle non-numeric values (put them at the end)
        if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        
        return options.order === 'asc' ? numA - numB : numB - numA;
      });
    } else {
      sorted = numbers.sort((a, b) => {
        return options.order === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      });
    }

    // Calculate statistics
    const numericValues = sorted.map(n => parseFloat(n)).filter(n => !isNaN(n));
    const finalCount = sorted.length;
    const duplicatesRemoved = originalCount - finalCount;
    const numericCount = numericValues.length;
    const minValue = numericCount > 0 ? Math.min(...numericValues) : 0;
    const maxValue = numericCount > 0 ? Math.max(...numericValues) : 0;
    const sum = numericCount > 0 ? numericValues.reduce((a, b) => a + b, 0) : 0;
    const average = numericCount > 0 ? sum / numericCount : 0;

    // Format output based on original format or user preference
    let formattedOutput: string;
    if (options.preserveOriginalFormat) {
      // Detect original format from input
      const hasCommas = text.includes(',');
      const hasNewlines = text.includes('\n');
      
      if (hasCommas && !hasNewlines) {
        formattedOutput = sorted.join(', ');
      } else if (hasNewlines) {
        formattedOutput = sorted.join('\n');
      } else {
        formattedOutput = sorted.join(' ');
      }
    } else {
      // Default to newline-separated for better readability
      formattedOutput = sorted.join('\n');
    }

    return {
      sortedText: formattedOutput,
      stats: {
        originalCount,
        finalCount,
        duplicatesRemoved,
        numericValues: numericCount,
        minValue,
        maxValue,
        sum,
        average
      }
    };
  }, [text, options]);

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleConvertedTextUpdate = (newText: string) => {
    setConvertedText(newText);
  };

  const handleFileUploaded = (content: string) => {
    setText(content);
  };

  const updateOption = <K extends keyof SortOptions>(key: K, value: SortOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  // Update converted text when sortedText changes
  React.useEffect(() => {
    setConvertedText(sortedText);
  }, [sortedText]);

  // Detect desktop screen size
  React.useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Create analytics component similar to TextCounterAnalytics
  const NumberSorterAnalytics = () => {

    const statisticsData = [
      {
        key: 'originalCount',
        label: tool('numberSorter.statistics.originalCount'),
        value: stats.originalCount,
        icon: Hash,
        color: 'text-blue-600 dark:text-blue-400'
      },
      {
        key: 'finalCount',
        label: tool('numberSorter.statistics.sortedCount'),
        value: stats.finalCount,
        icon: BarChart3,
        color: 'text-green-600 dark:text-green-400'
      },
      {
        key: 'duplicatesRemoved',
        label: tool('numberSorter.statistics.duplicatesRemoved'),
        value: stats.duplicatesRemoved,
        icon: Target,
        color: 'text-orange-600 dark:text-orange-400'
      },
      {
        key: 'minValue',
        label: tool('numberSorter.analytics.minValue'),
        value: stats.minValue.toFixed(2),
        icon: TrendingDown,
        color: 'text-red-600 dark:text-red-400'
      },
      {
        key: 'maxValue',
        label: tool('numberSorter.analytics.maxValue'),
        value: stats.maxValue.toFixed(2),
        icon: TrendingUp,
        color: 'text-emerald-600 dark:text-emerald-400'
      },
      {
        key: 'average',
        label: tool('numberSorter.analytics.average'),
        value: stats.average.toFixed(2),
        icon: Sigma,
        color: 'text-pink-600 dark:text-pink-400'
      }
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground text-center">{label}</span>
          </div>
        ))}
      </div>
    );
  };

  const optionsContent = (
    <div className="space-y-8">
      {/* Primary Sorting Options */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{tool('numberSorter.options.primaryOptions')}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sort Order */}
          <div className="space-y-3">
            <Label htmlFor="sort-order" className="text-sm font-medium text-foreground">
              {tool('numberSorter.options.sortOrder')}
            </Label>
            <Select
              value={options.order}
              onValueChange={(value: SortOrder) => updateOption('order', value)}
            >
              <SelectTrigger id="sort-order" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{tool('numberSorter.options.ascending')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="desc">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    <span>{tool('numberSorter.options.descending')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Type */}
          <div className="space-y-3">
            <Label htmlFor="sort-type" className="text-sm font-medium text-foreground">
              {tool('numberSorter.options.sortType')}
            </Label>
            <Select
              value={options.type}
              onValueChange={(value: SortType) => updateOption('type', value)}
            >
              <SelectTrigger id="sort-type" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numerical">
                  {tool('numberSorter.options.numerical')}
                </SelectItem>
                <SelectItem value="lexicographical">
                  {tool('numberSorter.options.lexicographical')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Input Separator */}
          <div className="space-y-3">
            <Label htmlFor="separator" className="text-sm font-medium text-foreground">
              {tool('numberSorter.options.separator')}
            </Label>
            <Select
              value={options.separator}
              onValueChange={(value: SeparatorType) => updateOption('separator', value)}
            >
              <SelectTrigger id="separator" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  {tool('numberSorter.options.separatorAuto')}
                </SelectItem>
                <SelectItem value="newline">
                  {tool('numberSorter.options.separatorNewline')}
                </SelectItem>
                <SelectItem value="space">
                  {tool('numberSorter.options.separatorSpace')}
                </SelectItem>
                <SelectItem value="comma">
                  {tool('numberSorter.options.separatorComma')}
                </SelectItem>
                <SelectItem value="dash">
                  {tool('numberSorter.options.separatorDash')}
                </SelectItem>
                <SelectItem value="semicolon">
                  {tool('numberSorter.options.separatorSemicolon')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {tool('numberSorter.options.additionalOptions')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Remove Duplicates */}
          <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-1 flex-1">
              <Label htmlFor="remove-duplicates" className="text-sm font-medium text-foreground cursor-pointer">
                {tool('numberSorter.options.removeDuplicates')}
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tool('numberSorter.options.removeDuplicatesDesc')}
              </p>
            </div>
            <Switch
              id="remove-duplicates"
              checked={options.removeDuplicates}
              onCheckedChange={(checked) => updateOption('removeDuplicates', checked)}
              className="ml-4"
            />
          </div>

          {/* Preserve Original Format */}
          <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-1 flex-1">
              <Label htmlFor="preserve-format" className="text-sm font-medium text-foreground cursor-pointer">
                {tool('numberSorter.options.preserveFormat')}
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tool('numberSorter.options.preserveFormatDesc')}
              </p>
            </div>
            <Switch
              id="preserve-format"
              checked={options.preserveOriginalFormat}
              onCheckedChange={(checked) => updateOption('preserveOriginalFormat', checked)}
              className="ml-4"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <BaseTextConverter
      title={tool('numberSorter.title')}
      description={tool('numberSorter.description')}
      inputLabel={tool('numberSorter.inputLabel')}
      outputLabel={tool('numberSorter.results.title')}
      inputPlaceholder={tool('numberSorter.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={''}
      downloadFileName={tool('numberSorter.downloadFileName')}
      useMonoFont={true}
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={handleConvertedTextUpdate}
      onFileUploaded={handleFileUploaded}
      showAnalytics={false}
    >
      {/* Sorting Options */}
      <ToolOptionsAccordion 
        title={tool('numberSorter.options.title')}
        icon={<Settings className="h-4 w-4" />}
        defaultOpen={isDesktop}
      >
        {optionsContent}
      </ToolOptionsAccordion>

      {/* Number Sorting Analytics - No title, clean display like TextCounter */}
      <NumberSorterAnalytics />
    </BaseTextConverter>
  );
}
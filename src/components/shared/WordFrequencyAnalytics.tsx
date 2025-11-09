'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { BarChart3, Hash, Type, FileText, AlignLeft, Filter } from 'lucide-react';

interface WordFrequencyAnalyticsProps {
  text: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface WordFrequencyData {
  word: string;
  count: number;
  percentage: number;
}

interface WordFrequencyStats {
  totalWords: number;
  uniqueWords: number;
  mostCommonWord: string;
  mostCommonCount: number;
  averageWordLength: number;
  frequencies: WordFrequencyData[];
}

type SortOrder = 'frequency-desc' | 'frequency-asc' | 'alphabetical-asc' | 'alphabetical-desc';

export function WordFrequencyAnalytics({ text, showTitle = true, variant = 'default' }: WordFrequencyAnalyticsProps) {
  const { tSync } = useCommonTranslations();
  const [sortOrder, setSortOrder] = useState<SortOrder>('frequency-desc');
  const [minWordLength, setMinWordLength] = useState(1);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [showTop, setShowTop] = useState(20);
  
  const stats: WordFrequencyStats = useMemo(() => {
    if (!text || text.trim().length === 0) {
      return {
        totalWords: 0,
        uniqueWords: 0,
        mostCommonWord: '',
        mostCommonCount: 0,
        averageWordLength: 0,
        frequencies: []
      };
    }

    // Extract words and apply filters
    const words = text
      .split(/\s+/)
      .map(word => word.replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF]/g, '')) // Remove punctuation, keep accented chars
      .filter(word => word.length >= minWordLength)
      .map(word => caseSensitive ? word : word.toLowerCase())
      .filter(word => word.length > 0);

    const totalWords = words.length;
    
    // Calculate frequency map
    const frequencyMap = new Map<string, number>();
    words.forEach(word => {
      frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
    });

    const uniqueWords = frequencyMap.size;
    
    // Convert to array and calculate percentages
    const frequencies: WordFrequencyData[] = Array.from(frequencyMap.entries())
      .map(([word, count]) => ({
        word,
        count,
        percentage: totalWords > 0 ? (count / totalWords) * 100 : 0
      }));

    // Find most common word
    const mostCommon = frequencies.reduce((max, current) => 
      current.count > max.count ? current : max, 
      { word: '', count: 0, percentage: 0 }
    );

    // Calculate average word length
    const averageWordLength = words.length > 0 
      ? words.reduce((sum, word) => sum + word.length, 0) / words.length 
      : 0;

    return {
      totalWords,
      uniqueWords,
      mostCommonWord: mostCommon.word,
      mostCommonCount: mostCommon.count,
      averageWordLength: Math.round(averageWordLength * 10) / 10,
      frequencies
    };
  }, [text, minWordLength, caseSensitive]);

  const sortedFrequencies = useMemo(() => {
    const sorted = [...stats.frequencies];
    
    switch (sortOrder) {
      case 'frequency-desc':
        sorted.sort((a, b) => b.count - a.count);
        break;
      case 'frequency-asc':
        sorted.sort((a, b) => a.count - b.count);
        break;
      case 'alphabetical-asc':
        sorted.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case 'alphabetical-desc':
        sorted.sort((a, b) => b.word.localeCompare(a.word));
        break;
    }
    
    return sorted.slice(0, showTop);
  }, [stats.frequencies, sortOrder, showTop]);

  const summaryStats = [
    {
      label: tSync('analytics.totalWords', 'Total Words'),
      value: stats.totalWords,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: tSync('analytics.uniqueWords', 'Unique Words'),
      value: stats.uniqueWords,
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: tSync('analytics.mostCommon', 'Most Common'),
      value: `"${stats.mostCommonWord}" (${stats.mostCommonCount})`,
      icon: Type,
      color: 'text-green-600 dark:text-green-400',
      isText: true
    },
    {
      label: tSync('analytics.avgLength', 'Avg Length'),
      value: `${stats.averageWordLength} ${tSync('analytics.chars', 'chars')}`,
      icon: AlignLeft,
      color: 'text-orange-600 dark:text-orange-400',
      isText: true
    },
    {
      label: tSync('analytics.diversity', 'Diversity'),
      value: `${stats.totalWords > 0 ? ((stats.uniqueWords / stats.totalWords) * 100).toFixed(1) : 0}%`,
      icon: BarChart3,
      color: 'text-cyan-600 dark:text-cyan-400',
      isText: true
    },
    {
      label: tSync('analytics.topWordPercent', 'Top Word %'),
      value: `${stats.totalWords > 0 ? ((stats.mostCommonCount / stats.totalWords) * 100).toFixed(1) : 0}%`,
      icon: Filter,
      color: 'text-red-600 dark:text-red-400',
      isText: true
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {summaryStats.map(({ label, value, icon: Icon, color, isText }) => (
            <div
              key={label}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className={`text-sm font-medium text-foreground ${isText ? 'text-center' : ''}`}>
                {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              <span className="text-xs text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* Top Words Visual Cards */}
        {stats.totalWords > 0 && (
          <div className="bg-card border rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {`${tSync('analytics.topNWordsPrefix', 'Top')} ${Math.min(9, sortedFrequencies.length)} ${tSync('analytics.wordsLabel', 'Words')}`}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {sortedFrequencies.slice(0, 9).map(({ word, count, percentage }, index) => {
                // Calculate relative size based on frequency for visual hierarchy
                const maxCount = sortedFrequencies[0]?.count || 1;
                const relativeSize = count / maxCount;
                const sizeClass = relativeSize > 0.8 ? 'text-base' : relativeSize > 0.5 ? 'text-sm' : 'text-xs';
                const heightClass = relativeSize > 0.8 ? 'h-16' : relativeSize > 0.5 ? 'h-14' : 'h-12';
                
                // Theme-based color coding based on rank
                let colorClass = '';
                let bgColorClass = '';
                let borderColorClass = '';
                if (index === 0) {
                  // 1st place - Primary theme colors
                  colorClass = 'text-primary';
                  bgColorClass = 'bg-primary/5 hover:bg-primary/10';
                  borderColorClass = 'border-primary/20';
                } else if (index === 1) {
                  // 2nd place - Secondary theme colors  
                  colorClass = 'text-secondary-foreground';
                  bgColorClass = 'bg-secondary/50 hover:bg-secondary/70';
                  borderColorClass = 'border-secondary/50';
                } else if (index === 2) {
                  // 3rd place - Accent theme colors
                  colorClass = 'text-accent-foreground';
                  bgColorClass = 'bg-accent/50 hover:bg-accent/70';
                  borderColorClass = 'border-accent/50';
                } else {
                  // 4th-9th place - Muted theme colors
                  colorClass = 'text-muted-foreground';
                  bgColorClass = 'bg-muted/30 hover:bg-muted/50';
                  borderColorClass = 'border-muted-foreground/20';
                }
                
                return (
                  <div
                    key={word}
                    className={`relative ${heightClass} ${bgColorClass} ${borderColorClass} border rounded-lg p-2 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md group cursor-pointer`}
                  >
                    {/* Rank Badge */}
                    <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full ${colorClass} bg-background border-2 ${borderColorClass} flex items-center justify-center text-xs font-bold`}>
                      {index + 1}
                    </div>
                    
                    {/* Word */}
                    <div className={`${sizeClass} font-bold ${colorClass} text-center break-all leading-tight`}>
                      {word}
                    </div>
                    
                    {/* Count and Percentage */}
                    <div className="text-xs text-muted-foreground text-center mt-1 space-y-0.5">
                      <div className="font-semibold">{count}×</div>
                      <div className="text-[10px] opacity-75">{percentage.toFixed(1)}%</div>
                    </div>
                    
                    {/* Visual Bar */}
                    <div className="w-full mt-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          index === 0 ? 'bg-primary' : 
                          index === 1 ? 'bg-secondary-foreground' : 
                          index === 2 ? 'bg-accent-foreground' : 
                          'bg-muted-foreground'
                        }`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Show more indicator */}
            {sortedFrequencies.length > 9 && (
              <div className="mt-3 text-center">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {`+${sortedFrequencies.length - 9} ${tSync('analytics.moreWordsSuffix', 'more words in full table below')}`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats Card */}
      <Card>
        {showTitle && (
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              {tSync('analytics.wordFrequencyAnalysis', 'Word Frequency Analysis')}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
            {summaryStats.map(({ label, value, icon: Icon, color, isText }) => (
              <div
                key={label}
                className="flex flex-col items-center p-4 bg-muted/50 rounded-lg hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
              >
                <Icon className={`h-5 w-5 mb-2 ${color}`} />
                <span className={`text-lg font-semibold text-foreground ${isText ? 'text-center' : ''}`}>
                  {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}
                </span>
                <span className="text-sm text-muted-foreground text-center">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Frequency Table */}
      {stats.totalWords > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                {tSync('analytics.wordFrequencyTable', 'Word Frequency Table')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{tSync('analytics.filters', 'Filters')}</span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{tSync('analytics.sortBy', 'Sort By')}</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="w-full text-sm border rounded px-2 py-1 bg-background"
                >
                  <option value="frequency-desc">{tSync('analytics.frequencyHighLow', 'Frequency (High to Low)')}</option>
                  <option value="frequency-asc">{tSync('analytics.frequencyLowHigh', 'Frequency (Low to High)')}</option>
                  <option value="alphabetical-asc">{tSync('analytics.alphabeticalAZ', 'Alphabetical (A-Z)')}</option>
                  <option value="alphabetical-desc">{tSync('analytics.alphabeticalZA', 'Alphabetical (Z-A)')}</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{tSync('analytics.showTop', 'Show Top')}</label>
                <select 
                  value={showTop} 
                  onChange={(e) => setShowTop(Number(e.target.value))}
                  className="w-full text-sm border rounded px-2 py-1 bg-background"
                >
                  <option value={10}>{`10 ${tSync('analytics.wordsLabel', 'words')}`}</option>
                  <option value={20}>{`20 ${tSync('analytics.wordsLabel', 'words')}`}</option>
                  <option value={50}>{`50 ${tSync('analytics.wordsLabel', 'words')}`}</option>
                  <option value={100}>{`100 ${tSync('analytics.wordsLabel', 'words')}`}</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{tSync('analytics.minLength', 'Min Length')}</label>
                <select 
                  value={minWordLength} 
                  onChange={(e) => setMinWordLength(Number(e.target.value))}
                  className="w-full text-sm border rounded px-2 py-1 bg-background"
                >
                  <option value={1}>{`1+ ${tSync('analytics.chars', 'chars')}`}</option>
                  <option value={2}>{`2+ ${tSync('analytics.chars', 'chars')}`}</option>
                  <option value={3}>{`3+ ${tSync('analytics.chars', 'chars')}`}</option>
                  <option value={4}>{`4+ ${tSync('analytics.chars', 'chars')}`}</option>
                </select>
              </div>
              
              <div className="flex items-center pt-5">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="mr-2"
                  />
                  {tSync('analytics.caseSensitive', 'Case Sensitive')}
                </label>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium">{tSync('analytics.rank', 'Rank')}</th>
                    <th className="text-left p-2 font-medium">{tSync('analytics.word', 'Word')}</th>
                    <th className="text-right p-2 font-medium">{tSync('analytics.count', 'Count')}</th>
                    <th className="text-right p-2 font-medium">{tSync('analytics.percentage', 'Percentage')}</th>
                    <th className="text-left p-2 font-medium">{tSync('analytics.bar', 'Bar')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFrequencies.map(({ word, count, percentage }, index) => (
                    <tr key={word} className="border-t hover:bg-muted/30">
                      <td className="p-2 font-mono text-muted-foreground">{index + 1}</td>
                      <td className="p-2 font-medium">{word}</td>
                      <td className="p-2 text-right font-semibold">{count.toLocaleString()}</td>
                      <td className="p-2 text-right text-muted-foreground">
                        {percentage.toFixed(2)}%
                      </td>
                      <td className="p-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.max(percentage, 2)}%`,
                              minWidth: '4px'
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {sortedFrequencies.length === 0 && stats.totalWords === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{tSync('analytics.enterTextPrompt', 'Enter some text to see word frequency analysis')}</p>
              </div>
            )}
            
            {sortedFrequencies.length === 0 && stats.totalWords > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{tSync('analytics.noWordsMatchFilters', 'No words match the current filters')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Export utility function for external use
export function calculateWordFrequencyStats(
  text: string, 
  options: { 
    minWordLength?: number; 
    caseSensitive?: boolean; 
  } = {}
): WordFrequencyStats {
  const { minWordLength = 1, caseSensitive = false } = options;
  
  if (!text || text.trim().length === 0) {
    return {
      totalWords: 0,
      uniqueWords: 0,
      mostCommonWord: '',
      mostCommonCount: 0,
      averageWordLength: 0,
      frequencies: []
    };
  }

  const words = text
    .split(/\s+/)
    .map(word => word.replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF]/g, ''))
    .filter(word => word.length >= minWordLength)
    .map(word => caseSensitive ? word : word.toLowerCase())
    .filter(word => word.length > 0);

  const totalWords = words.length;
  
  const frequencyMap = new Map<string, number>();
  words.forEach(word => {
    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
  });

  const uniqueWords = frequencyMap.size;
  
  const frequencies: WordFrequencyData[] = Array.from(frequencyMap.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: totalWords > 0 ? (count / totalWords) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);

  const mostCommon = frequencies[0] || { word: '', count: 0, percentage: 0 };
  const averageWordLength = words.length > 0 
    ? words.reduce((sum, word) => sum + word.length, 0) / words.length 
    : 0;

  return {
    totalWords,
    uniqueWords,
    mostCommonWord: mostCommon.word,
    mostCommonCount: mostCommon.count,
    averageWordLength: Math.round(averageWordLength * 10) / 10,
    frequencies
  };
}
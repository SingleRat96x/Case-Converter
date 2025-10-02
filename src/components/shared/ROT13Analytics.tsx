'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  RotateCcw, 
  Hash, 
  FileText, 
  BarChart3, 
  Percent, 
  RefreshCw 
} from 'lucide-react';

interface ROT13AnalyticsProps {
  inputText: string;
  doubleEncode: boolean;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface ROT13Stats {
  letters: number;
  words: number;
  rotation: string;
  alphabeticPercentage: number;
  totalCharacters: number;
  symmetricPairs: number;
}

export function ROT13Analytics({ 
  inputText, 
  doubleEncode,
  showTitle = true, 
  variant = 'default' 
}: ROT13AnalyticsProps) {
  const { tool } = useToolTranslations('tools/code-data');
  
  const stats: ROT13Stats = useMemo(() => {
    // Count letters (alphabetic characters only)
    const letters = inputText.replace(/[^a-zA-Z]/g, '').length;
    
    // Count words
    const words = inputText.trim() ? inputText.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
    
    // Rotation type
    const rotation = doubleEncode ? 'ROT26' : 'ROT13';
    
    // Calculate alphabetic percentage
    const totalCharacters = inputText.length;
    const alphabeticPercentage = totalCharacters > 0 ? Math.round((letters / totalCharacters) * 100) : 0;
    
    // Count symmetric pairs (letters that map to themselves in ROT13)
    // In ROT13: A↔N, B↔O, C↔P, etc. No letters map to themselves
    // But we can count how many letter pairs are present
    const inputLetters = inputText.toUpperCase().replace(/[^A-Z]/g, '');
    const symmetricPairs = Math.floor(inputLetters.length / 2);

    return {
      letters,
      words,
      rotation,
      alphabeticPercentage,
      totalCharacters,
      symmetricPairs
    };
  }, [inputText, doubleEncode]);

  const statisticsData = [
    {
      key: 'letters',
      label: tool('rot13.analytics.letters'),
      value: stats.letters,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'words',
      label: tool('rot13.analytics.words'),
      value: stats.words,
      icon: Hash,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'rotation',
      label: tool('rot13.analytics.rotation'),
      value: stats.rotation,
      icon: RotateCcw,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'alphabeticPercentage',
      label: tool('rot13.analytics.alphabeticPercentage'),
      value: `${stats.alphabeticPercentage}%`,
      icon: Percent,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'totalCharacters',
      label: tool('rot13.analytics.totalCharacters'),
      value: stats.totalCharacters,
      icon: BarChart3,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      key: 'symmetricPairs',
      label: tool('rot13.analytics.symmetricPairs'),
      value: stats.symmetricPairs,
      icon: RefreshCw,
      color: 'text-pink-600 dark:text-pink-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            <span className="text-xs text-muted-foreground text-center">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <RotateCcw className="h-5 w-5 text-primary" />
            {tool('rot13.analytics.title')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className="text-sm font-medium text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              <span className="text-xs text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>
        
        {/* AdSense Optimized Spacing */}
        <div className="mt-4 min-h-[50px] flex items-center justify-center">
          {/* This space can be used for ads - proper spacing from content */}
          <div className="w-full border-t border-border/50"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export utility functions for external use
export function calculateROT13Stats(
  inputText: string, 
  doubleEncode: boolean
): ROT13Stats {
  const letters = inputText.replace(/[^a-zA-Z]/g, '').length;
  const words = inputText.trim() ? inputText.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  const rotation = doubleEncode ? 'ROT26' : 'ROT13';
  const totalCharacters = inputText.length;
  const alphabeticPercentage = totalCharacters > 0 ? Math.round((letters / totalCharacters) * 100) : 0;
  const inputLetters = inputText.toUpperCase().replace(/[^A-Z]/g, '');
  const symmetricPairs = Math.floor(inputLetters.length / 2);

  return {
    letters,
    words,
    rotation,
    alphabeticPercentage,
    totalCharacters,
    symmetricPairs
  };
}
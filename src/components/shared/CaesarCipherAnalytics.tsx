'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  Shield, 
  Hash, 
  FileText, 
  BarChart3, 
  Percent, 
  Key 
} from 'lucide-react';

interface CaesarCipherAnalyticsProps {
  inputText: string;
  outputText: string;
  mode: 'encode' | 'decode';
  shift: number;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface CaesarCipherStats {
  letters: number;
  words: number;
  shiftValue: number;
  alphabeticPercentage: number;
  totalCharacters: number;
  preservedCharacters: number;
}

export function CaesarCipherAnalytics({ 
  inputText, 
  outputText, 
  mode,
  shift,
  showTitle = true, 
  variant = 'default' 
}: CaesarCipherAnalyticsProps) {
  const { tool } = useToolTranslations('tools/code-data');
  
  const stats: CaesarCipherStats = useMemo(() => {
    const plainText = mode === 'encode' ? inputText : outputText;
    
    // Count letters (alphabetic characters only)
    const letters = plainText.replace(/[^a-zA-Z]/g, '').length;
    
    // Count words
    const words = plainText.trim() ? plainText.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
    
    // Shift value
    const shiftValue = shift;
    
    // Calculate alphabetic percentage
    const totalCharacters = plainText.length;
    const alphabeticPercentage = totalCharacters > 0 ? Math.round((letters / totalCharacters) * 100) : 0;
    
    // Count preserved characters (non-alphabetic)
    const preservedCharacters = totalCharacters - letters;

    return {
      letters,
      words,
      shiftValue,
      alphabeticPercentage,
      totalCharacters,
      preservedCharacters
    };
  }, [inputText, outputText, mode, shift]);

  const statisticsData = [
    {
      key: 'letters',
      label: tool('caesar.analytics.letters'),
      value: stats.letters,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'words',
      label: tool('caesar.analytics.words'),
      value: stats.words,
      icon: Hash,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'shiftValue',
      label: tool('caesar.analytics.shiftValue'),
      value: stats.shiftValue,
      icon: Key,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'alphabeticPercentage',
      label: tool('caesar.analytics.alphabeticPercentage'),
      value: `${stats.alphabeticPercentage}%`,
      icon: Percent,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'totalCharacters',
      label: tool('caesar.analytics.totalCharacters'),
      value: stats.totalCharacters,
      icon: BarChart3,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      key: 'preservedCharacters',
      label: tool('caesar.analytics.preservedCharacters'),
      value: stats.preservedCharacters,
      icon: Shield,
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
            <Shield className="h-5 w-5 text-primary" />
            {tool('caesar.analytics.title')}
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
export function calculateCaesarCipherStats(
  inputText: string, 
  outputText: string, 
  mode: 'encode' | 'decode',
  shift: number
): CaesarCipherStats {
  const plainText = mode === 'encode' ? inputText : outputText;
  
  const letters = plainText.replace(/[^a-zA-Z]/g, '').length;
  const words = plainText.trim() ? plainText.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  const shiftValue = shift;
  const totalCharacters = plainText.length;
  const alphabeticPercentage = totalCharacters > 0 ? Math.round((letters / totalCharacters) * 100) : 0;
  const preservedCharacters = totalCharacters - letters;

  return {
    letters,
    words,
    shiftValue,
    alphabeticPercentage,
    totalCharacters,
    preservedCharacters
  };
}
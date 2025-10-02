'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { 
  Radio, 
  Clock, 
  Hash, 
  FileText, 
  Volume2, 
  BarChart3 
} from 'lucide-react';

interface MorseCodeAnalyticsProps {
  inputText: string;
  outputText: string;
  mode: 'encode' | 'decode';
  playSpeed: number;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface MorseCodeStats {
  dots: number;
  dashes: number;
  characters: number;
  words: number;
  estimatedDuration: number;
  morseLength: number;
}

export function MorseCodeAnalytics({ 
  inputText, 
  outputText, 
  mode,
  playSpeed,
  showTitle = true, 
  variant = 'default' 
}: MorseCodeAnalyticsProps) {
  const { tool } = useToolTranslations('tools/code-data');
  
  const stats: MorseCodeStats = useMemo(() => {
    const morseText = mode === 'encode' ? outputText : inputText;
    const plainText = mode === 'encode' ? inputText : outputText;
    
    // Count dots and dashes in morse code
    const dots = (morseText.match(/\./g) || []).length;
    const dashes = (morseText.match(/-/g) || []).length;
    
    // Count characters (excluding spaces and separators)
    const characters = plainText.replace(/\s/g, '').length;
    
    // Count words
    const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    
    // Calculate estimated duration in seconds
    // Based on standard morse timing: dot = 1 unit, dash = 3 units, 
    // inter-element gap = 1 unit, inter-character gap = 3 units, inter-word gap = 7 units
    const totalElements = dots + (dashes * 3); // Basic elements
    const interElementGaps = Math.max(0, (dots + dashes) - characters); // Gaps between dots/dashes within characters
    const interCharacterGaps = Math.max(0, characters - words) * 3; // Gaps between characters
    const interWordGaps = Math.max(0, words - 1) * 7; // Gaps between words
    
    const totalUnits = totalElements + interElementGaps + interCharacterGaps + interWordGaps;
    
    // Convert to seconds based on WPM (Words Per Minute)
    // Standard: PARIS = 50 units, so 1 WPM = 50 units per minute
    const unitsPerSecond = (playSpeed * 50) / 60;
    const estimatedDuration = totalUnits / unitsPerSecond;
    
    // Morse code length (total characters including spaces and separators)
    const morseLength = morseText.length;

    return {
      dots,
      dashes,
      characters,
      words,
      estimatedDuration,
      morseLength
    };
  }, [inputText, outputText, mode, playSpeed]);

  const statisticsData = [
    {
      key: 'dots',
      label: tool('morse.analytics.dots'),
      value: stats.dots,
      icon: Radio,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'dashes',
      label: tool('morse.analytics.dashes'),
      value: stats.dashes,
      icon: Radio,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'characters',
      label: tool('morse.analytics.characters'),
      value: stats.characters,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'words',
      label: tool('morse.analytics.words'),
      value: stats.words,
      icon: Hash,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'duration',
      label: tool('morse.analytics.duration'),
      value: `${Math.round(stats.estimatedDuration)}s`,
      icon: Clock,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      key: 'morseLength',
      label: tool('morse.analytics.morseLength'),
      value: stats.morseLength,
      icon: Volume2,
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
            <BarChart3 className="h-5 w-5 text-primary" />
            {tool('morse.analytics.title')}
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
export function calculateMorseCodeStats(
  inputText: string, 
  outputText: string, 
  mode: 'encode' | 'decode',
  playSpeed: number
): MorseCodeStats {
  const morseText = mode === 'encode' ? outputText : inputText;
  const plainText = mode === 'encode' ? inputText : outputText;
  
  const dots = (morseText.match(/\./g) || []).length;
  const dashes = (morseText.match(/-/g) || []).length;
  const characters = plainText.replace(/\s/g, '').length;
  const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  
  const totalElements = dots + (dashes * 3);
  const interElementGaps = Math.max(0, (dots + dashes) - characters);
  const interCharacterGaps = Math.max(0, characters - words) * 3;
  const interWordGaps = Math.max(0, words - 1) * 7;
  
  const totalUnits = totalElements + interElementGaps + interCharacterGaps + interWordGaps;
  const unitsPerSecond = (playSpeed * 50) / 60;
  const estimatedDuration = totalUnits / unitsPerSecond;
  const morseLength = morseText.length;

  return {
    dots,
    dashes,
    characters,
    words,
    estimatedDuration,
    morseLength
  };
}
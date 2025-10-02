'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { BarChart3, Hash, Type, FileText, AlignLeft, HelpCircle, AlertCircle, MessageSquare } from 'lucide-react';

interface SentenceCounterAnalyticsProps {
  text: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface SentenceAnalysisStats {
  totalSentences: number;
  averageWordsPerSentence: number;
  shortestSentence: number;
  longestSentence: number;
  declarativeSentences: number;
  questionSentences: number;
  exclamatorySentences: number;
  complexSentences: number;
}

export function SentenceCounterAnalytics({ text, showTitle = true, variant = 'default' }: SentenceCounterAnalyticsProps) {
  const { tSync } = useCommonTranslations();
  
  const stats: SentenceAnalysisStats = useMemo(() => {
    if (!text || text.trim().length === 0) {
      return {
        totalSentences: 0,
        averageWordsPerSentence: 0,
        shortestSentence: 0,
        longestSentence: 0,
        declarativeSentences: 0,
        questionSentences: 0,
        exclamatorySentences: 0,
        complexSentences: 0
      };
    }

    // Split text into sentences using sentence terminators
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    const totalSentences = sentences.length;

    if (totalSentences === 0) {
      return {
        totalSentences: 0,
        averageWordsPerSentence: 0,
        shortestSentence: 0,
        longestSentence: 0,
        declarativeSentences: 0,
        questionSentences: 0,
        exclamatorySentences: 0,
        complexSentences: 0
      };
    }

    // Calculate word counts for each sentence
    const sentenceWordCounts = sentences.map(sentence => 
      sentence.trim().split(/\s+/).filter(word => word.length > 0).length
    );

    // Calculate statistics
    const totalWords = sentenceWordCounts.reduce((sum, count) => sum + count, 0);
    const averageWordsPerSentence = Math.round((totalWords / totalSentences) * 10) / 10;
    const shortestSentence = Math.min(...sentenceWordCounts);
    const longestSentence = Math.max(...sentenceWordCounts);

    // Analyze sentence types based on original text patterns
    let questionSentences = 0;
    let exclamatorySentences = 0;
    let declarativeSentences = 0;

    // Look for sentence patterns in original text
    const sentencePatterns = text.match(/[^.!?]*[.!?]/g) || [];
    
    sentencePatterns.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.includes('?')) {
        questionSentences++;
      } else if (trimmed.includes('!')) {
        exclamatorySentences++;
      } else if (trimmed.includes('.')) {
        declarativeSentences++;
      }
    });

    // Calculate complex sentences (sentences with more than 15 words or containing conjunctions)
    const complexSentences = sentences.filter(sentence => {
      const wordCount = sentence.trim().split(/\s+/).length;
      const hasConjunctions = /\b(and|but|or|because|although|however|therefore|moreover|furthermore|nevertheless)\b/i.test(sentence);
      return wordCount > 15 || hasConjunctions;
    }).length;

    return {
      totalSentences,
      averageWordsPerSentence,
      shortestSentence,
      longestSentence,
      declarativeSentences,
      questionSentences,
      exclamatorySentences,
      complexSentences
    };
  }, [text]);

  const statisticsData = [
    {
      key: 'totalSentences',
      label: tSync('analytics.sentences', 'Total Sentences'),
      value: stats.totalSentences,
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'averageWordsPerSentence',
      label: 'Avg Words/Sentence',
      value: stats.averageWordsPerSentence,
      icon: BarChart3,
      color: 'text-green-600 dark:text-green-400',
      isDecimal: true
    },
    {
      key: 'shortestSentence',
      label: 'Shortest (words)',
      value: stats.shortestSentence,
      icon: Hash,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'longestSentence',
      label: 'Longest (words)',
      value: stats.longestSentence,
      icon: Type,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'declarativeSentences',
      label: 'Declarative (.)',
      value: stats.declarativeSentences,
      icon: FileText,
      color: 'text-gray-600 dark:text-gray-400'
    },
    {
      key: 'questionSentences',
      label: 'Questions (?)',
      value: stats.questionSentences,
      icon: HelpCircle,
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      key: 'exclamatorySentences',
      label: 'Exclamatory (!)',
      value: stats.exclamatorySentences,
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      key: 'complexSentences',
      label: 'Complex Sentences',
      value: stats.complexSentences,
      icon: AlignLeft,
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color, isDecimal }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {isDecimal ? value.toFixed(1) : value.toLocaleString()}
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
            <MessageSquare className="h-5 w-5 text-primary" />
            {tSync('analytics.sentenceAnalysis', 'Sentence Analysis')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color, isDecimal }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm dark:hover:shadow-orange-500/20 transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className="text-sm font-medium text-foreground">
                {isDecimal ? value.toFixed(1) : value.toLocaleString()}
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
export function calculateSentenceStats(text: string): SentenceAnalysisStats {
  if (!text || text.trim().length === 0) {
    return {
      totalSentences: 0,
      averageWordsPerSentence: 0,
      shortestSentence: 0,
      longestSentence: 0,
      declarativeSentences: 0,
      questionSentences: 0,
      exclamatorySentences: 0,
      complexSentences: 0
    };
  }

  // Split text into sentences using sentence terminators
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  const totalSentences = sentences.length;

  if (totalSentences === 0) {
    return {
      totalSentences: 0,
      averageWordsPerSentence: 0,
      shortestSentence: 0,
      longestSentence: 0,
      declarativeSentences: 0,
      questionSentences: 0,
      exclamatorySentences: 0,
      complexSentences: 0
    };
  }

  // Calculate word counts for each sentence
  const sentenceWordCounts = sentences.map(sentence => 
    sentence.trim().split(/\s+/).filter(word => word.length > 0).length
  );

  // Calculate statistics
  const totalWords = sentenceWordCounts.reduce((sum, count) => sum + count, 0);
  const averageWordsPerSentence = Math.round((totalWords / totalSentences) * 10) / 10;
  const shortestSentence = Math.min(...sentenceWordCounts);
  const longestSentence = Math.max(...sentenceWordCounts);

  // Analyze sentence types based on original text patterns
  let questionSentences = 0;
  let exclamatorySentences = 0;
  let declarativeSentences = 0;

  // Look for sentence patterns in original text
  const sentencePatterns = text.match(/[^.!?]*[.!?]/g) || [];
  
  sentencePatterns.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.includes('?')) {
      questionSentences++;
    } else if (trimmed.includes('!')) {
      exclamatorySentences++;
    } else if (trimmed.includes('.')) {
      declarativeSentences++;
    }
  });

  // Calculate complex sentences (sentences with more than 15 words or containing conjunctions)
  const complexSentences = sentences.filter(sentence => {
    const wordCount = sentence.trim().split(/\s+/).length;
    const hasConjunctions = /\b(and|but|or|because|although|however|therefore|moreover|furthermore|nevertheless)\b/i.test(sentence);
    return wordCount > 15 || hasConjunctions;
  }).length;

  return {
    totalSentences,
    averageWordsPerSentence,
    shortestSentence,
    longestSentence,
    declarativeSentences,
    questionSentences,
    exclamatorySentences,
    complexSentences
  };
}
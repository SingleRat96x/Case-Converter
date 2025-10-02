'use client';

import React, { useState } from 'react';
import { BaseAnalysisConverter } from '@/components/shared/BaseAnalysisConverter';
import { WordFrequencyAnalytics } from '@/components/shared/WordFrequencyAnalytics';
import { downloadTextAsFile } from '@/lib/utils';
import { buildWordFrequencyReport } from '@/components/shared/reportUtils';
import { useToolTranslations } from '@/lib/i18n/hooks';

export function WordFrequencyAnalyzer() {
  const { common, tool } = useToolTranslations('tools/text-modifiers');
  const [text, setText] = useState('');

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleFileUploaded = (content: string) => {
    setText(content);
  };

  return (
    <BaseAnalysisConverter
      title={tool('wordFrequency.title')}
      description={tool('wordFrequency.description')}
      inputLabel={''}
      inputPlaceholder={tool('wordFrequency.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={''}
      downloadFileName={tool('wordFrequency.downloadFileName')}
      useMonoFont={false}
      onTextChange={handleTextChange}
      text={text}
      onFileUploaded={handleFileUploaded}
      onDownloadReport={() => {
        const report = buildWordFrequencyReport(text, {
          reportTitle: tool('wordFrequency.report.title', 'Word Frequency Analysis Report'),
          generatedAt: tool('wordFrequency.report.generatedAt', 'Generated'),
          summary: tool('wordFrequency.report.summary', 'Summary'),
          originalText: tool('wordFrequency.report.originalText', 'Original Text'),
          topWordsTitle: tool('wordFrequency.report.topWordsTitle', 'Most Frequent Words'),
          analytics: {
            totalWords: tool('wordFrequency.analytics.totalWords'),
            uniqueWords: tool('wordFrequency.analytics.uniqueWords'),
            mostCommonWord: tool('wordFrequency.analytics.mostCommon'),
            averageWordLength: tool('wordFrequency.analytics.averageLength'),
            rank: tool('wordFrequency.analytics.rank', 'Rank'),
            word: tool('wordFrequency.analytics.word', 'Word'),
            count: tool('wordFrequency.analytics.count', 'Count'),
            percentage: tool('wordFrequency.analytics.percentage', 'Percentage')
          }
        }, process.env.NEXT_PUBLIC_BASE_URL);
        downloadTextAsFile(report, tool('wordFrequency.downloadFileName'));
      }}
      reportText={common('buttons.downloadReport', 'Download Report')}
      mobileLayout="2x2"
    >
      {/* Word Frequency Analytics - No title, clean display */}
      <WordFrequencyAnalytics 
        text={text} 
        variant="compact"
        showTitle={false}
      />
    </BaseAnalysisConverter>
  );
}
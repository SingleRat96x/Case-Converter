'use client';

import React, { useState } from 'react';
import { BaseAnalysisConverter } from '@/components/shared/BaseAnalysisConverter';
import { SentenceCounterAnalytics, calculateSentenceStats } from '@/components/shared/SentenceCounterAnalytics';
import { downloadTextAsFile } from '@/lib/utils';
import { useToolTranslations } from '@/lib/i18n/hooks';

export function SentenceCounter() {
  const { common, tool } = useToolTranslations('tools/text-modifiers');
  const [text, setText] = useState('');

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleFileUploaded = (content: string) => {
    setText(content);
  };

  const buildSentenceAnalysisReport = (text: string, baseUrl?: string) => {
    const stats = calculateSentenceStats(text);
    const timestamp = new Date().toLocaleString();
    
    return `
SENTENCE ANALYSIS REPORT
${tool('sentenceCounter.report.generatedAt', 'Generated')}: ${timestamp}

${tool('sentenceCounter.report.summary', 'Summary')}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Total Sentences: ${stats.totalSentences.toLocaleString()}
📏 Average Words per Sentence: ${stats.averageWordsPerSentence.toFixed(1)}
📝 Shortest Sentence: ${stats.shortestSentence} words
📝 Longest Sentence: ${stats.longestSentence} words

SENTENCE TYPE BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Declarative (.): ${stats.declarativeSentences} (${((stats.declarativeSentences / stats.totalSentences) * 100).toFixed(1)}%)
• Questions (?): ${stats.questionSentences} (${((stats.questionSentences / stats.totalSentences) * 100).toFixed(1)}%)
• Exclamatory (!): ${stats.exclamatorySentences} (${((stats.exclamatorySentences / stats.totalSentences) * 100).toFixed(1)}%)
• Complex Sentences: ${stats.complexSentences} (${((stats.complexSentences / stats.totalSentences) * 100).toFixed(1)}%)

READABILITY INSIGHTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${stats.averageWordsPerSentence < 15 ? '✅ Easy to read - sentences are concise' : 
  stats.averageWordsPerSentence < 20 ? '⚠️ Moderate complexity - good balance' : 
  '🔴 High complexity - consider shorter sentences'}

${stats.complexSentences / stats.totalSentences > 0.5 ? 
  '⚠️ High number of complex sentences detected' : 
  '✅ Good sentence variety'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${tool('sentenceCounter.report.originalText', 'Original Text')}:
${text}

${baseUrl ? `\n📊 Analyze more text: ${baseUrl}/tools/sentence-counter` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated with Text Case Converter - Professional Text Analysis Tools
`;
  };

  return (
    <BaseAnalysisConverter
      title={tool('sentenceCounter.title')}
      description={tool('sentenceCounter.description')}
      inputLabel={''}
      inputPlaceholder={tool('sentenceCounter.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={''}
      downloadFileName={tool('sentenceCounter.downloadFileName')}
      useMonoFont={false}
      onTextChange={handleTextChange}
      text={text}
      onFileUploaded={handleFileUploaded}
      onDownloadReport={() => {
        const report = buildSentenceAnalysisReport(text, process.env.NEXT_PUBLIC_BASE_URL);
        downloadTextAsFile(report, tool('sentenceCounter.downloadFileName'));
      }}
      reportText={common('buttons.downloadReport', 'Download Report')}
      mobileLayout="2x2"
    >
      {/* Sentence Analytics - No title, clean display */}
      <SentenceCounterAnalytics 
        text={text} 
        variant="compact"
        showTitle={false}
      />
    </BaseAnalysisConverter>
  );
}
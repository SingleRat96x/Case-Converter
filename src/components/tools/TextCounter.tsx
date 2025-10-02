'use client';

import React, { useState } from 'react';
import { BaseAnalysisConverter } from '@/components/shared/BaseAnalysisConverter';
import { TextCounterAnalytics } from '@/components/shared/TextCounterAnalytics';
import { downloadTextAsFile } from '@/lib/utils';
import { buildTextAnalysisReport } from '@/components/shared/reportUtils';
import { useToolTranslations } from '@/lib/i18n/hooks';

export function TextCounter() {
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
      title={tool('textCounter.title')}
      description={tool('textCounter.description')}
      inputLabel={''}
      inputPlaceholder={tool('textCounter.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={''}
      downloadFileName={tool('textCounter.downloadFileName')}
      useMonoFont={false}
      onTextChange={handleTextChange}
      text={text}
      onFileUploaded={handleFileUploaded}
      onDownloadReport={() => {
        const report = buildTextAnalysisReport(text, {
          reportTitle: tool('textCounter.report.title', 'Text Analysis Report'),
          generatedAt: tool('textCounter.report.generatedAt', 'Generated'),
          summary: tool('textCounter.report.summary', 'Summary'),
          originalText: tool('textCounter.report.originalText', 'Original Text'),
          analytics: {
            characters: tool('textCounter.analytics.characters'),
            charactersNoSpaces: tool('textCounter.analytics.charactersNoSpaces'),
            words: tool('textCounter.analytics.words'),
            sentences: tool('textCounter.analytics.sentences'),
            lines: tool('textCounter.analytics.lines'),
            paragraphs: tool('textCounter.analytics.paragraphs'),
            readingTime: tool('textCounter.analytics.readingTime'),
            speakingTime: tool('textCounter.analytics.speakingTime'),
            readingTimeUnit: common('units.min', 'min'),
            speakingTimeUnit: common('units.min', 'min')
          }
        }, process.env.NEXT_PUBLIC_BASE_URL);
        downloadTextAsFile(report, tool('textCounter.downloadFileName'));
      }}
      reportText={common('buttons.downloadReport', 'Download Report')}
      mobileLayout="2x2"
    >
      {/* Text Analytics - No title, clean display */}
      <TextCounterAnalytics 
        text={text} 
        variant="compact"
        showTitle={false}
      />
    </BaseAnalysisConverter>
  );
}
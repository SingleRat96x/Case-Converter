'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';

export function SentenceCaseConverter() {
  const { common, tool } = useToolTranslations('tools/case-converters');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');

  const toSentenceCase = (str: string): string => {
    return str.toLowerCase().replace(/(^\w|\.\s+\w)/g, (letter) => letter.toUpperCase());
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Auto-convert to sentence case as user types
    setConvertedText(toSentenceCase(newText));
  };

  const handleFileUploaded = (content: string) => {
    // Ensure file content is also converted to sentence case
    setConvertedText(toSentenceCase(content));
  };

  return (
    <BaseTextConverter
      title={tool('sentenceCase.title')}
      description={tool('sentenceCase.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('sentenceCase.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('sentenceCase.uploadDescription')}
      downloadFileName={tool('sentenceCase.downloadFileName')}
      useMonoFont={false}
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      onFileUploaded={handleFileUploaded}
      showAnalytics={true}
      analyticsVariant="compact"
      mobileLayout="2x2"
    />
  );
}
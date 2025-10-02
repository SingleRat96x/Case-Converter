'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';

export function AlternatingCaseConverter() {
  const { common, tool } = useToolTranslations('tools/case-converters');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');

  const toAlternatingCase = (str: string): string => {
    return str.split('').map((char, i) => 
      i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
    ).join('');
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Auto-convert to alternating case as user types
    setConvertedText(toAlternatingCase(newText));
  };

  const handleFileUploaded = (content: string) => {
    // Ensure file content is also converted to alternating case
    setConvertedText(toAlternatingCase(content));
  };

  return (
    <BaseTextConverter
      title={tool('alternatingCase.title')}
      description={tool('alternatingCase.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('alternatingCase.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('alternatingCase.uploadDescription')}
      downloadFileName={tool('alternatingCase.downloadFileName')}
      useMonoFont={true}
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
'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';

export function TitleCaseConverter() {
  const { common, tool } = useToolTranslations('tools/case-converters');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');

  const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Auto-convert to title case as user types
    setConvertedText(toTitleCase(newText));
  };

  const handleFileUploaded = (content: string) => {
    // Ensure file content is also converted to title case
    setConvertedText(toTitleCase(content));
  };

  return (
    <BaseTextConverter
      title={tool('titleCase.title')}
      description={tool('titleCase.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('titleCase.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('titleCase.uploadDescription')}
      downloadFileName={tool('titleCase.downloadFileName')}
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
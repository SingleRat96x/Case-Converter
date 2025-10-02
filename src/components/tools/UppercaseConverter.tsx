'use client';

import React, { useState } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';

export function UppercaseConverter() {
  const { common, tool } = useToolTranslations('tools/case-converters');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Auto-convert to uppercase as user types
    setConvertedText(newText.toUpperCase());
  };

  const handleFileUploaded = (content: string) => {
    // Ensure file content is also converted to uppercase
    setConvertedText(content.toUpperCase());
  };

  return (
    <BaseTextConverter
      title={tool('uppercase.title')}
      description={tool('uppercase.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('uppercase.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('uppercase.uploadDescription')}
      downloadFileName={tool('uppercase.downloadFileName')}
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

'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { toItalicText } from '@/lib/textTransforms';

export function ItalicTextGenerator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Auto-convert to italic text as user types
    setConvertedText(toItalicText(newText));
  };

  const handleFileUploaded = (content: string) => {
    // Ensure file content is also converted to italic text
    setConvertedText(toItalicText(content));
  };

  return (
    <BaseTextConverter
      title={tool('italic.title')}
      description={tool('italic.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('italic.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('italic.uploadDescription')}
      downloadFileName={tool('italic.downloadFileName')}
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
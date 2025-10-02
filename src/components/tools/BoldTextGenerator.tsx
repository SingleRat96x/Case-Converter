'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { toBoldText } from '@/lib/textTransforms';

export function BoldTextGenerator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Auto-convert to bold text as user types
    setConvertedText(toBoldText(newText));
  };

  const handleFileUploaded = (content: string) => {
    // Ensure file content is also converted to bold text
    setConvertedText(toBoldText(content));
  };

  return (
    <BaseTextConverter
      title={tool('bold.title')}
      description={tool('bold.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('bold.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('bold.uploadDescription')}
      downloadFileName={tool('bold.downloadFileName')}
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
'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { toBigText } from '@/lib/textTransforms';

export function BigTextGenerator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Auto-convert to big text as user types
    setConvertedText(toBigText(newText));
  };

  const handleFileUploaded = (content: string) => {
    // Ensure file content is also converted to big text
    setConvertedText(toBigText(content));
  };

  return (
    <BaseTextConverter
      title={tool('bigText.title')}
      description={tool('bigText.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('bigText.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('bigText.uploadDescription')}
      downloadFileName={tool('bigText.downloadFileName')}
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
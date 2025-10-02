'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { toSubscriptText } from '@/lib/textTransforms';

export function SubscriptTextGenerator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Auto-convert to subscript text as user types
    setConvertedText(toSubscriptText(newText));
  };

  const handleFileUploaded = (content: string) => {
    // Ensure file content is also converted to subscript text
    setConvertedText(toSubscriptText(content));
  };

  return (
    <BaseTextConverter
      title={tool('subscript.title')}
      description={tool('subscript.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('subscript.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('subscript.uploadDescription')}
      downloadFileName={tool('subscript.downloadFileName')}
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
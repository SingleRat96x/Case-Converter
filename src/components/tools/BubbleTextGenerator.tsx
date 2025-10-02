'use client';

import React, { useState, useEffect } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { toBubbleText } from '@/lib/textTransforms';

export function BubbleTextGenerator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');

  useEffect(() => {
    if (text) {
      setConvertedText(toBubbleText(text));
    } else {
      setConvertedText('');
    }
  }, [text]);

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleFileUploaded = (content: string) => {
    setText(content);
  };

  return (
    <BaseTextConverter
      title={tool('bubble.title')}
      description={tool('bubble.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('bubble.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('bubble.uploadDescription')}
      downloadFileName={tool('bubble.downloadFileName')}
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
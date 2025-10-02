'use client';

import React, { useState, useEffect } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { toMirrorText } from '@/lib/textTransforms';

export function MirrorTextGenerator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');

  useEffect(() => {
    if (text) {
      setConvertedText(toMirrorText(text));
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
      title={tool('mirror.title')}
      description={tool('mirror.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('mirror.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('mirror.uploadDescription')}
      downloadFileName={tool('mirror.downloadFileName')}
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      onFileUploaded={handleFileUploaded}
      useMonoFont={true}
      showAnalytics={true}
      analyticsVariant="compact"
      mobileLayout="2x2"
    />
  );
}
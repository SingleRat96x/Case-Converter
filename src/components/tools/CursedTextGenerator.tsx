'use client';

import React, { useState, useEffect } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { toCursedText } from '@/lib/textTransforms';
import { Button } from '@/components/ui/button';

export function CursedTextGenerator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    if (text) {
      setConvertedText(toCursedText(text, intensity));
    } else {
      setConvertedText('');
    }
  }, [text, intensity]);

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleFileUploaded = (content: string) => {
    setText(content);
  };

  const handleIntensityChange = (newIntensity: 'low' | 'medium' | 'high') => {
    setIntensity(newIntensity);
  };

  return (
    <BaseTextConverter
      title={tool('cursed.title')}
      description={tool('cursed.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('cursed.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('cursed.uploadDescription')}
      downloadFileName={tool('cursed.downloadFileName')}
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      onFileUploaded={handleFileUploaded}
      showAnalytics={true}
      analyticsVariant="compact"
      mobileLayout="2x2"
    >
      {/* Intensity Selection Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={intensity === 'low' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleIntensityChange('low')}
        >
          {tool('cursed.intensityLow')}
        </Button>
        <Button
          variant={intensity === 'medium' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleIntensityChange('medium')}
        >
          {tool('cursed.intensityMedium')}
        </Button>
        <Button
          variant={intensity === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleIntensityChange('high')}
        >
          {tool('cursed.intensityHigh')}
        </Button>
      </div>
    </BaseTextConverter>
  );
}
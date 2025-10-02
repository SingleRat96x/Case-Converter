'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Type, ArrowUpAZ, ArrowDownAZ, CaseSensitive, TextQuote, Braces, Underline, Link as LinkIcon, Shuffle } from 'lucide-react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';

export function TextCaseConverter() {
  const { common, tool } = useToolTranslations('tools/case-converters');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [activeCase, setActiveCase] = useState('original');

  const caseTransformations = {
    original: (text: string) => text,
    uppercase: (text: string) => text.toUpperCase(),
    lowercase: (text: string) => text.toLowerCase(),
    titlecase: (text: string) => text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
    sentencecase: (text: string) => text.toLowerCase().replace(/(^\w|\.\s+\w)/g, (letter) => letter.toUpperCase()),
    camelcase: (text: string) => text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()),
    snakecase: (text: string) => text.toLowerCase().replace(/\s+/g, '_'),
    kebabcase: (text: string) => text.toLowerCase().replace(/\s+/g, '-'),
    alternating: (text: string) => text.split('').map((char, i) => i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()).join(''),
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    updateConvertedText(newText, activeCase);
  };

  const updateConvertedText = (inputText: string, caseType: string) => {
    const transformation = caseTransformations[caseType as keyof typeof caseTransformations];
    if (transformation) {
      setConvertedText(transformation(inputText));
    }
  };

  const handleCaseChange = (caseType: string) => {
    setActiveCase(caseType);
    updateConvertedText(text, caseType);
  };

  return (
    <BaseTextConverter
      title={tool('main.title')}
      description={tool('main.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={common('labels.outputText')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={common('descriptions.uploadFile')}
      downloadFileName={tool('main.downloadFileName')}
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      showAnalytics={true}
      analyticsVariant="compact"
    >
      {/* Case Selection Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button variant={activeCase === 'original' ? 'default' : 'outline'} size="sm" onClick={() => handleCaseChange('original')}>
          <Type className="h-4 w-4 mr-2" /> original
        </Button>
        <Button variant={activeCase === 'uppercase' ? 'default' : 'outline'} size="sm" onClick={() => handleCaseChange('uppercase')}>
          <ArrowUpAZ className="h-4 w-4 mr-2" /> uppercase
        </Button>
        <Button variant={activeCase === 'lowercase' ? 'default' : 'outline'} size="sm" onClick={() => handleCaseChange('lowercase')}>
          <ArrowDownAZ className="h-4 w-4 mr-2" /> lowercase
        </Button>
        <Button variant={activeCase === 'titlecase' ? 'default' : 'outline'} size="sm" onClick={() => handleCaseChange('titlecase')}>
          <TextQuote className="h-4 w-4 mr-2" /> titlecase
        </Button>
        <Button variant={activeCase === 'sentencecase' ? 'default' : 'outline'} size="sm" onClick={() => handleCaseChange('sentencecase')}>
          <CaseSensitive className="h-4 w-4 mr-2" /> sentencecase
        </Button>
        <Button variant={activeCase === 'camelcase' ? 'default' : 'outline'} size="sm" onClick={() => handleCaseChange('camelcase')}>
          <Braces className="h-4 w-4 mr-2" /> camelcase
        </Button>
        <Button variant={activeCase === 'snakecase' ? 'default' : 'outline'} size="sm" onClick={() => handleCaseChange('snakecase')}>
          <Underline className="h-4 w-4 mr-2" /> snakecase
        </Button>
        <Button variant={activeCase === 'kebabcase' ? 'default' : 'outline'} size="sm" onClick={() => handleCaseChange('kebabcase')}>
          <LinkIcon className="h-4 w-4 mr-2" /> kebabcase
        </Button>
        <Button variant={activeCase === 'alternating' ? 'default' : 'outline'} size="sm" onClick={() => handleCaseChange('alternating')}>
          <Shuffle className="h-4 w-4 mr-2" /> alternating
        </Button>
      </div>
    </BaseTextConverter>
  );
}

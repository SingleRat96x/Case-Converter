'use client';

import React, { useState, useEffect } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { LineNumberOptions } from './LineNumberOptions';
import { addLineNumbers, type LineNumberOptions as LineNumberOptionsType } from '@/lib/textTransforms';

export function AddLineNumbersConverter() {
  const { common, tool } = useToolTranslations('tools/text-modifiers');
  const [text, setText] = useState('');
  const [numberedText, setNumberedText] = useState('');
  const [options, setOptions] = useState<LineNumberOptionsType>({
    startAt: 1,
    step: 1,
    format: 'numeric',
    separator: '. ',
    applyTo: 'all',
    skipLinesStartingWith: ''
  });

  // Auto-update numbered text when text or options change
  useEffect(() => {
    if (text) {
      const result = addLineNumbers(text, options);
      setNumberedText(result);
    } else {
      setNumberedText('');
    }
  }, [text, options]);

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleFileUploaded = () => {
    // File content will be processed through handleTextChange
  };

  return (
    <>
      <BaseTextConverter
        title={tool('addLineNumbers.title')}
        description={tool('addLineNumbers.description')}
        inputLabel={common('labels.inputText')}
        outputLabel={tool('addLineNumbers.outputLabel')}
        inputPlaceholder={tool('addLineNumbers.inputPlaceholder')}
        copyText={common('buttons.copy')}
        clearText={common('buttons.clear')}
        downloadText={common('buttons.download')}
        uploadText={common('buttons.upload')}
        uploadDescription={tool('addLineNumbers.uploadDescription')}
        downloadFileName={tool('addLineNumbers.downloadFileName')}
        useMonoFont={true}
        onTextChange={handleTextChange}
        text={text}
        convertedText={numberedText}
        onConvertedTextUpdate={setNumberedText}
        onFileUploaded={handleFileUploaded}
        showAnalytics={true}
        analyticsVariant="compact"
        mobileLayout="2x2"
        actionButtonsPosition="after-children"
      >
        {/* Options Component */}
        <div className="mb-4">
          <LineNumberOptions 
            options={options} 
            onOptionsChange={setOptions}
            translations={{
              startAt: tool('addLineNumbers.options.startAt'),
              step: tool('addLineNumbers.options.step'),
              format: tool('addLineNumbers.options.format'),
              separator: tool('addLineNumbers.options.separator'),
              applyTo: tool('addLineNumbers.options.applyTo'),
              skipLinesStartingWith: tool('addLineNumbers.options.skipLinesStartingWith'),
              formats: {
                numeric: tool('addLineNumbers.formats.numeric'),
                padded2: tool('addLineNumbers.formats.padded2'),
                padded3: tool('addLineNumbers.formats.padded3'),
                alphaUpper: tool('addLineNumbers.formats.alphaUpper'),
                alphaLower: tool('addLineNumbers.formats.alphaLower'),
                romanUpper: tool('addLineNumbers.formats.romanUpper'),
                romanLower: tool('addLineNumbers.formats.romanLower')
              },
              separators: {
                periodSpace: tool('addLineNumbers.separators.periodSpace'),
                parenSpace: tool('addLineNumbers.separators.parenSpace'),
                colonSpace: tool('addLineNumbers.separators.colonSpace'),
                hyphenSpace: tool('addLineNumbers.separators.hyphenSpace'),
                pipe: tool('addLineNumbers.separators.pipe'),
                tab: tool('addLineNumbers.separators.tab')
              },
              applyToOptions: {
                all: tool('addLineNumbers.applyToOptions.all'),
                nonEmpty: tool('addLineNumbers.applyToOptions.nonEmpty')
              }
            }}
          />
        </div>
      </BaseTextConverter>
    </>
  );
}

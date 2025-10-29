'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { PunctuationOptions } from '@/components/shared/PunctuationOptions';
import { removePunctuation, RemovePunctuationOptions } from '@/lib/textTransforms';

export function RemovePunctuationTool() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [options, setOptions] = useState<RemovePunctuationOptions>({
    keepApostrophes: true,
    keepHyphens: true,
    keepEmailUrls: true,
    keepNumbers: true,
    keepLineBreaks: true,
    customKeepList: ''
  });

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Auto-convert as user types
    const cleaned = removePunctuation(newText, options);
    setConvertedText(cleaned);
  };

  const handleOptionsChange = (newOptions: RemovePunctuationOptions) => {
    setOptions(newOptions);
    // Re-process current text with new options
    if (text) {
      const cleaned = removePunctuation(text, newOptions);
      setConvertedText(cleaned);
    }
  };

  const handleFileUploaded = (content: string) => {
    // Ensure file content is also processed
    const cleaned = removePunctuation(content, options);
    setConvertedText(cleaned);
  };

  return (
    <BaseTextConverter
      title={tool('removePunctuation.title')}
      description={tool('removePunctuation.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('removePunctuation.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription={tool('removePunctuation.uploadDescription')}
      downloadFileName={tool('removePunctuation.downloadFileName')}
      useMonoFont={false}
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      onFileUploaded={handleFileUploaded}
      showAnalytics={true}
      analyticsVariant="compact"
      mobileLayout="2x2"
      actionButtonsPosition="after-children"
    >
      {/* Tool Options */}
      <div className="space-y-3">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {tool('removePunctuation.helperText')}
          </p>
        </div>
        
        <PunctuationOptions
          options={options}
          onOptionsChange={handleOptionsChange}
          labels={{
            keepApostrophes: tool('removePunctuation.options.keepApostrophes'),
            keepHyphens: tool('removePunctuation.options.keepHyphens'),
            keepEmailUrls: tool('removePunctuation.options.keepEmailUrls'),
            keepNumbers: tool('removePunctuation.options.keepNumbers'),
            keepLineBreaks: tool('removePunctuation.options.keepLineBreaks'),
            customKeepList: tool('removePunctuation.options.customKeepList'),
            customKeepListPlaceholder: tool('removePunctuation.options.customKeepListPlaceholder')
          }}
        />
      </div>
    </BaseTextConverter>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { instagramFontStyles } from '@/lib/textTransforms';
import { Check } from 'lucide-react';

export function InstagramFontsGenerator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('bold-serif');
  const [convertedText, setConvertedText] = useState('');

  useEffect(() => {
    if (text) {
      const style = instagramFontStyles.find(s => s.id === selectedStyle);
      if (style) {
        setConvertedText(style.transform(text));
      }
    } else {
      setConvertedText('');
    }
  }, [text, selectedStyle]);

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleFileUploaded = (content: string) => {
    setText(content);
  };

  const handleStyleChange = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  return (
    <BaseTextConverter
      title={tool('instagramFonts.title')}
      description={tool('instagramFonts.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('instagramFonts.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName={tool('instagramFonts.downloadFileName')}
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      onFileUploaded={handleFileUploaded}
      showAnalytics={true}
      analyticsVariant="compact"
      actionButtonsPosition="after-children"
    >
      {/* Instagram Font Style Selector */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {tool('instagramFonts.selectStyle', 'Select Instagram Font Style')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {instagramFontStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleChange(style.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 text-center group hover:scale-105 hover:shadow-lg ${
                selectedStyle === style.id
                  ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              {/* Check icon for selected state */}
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              
              {/* Font style title as preview */}
              <div 
                className="text-lg font-medium text-foreground transition-colors group-hover:text-primary"
                style={{ fontFamily: 'inherit' }}
              >
                {style.transform(style.name)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </BaseTextConverter>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { discordFontStyles } from '@/lib/textTransforms';
import { Check } from 'lucide-react';

export function DiscordFontsGenerator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('bold');
  const [convertedText, setConvertedText] = useState('');

  useEffect(() => {
    if (text) {
      const style = discordFontStyles.find(s => s.id === selectedStyle);
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
      title={tool('discordFonts.title')}
      description={tool('discordFonts.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('discordFonts.outputLabel')}
      inputPlaceholder={common('placeholders.enterText')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName={tool('discordFonts.downloadFileName')}
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      onFileUploaded={handleFileUploaded}
      showAnalytics={true}
      analyticsVariant="compact"
      actionButtonsPosition="after-children"
    >
      {/* Discord Font Style Selector */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {tool('discordFonts.selectStyle', 'Select Discord Font Style')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {discordFontStyles.map((style) => {
            const isSelected = selectedStyle === style.id;
            const transformedTitle = style.transform(style.name);
            
            return (
              <button
                key={style.id}
                onClick={() => handleStyleChange(style.id)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 ease-in-out text-center group ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20 scale-[1.02]'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] hover:shadow-md'
                }`}
              >
                {/* Check icon for selected state */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center transition-all duration-200">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                
                {/* Style name using the transformed font as preview */}
                <div className={`text-lg font-medium text-center break-all leading-tight transition-colors duration-200 ${
                  isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                }`}>
                  {transformedTitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </BaseTextConverter>
  );
}
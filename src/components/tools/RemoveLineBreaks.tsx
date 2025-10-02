'use client';

import React, { useState, useCallback } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { RemoveLineBreaksAnalytics } from '@/components/shared/RemoveLineBreaksAnalytics';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';

export function RemoveLineBreaks() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [preserveParagraphs, setPreserveParagraphs] = useState(false);
  const [replaceWith, setReplaceWith] = useState<'space' | 'nothing'>('space');

  const removeLineBreaks = useCallback((inputText: string, preserveParas: boolean, replacement: 'space' | 'nothing') => {
    if (!inputText) {
      return '';
    }

    let result = inputText;
    
    if (preserveParas) {
      // Replace single line breaks with space/nothing, but preserve double line breaks
      result = result.replace(/([^\n])\n([^\n])/g, replacement === 'space' ? '$1 $2' : '$1$2');
    } else {
      // Replace all line breaks with space/nothing
      const replacementChar = replacement === 'space' ? ' ' : '';
      result = result.replace(/\r?\n/g, replacementChar);
      
      // Clean up multiple spaces if replacing with space
      if (replacement === 'space') {
        result = result.replace(/\s+/g, ' ').trim();
      }
    }
    
    return result;
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);
    setConvertedText(removeLineBreaks(newText, preserveParagraphs, replaceWith));
  };

  const handlePreserveParagraphsChange = (preserve: boolean) => {
    setPreserveParagraphs(preserve);
    setConvertedText(removeLineBreaks(text, preserve, replaceWith));
  };

  const handleReplaceWithChange = (replacement: 'space' | 'nothing') => {
    setReplaceWith(replacement);
    setConvertedText(removeLineBreaks(text, preserveParagraphs, replacement));
  };

  return (
    <BaseTextConverter
      title={tool('removeLineBreaks.title')}
      description={tool('removeLineBreaks.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('removeLineBreaks.outputLabel')}
      inputPlaceholder={tool('removeLineBreaks.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName="text-without-line-breaks.txt"
      onTextChange={handleTextChange}
      text={text}
      convertedText={convertedText}
      onConvertedTextUpdate={setConvertedText}
      showAnalytics={false}
      mobileLayout="2x2"
    >
      <div className="space-y-4">
        {/* Options */}
        <div className="space-y-3">
          {/* Replace With Options */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">
              {tool('removeLineBreaks.replaceWith')}
            </span>
            <div className="flex gap-2">
              <Button
                variant={replaceWith === 'space' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleReplaceWithChange('space')}
                className="min-w-[100px]"
              >
                {tool('removeLineBreaks.space')}
              </Button>
              <Button
                variant={replaceWith === 'nothing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleReplaceWithChange('nothing')}
                className="min-w-[100px]"
              >
                {tool('removeLineBreaks.nothing')}
              </Button>
            </div>
          </div>

          {/* Preserve Paragraphs Option */}
          <div className="flex justify-center">
            <Button
              variant={preserveParagraphs ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePreserveParagraphsChange(!preserveParagraphs)}
              className="gap-2"
            >
              <div className={`h-4 w-4 rounded border ${preserveParagraphs ? 'bg-primary border-primary' : 'border-input'}`}>
                {preserveParagraphs && (
                  <svg viewBox="0 0 16 16" className="w-full h-full">
                    <path
                      fill="currentColor"
                      d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                    />
                  </svg>
                )}
              </div>
              {tool('removeLineBreaks.preserveParagraphs')}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-muted-foreground">
          {preserveParagraphs 
            ? tool('removeLineBreaks.preserveInfo')
            : tool('removeLineBreaks.removeAllInfo')
          }
        </div>

        {/* Analytics */}
        {text && (
          <RemoveLineBreaksAnalytics
            originalText={text}
            convertedText={convertedText}
            preserveParagraphs={preserveParagraphs}
            replaceWith={replaceWith}
            variant="compact"
            showTitle={false}
          />
        )}
      </div>
    </BaseTextConverter>
  );
}
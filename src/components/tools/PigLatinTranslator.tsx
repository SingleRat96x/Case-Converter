'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { PigLatinAnalytics } from '@/components/shared/PigLatinAnalytics';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { FeedbackMessage } from '@/components/shared/FeedbackMessage';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { copyToClipboard, downloadTextAsFile } from '@/lib/utils';
import { 
  toPigLatin, 
  fromPigLatin
} from '@/lib/pigLatinTransforms';

type ConversionMode = 'toPigLatin' | 'fromPigLatin';

export function PigLatinTranslator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [mode, setMode] = useState<ConversionMode>('toPigLatin');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleConversion = useCallback((inputText: string, conversionMode: ConversionMode) => {
    if (!inputText.trim()) {
      setConvertedText('');
      return;
    }

    try {
      let result = '';
      
      if (conversionMode === 'toPigLatin') {
        result = toPigLatin(inputText);
      } else {
        result = fromPigLatin(inputText);
      }
      
      setConvertedText(result);
    } catch (error) {
      console.error('Pig Latin conversion error:', error);
      setConvertedText('');
    }
  }, []);

  useEffect(() => {
    handleConversion(text, mode);
  }, [text, mode, handleConversion]);

  const handleTextChange = (newText: string) => {
    setText(newText);
  };

  const handleConvertedTextUpdate = (newText: string) => {
    setConvertedText(newText);
  };

  const handleFileUploaded = (content: string) => {
    setText(content);
  };

  const handleModeChange = (newMode: ConversionMode) => {
    setMode(newMode);
  };

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCopy = async () => {
    if (!convertedText.trim()) {
      return false;
    }
    const success = await copyToClipboard(convertedText);
    return success;
  };

  const handleClear = () => {
    setText('');
    setConvertedText('');
    return true;
  };

  const handleDownload = () => {
    if (!convertedText.trim()) {
      showFeedback('No content to download', 'error');
      return false;
    }
    try {
      downloadTextAsFile(convertedText, tool('pigLatin.downloadFileName'));
      showFeedback('File downloaded successfully!');
      return true;
    } catch {
      showFeedback('Failed to download file', 'error');
      return false;
    }
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.js,.ts,.jsx,.tsx,.json,.css,.html';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            setText(content);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
    return true;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
      <BaseTextConverter
        title={tool('pigLatin.title')}
        description={tool('pigLatin.description')}
        inputLabel={mode === 'toPigLatin' ? common('labels.inputText') : tool('pigLatin.pigLatinInputLabel')}
        outputLabel={mode === 'toPigLatin' ? tool('pigLatin.pigLatinOutputLabel') : common('labels.outputText')}
        inputPlaceholder={mode === 'toPigLatin' 
          ? tool('pigLatin.inputPlaceholder') 
          : tool('pigLatin.pigLatinInputPlaceholder')
        }
        copyText=""
        clearText=""
        downloadText=""
        uploadText=""
        uploadDescription=""
        downloadFileName={tool('pigLatin.downloadFileName')}
        useMonoFont={false}
        showAnalytics={false}
        onTextChange={handleTextChange}
        text={text}
        convertedText={convertedText}
        onConvertedTextUpdate={handleConvertedTextUpdate}
        onFileUploaded={handleFileUploaded}
      >
        {/* Conversion Mode Toggle */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="inline-flex rounded-md border border-border bg-card p-1">
              <Button
                variant={mode === 'toPigLatin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('toPigLatin')}
                className="rounded-sm"
              >
                Text → Pig Latin
              </Button>
              <Button
                variant={mode === 'fromPigLatin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('fromPigLatin')}
                className="rounded-sm"
              >
                Pig Latin → Text
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <div className="flex justify-center">
            <ActionButtons
              onCopy={handleCopy}
              onClear={handleClear}
              onDownload={handleDownload}
              onUpload={handleUpload}
              copyText={common('buttons.copy')}
              clearText={common('buttons.clear')}
              downloadText={common('buttons.download')}
              uploadText={common('buttons.upload')}
              hasContent={!!(text || convertedText)}
              showUpload={true}
            />
          </div>
        </div>

        {/* Pig Latin Analytics */}
        {(text || convertedText) && (
          <div className="mb-6">
            <PigLatinAnalytics 
              originalText={mode === 'toPigLatin' ? text : convertedText}
              convertedText={mode === 'toPigLatin' ? convertedText : text}
              variant="compact"
              showTitle={false}
            />
          </div>
        )}
      </BaseTextConverter>

      {/* Feedback Message */}
      <FeedbackMessage feedback={feedback} />
    </div>
  );
}
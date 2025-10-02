'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { NatoPhoneticTable } from './nato/NatoPhoneticTable';
import { NatoPhoneticAnalytics } from '@/components/shared/NatoPhoneticAnalytics';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { FeedbackMessage } from '@/components/shared/FeedbackMessage';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { copyToClipboard, downloadTextAsFile } from '@/lib/utils';
import { 
  textToNatoPhonetic, 
  natoPhoneticToText
} from '@/lib/natoPhoneticUtils';

type ConversionMode = 'textToPhonetic' | 'phoneticToText';

export function NatoPhoneticConverter() {
  const { common, tool } = useToolTranslations('tools/miscellaneous');
  
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [mode, setMode] = useState<ConversionMode>('textToPhonetic');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleConversion = useCallback((inputText: string, conversionMode: ConversionMode) => {
    if (!inputText.trim()) {
      setConvertedText('');
      return;
    }

    let result: string;
    if (conversionMode === 'textToPhonetic') {
      result = textToNatoPhonetic(inputText);
    } else {
      result = natoPhoneticToText(inputText);
    }

    setConvertedText(result);
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
      showFeedback('No content to copy', 'error');
      return false;
    }
    const success = await copyToClipboard(convertedText);
    if (success) {
      showFeedback('Content copied to clipboard!');
    } else {
      showFeedback('Failed to copy content', 'error');
    }
    return success;
  };

  const handleClear = () => {
    setText('');
    setConvertedText('');
    showFeedback('Content cleared!');
    return true;
  };

  const handleDownload = () => {
    if (!convertedText.trim()) {
      showFeedback('No content to download', 'error');
      return false;
    }
    try {
      downloadTextAsFile(convertedText, tool('natoPhonetic.downloadFileName'));
      showFeedback('File downloaded successfully!');
      return true;
    } catch {
      showFeedback('Failed to download file', 'error');
      return false;
    }
  };

  const handleUpload = () => {
    return false; // Not implemented for this tool
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
      <BaseTextConverter
        title={tool('natoPhonetic.title')}
        description={tool('natoPhonetic.description')}
        inputLabel={tool('natoPhonetic.inputLabel')}
        outputLabel={tool('natoPhonetic.outputLabel')}
        inputPlaceholder={tool('natoPhonetic.inputPlaceholder')}
        copyText=""
        clearText=""
        downloadText=""
        uploadText=""
        uploadDescription=""
        downloadFileName={tool('natoPhonetic.downloadFileName')}
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
                variant={mode === 'textToPhonetic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('textToPhonetic')}
                className="rounded-sm"
              >
                {tool('natoPhonetic.modes.textToPhonetic')}
              </Button>
              <Button
                variant={mode === 'phoneticToText' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('phoneticToText')}
                className="rounded-sm"
              >
                {tool('natoPhonetic.modes.phoneticToText')}
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

        {/* NATO Phonetic Analytics */}
        {(text || convertedText) && (
          <div className="mb-6">
            <NatoPhoneticAnalytics 
              originalText={text}
              convertedText={convertedText}
              variant="compact"
              showTitle={false}
            />
          </div>
        )}


        {/* NATO Phonetic Alphabet Reference Table */}
        <NatoPhoneticTable className="mt-6" />
      </BaseTextConverter>

      {/* Feedback Message */}
      <FeedbackMessage feedback={feedback} />
    </div>
  );
}
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { PhoneticSpellingAnalytics } from '@/components/shared/PhoneticSpellingAnalytics';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { FeedbackMessage } from '@/components/shared/FeedbackMessage';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { copyToClipboard, downloadTextAsFile } from '@/lib/utils';
import { 
  toPhoneticSpelling, 
  fromPhoneticSpelling, 
  PhoneticFormat, 
  detectPhoneticFormat 
} from '@/lib/phoneticTransforms';
import { Volume2, Type } from 'lucide-react';

type ConversionMode = 'toPhonetic' | 'fromPhonetic';

export function PhoneticSpellingGenerator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [phoneticFormat, setPhoneticFormat] = useState<PhoneticFormat>('simple');
  const [mode, setMode] = useState<ConversionMode>('toPhonetic');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleConversion = useCallback((inputText: string, conversionMode: ConversionMode, format: PhoneticFormat) => {
    if (!inputText.trim()) {
      setConvertedText('');
      return;
    }

    try {
      let result = '';
      
      if (conversionMode === 'toPhonetic') {
        result = toPhoneticSpelling(inputText, format);
      } else {
        // Auto-detect format and update UI
        const detectedFormat = detectPhoneticFormat(inputText);
        if (detectedFormat) {
          result = fromPhoneticSpelling(inputText, detectedFormat);
          // Update the format selection to match detected format
          if (detectedFormat !== format) {
            setPhoneticFormat(detectedFormat);
          }
        } else {
          result = fromPhoneticSpelling(inputText, format);
        }
      }
      
      setConvertedText(result);
    } catch (error) {
      console.error('Phonetic conversion error:', error);
      setConvertedText('');
    }
  }, []);

  useEffect(() => {
    handleConversion(text, mode, phoneticFormat);
  }, [text, mode, phoneticFormat, handleConversion]);

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

  const handleFormatChange = (newFormat: PhoneticFormat) => {
    setPhoneticFormat(newFormat);
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
      downloadTextAsFile(convertedText, tool('phoneticSpelling.downloadFileName'));
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
        title={tool('phoneticSpelling.title')}
        description={tool('phoneticSpelling.description')}
        inputLabel={mode === 'toPhonetic' ? common('labels.inputText') : tool('phoneticSpelling.phoneticInputLabel')}
        outputLabel={mode === 'toPhonetic' ? tool('phoneticSpelling.phoneticOutputLabel') : common('labels.outputText')}
        inputPlaceholder={mode === 'toPhonetic' 
          ? tool('phoneticSpelling.inputPlaceholder') 
          : tool('phoneticSpelling.phoneticInputPlaceholder')
        }
        copyText=""
        clearText=""
        downloadText=""
        uploadText=""
        uploadDescription=""
        downloadFileName={tool('phoneticSpelling.downloadFileName')}
        useMonoFont={phoneticFormat === 'ipa'}
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
                variant={mode === 'toPhonetic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('toPhonetic')}
                className="rounded-sm"
              >
                Text → Phonetic
              </Button>
              <Button
                variant={mode === 'fromPhonetic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('fromPhonetic')}
                className="rounded-sm"
              >
                Phonetic → Text
              </Button>
            </div>
          </div>
        </div>

        {/* Format Selector */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-sm font-medium text-muted-foreground">Phonetic Format:</span>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2">
                <Button
                  variant={phoneticFormat === 'simple' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFormatChange('simple')}
                  className="flex items-center gap-2"
                >
                  <Type className="h-4 w-4" />
                  Simple
                </Button>
                <Button
                  variant={phoneticFormat === 'ipa' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFormatChange('ipa')}
                  className="flex items-center gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  IPA
                </Button>
                <Button
                  variant={phoneticFormat === 'sound-based' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFormatChange('sound-based')}
                  className="flex items-center gap-2"
                >
                  <Type className="h-4 w-4" />
                  Sound-Based
                </Button>
                <Button
                  variant={phoneticFormat === 'nato' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFormatChange('nato')}
                  className="flex items-center gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  NATO
                </Button>
              </div>
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

        {/* Phonetic Spelling Analytics */}
        {(text || convertedText) && (
          <div className="mb-6">
            <PhoneticSpellingAnalytics 
              originalText={mode === 'toPhonetic' ? text : convertedText}
              phoneticText={mode === 'toPhonetic' ? convertedText : text}
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
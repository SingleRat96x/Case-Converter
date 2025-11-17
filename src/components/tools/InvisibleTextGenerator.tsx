'use client';

import React, { useState, useCallback, useRef } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { InvisibleTextAnalytics } from '@/components/shared/InvisibleTextAnalytics';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Copy, Check, Minus, Code2 } from 'lucide-react';
import { copyToClipboard, downloadTextAsFile, validateAndReadTextFile } from '@/lib/utils';

export function InvisibleTextGenerator() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [invisibleText, setInvisibleText] = useState('');
  const [method, setMethod] = useState<'zero-width' | 'unicode'>('zero-width');
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Zero-width characters
  const ZERO_WIDTH_SPACE = '\u200B';
  const ZERO_WIDTH_NON_JOINER = '\u200C';
  const ZERO_WIDTH_JOINER = '\u200D';

  // Generate invisible text
  const generateInvisibleText = useCallback((inputText: string, selectedMethod: string) => {
    if (!inputText) {
      setInvisibleText('');
      return;
    }

    let result = '';
    
    if (selectedMethod === 'zero-width') {
      // Insert zero-width characters between each character
      for (let i = 0; i < inputText.length; i++) {
        result += inputText[i];
        if (i < inputText.length - 1) {
          // Alternate between different zero-width characters for better compatibility
          const zeroChar = i % 3 === 0 ? ZERO_WIDTH_SPACE : 
                          i % 3 === 1 ? ZERO_WIDTH_NON_JOINER : 
                          ZERO_WIDTH_JOINER;
          result += zeroChar;
        }
      }
    } else {
      // Unicode method: Add invisible Unicode characters
      const invisibleChars = ['\u2061', '\u2062', '\u2063', '\u2064'];
      for (let i = 0; i < inputText.length; i++) {
        result += inputText[i];
        if (i < inputText.length - 1) {
          result += invisibleChars[i % invisibleChars.length];
        }
      }
    }
    
    setInvisibleText(result);
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);
    generateInvisibleText(newText, method);
  };

  const handleMethodChange = (newMethod: 'zero-width' | 'unicode') => {
    setMethod(newMethod);
    generateInvisibleText(text, newMethod);
  };

  const handleCopyInvisible = async () => {
    if (invisibleText) {
      try {
        await navigator.clipboard.writeText(invisibleText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Action button handlers
  const handleCopy = async (): Promise<boolean> => {
    return await copyToClipboard(invisibleText || text);
  };

  const handleClear = () => {
    setText('');
    setInvisibleText('');
  };

  const handleDownload = () => {
    downloadTextAsFile(invisibleText || text, 'invisible-text.txt');
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const validation = await validateAndReadTextFile(file);
      if (validation.isValid && validation.content) {
        setText(validation.content);
        generateInvisibleText(validation.content, method);
      }
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <BaseTextConverter
      title={tool('invisibleText.title')}
      description={tool('invisibleText.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('invisibleText.outputLabel')}
      inputPlaceholder={tool('invisibleText.inputPlaceholder')}
      copyText=""
      clearText=""
      downloadText=""
      uploadText=""
      uploadDescription=""
      downloadFileName="invisible-text.txt"
      onTextChange={handleTextChange}
      text={text}
      convertedText={invisibleText}
      onConvertedTextUpdate={setInvisibleText}
      showAnalytics={false}
    >
      <div className="space-y-4">
        {/* Method Selection */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            variant={method === 'zero-width' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleMethodChange('zero-width')}
            className="w-full sm:w-auto gap-2"
          >
            <Minus className="h-4 w-4" />
            {tool('invisibleText.methods.zeroWidth')}
          </Button>
          <Button
            variant={method === 'unicode' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleMethodChange('unicode')}
            className="w-full sm:w-auto gap-2"
          >
            <Code2 className="h-4 w-4" />
            {tool('invisibleText.methods.unicode')}
          </Button>
        </div>

        {/* Action Buttons */}
        <ActionButtons
          onCopy={handleCopy}
          onClear={handleClear}
          onDownload={handleDownload}
          onUpload={handleUpload}
          copyText={common('buttons.copy')}
          clearText={common('buttons.clear')}
          downloadText={common('buttons.download')}
          uploadText={common('buttons.upload')}
          isUploading={isUploading}
          hasContent={Boolean(text)}
          mobileLayout="2x2"
        />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.js,.ts,.jsx,.tsx,.json,.css,.html"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Analytics */}
        <InvisibleTextAnalytics 
          originalText={text}
          invisibleText={invisibleText}
          variant="compact"
          showTitle={false}
        />

      </div>
    </BaseTextConverter>
  );
}
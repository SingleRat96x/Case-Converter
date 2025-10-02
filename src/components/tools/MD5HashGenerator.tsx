'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { MD5HashDisplay, type MD5Format } from '@/components/shared/MD5HashDisplay';
import { MD5HashAnalytics } from '@/components/shared/MD5HashAnalytics';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { FeedbackMessage } from '@/components/shared/FeedbackMessage';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { generateMD5Hash } from '@/lib/md5Utils';
import { copyToClipboard, downloadTextAsFile } from '@/lib/utils';

export function MD5HashGenerator() {
  const { common, tool } = useToolTranslations('tools/miscellaneous');
  const [text, setText] = useState('');
  const [format, setFormat] = useState<MD5Format>('lowercase');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Generate MD5 hash
  const hash = useMemo(() => {
    if (!text.trim()) return '';
    return generateMD5Hash(text);
  }, [text]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    if (newText !== text) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 200);
    }
  }, [text]);

  const handleFileUploaded = useCallback(async (content: string) => {
    setText(content);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);
  }, []);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCopy = async () => {
    if (!hash.trim()) {
      return false;
    }
    const success = await copyToClipboard(hash);
    return success;
  };

  const handleClear = () => {
    setText('');
    return true;
  };

  const handleDownload = () => {
    if (!hash.trim()) {
      showFeedback('No hash to download', 'error');
      return false;
    }
    try {
      const report = `MD5 Hash Report
Generated: ${new Date().toLocaleString()}

Original Text:
${text}

MD5 Hash (Lowercase): ${hash}
MD5 Hash (Uppercase): ${hash.toUpperCase()}
MD5 Hash (Colon-separated): ${hash.match(/.{2}/g)?.join(':') || hash}

Hash Length: ${hash.length} characters
Input Length: ${text.length} characters
Encoding: UTF-8`;

      downloadTextAsFile(report, tool('md5Hash.downloadFileName', 'md5-hash-report.txt'));
      showFeedback('Report downloaded successfully!');
      return true;
    } catch {
      showFeedback('Failed to download report', 'error');
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
            handleFileUploaded(content);
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
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {tool('md5Hash.title', 'MD5 Hash Generator')}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {tool('md5Hash.description', 'Generate MD5 hash checksums for text and files instantly. Professional MD5 hash calculator with multiple output formats and real-time hash generation.')}
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="md5-input" className="text-base font-medium">
            {tool('md5Hash.inputLabel', 'Text to Hash')}
          </Label>
          <textarea
            id="md5-input"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={tool('md5Hash.inputPlaceholder', 'Enter text to generate MD5 hash...')}
            className="w-full min-h-[120px] p-4 border-2 border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-y"
          />
        </div>

        {/* Format Selection Toggle */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="inline-flex rounded-md border border-border bg-card p-1">
              <Button
                variant={format === 'lowercase' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFormat('lowercase')}
                className="rounded-sm"
              >
                {tool('md5Hash.formats.standard', 'Standard')}
              </Button>
              <Button
                variant={format === 'uppercase' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFormat('uppercase')}
                className="rounded-sm"
              >
                {tool('md5Hash.formats.uppercase', 'Uppercase')}
              </Button>
              <Button
                variant={format === 'colonSeparated' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFormat('colonSeparated')}
                className="rounded-sm"
              >
                {tool('md5Hash.formats.colonSeparated', 'Colon-separated')}
              </Button>
            </div>
          </div>
        </div>

        {/* Hash Output Display */}
        <MD5HashDisplay
          hash={hash}
          format={format}
          isAnimating={isAnimating}
        />

        {/* Action Buttons */}
        <div className="flex justify-center">
          <ActionButtons
            onCopy={handleCopy}
            onClear={handleClear}
            onDownload={handleDownload}
            onUpload={handleUpload}
            copyText={common('buttons.copy', 'Copy')}
            clearText={common('buttons.clear', 'Clear')}
            downloadText={common('buttons.download', 'Download')}
            uploadText={common('buttons.upload', 'Upload File')}
            hasContent={!!(text || hash)}
            showUpload={true}
            mobileLayout="2x2"
          />
        </div>

        {/* Analytics Section */}
        {(text || hash) && (
          <div className="mt-8">
            <MD5HashAnalytics 
              text={text} 
              variant="compact"
              showTitle={true}
            />
          </div>
        )}
      </div>

      {/* Feedback Message */}
      <FeedbackMessage feedback={feedback} />
    </div>
  );
}
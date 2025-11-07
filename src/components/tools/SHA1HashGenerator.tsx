'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { SHA1HashDisplay, type SHA1Format } from '@/components/shared/SHA1HashDisplay';
import { SHA1HashAnalytics } from '@/components/shared/SHA1HashAnalytics';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { FeedbackMessage } from '@/components/shared/FeedbackMessage';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { generateSHA1Hash } from '@/lib/sha1Utils';
import { copyToClipboard, downloadTextAsFile } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

export function SHA1HashGenerator() {
  const { common, tool } = useToolTranslations('tools/miscellaneous');
  const [text, setText] = useState('');
  const [format, setFormat] = useState<SHA1Format>('lowercase');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Generate SHA-1 hash
  const hash = useMemo(() => {
    if (!text.trim()) return '';
    return generateSHA1Hash(text);
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
      const report = `SHA-1 Hash Report
Generated: ${new Date().toLocaleString()}

Original Text:
${text}

SHA-1 Hash (Lowercase): ${hash}
SHA-1 Hash (Uppercase): ${hash.toUpperCase()}
SHA-1 Hash (Colon-separated): ${hash.match(/.{2}/g)?.join(':') || hash}

Hash Length: ${hash.length} characters
Input Length: ${text.length} characters
Encoding: UTF-8

Security Notice:
SHA-1 is no longer recommended for cryptographic security.
For secure applications, use SHA-256 or SHA-512 instead.`;

      downloadTextAsFile(report, tool('sha1Hash.downloadFileName', 'sha1-hash-report.txt'));
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
          {tool('sha1Hash.title', 'SHA-1 Hash Generator')}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {tool('sha1Hash.description', 'Generate SHA-1 hash checksums for text and files instantly. 40-character hexadecimal hash output with multiple formats and real-time generation.')}
        </p>
      </div>

      {/* Security Warning */}
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{tool('sha1Hash.securityWarning.title', 'Security Notice')}</AlertTitle>
        <AlertDescription>
          {tool('sha1Hash.securityWarning.message', 'SHA-1 is no longer recommended for modern cryptographic security. For secure applications, use SHA-256 or SHA-512 instead.')}
        </AlertDescription>
      </Alert>

      {/* Input Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="sha1-input" className="text-base font-medium">
            {tool('sha1Hash.inputLabel', 'Text to Hash')}
          </Label>
          <textarea
            id="sha1-input"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={tool('sha1Hash.inputPlaceholder', 'Enter text to generate SHA-1 hash...')}
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
                {tool('sha1Hash.formats.standard', 'Standard')}
              </Button>
              <Button
                variant={format === 'uppercase' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFormat('uppercase')}
                className="rounded-sm"
              >
                {tool('sha1Hash.formats.uppercase', 'Uppercase')}
              </Button>
              <Button
                variant={format === 'colonSeparated' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFormat('colonSeparated')}
                className="rounded-sm"
              >
                {tool('sha1Hash.formats.colonSeparated', 'Colon-separated')}
              </Button>
            </div>
          </div>
        </div>

        {/* Hash Output Display */}
        <SHA1HashDisplay
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
            <SHA1HashAnalytics 
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

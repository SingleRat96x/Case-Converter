'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { themeClasses, cn } from '@/lib/theme-config';
import { CaseConverterButtons } from '@/components/shared/CaseConverterButtons';
import { TextStats } from '@/components/shared/types';
import AdScript from '@/components/ads/AdScript';

interface TextTransformationProps {
  transformer: (text: string) => string;
  toolConfig: {
    name: string;
    icon?: LucideIcon;
    placeholder?: string;
    downloadFileName: string;
  };
  layout?: 'single' | 'dual';
  showLivePreview?: boolean;
  textareaSize?: keyof typeof themeClasses.textarea.sizes;
}

export function TextTransformation({
  transformer,
  toolConfig,
  layout = 'single',
  showLivePreview = true,
  textareaSize = 'md'
}: TextTransformationProps) {
  const [inputText, setInputText] = useState('');
  const [transformedText, setTransformedText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    paragraphs: 0,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateStats = (text: string) => {
    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
      paragraphs: text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(para => para.trim() !== '').length || 1,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
    
    if (showLivePreview) {
      const transformed = transformer(newText);
      setTransformedText(transformed);
    }
  };

  const handleTransform = () => {
    const result = transformer(inputText);
    if (layout === 'single') {
      setInputText(result);
      setTransformedText(result);
    } else {
      setTransformedText(result);
    }
  };

  const handleDownload = () => {
    const textToDownload = layout === 'single' ? inputText : transformedText;
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = toolConfig.downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      const textToCopy = layout === 'single' ? inputText : transformedText;
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTransformedText('');
    updateStats('');
    textareaRef.current?.focus();
  };

  const Icon = toolConfig.icon;

  if (layout === 'dual') {
    return (
      <>
        <div className={cn(themeClasses.grid.base, themeClasses.grid.gaps.md, themeClasses.grid.cols[2])}>
          {/* Input */}
          <div className={themeClasses.section.spacing.sm}>
            <label className={themeClasses.label}>Input Text</label>
            <textarea
              ref={textareaRef}
              className={cn(
                themeClasses.textarea.base,
                themeClasses.textarea.focus,
                themeClasses.textarea.sizes[textareaSize]
              )}
              placeholder={toolConfig.placeholder || "Type or paste your text here..."}
              value={inputText}
              onChange={handleInputChange}
              aria-label="Text input"
            />
          </div>

          {/* Output */}
          <div className={themeClasses.section.spacing.sm}>
            <label className={themeClasses.label}>{toolConfig.name} Result</label>
            <textarea
              className={cn(
                themeClasses.textarea.base,
                themeClasses.textarea.sizes[textareaSize],
                'bg-muted cursor-default'
              )}
              readOnly
              value={transformedText}
              aria-label="Transformed text output"
            />
          </div>
        </div>

        <AdScript />

        <CaseConverterButtons
          onDownload={handleDownload}
          onCopy={handleCopy}
          onClear={handleClear}
          stats={stats}
          inputText={inputText}
        />
      </>
    );
  }

  // Single layout
  return (
    <>
      <div className="relative">
        <textarea
          ref={textareaRef}
          className={cn(
            themeClasses.textarea.base,
            themeClasses.textarea.focus,
            themeClasses.textarea.sizes[textareaSize]
          )}
          placeholder={toolConfig.placeholder || "Type or paste your text here..."}
          value={inputText}
          onChange={handleInputChange}
          aria-label="Text input for transformation"
        />
      </div>

      {/* Transform Button */}
      <div className="flex justify-center">
        <button
          onClick={handleTransform}
          className={cn(
            themeClasses.button.base,
            themeClasses.button.sizes.md,
            themeClasses.button.variants.primary,
            'min-w-[200px]'
          )}
          aria-label={`Transform text to ${toolConfig.name}`}
        >
          {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
          <span>Convert to {toolConfig.name}</span>
        </button>
      </div>

      <AdScript />

      <CaseConverterButtons
        onDownload={handleDownload}
        onCopy={handleCopy}
        onClear={handleClear}
        stats={stats}
        inputText={inputText}
      />
    </>
  );
}
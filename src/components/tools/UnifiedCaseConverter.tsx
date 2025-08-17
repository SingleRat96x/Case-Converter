'use client';

import { useState, useEffect, useRef } from 'react';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { UnifiedStats } from '@/components/shared/UnifiedStats';
import { themeClasses, cn } from '@/lib/theme-config';
import AdScript from '@/components/ads/AdScript';
import { 
  Type, 
  ArrowDownAZ, 
  AlignLeft, 
  Heading, 
  Shuffle 
} from 'lucide-react';
import { CaseType, caseConversions, getCaseLabel, getDownloadFilename } from '@/utils/caseConversions';
import { TextStats } from '@/components/shared/types';

interface UnifiedCaseConverterProps {
  caseType: CaseType;
}

const caseIcons: Record<CaseType, any> = {
  upper: Type,
  lower: ArrowDownAZ,
  sentence: AlignLeft,
  title: Heading,
  alternate: Shuffle
};

export function UnifiedCaseConverter({ caseType }: UnifiedCaseConverterProps) {
  const [inputText, setInputText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    paragraphs: 0,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
    // Auto-convert on input
    const converted = caseConversions[caseType](newText);
    setConvertedText(converted);
  };

  const updateStats = (text: string) => {
    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
      paragraphs: text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(para => para.trim() !== '').length || 1,
    });
  };

  const handleConvert = () => {
    const result = caseConversions[caseType](inputText);
    setInputText(result);
    setConvertedText(result);
  };

  const handleDownload = () => {
    const blob = new Blob([convertedText || inputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getDownloadFilename(caseType);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(convertedText || inputText);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setConvertedText('');
    updateStats('');
    textareaRef.current?.focus();
  };

  const Icon = caseIcons[caseType];
  const label = getCaseLabel(caseType);

  return (
    <div className={cn(themeClasses.container.lg, themeClasses.section.spacing.lg)}>
      {/* Input Section */}
      <div className={themeClasses.section.spacing.sm}>
        <textarea
          ref={textareaRef}
          className={cn(
            themeClasses.textarea.base,
            themeClasses.textarea.focus,
            themeClasses.textarea.sizes.lg
          )}
          placeholder="Type or paste your text here..."
          value={inputText}
          onChange={handleInputChange}
          aria-label="Text input for case conversion"
        />
      </div>

      {/* Primary Conversion CTA */}
      <div className={themeClasses.section.spacing.sm}>
        <button
          onClick={handleConvert}
          className={cn(
            themeClasses.button.base,
            themeClasses.button.sizes.lg,
            themeClasses.button.variants.primary,
            'w-full max-w-md mx-auto'
          )}
          aria-label={`Convert text to ${label}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          <span>Convert to {label}</span>
        </button>
      </div>

      <AdScript />

      {/* Action Buttons */}
      <div className={themeClasses.section.spacing.md}>
        <ActionButtons
          onDownload={handleDownload}
          onCopy={handleCopy}
          onClear={handleClear}
        />
      </div>

      {/* Stats Display */}
      <UnifiedStats
        stats={stats}
        variant="cards"
      />
    </div>
  );
}
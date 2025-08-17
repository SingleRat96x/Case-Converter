'use client';

import { useState, useEffect, useRef } from 'react';
import { CaseConverterButtons } from '@/components/shared/CaseConverterButtons';
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
    <div className="space-y-6">
      {/* Textarea with enhanced focus states */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full min-h-[200px] p-4 rounded-lg border-2 border-border bg-background text-foreground resize-y transition-all duration-200 placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 focus:shadow-sm"
          placeholder="Type or paste your text here..."
          value={inputText}
          onChange={handleInputChange}
          aria-label="Text input for case conversion"
        />
      </div>

      {/* Single Conversion Button */}
      <div className="flex justify-center">
        <button
          onClick={handleConvert}
          className="flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
          aria-label={`Convert text to ${label}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
          <span>Convert to {label}</span>
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
    </div>
  );
}
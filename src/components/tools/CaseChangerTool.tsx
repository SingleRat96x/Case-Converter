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
import { TextStats } from '@/components/shared/types';

type CaseType = 'upper' | 'lower' | 'title' | 'sentence' | 'alternate';

const caseButtons = [
  { type: 'upper' as CaseType, label: 'UPPERCASE', icon: Type },
  { type: 'lower' as CaseType, label: 'lowercase', icon: ArrowDownAZ },
  { type: 'sentence' as CaseType, label: 'Sentence case', icon: AlignLeft },
  { type: 'title' as CaseType, label: 'Title Case', icon: Heading },
  { type: 'alternate' as CaseType, label: 'aLtErNaTiNg cAsE', icon: Shuffle }
];

export function CaseChangerTool() {
  const [inputText, setInputText] = useState('');
  const [lastUsedCase, setLastUsedCase] = useState<CaseType | null>(null);
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    paragraphs: 0,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load last used case from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lastUsedCase');
    if (saved) {
      setLastUsedCase(saved as CaseType);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
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

  const transformText = (type: CaseType) => {
    let result = inputText;
    switch (type) {
      case 'upper':
        result = inputText.toUpperCase();
        break;
      case 'lower':
        result = inputText.toLowerCase();
        break;
      case 'title':
        result = inputText.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        break;
      case 'sentence':
        result = inputText.toLowerCase().replace(/(^\w|\.\s+\w)/g, c => c.toUpperCase());
        break;
      case 'alternate':
        result = inputText.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join('');
        break;
    }
    setInputText(result);
    setLastUsedCase(type);
    localStorage.setItem('lastUsedCase', type);
  };

  // Handle Enter key to trigger last used conversion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey && lastUsedCase) {
      e.preventDefault();
      transformText(lastUsedCase);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([inputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inputText);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    updateStats('');
    textareaRef.current?.focus();
  };

  return (
    <div className={cn(themeClasses.container.lg, themeClasses.section.spacing.lg)}>
      {/* Input Section */}
      <div className={cn(themeClasses.section.spacing.sm, 'relative')}>
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
          onKeyDown={handleKeyDown}
          aria-label="Text input for case conversion"
        />
        {lastUsedCase && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">Enter</kbd> to repeat
          </div>
        )}
      </div>

      {/* Case Conversion Buttons - Primary CTAs */}
      <div className={cn(themeClasses.section.spacing.sm, 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3')}>
        {caseButtons.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => transformText(type)}
            className={cn(
              themeClasses.button.base,
              themeClasses.button.sizes.md,
              lastUsedCase === type 
                ? themeClasses.button.variants.primary
                : themeClasses.button.variants.secondary,
              type === 'alternate' ? 'col-span-2 sm:col-span-3 lg:col-span-1' : ''
            )}
            aria-label={`Convert text to ${label}`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <AdScript />

      {/* Action Buttons */}
      <div className={cn(themeClasses.section.spacing.md, themeClasses.section.gaps.lg)}>
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
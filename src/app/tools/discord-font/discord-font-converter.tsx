'use client';

import { useState } from 'react';
import { Copy, Download, RotateCw } from 'lucide-react';
import { TextStats } from '@/components/shared/types';
import { TextToolLayout } from '@/components/tools/TextToolLayout';
import { UnifiedStats } from '@/components/shared/UnifiedStats';
import AdScript from '@/components/ads/AdScript';
import { themeClasses, cn } from '@/lib/theme-config';

const discordFontMap: { [key: string]: string } = {
  'a': '𝖺', 'b': '𝖻', 'c': '𝖼', 'd': '𝖽', 'e': '𝖾', 'f': '𝖿', 'g': '𝗀', 'h': '𝗁', 'i': '𝗂',
  'j': '𝗃', 'k': '𝗄', 'l': '𝗅', 'm': '𝗆', 'n': '𝗇', 'o': '𝗈', 'p': '𝗉', 'q': '𝗊', 'r': '𝗋',
  's': '𝗌', 't': '𝗍', 'u': '𝗎', 'v': '𝗏', 'w': '𝗐', 'x': '𝗑', 'y': '𝗒', 'z': '𝗓',
  'A': '𝖠', 'B': '𝖡', 'C': '𝖢', 'D': '𝖣', 'E': '𝖤', 'F': '𝖥', 'G': '𝖦', 'H': '𝖧', 'I': '𝖨',
  'J': '𝖩', 'K': '𝖪', 'L': '𝖫', 'M': '𝖬', 'N': '𝖭', 'O': '𝖮', 'P': '𝖯', 'Q': '𝖰', 'R': '𝖱',
  'S': '𝖲', 'T': '𝖳', 'U': '𝖴', 'V': '𝖵', 'W': '𝖶', 'X': '𝖷', 'Y': '𝖸', 'Z': '𝖹'
};

export function DiscordFontConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    paragraphs: 0,
  });
  const [copied, setCopied] = useState(false);

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
    setCopied(false);
  };

  const convertToDiscordFont = (text: string) => {
    return text.split('').map(char => discordFontMap[char] || char).join('');
  };

  const handleDownload = () => {
    const blob = new Blob([convertToDiscordFont(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'discord-font-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(convertToDiscordFont(inputText));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    updateStats('');
  };

  return (
    <div className={cn(themeClasses.container.lg, themeClasses.section.spacing.lg)}>
      <div className={cn(themeClasses.grid.base, themeClasses.grid.gaps.md, 'md:grid-cols-2')}>
        {/* Input */}
        <div className={themeClasses.section.spacing.sm}>
          <label className={themeClasses.label}>Input Text</label>
          <textarea
            className={cn(
              themeClasses.textarea.base,
              themeClasses.textarea.focus,
              themeClasses.textarea.sizes.xl
            )}
            placeholder="Type or paste your text here..."
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        {/* Output */}
        <div className={themeClasses.section.spacing.sm}>
          <label className={themeClasses.label}>Discord Font Result</label>
          <textarea
            className={cn(
              themeClasses.textarea.base,
              themeClasses.textarea.sizes.xl,
              'bg-muted cursor-default'
            )}
            readOnly
            value={convertToDiscordFont(inputText)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          disabled={!inputText}
          className={cn(
            themeClasses.button.base,
            themeClasses.button.sizes.md,
            themeClasses.button.variants.primary
          )}
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
        <button
          onClick={handleCopy}
          disabled={!inputText}
          className={cn(
            themeClasses.button.base,
            themeClasses.button.sizes.md,
            themeClasses.button.variants.secondary
          )}
        >
          <Copy className="h-4 w-4" />
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
        <button
          onClick={handleClear}
          disabled={!inputText}
          className={cn(
            themeClasses.button.base,
            themeClasses.button.sizes.md,
            themeClasses.button.variants.ghost
          )}
        >
          <RotateCw className="h-4 w-4" />
          <span>Clear</span>
        </button>
      </div>

      {/* Stats */}
      <UnifiedStats
        stats={stats}
        variant="inline"
      />

      <AdScript />
    </div>
  );
} 
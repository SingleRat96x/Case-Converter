'use client';

import React, { useState } from 'react';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { UnifiedStats } from '@/components/shared/UnifiedStats';
import { themeClasses, cn } from '@/lib/theme-config';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  uniqueWords: number;
  readingTime: number;
}

export function TextCounter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    uniqueWords: 0,
    readingTime: 0,
  });

  const updateStats = (text: string) => {
    const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
    const uniqueWords = new Set(words.map(word => word.toLowerCase()));
    const avgWordsPerMinute = 200;

    setStats({
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: words.length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      paragraphs: text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
      uniqueWords: uniqueWords.size,
      readingTime: Math.ceil(words.length / avgWordsPerMinute),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
  };

  const handleDownload = () => {
    const blob = new Blob([inputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-analysis.txt';
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
  };

  // Convert stats to match UnifiedStats interface
  const unifiedStats = {
    characters: stats.characters,
    charactersNoSpaces: stats.charactersNoSpaces,
    words: stats.words,
    uniqueWords: stats.uniqueWords,
    sentences: stats.sentences,
    paragraphs: stats.paragraphs,
    lines: stats.lines,
    readingTime: stats.readingTime,
  };

  return (
    <div className={cn(themeClasses.container.lg, themeClasses.section.spacing.lg)}>
      {/* Input Section */}
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
          aria-label="Text input for analysis"
        />
      </div>

      {/* Action Buttons */}
      <div className={themeClasses.section.spacing.md}>
        <ActionButtons
          onDownload={handleDownload}
          onCopy={handleCopy}
          onClear={handleClear}
          disabled={!inputText}
        />
      </div>

      {/* Stats Display */}
      <UnifiedStats
        stats={unifiedStats}
        variant="cards"
        showFields={['characters', 'charactersNoSpaces', 'words', 'uniqueWords', 'sentences', 'paragraphs', 'lines', 'readingTime']}
      />
    </div>
  );
}
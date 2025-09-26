'use client';

import { useState } from 'react';
import AdScript from '@/components/ads/AdScript';
import { TextInput } from '@/app/components/shared/ToolInputs';
import { ActionButtonGroup } from '@/app/components/shared/ToolActions';
import { TextAnalytics, generateTextStats, type TextStats } from '@/app/components/shared/TextAnalytics';

const italicTextMap: { [key: string]: string } = {
  'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨', 'h': '𝘩', 'i': '𝘪',
  'j': '𝘫', 'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳',
  's': '𝘴', 't': '𝘵', 'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹', 'y': '𝘺', 'z': '𝘻',
  'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍', 'G': '𝘎', 'H': '𝘏', 'I': '𝘐',
  'J': '𝘑', 'K': '𝘒', 'L': '𝘓', 'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗', 'Q': '𝘘', 'R': '𝘙',
  'S': '𝘚', 'T': '𝘛', 'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟', 'Y': '𝘠', 'Z': '𝘡'
};

export function ItalicTextConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>(generateTextStats(''));

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    setStats(generateTextStats(newText));
  };

  const convertToItalicText = (text: string) => text.split('').map(char => italicTextMap[char] || char).join('');

  const handleDownload = () => {
    const blob = new Blob([convertToItalicText(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'italic-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(convertToItalicText(inputText));
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setStats(generateTextStats(''));
  };

  const outputText = convertToItalicText(inputText);

  return (
    <div className="max-w-[900px] mx-auto space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <TextInput
          title="Input Text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type or paste your text here..."
          minHeight="lg"
          fontFamily="sans"
          variant="default"
        />

        <TextInput
          title="Italic Text Result"
          value={outputText}
          readOnly
          minHeight="lg"
          fontFamily="mono"
          variant="glass"
        />
      </div>

      <AdScript />

      <ActionButtonGroup
        onDownload={handleDownload}
        onCopy={handleCopy}
        onClear={handleClear}
        copyLabel="Copy to Clipboard"
        className="justify-center"
      />

      <div className="max-w-4xl mx-auto">
        <TextAnalytics
          stats={stats}
          mode="grid"
          showStats={['characters', 'words', 'sentences', 'lines']}
        />
      </div>
    </div>
  );
} 
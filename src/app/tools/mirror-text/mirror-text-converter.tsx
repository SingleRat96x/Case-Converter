'use client';

import { useState } from 'react';
import AdScript from '@/components/ads/AdScript';
import { TextInput } from '@/app/components/shared/ToolInputs';
import { ActionButtonGroup } from '@/app/components/shared/ToolActions';
import { TextAnalytics, generateTextStats, type TextStats } from '@/app/components/shared/TextAnalytics';

const mirrorTextMap: { [key: string]: string } = {
  'a': 'ɒ', 'b': 'd', 'c': 'ɔ', 'd': 'b', 'e': 'ɘ', 'f': 'Ꮈ', 'g': 'ǫ', 'h': 'ʜ', 'i': 'i',
  'j': 'į', 'k': 'ʞ', 'l': '|', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'q', 'q': 'p', 'r': 'ɿ',
  's': 'ƨ', 't': 'ƚ', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x', 'y': 'y', 'z': 'z',
  'A': 'A', 'B': 'ᙠ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'ꟻ', 'G': 'Ꭾ', 'H': 'H', 'I': 'I',
  'J': 'Ⴑ', 'K': 'ꓘ', 'L': '⅃', 'M': 'M', 'N': 'И', 'O': 'O', 'P': 'ꟼ', 'Q': 'Ọ', 'R': 'Я',
  'S': 'Ƨ', 'T': 'T', 'U': 'U', 'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z',
  '1': '1', '2': '2', '3': 'Ɛ', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<',
  '?': '⸮', '!': '¡', '.': '.', ',': ',', ';': ';', ':': ':', '"': '"', "'": "'", '`': '`',
  '\\': '/', '/': '\\', '|': '|', '_': '_', '+': '+', '-': '-', '=': '=', '*': '*', '&': '⅋',
  '%': '%', '$': '$', '#': '#', '@': '@', '^': '^', '~': '~'
};

export function MirrorTextConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>(generateTextStats(''));

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    setStats(generateTextStats(newText));
  };

  const convertToMirrorText = (text: string) => text.split('').map(char => mirrorTextMap[char] || char).reverse().join('');

  const handleDownload = () => {
    const blob = new Blob([convertToMirrorText(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mirror-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertToMirrorText(inputText));
  };

  const handleClear = () => {
    setInputText('');
    setStats(generateTextStats(''));
  };

  const outputText = convertToMirrorText(inputText);

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
          title="Mirror Text Result"
          value={outputText}
          readOnly
          minHeight="lg"
          fontFamily="mono"
          variant="glass"
        />
      </div>

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

      <AdScript />
    </div>
  );
} 
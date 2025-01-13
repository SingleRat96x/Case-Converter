'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
}

const bigTextMap: { [key: string]: string } = {
  'a': '𝗔', 'b': '𝗕', 'c': '𝗖', 'd': '𝗗', 'e': '𝗘', 'f': '𝗙', 'g': '𝗚', 'h': '𝗛', 'i': '𝗜',
  'j': '𝗝', 'k': '𝗞', 'l': '𝗟', 'm': '𝗠', 'n': '𝗡', 'o': '𝗢', 'p': '𝗣', 'q': '𝗤', 'r': '𝗥',
  's': '𝗦', 't': '𝗧', 'u': '𝗨', 'v': '𝗩', 'w': '𝗪', 'x': '𝗫', 'y': '𝗬', 'z': '𝗭',
  'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜',
  'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥',
  'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
};

export function BigTextConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
  });

  const updateStats = (text: string) => {
    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
  };

  const convertToBigText = (text: string) => {
    return text.split('').map(char => bigTextMap[char] || char).join('');
  };

  const handleDownload = () => {
    const blob = new Blob([convertToBigText(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'big-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertToBigText(inputText));
  };

  const handleClear = () => {
    setInputText('');
    updateStats('');
  };

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Input Text</label>
          <textarea
            className="w-full min-h-[200px] sm:min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Type or paste your text here..."
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Big Text Result</label>
          <textarea
            className="w-full min-h-[200px] sm:min-h-[300px] p-4 rounded-lg border bg-card resize-y"
            readOnly
            value={convertToBigText(inputText)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 sm:flex-none px-4 py-2 bg-card hover:bg-accent rounded-lg transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium min-w-[120px]"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download Text</span>
          <span className="sm:hidden">Download</span>
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 sm:flex-none px-4 py-2 bg-card hover:bg-accent rounded-lg transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium min-w-[120px]"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">Copy to Clipboard</span>
          <span className="sm:hidden">Copy</span>
        </button>
        <button
          onClick={handleClear}
          className="flex-1 sm:flex-none px-4 py-2 bg-card hover:bg-accent rounded-lg transition-colors inline-flex items-center justify-center gap-2 text-sm font-medium min-w-[120px]"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Clear Text</span>
          <span className="sm:hidden">Clear</span>
        </button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground border-t border-border pt-4">
        <span className="whitespace-nowrap">Characters: {stats.characters}</span>
        <span className="hidden sm:inline text-border">|</span>
        <span className="whitespace-nowrap">Words: {stats.words}</span>
        <span className="hidden sm:inline text-border">|</span>
        <span className="whitespace-nowrap">Sentences: {stats.sentences}</span>
        <span className="hidden sm:inline text-border">|</span>
        <span className="whitespace-nowrap">Lines: {stats.lines}</span>
      </div>
    </div>
  );
} 
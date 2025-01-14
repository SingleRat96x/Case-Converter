'use client';

import { useState } from 'react';
import { Download, Copy, RefreshCw } from 'lucide-react';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
}

export function CaseChangerTool() {
  const [inputText, setText] = useState('');
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
    setText(newText);
    updateStats(newText);
  };

  const transformText = (type: 'upper' | 'lower' | 'sentence' | 'title' | 'alternate') => {
    let transformedText = inputText;
    switch (type) {
      case 'upper':
        transformedText = inputText.toUpperCase();
        break;
      case 'lower':
        transformedText = inputText.toLowerCase();
        break;
      case 'sentence':
        transformedText = inputText.toLowerCase().replace(/(^\w|\.\s+\w)/g, letter => letter.toUpperCase());
        break;
      case 'title':
        transformedText = inputText.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
        break;
      case 'alternate':
        transformedText = inputText.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join('');
        break;
    }
    setText(transformedText);
  };

  const downloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([inputText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'converted-text.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inputText);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <textarea
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter your text here..."
          className="w-full min-h-[200px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => transformText('upper')}
          className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          UPPERCASE
        </button>
        <button
          onClick={() => transformText('lower')}
          className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          lowercase
        </button>
        <button
          onClick={() => transformText('sentence')}
          className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          Sentence case
        </button>
        <button
          onClick={() => transformText('title')}
          className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          Title Case
        </button>
        <button
          onClick={() => transformText('alternate')}
          className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          aLtErNaTiNg cAsE
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={downloadText}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
        <button
          onClick={() => setText('')}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
        <div className="p-4 rounded-lg bg-muted">
          <div className="text-2xl font-bold">{stats.characters}</div>
          <div className="text-sm text-muted-foreground">Characters</div>
        </div>
        <div className="p-4 rounded-lg bg-muted">
          <div className="text-2xl font-bold">{stats.words}</div>
          <div className="text-sm text-muted-foreground">Words</div>
        </div>
        <div className="p-4 rounded-lg bg-muted">
          <div className="text-2xl font-bold">{stats.sentences}</div>
          <div className="text-sm text-muted-foreground">Sentences</div>
        </div>
        <div className="p-4 rounded-lg bg-muted">
          <div className="text-2xl font-bold">{stats.lines}</div>
          <div className="text-sm text-muted-foreground">Lines</div>
        </div>
      </div>
    </div>
  );
} 
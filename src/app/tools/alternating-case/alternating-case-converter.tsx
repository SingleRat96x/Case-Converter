'use client';

import { useState, useEffect } from 'react';
import { Download, Copy, Trash2 } from 'lucide-react';

export function AlternatingCaseConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState({ chars: 0, words: 0, sentences: 0, lines: 0 });

  useEffect(() => {
    convertToAlternatingCase(input);
  }, [input]);

  const convertToAlternatingCase = (text: string) => {
    const alternatingCase = text
      .split('')
      .map((char, index) => index % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
      .join('');
    setOutput(alternatingCase);
    updateStats(text);
  };

  const updateStats = (text: string) => {
    setStats({
      chars: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split(/\r\n|\r|\n/).length
    });
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alternating-case.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStats({ chars: 0, words: 0, sentences: 0, lines: 0 });
  };

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Input Text
          </label>
          <textarea
            className="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Type or paste your text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            aLtErNaTiNg cAsE Result
          </label>
          <textarea
            className="min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={output}
            readOnly
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Text
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy to Clipboard
        </button>
        <button
          onClick={handleClear}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>Character Count: {stats.chars}</span>
        <span>Word Count: {stats.words}</span>
        <span>Sentence Count: {stats.sentences}</span>
        <span>Line Count: {stats.lines}</span>
      </div>
    </div>
  );
} 
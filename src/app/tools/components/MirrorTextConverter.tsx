'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';
import { TextAnalytics, useTextStats, type TextStats } from '@/app/components/shared/TextAnalytics';
import { TextInput } from '@/app/components/shared/ToolInputs';
import { ToolLayout, ActionSection, SingleColumnLayout } from '@/lib/shared/ToolLayout';

const mirrorTextMap: { [key: string]: string } = {
  a: 'ɒ',
  b: 'd',
  c: 'ɔ',
  d: 'b',
  e: 'ɘ',
  f: 'Ꮈ',
  g: 'ǫ',
  h: 'ʜ',
  i: 'i',
  j: 'į',
  k: 'ʞ',
  l: '|',
  m: 'm',
  n: 'n',
  o: 'o',
  p: 'q',
  q: 'p',
  r: 'ɿ',
  s: 'ƨ',
  t: 'ƚ',
  u: 'u',
  v: 'v',
  w: 'w',
  x: 'x',
  y: 'y',
  z: 'z',
  A: 'A',
  B: 'ᙠ',
  C: 'Ɔ',
  D: 'ᗡ',
  E: 'Ǝ',
  F: 'ꟻ',
  G: 'Ꭾ',
  H: 'H',
  I: 'I',
  J: 'Ⴑ',
  K: 'ꓘ',
  L: '⅃',
  M: 'M',
  N: 'И',
  O: 'O',
  P: 'ꟼ',
  Q: 'Ọ',
  R: 'Я',
  S: 'Ƨ',
  T: 'T',
  U: 'U',
  V: 'V',
  W: 'W',
  X: 'X',
  Y: 'Y',
  Z: 'Z',
  '1': '1',
  '2': '2',
  '3': 'Ɛ',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '0': '0',
  '(': ')',
  ')': '(',
  '[': ']',
  ']': '[',
  '{': '}',
  '}': '{',
  '<': '>',
  '>': '<',
  '?': '⸮',
  '!': '¡',
  '.': '.',
  ',': ',',
  ';': ';',
  ':': ':',
  '"': '"',
  "'": "'",
  '`': '`',
  '\\': '/',
  '/': '\\',
  '|': '|',
  _: '_',
  '+': '+',
  '-': '-',
  '=': '=',
  '*': '*',
  '&': '⅋',
  '%': '%',
  $: '$',
  '#': '#',
  '@': '@',
  '^': '^',
  '~': '~',
};

export default function MirrorTextConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({});
  const { calculateStats } = useTextStats();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    setStats(calculateStats(newText));
  };

  const convertToMirrorText = (text: string) => {
    // Convert each character to its mirror equivalent and reverse the string
    return text
      .split('')
      .map(char => mirrorTextMap[char] || char)
      .reverse()
      .join('');
  };

  const handleDownload = () => {
    const blob = new Blob([convertToMirrorText(inputText)], {
      type: 'text/plain',
    });
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
    setStats({});
  };

  return (
    <ToolLayout>
      <div className="grid gap-6 md:grid-cols-2">
        <TextInput
          title="Input Text"
            value={inputText}
            onChange={handleInputChange}
          placeholder="Type or paste your text here..."
          variant="gradient"
          minHeight="md"
        />

        <TextInput
          title="Mirror Text Result"
            value={convertToMirrorText(inputText)}
          readOnly={true}
          variant="glass"
          minHeight="md"
          />
      </div>

      <ActionSection>
        <button
          onClick={handleDownload}
          className="px-6 py-2.5 tool-button-primary inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Text
        </button>
        <button
          onClick={handleCopy}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2 tool-interactive"
        >
          <Copy className="h-4 w-4" />
          Copy to Clipboard
        </button>
        <button
          onClick={handleClear}
          className="px-6 py-2.5 tool-button-secondary inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </ActionSection>

      {/* Stats */}
      <TextAnalytics 
        stats={stats} 
        mode="inline"
        showStats={['characters', 'words', 'sentences', 'lines']}
      />
    </ToolLayout>
  );
}

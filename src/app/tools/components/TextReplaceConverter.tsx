'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Plus, Trash2 } from 'lucide-react';

interface Replacement {
  find: string;
  replace: string;
}

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
  replacements: number;
}

export default function TextReplaceConverter() {
  const [inputText, setInputText] = useState('');
  const [replacements, setReplacements] = useState<Replacement[]>([{ find: '', replace: '' }]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    replacements: 0,
  });

  const updateStats = (text: string, replacedText: string) => {
    const replacementCount = replacements.reduce((count, { find, replace }) => {
      if (!find) return count;
      try {
        const originalMatches = (text.match(new RegExp(find, 'g')) || []).length;
        return count + originalMatches;
      } catch {
        return count;
      }
    }, 0);

    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
      replacements: replacementCount,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    const result = performReplace(newText);
    updateStats(newText, result);
  };

  const performReplace = (text: string = inputText): string => {
    if (!text.trim()) return '';

    let processedText = text;
    
    replacements.forEach(({ find, replace }) => {
      if (!find) return;

      try {
        if (useRegex) {
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(find, flags);
          processedText = processedText.replace(regex, replace);
        } else {
          let searchText = find;
          if (wholeWord) {
            searchText = `\\b${find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`;
          } else {
            searchText = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          }
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(searchText, flags);
          processedText = processedText.replace(regex, replace);
        }
      } catch (error) {
        // Invalid regex, skip this replacement
        console.error('Invalid regex:', error);
      }
    });

    return processedText;
  };

  const handleAddReplacement = () => {
    setReplacements([...replacements, { find: '', replace: '' }]);
  };

  const handleRemoveReplacement = (index: number) => {
    if (replacements.length > 1) {
      setReplacements(replacements.filter((_, i) => i !== index));
    }
  };

  const handleUpdateReplacement = (index: number, field: keyof Replacement, value: string) => {
    const newReplacements = [...replacements];
    newReplacements[index] = { ...newReplacements[index], [field]: value };
    setReplacements(newReplacements);
    const result = performReplace();
    updateStats(inputText, result);
  };

  const handleDownload = () => {
    const blob = new Blob([performReplace()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'replaced-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(performReplace());
  };

  const handleClear = () => {
    setInputText('');
    setReplacements([{ find: '', replace: '' }]);
    updateStats('', '');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Replacement Rules */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Find and Replace Rules</label>
          <button
            onClick={handleAddReplacement}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm inline-flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Rule
          </button>
        </div>

        {replacements.map((replacement, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white dark:bg-gray-800 rounded border">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Find:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replacement.find}
                  onChange={(e) => handleUpdateReplacement(index, 'find', e.target.value)}
                  placeholder={useRegex ? 'Regular expression' : 'Text to find'}
                  className="flex-1 p-2 rounded border bg-background text-gray-900 dark:text-gray-100"
                />
                {replacements.length > 1 && (
                  <button
                    onClick={() => handleRemoveReplacement(index)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Replace with:</label>
              <input
                type="text"
                value={replacement.replace}
                onChange={(e) => handleUpdateReplacement(index, 'replace', e.target.value)}
                placeholder="Replacement text"
                className="w-full p-2 rounded border bg-background text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        ))}

        {/* Options */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="case-sensitive"
              checked={caseSensitive}
              onChange={(e) => { setCaseSensitive(e.target.checked); updateStats(inputText, performReplace()); }}
              className="rounded"
            />
            <label htmlFor="case-sensitive" className="text-sm text-gray-900 dark:text-gray-50">Case sensitive</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="whole-word"
              checked={wholeWord}
              onChange={(e) => { setWholeWord(e.target.checked); updateStats(inputText, performReplace()); }}
              disabled={useRegex}
              className="rounded"
            />
            <label htmlFor="whole-word" className="text-sm text-gray-900 dark:text-gray-50">Whole words only</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="use-regex"
              checked={useRegex}
              onChange={(e) => {
                setUseRegex(e.target.checked);
                if (e.target.checked) setWholeWord(false);
                updateStats(inputText, performReplace());
              }}
              className="rounded"
            />
            <label htmlFor="use-regex" className="text-sm text-gray-900 dark:text-gray-50">Use regex</label>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Input Text</label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder="Type or paste your text here..."
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Replaced Text Result</label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100"
            readOnly
            value={performReplace()}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Text
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy to Clipboard
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
        <span>Characters: {stats.characters}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Words: {stats.words}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Lines: {stats.lines}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Replacements Made: {stats.replacements}</span>
      </div>
    </div>
  );
} 
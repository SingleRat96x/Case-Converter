'use client';

import { useState, useEffect } from 'react';
import { Copy, Download, RefreshCw, Save, Search, Replace, FileText, 
         Type, SortAsc, RotateCcw, Trash2, Settings } from 'lucide-react';

export default function OnlineNotepadConverter() {
  const [content, setContent] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSave, setAutoSave] = useState(true);

  // Load saved content on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('online-notepad-content');
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  // Auto-save content
  useEffect(() => {
    if (!autoSave) return;
    
    const saveContent = () => {
      if (content) {
        localStorage.setItem('online-notepad-content', content);
        setLastSaved(new Date());
      }
    };

    const timeoutId = setTimeout(saveContent, 2000);
    return () => clearTimeout(timeoutId);
  }, [content, autoSave]);

  const getStats = () => {
    const lines = content.split('\n');
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const paragraphs = content.trim() ? content.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    
    return {
      characters: content.length,
      charactersNoSpaces: content.replace(/\s/g, '').length,
      words,
      lines: lines.length,
      paragraphs,
    };
  };

  // Text transformations
  const transformText = (type: string) => {
    switch (type) {
      case 'uppercase':
        setContent(content.toUpperCase());
        break;
      case 'lowercase':
        setContent(content.toLowerCase());
        break;
      case 'capitalize':
        setContent(content.replace(/\b\w/g, (char) => char.toUpperCase()));
        break;
      case 'sentence':
        setContent(
          content.toLowerCase().replace(/(^\w|\.\s+\w)/g, (char) => char.toUpperCase())
        );
        break;
      case 'reverse':
        setContent(content.split('').reverse().join(''));
        break;
      case 'removeSpaces':
        setContent(content.replace(/\s+/g, ''));
        break;
      case 'trimLines':
        setContent(content.split('\n').map(line => line.trim()).join('\n'));
        break;
      case 'removeDuplicateLines':
        const lines = content.split('\n');
        const uniqueLines = [...new Set(lines)];
        setContent(uniqueLines.join('\n'));
        break;
      case 'sortLines':
        const sortedLines = content.split('\n').sort();
        setContent(sortedLines.join('\n'));
        break;
      case 'shuffleLines':
        const shuffledLines = content.split('\n').sort(() => Math.random() - 0.5);
        setContent(shuffledLines.join('\n'));
        break;
    }
  };

  const handleFindReplace = () => {
    if (!findText) return;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    setContent(content.replace(regex, replaceText));
  };

  const handleSave = () => {
    localStorage.setItem('online-notepad-content', content);
    setLastSaved(new Date());
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all content?')) {
      setContent('');
      localStorage.removeItem('online-notepad-content');
      setLastSaved(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notepad-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = getStats();

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Online Notepad</h2>
          {lastSaved && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Saved at {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Auto-save
          </label>
        </div>
      </div>

      {/* Main Text Area */}
      <div className="space-y-2">
        <textarea
          className="w-full min-h-[400px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100 font-mono"
          placeholder="Start typing your notes here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Tools Tabs */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text Transformations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Text Tools</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => transformText('uppercase')}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-xs transition-colors"
              >
                UPPERCASE
              </button>
              <button
                onClick={() => transformText('lowercase')}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-xs transition-colors"
              >
                lowercase
              </button>
              <button
                onClick={() => transformText('capitalize')}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-xs transition-colors"
              >
                Capitalize
              </button>
              <button
                onClick={() => transformText('sentence')}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-xs transition-colors"
              >
                Sentence case
              </button>
              <button
                onClick={() => transformText('reverse')}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-xs transition-colors"
              >
                <RotateCcw className="h-3 w-3 inline mr-1" />
                Reverse
              </button>
              <button
                onClick={() => transformText('sortLines')}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-xs transition-colors"
              >
                <SortAsc className="h-3 w-3 inline mr-1" />
                Sort Lines
              </button>
            </div>
          </div>

          {/* Find & Replace */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Find & Replace</h3>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Find text..."
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              />
              <button
                onClick={handleFindReplace}
                disabled={!findText}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md text-sm transition-colors"
              >
                <Replace className="h-3 w-3 inline mr-1" />
                Replace All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </button>
        <button
          onClick={handleDownload}
          disabled={!content}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={!content}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </div>

      {/* Statistics */}
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
        <span>Characters: {stats.characters}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Words: {stats.words}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Lines: {stats.lines}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Paragraphs: {stats.paragraphs}</span>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const [replacements, setReplacements] = useState<Replacement[]>([
    { find: '', replace: '' },
  ]);
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
        const originalMatches = (text.match(new RegExp(find, 'g')) || [])
          .length;
        return count + originalMatches;
      } catch {
        return count;
      }
    }, 0);

    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences:
        text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
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

  const handleUpdateReplacement = (
    index: number,
    field: keyof Replacement,
    value: string
  ) => {
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
    <div className="w-full max-w-none mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Replacement Rules Card */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold">
              Find and Replace Rules
            </CardTitle>
            <Button onClick={handleAddReplacement} size="sm" className="w-fit">
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {replacements.map((replacement, index) => (
            <Card key={index} className="border-muted">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Find:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replacement.find}
                        onChange={e =>
                          handleUpdateReplacement(index, 'find', e.target.value)
                        }
                        placeholder={
                          useRegex ? 'Regular expression' : 'Text to find'
                        }
                        className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      />
                      {replacements.length > 1 && (
                        <Button
                          onClick={() => handleRemoveReplacement(index)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Replace with:
                    </label>
                    <input
                      type="text"
                      value={replacement.replace}
                      onChange={e =>
                        handleUpdateReplacement(
                          index,
                          'replace',
                          e.target.value
                        )
                      }
                      placeholder="Replacement text"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="case-sensitive"
                checked={caseSensitive}
                onChange={e => {
                  setCaseSensitive(e.target.checked);
                  updateStats(inputText, performReplace());
                }}
                className="rounded border-input"
              />
              <label
                htmlFor="case-sensitive"
                className="text-sm text-foreground"
              >
                Case sensitive
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="whole-word"
                checked={wholeWord}
                onChange={e => {
                  setWholeWord(e.target.checked);
                  updateStats(inputText, performReplace());
                }}
                disabled={useRegex}
                className="rounded border-input"
              />
              <label htmlFor="whole-word" className="text-sm text-foreground">
                Whole words only
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-regex"
                checked={useRegex}
                onChange={e => {
                  setUseRegex(e.target.checked);
                  if (e.target.checked) setWholeWord(false);
                  updateStats(inputText, performReplace());
                }}
                className="rounded border-input"
              />
              <label htmlFor="use-regex" className="text-sm text-foreground">
                Use regex
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Areas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Input Text</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] p-4 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="Type or paste your text here..."
              value={inputText}
              onChange={handleInputChange}
            />
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Replaced Text Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] p-4 rounded-md border border-input bg-muted text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              readOnly
              value={performReplace()}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Text
            </Button>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary" className="px-3 py-1">
              Characters: {stats.characters}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Words: {stats.words}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Lines: {stats.lines}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Replacements: {stats.replacements}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

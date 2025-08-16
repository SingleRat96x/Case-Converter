'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SortWordsConverter() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [sortMode, setSortMode] = useState('words'); // 'words' or 'lines'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);

  const handleSort = () => {
    if (!text.trim()) return;

    let items: string[];
    if (sortMode === 'words') {
      items = text.trim().split(/\s+/);
    } else {
      items = text.trim().split('\n');
    }

    // Remove empty items
    items = items.filter(item => item.trim().length > 0);

    // Remove duplicates if enabled
    if (removeDuplicates) {
      items = Array.from(new Set(items));
    }

    // Sort items
    items.sort((a, b) => {
      if (!caseSensitive) {
        a = a.toLowerCase();
        b = b.toLowerCase();
      }
      return sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
    });

    // Join items back together
    const separator = sortMode === 'words' ? ' ' : '\n';
    setResult(items.join(separator));
  };

  const handleClear = () => {
    setText('');
    setResult('');
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="input">Enter text to sort:</Label>
            <Textarea
              id="input"
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sortMode">Sort by:</Label>
              <Select value={sortMode} onValueChange={setSortMode}>
                <SelectTrigger id="sortMode">
                  <SelectValue placeholder="Select sort mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="words">Words</SelectItem>
                  <SelectItem value="lines">Lines</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Sort order:</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger id="sortOrder">
                  <SelectValue placeholder="Select sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending (A to Z)</SelectItem>
                  <SelectItem value="desc">Descending (Z to A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="case-sensitive"
                checked={caseSensitive}
                onCheckedChange={setCaseSensitive}
              />
              <Label htmlFor="case-sensitive">Case sensitive</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="remove-duplicates"
                checked={removeDuplicates}
                onCheckedChange={setRemoveDuplicates}
              />
              <Label htmlFor="remove-duplicates">Remove duplicates</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSort}>
              Sort Text
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Result</h3>
              <Button variant="outline" onClick={handleCopy}>
                Copy to Clipboard
              </Button>
            </div>
            <Textarea
              value={result}
              readOnly
              rows={8}
              className="resize-none"
            />
          </div>
        </Card>
      )}
    </div>
  );
} 
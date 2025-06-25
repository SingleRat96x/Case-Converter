'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}

const commonWords = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'
]);

export function WordFrequencyConverter() {
  const [text, setText] = useState('');
  const [frequencies, setFrequencies] = useState<WordFrequency[]>([]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [excludeCommon, setExcludeCommon] = useState(true);
  const [sortBy, setSortBy] = useState('frequency');
  const [minLength, setMinLength] = useState(1);
  const [minCount, setMinCount] = useState(1);

  const analyzeText = () => {
    if (!text.trim()) return;

    // Split text into words
    const words = text.trim().split(/\s+/);
    const wordMap = new Map<string, number>();
    const totalWords = words.length;

    words.forEach(word => {
      // Remove punctuation and normalize case if needed
      word = word.replace(/[.,!?;:'"()\[\]{}]/g, '');
      if (!caseSensitive) {
        word = word.toLowerCase();
      }

      // Skip if word is too short or is a common word
      if (word.length < minLength) return;
      if (excludeCommon && commonWords.has(word.toLowerCase())) return;

      wordMap.set(word, (wordMap.get(word) || 0) + 1);
    });

    // Convert to array and filter by minimum count
    let freqArray: WordFrequency[] = Array.from(wordMap.entries())
      .filter(([_, count]) => count >= minCount)
      .map(([word, count]) => ({
        word,
        count,
        percentage: (count / totalWords) * 100
      }));

    // Sort the array
    freqArray.sort((a, b) => {
      if (sortBy === 'frequency') {
        return b.count - a.count;
      } else if (sortBy === 'word') {
        return a.word.localeCompare(b.word);
      } else { // percentage
        return b.percentage - a.percentage;
      }
    });

    setFrequencies(freqArray);
  };

  const handleClear = () => {
    setText('');
    setFrequencies([]);
  };

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="input">Enter text:</Label>
            <Textarea
              id="input"
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sortBy">Sort by:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sortBy">
                  <SelectValue placeholder="Select sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frequency">Frequency</SelectItem>
                  <SelectItem value="word">Alphabetically</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minLength">Minimum word length:</Label>
              <Input
                id="minLength"
                type="number"
                min={1}
                value={minLength}
                onChange={(e) => setMinLength(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minCount">Minimum frequency:</Label>
              <Input
                id="minCount"
                type="number"
                min={1}
                value={minCount}
                onChange={(e) => setMinCount(parseInt(e.target.value) || 1)}
              />
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
                id="exclude-common"
                checked={excludeCommon}
                onCheckedChange={setExcludeCommon}
              />
              <Label htmlFor="exclude-common">Exclude common words</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={analyzeText}>
              Analyze Text
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {frequencies.length > 0 && (
        <Card className="p-6">
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Word Frequency Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Word</th>
                    <th className="text-right p-2">Count</th>
                    <th className="text-right p-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {frequencies.map(({ word, count, percentage }) => (
                    <tr key={word} className="border-b">
                      <td className="p-2">{word}</td>
                      <td className="text-right p-2">{count}</td>
                      <td className="text-right p-2">{percentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function SentenceCounterConverter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    sentences: 0,
    words: 0,
    characters: 0,
    averageWordsPerSentence: 0,
  });

  const countSentences = (text: string) => {
    // Split by sentence-ending punctuation marks
    const sentences = text
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0);

    const words = text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);

    const characters = text.length;

    setStats({
      sentences: sentences.length,
      words: words.length,
      characters,
      averageWordsPerSentence: words.length / Math.max(sentences.length, 1),
    });
  };

  const handleTextChange = (value: string) => {
    setText(value);
    countSentences(value);
  };

  const handleClear = () => {
    setText('');
    setStats({
      sentences: 0,
      words: 0,
      characters: 0,
      averageWordsPerSentence: 0,
    });
  };

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="input">Enter your text:</Label>
            <Textarea
              id="input"
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Text Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sentences</p>
              <p className="text-2xl font-bold">{stats.sentences}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Words</p>
              <p className="text-2xl font-bold">{stats.words}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Characters</p>
              <p className="text-2xl font-bold">{stats.characters}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Words per Sentence</p>
              <p className="text-2xl font-bold">
                {stats.averageWordsPerSentence.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function RepeatTextConverter() {
  const [text, setText] = useState('');
  const [count, setCount] = useState(2);
  const [separator, setSeparator] = useState('newline');
  const [result, setResult] = useState('');

  const handleRepeat = () => {
    if (!text || count < 1) return;

    let sep = '';
    switch (separator) {
      case 'newline':
        sep = '\n';
        break;
      case 'space':
        sep = ' ';
        break;
      case 'comma':
        sep = ', ';
        break;
      case 'semicolon':
        sep = '; ';
        break;
      default:
        sep = '\n';
    }

    const repeated = Array(count).fill(text).join(sep);
    setResult(repeated);
  };

  const handleClear = () => {
    setText('');
    setResult('');
    setCount(2);
    setSeparator('newline');
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
            <Label htmlFor="input">Text to repeat:</Label>
            <Textarea
              id="input"
              placeholder="Enter text to repeat..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="count">Number of repetitions:</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={1000}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="separator">Separator:</Label>
              <Select value={separator} onValueChange={setSeparator}>
                <SelectTrigger id="separator">
                  <SelectValue placeholder="Select separator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newline">New Line</SelectItem>
                  <SelectItem value="space">Space</SelectItem>
                  <SelectItem value="comma">Comma</SelectItem>
                  <SelectItem value="semicolon">Semicolon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRepeat}>
              Repeat Text
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
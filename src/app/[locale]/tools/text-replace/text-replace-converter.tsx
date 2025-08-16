'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface Replacement {
  find: string;
  replace: string;
}

export function TextReplaceConverter() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [replacements, setReplacements] = useState<Replacement[]>([{ find: '', replace: '' }]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  const handleReplace = () => {
    if (!text.trim()) return;

    let processedText = text;
    
    replacements.forEach(({ find, replace }) => {
      if (!find) return;

      if (useRegex) {
        try {
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(find, flags);
          processedText = processedText.replace(regex, replace);
        } catch (error) {
          // Invalid regex, skip this replacement
          console.error('Invalid regex:', error);
        }
      } else {
        let searchText = find;
        if (wholeWord) {
          searchText = `\\b${find}\\b`;
        }
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(searchText, flags);
        processedText = processedText.replace(regex, replace);
      }
    });

    setResult(processedText);
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
  };

  const handleClear = () => {
    setText('');
    setResult('');
    setReplacements([{ find: '', replace: '' }]);
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
            <Label htmlFor="input">Enter text:</Label>
            <Textarea
              id="input"
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <Label>Find and Replace:</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddReplacement}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Replacement
              </Button>
            </div>

            {replacements.map((replacement, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`find-${index}`}>Find:</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`find-${index}`}
                      value={replacement.find}
                      onChange={(e) => handleUpdateReplacement(index, 'find', e.target.value)}
                      placeholder={useRegex ? 'Regular expression' : 'Text to find'}
                    />
                    {replacements.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveReplacement(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`replace-${index}`}>Replace with:</Label>
                  <Input
                    id={`replace-${index}`}
                    value={replacement.replace}
                    onChange={(e) => handleUpdateReplacement(index, 'replace', e.target.value)}
                    placeholder="Replacement text"
                  />
                </div>
              </div>
            ))}
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
                id="whole-word"
                checked={wholeWord}
                onCheckedChange={setWholeWord}
                disabled={useRegex}
              />
              <Label htmlFor="whole-word">Match whole words only</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="use-regex"
                checked={useRegex}
                onCheckedChange={(checked) => {
                  setUseRegex(checked);
                  if (checked) setWholeWord(false);
                }}
              />
              <Label htmlFor="use-regex">Use regular expressions</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleReplace}>
              Replace Text
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
              rows={6}
              className="resize-none"
            />
          </div>
        </Card>
      )}
    </div>
  );
} 
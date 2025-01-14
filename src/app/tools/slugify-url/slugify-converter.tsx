'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function SlugifyConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [lowerCase, setLowerCase] = useState(true);
  const [separator, setSeparator] = useState('-');

  const slugify = (text: string, lowerCase: boolean, separator: string): string => {
    try {
      // Convert to lower case if requested
      let slug = lowerCase ? text.toLowerCase() : text;

      // Replace accented characters with their non-accented equivalents
      slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      // Replace spaces and special characters with the separator
      slug = slug
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .trim() // Remove leading/trailing spaces
        .replace(/\s+/g, separator) // Replace spaces with separator
        .replace(/-+/g, separator); // Replace multiple separators with a single one

      return slug;
    } catch (error) {
      throw new Error('Failed to generate slug');
    }
  };

  const handleConvert = () => {
    try {
      const result = slugify(input, lowerCase, separator);
      setOutput(result);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('Error: Failed to generate slug');
      }
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="input">Text to Convert</Label>
          <Textarea
            id="input"
            placeholder="Enter text to convert to URL slug..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={lowerCase}
              onChange={(e) => setLowerCase(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700"
            />
            Convert to lowercase
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Separator:
            </label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
              <option value=".">Dot (.)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            Generate Slug
          </Button>
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
        </div>

        <div>
          <Label htmlFor="output">URL Slug</Label>
          <Textarea
            id="output"
            value={output}
            readOnly
            className="min-h-[100px] font-mono"
          />
        </div>

        <Button
          onClick={handleCopy}
          variant="outline"
          className="w-full"
          disabled={!output}
        >
          Copy Slug
        </Button>
      </div>
    </Card>
  );
} 
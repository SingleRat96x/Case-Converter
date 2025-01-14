'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function CsvToJsonConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [delimiter, setDelimiter] = useState(',');

  const parseCsvToJson = (csv: string, delimiter: string): string => {
    try {
      // Split the CSV into lines
      const lines = csv.trim().split('\n').map(line => line.trim());
      if (lines.length === 0) throw new Error('Empty input');

      // Parse headers
      const headers = lines[0].split(delimiter).map(header => header.trim());

      // Parse data rows
      const jsonData = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(value => value.trim());
        const row: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        return row;
      });

      return JSON.stringify(jsonData, null, 2);
    } catch (error) {
      throw new Error('Invalid CSV format. Please check your input and delimiter.');
    }
  };

  const handleConvert = () => {
    try {
      const jsonOutput = parseCsvToJson(input, delimiter);
      setOutput(jsonOutput);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('Error: Failed to convert CSV to JSON');
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
          <Label htmlFor="input">CSV Data</Label>
          <Textarea
            id="input"
            placeholder="Enter CSV data here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[200px] font-mono"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            First row should contain headers. Default delimiter is comma (,).
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            Convert to JSON
          </Button>
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
        </div>

        <div>
          <Label htmlFor="output">JSON Result</Label>
          <Textarea
            id="output"
            value={output}
            readOnly
            className="min-h-[200px] font-mono"
          />
        </div>

        <Button
          onClick={handleCopy}
          variant="outline"
          className="w-full"
          disabled={!output}
        >
          Copy JSON
        </Button>
      </div>
    </Card>
  );
} 
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Download, Upload, Copy, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ConversionMode = 'csvToJson' | 'jsonToCsv';

export function CsvToJsonConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [mode, setMode] = useState<ConversionMode>('csvToJson');
  const [error, setError] = useState<string | null>(null);

  const parseCsvToJson = (csv: string, delimiter: string): string => {
    try {
      // Split the CSV into lines and filter out empty lines
      const lines = csv.trim().split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (lines.length === 0) throw new Error('Empty input');

      // Parse headers
      const headers = lines[0].split(delimiter)
        .map(header => header.trim())
        .filter(header => header.length > 0);

      if (headers.length === 0) throw new Error('No valid headers found');

      // Parse data rows
      const jsonData = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(value => {
          // Try to parse numbers and booleans
          const trimmed = value.trim();
          if (trimmed === 'true') return true;
          if (trimmed === 'false') return false;
          if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
          return trimmed;
        });

        const row: Record<string, any> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] !== undefined ? values[index] : '';
        });
        
        return row;
      });

      return JSON.stringify(jsonData, null, 2);
    } catch (error) {
      throw new Error('Invalid CSV format. Please check your input and delimiter.');
    }
  };

  const parseJsonToCsv = (jsonStr: string, delimiter: string): string => {
    try {
      const data = JSON.parse(jsonStr);
      if (!Array.isArray(data)) {
        throw new Error('Input must be a JSON array');
      }
      if (data.length === 0) {
        throw new Error('Empty JSON array');
      }

      // Get all unique headers from all objects
      const headers = Array.from(new Set(
        data.flatMap(obj => Object.keys(obj))
      ));

      // Create CSV header row
      const csvRows = [headers.join(delimiter)];

      // Create data rows
      data.forEach(obj => {
        const row = headers.map(header => {
          const value = obj[header];
          // Handle different types of values
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(delimiter)) {
            return `"${value}"`;
          }
          return String(value);
        });
        csvRows.push(row.join(delimiter));
      });

      return csvRows.join('\n');
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format. Please check your input.');
      }
      throw error;
    }
  };

  const handleConvert = () => {
    try {
      setError(null);
      if (!input.trim()) {
        throw new Error('Please enter some input data');
      }

      const result = mode === 'csvToJson' 
        ? parseCsvToJson(input, delimiter)
        : parseJsonToCsv(input, delimiter);
      
      setOutput(result);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        setOutput('');
      }
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(content);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!output) return;
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${mode === 'csvToJson' ? 'json' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleMode = () => {
    setMode(prev => prev === 'csvToJson' ? 'jsonToCsv' : 'csvToJson');
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button onClick={toggleMode} variant="outline" className="gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              {mode === 'csvToJson' ? 'CSV → JSON' : 'JSON → CSV'}
            </Button>
            {mode === 'csvToJson' && (
              <Select
                value={delimiter}
                onValueChange={(value) => setDelimiter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select delimiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value=";">Semicolon (;)</SelectItem>
                  <SelectItem value="\t">Tab</SelectItem>
                  <SelectItem value="|">Pipe (|)</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
            <input
              id="file-upload"
              type="file"
              accept={mode === 'csvToJson' ? '.csv' : '.json'}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="input">
              {mode === 'csvToJson' ? 'CSV Input' : 'JSON Input'}
            </Label>
            <Textarea
              id="input"
              placeholder={mode === 'csvToJson' 
                ? 'Enter CSV data here...\nExample:\nname,age,city\nJohn,25,New York'
                : 'Enter JSON array here...\nExample:\n[\n  {\n    "name": "John",\n    "age": 25,\n    "city": "New York"\n  }\n]'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[300px] font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="output">
              {mode === 'csvToJson' ? 'JSON Output' : 'CSV Output'}
            </Label>
            <Textarea
              id="output"
              value={output}
              readOnly
              className="min-h-[300px] font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button onClick={handleConvert} className="flex-1 gap-2">
            Convert
          </Button>
          <Button onClick={handleCopy} variant="outline" className="gap-2" disabled={!output}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button onClick={handleDownload} variant="outline" className="gap-2" disabled={!output}>
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleClear} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </Card>
    </div>
  );
} 
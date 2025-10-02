'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { CSVToJSONAnalytics } from '@/components/shared/CSVToJSONAnalytics';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { ArrowRightLeft, XCircle, RefreshCw, Zap, Database, FileType } from 'lucide-react';

type ConversionMode = 'csvToJson' | 'jsonToCsv';

interface ConversionOptions {
  delimiter: ',' | ';' | '\t' | '|';
  hasHeaders: boolean;
  jsonFormat: 'array' | 'object' | 'pretty';
  skipEmptyLines: boolean;
  trimWhitespace: boolean;
  handleQuotes: boolean;
  customDelimiter: string;
}

export function CSVToJSONConverter() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('csvToJson');
  const [error, setError] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [options, setOptions] = useState<ConversionOptions>({
    delimiter: ',',
    hasHeaders: true,
    jsonFormat: 'pretty',
    skipEmptyLines: true,
    trimWhitespace: true,
    handleQuotes: true,
    customDelimiter: '',
  });

  // CSV parsing utility
  const parseCSVLine = useCallback((line: string, delimiter: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && options.handleQuotes) {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // Field separator
        result.push(options.trimWhitespace ? current.trim() : current);
        current = '';
      } else {
        current += char;
      }
      i++;
    }

    // Add final field
    result.push(options.trimWhitespace ? current.trim() : current);
    return result;
  }, [options.handleQuotes, options.trimWhitespace]);

  // CSV to JSON conversion
  const convertCSVToJSON = useCallback((csvText: string): string => {
    try {
      const delimiter = options.customDelimiter || options.delimiter;
      const lines = csvText.split(/\r?\n/);
      
      // Filter empty lines if needed
      const filteredLines = options.skipEmptyLines 
        ? lines.filter(line => line.trim().length > 0)
        : lines;

      if (filteredLines.length === 0) {
        throw new Error(tool('csvJson.errors.emptyInput'));
      }

      const parsedLines = filteredLines.map(line => parseCSVLine(line, delimiter));
      
      // Validate consistent column count
      const expectedColumns = parsedLines[0].length;
      const inconsistentRows = parsedLines.findIndex(row => row.length !== expectedColumns);
      if (inconsistentRows !== -1) {
        console.warn(`Row ${inconsistentRows + 1} has ${parsedLines[inconsistentRows].length} columns, expected ${expectedColumns}`);
      }

      let result: unknown;

      if (options.hasHeaders && parsedLines.length > 1) {
        // Use first row as headers
        const headers = parsedLines[0];
        const dataRows = parsedLines.slice(1);

        const objects = dataRows.map(row => {
          const obj: Record<string, string | number> = {};
          headers.forEach((header, index) => {
            const value = row[index] || '';
            // Try to detect and convert numbers
            const numValue = Number(value);
            obj[header] = (!isNaN(numValue) && value !== '' && !isNaN(parseFloat(value))) ? numValue : value;
          });
          return obj;
        });

        result = options.jsonFormat === 'array' ? objects : { data: objects };
      } else {
        // No headers - create array of arrays
        result = parsedLines.map(row => 
          row.map(cell => {
            const numValue = Number(cell);
            return (!isNaN(numValue) && cell !== '' && !isNaN(parseFloat(cell))) ? numValue : cell;
          })
        );
      }

      // Format output
      return options.jsonFormat === 'pretty' 
        ? JSON.stringify(result, null, 2)
        : JSON.stringify(result);

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : tool('csvJson.errors.csvParsingFailed'));
    }
  }, [options, parseCSVLine, tool]);

  // JSON to CSV conversion
  const convertJSONToCSV = useCallback((jsonText: string): string => {
    try {
      const parsed = JSON.parse(jsonText);
      let data: unknown[] = [];

      // Handle different JSON structures
      if (Array.isArray(parsed)) {
        data = parsed;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        data = parsed.data;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Convert single object to array
        data = [parsed];
      } else {
        throw new Error(tool('csvJson.errors.unsupportedJsonFormat'));
      }

      if (data.length === 0) {
        return '';
      }

      const delimiter = options.customDelimiter || options.delimiter;
      const csvLines: string[] = [];

      // Check if data contains objects (with headers) or arrays (no headers)
      if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
        // Object format - extract headers
        const headers = [...new Set(data.flatMap(obj => Object.keys(obj as Record<string, unknown>)))];
        
        if (options.hasHeaders) {
          csvLines.push(headers.map(h => `"${h}"`).join(delimiter));
        }

        // Convert objects to CSV rows
        data.forEach(obj => {
          const row = headers.map(header => {
            const value = (obj as Record<string, unknown>)[header] ?? '';
            const strValue = String(value);
            // Quote fields that contain delimiter, quotes, or newlines
            if (strValue.includes(delimiter) || strValue.includes('"') || strValue.includes('\n')) {
              return `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
          });
          csvLines.push(row.join(delimiter));
        });
      } else if (Array.isArray(data[0])) {
        // Array format - no headers needed
        data.forEach(row => {
          const csvRow = (row as unknown[]).map((cell: unknown) => {
            const strValue = String(cell);
            if (strValue.includes(delimiter) || strValue.includes('"') || strValue.includes('\n')) {
              return `"${strValue.replace(/"/g, '""')}"`;
            }
            return strValue;
          });
          csvLines.push(csvRow.join(delimiter));
        });
      } else {
        throw new Error(tool('csvJson.errors.unsupportedDataStructure'));
      }

      return csvLines.join('\n');

    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error(tool('csvJson.errors.invalidJson'));
      }
      throw new Error(err instanceof Error ? err.message : tool('csvJson.errors.jsonParsingFailed'));
    }
  }, [options, tool]);

  // Process conversion based on mode
  const processConversion = useCallback((inputText: string) => {
    setError(null);
    
    if (!inputText.trim()) {
      setOutput('');
      return;
    }
    
    try {
      if (mode === 'csvToJson') {
        const converted = convertCSVToJSON(inputText);
        setOutput(converted);
      } else {
        const converted = convertJSONToCSV(inputText);
        setOutput(converted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('csvJson.errors.conversionFailed'));
      setOutput('');
    }
  }, [mode, convertCSVToJSON, convertJSONToCSV, tool]);

  // Handle input change
  const handleInputChange = useCallback((newInput: string) => {
    setInput(newInput);
    processConversion(newInput);
  }, [processConversion]);

  // Handle mode switch
  const handleModeSwitch = useCallback(() => {
    const newMode = mode === 'csvToJson' ? 'jsonToCsv' : 'csvToJson';
    setMode(newMode);
    // Swap input and output if both have content
    if (input && output && !error) {
      setInput(output);
      setOutput(input);
    } else {
      processConversion(input);
    }
  }, [mode, input, output, error, processConversion]);

  // Handle option changes
  const handleOptionChange = useCallback((key: keyof ConversionOptions, value: string | boolean | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Apply example CSV
  const applyExample = useCallback((example: string) => {
    setInput(example);
    processConversion(example);
  }, [processConversion]);

  // Clear all fields
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  // Update output when options change
  React.useEffect(() => {
    processConversion(input);
  }, [options, processConversion, input]);

  // Handle responsive accordion behavior
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint
        setIsAccordionOpen(true);
      } else {
        setIsAccordionOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BaseTextConverter
      title={tool('csvJson.title')}
      description={tool('csvJson.description')}
      inputLabel={mode === 'csvToJson' ? tool('csvJson.labels.csvData') : tool('csvJson.labels.jsonData')}
      outputLabel={mode === 'csvToJson' ? tool('csvJson.labels.jsonData') : tool('csvJson.labels.csvData')}
      inputPlaceholder={mode === 'csvToJson' ? tool('csvJson.placeholders.csv') : tool('csvJson.placeholders.json')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName={mode === 'csvToJson' ? 'converted-data.json' : 'converted-data.csv'}
      onTextChange={handleInputChange}
      text={input}
      convertedText={output}
      onConvertedTextUpdate={setOutput}
      onFileUploaded={(content: string) => {
        setInput(content);
        processConversion(content);
      }}
      showAnalytics={false}
      mobileLayout="2x2"
      useMonoFont={true}
    >
      <div className="space-y-3">
        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={handleModeSwitch}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {mode === 'csvToJson' ? tool('csvJson.modes.csvToJson') : tool('csvJson.modes.jsonToCsv')}
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
          
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={!input && !output}
            >
              <RefreshCw className="h-3 w-3" />
              {tool('csvJson.actions.clear')}
            </Button>
            
            <Button
              onClick={() => applyExample(mode === 'csvToJson' 
                ? 'Name,Age,City\nJohn,25,New York\nJane,30,Los Angeles\nBob,35,Chicago'
                : '[\n  {"Name": "John", "Age": 25, "City": "New York"},\n  {"Name": "Jane", "Age": 30, "City": "Los Angeles"}\n]'
              )}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Zap className="h-3 w-3" />
              {tool('csvJson.actions.example')}
            </Button>
          </div>
        </div>

        {/* CSV to JSON Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('csvJson.accordion.title')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Format Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <FileType className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('csvJson.sections.format')}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Delimiter Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      {tool('csvJson.options.delimiter')}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {([',', ';', '\t', '|'] as const).map((delim) => (
                        <Button
                          key={delim}
                          variant={options.delimiter === delim && !options.customDelimiter ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            handleOptionChange('delimiter', delim);
                            handleOptionChange('customDelimiter', '');
                          }}
                          className="text-xs"
                        >
                          {tool(`csvJson.options.delimiters.${delim === '\t' ? 'tab' : delim === ',' ? 'comma' : delim === ';' ? 'semicolon' : 'pipe'}`)}
                        </Button>
                      ))}
                    </div>
                    {/* Custom Delimiter Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={tool('csvJson.options.customDelimiter')}
                        value={options.customDelimiter}
                        onChange={(e) => handleOptionChange('customDelimiter', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-input bg-background rounded-md"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  {/* JSON Format (CSV to JSON only) */}
                  {mode === 'csvToJson' && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-muted-foreground">
                        {tool('csvJson.options.jsonFormat')}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['pretty', 'array', 'object'] as const).map((format) => (
                          <Button
                            key={format}
                            variant={options.jsonFormat === format ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleOptionChange('jsonFormat', format)}
                            className="text-xs"
                          >
                            {tool(`csvJson.options.formats.${format}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Processing Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Database className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('csvJson.sections.processing')}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="has-headers" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('csvJson.options.hasHeaders')}
                    </label>
                    <Switch
                      id="has-headers"
                      checked={options.hasHeaders}
                      onCheckedChange={(checked) => handleOptionChange('hasHeaders', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="skip-empty" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('csvJson.options.skipEmptyLines')}
                    </label>
                    <Switch
                      id="skip-empty"
                      checked={options.skipEmptyLines}
                      onCheckedChange={(checked) => handleOptionChange('skipEmptyLines', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="trim-whitespace" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('csvJson.options.trimWhitespace')}
                    </label>
                    <Switch
                      id="trim-whitespace"
                      checked={options.trimWhitespace}
                      onCheckedChange={(checked) => handleOptionChange('trimWhitespace', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <label htmlFor="handle-quotes" className="text-sm font-medium cursor-pointer flex-1">
                      {tool('csvJson.options.handleQuotes')}
                    </label>
                    <Switch
                      id="handle-quotes"
                      checked={options.handleQuotes}
                      onCheckedChange={(checked) => handleOptionChange('handleQuotes', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
            <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}


        {/* CSV to JSON Analytics */}
        <CSVToJSONAnalytics 
          inputText={input}
          outputText={output}
          mode={mode}
          options={options}
          parseCSVLine={parseCSVLine}
          variant="compact"
          showTitle={false}
        />

      </div>
    </BaseTextConverter>
  );
}
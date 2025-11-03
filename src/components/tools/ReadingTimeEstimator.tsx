'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { EditorView, lineNumbers } from '@codemirror/view';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { FileText, FileJson, Settings, Upload, Trash2, Download, Copy } from 'lucide-react';
import {
  calculateReadingTime,
  extractWordCountFromText,
  extractWordCountFromJSON,
  parseJSONKeys,
  validateJSON,
  READING_SPEED_PRESETS,
  DEFAULT_WPM,
  type ReadingTimeResult,
} from '@/lib/readingTimeUtils';
import { copyToClipboard, downloadTextAsFile } from '@/lib/utils';
import { ReadingTimeAnalytics } from './ReadingTimeAnalytics';
import { ToolHeaderAd } from '@/components/ads/AdPlacements';

type InputMode = 'text' | 'json';

export function ReadingTimeEstimator() {
  const { common, tool } = useToolTranslations('tools/misc-tools');
  
  // Input state
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [jsonKeys, setJsonKeys] = useState('');
  const [isDark, setIsDark] = useState(false);
  
  // Options state
  const [speedPreset, setSpeedPreset] = useState('average');
  const [customWpm, setCustomWpm] = useState('200');
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  
  // Results state
  const [results, setResults] = useState<ReadingTimeResult | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Get current WPM value
  const currentWpm = useMemo(() => {
    if (speedPreset === 'custom') {
      const parsed = parseInt(customWpm);
      return isNaN(parsed) || parsed <= 0 ? DEFAULT_WPM : parsed;
    }
    const preset = READING_SPEED_PRESETS.find(p => p.id === speedPreset);
    return preset?.wpm || DEFAULT_WPM;
  }, [speedPreset, customWpm]);

  // Calculate reading time
  const calculateResults = useCallback((textInput: string, mode: InputMode) => {
    let wordCount = 0;
    setJsonError(null);

    if (!textInput || textInput.trim().length === 0) {
      setResults(null);
      return;
    }

    // Extract word count based on input mode
    if (mode === 'text') {
      wordCount = extractWordCountFromText(textInput);
    } else if (mode === 'json') {
      // Validate JSON first
      const validation = validateJSON(textInput);
      if (!validation.valid) {
        setJsonError(validation.error || 'Invalid JSON');
        setResults(null);
        return;
      }

      // Parse keys
      const keys = parseJSONKeys(jsonKeys);
      const result = extractWordCountFromJSON(textInput, keys || undefined);
      
      if (result.error) {
        setJsonError(result.error);
        if (result.wordCount === 0) {
          setResults(null);
          return;
        }
      }
      
      wordCount = result.wordCount;
    }

    if (wordCount === 0) {
      setResults(null);
      return;
    }

    // Calculate and set results
    const timeResult = calculateReadingTime(wordCount, currentWpm);
    setResults(timeResult);
  }, [jsonKeys, currentWpm]);

  // Auto-calculate when inputs change
  useEffect(() => {
    calculateResults(text, inputMode);
  }, [text, inputMode, jsonKeys, currentWpm, calculateResults]);

  // Handle input mode change
  const handleInputModeChange = (mode: string) => {
    setInputMode(mode as InputMode);
    setResults(null);
    setJsonError(null);
  };

  // Handle speed preset change
  const handleSpeedPresetChange = (preset: string) => {
    setSpeedPreset(preset);
    if (preset !== 'custom') {
      const presetData = READING_SPEED_PRESETS.find(p => p.id === preset);
      if (presetData) {
        setCustomWpm(presetData.wpm.toString());
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    setText('');
    setResults(null);
    setJsonError(null);
  };

  const handleDownload = () => {
    if (!text) return;
    downloadTextAsFile(text, tool('readingTimeEstimator.downloadFileName') || 'text.txt');
  };

  const handleCopy = async () => {
    if (!text) return;
    await copyToClipboard(text);
  };

  // Responsive accordion behavior
  useEffect(() => {
    const handleResize = () => {
      setIsAccordionOpen(window.innerWidth >= 640);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {tool('readingTimeEstimator.title') || 'Reading Time Estimator'}
        </h1>
        <p className="text-muted-foreground">
          {tool('readingTimeEstimator.description') || 'Free read time calculator for text, word count, and JSON payloads.'}
        </p>
      </div>

      <ToolHeaderAd />

      {/* Tabs for input mode selection */}
      <Tabs value={inputMode} defaultValue="text" onValueChange={handleInputModeChange}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {tool('readingTimeEstimator.inputModeText') || 'Text'}
          </TabsTrigger>
          <TabsTrigger value="json" className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            {tool('readingTimeEstimator.inputModeJSON') || 'JSON'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-2 mt-4">
          <p className="text-sm text-muted-foreground text-center">
            {tool('readingTimeEstimator.helperText') || 'Paste your text and get an instant reading time estimate.'}
          </p>
        </TabsContent>

        <TabsContent value="json" className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground text-center">
            Paste JSON data to extract and analyze text content
          </p>
          <div className="max-w-md mx-auto">
            <Label htmlFor="json-keys" className="text-xs">
              {tool('readingTimeEstimator.jsonKeysLabel') || 'Key(s) to include (optional)'}
            </Label>
            <Input
              id="json-keys"
              value={jsonKeys}
              onChange={(e) => setJsonKeys(e.target.value)}
              placeholder='["content","body"] or leave empty for auto-detect'
              className="font-mono text-xs mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to automatically find text content
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* CodeMirror Editor with line numbers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            {inputMode === 'json' ? 'JSON Data' : 'Text Input'}
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {common('buttons.upload') || 'Upload'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        <CodeMirror
          value={text}
          onChange={(value) => setText(value)}
          height="400px"
          theme={isDark ? githubDark : githubLight}
          extensions={[
            inputMode === 'json' ? json() : [],
            lineNumbers(),
            EditorView.lineWrapping,
          ]}
          placeholder={
            inputMode === 'json'
              ? 'Paste your JSON data here...'
              : 'Paste your article, blog post, or text here...'
          }
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
          }}
        />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!text}
          >
            <Copy className="h-4 w-4 mr-2" />
            {common('buttons.copy') || 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!text}
          >
            <Download className="h-4 w-4 mr-2" />
            {common('buttons.download') || 'Download'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!text}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {common('buttons.clear') || 'Clear'}
          </Button>
        </div>
      </div>

      {/* JSON Error Display */}
      {jsonError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{jsonError}</p>
        </div>
      )}

      {/* Reading Speed Options */}
      <Accordion className="w-full">
        <AccordionItem
          title={tool('readingTimeEstimator.speedLabel') || 'Reading speed (words per minute)'}
          defaultOpen={isAccordionOpen}
          className="w-full"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <Settings className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                {tool('readingTimeEstimator.speedLabel') || 'Reading Speed'}
              </h3>
            </div>

            {/* Preset buttons */}
            <div className="grid grid-cols-1 gap-2">
              {READING_SPEED_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant={speedPreset === preset.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSpeedPresetChange(preset.id)}
                  className="justify-start text-left h-auto py-3"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {tool(`readingTimeEstimator.speed${preset.id.charAt(0).toUpperCase() + preset.id.slice(1)}`) || preset.label}
                    </span>
                  </div>
                </Button>
              ))}

              {/* Custom WPM */}
              <div className="pt-2">
                <Button
                  variant={speedPreset === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSpeedPreset('custom')}
                  className="w-full justify-start mb-2"
                >
                  {tool('readingTimeEstimator.speedCustom') || 'Custom WPM'}
                </Button>
                {speedPreset === 'custom' && (
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={customWpm}
                    onChange={(e) => setCustomWpm(e.target.value)}
                    placeholder="200"
                    className="text-sm"
                  />
                )}
              </div>
            </div>
          </div>
        </AccordionItem>
      </Accordion>

      {/* Analytics */}
      {results && (
        <ReadingTimeAnalytics
          results={results}
          currentWpm={currentWpm}
          speedPreset={speedPreset}
          showTitle={false}
          variant="compact"
        />
      )}
    </div>
  );
}

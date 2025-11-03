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
import { InteractiveSlider } from '@/components/shared/InteractiveSlider';
import { FileText, FileJson, Upload, Trash2, Download, Copy, BookOpen, Clock } from 'lucide-react';
import {
  calculateReadingTime,
  extractWordCountFromText,
  extractWordCountFromJSON,
  parseJSONKeys,
  validateJSON,
  type ReadingTimeResult,
} from '@/lib/readingTimeUtils';
import { copyToClipboard, downloadTextAsFile } from '@/lib/utils';
import { ReadingTimeAnalytics } from './ReadingTimeAnalytics';
import { ToolHeaderAd } from '@/components/ads/AdPlacements';
import { SEOContent } from '@/components/seo/SEOContent';

type InputMode = 'text' | 'json';

// Speed presets for sliders
const SILENT_SPEEDS = {
  slow: 150,
  average: 200,
  fast: 250
};

const ALOUD_SPEEDS = {
  slow: 100,
  average: 120,
  fast: 150
};

export function ReadingTimeEstimator() {
  const { common, tool } = useToolTranslations('tools/misc-tools');
  
  // Input state
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [jsonKeys, setJsonKeys] = useState('');
  const [isDark, setIsDark] = useState(false);
  
  // Speed state - both sliders independently adjustable
  const [silentSpeed, setSilentSpeed] = useState(SILENT_SPEEDS.average);
  const [aloudSpeed, setAloudSpeed] = useState(ALOUD_SPEEDS.average);
  
  // Results state
  const [silentResults, setSilentResults] = useState<ReadingTimeResult | null>(null);
  const [aloudResults, setAloudResults] = useState<ReadingTimeResult | null>(null);
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

  // Calculate reading time for both speeds
  const calculateResults = useCallback((textInput: string, mode: InputMode) => {
    let wordCount = 0;
    setJsonError(null);

    if (!textInput || textInput.trim().length === 0) {
      setSilentResults(null);
      setAloudResults(null);
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
        setSilentResults(null);
        setAloudResults(null);
        return;
      }

      // Parse keys
      const keys = parseJSONKeys(jsonKeys);
      const result = extractWordCountFromJSON(textInput, keys || undefined);
      
      if (result.error) {
        setJsonError(result.error);
        if (result.wordCount === 0) {
          setSilentResults(null);
          setAloudResults(null);
          return;
        }
      }
      
      wordCount = result.wordCount;
    }

    if (wordCount === 0) {
      setSilentResults(null);
      setAloudResults(null);
      return;
    }

    // Calculate results for both speeds
    const silentResult = calculateReadingTime(wordCount, silentSpeed);
    const aloudResult = calculateReadingTime(wordCount, aloudSpeed);
    
    setSilentResults(silentResult);
    setAloudResults(aloudResult);
  }, [jsonKeys, silentSpeed, aloudSpeed]);

  // Auto-calculate when inputs change
  useEffect(() => {
    calculateResults(text, inputMode);
  }, [text, inputMode, jsonKeys, silentSpeed, aloudSpeed, calculateResults]);

  // Handle input mode change
  const handleInputModeChange = (mode: string) => {
    setInputMode(mode as InputMode);
    setSilentResults(null);
    setAloudResults(null);
    setJsonError(null);
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
    setSilentResults(null);
    setAloudResults(null);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {tool('readingTimeEstimator.title') || 'Reading Time Estimator'}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
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
            Paste your article, blog post, or any text to analyze reading time
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
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

      {/* Reading Speed Controls */}
      <div className="space-y-6 bg-muted/30 rounded-lg p-6 border">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Reading Speed Settings</h2>
        </div>

        {/* Silent Reading Speed Slider */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Silent Reading</h3>
          </div>
          <InteractiveSlider
            value={silentSpeed}
            min={SILENT_SPEEDS.slow}
            max={SILENT_SPEEDS.fast}
            step={10}
            label={`Silent Reading Speed: ${silentSpeed} WPM`}
            onChange={setSilentSpeed}
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <button
              onClick={() => setSilentSpeed(SILENT_SPEEDS.slow)}
              className={`hover:text-foreground transition-colors ${silentSpeed === SILENT_SPEEDS.slow ? 'text-primary font-semibold' : ''}`}
            >
              Slow ({SILENT_SPEEDS.slow})
            </button>
            <button
              onClick={() => setSilentSpeed(SILENT_SPEEDS.average)}
              className={`hover:text-foreground transition-colors ${silentSpeed === SILENT_SPEEDS.average ? 'text-primary font-semibold' : ''}`}
            >
              Average ({SILENT_SPEEDS.average})
            </button>
            <button
              onClick={() => setSilentSpeed(SILENT_SPEEDS.fast)}
              className={`hover:text-foreground transition-colors ${silentSpeed === SILENT_SPEEDS.fast ? 'text-primary font-semibold' : ''}`}
            >
              Fast ({SILENT_SPEEDS.fast})
            </button>
          </div>
        </div>

        {/* Read Aloud Speed Slider */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Read Aloud</h3>
          </div>
          <InteractiveSlider
            value={aloudSpeed}
            min={ALOUD_SPEEDS.slow}
            max={ALOUD_SPEEDS.fast}
            step={5}
            label={`Read Aloud Speed: ${aloudSpeed} WPM`}
            onChange={setAloudSpeed}
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <button
              onClick={() => setAloudSpeed(ALOUD_SPEEDS.slow)}
              className={`hover:text-foreground transition-colors ${aloudSpeed === ALOUD_SPEEDS.slow ? 'text-primary font-semibold' : ''}`}
            >
              Slow ({ALOUD_SPEEDS.slow})
            </button>
            <button
              onClick={() => setAloudSpeed(ALOUD_SPEEDS.average)}
              className={`hover:text-foreground transition-colors ${aloudSpeed === ALOUD_SPEEDS.average ? 'text-primary font-semibold' : ''}`}
            >
              Average ({ALOUD_SPEEDS.average})
            </button>
            <button
              onClick={() => setAloudSpeed(ALOUD_SPEEDS.fast)}
              className={`hover:text-foreground transition-colors ${aloudSpeed === ALOUD_SPEEDS.fast ? 'text-primary font-semibold' : ''}`}
            >
              Fast ({ALOUD_SPEEDS.fast})
            </button>
          </div>
        </div>
      </div>

      {/* Analytics - Two columns side by side on desktop, stacked on mobile */}
      {(silentResults || aloudResults) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {silentResults && (
            <ReadingTimeAnalytics
              results={silentResults}
              currentWpm={silentSpeed}
              speedPreset="silent"
              title="Silent Reading Time"
              icon={FileText}
              showTitle={true}
              variant="compact"
            />
          )}
          {aloudResults && (
            <ReadingTimeAnalytics
              results={aloudResults}
              currentWpm={aloudSpeed}
              speedPreset="aloud"
              title="Read Aloud Time"
              icon={BookOpen}
              showTitle={true}
              variant="compact"
            />
          )}
        </div>
      )}

      {/* SEO Content */}
      <SEOContent
        toolName="reading-time-estimator"
        enableAds={true}
        adDensity="medium"
      />
    </div>
  );
}

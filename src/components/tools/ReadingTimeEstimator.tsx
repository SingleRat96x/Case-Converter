'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import { FileText, Upload, Trash2, BookOpen } from 'lucide-react';
import {
  calculateReadingTime,
  extractWordCountFromText,
  extractWordCountFromJSON,
  parseJSONKeys,
  validateJSON,
} from '@/lib/readingTimeUtils';
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
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
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

  // Calculate word and character count (memoized to prevent excessive recalculations)
  useEffect(() => {
    if (!text || text.trim().length === 0) {
      setWordCount(0);
      setCharacterCount(0);
      setJsonError(null);
      return;
    }

    let words = 0;
    let error = null;

    // Extract word count based on input mode
    if (inputMode === 'text') {
      words = extractWordCountFromText(text);
    } else if (inputMode === 'json') {
      // Validate JSON first
      const validation = validateJSON(text);
      if (!validation.valid) {
        error = validation.error || 'Invalid JSON';
        setWordCount(0);
        setCharacterCount(text.length);
        setJsonError(error);
        return;
      }

      // Parse keys
      const keys = parseJSONKeys(jsonKeys);
      const result = extractWordCountFromJSON(text, keys || undefined);
      
      if (result.error) {
        error = result.error;
        if (result.wordCount === 0) {
          setWordCount(0);
          setCharacterCount(text.length);
          setJsonError(error);
          return;
        }
      }
      
      words = result.wordCount;
    }

    setWordCount(words);
    setCharacterCount(text.length);
    setJsonError(error);
  }, [text, inputMode, jsonKeys]);

  // Calculate reading times (memoized)
  const silentTime = useMemo(() => {
    if (wordCount === 0) return null;
    return calculateReadingTime(wordCount, silentSpeed);
  }, [wordCount, silentSpeed]);

  const aloudTime = useMemo(() => {
    if (wordCount === 0) return null;
    return calculateReadingTime(wordCount, aloudSpeed);
  }, [wordCount, aloudSpeed]);

  // Handle input mode change
  const handleInputModeChange = useCallback((mode: string) => {
    setInputMode(mode as InputMode);
    setJsonError(null);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleClear = useCallback(() => {
    setText('');
    setJsonError(null);
  }, []);

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
            <BookOpen className="h-4 w-4" />
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={!text}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {common('buttons.clear') || 'Clear'}
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
          onChange={setText}
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
      </div>

      {/* JSON Error Display */}
      {jsonError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{jsonError}</p>
        </div>
      )}

      {/* Reading Speed Controls */}
      <div className="space-y-6 bg-muted/30 rounded-lg p-6 border">
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

      {/* Single Analytics Display */}
      {wordCount > 0 && silentTime && aloudTime && (
        <ReadingTimeAnalytics
          silentTime={silentTime}
          aloudTime={aloudTime}
          wordCount={wordCount}
          characterCount={characterCount}
        />
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

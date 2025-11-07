'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { EditorView, lineNumbers } from '@codemirror/view';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, FileJson, Upload, Trash2, BookOpen, Volume2 } from 'lucide-react';
import { InteractiveSlider } from '@/components/shared/InteractiveSlider';
import {
  calculateReadingTime,
  extractWordCountFromText,
  extractWordCountFromJSON,
  validateJSON,
} from '@/lib/readingTimeUtils';
import { ReadingTimeAnalytics } from './ReadingTimeAnalytics';
import { ToolHeaderAd } from '@/components/ads/AdPlacements';

type InputMode = 'text' | 'json';

// Speed presets for sliders
const SILENT_SPEEDS = [
  { label: 'Slow', wpm: 150 },
  { label: 'Average', wpm: 200 },
  { label: 'Fast', wpm: 250 }
];

const ALOUD_SPEEDS = [
  { label: 'Slow', wpm: 100 },
  { label: 'Average', wpm: 120 },
  { label: 'Fast', wpm: 150 }
];

export function ReadingTimeEstimator() {
  const { common, tool } = useToolTranslations('tools/misc-tools');
  
  // Input state
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [isDark, setIsDark] = useState(false);
  
  // Speed state - both sliders independently adjustable
  const [silentSpeed, setSilentSpeed] = useState(200);
  const [aloudSpeed, setAloudSpeed] = useState(120);
  
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

  // Calculate word and character count
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

      // Auto-detect keys
      const result = extractWordCountFromJSON(text, undefined);
      
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
  }, [text, inputMode]);

  // Calculate reading times (memoized to prevent lag)
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
      
      // Auto-detect and switch to JSON mode if file is JSON
      if (file.name.endsWith('.json')) {
        setInputMode('json');
        setJsonError(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleClear = useCallback(() => {
    setText('');
    setJsonError(null);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {tool('readingTimeEstimator.title') || 'Reading Time Estimator'}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {tool('readingTimeEstimator.description') || 'Free read time calculator for text and JSON payloads.'}
        </p>
      </div>

      <ToolHeaderAd />

      {/* Centered Tabs with professional styling */}
      <div className="flex justify-center">
        <Tabs value={inputMode} defaultValue="text" onValueChange={handleInputModeChange} className="w-full max-w-4xl">
          <div className="flex justify-center mb-4">
            <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-muted p-1 shadow-sm">
              <TabsTrigger 
                value="text" 
                className="flex items-center gap-2 px-6 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
              >
                <FileText className="h-4 w-4" />
                <span className="font-medium">{tool('readingTimeEstimator.inputModeText') || 'Text'}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="json" 
                className="flex items-center gap-2 px-6 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
              >
                <FileJson className="h-4 w-4" />
                <span className="font-medium">{tool('readingTimeEstimator.inputModeJSON') || 'JSON'}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="text" className="mt-0">
            <p className="text-sm text-muted-foreground text-center mb-4">
              {tool('readingTimeEstimator.textTabDescription')}
            </p>
          </TabsContent>

          <TabsContent value="json" className="mt-0">
            <p className="text-sm text-muted-foreground text-center mb-4">
              {tool('readingTimeEstimator.jsonTabDescription')}
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* CodeMirror Editor with line numbers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            {inputMode === 'json' ? tool('readingTimeEstimator.jsonInputLabel') : tool('readingTimeEstimator.textInputLabel')}
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

        <div className="relative group">
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
            className="border-2 border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 focus-within:border-primary focus-within:shadow-md transition-all duration-200"
            style={{
              backgroundColor: isDark ? 'rgb(13, 17, 23)' : 'rgb(255, 255, 255)',
            }}
            placeholder={
            inputMode === 'json'
              ? tool('readingTimeEstimator.jsonPlaceholder')
              : tool('readingTimeEstimator.inputPlaceholder')
            }
            basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: inputMode === 'json',
            }}
          />
        </div>
      </div>

      {/* JSON Error Display */}
      {jsonError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{jsonError}</p>
        </div>
      )}

      {/* Analytics Display - Moved above sliders */}
      {wordCount > 0 && silentTime && aloudTime && (
        <ReadingTimeAnalytics
          silentTime={silentTime}
          aloudTime={aloudTime}
          wordCount={wordCount}
          characterCount={characterCount}
        />
      )}

      {/* Reading Speed Controls with InteractiveSlider - Side by side on desktop */}
      <div className="bg-muted/30 rounded-lg p-6 border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Silent Reading Speed */}
          <div className="space-y-4 lg:pr-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{tool('readingTimeEstimator.silentReadingSpeed')}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                <span className="text-base font-bold text-foreground">{silentSpeed} WPM</span>
              </span>
            </div>
            <InteractiveSlider
              value={silentSpeed}
              min={SILENT_SPEEDS[0].wpm}
              max={SILENT_SPEEDS[SILENT_SPEEDS.length - 1].wpm}
              step={1}
              label="Silent Reading Speed"
              onChange={setSilentSpeed}
              hideLabel={true}
              className="mt-2"
            />
            
            {/* Preset buttons positioned under slider */}
            <div className="flex justify-between items-center px-1">
              {SILENT_SPEEDS.map((speed) => (
                <button
                  key={speed.wpm}
                  onClick={() => setSilentSpeed(speed.wpm)}
                  className={`text-xs px-2 py-1 rounded transition-all ${
                    silentSpeed === speed.wpm
                      ? 'text-primary font-bold bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {speed.label === 'Slow' ? tool('readingTimeEstimator.speedPresetSlow') : speed.label === 'Average' ? tool('readingTimeEstimator.speedPresetAverage') : tool('readingTimeEstimator.speedPresetFast')}
                </button>
              ))}
            </div>
          </div>

          {/* Read Aloud Speed */}
          <div className="space-y-4 lg:pl-6 lg:border-l lg:border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{tool('readingTimeEstimator.readAloudSpeed')}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                <span className="text-base font-bold text-foreground">{aloudSpeed} WPM</span>
              </span>
            </div>
            <InteractiveSlider
              value={aloudSpeed}
              min={ALOUD_SPEEDS[0].wpm}
              max={ALOUD_SPEEDS[ALOUD_SPEEDS.length - 1].wpm}
              step={1}
              label="Read Aloud Speed"
              onChange={setAloudSpeed}
              hideLabel={true}
              className="mt-2"
            />
            
            {/* Preset buttons positioned under slider */}
            <div className="flex justify-between items-center px-1">
              {ALOUD_SPEEDS.map((speed) => (
                <button
                  key={speed.wpm}
                  onClick={() => setAloudSpeed(speed.wpm)}
                  className={`text-xs px-2 py-1 rounded transition-all ${
                    aloudSpeed === speed.wpm
                      ? 'text-primary font-bold bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {speed.label === 'Slow' ? tool('readingTimeEstimator.speedPresetSlow') : speed.label === 'Average' ? tool('readingTimeEstimator.speedPresetAverage') : tool('readingTimeEstimator.speedPresetFast')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

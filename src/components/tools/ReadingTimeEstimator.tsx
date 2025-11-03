'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { EditorView, lineNumbers } from '@codemirror/view';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, FileJson, Upload, Trash2 } from 'lucide-react';
import {
  calculateReadingTime,
  extractWordCountFromText,
  extractWordCountFromJSON,
  validateJSON,
} from '@/lib/readingTimeUtils';
import { ReadingTimeAnalytics } from './ReadingTimeAnalytics';
import { ToolHeaderAd } from '@/components/ads/AdPlacements';
import { SEOContent } from '@/components/seo/SEOContent';

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
              Paste your article, blog post, or any text to analyze reading time
            </p>
          </TabsContent>

          <TabsContent value="json" className="mt-0">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Paste JSON data to automatically extract and analyze text content
            </p>
          </TabsContent>
        </Tabs>
      </div>

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
            foldGutter: inputMode === 'json',
          }}
        />
      </div>

      {/* JSON Error Display */}
      {jsonError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200">{jsonError}</p>
        </div>
      )}

      {/* Reading Speed Controls - Clean, no duplication */}
      <div className="space-y-6 bg-muted/30 rounded-lg p-6 border">
        {/* Silent Reading Speed Slider */}
        <CustomSlider
          value={silentSpeed}
          onChange={setSilentSpeed}
          speeds={SILENT_SPEEDS}
          title="Silent Reading Speed"
        />

        {/* Divider */}
        <div className="border-t" />

        {/* Read Aloud Speed Slider */}
        <CustomSlider
          value={aloudSpeed}
          onChange={setAloudSpeed}
          speeds={ALOUD_SPEEDS}
          title="Read Aloud Speed"
        />
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

// Custom slider component with proper preset positioning
function CustomSlider({ 
  value, 
  onChange, 
  speeds, 
  title 
}: { 
  value: number; 
  onChange: (v: number) => void; 
  speeds: typeof SILENT_SPEEDS;
  title: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const min = speeds[0].wpm;
  const max = speeds[speeds.length - 1].wpm;
  const percentage = ((value - min) / (max - min)) * 100;

  const handleSliderInteraction = useCallback((clientX: number) => {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const position = (clientX - rect.left) / rect.width;
    const clampedPosition = Math.max(0, Math.min(1, position));
    const rawValue = min + clampedPosition * (max - min);
    
    // Snap to nearest preset
    let closestSpeed = speeds[0].wpm;
    let minDiff = Math.abs(rawValue - closestSpeed);
    
    speeds.forEach(speed => {
      const diff = Math.abs(rawValue - speed.wpm);
      if (diff < minDiff) {
        minDiff = diff;
        closestSpeed = speed.wpm;
      }
    });
    
    if (closestSpeed !== value) {
      onChange(closestSpeed);
    }
  }, [min, max, speeds, value, onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    handleSliderInteraction(e.clientX);
  }, [handleSliderInteraction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleSliderInteraction(e.clientX);
  }, [isDragging, handleSliderInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    if (e.touches[0]) {
      handleSliderInteraction(e.touches[0].clientX);
    }
  }, [handleSliderInteraction]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (e.touches[0]) {
      handleSliderInteraction(e.touches[0].clientX);
    }
  }, [isDragging, handleSliderInteraction]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div className="space-y-3">
      {/* Title with bold WPM - no icon, no duplication */}
      <div className="text-sm text-muted-foreground">
        {title}: <span className="text-base font-bold text-foreground">{value} WPM</span>
      </div>

      {/* Slider Track - smooth and responsive */}
      <div
        ref={sliderRef}
        className="h-3 bg-muted rounded-full cursor-pointer relative select-none transition-all"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Progress Fill */}
        <div
          className="h-full bg-primary rounded-full transition-all duration-200 ease-out"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-background border-2 border-primary rounded-full shadow-md cursor-grab transition-all duration-150 ${
            isDragging ? 'scale-125 shadow-lg ring-4 ring-primary/20' : 'hover:scale-110'
          }`}
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>

      {/* Preset buttons - properly positioned under slider track */}
      <div className="flex justify-between items-center">
        {speeds.map((speed) => (
          <button
            key={speed.wpm}
            onClick={() => onChange(speed.wpm)}
            className={`text-xs px-2 py-1 rounded transition-all ${
              value === speed.wpm
                ? 'text-primary font-bold bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {speed.label}
          </button>
        ))}
      </div>
    </div>
  );
}

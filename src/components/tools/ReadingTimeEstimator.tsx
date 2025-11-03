'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, FileText, FileJson, Hash, Sparkles, Settings, BookOpen, Check, Copy } from 'lucide-react';
import {
  calculateReadingTime,
  extractWordCountFromText,
  extractWordCountFromJSON,
  formatReadingTime,
  formatReadingRange,
  generateCopyableSummary,
  parseJSONKeys,
  validateJSON,
  READING_SPEED_PRESETS,
  DEFAULT_WPM,
  type ReadingTimeResult,
} from '@/lib/readingTimeUtils';
import { copyToClipboard } from '@/lib/utils';

type InputMode = 'text' | 'wordcount' | 'json';

export function ReadingTimeEstimator() {
  const { common, tool } = useToolTranslations('tools/misc-tools');
  
  // Input state
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [wordCountInput, setWordCountInput] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [jsonKeys, setJsonKeys] = useState('');
  
  // Options state
  const [speedPreset, setSpeedPreset] = useState('average');
  const [customWpm, setCustomWpm] = useState('200');
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  
  // Results state
  const [results, setResults] = useState<ReadingTimeResult | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

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
  const handleEstimate = useCallback(() => {
    let wordCount = 0;
    setJsonError(null);

    // Extract word count based on input mode
    if (inputMode === 'text') {
      wordCount = extractWordCountFromText(text);
    } else if (inputMode === 'wordcount') {
      const parsed = parseInt(wordCountInput);
      wordCount = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    } else if (inputMode === 'json') {
      // Validate JSON first
      const validation = validateJSON(jsonText);
      if (!validation.valid) {
        setJsonError(validation.error || 'Invalid JSON');
        return;
      }

      // Parse keys
      const keys = parseJSONKeys(jsonKeys);
      const result = extractWordCountFromJSON(jsonText, keys || undefined);
      
      if (result.error) {
        setJsonError(result.error);
        if (result.wordCount === 0) {
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
  }, [inputMode, text, wordCountInput, jsonText, jsonKeys, currentWpm]);

  // Auto-calculate when inputs change
  useEffect(() => {
    const hasInput = 
      (inputMode === 'text' && text) ||
      (inputMode === 'wordcount' && wordCountInput) ||
      (inputMode === 'json' && jsonText);

    if (hasInput) {
      handleEstimate();
    } else {
      setResults(null);
    }
  }, [inputMode, text, wordCountInput, jsonText, jsonKeys, currentWpm, handleEstimate]);

  // Handle copy result
  const handleCopyResult = useCallback(async () => {
    if (!results) return;
    
    const summary = generateCopyableSummary(results, currentWpm);
    const success = await copyToClipboard(summary);
    
    if (success) {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  }, [results, currentWpm]);

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

  // Responsive accordion behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsAccordionOpen(true);
      } else {
        setIsAccordionOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Custom input label with mode selector
  const customInputLabel = (
    <div className="flex items-center gap-2 mb-2">
      <label htmlFor="text-input" className="text-sm font-medium text-foreground">
        {tool('readingTimeEstimator.inputLabel') || 'Input:'}
      </label>
      <Select value={inputMode} onValueChange={handleInputModeChange}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text" className="text-xs">
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              {tool('readingTimeEstimator.inputModeText') || 'Text'}
            </div>
          </SelectItem>
          <SelectItem value="wordcount" className="text-xs">
            <div className="flex items-center gap-2">
              <Hash className="h-3 w-3" />
              {tool('readingTimeEstimator.inputModeWordCount') || 'Word Count'}
            </div>
          </SelectItem>
          <SelectItem value="json" className="text-xs">
            <div className="flex items-center gap-2">
              <FileJson className="h-3 w-3" />
              {tool('readingTimeEstimator.inputModeJSON') || 'JSON'}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Render input based on mode
  const renderInput = () => {
    if (inputMode === 'wordcount') {
      return (
        <div className="space-y-2">
          <Label htmlFor="wordcount-input">
            {tool('readingTimeEstimator.wordCountLabel') || 'Total word count'}
          </Label>
          <Input
            id="wordcount-input"
            type="number"
            min="0"
            value={wordCountInput}
            onChange={(e) => setWordCountInput(e.target.value)}
            placeholder="742"
            className="text-lg"
          />
        </div>
      );
    }

    if (inputMode === 'json') {
      return (
        <div className="space-y-3">
          <div>
            <Label htmlFor="json-input">{tool('readingTimeEstimator.inputModeJSON') || 'JSON Data'}</Label>
            <textarea
              id="json-input"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={tool('readingTimeEstimator.jsonPlaceholder') || 'Paste your JSON data here...'}
              className="w-full h-48 px-3 py-2 text-sm border rounded-md bg-background font-mono resize-y"
            />
          </div>
          <div>
            <Label htmlFor="json-keys">
              {tool('readingTimeEstimator.jsonKeysLabel') || 'Key(s) to include (optional)'}
            </Label>
            <Input
              id="json-keys"
              value={jsonKeys}
              onChange={(e) => setJsonKeys(e.target.value)}
              placeholder={tool('readingTimeEstimator.jsonKeysPlaceholder') || '["content","body"] or "Auto-detect"'}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty or type "Auto-detect" to automatically find text content
            </p>
          </div>
          {jsonError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200">{jsonError}</p>
            </div>
          )}
        </div>
      );
    }

    return null; // Text mode uses BaseTextConverter's default input
  };

  // Results display component
  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="bg-card rounded-lg p-6 border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {tool('readingTimeEstimator.resultsTitle') || 'Reading Time Estimate'}
          </h3>
          <Button
            onClick={handleCopyResult}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {showCopySuccess ? (
              <>
                <Check className="h-4 w-4" />
                {tool('readingTimeEstimator.resultCopied') || 'Copied!'}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {tool('readingTimeEstimator.copyResultButton') || 'Copy result'}
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          {/* Main reading time */}
          <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-sm font-medium text-muted-foreground">
              {tool('readingTimeEstimator.resultsReadingTime') || 'Estimated reading time'}:
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatReadingTime(results.minutes, results.seconds)}
            </span>
          </div>

          {/* Word count (only for text/json modes) */}
          {inputMode !== 'wordcount' && results.wordCount > 0 && (
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">
                {tool('readingTimeEstimator.resultsWordCount') || 'Approximate word count'}:
              </span>
              <span className="text-lg font-semibold">
                {results.wordCount.toLocaleString()} words
              </span>
            </div>
          )}

          {/* Reading time range */}
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              {tool('readingTimeEstimator.resultsRange') || 'Reading time range'}:
            </span>
            <span className="text-lg font-semibold">
              {formatReadingRange(results.range.min, results.range.max)}
            </span>
          </div>

          {/* Out-loud time (if not already selected) */}
          {speedPreset !== 'outloud' && results.outLoudMinutes > 0 && (
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {tool('readingTimeEstimator.resultsOutLoud') || 'Out loud'}:
              </span>
              <span className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                about {results.outLoudMinutes} minute{results.outLoudMinutes === 1 ? '' : 's'}
              </span>
            </div>
          )}
        </div>

        {/* Reading speed info */}
        <div className="pt-3 border-t text-xs text-muted-foreground text-center">
          Based on {currentWpm} words per minute
        </div>
      </div>
    );
  };

  return (
    <BaseTextConverter
      title={tool('readingTimeEstimator.title')}
      description={tool('readingTimeEstimator.description')}
      inputLabel=""
      outputLabel=""
      inputPlaceholder={tool('readingTimeEstimator.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName={tool('readingTimeEstimator.downloadFileName')}
      onTextChange={setText}
      text={text}
      convertedText=""
      onConvertedTextUpdate={() => {}}
      showAnalytics={false}
      mobileLayout="2x2"
      customInputLabel={inputMode === 'text' ? customInputLabel : undefined}
    >
      <div className="space-y-4">
        {/* Show custom input for wordcount/json modes */}
        {inputMode !== 'text' && (
          <div className="mb-4">
            {customInputLabel}
            {renderInput()}
          </div>
        )}

        {/* Primary CTA Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleEstimate}
            variant="default"
            size="lg"
            className="gap-2"
            disabled={
              (inputMode === 'text' && !text) ||
              (inputMode === 'wordcount' && !wordCountInput) ||
              (inputMode === 'json' && !jsonText)
            }
          >
            <Sparkles className="h-4 w-4" />
            {tool('readingTimeEstimator.estimateButton') || 'Estimate reading time'}
          </Button>
        </div>

        {/* Helper Text */}
        <div className="text-center text-sm text-muted-foreground">
          {tool('readingTimeEstimator.helperText') || 'Paste your text, enter a word count, or drop in JSON. Pick a reading speed and get an instant reading time estimate.'}
        </div>

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

        {/* Results Display */}
        {renderResults()}
      </div>
    </BaseTextConverter>
  );
}

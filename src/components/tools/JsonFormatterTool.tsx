/**
 * JsonFormatterTool Component
 * 
 * Main tool component for JSON Formatter & Validator
 * Features: Format, validate, minify, tree view, NDJSON support
 * 
 * Refactored to use modular components:
 * - JsonFormatterToolbar: Action buttons and helper text
 * - JsonFormatterPanel: Input/output editor panels with stats
 * - JsonFormatterStatusBar: Bottom status bar with format settings
 */

'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import { useJsonFormatter } from '@/hooks/useJsonFormatter';
import { JsonFormatterToolbar } from './JsonFormatterToolbar';
import { JsonFormatterPanel } from './JsonFormatterPanel';
import { JsonFormatterStatusBar } from './JsonFormatterStatusBar';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Settings2, FileJson, Code2 } from 'lucide-react';
import { downloadTextAsFile } from '@/lib/utils';

export function JsonFormatterTool() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const { state, actions } = useJsonFormatter();

  const [copySuccess, setCopySuccess] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  /**
   * Handle copy to clipboard
   */
  const handleCopy = useCallback(() => {
    if (!state.output) return;
    navigator.clipboard.writeText(state.output);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }, [state.output]);

  /**
   * Handle download
   */
  const handleDownload = useCallback(() => {
    if (!state.output) return;
    const extension = state.ndjsonMode ? 'ndjson' : 'json';
    downloadTextAsFile(state.output, `formatted.${extension}`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  }, [state.output, state.ndjsonMode]);

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to format
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && state.input && !state.isProcessing) {
        e.preventDefault();
        actions.format();
      }
      // Ctrl/Cmd + K to clear
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && (state.input || state.output)) {
        e.preventDefault();
        actions.clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.input, state.output, state.isProcessing, actions]);

  /**
   * Handle custom indent input
   */
  const [customIndent, setCustomIndent] = React.useState('');
  const showCustomIndent = !([2, 4, 8] as const).includes(state.indentSize as 2 | 4 | 8);

  const handleIndentChange = useCallback((value: string) => {
    if (value === 'custom') {
      // Show custom input
      setCustomIndent('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        actions.setIndentSize(numValue);
      }
    }
  }, [actions]);

  const handleCustomIndentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomIndent(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 16) {
      actions.setIndentSize(numValue);
    }
  }, [actions]);

  /**
   * Calculate input stats for status bar
   */
  const inputStats = useMemo(() => {
    if (!state.input) return null;
    
    try {
      const parsed = JSON.parse(state.input);
      const stats = {
        objects: 0,
        arrays: 0,
        keys: 0,
        primitives: 0,
        size: new Blob([state.input]).size
      };

      const traverse = (obj: any) => {
        if (obj === null || typeof obj !== 'object') {
          stats.primitives++;
          return;
        }

        if (Array.isArray(obj)) {
          stats.arrays++;
          obj.forEach(traverse);
        } else {
          stats.objects++;
          stats.keys += Object.keys(obj).length;
          Object.values(obj).forEach(traverse);
        }
      };

      traverse(parsed);
      return stats;
    } catch {
      return null;
    }
  }, [state.input]);

  return (
    <div className="space-y-6">
      {/* Title and Description */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {tool('jsonFormatter.title') || 'Online JSON Formatter & Validator'}
        </h1>
        <p className="text-muted-foreground">
          {tool('jsonFormatter.intro') || 'Format, validate, and explore JSON in seconds. Paste raw JSON—or drop a .json or .txt file—and we\'ll pretty-print it with syntax highlighting. Toggle indent size, collapse levels, minify for production, or unescape strings for readability. Everything happens locally in your browser.'}
        </p>
      </div>

      {/* Toolbar */}
      <JsonFormatterToolbar
        onFormat={actions.format}
        onMinify={actions.minify}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onClear={actions.clear}
        isProcessing={state.isProcessing}
        hasInput={!!state.input}
        hasOutput={!!state.output}
        copySuccess={copySuccess}
        downloadSuccess={downloadSuccess}
      />

      {/* Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <JsonFormatterPanel
          label={tool('jsonFormatter.inputLabel') || 'Input'}
          value={state.input}
          onChange={actions.setInput}
          onFileUpload={actions.handleFileUpload}
          placeholder={tool('jsonFormatter.inputPlaceholder') || 'Paste or type JSON here...'}
          validationError={state.validationError}
          height="500px"
          showFileUpload={true}
          showStats={true}
          stats={inputStats}
        />

        {/* Output Panel */}
        <JsonFormatterPanel
          label={tool('jsonFormatter.outputLabel') || 'Output'}
          value={state.output}
          readOnly={true}
          placeholder={tool('jsonFormatter.outputPlaceholder') || 'Formatted JSON will appear here...'}
          height="500px"
          showStats={true}
          stats={state.stats}
          viewMode={state.viewMode}
          onViewModeChange={actions.setViewMode}
        />
      </div>

      {/* Status Bar */}
      <JsonFormatterStatusBar
        inputStats={inputStats}
        outputStats={state.stats}
        indentSize={state.indentSize}
        sortKeys={state.sortKeys}
        ndjsonMode={state.ndjsonMode}
        unescapeStrings={state.unescapeStrings}
      />

      {/* Options Accordion */}
      <Accordion className="w-full">
        <AccordionItem
          title={tool('jsonFormatter.optionsTitle') || 'Formatting Options'}
          defaultOpen={false}
        >
          <div className="space-y-6">
            {/* Indent Size */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <Settings2 className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  {tool('jsonFormatter.indentSizeLabel') || 'Indent Size'}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={showCustomIndent ? 'custom' : state.indentSize.toString()}
                  onValueChange={handleIndentChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 spaces</SelectItem>
                    <SelectItem value="4">4 spaces</SelectItem>
                    <SelectItem value="8">8 spaces</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>

                {showCustomIndent && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="16"
                      value={customIndent}
                      onChange={handleCustomIndentChange}
                      placeholder="1-16"
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">spaces</span>
                  </div>
                )}
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sort Keys */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 flex-1">
                  <FileJson className="h-4 w-4 text-muted-foreground" />
                  <label htmlFor="sort-keys" className="text-sm font-medium cursor-pointer">
                    {tool('jsonFormatter.sortKeys') || 'Sort keys alphabetically'}
                  </label>
                </div>
                <Switch
                  id="sort-keys"
                  checked={state.sortKeys}
                  onCheckedChange={actions.setSortKeys}
                />
              </div>

              {/* Unescape Strings */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 flex-1">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <label htmlFor="unescape" className="text-sm font-medium cursor-pointer">
                    {tool('jsonFormatter.unescapeStrings') || 'Unescape JSON strings'}
                  </label>
                </div>
                <Switch
                  id="unescape"
                  checked={state.unescapeStrings}
                  onCheckedChange={actions.setUnescapeStrings}
                />
              </div>

              {/* NDJSON Mode */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 flex-1">
                  <FileJson className="h-4 w-4 text-muted-foreground" />
                  <label htmlFor="ndjson" className="text-sm font-medium cursor-pointer">
                    {tool('jsonFormatter.ndjsonMode') || 'NDJSON mode (line-by-line)'}
                  </label>
                </div>
                <Switch
                  id="ndjson"
                  checked={state.ndjsonMode}
                  onCheckedChange={actions.setNdjsonMode}
                />
              </div>
            </div>

            {/* Info boxes */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                <strong>Sort keys:</strong> Alphabetically sort all object keys recursively
              </p>
              <p>
                <strong>Unescape strings:</strong> Convert escape sequences like \n to actual newlines
              </p>
              <p>
                <strong>NDJSON mode:</strong> Validate and format newline-delimited JSON (one JSON object per line)
              </p>
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

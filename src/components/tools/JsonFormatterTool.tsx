/**
 * JsonFormatterTool Component
 * 
 * Main tool component for JSON Formatter & Validator
 * Features: Format, validate, minify, tree view, NDJSON support
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { useJsonFormatter } from '@/hooks/useJsonFormatter';
import { JsonEditorPanel } from '@/components/shared/JsonEditorPanel';
import { JsonTreeView } from '@/components/shared/JsonTreeView';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { 
  Sparkles, 
  Minimize2, 
  Copy, 
  Download, 
  Trash2, 
  Check, 
  Loader2,
  Code2,
  TreePine,
  Settings2,
  FileJson,
  Info
} from 'lucide-react';
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
   * Format button state
   */
  const formatButtonText = useMemo(() => {
    if (state.isProcessing) return tool('jsonFormatter.processing') || 'Processing...';
    return tool('jsonFormatter.formatButton') || 'Format & Validate';
  }, [state.isProcessing, tool]);

  /**
   * Stats display
   */
  const statsDisplay = useMemo(() => {
    if (!state.stats) return null;
    return (
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{state.stats.objects} objects</span>
        <span>•</span>
        <span>{state.stats.arrays} arrays</span>
        <span>•</span>
        <span>{state.stats.keys} keys</span>
        <span>•</span>
        <span>{state.stats.primitives} values</span>
        <span>•</span>
        <span>{(state.stats.size / 1024).toFixed(1)} KB</span>
      </div>
    );
  }, [state.stats]);

  return (
    <div className="space-y-6">
      {/* Title and Description */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {tool('jsonFormatter.title') || 'Online JSON Formatter & Validator'}
        </h1>
        <p className="text-muted-foreground">
          {tool('jsonFormatter.intro') || 'Format, validate, and explore JSON in seconds. Paste raw JSON—or drop a .json or .txt file—and we\'ll pretty-print it with syntax highlighting. Toggle indent size, collapse levels, minify for production, or unescape strings for readability. Everything happens locally in your browser.'}
        </p>
      </div>

      {/* Tool Options Bar */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-4">
        {/* Primary Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={actions.format}
            disabled={!state.input || state.isProcessing}
            size="lg"
            className="gap-2"
          >
            {state.isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {formatButtonText}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {formatButtonText}
              </>
            )}
          </Button>

          <Button
            onClick={actions.minify}
            disabled={!state.input || state.isProcessing}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <Minimize2 className="h-4 w-4" />
            {tool('jsonFormatter.minifyButton') || 'Minify'}
          </Button>

          <Button
            onClick={handleCopy}
            disabled={!state.output}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            {copySuccess ? (
              <>
                <Check className="h-4 w-4" />
                {common('buttons.copied') || 'Copied!'}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {common('buttons.copy') || 'Copy'}
              </>
            )}
          </Button>

          <Button
            onClick={handleDownload}
            disabled={!state.output}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            {downloadSuccess ? (
              <>
                <Check className="h-4 w-4" />
                {common('buttons.downloaded') || 'Downloaded!'}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {common('buttons.download') || 'Download'}
              </>
            )}
          </Button>

          <Button
            onClick={actions.clear}
            disabled={!state.input && !state.output}
            size="lg"
            variant="ghost"
            className="gap-2 ml-auto"
          >
            <Trash2 className="h-4 w-4" />
            {common('buttons.clear') || 'Clear'}
          </Button>
        </div>

        {/* Helper Text */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            {tool('jsonFormatter.helperText') || 'Paste JSON or drop a JSON/TXT file. We\'ll pretty-print and validate in your browser. Press Ctrl/Cmd+Enter to format.'}
          </p>
        </div>
      </div>

      {/* Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <JsonEditorPanel
          value={state.input}
          onChange={actions.setInput}
          onFileUpload={actions.handleFileUpload}
          placeholder={tool('jsonFormatter.inputPlaceholder') || 'Paste or type JSON here...'}
          label={tool('jsonFormatter.inputLabel') || 'Input'}
          validationError={state.validationError}
          height="500px"
          showFileUpload={true}
        />

        {/* Output Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">
              {tool('jsonFormatter.outputLabel') || 'Output'}
            </Label>
            {state.output && (
              <div className="flex items-center gap-2">
                <Button
                  variant={state.viewMode === 'code' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => actions.setViewMode('code')}
                  className="gap-1.5 h-8"
                >
                  <Code2 className="h-3 w-3" />
                  Code
                </Button>
                <Button
                  variant={state.viewMode === 'tree' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => actions.setViewMode('tree')}
                  className="gap-1.5 h-8"
                >
                  <TreePine className="h-3 w-3" />
                  Tree
                </Button>
              </div>
            )}
          </div>

          {state.viewMode === 'code' ? (
            <JsonEditorPanel
              value={state.output}
              readOnly={true}
              placeholder={tool('jsonFormatter.outputPlaceholder') || 'Formatted JSON will appear here...'}
              height="500px"
            />
          ) : (
            <JsonTreeView
              json={state.output}
              height="500px"
            />
          )}

          {/* Stats Display */}
          {statsDisplay && (
            <div className="flex items-center justify-end pt-2">
              {statsDisplay}
            </div>
          )}
        </div>
      </div>

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

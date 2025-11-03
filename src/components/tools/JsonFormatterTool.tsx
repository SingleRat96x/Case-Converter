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
import { JsonInputPanel } from './JsonInputPanel';
import { JsonOutputPanel } from './JsonOutputPanel';
import { JsonFormatterStatusBar } from './JsonFormatterStatusBar';
import { useToolTranslations } from '@/lib/i18n/hooks';

export function JsonFormatterTool() {
  const { tool } = useToolTranslations('tools/code-data');
  const { state, actions } = useJsonFormatter();

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

      const traverse = (obj: unknown): void => {
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

      {/* Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <JsonInputPanel
          value={state.input}
          onChange={actions.setInput}
          onFileUpload={actions.handleFileUpload}
          onFormat={actions.format}
          onMinify={actions.minify}
          onClear={actions.clear}
          validationError={state.validationError}
          isProcessing={state.isProcessing}
          indentSize={state.indentSize}
          onIndentSizeChange={actions.setIndentSize}
          sortKeys={state.sortKeys}
          onSortKeysChange={actions.setSortKeys}
          unescapeStrings={state.unescapeStrings}
          onUnescapeStringsChange={actions.setUnescapeStrings}
          ndjsonMode={state.ndjsonMode}
          onNdjsonModeChange={actions.setNdjsonMode}
          height="500px"
        />

        {/* Output Panel */}
        <JsonOutputPanel
          value={state.output}
          stats={state.stats}
          viewMode={state.viewMode}
          onViewModeChange={actions.setViewMode}
          ndjsonMode={state.ndjsonMode}
          height="500px"
        />
      </div>

      {/* Global Status Bar */}
      <JsonFormatterStatusBar
        inputStats={inputStats}
        outputStats={state.stats}
        indentSize={state.indentSize}
        sortKeys={state.sortKeys}
        ndjsonMode={state.ndjsonMode}
        unescapeStrings={state.unescapeStrings}
      />
    </div>
  );
}

/**
 * useJsonFormatter Hook
 * 
 * Main state management hook for JSON Formatter & Validator tool
 * Handles all conversion logic, validation, and state synchronization
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  formatJSON,
  formatNDJSON,
  minifyJSON,
  parseJSONWithError,
  type JsonFormatterOptions,
  type ValidationError,
  type FormatResult
} from '@/lib/jsonFormatterUtils';
import { useBooleanUrlState, useNumberUrlState, useStringUrlState } from './useUrlState';

export type ViewMode = 'code' | 'tree';

export interface JsonFormatterState {
  input: string;
  output: string;
  indentSize: number;
  sortKeys: boolean;
  unescapeStrings: boolean;
  ndjsonMode: boolean;
  viewMode: ViewMode;
  validationError: ValidationError | null;
  isProcessing: boolean;
  stats: FormatResult['stats'] | null;
}

export interface JsonFormatterActions {
  setInput: (value: string) => void;
  setOutput: (value: string) => void;
  setIndentSize: (value: number) => void;
  setSortKeys: (value: boolean) => void;
  setUnescapeStrings: (value: boolean) => void;
  setNdjsonMode: (value: boolean) => void;
  setViewMode: (value: ViewMode) => void;
  format: () => void;
  minify: () => void;
  clear: () => void;
  handleFileUpload: (content: string) => void;
}

export function useJsonFormatter() {
  // Core state
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<FormatResult['stats'] | null>(null);

  // URL-persisted options
  const [indentSize, setIndentSize] = useNumberUrlState('indent', 2);
  const [sortKeys, setSortKeys] = useBooleanUrlState('sort', false);
  const [unescapeStrings, setUnescapeStrings] = useBooleanUrlState('unescape', false);
  const [ndjsonMode, setNdjsonMode] = useBooleanUrlState('ndjson', false);
  const [viewMode, setViewMode] = useStringUrlState('view', 'code') as [ViewMode, (v: ViewMode) => void];

  // Build options object
  const options: JsonFormatterOptions = useMemo(
    () => ({
      indentSize,
      sortKeys,
      unescapeStrings,
      minify: false,
      ndjsonMode
    }),
    [indentSize, sortKeys, unescapeStrings, ndjsonMode]
  );

  /**
   * Format JSON with current options
   */
  const format = useCallback(() => {
    if (!input.trim()) {
      setValidationError({ message: 'Input is empty' });
      setOutput('');
      setStats(null);
      return;
    }

    setIsProcessing(true);
    setValidationError(null);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        if (ndjsonMode) {
          // Format as NDJSON
          const result = formatNDJSON(input, options);
          
          if (result.success) {
            // Combine all formatted lines
            const formatted = result.results
              .map(r => r.formatted || '')
              .join('\n');
            setOutput(formatted);
            setValidationError(null);
            
            // Aggregate stats
            const aggregateStats = result.results.reduce(
              (acc, r) => {
                if (r.stats) {
                  acc.keys += r.stats.keys;
                  acc.arrays += r.stats.arrays;
                  acc.objects += r.stats.objects;
                  acc.primitives += r.stats.primitives;
                  acc.size += r.stats.size;
                }
                return acc;
              },
              { keys: 0, arrays: 0, objects: 0, primitives: 0, size: 0 }
            );
            setStats(aggregateStats);
          } else {
            // Show first error
            const firstError = result.results.find(r => !r.success);
            if (firstError && firstError.error) {
              setValidationError(firstError.error);
            }
            setOutput('');
            setStats(null);
          }
        } else {
          // Format as standard JSON
          const result = formatJSON(input, options);
          
          if (result.success && result.formatted) {
            setOutput(result.formatted);
            setValidationError(null);
            setStats(result.stats || null);
          } else if (result.error) {
            setValidationError(result.error);
            setOutput('');
            setStats(null);
          }
        }
      } catch (err) {
        setValidationError({
          message: err instanceof Error ? err.message : 'Unknown error occurred'
        });
        setOutput('');
        setStats(null);
      } finally {
        setIsProcessing(false);
      }
    }, 0);
  }, [input, options, ndjsonMode]);

  /**
   * Minify JSON (remove all whitespace)
   */
  const minify = useCallback(() => {
    if (!input.trim()) {
      setValidationError({ message: 'Input is empty' });
      setOutput('');
      return;
    }

    setIsProcessing(true);
    setValidationError(null);

    setTimeout(() => {
      try {
        const result = minifyJSON(input);
        
        if (result.success && result.formatted) {
          setOutput(result.formatted);
          setValidationError(null);
          setStats(result.stats || null);
        } else if (result.error) {
          setValidationError(result.error);
          setOutput('');
          setStats(null);
        }
      } catch (err) {
        setValidationError({
          message: err instanceof Error ? err.message : 'Minification error'
        });
        setOutput('');
        setStats(null);
      } finally {
        setIsProcessing(false);
      }
    }, 0);
  }, [input]);

  /**
   * Clear all input and output
   */
  const clear = useCallback(() => {
    setInput('');
    setOutput('');
    setValidationError(null);
    setStats(null);
  }, []);

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback((content: string) => {
    setInput(content);
    // Auto-validate on upload
    const validation = parseJSONWithError(content);
    if (!validation.valid && validation.error) {
      setValidationError(validation.error);
      setOutput('');
      setStats(null);
    } else {
      setValidationError(null);
      // Auto-format on successful upload
      setTimeout(() => format(), 100);
    }
  }, [format]);

  // State object
  const state: JsonFormatterState = useMemo(
    () => ({
      input,
      output,
      indentSize,
      sortKeys,
      unescapeStrings,
      ndjsonMode,
      viewMode,
      validationError,
      isProcessing,
      stats
    }),
    [input, output, indentSize, sortKeys, unescapeStrings, ndjsonMode, viewMode, validationError, isProcessing, stats]
  );

  // Actions object
  const actions: JsonFormatterActions = useMemo(
    () => ({
      setInput,
      setOutput,
      setIndentSize,
      setSortKeys,
      setUnescapeStrings,
      setNdjsonMode,
      setViewMode,
      format,
      minify,
      clear,
      handleFileUpload
    }),
    [format, minify, clear, handleFileUpload, setIndentSize, setSortKeys, setUnescapeStrings, setNdjsonMode, setViewMode]
  );

  return {
    state,
    actions
  };
}

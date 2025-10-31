/**
 * JsonEditorPanel Component
 * 
 * CodeMirror-based JSON editor with syntax highlighting,
 * validation errors, and file upload support
 */

'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { EditorView } from '@codemirror/view';
import { linter, Diagnostic } from '@codemirror/lint';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { parseJSONWithError, type ValidationError } from '@/lib/jsonFormatterUtils';
import { Upload, AlertCircle } from 'lucide-react';

export interface JsonEditorPanelProps {
  value: string;
  onChange?: (value: string) => void;
  onFileUpload?: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  label?: string;
  validationError?: ValidationError | null;
  height?: string;
  showFileUpload?: boolean;
  className?: string;
}

export function JsonEditorPanel({
  value,
  onChange,
  onFileUpload,
  readOnly = false,
  placeholder = 'Paste or type JSON here...',
  label,
  validationError,
  height = '400px',
  showFileUpload = false,
  className = ''
}: JsonEditorPanelProps) {
  // Detect theme from document class
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initial theme detection
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();

    // Watch for theme changes using MutationObserver
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  /**
   * Handle file drop
   */
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!onFileUpload) return;

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        
        // Check file type
        if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
          alert('Please upload a .json or .txt file');
          return;
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert('File too large. Maximum size is 10MB.');
          return;
        }

        // Read file
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileUpload(content);
        };
        reader.onerror = () => {
          alert('Error reading file');
        };
        reader.readAsText(file);
      }
    },
    [onFileUpload]
  );

  /**
   * Handle file input change
   */
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0 && onFileUpload) {
        const file = files[0];
        
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert('File too large. Maximum size is 10MB.');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileUpload(content);
        };
        reader.onerror = () => {
          alert('Error reading file');
        };
        reader.readAsText(file);
      }
      // Reset input
      event.target.value = '';
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  /**
   * JSON linter for CodeMirror
   */
  const jsonLinter = useMemo(
    () =>
      linter((view) => {
        const diagnostics: Diagnostic[] = [];
        const text = view.state.doc.toString();

        if (text.trim()) {
          const result = parseJSONWithError(text);
          if (!result.valid && result.error) {
            // Calculate position in document
            let from = 0;
            let to = text.length;

            if (result.error.line && result.error.column) {
              const lines = text.split('\n');
              let pos = 0;
              for (let i = 0; i < result.error.line - 1 && i < lines.length; i++) {
                pos += lines[i].length + 1; // +1 for newline
              }
              pos += result.error.column - 1;
              from = Math.max(0, pos);
              to = Math.min(text.length, pos + 10);
            }

            diagnostics.push({
              from,
              to,
              severity: 'error',
              message: result.error.message
            });
          }
        }

        return diagnostics;
      }),
    []
  );

  /**
   * CodeMirror extensions and theme
   */
  const extensions = useMemo(() => {
    const exts = [
      json(),
      EditorView.lineWrapping
    ];

    // Add linter only if not readOnly
    if (!readOnly) {
      exts.push(jsonLinter);
    }

    return exts;
  }, [readOnly, jsonLinter]);

  // Select theme based on dark mode
  const theme = useMemo(() => {
    return isDark ? githubDark : githubLight;
  }, [isDark]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and File Upload */}
      {(label || showFileUpload) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          {showFileUpload && onFileUpload && (
            <label
              htmlFor="json-file-upload"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md cursor-pointer hover:bg-accent transition-colors"
            >
              <Upload className="h-3 w-3" />
              Upload File
              <input
                id="json-file-upload"
                type="file"
                accept=".json,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Editor */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative"
      >
        <CodeMirror
          value={value}
          height={height}
          extensions={extensions}
          theme={theme}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true
          }}
        />

        {/* Drop zone overlay */}
        {showFileUpload && onFileUpload && !value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Drop .json or .txt file here</p>
            </div>
          </div>
        )}
      </div>

      {/* Validation Error Display */}
      {validationError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-red-800 dark:text-red-200">
              {validationError.message}
            </p>
            {validationError.line && validationError.column && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Line {validationError.line}, Column {validationError.column}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

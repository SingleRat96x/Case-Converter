/**
 * JsonEditorPanel Component
 * 
 * CodeMirror-based JSON editor with syntax highlighting,
 * validation errors, and file upload support
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { EditorView } from '@codemirror/view';
import { linter, Diagnostic } from '@codemirror/lint';
import { parseJSONWithError, type ValidationError } from '@/lib/jsonFormatterUtils';
import { Upload, AlertCircle } from 'lucide-react';
import { useTheme } from 'next-themes';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
   * CodeMirror extensions
   */
  const extensions = useMemo(() => {
    const exts = [
      json(),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': {
          fontSize: '14px',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          backgroundColor: isDark ? 'hsl(var(--background))' : 'hsl(var(--background))',
          color: isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'
        },
        '.cm-scroller': {
          overflow: 'auto',
          fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
          backgroundColor: isDark ? 'hsl(var(--background))' : 'hsl(var(--background))'
        },
        '.cm-content': {
          padding: '12px 0',
          caretColor: isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'
        },
        '.cm-line': {
          padding: '0 12px',
          color: isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'
        },
        '.cm-gutters': {
          backgroundColor: isDark ? 'hsl(var(--muted) / 0.3)' : 'hsl(var(--muted))',
          border: 'none',
          borderRight: '1px solid hsl(var(--border))',
          color: isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))'
        },
        '.cm-activeLineGutter': {
          backgroundColor: isDark ? 'hsl(var(--accent) / 0.5)' : 'hsl(var(--accent))'
        },
        '.cm-activeLine': {
          backgroundColor: isDark ? 'hsl(var(--accent) / 0.1)' : 'hsl(var(--accent) / 0.1)'
        },
        '.cm-selectionBackground, ::selection': {
          backgroundColor: isDark ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--primary) / 0.2)'
        },
        '&.cm-focused .cm-selectionBackground, &.cm-focused ::selection': {
          backgroundColor: isDark ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--primary) / 0.2)'
        },
        '.cm-cursor': {
          borderLeftColor: isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'
        },
        // JSON syntax highlighting
        '.cm-property': {
          color: isDark ? '#79c0ff' : '#0550ae'
        },
        '.cm-string': {
          color: isDark ? '#a5d6ff' : '#0a3069'
        },
        '.cm-number': {
          color: isDark ? '#79c0ff' : '#0550ae'
        },
        '.cm-keyword': {
          color: isDark ? '#ff7b72' : '#cf222e'
        },
        '.cm-atom': {
          color: isDark ? '#ffa657' : '#953800'
        },
        '.cm-punctuation': {
          color: isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))'
        },
        // Placeholder text
        '.cm-placeholder': {
          color: isDark ? 'hsl(var(--muted-foreground) / 0.6)' : 'hsl(var(--muted-foreground) / 0.6)'
        },
        // Error styling
        '.cm-lintRange-error': {
          backgroundImage: isDark 
            ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'6\' height=\'3\'%3E%3Cpath d=\'m0 3 l3 -3 l3 3\' stroke=\'%23f85149\' fill=\'none\' stroke-width=\'.7\'/%3E%3C/svg%3E")' 
            : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'6\' height=\'3\'%3E%3Cpath d=\'m0 3 l3 -3 l3 3\' stroke=\'%23cf222e\' fill=\'none\' stroke-width=\'.7\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom left'
        }
      }, { dark: isDark })
    ];

    // Add linter only if not readOnly
    if (!readOnly) {
      exts.push(jsonLinter);
    }

    return exts;
  }, [readOnly, jsonLinter, isDark]);

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

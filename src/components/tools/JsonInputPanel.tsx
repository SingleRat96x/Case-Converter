'use client';

import React from 'react';
import { JsonEditorPanel } from '@/components/shared/JsonEditorPanel';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToolTranslations } from '@/lib/i18n/hooks';
import type { ValidationError } from '@/lib/jsonFormatterUtils';

interface JsonInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onFileUpload: (content: string) => void;
  validationError?: ValidationError | null;
  height?: string;
  className?: string;
}

export function JsonInputPanel({
  value,
  onChange,
  onFileUpload,
  validationError,
  height = '500px',
  className = ''
}: JsonInputPanelProps) {
  const { tool } = useToolTranslations('tools/code-data');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileUpload(content);
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Calculate stats
  const lines = value ? value.split('\n').length : 0;
  const chars = value.length;
  const words = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className={`flex flex-col border border-border rounded-lg bg-background overflow-hidden ${className}`}>
      {/* Input Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {tool('jsonFormatter.inputLabel') || 'Input'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFileClick}
            className="h-7 gap-1.5 text-xs"
            title="Upload JSON file"
          >
            <Upload className="h-3 w-3" />
            Upload
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* CodeMirror Editor */}
      <div className="flex-1 relative">
        <JsonEditorPanel
          value={value}
          onChange={onChange}
          placeholder={tool('jsonFormatter.inputPlaceholder') || 'Paste or type JSON here...'}
          validationError={validationError}
          height={height}
          showFileUpload={false}
        />
      </div>

      {/* Input StatusBar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-muted/30 text-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>Lines: {lines}</span>
          <span>•</span>
          <span>Characters: {chars.toLocaleString()}</span>
          <span>•</span>
          <span>Words: {words}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {validationError ? (
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span className="font-medium">Invalid JSON</span>
            </div>
          ) : value && (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <CheckCircle className="h-3 w-3" />
              <span className="font-medium">Valid JSON</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

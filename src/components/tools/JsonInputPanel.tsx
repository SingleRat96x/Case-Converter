'use client';

import React, { useEffect, useRef } from 'react';
import { JsonEditorPanel } from '@/components/shared/JsonEditorPanel';
import { 
  Upload, AlertCircle, Sparkles, Minimize2, Trash2, Loader2, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToolTranslations } from '@/lib/i18n/hooks';
import type { ValidationError } from '@/lib/jsonFormatterUtils';

interface JsonInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onFileUpload: (content: string) => void;
  onFormat: () => void;
  onMinify: () => void;
  onClear: () => void;
  validationError?: ValidationError | null;
  isProcessing: boolean;
  // Formatting options
  indentSize: number;
  onIndentSizeChange: (size: number) => void;
  sortKeys: boolean;
  onSortKeysChange: (value: boolean) => void;
  unescapeStrings: boolean;
  onUnescapeStringsChange: (value: boolean) => void;
  ndjsonMode: boolean;
  onNdjsonModeChange: (value: boolean) => void;
  onFormatComplete?: () => void;
  height?: string;
  className?: string;
}

export function JsonInputPanel({
  value,
  onChange,
  onFileUpload,
  onFormat,
  onMinify,
  onClear,
  validationError,
  isProcessing,
  indentSize,
  onIndentSizeChange,
  sortKeys,
  onSortKeysChange,
  unescapeStrings,
  onUnescapeStringsChange,
  ndjsonMode,
  onNdjsonModeChange,
  onFormatComplete,
  height = '500px',
  className = ''
}: JsonInputPanelProps) {
  const { tool } = useToolTranslations('tools/code-data');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customIndent, setCustomIndent] = React.useState('');
  const [formatSuccess, setFormatSuccess] = React.useState(false);
  const isInitialMount = useRef(true);

  /**
   * Auto-format when formatting options change
   */
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Auto-format if we have valid input and not already processing
    if (value && !isProcessing && !validationError) {
      onFormat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indentSize, sortKeys, unescapeStrings, ndjsonMode]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert(tool('jsonFormatter.errors.fileTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileUpload(content);
    };
    reader.onerror = () => {
      alert(tool('jsonFormatter.errors.fileReadError'));
    };
    reader.readAsText(file);
    e.target.value = '';
  };


  const handleIndentChange = (val: string) => {
    if (val === 'custom') {
      setCustomIndent('');
    } else {
      const numValue = parseInt(val, 10);
      if (!isNaN(numValue)) {
        onIndentSizeChange(numValue);
      }
    }
  };

  const handleCustomIndentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomIndent(val);
    const numValue = parseInt(val, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 16) {
      onIndentSizeChange(numValue);
    }
  };

  const showCustomIndent = !([2, 4, 8] as const).includes(indentSize as 2 | 4 | 8);

  // Calculate stats
  const lines = value ? value.split('\n').length : 0;
  const chars = value.length;
  const words = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className={`flex flex-col border border-border rounded-lg bg-background overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {/* Primary Actions */}
        <Button
          onClick={() => {
            onFormat();
            // Show success state if no validation error
            setTimeout(() => {
              if (!validationError) {
                setFormatSuccess(true);
                setTimeout(() => setFormatSuccess(false), 2000);
              }
              onFormatComplete?.();
            }, 100);
          }}
          disabled={!value || isProcessing}
          size="sm"
          className={`gap-1.5 h-8 min-w-[140px] transition-all duration-300 ${
            formatSuccess ? 'bg-green-600 hover:bg-green-600 dark:bg-green-600' : ''
          }`}
          title={tool('jsonFormatter.tooltips.format')}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs">{tool('jsonFormatter.processing')}</span>
            </>
          ) : formatSuccess ? (
            <>
              <CheckCircle className="h-3 w-3" />
              <span className="text-xs">{tool('jsonFormatter.formatted')}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              <span className="text-xs">{tool('jsonFormatter.formatButton')}</span>
            </>
          )}
        </Button>

        <Button
          onClick={onMinify}
          disabled={!value || isProcessing}
          size="sm"
          variant="outline"
          className="gap-1.5 h-8"
          title={tool('jsonFormatter.tooltips.minify')}
        >
          <Minimize2 className="h-3 w-3" />
          <span className="text-xs">{tool('jsonFormatter.minifyButton')}</span>
        </Button>

        <Button
          onClick={onClear}
          disabled={!value}
          size="sm"
          variant="ghost"
          className="gap-1.5 h-8"
          title={tool('jsonFormatter.tooltips.clear')}
        >
          <Trash2 className="h-3 w-3" />
          <span className="text-xs">{tool('jsonFormatter.clearButton')}</span>
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Upload */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleFileClick}
          className="h-8 gap-1.5"
          title={tool('jsonFormatter.tooltips.upload')}
        >
          <Upload className="h-3 w-3" />
          <span className="text-xs">{tool('jsonFormatter.uploadButton')}</span>
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-px h-6 bg-border mx-1" />

        {/* Indent Size */}
        <div className="flex items-center gap-2">
          <Select
            value={showCustomIndent ? 'custom' : indentSize.toString()}
            onValueChange={handleIndentChange}
          >
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">{tool('jsonFormatter.indentOptions.spaces2')}</SelectItem>
              <SelectItem value="4">{tool('jsonFormatter.indentOptions.spaces4')}</SelectItem>
              <SelectItem value="8">{tool('jsonFormatter.indentOptions.spaces8')}</SelectItem>
              <SelectItem value="custom">{tool('jsonFormatter.indentOptions.custom')}</SelectItem>
            </SelectContent>
          </Select>

          {showCustomIndent && (
            <Input
              type="number"
              min="1"
              max="16"
              value={customIndent}
              onChange={handleCustomIndentChange}
              placeholder="1-16"
              className="w-16 h-8 text-xs"
            />
          )}
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Sort Keys */}
        <div className="flex items-center gap-2">
          <Switch
            id="sort-keys"
            checked={sortKeys}
            onCheckedChange={onSortKeysChange}
            className="scale-75"
          />
          <label htmlFor="sort-keys" className="text-xs cursor-pointer whitespace-nowrap">
            {tool('jsonFormatter.sortKeys')}
          </label>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Unescape */}
        <div className="flex items-center gap-2">
          <Switch
            id="unescape"
            checked={unescapeStrings}
            onCheckedChange={onUnescapeStringsChange}
            className="scale-75"
          />
          <label htmlFor="unescape" className="text-xs cursor-pointer whitespace-nowrap">
            {tool('jsonFormatter.unescapeStrings')}
          </label>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* NDJSON Mode */}
        <div className="flex items-center gap-2">
          <Switch
            id="ndjson"
            checked={ndjsonMode}
            onCheckedChange={onNdjsonModeChange}
            className="scale-75"
          />
          <label htmlFor="ndjson" className="text-xs cursor-pointer whitespace-nowrap">
            {tool('jsonFormatter.ndjsonMode')}
          </label>
        </div>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900">
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-red-800 dark:text-red-300">{tool('jsonFormatter.errors.invalidJson')}</p>
              <p className="text-red-700 dark:text-red-400 text-xs mt-0.5 break-words">
                {validationError.message}
                {validationError.line && validationError.column && (
                  <span className="ml-1 font-mono">
                    (Line {validationError.line}, Column {validationError.column})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CodeMirror Editor */}
      <div className="flex-1 relative">
        <JsonEditorPanel
          value={value}
          onChange={onChange}
          placeholder={tool('jsonFormatter.inputPlaceholder')}
          validationError={validationError}
          height={height}
          showFileUpload={false}
        />
      </div>

      {/* StatusBar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-muted/30 text-xs">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span>{tool('jsonFormatter.statusBar.lines')}: {lines}</span>
          <span>?</span>
          <span>{tool('jsonFormatter.statusBar.characters')}: {chars.toLocaleString()}</span>
          <span>?</span>
          <span>{tool('jsonFormatter.statusBar.words')}: {words}</span>
        </div>
      </div>
    </div>
  );
}

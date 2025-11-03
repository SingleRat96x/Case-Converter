'use client';

import React from 'react';
import { JsonEditorPanel } from '@/components/shared/JsonEditorPanel';
import { JsonTreeView } from '@/components/shared/JsonTreeView';
import { Button } from '@/components/ui/button';
import { Code2, TreePine } from 'lucide-react';
import type { ValidationError } from '@/lib/jsonFormatterUtils';

interface JsonStats {
  objects: number;
  arrays: number;
  keys: number;
  primitives: number;
  size: number;
}

interface JsonFormatterPanelProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  onFileUpload?: (content: string) => void;
  readOnly?: boolean;
  placeholder: string;
  validationError?: ValidationError | null;
  height?: string;
  showFileUpload?: boolean;
  showStats?: boolean;
  stats?: JsonStats | null;
  viewMode?: 'code' | 'tree';
  onViewModeChange?: (mode: 'code' | 'tree') => void;
  className?: string;
}

export function JsonFormatterPanel({
  label,
  value,
  onChange,
  onFileUpload,
  readOnly = false,
  placeholder,
  validationError,
  height = '500px',
  showFileUpload = false,
  showStats = false,
  stats,
  viewMode = 'code',
  onViewModeChange,
  className = ''
}: JsonFormatterPanelProps) {
  const showViewModeToggle = readOnly && onViewModeChange && value;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header with label and view mode toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
        
        {showViewModeToggle && (
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'code' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('code')}
              className="gap-1.5 h-8"
              title="View as code"
            >
              <Code2 className="h-3 w-3" />
              Code
            </Button>
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('tree')}
              className="gap-1.5 h-8"
              title="View as collapsible tree"
            >
              <TreePine className="h-3 w-3" />
              Tree
            </Button>
          </div>
        )}
      </div>

      {/* Editor or Tree View */}
      {viewMode === 'code' ? (
        <JsonEditorPanel
          value={value}
          onChange={onChange}
          onFileUpload={onFileUpload}
          readOnly={readOnly}
          placeholder={placeholder}
          validationError={validationError}
          height={height}
          showFileUpload={showFileUpload}
        />
      ) : (
        <JsonTreeView
          json={value}
          height={height}
        />
      )}

      {/* Stats Display */}
      {showStats && stats && value && (
        <div className="flex items-center justify-end pt-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{stats.objects} objects</span>
            <span>•</span>
            <span>{stats.arrays} arrays</span>
            <span>•</span>
            <span>{stats.keys} keys</span>
            <span>•</span>
            <span>{stats.primitives} values</span>
            <span>•</span>
            <span>{(stats.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      )}
    </div>
  );
}

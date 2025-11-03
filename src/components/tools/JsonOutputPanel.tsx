'use client';

import React from 'react';
import { JsonEditorPanel } from '@/components/shared/JsonEditorPanel';
import { JsonTreeView } from '@/components/shared/JsonTreeView';
import { Copy, Download, Code2, TreePine, FileJson, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToolTranslations } from '@/lib/i18n/hooks';

interface JsonStats {
  objects: number;
  arrays: number;
  keys: number;
  primitives: number;
  size: number;
}

interface JsonOutputPanelProps {
  value: string;
  stats?: JsonStats | null;
  viewMode: 'code' | 'tree';
  onViewModeChange: (mode: 'code' | 'tree') => void;
  onCopy: () => void;
  onDownload: () => void;
  copySuccess: boolean;
  downloadSuccess: boolean;
  height?: string;
  className?: string;
}

export function JsonOutputPanel({
  value,
  stats,
  viewMode,
  onViewModeChange,
  onCopy,
  onDownload,
  copySuccess,
  downloadSuccess,
  height = '500px',
  className = ''
}: JsonOutputPanelProps) {
  const { tool, common } = useToolTranslations('tools/code-data');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`flex flex-col border border-border rounded-lg bg-background overflow-hidden ${className}`}>
      {/* Output Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {tool('jsonFormatter.outputLabel') || 'Output'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {value && (
            <>
              <Button
                variant={viewMode === 'code' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('code')}
                className="h-7 gap-1.5 text-xs"
                title="View as code"
              >
                <Code2 className="h-3 w-3" />
                Code
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('tree')}
                className="h-7 gap-1.5 text-xs"
                title="View as tree"
              >
                <TreePine className="h-3 w-3" />
                Tree
              </Button>
              
              <div className="w-px h-4 bg-border mx-1" />
            </>
          )}
          
          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            disabled={!value}
            className="h-7 gap-1.5 text-xs"
            title="Copy to clipboard"
          >
            {copySuccess ? (
              <>
                <Check className="h-3 w-3" />
                {common('buttons.copied') || 'Copied'}
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>
          
          {/* Download Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            disabled={!value}
            className="h-7 gap-1.5 text-xs"
            title="Download as file"
          >
            {downloadSuccess ? (
              <>
                <Check className="h-3 w-3" />
                Saved
              </>
            ) : (
              <>
                <Download className="h-3 w-3" />
                Download
              </>
            )}
          </Button>
        </div>
      </div>

      {/* CodeMirror Editor or Tree View */}
      <div className="flex-1 relative">
        {viewMode === 'code' ? (
          <JsonEditorPanel
            value={value}
            readOnly={true}
            placeholder={tool('jsonFormatter.outputPlaceholder') || 'Formatted JSON will appear here...'}
            height={height}
          />
        ) : (
          <JsonTreeView
            json={value}
            height={height}
          />
        )}
      </div>

      {/* Output StatusBar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-muted/30 text-xs">
        {stats && value ? (
          <>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>Objects: {stats.objects}</span>
              <span>•</span>
              <span>Arrays: {stats.arrays}</span>
              <span>•</span>
              <span>Keys: {stats.keys}</span>
              <span>•</span>
              <span>Values: {stats.primitives}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Size: {formatSize(stats.size)}</span>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground">
            No output
          </div>
        )}
      </div>
    </div>
  );
}

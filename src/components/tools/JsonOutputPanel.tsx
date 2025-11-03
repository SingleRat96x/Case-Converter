'use client';

import React from 'react';
import { JsonEditorPanel } from '@/components/shared/JsonEditorPanel';
import { JsonTreeView } from '@/components/shared/JsonTreeView';
import { JsonOutputMenu } from './JsonOutputMenu';
import { Copy, Download, Code2, TreePine, FileJson, Check, Printer, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { downloadTextAsFile } from '@/lib/utils';

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
  ndjsonMode: boolean;
  height?: string;
  className?: string;
}

export function JsonOutputPanel({
  value,
  stats,
  viewMode,
  onViewModeChange,
  ndjsonMode,
  height = '500px',
  className = ''
}: JsonOutputPanelProps) {
  const { tool, common } = useToolTranslations('tools/code-data');
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    if (!value) return;
    const extension = ndjsonMode ? 'ndjson' : 'json';
    downloadTextAsFile(value, `formatted.${extension}`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handlePrint = () => {
    if (!value) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>JSON Output - Print</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 40px; 
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .header { border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Formatted JSON Output</h1>
              <div>${new Date().toLocaleString()}</div>
            </div>
            <pre>${value}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleMenuAction = (actionId: string) => {
    switch (actionId) {
      case 'file-save-json':
      case 'file-save-ndjson':
        handleDownload();
        break;
      case 'file-print':
        handlePrint();
        break;
      case 'edit-copy':
        handleCopy();
        break;
      case 'view-code':
        onViewModeChange('code');
        break;
      case 'view-tree':
        onViewModeChange('tree');
        break;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`flex flex-col border border-border rounded-lg bg-background overflow-hidden ${className}`}>
      {/* Menu Bar */}
      <JsonOutputMenu onMenuAction={handleMenuAction} />

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
        {/* View Mode Toggle */}
        {value && (
          <>
            <Button
              variant={viewMode === 'code' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('code')}
              className="h-8 gap-1.5"
              title="View as code"
            >
              <Code2 className="h-3 w-3" />
              <span className="text-xs">Code</span>
            </Button>
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('tree')}
              className="h-8 gap-1.5"
              title="View as tree"
            >
              <TreePine className="h-3 w-3" />
              <span className="text-xs">Tree</span>
            </Button>
            
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}
        
        {/* Copy Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!value}
          className="h-8 gap-1.5"
          title="Copy to clipboard (Ctrl+C)"
        >
          {copySuccess ? (
            <>
              <Check className="h-3 w-3" />
              <span className="text-xs">{common('buttons.copied') || 'Copied'}</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
        
        {/* Download Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!value}
          className="h-8 gap-1.5"
          title="Download as file"
        >
          {downloadSuccess ? (
            <>
              <Check className="h-3 w-3" />
              <span className="text-xs">Saved</span>
            </>
          ) : (
            <>
              <Download className="h-3 w-3" />
              <span className="text-xs">Download</span>
            </>
          )}
        </Button>

        {/* Print Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          disabled={!value}
          className="h-8 gap-1.5"
          title="Print (Ctrl+P)"
        >
          <Printer className="h-3 w-3" />
          <span className="text-xs">Print</span>
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

      {/* StatusBar */}
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

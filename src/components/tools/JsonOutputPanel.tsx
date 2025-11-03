'use client';

import React from 'react';
import { JsonEditorPanel } from '@/components/shared/JsonEditorPanel';
import { JsonTreeView } from '@/components/shared/JsonTreeView';
import { Copy, Download, Code2, TreePine, Check, Printer, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { downloadTextAsFile } from '@/lib/utils';
import type { ValidationError } from '@/lib/jsonFormatterUtils';

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
  validationError?: ValidationError | null;
  height?: string;
  className?: string;
}

export function JsonOutputPanel({
  value,
  stats,
  viewMode,
  onViewModeChange,
  ndjsonMode,
  validationError,
  height = '500px',
  className = ''
}: JsonOutputPanelProps) {
  const { tool } = useToolTranslations('tools/code-data');
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);

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
      const title = tool('jsonFormatter.outputLabel') + ' - ' + tool('jsonFormatter.printButton');
      const heading = tool('jsonFormatter.outputLabel');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
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
              <h1>${heading}</h1>
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

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`flex flex-col border border-border rounded-lg bg-background overflow-hidden ${className}`}>
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
              title={tool('jsonFormatter.tooltips.viewCode')}
            >
              <Code2 className="h-3 w-3" />
              <span className="text-xs">{tool('jsonFormatter.viewCode')}</span>
            </Button>
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('tree')}
              className="h-8 gap-1.5"
              title={tool('jsonFormatter.tooltips.viewTree')}
            >
              <TreePine className="h-3 w-3" />
              <span className="text-xs">{tool('jsonFormatter.viewTree')}</span>
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
          title={tool('jsonFormatter.tooltips.copy')}
        >
          {copySuccess ? (
            <>
              <Check className="h-3 w-3" />
              <span className="text-xs">{tool('jsonFormatter.copied')}</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span className="text-xs">{tool('jsonFormatter.copyButton')}</span>
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
          title={tool('jsonFormatter.tooltips.download')}
        >
          {downloadSuccess ? (
            <>
              <Check className="h-3 w-3" />
              <span className="text-xs">{tool('jsonFormatter.saved')}</span>
            </>
          ) : (
            <>
              <Download className="h-3 w-3" />
              <span className="text-xs">{tool('jsonFormatter.downloadButton')}</span>
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
          title={tool('jsonFormatter.tooltips.print')}
        >
          <Printer className="h-3 w-3" />
          <span className="text-xs">{tool('jsonFormatter.printButton')}</span>
        </Button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && value && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900">
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-red-800 dark:text-red-300">{tool('jsonFormatter.errors.validationError')}</p>
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

      {/* CodeMirror Editor or Tree View */}
      <div ref={editorRef} className="flex-1 relative">
        {viewMode === 'code' ? (
          <JsonEditorPanel
            value={value}
            readOnly={true}
            placeholder={tool('jsonFormatter.outputPlaceholder')}
            validationError={validationError}
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
              <span>{tool('jsonFormatter.statusBar.objects')}: {stats.objects}</span>
              <span>•</span>
              <span>{tool('jsonFormatter.statusBar.arrays')}: {stats.arrays}</span>
              <span>•</span>
              <span>{tool('jsonFormatter.statusBar.keys')}: {stats.keys}</span>
              <span>•</span>
              <span>{tool('jsonFormatter.statusBar.values')}: {stats.primitives}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{tool('jsonFormatter.statusBar.size')}: {formatSize(stats.size)}</span>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground">
            {tool('jsonFormatter.statusBar.noOutput')}
          </div>
        )}
      </div>
    </div>
  );
}

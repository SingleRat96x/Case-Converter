'use client';

import React from 'react';
import { FileJson, Hash, Layers, Key, HardDrive, Settings2 } from 'lucide-react';

interface JsonStats {
  objects: number;
  arrays: number;
  keys: number;
  primitives: number;
  size: number;
}

interface JsonFormatterStatusBarProps {
  inputStats?: JsonStats | null;
  outputStats?: JsonStats | null;
  indentSize: number;
  sortKeys: boolean;
  ndjsonMode: boolean;
  unescapeStrings: boolean;
  className?: string;
}

export function JsonFormatterStatusBar({
  inputStats,
  outputStats,
  indentSize,
  sortKeys,
  ndjsonMode,
  unescapeStrings,
  className = ''
}: JsonFormatterStatusBarProps) {
  const StatusItem = ({ 
    icon, 
    label, 
    value, 
    title 
  }: { 
    icon?: React.ReactNode; 
    label: string; 
    value: string | number; 
    title?: string;
  }) => (
    <div 
      className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-default"
      title={title}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="font-medium">{label}:</span>
      <span className="font-mono">{value}</span>
    </div>
  );

  const Separator = () => (
    <div className="hidden sm:block w-px h-4 bg-border mx-1" />
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCompressionRatio = () => {
    if (!inputStats || !outputStats) return null;
    if (inputStats.size === 0) return null;
    const ratio = ((outputStats.size - inputStats.size) / inputStats.size) * 100;
    return ratio.toFixed(1);
  };

  const compressionRatio = getCompressionRatio();

  return (
    <div className={`relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 py-2 sm:py-1.5 bg-background border border-border rounded-lg text-xs gap-2 ${className}`}>
      {/* Left side - JSON statistics */}
      <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1">
          {inputStats && (
            <>
              <StatusItem
                icon={<FileJson className="h-3 w-3" />}
                label="Objects"
                value={inputStats.objects}
                title={`JSON Objects: ${inputStats.objects}`}
              />
              
              <Separator />
              
              <StatusItem
                icon={<Layers className="h-3 w-3" />}
                label="Arrays"
                value={inputStats.arrays}
                title={`JSON Arrays: ${inputStats.arrays}`}
              />
              
              <Separator />
              
              <StatusItem
                icon={<Key className="h-3 w-3" />}
                label="Keys"
                value={inputStats.keys}
                title={`Total Keys: ${inputStats.keys}`}
              />
              
              <Separator />
              
              <StatusItem
                icon={<Hash className="h-3 w-3" />}
                label="Values"
                value={inputStats.primitives}
                title={`Primitive Values: ${inputStats.primitives}`}
              />
            </>
          )}
        </div>
      </div>

      {/* Right side - Format settings and output size */}
      <div className="flex flex-wrap items-center gap-1 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-1">
          {outputStats && (
            <>
              <StatusItem
                icon={<HardDrive className="h-3 w-3" />}
                label="Size"
                value={formatSize(outputStats.size)}
                title={`Output Size: ${formatSize(outputStats.size)}`}
              />
              
              {compressionRatio && (
                <>
                  <Separator />
                  <StatusItem
                    label="Change"
                    value={`${compressionRatio}%`}
                    title={`Size change: ${compressionRatio}% ${parseFloat(compressionRatio) > 0 ? 'increase' : 'decrease'}`}
                  />
                </>
              )}
              
              <Separator />
            </>
          )}
          
          <StatusItem
            icon={<Settings2 className="h-3 w-3" />}
            label="Indent"
            value={indentSize}
            title={`Indent Size: ${indentSize} spaces`}
          />
          
          {sortKeys && (
            <>
              <Separator />
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-green-600 dark:text-green-400">
                <span className="font-medium">Sort Keys</span>
              </div>
            </>
          )}
          
          {ndjsonMode && (
            <>
              <Separator />
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 dark:text-blue-400">
                <span className="font-medium">NDJSON</span>
              </div>
            </>
          )}
          
          {unescapeStrings && (
            <>
              <Separator />
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-purple-600 dark:text-purple-400">
                <span className="font-medium">Unescape</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

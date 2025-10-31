/**
 * JsonTreeView Component
 * 
 * Collapsible tree view for JSON with path breadcrumbs and search
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { Search, Copy, Check, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export interface JsonTreeViewProps {
  json: string;
  height?: string;
  className?: string;
}

export function JsonTreeView({
  json,
  height = '400px',
  className = ''
}: JsonTreeViewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  /**
   * Parse JSON safely
   */
  const parsedJson = useMemo(() => {
    if (!json || json.trim() === '') {
      return null;
    }
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, [json]);

  /**
   * Filter JSON based on search term
   */
  const filteredJson = useMemo(() => {
    if (!parsedJson || !searchTerm) {
      return parsedJson;
    }

    const searchLower = searchTerm.toLowerCase();

    function filterValue(value: unknown, path: string[] = []): unknown {
      if (value === null || value === undefined) {
        return value;
      }

      if (Array.isArray(value)) {
        const filtered = value
          .map((item, index) => filterValue(item, [...path, index.toString()]))
          .filter(item => item !== undefined);
        return filtered.length > 0 ? filtered : undefined;
      }

      if (typeof value === 'object') {
        const filtered: Record<string, unknown> = {};
        let hasMatch = false;

        Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
          // Check if key matches search
          if (key.toLowerCase().includes(searchLower)) {
            filtered[key] = val;
            hasMatch = true;
          } else {
            // Recursively filter nested values
            const filteredVal = filterValue(val, [...path, key]);
            if (filteredVal !== undefined) {
              filtered[key] = filteredVal;
              hasMatch = true;
            }
          }
        });

        return hasMatch ? filtered : undefined;
      }

      // Primitive value - check if it matches search
      const strValue = String(value).toLowerCase();
      return strValue.includes(searchLower) ? value : undefined;
    }

    return filterValue(parsedJson);
  }, [parsedJson, searchTerm]);

  /**
   * Copy JSON path to clipboard
   */
  const handleCopyPath = useCallback((path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  }, []);

  /**
   * Build breadcrumb path string
   */
  const pathString = useMemo(() => {
    if (selectedPath.length === 0) return 'root';
    return '$.' + selectedPath.join('.');
  }, [selectedPath]);

  /**
   * Handle node click (for path breadcrumbs)
   * Note: Currently not exposed but kept for future expansion
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNodeClick = useCallback((path: string[]) => {
    setSelectedPath(path);
  }, []);

  if (!parsedJson) {
    return (
      <div 
        className={`flex items-center justify-center border border-border rounded-lg bg-muted/20 ${className}`}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">
          {json ? 'Invalid JSON' : 'No data to display'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search keys or values..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Path Breadcrumbs */}
      {selectedPath.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md text-xs font-mono">
          <div className="flex items-center gap-1 flex-1 text-muted-foreground">
            <span className="font-semibold">Path:</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{pathString}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCopyPath(pathString)}
            className="h-6 px-2"
          >
            {copiedPath === pathString ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      )}

      {/* Tree View */}
      <div
        className="overflow-auto border border-border rounded-lg bg-background"
        style={{ height }}
      >
        <div className="p-4">
          {filteredJson ? (
            <JsonView
              data={filteredJson}
              shouldExpandNode={allExpanded}
              style={{
                ...defaultStyles,
                container: 'json-view-container',
                label: isDark ? 'json-view-label-dark' : 'json-view-label',
                nullValue: isDark ? 'json-view-null-dark' : 'json-view-null',
                undefinedValue: isDark ? 'json-view-undefined-dark' : 'json-view-undefined',
                stringValue: isDark ? 'json-view-string-dark' : 'json-view-string',
                booleanValue: isDark ? 'json-view-boolean-dark' : 'json-view-boolean',
                numberValue: isDark ? 'json-view-number-dark' : 'json-view-number',
                otherValue: isDark ? 'json-view-other-dark' : 'json-view-other',
                punctuation: isDark ? 'json-view-punctuation-dark' : 'json-view-punctuation',
                collapseIcon: 'json-view-collapse-icon',
                expandIcon: 'json-view-expand-icon',
                collapsedContent: 'json-view-collapsed-content'
              }}
            />
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">
              No matches found for &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      {filteredJson && (
        <div className="text-xs text-muted-foreground text-right">
          {searchTerm && 'Filtered view • '}
          Click any key to copy its path
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface KeyValueTableProps {
  title?: string;
  description?: string;
  columns: TableColumn[];
  data: Record<string, unknown>[];
  className?: string;
  striped?: boolean;
}

export function KeyValueTable({
  title,
  description,
  columns,
  data,
  className = '',
  striped = true
}: KeyValueTableProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="space-y-2">
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`py-3 px-4 font-semibold text-left ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-border/50 last:border-b-0 ${
                  striped && index % 2 === 1 ? 'bg-muted/20' : ''
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`py-3 px-4 ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {renderCellContent(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderCellContent(content: unknown): React.ReactNode {
  if (content === null || content === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  
  if (typeof content === 'string' && content.startsWith('http')) {
    return (
      <a
        href={content}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        View Policy
      </a>
    );
  }
  
  if (typeof content === 'boolean') {
    return content ? 'Yes' : 'No';
  }
  
  return String(content);
}
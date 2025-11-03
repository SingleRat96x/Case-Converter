'use client';

import React, { ReactNode } from 'react';

interface TextOutputProps {
  id: string;
  label: string;
  value: string;
  className?: string;
  useMonoFont?: boolean;
  customLabelComponent?: ReactNode;
}

export function TextOutput({ 
  id, 
  label, 
  value, 
  className = "",
  useMonoFont = false,
  customLabelComponent
}: TextOutputProps) {
  return (
    <div className={`flex-1 ${className}`}>
      {customLabelComponent || (
        <label htmlFor={id} className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        readOnly
        className={`w-full h-48 p-4 border-2 border-input/50 rounded-lg bg-muted/50 text-foreground resize-none transition-colors ${
          useMonoFont ? 'font-mono' : ''
        }`}
      />
    </div>
  );
}
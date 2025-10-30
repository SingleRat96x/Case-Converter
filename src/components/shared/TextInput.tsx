'use client';

import React from 'react';

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  customLabelComponent?: React.ReactNode;
}

export function TextInput({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  className = "",
  customLabelComponent
}: TextInputProps) {
  return (
    <div className={`flex-1 ${className}`}>
      {customLabelComponent ? (
        customLabelComponent
      ) : label && label.trim().length > 0 ? (
        <label htmlFor={id} className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      ) : null}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-48 p-4 border-2 border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
      />
    </div>
  );
}
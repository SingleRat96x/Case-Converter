'use client';

import React from 'react';
import { Type, ImageIcon } from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';

export type AsciiMode = 'text' | 'image';

interface AsciiModeSelectorProps {
  mode: AsciiMode;
  onModeChange: (mode: AsciiMode) => void;
}

export function AsciiModeSelector({ mode, onModeChange }: AsciiModeSelectorProps) {
  const { tool } = useToolTranslations('tools/miscellaneous');

  const modes = [
    {
      id: 'text' as const,
      title: tool('asciiArtGenerator.modes.text'),
      description: tool('asciiArtGenerator.modes.textDescription'),
      icon: Type
    },
    {
      id: 'image' as const,
      title: tool('asciiArtGenerator.modes.image'),
      description: tool('asciiArtGenerator.modes.imageDescription'),
      icon: ImageIcon
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          {tool('asciiArtGenerator.modeSelector.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {tool('asciiArtGenerator.modeSelector.description')}
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {modes.map((modeOption) => {
            const IconComponent = modeOption.icon;
            const isSelected = mode === modeOption.id;
            
            return (
              <button
                key={modeOption.id}
                onClick={() => onModeChange(modeOption.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isSelected
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <IconComponent 
                  className={`mr-2 h-5 w-5 ${
                    isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  }`} 
                />
                <div className="text-left">
                  <div className="font-medium">{modeOption.title}</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {modeOption.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
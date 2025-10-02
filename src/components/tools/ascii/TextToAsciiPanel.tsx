'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { textToAscii } from '@/lib/asciiTransforms';
import { ASCII_FONT_PRESETS, DEFAULT_ASCII_OPTIONS } from '@/lib/asciiUtils';
import type { AsciiOptions } from '@/lib/asciiTransforms';
import { Settings, ChevronDown } from 'lucide-react';

interface TextToAsciiPanelProps {
  onAsciiGenerated: (ascii: string, stats: {
    lines: number;
    characters: number;
    originalText: string;
    font: string;
  } | null) => void;
  realTimePreview?: boolean;
}

export function TextToAsciiPanel({ onAsciiGenerated, realTimePreview = true }: TextToAsciiPanelProps) {
  const { tool } = useToolTranslations('tools/miscellaneous');
  const [text, setText] = useState('');
  const [options, setOptions] = useState<AsciiOptions>(DEFAULT_ASCII_OPTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  const generateAscii = useCallback(async () => {
    if (!text.trim()) {
      onAsciiGenerated('', null);
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await textToAscii(text, options);
      
      const stats = {
        lines: result.split('\n').length,
        characters: result.length,
        originalText: text,
        font: options.font
      };
      
      onAsciiGenerated(result, stats);
    } catch (error) {
      console.error('Error generating ASCII:', error);
      onAsciiGenerated('', null);
    } finally {
      setIsGenerating(false);
    }
  }, [text, options, onAsciiGenerated]);

  useEffect(() => {
    if (realTimePreview && text.trim()) {
      const debounceTimer = setTimeout(() => {
        generateAscii();
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    } else if (!text.trim()) {
      onAsciiGenerated('', null);
    }
  }, [text, options, realTimePreview, generateAscii, onAsciiGenerated]);

  const handleOptionChange = <K extends keyof AsciiOptions>(
    key: K,
    value: AsciiOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };


  const SettingsPanel = () => (
    <div className="space-y-6">
      {/* Font Selection */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {tool('asciiArtGenerator.textPanel.fontLabel')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ASCII_FONT_PRESETS.map((font) => (
            <Button
              key={font.value}
              variant={options.font === font.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleOptionChange('font', font.value)}
              className="text-xs"
            >
              {font.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Manual Generate Button (for non-realtime mode) */}
      {!realTimePreview && (
        <div className="pt-4">
          <Button
            onClick={generateAscii}
            disabled={!text.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate ASCII Art'}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Desktop Layout: Text Input and Settings Side by Side */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Text Input Area - 2/3 width */}
        <div className="lg:col-span-2 space-y-2">
          <label className="text-sm font-medium text-foreground">
            {tool('asciiArtGenerator.textPanel.inputLabel')}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tool('asciiArtGenerator.textPanel.inputPlaceholder')}
            maxLength={50}
            className="w-full h-64 p-4 border-2 border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">
            {text.length}/50 characters
          </div>
        </div>

        {/* Settings Panel - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Settings className="h-4 w-4" />
              ASCII Settings
            </label>
          </div>
          <div className="border border-border rounded-lg p-4 bg-muted/10 h-64">
            <SettingsPanel />
          </div>
        </div>
      </div>

      {/* Mobile Layout: Stacked */}
      <div className="lg:hidden space-y-4">
        {/* Text Input Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {tool('asciiArtGenerator.textPanel.inputLabel')}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tool('asciiArtGenerator.textPanel.inputPlaceholder')}
            maxLength={50}
            className="w-full h-48 p-4 border-2 border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">
            {text.length}/50 characters
          </div>
        </div>

        {/* Settings Accordion */}
        <div className="border border-border rounded-lg bg-card">
          <button
            onClick={() => setShowMobileSettings(!showMobileSettings)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">ASCII Settings</span>
            </div>
            <ChevronDown 
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                showMobileSettings ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {showMobileSettings && (
            <div className="px-4 pb-4 border-t border-border">
              <div className="pt-4">
                <SettingsPanel />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
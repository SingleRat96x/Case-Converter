'use client';

import React, { useState, useCallback } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { AsciiModeSelector, type AsciiMode } from './ascii/AsciiModeSelector';
import { TextToAsciiPanel } from './ascii/TextToAsciiPanel';
import { ImageToAsciiPanel } from './ascii/ImageToAsciiPanel';
import { AsciiOutput } from './ascii/AsciiOutput';
import { EnhancedResponsiveAd } from '@/components/ads/EnhancedResponsiveAd';

export function AsciiArtGenerator() {
  const { tool } = useToolTranslations('tools/miscellaneous');
  const [mode, setMode] = useState<AsciiMode>('text');
  const [asciiOutput, setAsciiOutput] = useState('');
  const [outputStats, setOutputStats] = useState<{
    lines: number;
    characters: number;
    originalText?: string;
    font?: string;
    originalFile?: string;
    width?: number;
    height?: number;
  } | null>(null);

  const handleAsciiGenerated = useCallback((ascii: string, stats: {
    lines: number;
    characters: number;
    originalText?: string;
    font?: string;
    originalFile?: string;
    width?: number;
    height?: number;
  } | null) => {
    setAsciiOutput(ascii);
    setOutputStats(stats);
  }, []);

  const handleModeChange = useCallback((newMode: AsciiMode) => {
    setMode(newMode);
    setAsciiOutput('');
    setOutputStats(null);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
          {tool('asciiArtGenerator.title')}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
          {tool('asciiArtGenerator.description')}
        </p>
      </div>

      {/* Mode Selection */}
      <AsciiModeSelector 
        mode={mode} 
        onModeChange={handleModeChange} 
      />

      {/* Ad Break */}
      <div className="mb-8">
        <EnhancedResponsiveAd className="my-6" format="auto" lazy={true} />
      </div>

      {/* Main Content */}
      <div className="space-y-8 mb-8">
        {/* Input Panel */}
        {mode === 'text' ? (
          <TextToAsciiPanel 
            onAsciiGenerated={handleAsciiGenerated}
            realTimePreview={true}
          />
        ) : (
          <ImageToAsciiPanel 
            onAsciiGenerated={handleAsciiGenerated}
          />
        )}

        {/* Output Panel */}
        <AsciiOutput 
          ascii={asciiOutput}
          stats={outputStats}
        />
      </div>

      {/* Bottom Ad */}
      <div className="mt-12">
        <EnhancedResponsiveAd className="my-6" format="auto" lazy={true} />
      </div>

    </div>
  );
}
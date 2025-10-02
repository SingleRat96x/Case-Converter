'use client';

import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/utils';
import { useToolTranslations } from '@/lib/i18n/hooks';

interface RomanDateDisplayProps {
  romanDate: string;
  strength?: number;
  onRegenerate?: () => void;
  isGenerating?: boolean;
  isAnimating?: boolean;
  copyText: string;
  strengthLabels?: {
    weak: string;
    fair: string;
    good: string;
    strong: string;
  };
}

export function RomanDateDisplay({
  romanDate,
  isAnimating = false
}: RomanDateDisplayProps) {
  const { tool } = useToolTranslations('tools/miscellaneous');
  const [showCopied, setShowCopied] = useState(false);
  
  const handleClick = async () => {
    if (romanDate) {
      const success = await copyToClipboard(romanDate);
      if (success) {
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    }
  };

  return (
    <div className="w-full relative">
      {/* Copied Notice */}
      {showCopied && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg">
            {tool('romanNumeralDate.actions.copiedMessage')}
          </div>
        </div>
      )}
      
      {/* Single Clean Output Panel */}
      <div 
        onClick={handleClick}
        className={`
          relative min-h-[140px] p-8 rounded-xl border-2 border-dashed border-border/50
          bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur-sm
          shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer
          ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
          ${romanDate ? 'hover:border-primary/30 hover:shadow-primary/10' : 'hover:border-border/70'}
        `}
      >
        {romanDate ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            {/* Roman Date Value */}
            <div className="w-full">
              <div className="
                font-mono text-xl sm:text-2xl lg:text-3xl font-medium 
                text-foreground text-center leading-relaxed
                bg-background/60 px-6 py-4 rounded-lg border
                shadow-inner block
              ">
                {romanDate}
              </div>
            </div>
            
            {/* Click to copy hint */}
            <div className="text-xs text-muted-foreground/60 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Click to copy
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              {/* Roman Numeral Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 border-2 border-dashed border-muted-foreground/20 mx-auto">
                <svg className="w-8 h-8 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="text-muted-foreground text-lg font-medium">
                {tool('romanNumeralDate.placeholders.selectDate')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
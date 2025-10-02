'use client';

import React, { useState } from 'react';
import { copyToClipboard } from '@/lib/utils';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Check } from 'lucide-react';

export type MD5Format = 'lowercase' | 'uppercase' | 'colonSeparated';

interface MD5HashDisplayProps {
  hash: string;
  format: MD5Format;
  isAnimating?: boolean;
}

export function MD5HashDisplay({
  hash,
  format,
  isAnimating = false
}: MD5HashDisplayProps) {
  const { tool } = useToolTranslations('tools/miscellaneous');
  const [showCopied, setShowCopied] = useState(false);
  
  const formatHash = (hashValue: string, formatType: MD5Format): string => {
    if (!hashValue) return '';
    
    switch (formatType) {
      case 'uppercase':
        return hashValue.toUpperCase();
      case 'colonSeparated':
        return hashValue.toLowerCase().match(/.{2}/g)?.join(':') || hashValue;
      case 'lowercase':
      default:
        return hashValue.toLowerCase();
    }
  };

  
  const handleHashClick = async () => {
    if (hash) {
      const formattedHash = formatHash(hash, format);
      const success = await copyToClipboard(formattedHash);
      if (success) {
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    }
  };

  const formattedHash = formatHash(hash, format);

  return (
    <div className="w-full relative">
      {/* Copied Notice */}
      {showCopied && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg flex items-center gap-2">
            <Check className="h-4 w-4" />
{tool('md5Hash.formats.copied', 'Hash copied to clipboard!')}
          </div>
        </div>
      )}
      
      {/* Main Hash Display */}
      <div 
        className={`
          relative min-h-[140px] p-8 rounded-xl border-2 border-dashed border-border/50
          bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur-sm
          shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer
          ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
          ${hash ? 'hover:border-primary/30 hover:shadow-primary/10' : 'hover:border-border/70'}
        `}
        onClick={handleHashClick}
      >
        {hash ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            {/* Hash Value */}
            <div className="w-full">
              <code className="
                font-mono text-sm sm:text-base lg:text-lg 
                text-foreground break-all text-center leading-relaxed
                bg-background/60 px-4 py-3 rounded-lg border
                shadow-inner block
              ">
                {formattedHash}
              </code>
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
              {/* Hash Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 border-2 border-dashed border-muted-foreground/20 mx-auto">
                <svg className="w-8 h-8 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              
              <div className="text-muted-foreground text-lg font-medium">
                {tool('md5Hash.inputPlaceholder', 'Enter text to generate MD5 hash...')}
              </div>
              <div className="text-sm text-muted-foreground/70">
                {tool('md5Hash.outputPlaceholder', 'Your MD5 hash will appear here')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
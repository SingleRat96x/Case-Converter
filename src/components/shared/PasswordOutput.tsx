'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface PasswordOutputProps {
  password: string;
  strength: number;
  onRegenerate: () => void;
  isGenerating: boolean;
  copyText: string;
  strengthLabels: {
    weak: string;
    fair: string;
    good: string;
    strong: string;
  };
}

export function PasswordOutput({
  password,
  strength,
  onRegenerate,
  isGenerating,
  copyText,
  strengthLabels
}: PasswordOutputProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');

  const getStrengthColor = (strength: number): string => {
    if (strength < 30) return 'bg-red-500';
    if (strength < 60) return 'bg-yellow-500';
    if (strength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 30) return strengthLabels.weak;
    if (strength < 60) return strengthLabels.fair;
    if (strength < 80) return strengthLabels.good;
    return strengthLabels.strong;
  };

  const handleCopy = async () => {
    if (!password.trim()) {
      return;
    }

    try {
      const success = await copyToClipboard(password);
      
      if (success) {
        setCopyState('copied');
        // Show "Copied" state for 2 seconds, then revert to normal
        setTimeout(() => {
          setCopyState('idle');
        }, 2000);
      }
    } catch {
      // If copy fails, don't show copied state
    }
  };

  const isCopied = copyState === 'copied';
  const copyIcon = isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />;
  const copyTextDisplay = isCopied ? 'Copied' : copyText;

  return (
    <div className="space-y-4">
      {/* Desktop Layout */}
      <div className="hidden sm:flex sm:items-start sm:gap-3">
        {/* Password Field */}
        <div className="flex-1">
          <div className="flex items-center bg-background border border-input rounded-lg overflow-hidden min-h-[48px]">
            {/* Password Text with ellipsis */}
            <div className="flex-1 px-4 py-2 font-mono text-sm leading-relaxed overflow-hidden whitespace-nowrap text-ellipsis">
              {password || (
                <span className="text-muted-foreground text-sm">
                  Generated password will appear here
                </span>
              )}
            </div>
            
            {/* Inline Controls - Strength Badge and Regenerate Button */}
            {password && (
              <div className="flex items-center gap-2 px-2 py-1 flex-shrink-0">
                {/* Strength Badge */}
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStrengthColor(
                    strength
                  )} text-white whitespace-nowrap`}
                >
                  {getStrengthLabel(strength)}
                </span>
                
                {/* Regenerate Button */}
                <button
                  onClick={onRegenerate}
                  disabled={isGenerating}
                  className="w-6 h-6 rounded-full border border-input bg-background hover:bg-muted flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <RotateCcw className={`h-3 w-3 text-muted-foreground ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Copy Button */}
        <Button
          onClick={handleCopy}
          disabled={!password.trim()}
          size="default"
          className={`h-12 px-6 flex-shrink-0 transition-all duration-300 ease-in-out ${
            isCopied
              ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white'
              : ''
          }`}
        >
          <span className="transition-all duration-200">
            {copyIcon}
          </span>
          <span className="transition-all duration-200">
            {copyTextDisplay}
          </span>
        </Button>
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden space-y-3">
        {/* Password Field */}
        <div className="flex items-center bg-background border border-input rounded-lg overflow-hidden min-h-[48px]">
          {/* Password Text with ellipsis */}
          <div className="flex-1 px-4 py-2 font-mono text-sm leading-relaxed overflow-hidden whitespace-nowrap text-ellipsis">
            {password || (
              <span className="text-muted-foreground text-sm">
                Generated password will appear here
              </span>
            )}
          </div>
          
          {/* Inline Controls - Strength Badge and Regenerate Button */}
          {password && (
            <div className="flex items-center gap-2 px-2 py-1 flex-shrink-0">
              {/* Strength Badge */}
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStrengthColor(
                  strength
                )} text-white whitespace-nowrap`}
              >
                {getStrengthLabel(strength)}
              </span>
              
              {/* Regenerate Button */}
              <button
                onClick={onRegenerate}
                disabled={isGenerating}
                className="w-6 h-6 rounded-full border border-input bg-background hover:bg-muted flex items-center justify-center transition-colors flex-shrink-0"
              >
                <RotateCcw className={`h-3 w-3 text-muted-foreground ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Copy Button - Centered */}
        <div className="flex justify-center">
          <Button
            onClick={handleCopy}
            disabled={!password.trim()}
            size="default"
            className={`h-12 px-8 transition-all duration-300 ease-in-out ${
              isCopied
                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white'
                : ''
            }`}
          >
            <span className="transition-all duration-200">
              {copyIcon}
            </span>
            <span className="transition-all duration-200">
              {copyTextDisplay}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
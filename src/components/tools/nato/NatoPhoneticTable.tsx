'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { copyToClipboard } from '@/lib/utils';
import { 
  getNatoPhoneticAlphabet, 
  getNatoPhoneticNumbers 
} from '@/lib/natoPhoneticUtils';

interface NatoPhoneticTableProps {
  className?: string;
}

export function NatoPhoneticTable({ className = '' }: NatoPhoneticTableProps) {
  const { tool } = useToolTranslations('tools/miscellaneous');
  const [isExpanded, setIsExpanded] = useState(false); // Always start with false for SSR
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Set initial state after hydration to avoid hydration mismatch
  useEffect(() => {
    // Open by default on desktop (screen width >= 1024px), closed on mobile
    setIsExpanded(window.innerWidth >= 1024);
  }, []);

  const alphabetData = getNatoPhoneticAlphabet();
  const numbersData = getNatoPhoneticNumbers();

  const handleCopyPhonetic = async (phonetic: string, identifier: string) => {
    const success = await copyToClipboard(phonetic);
    if (success) {
      setCopiedItem(identifier);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  const CopyButton = ({ phonetic, identifier, size = 'sm' }: { 
    phonetic: string; 
    identifier: string; 
    size?: 'sm' | 'xs' 
  }) => {
    const isCopied = copiedItem === identifier;
    const iconSize = size === 'xs' ? 'h-3 w-3' : 'h-4 w-4';
    
    return (
      <button
        onClick={() => handleCopyPhonetic(phonetic, identifier)}
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-all ${
          isCopied
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
            : 'bg-card hover:bg-accent text-muted-foreground hover:text-accent-foreground border-border'
        }`}
        title={tool('natoPhonetic.phoneticTable.copyTooltip')}
      >
        {isCopied ? (
          <Check className={iconSize} />
        ) : (
          <Copy className={iconSize} />
        )}
        {size === 'sm' && (
          <span className="hidden sm:inline">
            {isCopied ? 'Copied!' : 'Copy'}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`border rounded-lg bg-card ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-foreground">
          {tool('natoPhonetic.phoneticTable.title')}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isExpanded ? tool('natoPhonetic.actions.hideTable') : tool('natoPhonetic.actions.showTable')}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Table Content */}
      {isExpanded && (
        <div className="border-t bg-muted/30">
          <div className="p-4 space-y-6">
            {/* Alphabet Table */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">{tool('natoPhonetic.phoneticTable.lettersSection')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {alphabetData.map(({ letter, phonetic }) => (
                  <div
                    key={letter}
                    className="flex items-center justify-between p-3 bg-card rounded-md border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary min-w-[20px]">
                        {letter}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {phonetic}
                      </span>
                    </div>
                    <CopyButton 
                      phonetic={phonetic} 
                      identifier={`letter-${letter}`}
                      size="xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Numbers Table */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-3">{tool('natoPhonetic.phoneticTable.numbersSection')}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {numbersData.map(({ number, phonetic }) => (
                  <div
                    key={number}
                    className="flex items-center justify-between p-3 bg-card rounded-md border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary min-w-[20px]">
                        {number}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {phonetic}
                      </span>
                    </div>
                    <CopyButton 
                      phonetic={phonetic} 
                      identifier={`number-${number}`}
                      size="xs"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
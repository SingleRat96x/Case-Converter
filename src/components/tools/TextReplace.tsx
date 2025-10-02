'use client';

import React, { useState, useCallback } from 'react';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { TextReplaceAnalytics } from '@/components/shared/TextReplaceAnalytics';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Search, Replace, Info, ToggleLeft, ToggleRight } from 'lucide-react';

export function TextReplace() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [replacedText, setReplacedText] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [highlightedText, setHighlightedText] = useState('');

  // Perform find and replace
  const performReplace = useCallback((inputText: string, find: string, replace: string, options: {
    caseSensitive: boolean;
    wholeWord: boolean;
    useRegex: boolean;
  }) => {
    if (!inputText || !find) {
      setReplacedText(inputText);
      setMatchCount(0);
      setHighlightedText('');
      return;
    }

    try {
      let pattern: RegExp;
      let searchPattern = find;

      if (options.useRegex) {
        // Use the find text as a regex pattern
        pattern = new RegExp(searchPattern, options.caseSensitive ? 'g' : 'gi');
      } else {
        // Escape special regex characters if not using regex mode
        searchPattern = searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        if (options.wholeWord) {
          searchPattern = `\\b${searchPattern}\\b`;
        }
        
        pattern = new RegExp(searchPattern, options.caseSensitive ? 'g' : 'gi');
      }

      // Count matches
      const matches = inputText.match(pattern);
      const count = matches ? matches.length : 0;
      setMatchCount(count);

      // Perform replacement
      const result = inputText.replace(pattern, replace);
      setReplacedText(result);

      // Create highlighted version for preview (show first 1000 chars)
      if (count > 0 && inputText.length < 5000) {
        const highlighted = inputText.replace(pattern, (match) => `<mark>${match}</mark>`);
        setHighlightedText(highlighted);
      } else {
        setHighlightedText('');
      }
    } catch {
      // Handle invalid regex
      if (options.useRegex) {
        setReplacedText(inputText);
        setMatchCount(0);
        setHighlightedText('');
      }
    }
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);
    performReplace(newText, findText, replaceWith, { caseSensitive, wholeWord, useRegex });
  };

  const handleFindChange = (newFind: string) => {
    setFindText(newFind);
    performReplace(text, newFind, replaceWith, { caseSensitive, wholeWord, useRegex });
  };

  const handleReplaceChange = (newReplace: string) => {
    setReplaceWith(newReplace);
    performReplace(text, findText, newReplace, { caseSensitive, wholeWord, useRegex });
  };

  const handleOptionChange = (option: 'caseSensitive' | 'wholeWord' | 'useRegex', value: boolean) => {
    const newOptions = {
      caseSensitive: option === 'caseSensitive' ? value : caseSensitive,
      wholeWord: option === 'wholeWord' ? value : wholeWord,
      useRegex: option === 'useRegex' ? value : useRegex,
    };
    
    if (option === 'caseSensitive') setCaseSensitive(value);
    if (option === 'wholeWord') setWholeWord(value);
    if (option === 'useRegex') setUseRegex(value);
    
    performReplace(text, findText, replaceWith, newOptions);
  };

  // Quick swap find and replace
  const swapFindReplace = () => {
    const temp = findText;
    setFindText(replaceWith);
    setReplaceWith(temp);
    performReplace(text, replaceWith, temp, { caseSensitive, wholeWord, useRegex });
  };

  return (
    <BaseTextConverter
      title={tool('textReplace.title')}
      description={tool('textReplace.description')}
      inputLabel={common('labels.inputText')}
      outputLabel={tool('textReplace.outputLabel')}
      inputPlaceholder={tool('textReplace.inputPlaceholder')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName="replaced-text.txt"
      onTextChange={handleTextChange}
      text={text}
      convertedText={replacedText}
      onConvertedTextUpdate={setReplacedText}
      showAnalytics={false}
      mobileLayout="2x2"
    >
      <div className="space-y-4">
        {/* Find and Replace Inputs */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Find Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                {tool('textReplace.find')}
              </label>
              <input
                type="text"
                value={findText}
                onChange={(e) => handleFindChange(e.target.value)}
                placeholder={tool('textReplace.findPlaceholder')}
                className="w-full h-10 px-3 bg-background border rounded-md"
              />
            </div>

            {/* Replace Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Replace className="h-4 w-4" />
                {tool('textReplace.replaceWith')}
              </label>
              <input
                type="text"
                value={replaceWith}
                onChange={(e) => handleReplaceChange(e.target.value)}
                placeholder={tool('textReplace.replacePlaceholder')}
                className="w-full h-10 px-3 bg-background border rounded-md"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={swapFindReplace}
              className="gap-2"
            >
              <Replace className="h-4 w-4 rotate-90" />
              {tool('textReplace.swap')}
            </Button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOptionChange('caseSensitive', !caseSensitive)}
            className={`justify-between ${caseSensitive ? 'border-primary' : ''}`}
          >
            <span>{tool('textReplace.options.caseSensitive')}</span>
            {caseSensitive ? (
              <ToggleRight className="h-4 w-4 ml-2 text-primary" />
            ) : (
              <ToggleLeft className="h-4 w-4 ml-2" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOptionChange('wholeWord', !wholeWord)}
            className={`justify-between ${wholeWord ? 'border-primary' : ''}`}
          >
            <span>{tool('textReplace.options.wholeWord')}</span>
            {wholeWord ? (
              <ToggleRight className="h-4 w-4 ml-2 text-primary" />
            ) : (
              <ToggleLeft className="h-4 w-4 ml-2" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOptionChange('useRegex', !useRegex)}
            className={`justify-between ${useRegex ? 'border-primary' : ''}`}
          >
            <span>{tool('textReplace.options.regex')}</span>
            {useRegex ? (
              <ToggleRight className="h-4 w-4 ml-2 text-primary" />
            ) : (
              <ToggleLeft className="h-4 w-4 ml-2" />
            )}
          </Button>
        </div>

        {/* Match Count */}
        {text && findText && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <Search className="h-4 w-4" />
              <span className="text-sm font-medium">
                {matchCount > 0 ? (
                  <>
                    <span className="text-primary">{matchCount}</span> {tool('textReplace.matches')}
                  </>
                ) : (
                  tool('textReplace.noMatches')
                )}
              </span>
            </div>
          </div>
        )}

        {/* Regex Info */}
        {useRegex && (
          <div className="flex items-start gap-2 p-3 bg-info/10 text-info rounded-lg text-sm">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div>{tool('textReplace.regexInfo')}</div>
              <div className="text-xs opacity-80">
                {tool('textReplace.regexExamples')}
              </div>
            </div>
          </div>
        )}

        {/* Preview with highlights (for small texts) */}
        {highlightedText && text.length < 1000 && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-2">{tool('textReplace.preview')}</div>
            <div 
              className="text-sm whitespace-pre-wrap break-words max-h-32 overflow-y-auto [&_mark]:bg-primary [&_mark]:text-primary-foreground [&_mark]:px-0.5 [&_mark]:rounded-sm"
              dangerouslySetInnerHTML={{ __html: highlightedText }}
            />
          </div>
        )}

        {/* Analytics */}
        {text && (
          <TextReplaceAnalytics
            originalText={text}
            replacedText={replacedText}
            findText={findText}
            replaceText={replaceWith}
            matchCount={matchCount}
            options={{
              caseSensitive,
              wholeWord,
              useRegex
            }}
            variant="compact"
            showTitle={false}
          />
        )}
      </div>
    </BaseTextConverter>
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface AnimatedPasswordOutputProps {
  password: string;
  strength: number;
  onRegenerate: () => void;
  isGenerating: boolean;
  isAnimating: boolean;
  copyText: string;
  strengthLabels: {
    weak: string;
    fair: string;
    good: string;
    strong: string;
  };
}

export function AnimatedPasswordOutput({
  password,
  strength,
  onRegenerate,
  isGenerating,
  isAnimating,
  copyText,
  strengthLabels
}: AnimatedPasswordOutputProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');
  const [displayPassword, setDisplayPassword] = useState<string>(password);
  const [isHackingAnimation, setIsHackingAnimation] = useState<boolean>(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const previousPasswordRef = useRef<string>('');

  // Character sets for random animation
  const getRandomCharacterSets = () => ({
    uppercase: 'ABCDEFGHIJKLMNPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnpqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}:,.<>?'
  });

  const getRandomChar = React.useCallback((): string => {
    const charSets = getRandomCharacterSets();
    const allChars = charSets.uppercase + charSets.lowercase + charSets.numbers + charSets.symbols;
    return allChars[Math.floor(Math.random() * allChars.length)];
  }, []);

  // Hacking-style password animation
  useEffect(() => {
    if (isAnimating && password && password !== previousPasswordRef.current) {
      setIsHackingAnimation(true);
      
      // Clear any existing animation
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }

      const previousPassword = previousPasswordRef.current;
      const targetPassword = password;
      const maxLength = Math.max(previousPassword.length, targetPassword.length);
      
      // Create initial display with random characters or previous password
      let currentDisplay = previousPassword.padEnd(maxLength, ' ').split('');
      
      // If no previous password, start with random characters
      if (!previousPassword) {
        currentDisplay = Array(targetPassword.length).fill('').map(() => getRandomChar());
      }

      setDisplayPassword(currentDisplay.join(''));

      // Animation parameters
      const totalDuration = 800; // Total animation time in ms
      const updatesPerSecond = 30;
      const updateInterval = 1000 / updatesPerSecond;
      const totalUpdates = Math.floor(totalDuration / updateInterval);
      
      let updateCount = 0;
      const completedPositions = new Set<number>();

      const animateStep = () => {
        updateCount++;
        const progress = updateCount / totalUpdates;
        
        // Determine how many positions should be completed by now
        const positionsToComplete = Math.floor(progress * targetPassword.length);
        
        // Mark additional positions as completed
        for (let i = completedPositions.size; i < positionsToComplete; i++) {
          completedPositions.add(i);
        }
        
        // Update display
        const newDisplay = currentDisplay.map((char, index) => {
          if (index >= targetPassword.length) {
            return ''; // Remove extra characters
          }
          
          if (completedPositions.has(index)) {
            return targetPassword[index];
          } else {
            // Random character for positions not yet completed
            return getRandomChar();
          }
        });

        currentDisplay = newDisplay;
        setDisplayPassword(newDisplay.join('').slice(0, targetPassword.length));

        if (updateCount < totalUpdates) {
          animationRef.current = setTimeout(animateStep, updateInterval);
        } else {
          // Animation complete
          setDisplayPassword(targetPassword);
          setIsHackingAnimation(false);
          animationRef.current = null;
        }
      };

      // Start animation after a brief delay
      animationRef.current = setTimeout(animateStep, 100);
      
      // Update previous password reference
      previousPasswordRef.current = password;

      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
          animationRef.current = null;
        }
      };
    } else if (!isAnimating) {
      setDisplayPassword(password);
      setIsHackingAnimation(false);
      previousPasswordRef.current = password;
    }
  }, [password, isAnimating, getRandomChar]);

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
        <div className="flex-1 min-w-0">
          <div className="flex items-center bg-background border border-input rounded-lg overflow-hidden min-h-[48px]">
            {/* Password Text with ellipsis and animation */}
            <div className="flex-1 min-w-0 px-4 py-2 font-mono text-sm leading-relaxed overflow-hidden whitespace-nowrap text-ellipsis">
              <span className={isHackingAnimation ? 'text-green-400' : ''}>
                {displayPassword || (
                  <span className="text-muted-foreground text-sm">
                    Generated password will appear here
                  </span>
                )}
              </span>
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
          {/* Password Text with ellipsis and animation */}
          <div className="flex-1 min-w-0 px-4 py-2 font-mono text-sm leading-relaxed overflow-hidden whitespace-nowrap text-ellipsis">
            <span className={isHackingAnimation ? 'text-green-400' : ''}>
              {displayPassword || (
                <span className="text-muted-foreground text-sm">
                  Generated password will appear here
                </span>
              )}
            </span>
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
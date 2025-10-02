'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface AnimatedIPOutputProps {
  ips: string;
  onRegenerate: () => void;
  isGenerating: boolean;
  isAnimating: boolean;
  copyText: string;
}

export function AnimatedIPOutput({
  ips,
  onRegenerate,
  isGenerating,
  isAnimating,
  copyText
}: AnimatedIPOutputProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');
  const [displayIPs, setDisplayIPs] = useState<string>(ips);
  const [isHackingAnimation, setIsHackingAnimation] = useState<boolean>(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const previousIPsRef = useRef<string>('');

  // Character sets for random animation
  const getRandomCharacterSets = () => ({
    numbers: '0123456789',
    letters: 'abcdef',
    dots: '.',
    colons: ':'
  });

  const getRandomChar = React.useCallback((): string => {
    const charSets = getRandomCharacterSets();
    const allChars = charSets.numbers + charSets.letters + charSets.dots + charSets.colons;
    return allChars[Math.floor(Math.random() * allChars.length)];
  }, []);

  // Hacking-style IP animation
  useEffect(() => {
    if (isAnimating && ips && ips !== previousIPsRef.current) {
      setIsHackingAnimation(true);
      
      // Clear any existing animation
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }

      const previousIPs = previousIPsRef.current;
      const targetIPs = ips;
      
      // Create initial display with random characters or previous IPs
      const currentDisplay = previousIPs || Array(targetIPs.length).fill('').map(() => getRandomChar()).join('');
      
      setDisplayIPs(currentDisplay);

      // Animation parameters
      const totalDuration = 600; // Total animation time in ms
      const updatesPerSecond = 20;
      const updateInterval = 1000 / updatesPerSecond;
      const totalUpdates = Math.floor(totalDuration / updateInterval);
      
      let updateCount = 0;

      const animateStep = () => {
        updateCount++;
        const progress = updateCount / totalUpdates;
        
        // Gradually reveal the target IPs
        const revealLength = Math.floor(progress * targetIPs.length);
        const revealedPart = targetIPs.slice(0, revealLength);
        const randomPart = Array(targetIPs.length - revealLength).fill('').map(() => getRandomChar()).join('');
        
        setDisplayIPs(revealedPart + randomPart);

        if (updateCount < totalUpdates) {
          animationRef.current = setTimeout(animateStep, updateInterval);
        } else {
          // Animation complete
          setDisplayIPs(targetIPs);
          setIsHackingAnimation(false);
          animationRef.current = null;
        }
      };

      // Start animation after a brief delay
      animationRef.current = setTimeout(animateStep, 100);
      
      // Update previous IPs reference
      previousIPsRef.current = ips;

      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
          animationRef.current = null;
        }
      };
    } else if (!isAnimating) {
      setDisplayIPs(ips);
      setIsHackingAnimation(false);
      previousIPsRef.current = ips;
    }
  }, [ips, isAnimating, getRandomChar]);

  const handleCopy = async () => {
    if (!ips.trim()) {
      return;
    }

    try {
      const success = await copyToClipboard(ips);
      
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
        {/* IP Field */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center bg-background border border-input rounded-lg overflow-hidden min-h-[48px]">
            {/* IP Text with wrapping and animation */}
            <div className="flex-1 min-w-0 px-4 py-2 font-mono text-sm leading-relaxed text-center">
              <span className={isHackingAnimation ? 'text-green-400' : ''}>
                {displayIPs || (
                  <span className="text-muted-foreground text-sm">
                    Generated IP addresses will appear here
                  </span>
                )}
              </span>
            </div>
            
            {/* Inline Controls - Regenerate Button */}
            {ips && (
              <div className="flex items-center gap-2 px-2 py-1 flex-shrink-0">
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
          disabled={!ips.trim()}
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
        {/* IP Field */}
        <div className="flex items-center bg-background border border-input rounded-lg overflow-hidden min-h-[48px]">
          {/* IP Text with wrapping and animation */}
          <div className="flex-1 min-w-0 px-4 py-2 font-mono text-sm leading-relaxed text-center">
            <span className={isHackingAnimation ? 'text-green-400' : ''}>
              {displayIPs || (
                <span className="text-muted-foreground text-sm">
                  Generated IP addresses will appear here
                </span>
              )}
            </span>
          </div>
          
          {/* Inline Controls - Regenerate Button */}
          {ips && (
            <div className="flex items-center gap-2 px-2 py-1 flex-shrink-0">
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
            disabled={!ips.trim()}
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
